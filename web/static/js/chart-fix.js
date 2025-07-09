// Chart.js configuration fix to prevent animation loops
Chart.defaults.animation.duration = 1000;
Chart.defaults.animation.loop = false;

// Disable animations after page load
window.addEventListener('load', function() {
    setTimeout(function() {
        // Disable all chart animations after initial load
        Chart.defaults.animation.duration = 0;
        
        // Find all chart instances and disable their animations
        Object.keys(Chart.instances).forEach(function(id) {
            const chart = Chart.instances[id];
            if (chart) {
                chart.options.animation = {
                    duration: 0,
                    loop: false
                };
                chart.update('none'); // Update without animation
            }
        });
    }, 2000); // Wait 2 seconds after page load
});

// Prevent chart recreation on window resize
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // Update charts without animation on resize
        Object.keys(Chart.instances).forEach(function(id) {
            const chart = Chart.instances[id];
            if (chart) {
                chart.update('none');
            }
        });
    }, 250);
});