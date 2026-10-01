
const { Pool } = require("pg");

// Create PostgreSQL connection pool
const pool = new Pool({

    host: process.env.DB_HOST,

    port: Number(process.env.DB_PORT),

    database: process.env.DB_NAME,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    max: 10,

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 5000

});

// Export connection pool
module.exports = pool;
