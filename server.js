
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configuración de la base de datos (Usar variables de entorno de BanaHosting)
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
};

let pool;

// Inicializar conexión
async function initDb() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('Database connected');
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
}

// Endpoint de Instalación
app.post('/api/install', async (req, res) => {
    try {
        const sqlPath = path.join(__dirname, 'setup_db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        const tempConn = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            multipleStatements: true
        });

        // Crear base de datos si no existe (opcional, usualmente cPanel ya la da)
        await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        await tempConn.query(`USE \`${dbConfig.database}\``);
        
        // Ejecutar esquema
        await tempConn.query(sql);
        await tempConn.end();
        
        res.json({ success: true, message: 'Database installed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API Routes
app.get('/api/setups', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, u.name as creator, u.avatar as creatorAvatar 
            FROM setups s 
            JOIN users u ON s.creator_id = u.id 
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

// Servir la aplicación React (Build)
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initDb();
});
