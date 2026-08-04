/*
 * js/storage.js
 * Wrapper for interacting with localStorage.
 */

const Storage = {
    // Save data to a specific key
    save(key, data) {
        try {
            const existing = this.get(key) || {};
            const merged = { ...existing, ...data };
            localStorage.setItem(`futurefund_${key}`, JSON.stringify(merged));
            return true;
        } catch (e) {
            console.error("Error saving to localStorage", e);
            return false;
        }
    },

    // Retrieve data by key
    get(key) {
        try {
            const data = localStorage.getItem(`futurefund_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("Error reading from localStorage", e);
            return null;
        }
    },

    // Clear specific key
    remove(key) {
        localStorage.removeItem(`futurefund_${key}`);
    },

    // Reset all FutureFund data
    resetAll() {
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
            if (k.startsWith('futurefund_')) {
                localStorage.removeItem(k);
            }
        });
    }
};

window.FutureFundStorage = Storage;
