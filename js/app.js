/*
 * js/app.js
 * Core initialization: Theme toggling and AOS init.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAOS();
});

function initTheme() {
    // Default to light mode for fintech feel
    // Use the same localStorage key as other pages for theme persistence
    const savedTheme = localStorage.getItem('futurefund_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Listen for theme toggle events
    const themeToggles = document.querySelectorAll('.theme-toggle');
    
    // Update icons based on current theme
    const updateIcons = (theme) => {
        themeToggles.forEach(toggle => {
            if (theme === 'dark') {
                toggle.innerHTML = '<i class="fas fa-sun text-primary-theme fs-5"></i>';
            } else {
                toggle.innerHTML = '<i class="fas fa-moon text-primary-theme fs-5"></i>';
            }
        });
    };
    
    updateIcons(savedTheme);
    
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('futurefund_theme', newTheme); // Key must match what every page reads on load
            
            updateIcons(newTheme);
            
            // Dispatch event for charts to update
            window.dispatchEvent(new Event('themeChanged'));
        });
    });
}

function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            easing: 'ease-out',
            once: true,
            offset: 30
        });
    }
}
