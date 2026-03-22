window.ReportsView = {
    _charts: {},

    render() {
        const header = `
            <div class="view-header view-animate">
                <h1>Advanced Reports</h1>
                <div class="header-actions">
                    <button class="btn btn-secondary btn-sm" onclick="window.print()"><i class="fa-solid fa-print"></i> Export PDF</button>
                </div>
            </div>
        `;

        const content = `
            <div class="grid-2 view-animate stagger-1" style="gap: 1.5rem;">
                <div class="card" style="border-radius: 20px;">
                    <div class="card-header border-bottom">
                        <h3 class="card-title"><i class="fa-solid fa-chart-bar text-success"></i> Income vs Expense (6 Months)</h3>
                    </div>
                    <div style="height: 300px; position: relative; padding: 1rem;">
                         <canvas id="incomeExpenseChart"></canvas>
                    </div>
                </div>
                 <div class="card" style="border-radius: 20px;">
                    <div class="card-header border-bottom">
                        <h3 class="card-title"><i class="fa-solid fa-chart-pie text-warning"></i> Spending by Category</h3>
                    </div>
                    <div style="height: 300px; position: relative; display: flex; justify-content: center; padding: 1rem;">
                         <canvas id="categoryChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card view-animate stagger-2" style="margin-top: 1.5rem; border-radius: 20px;">
                <div class="card-header border-bottom">
                    <h3 class="card-title"><i class="fa-solid fa-chart-line text-primary"></i> Net Worth Growth</h3>
                </div>
                <div style="height: 350px; position: relative; padding: 1rem;">
                     <canvas id="netWorthChart"></canvas>
                </div>
            </div>
        `;

        // Load charts after DOM renders
        setTimeout(() => this.loadCharts(), 100);

        return header + content;
    },

    destroyCharts() {
        Object.keys(this._charts).forEach(key => {
            if (this._charts[key]) {
                this._charts[key].destroy();
                this._charts[key] = null;
            }
        });
    },

    async loadCharts() {
        this.destroyCharts();

        const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        const textColor = getCSSVar('--text-primary') || '#f8fafc';
        const gridColor = (getCSSVar('--border-color') || 'rgba(255,255,255,0.1)') + '33';
        const cSuccess = getCSSVar('--color-success') || '#30d158';
        const cDanger = getCSSVar('--color-danger') || '#ff453a';
        const cPrimary = getCSSVar('--color-primary') || '#0a84ff';
        const bgCard = getCSSVar('--bg-card') || '#18181b';

        try {
            const res = await fetch('assets/api/reports.php');
            if (!res.ok) throw new Error('Failed to load report data');

            const data = await res.json();

            // 1. Income vs Expense Chart
            const ctx1 = document.getElementById('incomeExpenseChart');
            if (ctx1) {
                const gradIncome = ctx1.getContext('2d').createLinearGradient(0, 0, 0, 300);
                gradIncome.addColorStop(0, cSuccess);
                gradIncome.addColorStop(1, cSuccess + '22');

                const gradExpense = ctx1.getContext('2d').createLinearGradient(0, 0, 0, 300);
                gradExpense.addColorStop(0, cDanger);
                gradExpense.addColorStop(1, cDanger + '22');

                this._charts.incomeExpense = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: data.income_vs_expense.map(d => d.month),
                        datasets: [
                            { label: 'Income', data: data.income_vs_expense.map(d => d.income), backgroundColor: gradIncome, borderRadius: 6, barThickness: 20 },
                            { label: 'Expense', data: data.income_vs_expense.map(d => d.expense), backgroundColor: gradExpense, borderRadius: 6, barThickness: 20 }
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom', labels: { color: textColor, boxWidth: 12 } }, tooltip: { backgroundColor: bgCard, titleColor: textColor, bodyColor: textColor, padding: 12, cornerRadius: 8 } },
                        scales: { y: { beginAtZero: true, grid: { color: gridColor, borderDash: [5, 5] }, ticks: { color: textColor } }, x: { grid: { display: false }, ticks: { color: textColor } } }
                    }
                });
            }

            // 2. Category Doughnut Chart
            const ctx2 = document.getElementById('categoryChart');
            if (ctx2) {
                const c2 = getCSSVar('--color-secondary') || '#5e5ce6';
                const cAccent = getCSSVar('--color-accent') || '#ff453a';
                const cWarning = getCSSVar('--color-warning') || '#ff9f0a';

                this._charts.category = new Chart(ctx2, {
                    type: 'doughnut',
                    data: {
                        labels: data.spending_by_category.map(d => d.category),
                        datasets: [{
                            data: data.spending_by_category.map(d => d.total),
                            backgroundColor: [cPrimary, cSuccess, c2, cWarning, cAccent, '#64d2ff', '#bf5af2', '#ffd60a'],
                            borderWidth: 2, borderColor: bgCard, hoverOffset: 10
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false, cutout: '70%',
                        plugins: { legend: { position: 'right', labels: { color: textColor, padding: 16, usePointStyle: true, font: { size: 11 } } } }
                    }
                });
            }

            // 3. Net Worth Line Chart
            const ctx3 = document.getElementById('netWorthChart');
            if (ctx3) {
                const gradNet = ctx3.getContext('2d').createLinearGradient(0, 0, 0, 300);
                gradNet.addColorStop(0, cPrimary + '66');
                gradNet.addColorStop(1, cPrimary + '00');

                this._charts.netWorth = new Chart(ctx3, {
                    type: 'line',
                    data: {
                        labels: data.net_worth_trend.map(d => d.date),
                        datasets: [{
                            label: 'Net Worth', data: data.net_worth_trend.map(d => d.value),
                            borderColor: cPrimary, borderWidth: 3, backgroundColor: gradNet, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 6
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
                        plugins: { legend: { display: false }, tooltip: { backgroundColor: bgCard, titleColor: textColor, bodyColor: textColor, padding: 12 } },
                        scales: { y: { grid: { color: gridColor, borderDash: [5, 5] }, ticks: { color: textColor } }, x: { grid: { display: false }, ticks: { color: textColor } } }
                    }
                });
            }

        } catch (error) {
            console.error('Load Charts Error:', error);
            const container = document.querySelector('.grid-2');
            if (container) {
                container.innerHTML = '<div class="card" style="grid-column: 1/-1; padding: 2rem; text-align: center;"><p class="error" style="color: var(--color-danger);"><i class="fa-solid fa-triangle-exclamation"></i> Failed to load report data. Make sure the API is running.</p></div>';
            }
        }
    },

    afterRender() {
        // loadCharts is already called by render's setTimeout
    }
};
