const { Pool } = require("pg");
// ดึง property ชื่อ Pool ออกจาก object pg
// const pg = require("pg");
// const Pool = pg.Pool;
require("dotenv").config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

module.exports =  pool;