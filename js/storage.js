/*
 * js/storage.js
 * Wrapper for interacting with localStorage and syncing with the API.
 */

const Storage = {
    // -----------------------------------------------------------------
    // OFFLINE FALLBACK / API SYNC
    // -----------------------------------------------------------------
    
    /**
     * Saves data by attempting an API call first. 
     * If it fails, falls back to localStorage and shows an offline notification.
     * 
     * @param {string} key - The localStorage key suffix (e.g. 'planner_step1')
     * @param {object} data - The data to save
     * @param {Promise} apiCallPromise - The FutureFundAPI method to call (e.g. FutureFundAPI.updateProfile(data))
     * @returns {boolean} true if successful (either API or offline fallback)
     */
    async saveWithSync(key, data, apiCallPromise) {
        let isOffline = false;
        let syncedOnline = false;

        try {
            if (apiCallPromise && window.FutureFundAPI && FutureFundAPI.getToken()) {
                const response = await apiCallPromise;
                if (response.success) {
                    syncedOnline = true;
                } else {
                    console.warn('API Sync failed, falling back to offline mode:', response.error);
                    isOffline = true;
                }
            } else {
                // Not logged in or no API promise provided, default to offline behavior
                isOffline = true;
            }
        } catch (e) {
            console.warn('Network error, falling back to offline mode:', e);
            isOffline = true;
        }

        // Always save to localStorage as the source of truth for the thick client
        const saved = this.save(key, data);

        if (saved && apiCallPromise) {
            if (syncedOnline) {
                this.showSyncSuccessNotification();
            } else if (isOffline) {
                this.showOfflineNotification();
            }
        }

        return saved;
    },

    showOfflineNotification() {
        this._showToast(
            '⚠️ Saved locally — will sync when connection is available.',
            '#f59e0b'
        );
    },

    showSyncSuccessNotification() {
        this._showToast(
            '✓ Saved and synced to server.',
            '#10b981'
        );
    },

    _showToast(message, bgColor) {
        // Remove any existing toast
        const existing = document.getElementById('ff-toast');
        if (existing) existing.remove();

        // Add keyframes once
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `@keyframes ffSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`;
            document.head.appendChild(style);
        }

        const toast = document.createElement('div');
        toast.id = 'ff-toast';
        toast.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            background: ${bgColor}; color: #fff;
            padding: 12px 24px; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9999; font-size: 0.9rem; font-weight: 600;
            animation: ffSlideUp 0.3s ease; max-width: 320px;
        `;
        // Use textContent for safety — no user data is in this message
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    // -----------------------------------------------------------------
    // STANDARD LOCALSTORAGE METHODS (Synchronous)
    // -----------------------------------------------------------------

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

    // Reset all FutureFund data (except theme)
    resetAll() {
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
            if (k.startsWith('futurefund_') && k !== 'futurefund_theme') {
                localStorage.removeItem(k);
            }
        });
    }
};

window.FutureFundStorage = Storage;
