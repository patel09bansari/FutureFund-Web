# FutureFund Database Schema

FutureFund uses a lightweight relational database schema designed for simplicity, ease of explanation, and beginner-friendly queries.

## Entities and Relationships

- **users**: The core entity representing a registered user.
- **financial_profiles**: A 1-to-1 relationship with `users`. Stores the user's latest financial data (income, expenses, balances).
- **goals**: A 1-to-Many relationship with `users`. A user can have multiple financial goals.
- **expenses**: A 1-to-Many relationship with `users`. A user can track multiple monthly expenses.

## Schema Definition

```sql
-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Financial Profiles Table (1-to-1 with User)
CREATE TABLE financial_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    monthly_income DECIMAL(12,2) DEFAULT 0,
    monthly_expenses DECIMAL(12,2) DEFAULT 0,
    emergency_fund DECIMAL(12,2) DEFAULT 0,
    total_investments DECIMAL(12,2) DEFAULT 0,
    total_debt DECIMAL(12,2) DEFAULT 0,
    risk_profile ENUM('Conservative', 'Moderate', 'Aggressive') DEFAULT 'Moderate',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Goals Table (1-to-Many with User)
CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    target_year INT NOT NULL,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Expenses Table (1-to-Many with User)
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    is_essential BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Why this design? (Interview Talking Points)

1. **Normalization vs Flat Data**: The `financial_profiles` table could technically be merged into `users`. However, separating them ensures that the `users` table stays strictly for authentication and identity, while `financial_profiles` can grow to include hundreds of financial metrics without cluttering the auth logic.
2. **Cascading Deletes**: `ON DELETE CASCADE` is used extensively so that when a user deletes their account, all associated financial data is automatically purged, preventing orphaned rows.
3. **ENUMs**: `ENUM` is used for `risk_profile` and `priority` to strictly constrain values at the database level rather than just relying on frontend validation.
