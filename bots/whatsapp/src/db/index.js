const { drizzle } = require('drizzle-orm/node-postgres');
const { Client } = require('pg');
const schema = require('./schema');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

const connectDB = async () => {
    try {
        await client.connect();
        console.log('Connected to database');
    } catch (err) {
        console.error('Failed to connect to database', err);
    }
};

connectDB();

const db = drizzle(client, { schema });

module.exports = { db };
