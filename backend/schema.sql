-- ============================================================
-- FutureFund Database Schema
-- ============================================================
-- This file creates all tables required by the Node.js backend.
-- Column names EXACTLY match what the Express controllers query.
--
-- To set up: 
--   1. Open MySQL CLI or Workbench
--   2. Run: source /path/to/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS futurefund;
USE futurefund;

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
-- Purpose: Stores authentication credentials and basic profile.
-- Used by: authController.js (register, login), userController.js (updateProfile)
-- Relationships: One-to-One with financial_profiles, One-to-Many with financial_goals, expenses

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,       -- Stored as bcrypt hash (never plain text)
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. FINANCIAL PROFILES TABLE
-- ============================================================
-- Purpose: Stores the user's financial snapshot AND the engine-generated report.
-- Used by: plannerController.js (savePlanner, getPlanner), userController.js (updateProfile)
-- Relationship: One-to-One with users (via user_id FK)
-- Architecture Note: 'report_data' stores the entire frontend engine JSON output as a TEXT blob.
--   This is intentional for the Thick Client architecture — the backend is a dumb storage pipe.

CREATE TABLE IF NOT EXISTS financial_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    age INT DEFAULT NULL,
    monthly_income DECIMAL(15,2) DEFAULT NULL,
    monthly_savings DECIMAL(15,2) DEFAULT NULL,
    risk_tolerance VARCHAR(50) DEFAULT NULL,
    occupation_type VARCHAR(100) DEFAULT NULL,
    report_data LONGTEXT DEFAULT NULL,         -- JSON blob from frontend Intelligence Engine
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 3. FINANCIAL GOALS TABLE
-- ============================================================
-- Purpose: Stores individual financial goals (e.g., Buy a Car, Retirement).
-- Used by: goalController.js (CRUD operations)
-- Relationship: One-to-Many with users (one user can have many goals)

CREATE TABLE IF NOT EXISTS financial_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal_name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_saved DECIMAL(15,2) DEFAULT 0,
    timeline_years INT NOT NULL,
    category VARCHAR(100) DEFAULT 'Other',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 4. EXPENSES TABLE
-- ============================================================
-- Purpose: Stores categorized expenses for budgeting.
-- Used by: expenseController.js (CRUD operations)
-- Relationship: One-to-Many with users

CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT DEFAULT '',
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
