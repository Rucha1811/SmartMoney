window.BudgetView = {
    _charts: {},

    render() {
        const header = `
            <div class="view-header view-animate">
                <h1>Budget Manager</h1>
                <button id="btn-add-budget" class="btn-primary" onclick="BudgetView.openAddModal()">
                    <i class="fa-solid fa-plus"></i> New Budget
                </button>
            </div>

            <!-- New Analytical Chart -->
            <div class="card view-animate" style="margin-bottom: 2rem; border-radius: 20px;">
                <div class="card-header"><h3 class="card-title"><i class="fa-solid fa-chart-pie text-primary"></i> Budget Breakdown</h3></div>
                <div style="padding: 1rem; position: relative; height: 300px; display: flex; justify-content: center;">
                    <canvas id="budgetBreakdownCanvas"></canvas>
                </div>
            </div>
            
            <div class="grid-2 view-animate stagger-1">
                <div class="card stat-card">
                    <div class="stat-header"><i class="fa-solid fa-wallet"></i> Total Budget</div>
                    <div class="stat-value" id="total-budget">--</div>
                </div>
                <div class="card stat-card">
                    <div class="stat-header"><i class="fa-solid fa-chart-line"></i> Total Spent</div>
                    <div class="stat-value" id="total-spent">--</div>
                </div>
            </div>
            <div id="budgets-container" class="budget-list" style="margin-top: 1.5rem;">
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading budgets...</p>
                </div>
            </div>
        `;

        const modalHtml = `
            <div id="budget-modal" class="modal" style="display: none;" onclick="if(event.target===this) BudgetView.closeModal()">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="budget-modal-title">Add New Budget</h2>
                        <button class="close-modal" onclick="BudgetView.closeModal()">&times;</button>
                    </div>
                    <form id="budget-form" onsubmit="BudgetView.handleSubmit(event)">
                        <input type="hidden" id="budget-id">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Category Name</label>
                                <input type="text" id="budget-category" required placeholder="e.g. Groceries">
                            </div>
                            <div class="form-group">
                                <label>Color</label>
                                <input type="color" id="budget-color" value="#0a84ff" style="width: 100%; height: 42px; padding: 0.2rem; border-radius: var(--radius-md);">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Monthly Limit ($)</label>
                            <input type="number" id="budget-limit" required step="0.01" placeholder="0.00">
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="BudgetView.closeModal()">Cancel</button>
                            <button type="submit" class="btn-primary">Save Budget</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        setTimeout(() => this.loadBudgets(), 0);
        return header + modalHtml;
    },

    async loadBudgets() {
        const container = document.getElementById('budgets-container');
        const user = MoneyDB.getUser();
        if (!user) return;

        try {
            const res = await fetch(`assets/api/budget.php?user_id=${user.id}`);
            if (!res.ok) throw new Error('Failed to load budgets');

            const budgets = await res.json();
            this._lastData = budgets;

            // Calculate totals
            let totalBudget = 0;
            let totalSpent = 0;
            budgets.forEach(b => {
                totalBudget += parseFloat(b.limit_amount || 0);
                totalSpent += parseFloat(b.spent || 0);
            });

            document.getElementById('total-budget').textContent = ViewUtils.formatCurrency(totalBudget);
            document.getElementById('total-spent').textContent = ViewUtils.formatCurrency(totalSpent);

            if (!budgets || budgets.length === 0) {
                container.innerHTML = `
                    <div style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                        <i class="fa-solid fa-wallet" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <h3>No budgets created yet</h3>
                        <p>Create a budget to track your spending by category</p>
                        <button class="btn btn-primary" onclick="BudgetView.openAddModal()" style="margin-top: 1rem;">
                            Create Budget
                        </button>
                    </div>
                `;
                return;
            }

            const items = budgets.map((b, index) => {
                const percent = Math.min((parseFloat(b.spent || 0) / parseFloat(b.limit_amount)) * 100, 100);
                const isOver = parseFloat(b.spent || 0) > parseFloat(b.limit_amount);
                const statusColor = isOver ? '#ff453a' : b.color || '#0a84ff';

                return `
                    <div class="card budget-item stagger-${(index % 4) + 1}" style="border-left: 4px solid ${statusColor};">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <div>
                                <h3 style="margin: 0 0 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${statusColor};"></span>
                                    ${b.category}
                                </h3>
                                <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);">
                                    <span style="font-weight: 600; color: ${isOver ? '#ff453a' : 'var(--text-primary)'};">${ViewUtils.formatCurrency(b.spent || 0)}</span> 
                                    / ${ViewUtils.formatCurrency(b.limit_amount)}
                                </p>
                            </div>
                            <button class="icon-btn" onclick="BudgetView.deleteBudget(${b.id})" title="Delete">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                        <div style="width: 100%; height: 8px; background: var(--bg-card-hover); border-radius: 8px; overflow: hidden; margin-bottom: 0.5rem;">
                            <div style="width: ${percent}%; height: 100%; background: ${statusColor}; border-radius: 8px; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary);">
                            <span>${percent.toFixed(0)}% used</span>
                            ${isOver ? `<span style="color: #ff453a;"><i class="fa-solid fa-exclamation-triangle"></i> Over by ${ViewUtils.formatCurrency(parseFloat(b.spent || 0) - parseFloat(b.limit_amount))}</span>` : `<span>${ViewUtils.formatCurrency(parseFloat(b.limit_amount) - parseFloat(b.spent || 0))} remaining</span>`}
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = items;

            if (typeof BudgetView.afterRender === 'function') {
                setTimeout(() => BudgetView.afterRender(budgets), 50);
            }
        } catch (error) {
            console.error('Load Budgets Error:', error);
            ViewUtils.showError(container, 'Failed to Load Budgets', error.message);
        }
    },

    openAddModal() {
        const modal = document.getElementById('budget-modal');
        document.getElementById('budget-form').reset();
        document.getElementById('budget-id').value = '';
        document.getElementById('budget-modal-title').innerText = 'Add New Budget';

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
            modal.classList.add('open');
        }, 10);
    },

    closeModal() {
        const modal = document.getElementById('budget-modal');
        if (!modal) return;
        modal.classList.remove('active');
        modal.classList.remove('open');
        setTimeout(() => {
            modal.style.display = 'none';
            const form = document.getElementById('budget-form');
            if (form) form.reset();
        }, 300);
    },

    async handleSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('budget-id').value;
        const category = document.getElementById('budget-category').value;
        const color = document.getElementById('budget-color').value;
        const limit = document.getElementById('budget-limit').value;

        if (!category || !limit) {
            ViewUtils.showToast('Please fill in all fields', 'error');
            return;
        }

        const user = MoneyDB.getUser();

        const data = {
            id: id || null,
            category: category,
            limit_amount: parseFloat(limit),
            color: color
        };

        try {
            const method = id ? 'PUT' : 'POST';
            const res = await fetch(`assets/api/budget.php?user_id=${user.id}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to save budget');

            ViewUtils.showToast('Budget saved successfully!', 'success');
            this.closeModal();
            this.loadBudgets();
        } catch (error) {
            console.error('Save Budget Error:', error);
            ViewUtils.showToast(error.message || 'Error saving budget', 'error');
        }
    },

    async deleteBudget(id) {
        if (!confirm('Are you sure you want to delete this budget?')) return;

        const user = MoneyDB.getUser();

        try {
            const res = await fetch(`assets/api/budget.php?id=${id}&user_id=${user.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete budget');

            ViewUtils.showToast('Budget deleted successfully!', 'success');
            this.loadBudgets();
        } catch (error) {
            console.error('Delete Budget Error:', error);
            ViewUtils.showToast(error.message || 'Error deleting budget', 'error');
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

    afterRender(budgetData = this._lastData) {
        if (typeof Chart === 'undefined') return;

        this.destroyCharts();

        const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'rgba(255, 255, 255, 0.7)';
        const textColor = getCSSVar('--text-primary');

        const canvas = document.getElementById('budgetBreakdownCanvas');
        if (!canvas) return;

        if (!budgetData || budgetData.length === 0) {
            // Draw empty state chart
            const ctx = canvas.getContext('2d');
            this._charts.breakdown = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        data: [1],
                        backgroundColor: [getCSSVar('--bg-card-hover')],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { tooltip: { enabled: false }, legend: { display: false } }
                }
            });
            return;
        }

        const labels = [];
        const data = [];
        const backgroundColors = [];

        budgetData.forEach(b => {
            labels.push(b.category);
            data.push(parseFloat(b.limit_amount));
            backgroundColors.push(b.color || '#0a84ff');
        });

        const ctx = canvas.getContext('2d');
        this._charts.breakdown = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 2,
                    borderColor: getCSSVar('--bg-card')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: textColor }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.label + ': ' + ViewUtils.formatCurrency(context.parsed);
                            }
                        }
                    }
                }
            }
        });
    }
};
