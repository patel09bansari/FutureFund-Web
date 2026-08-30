/*
 * js/utils.js
 * Helper formatting and generic utilities.
 */

const Utils = {
    formatCurrency(amount, currency = 'INR') {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    },

    formatNumber(number) {
        return new Intl.NumberFormat('en-IN').format(number);
    },

    escapeHTML(str) {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

window.FutureFundUtils = Utils;
