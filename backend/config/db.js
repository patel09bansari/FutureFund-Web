// backend/config/db.js
// Why this file exists: To manage the connection to the MySQL database.
// We use a "pool" instead of a single connection so multiple users can query the database at the same time efficiently.

const mysql = require('mysql2/promise'); // We use the promise version for modern async/await syntax
require('dotenv').config();

// Create the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection when the app starts
pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database successfully.');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed. Is MySQL running?');
        console.error(err);
    });

module.exports = pool;
