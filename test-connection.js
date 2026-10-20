const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'ep-still-meadow-b72bil6d-pooler.c-13.us-east-1.aws.neon.tech',
    user: process.env.DB_USER || 'neondb_owner',
    password: process.env.DB_PASSWORD || 'npg_eKb2US7WvRfY',
    database: process.env.DB_NAME || 'neondb',
    port: process.env.DB_PORT || 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    try {
        console.log('Testing connection to Render PostgreSQL...');
        console.log('Host:', pool.options.host);
        console.log('User:', pool.options.user);
        console.log('Database:', pool.options.database);
        
        const result = await pool.query('SELECT NOW()');
        console.log('Connection successful!');
        console.log('Server time:', result.rows[0].now);
        
        // Check if tables exist
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('\nExisting tables:', tables.rows.map(r => r.table_name));
        
    } catch (error) {
        console.error('Connection failed:', error.message);
        console.error('Error code:', error.code);
    } finally {
        await pool.end();
    }
}

testConnection();
