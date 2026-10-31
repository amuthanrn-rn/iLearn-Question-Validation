import 'dotenv/config';
import pg from 'pg';
import fs from 'node:fs';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        ca: fs.readFileSync(process.env.DB_SSL_CA, 'utf8'),
        rejectUnauthorized: true
    },
    max: 2,
    connectionTimeoutMillis: 10000
});

async function testConnection() {
    try {
        const result = await pool.query(`
            SELECT
                current_database() AS database,
                current_user AS username,
                version() AS version
        `);

        console.log('SUCCESS: PostgreSQL connected!');
        console.log(result.rows[0]);

    } catch (error) {
        console.error('FAILED: PostgreSQL connection unsuccessful');
        console.error('Error code:', error.code);
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

await testConnection();