/**
 * Financial Insights - Charts Module
 * 
 * Handles all chart rendering for financial data visualization
 * Uses Chart.js for visualization
 */

window.ChartsModule = {
    state: {
        expenseChart: null,
        budgetChart: null,
        trendChart: null,
        isLoading: false
    },

    /**
     * Convert any CSS color value to rgba with optional alpha
     */
    _toRGBA(colorStr, alpha) {
        if (!colorStr) return `rgba(128, 128, 128, ${alpha})`;
        colorStr = colorStr.trim();
        // If already has alpha specified and no override needed
        if (alpha === undefined) return colorStr;
        // Handle rgb(...) format
        const rgbMatch = colorStr.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
        if (rgbMatch) {
            return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
        }
        // Handle rgba(...) format — replace alpha
        const rgbaMatch = colorStr.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)$/);
        if (rgbaMatch) {
            return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${alpha})`;
        }
        // Handle hex
        if (colorStr.startsWith('#')) {
            let hex = colorStr.slice(1);
            if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        // Fallback: return as-is
        return colorStr;
    },

    config: {
        expenseAPI: 'assets/api/getExpenseData.php',
        budgetAPI: 'assets/api/getBudgetData.php',
        trendAPI: 'assets/api/getMonthlyTrendData.php',
        colors: {
            primary: 'rgb(102, 126, 234)',
            success: 'rgb(34, 197, 94)',
            danger: 'rgb(239, 68, 68)',
            warning: 'rgb(251, 146, 60)',
            info: 'rgb(59, 130, 246)',
            secondary: 'rgb(148, 163, 184)',
            categories: [
                'rgba(102, 126, 234, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(251, 146, 60, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(14, 165, 233, 0.8)'
            ]
        }
    },

    /**
     * Initialize charts module and render all charts
     */
    async init() {
        console.log('📊 Initializing Charts Module...');

        try {
            await Promise.all([
                this.renderExpenseChart(),
                this.renderBudgetChart(),
                this.renderTrendChart()
            ]);
            console.log('✅ All charts initialized');
        } catch (error) {
            console.error('❌ Error initializing charts:', error);
        }
    },

    /**
     * Render Expense Distribution Pie Chart
     */
    async renderExpenseChart() {
        try {
            const txs = MoneyDB.getTransactions().filter(t => t.type === 'expense');
            const categories = {};
            txs.forEach(t => {
                categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
            });

            const labels = Object.keys(categories);
            const amounts = Object.values(categories);

            if (labels.length === 0) {
                labels.push("No Expenses Yet");
                amounts.push(1); // placeholder
            }
            const canvas = document.getElementById('expenseChart');

            if (!canvas) {
                console.warn('⚠️ Expense chart canvas not found');
                return;
            }

            // Destroy previous chart if exists
            if (this.state.expenseChart) {
                this.state.expenseChart.destroy();
            }

            // Dynamic colors
            const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'rgba(255, 255, 255, 0.7)';
            const textColor = getCSSVar('--text-primary');
            const tooltipBg = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || 'rgba(0, 0, 0, 0.8)';

            const c1 = getCSSVar('--color-primary');
            const c2 = getCSSVar('--color-secondary');
            const c3 = getCSSVar('--color-accent');
            const c4 = getCSSVar('--color-warning');
            const c5 = getCSSVar('--color-success');
            const dynamicColors = [c1, c2, c3, c4, c5, '#a855f7', '#ec4899', '#0ea5e9'];

            // Create new chart
            this.state.expenseChart = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: amounts,
                        backgroundColor: dynamicColors,
                        borderColor: getCSSVar('--bg-card'),
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                padding: 15,
                                font: { size: 12, weight: '500' },
                                color: textColor,
                                generateLabels: function (chart) {
                                    const data = chart.data;
                                    const datasets = data.datasets;
                                    const labels = data.labels || [];
                                    const sum = datasets[0].data.reduce((a, b) => a + b, 0);

                                    return labels.map((label, i) => ({
                                        text: `${label}`,
                                        fillStyle: datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i,
                                        pointStyle: 'circle'
                                    }));
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const sum = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / sum) * 100).toFixed(1);
                                    return `${context.label}: $${context.parsed.toFixed(2)} (${percentage}%)`;
                                }
                            },
                            backgroundColor: tooltipBg,
                            titleColor: textColor,
                            bodyColor: textColor,
                            padding: 12,
                            titleFont: { size: 13, weight: 'bold' },
                            bodyFont: { size: 12 }
                        }
                    }
                }
            });

            console.log('✅ Expense chart rendered');
        } catch (error) {
            console.error('❌ Error rendering expense chart:', error);
        }
    },

    /**
     * Render Budget vs Expense Bar Chart
     */
    async renderBudgetChart() {
        try {
            const budgets = MoneyDB.getBudgets();
            const labels = budgets.map(b => b.category);
            const budgetAmounts = budgets.map(b => b.limit_amount !== undefined ? b.limit_amount : b.limit);
            const spentAmounts = budgets.map(b => b.spent || 0);

            if (labels.length === 0) {
                labels.push("No Budgets");
                budgetAmounts.push(0);
                spentAmounts.push(0);
            }
            const canvas = document.getElementById('budgetChart');

            if (!canvas) {
                console.warn('⚠️ Budget chart canvas not found');
                return;
            }

            // Destroy previous chart if exists
            if (this.state.budgetChart) {
                this.state.budgetChart.destroy();
            }

            // Dynamic colors
            const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'rgba(255, 255, 255, 0.7)';
            const textColor = getCSSVar('--text-primary');
            const gridColor = getCSSVar('--border-color');
            const tooltipBg = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || 'rgba(0, 0, 0, 0.8)';

            const ctx = canvas.getContext('2d');
            const cPrimary = getCSSVar('--color-primary') || '#667eea';
            const cSecondary = getCSSVar('--color-secondary') || '#764ba2';
            const cSuccess = getCSSVar('--color-success') || '#22c55e';

            const budgetGrad = ctx.createLinearGradient(0, 0, 300, 0);
            budgetGrad.addColorStop(0, cPrimary); budgetGrad.addColorStop(1, cSecondary);

            const spentGrad = ctx.createLinearGradient(0, 0, 300, 0);
            spentGrad.addColorStop(0, cSuccess); spentGrad.addColorStop(1, cSuccess);

            // Create new chart
            this.state.budgetChart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Budget',
                            data: budgetAmounts,
                            backgroundColor: budgetGrad,
                            borderWidth: 0,
                            borderRadius: 4
                        },
                        {
                            label: 'Spent',
                            data: spentAmounts,
                            backgroundColor: spentGrad,
                            borderWidth: 0,
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                padding: 15,
                                font: { size: 12, weight: '500' },
                                color: textColor
                            }
                        },
                        tooltip: {
                            backgroundColor: tooltipBg,
                            titleColor: textColor,
                            bodyColor: textColor,
                            padding: 12,
                            titleFont: { size: 13, weight: 'bold' },
                            bodyFont: { size: 12 },
                            callbacks: {
                                label: function (context) {
                                    return `${context.dataset.label}: $${context.parsed.x.toFixed(2)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: false,
                            grid: {
                                color: gridColor,
                                drawBorder: false
                            },
                            ticks: { color: textColor }
                        },
                        y: {
                            grid: {
                                color: gridColor,
                                drawBorder: false
                            },
                            ticks: { color: textColor }
                        }
                    }
                }
            });

            console.log('✅ Budget chart rendered');
        } catch (error) {
            console.error('❌ Error rendering budget chart:', error);
        }
    },

    /**
     * Render Monthly Trend Line Chart
     */
    async renderTrendChart() {
        try {
            const txs = MoneyDB.getTransactions();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
            const expenses = [1200, 1500, 1100, 1900, 1300, 2450, 0];
            const income = [3000, 3200, 3100, 3000, 4500, 6200, 0];

            // Add actual local transactions to the latest month
            txs.forEach(t => {
                if (t.type === 'expense') expenses[6] += Math.abs(t.amount);
                else income[6] += t.amount;
            });

            const labels = months;
            const canvas = document.getElementById('trendChart');

            if (!canvas) {
                console.warn('⚠️ Trend chart canvas not found');
                return;
            }

            // Destroy previous chart if exists
            if (this.state.trendChart) {
                this.state.trendChart.destroy();
            }

            // Dynamic colors
            const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'rgba(255, 255, 255, 0.7)';
            const textColor = getCSSVar('--text-primary');
            const gridColor = getCSSVar('--border-color');
            const tooltipBg = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || 'rgba(0, 0, 0, 0.8)';
            const pointBorder = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || 'rgba(255, 255, 255, 0.5)';

            const cAcc = getCSSVar('--color-accent') || 'rgb(239, 68, 68)';
            const cSucc = getCSSVar('--color-success') || 'rgb(34, 197, 94)';

            // Create gradients
            const ctx = canvas.getContext('2d');
            const expenseGradient = ctx.createLinearGradient(0, 0, 0, 300);
            expenseGradient.addColorStop(0, ChartsModule._toRGBA(cAcc, 0.4));
            expenseGradient.addColorStop(1, 'transparent');

            const incomeGradient = ctx.createLinearGradient(0, 0, 0, 300);
            incomeGradient.addColorStop(0, ChartsModule._toRGBA(cSucc, 0.4));
            incomeGradient.addColorStop(1, 'transparent');

            // Create new chart
            this.state.trendChart = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Expenses',
                            data: expenses,
                            borderColor: cAcc,
                            backgroundColor: expenseGradient,
                            tension: 0.4,
                            fill: true,
                            borderWidth: 3,
                            pointRadius: 4,
                            pointBackgroundColor: cAcc,
                            pointBorderColor: pointBorder,
                            pointBorderWidth: 2
                        },
                        {
                            label: 'Income',
                            data: income,
                            borderColor: cSucc,
                            backgroundColor: incomeGradient,
                            tension: 0.4,
                            fill: true,
                            borderWidth: 3,
                            pointRadius: 4,
                            pointBackgroundColor: cSucc,
                            pointBorderColor: pointBorder,
                            pointBorderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                padding: 15,
                                font: { size: 12, weight: '500' },
                                color: textColor,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            backgroundColor: tooltipBg,
                            titleColor: textColor,
                            bodyColor: textColor,
                            padding: 12,
                            titleFont: { size: 13, weight: 'bold' },
                            bodyFont: { size: 12 },
                            callbacks: {
                                label: function (context) {
                                    return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: gridColor,
                                drawBorder: false
                            },
                            ticks: { color: textColor }
                        },
                        x: {
                            grid: {
                                display: false,
                                drawBorder: false
                            },
                            ticks: { color: textColor }
                        }
                    }
                }
            });

            console.log('✅ Trend chart rendered');
        } catch (error) {
            console.error('❌ Error rendering trend chart:', error);
        }
    },

    /**
     * Refresh all charts with latest data
     */
    async refreshAll() {
        console.log('🔄 Refreshing all charts...');
        await this.init();
    },

    /**
     * Destroy all charts and cleanup
     */
    destroy() {
        if (this.state.expenseChart) {
            this.state.expenseChart.destroy();
            this.state.expenseChart = null;
        }
        if (this.state.budgetChart) {
            this.state.budgetChart.destroy();
            this.state.budgetChart = null;
        }
        if (this.state.trendChart) {
            this.state.trendChart.destroy();
            this.state.trendChart = null;
        }
        console.log('🛑 Charts module destroyed');
    }
};
