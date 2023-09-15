const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.HOST || 'localhost',
    port: 5432,
    database: 'bugtrackerdb'
});

module.exports = pool;