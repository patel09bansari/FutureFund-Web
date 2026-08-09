# FutureFund API Documentation

This document outlines the REST APIs exposed by the FutureFund Node.js backend.

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `/api` (or configured via environment)

## Authentication

All protected routes require a JWT token to be passed in the `Authorization` header.
Format: `Authorization: Bearer <token>`

---

### 1. Register User
- **Endpoint**: `POST /api/auth/register`
- **Description**: Creates a new user account.
- **Body Payload**:
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```
- **Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

### 2. Login User
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticates a user and returns a JWT.
- **Body Payload**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```
- **Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

---

## Profile & Planner

### 3. Get User Profile
- **Endpoint**: `GET /api/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves the user's basic info and their current financial profile.
- **Response** (200 OK):
```json
{
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com"
  },
  "profile": {
    "monthly_income": "85000.00",
    "monthly_expenses": "40000.00",
    "emergency_fund": "150000.00",
    "total_investments": "300000.00",
    "total_debt": "50000.00",
    "risk_profile": "Moderate"
  }
}
```

### 4. Update User Profile
- **Endpoint**: `PUT /api/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Updates the financial profile.
- **Body Payload** (Partial updates allowed):
```json
{
  "monthly_income": 90000,
  "risk_profile": "Aggressive"
}
```

### 5. Save Planner Data (Thick Client Sync)
- **Endpoint**: `POST /api/planner`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Receives a large JSON object representing the entire financial state calculated by the frontend engine, and syncs it to the database.

---

## Goals

### 6. Get All Goals
- **Endpoint**: `GET /api/goals`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
```json
{
  "goals": [
    {
      "id": 1,
      "name": "Buy a Car",
      "target_amount": "800000.00",
      "current_amount": "200000.00",
      "target_year": 2026,
      "priority": "High"
    }
  ]
}
```

### 7. Create Goal
- **Endpoint**: `POST /api/goals`
- **Headers**: `Authorization: Bearer <token>`
- **Body Payload**:
```json
{
  "name": "Buy a Car",
  "target_amount": 800000,
  "current_amount": 200000,
  "target_year": 2026,
  "priority": "High"
}
```

### 8. Update Goal
- **Endpoint**: `PUT /api/goals/:id`
- **Headers**: `Authorization: Bearer <token>`

### 9. Delete Goal
- **Endpoint**: `DELETE /api/goals/:id`
- **Headers**: `Authorization: Bearer <token>`

---

## Expenses

### 10. Get All Expenses
- **Endpoint**: `GET /api/expenses`
- **Headers**: `Authorization: Bearer <token>`

### 11. Create Expense
- **Endpoint**: `POST /api/expenses`
- **Headers**: `Authorization: Bearer <token>`
- **Body Payload**:
```json
{
  "category": "Rent",
  "amount": 25000,
  "is_essential": true
}
```

### 12. Update Expense
- **Endpoint**: `PUT /api/expenses/:id`
- **Headers**: `Authorization: Bearer <token>`

### 13. Delete Expense
- **Endpoint**: `DELETE /api/expenses/:id`
- **Headers**: `Authorization: Bearer <token>`
