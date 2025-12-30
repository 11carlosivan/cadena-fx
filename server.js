
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
};

let pool;

async function initDb() {
    try {
        if (!dbConfig.user || !dbConfig.database) {
            console.warn('Database credentials missing. Waiting for installation...');
            return;
        }
        pool = mysql.createPool(dbConfig);
        const [rows] = await pool.query('SELECT 1');
        console.log('Successfully connected to MySQL database');
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
}

// Endpoint de Instalación
app.post('/api/install', async (req, res) => {
    try {
        const sqlPath = path.join(__dirname, 'setup_db.sql');
        if (!fs.existsSync(sqlPath)) throw new Error("Archivo setup_db.sql no encontrado en el servidor");
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        const tempConn = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            multipleStatements: true
        });

        console.log('Running installation script...');
        await tempConn.query(`USE \`${dbConfig.database}\``);
        await tempConn.query(sql);
        await tempConn.end();
        
        // Re-inicializar el pool después de crear las tablas
        await initDb();
        
        res.json({ success: true, message: 'Tablas creadas correctamente' });
    } catch (err) {
        console.error('Error de instalación:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// API Routes
app.get('/api/setups', async (req, res) => {
    try {
        if (!pool) throw new Error("Base de datos no conectada");
        const [rows] = await pool.query(`
            SELECT s.*, u.name as creator, u.avatar as creatorAvatar 
            FROM setups s 
            LEFT JOIN users u ON s.creator_id = u.id 
            ORDER BY s.updated_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/setups', async (req, res) => {
    const s = req.body;
    try {
        await pool.query(
            'INSERT INTO setups (id, title, artist, creator_id, instrument, genre, tags, cover_image, amplifier_config, pedal_chain) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [s.id, s.title, s.artist, s.creator_id, s.instrument, s.genre, JSON.stringify(s.tags), s.coverImage, JSON.stringify(s.amplifier), JSON.stringify(s.chain)]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tipos MIME para soporte de módulos en el navegador
express.static.mime.define({'application/javascript': ['ts', 'tsx']});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initDb();
});
