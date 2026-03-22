window.InvestmentsView = {
    _charts: {},

    render() {
        const portfolio = MoneyDB.getPortfolio() || { stocks: [], crypto: [] };
        const user = MoneyDB.getUser() || { currency: '$' };

        const stocks = portfolio.stocks || [];
        const crypto = portfolio.crypto || [];

        const totalStocks = stocks.reduce((a, s) => a + (s.currentPrice * s.shares), 0);
        const totalCrypto = crypto.reduce((a, c) => a + (c.currentPrice * c.shares), 0);
        const cashValue = 12450;
        const totalPortfolio = totalStocks + totalCrypto + cashValue;

        return `
            <div class="grid-2" style="margin-bottom: 2rem;">
                <!-- Portfolio Summary -->
                <div class="card" style="background: var(--gradient-card);">
                    <div class="card-header">
                        <h3 class="card-title">Total Portfolio Value</h3>
                        <span class="badge badge-success">+12.5% All Time</span>
                    </div>
                    <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                        ${user.currency}${totalPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div style="margin-top: 1rem;">
                        <button class="btn btn-sm btn-primary" onclick="InvestmentsView.addAsset()">
                            <i class="fa-solid fa-plus"></i> Add Holding
                        </button>
                    </div>
                    <div class="grid-3" style="margin-top: 1.5rem; gap: 1rem;">
                        <div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Stocks</div>
                            <div style="font-weight: 600;">${user.currency}${totalStocks.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </div>
                         <div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Crypto</div>
                            <div style="font-weight: 600;">${user.currency}${totalCrypto.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </div>
                         <div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Cash</div>
                            <div style="font-weight: 600;">${user.currency}${cashValue.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Allocation Chart -->
                <div class="card" style="border-radius: 20px;">
                     <div class="card-header"><h3 class="card-title"><i class="fa-solid fa-chart-pie text-success"></i> Asset Allocation</h3></div>
                     <div style="padding: 1rem; position: relative; height: 200px; display: flex; justify-content: center;">
                        <canvas id="investmentsChartCanvas"></canvas>
                     </div>
                </div>
            </div>

            <!-- Portfolio Performance Chart (NEW) -->
            <div class="card" style="margin-bottom: 2rem; border-radius: 20px;">
                <div class="card-header"><h3 class="card-title"><i class="fa-solid fa-chart-line text-primary"></i> Portfolio Performance (6 Months)</h3></div>
                <div style="padding: 1rem; position: relative; height: 280px;">
                    <canvas id="portfolioPerfCanvas"></canvas>
                </div>
            </div>

            <!-- Holdings Lists -->
            <div class="grid-2">
                <div class="card" style="border-radius: 20px;">
                    <div class="card-header"><h3 class="card-title">Stock Holdings</h3></div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr><th>Asset</th><th>Shares</th><th style="text-align: right;">Value</th><th style="text-align: right;">Change</th></tr>
                            </thead>
                            <tbody>
                                ${stocks.map(s => `
                                    <tr>
                                        <td>
                                            <div style="font-weight: 600;">${s.symbol}</div>
                                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${s.name}</div>
                                        </td>
                                        <td>${s.shares}</td>
                                        <td style="text-align: right;">${user.currency}${(s.currentPrice * s.shares).toLocaleString()}</td>
                                        <td style="text-align: right;" class="${s.change >= 0 ? 'text-success' : 'text-danger'}">${s.change >= 0 ? '+' : ''}${s.change}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="card" style="border-radius: 20px;">
                    <div class="card-header"><h3 class="card-title">Crypto Assets</h3></div>
                    <div class="table-container">
                         <table>
                            <thead>
                                <tr><th>Asset</th><th>Balance</th><th style="text-align: right;">Value</th><th style="text-align: right;">Change</th></tr>
                            </thead>
                            <tbody>
                                ${crypto.map(c => `
                                    <tr>
                                        <td>
                                            <div style="font-weight: 600;">${c.symbol}</div>
                                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${c.name}</div>
                                        </td>
                                        <td>${c.shares}</td>
                                        <td style="text-align: right;">${user.currency}${(c.currentPrice * c.shares).toLocaleString()}</td>
                                        <td style="text-align: right;" class="${c.change >= 0 ? 'text-success' : 'text-danger'}">${c.change >= 0 ? '+' : ''}${c.change}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    addAsset() {
        const type = prompt("Asset Type (stock/crypto):", "stock");
        if (type !== 'stock' && type !== 'crypto') return;

        const symbol = prompt("Symbol (e.g., GOOGL):");
        if (!symbol) return;

        const name = prompt("Company/Asset Name:");
        const shares = parseFloat(prompt("Quantity Owned:"));
        const price = parseFloat(prompt("Current Price per unit:"));

        if (isNaN(shares) || isNaN(price)) {
            alert("Invalid numbers.");
            return;
        }

        const portfolio = MoneyDB.getPortfolio();
        const asset = {
            symbol: symbol.toUpperCase(),
            name,
            shares,
            currentPrice: price,
            change: (Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1)).toFixed(2)
        };

        if (type === 'stock') portfolio.stocks.push(asset);
        else portfolio.crypto.push(asset);

        MoneyDB.save({ ...MoneyDB.get(), portfolio: portfolio });

        InvestmentsView.destroyCharts();
        document.getElementById('view-container').innerHTML = this.render();
        if (typeof InvestmentsView.afterRender === 'function') {
            setTimeout(() => InvestmentsView.afterRender(), 50);
        }
    },

    destroyCharts() {
        Object.keys(this._charts).forEach(key => {
            if (this._charts[key]) {
                this._charts[key].destroy();
                this._charts[key] = null;
            }
        });
    },

    afterRender() {
        if (typeof Chart === 'undefined') return;

        this.destroyCharts();

        const portfolio = MoneyDB.getPortfolio();
        if (!portfolio) return;

        const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'rgba(255, 255, 255, 0.7)';
        const textColor = getCSSVar('--text-primary');

        let totalStocks = 0, totalCrypto = 0;
        (portfolio.stocks || []).forEach(s => totalStocks += (s.currentPrice * s.shares));
        (portfolio.crypto || []).forEach(c => totalCrypto += (c.currentPrice * c.shares));
        const cashValue = 12450;

        const c1 = getCSSVar('--color-primary') || '#2563eb';
        const c2 = getCSSVar('--color-secondary') || '#8b5cf6';
        const c3 = getCSSVar('--color-accent') || '#e11d48';

        // Chart 1: Asset Allocation Doughnut
        const canvas1 = document.getElementById('investmentsChartCanvas');
        if (canvas1) {
            this._charts.allocation = new Chart(canvas1, {
                type: 'doughnut',
                data: {
                    labels: ['Stocks', 'Crypto', 'Cash'],
                    datasets: [{
                        data: [totalStocks, totalCrypto, cashValue],
                        backgroundColor: [c1, c2, c3],
                        borderWidth: 2,
                        borderColor: getCSSVar('--bg-card')
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '65%',
                    plugins: {
                        legend: { position: 'right', labels: { color: textColor, font: { size: 11 } } },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const val = context.parsed;
                                    const sum = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const pct = ((val / sum) * 100).toFixed(1);
                                    return context.label + ': $' + val.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' (' + pct + '%)';
                                }
                            }
                        }
                    }
                }
            });
        }

        // Chart 2: Portfolio Performance Line (simulated 6 months)
        const canvas2 = document.getElementById('portfolioPerfCanvas');
        if (canvas2) {
            const ctx2 = canvas2.getContext('2d');
            const total = totalStocks + totalCrypto + cashValue;
            const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
            const baseGrowth = [0.85, 0.88, 0.92, 0.95, 0.98, 1.0];
            const portfolioValues = baseGrowth.map(g => total * g);
            // Use deterministic multipliers instead of Math.random() for consistent charts
            const stockMultipliers = [0.97, 1.01, 0.99, 1.03, 0.98, 1.02];
            const cryptoMultipliers = [0.90, 1.05, 0.95, 1.10, 0.88, 1.08];
            const stockValues = baseGrowth.map((g, i) => totalStocks * g * stockMultipliers[i]);
            const cryptoValues = baseGrowth.map((g, i) => totalCrypto * g * cryptoMultipliers[i]);

            const grad1 = ctx2.createLinearGradient(0, 0, 0, 280);
            grad1.addColorStop(0, ChartsModule._toRGBA(c1, 0.27));
            grad1.addColorStop(1, 'transparent');

            const grad2 = ctx2.createLinearGradient(0, 0, 0, 280);
            grad2.addColorStop(0, ChartsModule._toRGBA(c2, 0.27));
            grad2.addColorStop(1, 'transparent');

            this._charts.performance = new Chart(canvas2, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [
                        { label: 'Total', data: portfolioValues, borderColor: getCSSVar('--color-success'), backgroundColor: 'transparent', tension: 0.4, borderWidth: 3, pointRadius: 4, pointBackgroundColor: getCSSVar('--color-success') },
                        { label: 'Stocks', data: stockValues, borderColor: c1, backgroundColor: grad1, fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: c1 },
                        { label: 'Crypto', data: cryptoValues, borderColor: c2, backgroundColor: grad2, fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: c2 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
                    plugins: { legend: { position: 'top', labels: { color: textColor, font: { size: 11 }, usePointStyle: true } }, tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': $' + ctx.parsed.y.toLocaleString(undefined, { maximumFractionDigits: 0 }) } } },
                    scales: { x: { ticks: { color: textColor }, grid: { display: false } }, y: { beginAtZero: false, ticks: { color: textColor, callback: v => '$' + (v / 1000).toFixed(0) + 'k' }, grid: { color: getCSSVar('--border-color') + '33' } } }
                }
            });
        }
    }
};
