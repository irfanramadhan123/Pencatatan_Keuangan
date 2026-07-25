// migration.js
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
  try {
    // Add missing columns to categories
    await pool.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`);
    await pool.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'pengeluaran'`);
    await pool.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);

    // Add google_id to users (for Google-only auth)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)`);

    // Make password nullable (Google-only users don't have password)
    await pool.query(`ALTER TABLE users ALTER COLUMN password DROP NOT NULL`);
    
    // Create fund_sources table
    await pool.query(`CREATE TABLE IF NOT EXISTS fund_sources (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Add fund_source_id to transactions
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fund_source_id INTEGER REFERENCES fund_sources(id) ON DELETE SET NULL`);
    
    // Create savings table
    await pool.query(`CREATE TABLE IF NOT EXISTS savings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      target_amount NUMERIC NOT NULL DEFAULT 0,
      current_amount NUMERIC NOT NULL DEFAULT 0,
      deadline DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Create savings_history table
    await pool.query(`CREATE TABLE IF NOT EXISTS savings_history (
      id SERIAL PRIMARY KEY,
      saving_id INTEGER NOT NULL REFERENCES savings(id) ON DELETE CASCADE,
      amount NUMERIC NOT NULL,
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Create budgets table
    await pool.query(`CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      amount NUMERIC NOT NULL DEFAULT 0,
      period VARCHAR(7) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, category_id, period)
    )`);
    
    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_fund_sources_user_id ON fund_sources(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_savings_user_id ON savings(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id)`);
    
    console.log('Migration completed successfully!');
    
    // Verify
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('Tables:', tables.rows.map(r => r.table_name));
    
    await pool.end();
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}
migrate();
