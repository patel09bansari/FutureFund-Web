const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';
let token = '';
let testGoalId = '';
let testExpenseId = '';

const testEmail = `test${Date.now()}@example.com`;

async function request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function runTests() {
    console.log('--- FutureFund Automated API Tests ---');

    try {
        // 1. Register
        console.log('Testing Registration...');
        let res = await request('/auth/register', { method: 'POST', body: JSON.stringify({ email: testEmail, password: 'password123', full_name: 'Test User' }) });
        assert.strictEqual(res.status, 201, 'Registration failed');
        assert.strictEqual(res.data.success, true, 'Registration success flag false');

        // 2. Login
        console.log('Testing Login...');
        res = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: testEmail, password: 'password123' }) });
        assert.strictEqual(res.status, 200, 'Login failed');
        assert.strictEqual(res.data.success, true, 'Login success flag false');
        token = res.data.token;
        assert.ok(token, 'No token returned');

        // 3. Invalid Login
        console.log('Testing Invalid Login...');
        res = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: testEmail, password: 'wrong' }) });
        assert.strictEqual(res.status, 401, 'Expected 401 for wrong password');

        // 4. Protected Route (Profile GET)
        console.log('Testing Profile GET...');
        res = await request('/profile');
        assert.strictEqual(res.status, 200, 'Failed to fetch profile');
        assert.strictEqual(res.data.user.email, testEmail, 'Email mismatch');

        // 5. Protected Route Without JWT
        console.log('Testing Protected Route without JWT...');
        const oldToken = token;
        token = '';
        res = await request('/profile');
        assert.strictEqual(res.status, 401, 'Expected 401 without JWT');
        token = oldToken;

        // 6. Planner POST (Save)
        console.log('Testing Planner Save...');
        res = await request('/planner', { method: 'POST', body: JSON.stringify({ report_data: { test: true } }) });
        assert.strictEqual(res.status, 200, 'Failed to save planner');

        // 7. Planner GET
        console.log('Testing Planner GET...');
        res = await request('/planner');
        assert.strictEqual(res.status, 200, 'Failed to get planner');
        assert.strictEqual(res.data.result.test, true, 'Planner data mismatch');

        // 8. Goals CRUD
        console.log('Testing Goals CRUD...');
        res = await request('/goals', { method: 'POST', body: JSON.stringify({ goal_name: 'Test Goal', target_amount: 5000, timeline_years: 2 }) });
        assert.strictEqual(res.status, 201, 'Goal creation failed');
        testGoalId = res.data.goalId;

        res = await request('/goals');
        assert.strictEqual(res.data.goals.length, 1, 'Goal not retrieved');
        
        res = await request(`/goals/${testGoalId}`, { method: 'DELETE' });
        assert.strictEqual(res.status, 200, 'Goal deletion failed');

        // 9. Expenses CRUD
        console.log('Testing Expenses CRUD...');
        res = await request('/expenses', { method: 'POST', body: JSON.stringify({ category: 'Food', amount: 50 }) });
        assert.strictEqual(res.status, 201, 'Expense creation failed');
        testExpenseId = res.data.expenseId;

        res = await request('/expenses');
        assert.strictEqual(res.data.expenses.length, 1, 'Expense not retrieved');

        res = await request(`/expenses/${testExpenseId}`, { method: 'DELETE' });
        assert.strictEqual(res.status, 200, 'Expense deletion failed');

        console.log('? All tests passed successfully!');
    } catch (e) {
        console.error('? Test failed:', e.message);
        process.exit(1);
    }
}

runTests();
