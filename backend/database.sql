-- =============================================
-- Pencatatan Keuangan - Complete Database Schema
-- =============================================

-- 1. users table (already exists)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  google_id VARCHAR(255),
  savings_target NUMERIC DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'IDR',
  timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. categories table (need to add type and user_id)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'pengeluaran' CHECK (type IN ('pemasukan', 'pengeluaran')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. fund_sources table (NEW)
CREATE TABLE IF NOT EXISTS fund_sources (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. transactions table (add fund_source_id)
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  fund_source_id INTEGER REFERENCES fund_sources(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('pemasukan', 'pengeluaran')),
  amount NUMERIC NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. savings table (NEW)
CREATE TABLE IF NOT EXISTS savings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. savings_history table (NEW)
CREATE TABLE IF NOT EXISTS savings_history (
  id SERIAL PRIMARY KEY,
  saving_id INTEGER NOT NULL REFERENCES savings(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. budgets table (NEW)
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  period VARCHAR(7) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category_id, period)
);

-- Migration for existing tables
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'pengeluaran';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fund_source_id INTEGER REFERENCES fund_sources(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS savings_target NUMERIC DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'IDR';
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Jakarta';
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_fund_sources_user_id ON fund_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_user_id ON savings(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
