-- Database: futurefund
-- This file contains the schema for the FutureFund full-stack application.
-- It establishes a relational database with simple, beginner-friendly structures.

CREATE DATABASE IF NOT EXISTS futurefund;
USE futurefund;

-- 1. Users Table
-- Stores authentication credentials and basic profile info.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Stored as bcrypt hash
    age INT,
    occupation VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Financial Profiles Table
-- Stores the high-level financial situation of the user.
-- Linked 1-to-1 with the users table.
CREATE TABLE IF NOT EXISTS financial_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    income DECIMAL(15,2) DEFAULT 0,
    expenses DECIMAL(15,2) DEFAULT 0,
    risk_profile VARCHAR(50) DEFAULT 'Moderate',
    health_score INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Goals Table
-- Stores individual financial goals (e.g., Buy a Car, Retirement).
-- Linked 1-to-Many with the users table.
CREATE TABLE IF NOT EXISTS goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal_name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    deadline_year INT NOT NULL,
    priority VARCHAR(50) DEFAULT 'Medium',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Expenses Table
-- Stores categorized expenses for budgeting.
-- Linked 1-to-Many with the users table.
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    expense_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Planner Results Table
-- Stores the generated roadmap and recommendations from the Frontend Intelligence Engine.
-- This acts as a historical record of their financial plan.
CREATE TABLE IF NOT EXISTS planner_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recommendation TEXT, -- Stores JSON string or plain text
    roadmap TEXT, -- Stores JSON string of the timeline
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
