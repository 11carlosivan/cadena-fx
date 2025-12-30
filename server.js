import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const app = express();
app.use(express.json());

// Emulación de __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log de peticiones para depuración
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

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
            console.warn('!!! Database credentials missing in .env !!!');
            return;
        }
        pool = mysql.createPool(dbConfig);
        await pool.query('SELECT 1');
        console.log('Connected to Database:', dbConfig.database);
    } catch (err) {
        console.error('Database connection failed:', err.message);
        pool = null;
    }
}

// API Routes
app.post('/api/install', async (req, res) => {
    console.log('Installation triggered...');
    try {
        const sqlPath = path.join(__dirname, 'setup_db.sql');
        if (!fs.existsSync(sqlPath)) {
            return res.status(404).json({ success: false, error: "Archivo setup_db.sql no encontrado" });
        }
        
        const sql = fs.readFileSync(sqlPath, 'utf8');
        const tempConn = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            multipleStatements: true
        });

        await tempConn.query(`USE \`${dbConfig.database}\``);
        await tempConn.query(sql);
        await tempConn.end();
        
        await initDb();
        res.json({ success: true, message: 'Database schema created successfully' });
    } catch (err) {
        console.error('Installation Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/setups', async (req, res) => {
    try {
        if (!pool) return res.status(503).json({ error: "DB not initialized" });
        const [rows] = await pool.query(`
            SELECT s.*, u.name as creator, u.avatar as creatorAvatar 
            FROM setups s 
            LEFT JOIN users u ON s.creator_id = u.id 
            ORDER BY s.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/setups', async (req, res) => {
    const s = req.body;
    try {
        if (!pool) throw new Error("Database not connected");
        await pool.query(
            'INSERT INTO setups (id, title, artist, creator_id, instrument, genre, tags, cover_image, amplifier_config, pedal_chain) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [s.id, s.title, s.artist, s.creator_id, s.instrument, s.genre, JSON.stringify(s.tags), s.coverImage, JSON.stringify(s.amplifier), JSON.stringify(s.chain)]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Servir archivos estáticos con tipos MIME correctos para TSX/TS
app.use(express.static(__dirname, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// En Express 5, el comodín debe tener un nombre de parámetro (ej: :any*)
app.get('/:any*', (req, res) => {
    if (!req.url.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        res.status(404).json({ error: "API Route not found" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ToneShare Server (ESM) running on port ${PORT}`);
    initDb();
});