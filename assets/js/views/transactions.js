window.TransactionsView = {
    _charts: {},

    render() {
        try {
            const txs = MoneyDB.getTransactions();
            const user = MoneyDB.getUser();

            if (!txs || txs.length === 0) {
                return `
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <h3 class="card-title">All Transactions</h3>
                                <p style="font-size: 0.85rem; margin: 0;">Manage your income and expenses</p>
                            </div>
                            <button class="btn btn-primary" onclick="TransactionsView.showAddForm()"><i class="fa-solid fa-plus"></i> Add New</button>
                        </div>
                        <div style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                            <i class="fa-solid fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                            <p>No transactions yet. Start by adding your first transaction!</p>
                            <button class="btn btn-secondary" onclick="TransactionsView.showAddForm()" style="margin-top: 1rem;">
                                Add Transaction
                            </button>
                        </div>
                    </div>
                    ${TransactionsView.getFormHTML()}
                `;
            }

            // Calculate analytics
            let totalIncome = 0, totalExpense = 0;
            const categories = {};
            const dailySpending = {};
            const monthlyData = {};

            txs.forEach(tx => {
                if (tx.type === 'income') {
                    totalIncome += Math.abs(tx.amount);
                } else {
                    totalExpense += Math.abs(tx.amount);
                    categories[tx.category] = (categories[tx.category] || 0) + Math.abs(tx.amount);
                }
                // Daily spending (last 14 days)
                const d = new Date(tx.date);
                const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (!dailySpending[dateKey]) dailySpending[dateKey] = { income: 0, expense: 0 };
                if (tx.type === 'income') dailySpending[dateKey].income += Math.abs(tx.amount);
                else dailySpending[dateKey].expense += Math.abs(tx.amount);

                // Monthly data
                const monthKey = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                if (!monthlyData[monthKey]) monthlyData[monthKey] = { income: 0, expense: 0 };
                if (tx.type === 'income') monthlyData[monthKey].income += Math.abs(tx.amount);
                else monthlyData[monthKey].expense += Math.abs(tx.amount);
            });

            const netFlow = totalIncome - totalExpense;
            const savingsRate = totalIncome > 0 ? ((netFlow / totalIncome) * 100).toFixed(1) : 0;

            return `
                <!-- Summary Stats -->
                <div class="grid-4" style="margin-bottom: 2rem; gap: 1rem;">
                    <div class="card stat-card">
                        <div class="stat-header"><i class="fa-solid fa-arrow-down text-success"></i> Total Income</div>
                        <div class="stat-value">${ViewUtils.formatCurrency(totalIncome)}</div>
                    </div>
                    <div class="card stat-card">
                        <div class="stat-header"><i class="fa-solid fa-arrow-up text-danger"></i> Total Expenses</div>
                        <div class="stat-value">${ViewUtils.formatCurrency(totalExpense)}</div>
                    </div>
                    <div class="card stat-card">
                        <div class="stat-header"><i class="fa-solid fa-scale-balanced text-primary"></i> Net Flow</div>
                        <div class="stat-value" style="color: ${netFlow >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">${ViewUtils.formatCurrency(netFlow)}</div>
                    </div>
                    <div class="card stat-card">
                        <div class="stat-header"><i class="fa-solid fa-piggy-bank text-warning"></i> Savings Rate</div>
                        <div class="stat-value">${savingsRate}%</div>
                    </div>
                </div>

                <!-- Analytics Charts Row 1 -->
                <div class="grid-2" style="margin-bottom: 2rem; gap: 1.5rem;">
                    <div class="card" style="border-radius: 20px;">
                        <div class="card-header"><h3 class="card-title"><i class="fa-solid fa-chart-bar text-success"></i> Income vs Expenses</h3></div>
                        <div style="padding: 1rem; position: relative; height: 220px;"><canvas id="txMiniChart"></canvas></div>
                    </div>
                    <div class="card" style="border-radius: 20px;">
                        <div class="card-header"><h3 class="card-title"><i class="fa-solid fa-chart-pie text-warning"></i> Spending by Category</h3></div>
                        <div style="padding: 1rem; position: relative; height: 220px;"><canvas id="txCategoryChart"></canvas></div>
                    </div>
                </div>

                <!-- Analytics Charts Row 2 -->
                <div class="grid-2" style="margin-bottom: 2rem; gap: 1.5rem;">
                    <div class="card" style="border-radius: 20px;">
                        <div class="card-header"><h3 class="card-title"><i class="fa-solid fa-chart-line text-primary"></i> Daily Cash Flow</h3></div>
                        <div style="padding: 1rem; position: relative; height: 220px;"><canvas id="txDailyChart"></canvas></div>
                    </div>
                    <div class="card" style="border-radius: 20px;">
                        <div class="card-header"><h3 class="card-title"><i class="fa-solid fa-chart-area text-secondary"></i> Monthly Comparison</h3></div>
                        <div style="padding: 1rem; position: relative; height: 220px;"><canvas id="txMonthlyChart"></canvas></div>
                    </div>
                </div>

                <div class="card" style="display: flex; flex-direction: column; border-radius: 20px;">
                    <div class="card-header" style="flex-shrink: 0;">
                        <div>
                            <h3 class="card-title">All Transactions</h3>
                            <p style="font-size: 0.85rem; margin: 0;">Total: ${txs.length} transactions</p>
                        </div>
                        <div class="actions" style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-sm btn-primary" onclick="TransactionsView.showAddForm()"><i class="fa-solid fa-plus"></i> Add New</button>
                        </div>
                    </div>

                    <div class="table-container" style="flex: 1; overflow-y: auto; max-height: 500px;">
                        <table style="width: 100%;">
                            <thead style="position: sticky; top: 0; background: var(--bg-card); z-index: 10;">
                                <tr>
                                    <th>Transaction</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th style="text-align: right;">Amount</th>
                                    <th style="text-align: center;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${txs.map(tx => `
                                    <tr>
                                        <td>
                                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                                <div style="width: 36px; height: 36px; border-radius: 50%; background: ${tx.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)'}; display: flex; align-items: center; justify-content: center; color: ${tx.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)'};">
                                                    <i class="${tx.icon} text-secondary"></i>
                                                </div>
                                                <span style="font-weight: 500;">${tx.title}</span>
                                            </div>
                                        </td>
                                        <td><span class="badge ${tx.type === 'income' ? 'badge-success' : 'badge-warning'}">${tx.category}</span></td>
                                        <td style="font-size: 0.9rem; color: var(--text-secondary);">${ViewUtils.formatDate(tx.date)}</td>
                                        <td style="text-align: right;">
                                            <div class="amount" style="color: ${tx.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: 600;">
                                                ${tx.type === 'income' ? '+' : '-'}${ViewUtils.formatCurrency(Math.abs(tx.amount))}
                                            </div>
                                        </td>
                                        <td style="text-align: center;">
                                            <button class="icon-btn" style="width: 32px; height: 32px;" onclick="TransactionsView.deleteTransaction(${tx.id})" title="Delete"><i class="fa-solid fa-trash-alt" style="font-size: 0.8rem;"></i></button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                ${TransactionsView.getFormHTML()}
            `;
        } catch (error) {
            console.error('Transactions View Error:', error);
            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fa-solid fa-triangle-exclamation"></i> Error Loading Transactions</h3>
                    </div>
                    <div style="padding: 2rem; color: var(--color-danger);">
                        <p>${error.message}</p>
                        <button class="btn btn-secondary" onclick="location.reload()" style="margin-top: 1rem;">Reload Page</button>
                    </div>
                </div>
            `;
        }
    },

    getFormHTML() {
        const categories = ['General', 'Food', 'Shopping', 'Transport', 'Entertainment', 'Bills', 'Health', 'Education', 'Income', 'Freelance', 'Salary', 'Investment'];
        return `
            <div id="tx-modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 9999; justify-content: center; align-items: center;" onclick="if(event.target===this) TransactionsView.hideAddForm()">
                <div style="background: var(--bg-card); border-radius: 20px; padding: 2rem; width: 90%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border: 1px solid var(--border-subtle);" onclick="event.stopPropagation()">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h2 style="margin: 0; font-size: 1.4rem; font-weight: 700;">Add Transaction</h2>
                        <button type="button" onclick="TransactionsView.hideAddForm()" style="border: none; background: rgba(255,255,255,0.05); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary); font-size: 1.2rem;">×</button>
                    </div>
                    <form onsubmit="TransactionsView.addTransaction(event)">
                        <!-- Type Toggle -->
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: var(--text-secondary);">Type</label>
                            <div style="display: flex; gap: 0.5rem;">
                                <button type="button" id="tx-type-expense" class="btn btn-sm" onclick="TransactionsView.setType('expense')" style="flex: 1; background: rgba(244,63,94,0.15); color: var(--color-danger); border: 2px solid var(--color-danger);">
                                    <i class="fa-solid fa-arrow-up"></i> Expense
                                </button>
                                <button type="button" id="tx-type-income" class="btn btn-sm" onclick="TransactionsView.setType('income')" style="flex: 1; background: rgba(16,185,129,0.05); color: var(--text-secondary); border: 2px solid transparent;">
                                    <i class="fa-solid fa-arrow-down"></i> Income
                                </button>
                            </div>
                            <input type="hidden" id="tx-type-input" value="expense">
                        </div>
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: var(--text-secondary);">Title</label>
                            <input type="text" id="tx-title-input" placeholder="e.g., Coffee at Starbucks" required style="width: 100%; padding: 0.85rem 1rem; border: 1px solid var(--border-subtle); border-radius: 10px; font-size: 1rem; box-sizing: border-box; background: var(--bg-input); color: var(--text-primary);">
                        </div>
                        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                            <div style="flex: 1;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: var(--text-secondary);">Amount ($)</label>
                                <input type="number" id="tx-amount-input" placeholder="0.00" step="0.01" min="0.01" required style="width: 100%; padding: 0.85rem 1rem; border: 1px solid var(--border-subtle); border-radius: 10px; font-size: 1rem; box-sizing: border-box; background: var(--bg-input); color: var(--text-primary);">
                            </div>
                            <div style="flex: 1;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: var(--text-secondary);">Date</label>
                                <input type="date" id="tx-date-input" required style="width: 100%; padding: 0.85rem 1rem; border: 1px solid var(--border-subtle); border-radius: 10px; font-size: 1rem; box-sizing: border-box; background: var(--bg-input); color: var(--text-primary);">
                            </div>
                        </div>
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: var(--text-secondary);">Category</label>
                            <select id="tx-category-input" required style="width: 100%; padding: 0.85rem 1rem; border: 1px solid var(--border-subtle); border-radius: 10px; font-size: 1rem; box-sizing: border-box; background: var(--bg-input); color: var(--text-primary);">
                                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <button type="button" onclick="TransactionsView.hideAddForm()" class="btn btn-secondary" style="flex: 1; padding: 0.85rem;">Cancel</button>
                            <button type="submit" class="btn btn-primary" style="flex: 1; padding: 0.85rem;">Add Transaction</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    _selectedType: 'expense',

    setType(type) {
        this._selectedType = type;
        document.getElementById('tx-type-input').value = type;
        const expBtn = document.getElementById('tx-type-expense');
        const incBtn = document.getElementById('tx-type-income');
        if (type === 'expense') {
            expBtn.style.background = 'rgba(244,63,94,0.15)';
            expBtn.style.borderColor = 'var(--color-danger)';
            expBtn.style.color = 'var(--color-danger)';
            incBtn.style.background = 'rgba(16,185,129,0.05)';
            incBtn.style.borderColor = 'transparent';
            incBtn.style.color = 'var(--text-secondary)';
        } else {
            incBtn.style.background = 'rgba(16,185,129,0.15)';
            incBtn.style.borderColor = 'var(--color-success)';
            incBtn.style.color = 'var(--color-success)';
            expBtn.style.background = 'rgba(244,63,94,0.05)';
            expBtn.style.borderColor = 'transparent';
            expBtn.style.color = 'var(--text-secondary)';
        }
    },

    showAddForm() {
        const overlay = document.getElementById('tx-modal-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            // Set date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('tx-date-input').value = today;
            this._selectedType = 'expense';
            document.getElementById('tx-type-input').value = 'expense';
            document.getElementById('tx-title-input').focus();
        }
    },

    hideAddForm() {
        const overlay = document.getElementById('tx-modal-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    },

    addTransaction(event) {
        event.preventDefault();

        const title = document.getElementById('tx-title-input').value.trim();
        const amount = parseFloat(document.getElementById('tx-amount-input').value);
        const category = document.getElementById('tx-category-input').value;
        const date = document.getElementById('tx-date-input').value;
        const type = document.getElementById('tx-type-input').value;

        if (!title || isNaN(amount) || amount <= 0) {
            ViewUtils.showToast('Please fill all fields correctly', 'error');
            return;
        }

        const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

        const newTx = {
            title,
            amount: finalAmount,
            category,
            type,
            date: date || new Date().toISOString(),
            icon: type === 'income' ? 'fa-solid fa-arrow-down' : 'fa-solid fa-arrow-up'
        };

        try {
            MoneyDB.addTransaction(newTx);
            ViewUtils.showToast('Transaction added!', 'success');
            TransactionsView.hideAddForm();

            // Refresh live stats from API
            MoneyDB.getLiveStats().catch(err => console.log('Could not update live stats:', err));

            // Destroy existing charts before re-render
            TransactionsView.destroyCharts();

            // Update view and redraw charts
            document.getElementById('view-container').innerHTML = TransactionsView.render();
            if (typeof TransactionsView.afterRender === 'function') {
                setTimeout(() => TransactionsView.afterRender(), 50);
            }
        } catch (error) {
            console.error(error);
            ViewUtils.showToast('Error adding transaction', 'error');
        }
    },

    deleteTransaction(id) {
        if (!confirm('Delete this transaction?')) return;

        try {
            const db = MoneyDB.get();
            db.transactions = db.transactions.filter(tx => tx.id !== id);
            MoneyDB.save(db);
            ViewUtils.showToast('Transaction deleted!', 'success');

            TransactionsView.destroyCharts();
            document.getElementById('view-container').innerHTML = TransactionsView.render();
            if (typeof TransactionsView.afterRender === 'function') {
                setTimeout(() => TransactionsView.afterRender(), 50);
            }
        } catch (error) {
            ViewUtils.showToast('Error deleting transaction', 'error');
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

        const txs = MoneyDB.getTransactions();
        if (!txs || txs.length === 0) return;

        // Destroy previous chart instances
        this.destroyCharts();

        const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'rgba(255, 255, 255, 0.7)';
        const textColor = getCSSVar('--text-primary');
        const gridColor = getCSSVar('--border-color');

        let totalIncome = 0, totalExpense = 0;
        const categories = {};
        const dailyMap = {};
        const monthlyMap = {};

        txs.forEach(tx => {
            if (tx.type === 'income') {
                totalIncome += Math.abs(tx.amount);
            } else {
                totalExpense += Math.abs(tx.amount);
                categories[tx.category] = (categories[tx.category] || 0) + Math.abs(tx.amount);
            }
            const d = new Date(tx.date);
            const dayKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!dailyMap[dayKey]) dailyMap[dayKey] = { income: 0, expense: 0 };
            if (tx.type === 'income') dailyMap[dayKey].income += Math.abs(tx.amount);
            else dailyMap[dayKey].expense += Math.abs(tx.amount);

            const monthKey = d.toLocaleDateString('en-US', { month: 'short' });
            if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { income: 0, expense: 0 };
            if (tx.type === 'income') monthlyMap[monthKey].income += Math.abs(tx.amount);
            else monthlyMap[monthKey].expense += Math.abs(tx.amount);
        });

        // Chart 1: Income vs Expense Bar
        const canvas1 = document.getElementById('txMiniChart');
        if (canvas1) {
            const ctx1 = canvas1.getContext('2d');
            const incGrad = ctx1.createLinearGradient(0, 0, 0, 220);
            incGrad.addColorStop(0, getCSSVar('--color-success') || '#22c55e');
            incGrad.addColorStop(1, (getCSSVar('--color-success') || '#22c55e') + '44');

            const expGrad = ctx1.createLinearGradient(0, 0, 0, 220);
            expGrad.addColorStop(0, getCSSVar('--color-danger') || '#ef4444');
            expGrad.addColorStop(1, (getCSSVar('--color-danger') || '#ef4444') + '44');

            this._charts.mini = new Chart(canvas1, {
                type: 'bar',
                data: {
                    labels: ['Income', 'Expenses', 'Net'],
                    datasets: [{
                        data: [totalIncome, totalExpense, totalIncome - totalExpense],
                        backgroundColor: [incGrad, expGrad, getCSSVar('--color-primary')],
                        borderWidth: 0,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => '$' + ctx.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2 }) } } },
                    scales: { x: { ticks: { color: textColor }, grid: { display: false } }, y: { ticks: { color: textColor }, grid: { color: gridColor + '33' } } }
                }
            });
        }

        // Chart 2: Category Doughnut
        const sortedCats = Object.keys(categories).sort((a, b) => categories[b] - categories[a]).slice(0, 6);
        const catData = sortedCats.map(c => categories[c]);
        const canvas2 = document.getElementById('txCategoryChart');
        if (canvas2 && sortedCats.length > 0) {
            const c1 = getCSSVar('--color-primary'), c2 = getCSSVar('--color-secondary'), c3 = getCSSVar('--color-accent'), c4 = getCSSVar('--color-warning'), c5 = getCSSVar('--color-success');
            this._charts.category = new Chart(canvas2, {
                type: 'doughnut',
                data: {
                    labels: sortedCats,
                    datasets: [{ data: catData, backgroundColor: [c1, c2, c3, c4, c5, '#a855f7'], borderWidth: 2, borderColor: getCSSVar('--bg-card') }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right', labels: { color: textColor, font: { size: 11 } } },
                        tooltip: { callbacks: { label: ctx => { const sum = ctx.dataset.data.reduce((a, b) => a + b, 0); return ctx.label + ': $' + ctx.parsed.toFixed(2) + ' (' + ((ctx.parsed / sum) * 100).toFixed(1) + '%)'; } } }
                    }
                }
            });
        }

        // Chart 3: Daily Cash Flow Line
        const dailyLabels = Object.keys(dailyMap).slice(-10);
        const dailyIncome = dailyLabels.map(k => dailyMap[k].income);
        const dailyExpense = dailyLabels.map(k => dailyMap[k].expense);
        const canvas3 = document.getElementById('txDailyChart');
        if (canvas3 && dailyLabels.length > 0) {
            const ctx3 = canvas3.getContext('2d');
            const incFill = ctx3.createLinearGradient(0, 0, 0, 220);
            incFill.addColorStop(0, (getCSSVar('--color-success') || '#22c55e') + '55');
            incFill.addColorStop(1, 'transparent');
            const expFill = ctx3.createLinearGradient(0, 0, 0, 220);
            expFill.addColorStop(0, (getCSSVar('--color-danger') || '#ef4444') + '55');
            expFill.addColorStop(1, 'transparent');

            this._charts.daily = new Chart(canvas3, {
                type: 'line',
                data: {
                    labels: dailyLabels,
                    datasets: [
                        { label: 'Income', data: dailyIncome, borderColor: getCSSVar('--color-success'), backgroundColor: incFill, fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: getCSSVar('--color-success') },
                        { label: 'Expense', data: dailyExpense, borderColor: getCSSVar('--color-danger'), backgroundColor: expFill, fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: getCSSVar('--color-danger') }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
                    plugins: { legend: { position: 'top', labels: { color: textColor, font: { size: 11 }, usePointStyle: true } } },
                    scales: { x: { ticks: { color: textColor }, grid: { display: false } }, y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor + '33' } } }
                }
            });
        }

        // Chart 4: Monthly Comparison
        const monthLabels = Object.keys(monthlyMap);
        const monthIncome = monthLabels.map(k => monthlyMap[k].income);
        const monthExpense = monthLabels.map(k => monthlyMap[k].expense);
        const canvas4 = document.getElementById('txMonthlyChart');
        if (canvas4 && monthLabels.length > 0) {
            this._charts.monthly = new Chart(canvas4, {
                type: 'bar',
                data: {
                    labels: monthLabels,
                    datasets: [
                        { label: 'Income', data: monthIncome, backgroundColor: getCSSVar('--color-success') + 'CC', borderRadius: 6, barPercentage: 0.6 },
                        { label: 'Expense', data: monthExpense, backgroundColor: getCSSVar('--color-danger') + 'CC', borderRadius: 6, barPercentage: 0.6 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'top', labels: { color: textColor, font: { size: 11 }, usePointStyle: true } } },
                    scales: { x: { ticks: { color: textColor }, grid: { display: false } }, y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor + '33' } } }
                }
            });
        }
    }
};
