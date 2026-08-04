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
    const savedTheme = localStorage.getItem('theme') || 'light';
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
            localStorage.setItem('theme', newTheme);
            
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
