const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./schema');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false
});

// Test connection
pool.connect().then(client => {
    console.log('Connected to database via Pool');
    client.release();
}).catch(err => {
    console.error('Failed to connect to database', err);
});

const db = drizzle(pool, { schema });

module.exports = { db };
