// Dashboard specific functions and chart initialization
// dashboard.js

let chartsInitialized = false; // Prevent multiple initializations

function observeDashboardVisibility() {
    const dashboard = document.getElementById('dashboard-content');

    if (!dashboard) {
        console.warn("Dashboard element not found.");
        return;
    }

    // Observe class changes to detect tab/page switch
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (
                mutation.type === 'attributes' &&
                mutation.attributeName === 'class'
            ) {
                const isActive = dashboard.classList.contains('active');
                if (isActive && !chartsInitialized) {
                    console.log("Dashboard became active – initializing charts.");
                    // Use requestAnimationFrame to ensure DOM is painted
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            initDashboardCharts();
                        }, 100);
                    });
                }
            }
        }
    });

    observer.observe(dashboard, { attributes: true });
}

function initDashboardCharts() {
    console.log("Initializing dashboard charts...");

    const dashboard = document.getElementById('dashboard-content');
    if (!dashboard || !dashboard.classList.contains('active')) {
        console.log("Dashboard not active, skipping chart initialization");
        return;
    }

    const uiuxData = [5, 3, 2];
    const softwareData = [8, 4, 3];
    const artistData = [6, 2, 4];

    const chartConfigs = [
        {
            id: 'uiuxChart',
            labels: ['Completed Projects', 'Ongoing Projects', 'Pending Projects'],
            data: uiuxData,
            colors: ['#4CAF50', '#FFC107', '#F44336']
        },
        {
            id: 'softwareChart',
            labels: ['Completed Projects', 'Ongoing Projects', 'Pending Projects'],
            data: softwareData,
            colors: ['#2196F3', '#FF9800', '#9C27B0']
        },
        {
            id: 'artistChart',
            labels: ['Completed Projects', 'Ongoing Projects', 'Pending Projects'],
            data: artistData,
            colors: ['#00BCD4', '#8BC34A', '#E91E63']
        }
    ];

    chartConfigs.forEach(config => {
        const canvas = document.getElementById(config.id);
        if (!canvas) {
            console.warn(`Canvas element '${config.id}' not found`);
            return;
        }

        // Improved retry logic with dimension check
        const tryCreateChart = (attempt = 0) => {
            const rect = canvas.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(canvas);
            const width = parseFloat(computedStyle.width);
            const height = parseFloat(computedStyle.height);
            
            console.log(`Canvas '${config.id}' dimensions: ${width}x${height} (Attempt ${attempt + 1})`);
            
            if ((width === 0 || height === 0 || isNaN(width) || isNaN(height)) && attempt < 15) {
                console.warn(`Canvas '${config.id}' has zero dimensions. Retrying in 200ms... (Attempt ${attempt + 1})`);
                setTimeout(() => tryCreateChart(attempt + 1), 200);
            } else if (attempt >= 15) {
                console.error(`Canvas '${config.id}' still has zero size after 15 attempts. Skipping chart.`);
            } else {
                createSingleChart(config);
                chartsInitialized = true;
            }
        };

        tryCreateChart();
    });
}


function createSingleChart(config) {
    const canvas = document.getElementById(config.id);

    try {
        if (typeof Chart === 'undefined') {
            console.error("Chart.js is not loaded yet.");
            return;
        }

        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const chart = createPieChart(canvas, config.labels, config.data, config.colors);
        console.log(`Created chart for ${config.id}`);

        return chart;
    } catch (error) {
        console.error(`Failed to create chart for ${config.id}:`, error);
    }
}


// Random quote display
function showRandomQuote() {
    const randomQuoteElement = document.getElementById('randomQuote');
    if (!randomQuoteElement) return;

    const allQuotes = [...quotes, ...defaultQuotes];
    
    if (allQuotes.length > 0) {
        const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
        randomQuoteElement.innerHTML = `
            <p>"${randomQuote.text}"</p>
            <div class="quote-author">- ${randomQuote.author}</div>
        `;
    }
}


// Make functions globally available
window.initDashboardCharts = initDashboardCharts;
window.showRandomQuote = showRandomQuote;
window.observeDashboardVisibility = observeDashboardVisibility;

function activateSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    // Special handling for dashboard - reset flag to allow re-initialization
    if (sectionId === 'dashboard-content') {
        chartsInitialized = false;
    }
    
    // DON'T call initDashboardCharts here - let the observer handle it
}

// Improved initialization sequence
document.addEventListener('DOMContentLoaded', () => {
    // First, set up the observer
    observeDashboardVisibility();
    
    // DON'T activate dashboard here if you want other content to show first
    // Remove or comment out this line if you want to preserve the active section:
    // activateSection('dashboard-content');
    
    // Instead, just check if dashboard is already active and initialize if needed
    const dashboard = document.getElementById('dashboard-content');
    if (dashboard && dashboard.classList.contains('active')) {
        requestAnimationFrame(() => {
            setTimeout(() => {
                initDashboardCharts();
            }, 150);
        });
    }
});