window.TradingView = {
    _charts: {},
    _positions: [
        { symbol: 'TSLA', type: 'LONG', entry: 210.00, current: 215.30, qty: 5 },
        { symbol: 'BTC', type: 'SHORT', entry: 35000, current: 34500, qty: 0.1 },
        { symbol: 'AAPL', type: 'LONG', entry: 165.00, current: 173.50, qty: 10 },
        { symbol: 'ETH', type: 'LONG', entry: 1600.00, current: 1850.00, qty: 2.5 }
    ],

    render() {
        const positions = this._positions;
        const totalPL = positions.reduce((acc, p) => {
            const pl = p.type === 'LONG' ? (p.current - p.entry) * p.qty : (p.entry - p.current) * p.qty;
            return acc + pl;
        }, 0);

        return `
            <div class="dashboard-header" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                   <h2 style="font-size: 1.5rem;">Virtual Trading Arena</h2>
                   <p style="margin: 0;">Practice trading with virtual money. No risk.</p>
                </div>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div class="badge badge-warning" style="font-size: 1rem; padding: 0.5rem 1rem;">
                        <i class="fa-solid fa-coins"></i> Virtual Balance: $50,000.00
                    </div>
                    <div class="badge ${totalPL >= 0 ? 'badge-success' : ''}" style="font-size: 1rem; padding: 0.5rem 1rem; background: ${totalPL >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)'}; color: ${totalPL >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
                        <i class="fa-solid ${totalPL >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i> P/L: ${totalPL >= 0 ? '+' : ''}$${totalPL.toFixed(2)}
                    </div>
                </div>
            </div>

            <div class="grid-3" style="grid-template-columns: 2fr 1fr; margin-bottom: 2rem;">
                <!-- Live Chart (replacing static image) -->
                <div class="card" style="border-radius: 20px;">
                     <div class="card-header">
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <h3 class="card-title"><i class="fa-solid fa-chart-area text-primary"></i> AAPL / USD</h3>
                            <span class="badge badge-success">+1.25%</span>
                        </div>
                        <div class="actions">
                             <button class="btn btn-sm btn-secondary" onclick="TradingView.setTimeframe('1D')">1D</button>
                             <button class="btn btn-sm btn-secondary" onclick="TradingView.setTimeframe('1W')">1W</button>
                             <button class="btn btn-sm btn-primary" onclick="TradingView.setTimeframe('1M')">1M</button>
                        </div>
                    </div>
                    <div style="height: 300px; position: relative; padding: 0.5rem;">
                        <canvas id="tradingPriceChart"></canvas>
                    </div>
                </div>

                <!-- Execution Desk -->
                <div class="card" style="border-radius: 20px;">
                    <h3 class="card-title" style="margin-bottom: 1rem;">Virtual Execution Desk</h3>
                    
                    <div style="margin-bottom: 1rem;">
                         <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-secondary);">Asset Symbol</label>
                         <div style="width: 100%; border: 1px solid var(--border-subtle); display: flex; align-items: center; padding: 0.5rem 0.75rem; border-radius: 10px; background: rgba(var(--color-primary-rgb), 0.05);">
                            <i class="fa-solid fa-search" style="margin-right: 0.5rem; color: var(--color-primary);"></i>
                            <input type="text" id="trade-symbol" value="AAPL" onchange="TradingView.updateEstimate()" style="border: none; background: transparent; color: var(--text-primary); width: 100%; outline: none; font-size: 1rem;">
                         </div>
                    </div>

                    <div style="margin-bottom: 1rem;">
                         <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-secondary);">Shares / Amount</label>
                         <input type="number" id="trade-qty" value="10" oninput="TradingView.updateEstimate()" style="width: 100%; padding: 0.75rem; border-radius: 10px; background: var(--bg-input); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 1rem; box-sizing: border-box;">
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                        <span>Current Market Price:</span>
                        <span id="market-price-disp" style="color: var(--text-primary); font-weight: 600;">$173.50</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; font-size: 0.95rem; color: var(--text-secondary); border-top: 1px solid var(--border-subtle); padding-top: 0.5rem;">
                        <span>Estimated Value:</span>
                        <span id="est-value-disp" style="color: var(--color-primary); font-weight: 700;">$1,735.00</span>
                    </div>

                    <div class="grid-2" style="gap: 1rem;">
                        <button class="btn" onclick="TradingView.executeTrade('BUY')" style="background: rgba(16, 185, 129, 0.1); color: var(--color-success); border: 1px solid rgba(16, 185, 129, 0.3); width: 100%; font-weight: 600; padding: 0.75rem; border-radius: 10px; cursor: pointer;">Buy (Long)</button>
                        <button class="btn" onclick="TradingView.executeTrade('SELL')" style="background: rgba(244, 63, 94, 0.1); color: var(--color-danger); border: 1px solid rgba(244, 63, 94, 0.3); width: 100%; font-weight: 600; padding: 0.75rem; border-radius: 10px; cursor: pointer;">Sell (Short)</button>
                    </div>
                </div>
            </div>

            <!-- P/L Distribution Chart (NEW) -->
            <div class="grid-2" style="margin-bottom: 2rem; gap: 1.5rem;">
                <div class="card" style="border-radius: 20px;">
                    <div class="card-header"><h3 class="card-title"><i class="fa-solid fa-chart-bar text-success"></i> P/L Distribution</h3></div>
                    <div style="padding: 1rem; position: relative; height: 250px;">
                        <canvas id="tradingPLChart"></canvas>
                    </div>
                </div>
                <div class="card" style="border-radius: 20px;">
                    <div class="card-header"><h3 class="card-title"><i class="fa-solid fa-chart-pie text-warning"></i> Position Allocation</h3></div>
                    <div style="padding: 1rem; position: relative; height: 250px; display: flex; justify-content: center;">
                        <canvas id="tradingAllocChart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="card" style="border-radius: 20px;">
                <div class="card-header"><h3 class="card-title"><i class="fa-solid fa-list-check text-primary"></i> Open Positions</h3></div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr><th>Symbol</th><th>Type</th><th>Qty</th><th>Entry Price</th><th>Current Price</th><th style="text-align: right;">P/L</th></tr>
                        </thead>
                        <tbody>
                            ${positions.map(p => {
                                const pl = p.type === 'LONG' ? (p.current - p.entry) * p.qty : (p.entry - p.current) * p.qty;
                                return `
                                <tr>
                                    <td style="font-weight: 600;">${p.symbol}</td>
                                    <td class="${p.type === 'LONG' ? 'text-success' : 'text-danger'}">${p.type}</td>
                                    <td>${p.qty}</td>
                                    <td>$${p.entry.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td>$${p.current.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td style="text-align: right; font-weight: 600;" class="${pl >= 0 ? 'text-success' : 'text-danger'}">${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}</td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    currentPrice: 173.50,

    setTimeframe(tf) {
        ViewUtils.showToast(`Switched to ${tf} timeframe`, 'info');
    },

    updateEstimate() {
        const qtyStr = document.getElementById('trade-qty').value;
        const qty = parseFloat(qtyStr) || 0;
        const estValue = qty * this.currentPrice;
        document.getElementById('est-value-disp').innerText = '$' + estValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    executeTrade(type) {
        const symbol = document.getElementById('trade-symbol').value.toUpperCase();
        const qty = document.getElementById('trade-qty').value;
        if (!symbol || !qty || parseFloat(qty) <= 0) {
            ViewUtils.showToast('Please enter a valid symbol and quantity.', 'error');
            return;
        }

        const estValue = (parseFloat(qty) * this.currentPrice);
        ViewUtils.showToast(`Virtual ${type} order executed for ${qty} ${symbol} at $${estValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`, 'success');
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

        const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'rgba(255, 255, 255, 0.7)';
        const textColor = getCSSVar('--text-primary');

        // Price Chart (replacing static image)
        const priceCanvas = document.getElementById('tradingPriceChart');
        if (priceCanvas) {
            const ctx = priceCanvas.getContext('2d');
            const grad = ctx.createLinearGradient(0, 0, 0, 300);
            grad.addColorStop(0, (getCSSVar('--color-primary') || '#0a84ff') + '44');
            grad.addColorStop(1, 'transparent');

            // Simulated 30-day AAPL price
            const basePrice = 165;
            const priceData = [];
            const labels = [];
            for (let i = 30; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                const variance = Math.sin(i * 0.3) * 5 + Math.random() * 3;
                priceData.push(basePrice + (30 - i) * 0.28 + variance);
            }

            this._charts.price = new Chart(priceCanvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'AAPL', data: priceData, borderColor: getCSSVar('--color-primary'), backgroundColor: grad,
                        fill: true, tension: 0.3, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: getCSSVar('--color-primary')
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => 'AAPL: $' + ctx.parsed.y.toFixed(2) } } },
                    scales: { x: { ticks: { color: textColor, maxTicksLimit: 8 }, grid: { display: false } }, y: { ticks: { color: textColor, callback: v => '$' + v.toFixed(0) }, grid: { color: getCSSVar('--border-color') + '22' } } }
                }
            });
        }

        // P/L Distribution Bar
        const plCanvas = document.getElementById('tradingPLChart');
        if (plCanvas) {
            const positions = this._positions;
            const labels = positions.map(p => p.symbol);
            const plData = positions.map(p => {
                return p.type === 'LONG' ? (p.current - p.entry) * p.qty : (p.entry - p.current) * p.qty;
            });
            const bgColors = plData.map(v => v >= 0 ? (getCSSVar('--color-success') || '#22c55e') + 'CC' : (getCSSVar('--color-danger') || '#ef4444') + 'CC');

            this._charts.pl = new Chart(plCanvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{ label: 'P/L ($)', data: plData, backgroundColor: bgColors, borderWidth: 0, borderRadius: 8, barPercentage: 0.5 }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => (ctx.parsed.y >= 0 ? '+' : '') + '$' + ctx.parsed.y.toFixed(2) } } },
                    scales: { x: { ticks: { color: textColor }, grid: { display: false } }, y: { ticks: { color: textColor, callback: v => '$' + v }, grid: { color: getCSSVar('--border-color') + '33' } } }
                }
            });
        }

        // Position Allocation Pie
        const allocCanvas = document.getElementById('tradingAllocChart');
        if (allocCanvas) {
            const positions = this._positions;
            const labels = positions.map(p => p.symbol);
            const values = positions.map(p => p.current * p.qty);
            const c1 = getCSSVar('--color-primary'), c2 = getCSSVar('--color-success'), c3 = getCSSVar('--color-warning'), c4 = getCSSVar('--color-secondary');

            this._charts.alloc = new Chart(allocCanvas, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{ data: values, backgroundColor: [c1, c2, c3, c4], borderWidth: 2, borderColor: getCSSVar('--bg-card') }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '60%',
                    plugins: {
                        legend: { position: 'right', labels: { color: textColor, font: { size: 11 } } },
                        tooltip: { callbacks: { label: ctx => ctx.label + ': $' + ctx.parsed.toLocaleString(undefined, { minimumFractionDigits: 2 }) } }
                    }
                }
            });
        }
    }
};
