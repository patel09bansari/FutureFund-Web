/**
 * js/api.js
 * Centralized API client for FutureFund.
 * Handles authentication headers, error handling, and JSON parsing.
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api'
    : '/api'; // In production, Vercel/Netlify will proxy or we use a defined backend domain

const FutureFundAPI = {
    
    /**
     * Helper to get the JWT token from localStorage
     */
    getToken: () => {
        return localStorage.getItem('ff_jwt');
    },

    /**
     * Core fetch wrapper
     */
    request: async (endpoint, options = {}) => {
        const url = `${API_BASE}${endpoint}`;
        
        // Setup default headers
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        // Inject JWT if it exists
        const token = FutureFundAPI.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                // Return an error object that our frontend can handle
                throw new Error(data.error || 'Something went wrong with the API');
            }

            return { success: true, data };
        } catch (error) {
            console.error(`API Error on ${endpoint}:`, error);
            // Return failure state instead of throwing, so offline fallback can kick in
            return { success: false, error: error.message };
        }
    },

    // --- Authentication ---
    
    login: async (email, password) => {
        return await FutureFundAPI.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    register: async (email, password, full_name) => {
        return await FutureFundAPI.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, full_name })
        });
    },

    // --- Profile ---

    getProfile: async () => {
        return await FutureFundAPI.request('/profile');
    },

    updateProfile: async (profileData) => {
        return await FutureFundAPI.request('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    // --- Planner ---

    savePlanner: async (report_data) => {
        return await FutureFundAPI.request('/planner', {
            method: 'POST',
            body: JSON.stringify({ report_data })
        });
    },

    getPlanner: async () => {
        return await FutureFundAPI.request('/planner');
    },

    // --- Goals ---

    getGoals: async () => {
        return await FutureFundAPI.request('/goals');
    },

    createGoal: async (goalData) => {
        return await FutureFundAPI.request('/goals', {
            method: 'POST',
            body: JSON.stringify(goalData)
        });
    },

    updateGoal: async (id, goalData) => {
        return await FutureFundAPI.request(`/goals/${id}`, {
            method: 'PUT',
            body: JSON.stringify(goalData)
        });
    },

    deleteGoal: async (id) => {
        return await FutureFundAPI.request(`/goals/${id}`, {
            method: 'DELETE'
        });
    },

    // --- Expenses ---

    getExpenses: async () => {
        return await FutureFundAPI.request('/expenses');
    },

    createExpense: async (expenseData) => {
        return await FutureFundAPI.request('/expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData)
        });
    },

    updateExpense: async (id, expenseData) => {
        return await FutureFundAPI.request(`/expenses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(expenseData)
        });
    },

    deleteExpense: async (id) => {
        return await FutureFundAPI.request(`/expenses/${id}`, {
            method: 'DELETE'
        });
    }
};

window.FutureFundAPI = FutureFundAPI;
