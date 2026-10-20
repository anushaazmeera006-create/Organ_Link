const fs = require('fs');
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

async function initializeDatabase() {
    try {
        console.log('Connecting to Neon PostgreSQL database...');
        
        // Read the SQL file
        const sql = fs.readFileSync('./init_postgres.sql', 'utf8');
        
        console.log('Executing SQL script...');
        
        // Execute the entire SQL file as one transaction
        await pool.query(sql);
        
        console.log('Database initialized successfully!');
        
        // Verify tables were created
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('\nCreated tables:');
        tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
        
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

initializeDatabase();
