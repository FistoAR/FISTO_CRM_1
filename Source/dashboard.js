// Dashboard specific functions and chart initialization
// dashboard.js

function observeDashboardVisibility() {
    const dashboard = document.getElementById('dashboard-content');

    if (!dashboard) {
        console.warn("Dashboard element not found.");
        return;
    }

    // Initial check after load
    if (dashboard.classList.contains('active')) {
        initDashboardCharts();
    }

    // Observe class changes to detect tab/page switch
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (
                mutation.type === 'attributes' &&
                mutation.attributeName === 'class'
            ) {
                const isActive = dashboard.classList.contains('active');
                if (isActive) {
                    console.log("Dashboard became active – initializing charts.");
                    initDashboardCharts();
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

        const tryCreateChart = () => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                console.warn(`Canvas '${config.id}' has zero dimensions. Retrying...`);
                setTimeout(tryCreateChart, 100);
            } else {
                createSingleChart(config);
            }
        };

        tryCreateChart();
    });
}

function createSingleChart(config) {
    const canvas = document.getElementById(config.id);

    try {
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

// Initialize dashboard on DOM load
document.addEventListener('DOMContentLoaded', () => {
    observeDashboardVisibility();
});

// Make functions globally available
window.initDashboardCharts = initDashboardCharts;
window.showRandomQuote = showRandomQuote;
window.observeDashboardVisibility = observeDashboardVisibility;