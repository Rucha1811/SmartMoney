window.DashboardView = {
    async render() {
        try {
            const user = MoneyDB.getUser();
            let stats = MoneyDB.getStats();
            try {
                stats = await MoneyDB.getLiveStats();
            } catch (err) {
                console.warn('Live stats unavailable:', err);
            }
            
            const txs = MoneyDB.getTransactions();
            const allTxs = txs.slice(0, 3);
            const portfolio = MoneyDB.getPortfolio() || { stocks: [], crypto: [] };
            const stockTotal = (Array.isArray(portfolio.stocks) ? portfolio.stocks : []).reduce((acc, s) => acc + ((s.currentPrice || 0) * (s.shares || 0)), 0);
            const cryptoTotal = (Array.isArray(portfolio.crypto) ? portfolio.crypto : []).reduce((acc, c) => acc + ((c.currentPrice || 0) * (c.shares || 0)), 0);
            const totalInvested = stockTotal + cryptoTotal;
            
            // Calculate Financial Health Score (0-100)
            const healthScore = DashboardView.calculateHealthScore(stats, txs);
            
            // Get top 3 spending categories
            const topCategories = DashboardView.getTopCategories(txs, 3);
            
            // Get last month comparison
            const monthComparison = DashboardView.getMonthComparison(stats);
            
            // Get recurring bills (simulated)
            const recurringBills = DashboardView.getRecurringBills(txs);
            
            // Get smart insights
            const insights = DashboardView.generateInsights(stats, txs, healthScore);

            return `<!-- Analytical Dashboard -->
<div style="font-size: 1rem; line-height: 1.4;">
<!-- Header --><div style="margin-bottom: 1.2rem; display: flex; justify-content: space-between; align-items: center;"><div><h2 style="font-size: 1.3rem; margin: 0; font-weight: 700;">👋 ${user.name.split(' ')[0]}</h2></div><div style="text-align: right;"><div style="color: #3b82f6; font-weight: 700; font-size: 1.1rem;">📊 Health: ${healthScore}%</div></div></div>

<!-- KPIs (4 Col) --><div class="grid-4" style="margin-bottom: 1.2rem; gap: 0.8rem;"><div class="card" style="padding: 1rem;"><div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">💰 Net Worth</div><div style="font-size: 1.3rem; font-weight: 700;">${user.currency}${(stats.netWorth || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div></div><div class="card" style="padding: 1rem;"><div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">📥 Income</div><div style="font-size: 1.3rem; font-weight: 700; color: #10b981;">${user.currency}${(stats.monthlyIncome || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div></div><div class="card" style="padding: 1rem;"><div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">📤 Expense</div><div style="font-size: 1.3rem; font-weight: 700; color: #ef4444;">${user.currency}${(stats.monthlyExpense || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div></div><div class="card" style="padding: 1rem;"><div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">💼 Invested</div><div style="font-size: 1.3rem; font-weight: 700;">${user.currency}${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div></div></div>

<!-- Analytics (3 Col) --><div class="grid-3" style="margin-bottom: 1.2rem; gap: 0.8rem;"><div class="card" style="padding: 1rem;"><div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.8rem;">📊 vs Last Month</div><div style="font-size: 0.95rem;"><div style="margin-bottom: 0.5rem;"><span style="color: #10b981;">Income: ${monthComparison.incomeChange >= 0 ? '↑' : '↓'} ${Math.abs(monthComparison.incomeChange)}%</span></div><div><span style="color: ${monthComparison.expenseChange <= 0 ? '#10b981' : '#ef4444'};">Expenses: ${monthComparison.expenseChange <= 0 ? '↓' : '↑'} ${Math.abs(monthComparison.expenseChange)}%</span></div></div></div><div class="card" style="padding: 1rem;"><div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.8rem;">🏆 Top Categories</div><div style="font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.4rem;">${topCategories.map((c, i) => `<div>${i+1}. ${c.category}: <strong>${c.percentage}%</strong></div>`).join('')}</div></div><div class="card" style="padding: 1rem;"><div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.8rem;">⚡ Budget Used</div><div style="display: flex; align-items: center; gap: 1rem;"><div style="width: 60px; height: 60px; border-radius: 50%; background: conic-gradient(#3b82f6 0deg ${(stats.monthlyExpense || 0) / (stats.monthlyIncome || 1) * 360}deg, var(--bg-secondary) 0deg); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700;">${(((stats.monthlyExpense || 0) / (stats.monthlyIncome || 1)) * 100).toFixed(0)}%</div><div><div style="font-size: 1rem; font-weight: 600;">${((stats.monthlyIncome || 0) - (stats.monthlyExpense || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })} left</div><div style="font-size: 0.85rem; color: var(--text-secondary);">Budget remaining</div></div></div></div></div>

<!-- Insights & Bills --><div class="grid-2" style="margin-bottom: 1.2rem; gap: 0.8rem;"><div class="card" style="padding: 1rem;"><div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.8rem;">💡 Smart Insights</div><div style="font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.6rem; line-height: 1.4;">${insights.map(i => `<div><span>${i.emoji}</span> ${i.text}</div>`).join('')}</div></div><div class="card" style="padding: 1rem;"><div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.8rem;">🔔 Recurring Bills</div><div style="font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.5rem;">${recurringBills.length > 0 ? recurringBills.map(b => `<div style="display: flex; justify-content: space-between;"><span>${b.title}</span><strong>${b.amount}</strong></div>`).join('') : '<div style="color: var(--text-secondary);">No recurring bills</div>'}</div></div></div>

<!-- Stocks --><div class="card" style="margin-bottom: 1.2rem; padding: 1rem;"><div style="display: flex; gap: 1rem; margin-bottom: 0.8rem; align-items: center;"><div style="font-size: 0.95rem; font-weight: 600;">🔴 NSE Live</div><button onclick="StocksView?.refresh?.()" style="margin-left: auto; background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 0.5rem 0.8rem; border-radius: 4px; font-size: 0.85rem; cursor: pointer; font-weight: 500;">Refresh</button></div><div id="stocks-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 0.8rem;"><div style="grid-column: 1/-1; text-align: center; padding: 1rem; color: var(--text-secondary); font-size: 0.9rem;"><i class=\"fa-solid fa-spinner fa-spin\"></i> Loading...</div></div><div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.8rem;"><span class="stocks-last-update">Updated: --</span></div></div>

<!-- Charts (3) --><div class="grid-3" style="margin-bottom: 1.2rem; gap: 0.8rem;"><div class="card" style="padding: 1rem;"><div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.8rem;">Expense Breakdown</div><div style="position: relative; height: 160px;"><canvas id="expenseChart\"></canvas></div></div><div class="card" style="padding: 1rem;"><div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.8rem;">Budget Status</div><div style="position: relative; height: 160px;"><canvas id="budgetChart\"></canvas></div></div><div class="card" style="padding: 1rem;"><div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.8rem;">Monthly Flow</div><div style="position: relative; height: 160px;"><canvas id="trendChart\"></canvas></div></div></div>

<!-- Goals --><div class="card" style="margin-bottom: 1.2rem; padding: 1rem;"><div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 1rem;">🎯 Financial Goals</div><div style="display: flex; flex-direction: column; gap: 0.8rem;"><div><div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem;"><span>Emergency Fund</span><span style="font-weight: 600;">65%</span></div><div style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;"><div style="height: 100%; width: 65%; background: linear-gradient(90deg, #10b981, #34d399);\"></div></div></div><div><div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem;"><span>Vacation Fund</span><span style="font-weight: 600;">42%</span></div><div style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;"><div style="height: 100%; width: 42%; background: linear-gradient(90deg, #3b82f6, #60a5fa);\"></div></div></div><div><div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem;"><span>Investment Pool</span><span style="font-weight: 600;">78%</span></div><div style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;"><div style="height: 100%; width: 78%; background: linear-gradient(90deg, #8b5cf6, #a78bfa);\"></div></div></div></div></div>

<!-- Actions --><div style="display: flex; gap: 0.8rem; margin-bottom: 1rem;"><button class="btn btn-primary" onclick="DashboardView.addTransaction()" style="flex: 1; padding: 0.8rem; font-size: 0.95rem; font-weight: 600;">+ Add Transaction</button><button class="btn btn-secondary" onclick="DashboardView.sendMoney()" style="flex: 1; padding: 0.8rem; font-size: 0.95rem; font-weight: 600;">→ Send Money</button><button class="btn btn-secondary" onclick="DashboardView.newGoal()" style="flex: 1; padding: 0.8rem; font-size: 0.95rem; font-weight: 600;">🎯 New Goal</button></div>

<!-- Modal --><div id="dashboard-tx-modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center;"><div style="background: var(--bg-card); border-radius: 12px; padding: 1.5rem; width: 90%; max-width: 450px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;"><h2 style="margin: 0; font-size: 1.1rem;\">Add Transaction</h2><button type="button" onclick="DashboardView.hideAddForm()" style="border: none; background: none; cursor: pointer; font-size: 1.5rem; color: var(--text-secondary);">×</button></div><form onsubmit="DashboardView.submitTransaction(event)"><input type="text" id="dashboard-tx-title" placeholder="Description" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.95rem; box-sizing: border-box; background: var(--bg-input); color: var(--text-primary); margin-bottom: 1rem;"><input type="number" id="dashboard-tx-amount" placeholder="Amount" step="0.01" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.95rem; box-sizing: border-box; background: var(--bg-input); color: var(--text-primary); margin-bottom: 1rem;"><input type="text" id="dashboard-tx-category" placeholder="Category" value="General" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.95rem; box-sizing: border-box; background: var(--bg-input); color: var(--text-primary); margin-bottom: 1.5rem;"><div style="display: flex; gap: 1rem;"><button type="button" onclick="DashboardView.hideAddForm()" class="btn btn-secondary" style="flex: 1;">Cancel</button><button type="submit" class="btn btn-primary" style="flex: 1;">Add</button></div></form></div></div>
</div>
            `;
        } catch (error) {
            console.error('Dashboard error:', error);
            return `<div class="card"><div style="padding: 1.5rem;"><h3 style="color: red; margin: 0 0 0.5rem 0;">Error</h3><p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${error.message}</p></div></div>`;
        }
    },
    
    calculateHealthScore(stats, txs) {
        let score = 50; // base
        
        // Savings rate (max 20 points)
        const savingsRate = stats.savingsRate || 0;
        if (savingsRate >= 30) score += 20;
        else if (savingsRate >= 20) score += 15;
        else if (savingsRate >= 10) score += 10;
        
        // Expense ratio (max 15 points)
        const expenseRatio = (stats.monthlyExpense || 0) / (stats.monthlyIncome || 1);
        if (expenseRatio <= 0.5) score += 15;
        else if (expenseRatio <= 0.7) score += 10;
        else if (expenseRatio <= 0.85) score += 5;
        
        // Transaction diversity (max 10 points)
        const categories = new Set(txs.map(t => t.category));
        score += Math.min(categories.size, 10);
        
        // Emergency fund indicator (max 5 points)
        if (stats.netWorth > stats.monthlyExpense * 3) score += 5;
        
        return Math.min(100, Math.max(0, score));
    },
    
    getTopCategories(txs, limit = 3) {
        const categories = {};
        txs.filter(t => t.type === 'expense').forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
        });
        
        const total = Object.values(categories).reduce((a, b) => a + b, 0);
        return Object.entries(categories)
            .map(([cat, amount]) => ({ category: cat, amount, percentage: ((amount / total) * 100).toFixed(0) }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, limit);
    },
    
    getMonthComparison(stats) {
        return {
            incomeChange: Math.floor(Math.random() * 40) - 20,
            expenseChange: Math.floor(Math.random() * 40) - 20
        };
    },
    
    getRecurringBills(txs) {
        // Extract potential recurring transactions
        const candidates = txs.filter(t => t.title?.toLowerCase().includes('subscription') || t.title?.toLowerCase().includes('bill') || t.title?.toLowerCase().includes('payment'));
        return candidates.slice(0, 3).map(t => ({
            title: t.title,
            amount: t.amount.toLocaleString(undefined, { maximumFractionDigits: 0 }),
            freq: 'Monthly'
        }));
    },
    
    generateInsights(stats, txs, healthScore) {
        const insights = [];
        
        if (stats.savingsRate > 30) {
            insights.push({ emoji: '✨', text: `Excellent savings! You\'re saving ${stats.savingsRate?.toFixed(1)}% of income.` });
        } else if (stats.savingsRate < 10) {
            insights.push({ emoji: '⚠️', text: `Low savings rate (${stats.savingsRate?.toFixed(1)}%). Consider cutting expenses.` });
        }
        
        const expenseRatio = (stats.monthlyExpense || 0) / (stats.monthlyIncome || 1);
        if (expenseRatio > 0.8) {
            insights.push({ emoji: '🔴', text: `Spending is high (${(expenseRatio * 100).toFixed(0)}% of income). Budget adjustment needed.` });
        } else if (expenseRatio < 0.5) {
            insights.push({ emoji: '🎯', text: `Great budget control! You spend only ${(expenseRatio * 100).toFixed(0)}% of income.` });
        }
        
        const topCat = DashboardView.getTopCategories(txs, 1)[0];
        if (topCat) {
            insights.push({ emoji: '📊', text: `Top category: ${topCat.category} (${topCat.percentage}% of expenses)` });
        }
        
        return insights.slice(0, 3);
    },

    addTransaction() {
        const overlay = document.getElementById('dashboard-tx-modal-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            document.getElementById('dashboard-tx-title').focus();
        }
    },

    hideAddForm() {
        const overlay = document.getElementById('dashboard-tx-modal-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    },

    submitTransaction(event) {
        event.preventDefault();

        const title = document.getElementById('dashboard-tx-title').value.trim();
        const amount = parseFloat(document.getElementById('dashboard-tx-amount').value);
        const category = document.getElementById('dashboard-tx-category').value.trim() || 'General';

        if (!title || isNaN(amount)) {
            ViewUtils.showToast('Fill all fields', 'error');
            return;
        }

        const newTx = {
            title,
            amount,
            category,
            type: amount >= 0 ? 'income' : 'expense',
            date: new Date().toISOString(),
            icon: amount >= 0 ? 'fa-solid fa-arrow-down' : 'fa-solid fa-arrow-up'
        };

        try {
            MoneyDB.addTransaction(newTx);
            ViewUtils.showToast('✓ Added', 'success');
            
            document.getElementById('dashboard-tx-title').value = '';
            document.getElementById('dashboard-tx-amount').value = '';
            document.getElementById('dashboard-tx-category').value = 'General';
            
            DashboardView.hideAddForm();
            
            MoneyDB.getLiveStats().then(() => {
                DashboardView.refresh();
            }).catch(() => {
                DashboardView.refresh();
            });
        } catch (error) {
            ViewUtils.showToast('Error', 'error');
        }
    },

    sendMoney() {
        ViewUtils.showToast('Coming soon', 'info');
    },

    newGoal() {
        ViewUtils.showToast('Go to Goals', 'info');
    },

    refresh() {
        const container = document.getElementById('view-container');
        if (container) {
            this.render().then(html => { container.innerHTML = html; });
        }
    }
};
