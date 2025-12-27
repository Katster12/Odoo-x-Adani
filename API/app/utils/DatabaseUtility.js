const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const DB_NAME = process.env.MYSQL_DATABASE;

async function ensureDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD
    });

    await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
         CHARACTER SET utf8mb4
         COLLATE utf8mb4_unicode_ci`
    );

    await connection.end();
}

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: DB_NAME,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10
});

async function databaseVersion(connection) {
    const [table] = await connection.query("SHOW TABLES LIKE 'Version'");
    if (table.length === 0) return 0;

    const [rows] = await connection.query(
        "SELECT version FROM Version ORDER BY version ASC"
    );
    return rows.length ? rows[rows.length - 1].version : 0;
}

async function localVersion() {
    const files = fs.readdirSync(
        path.join(__dirname, '../database')
    );

    return Math.max(
        ...files
            .filter(f => f.endsWith('.sql'))
            .map(f => parseInt(f.split('.')[0], 10))
    );
}

async function executeSqlFile(connection, version) {
    const sqlPath = path.join(__dirname, `../database/${version}.sql`);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await connection.query(sql);
}

async function updateDatabase() {
    let connection;
    try {
        await ensureDatabase();
        connection = await pool.getConnection();

        const dbVersion = await databaseVersion(connection);
        const localFileVersion = await localVersion();

        for (let v = dbVersion + 1; v <= localFileVersion; v++) {
            await executeSqlFile(connection, v);
        }
    } catch (err) {
        console.error("Database update failed:", err);
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
}

updateDatabase();
module.exports = pool;
