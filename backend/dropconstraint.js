const { Pool } = require("pg");
require("dotenv").config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query("ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key")
  .then(() => { console.log("Constraint dropped"); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });