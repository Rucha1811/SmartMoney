window.GoalsView = {
    _lastData: null,
    _charts: {},
    _keydownHandler: null,

    render() {
        this._listenersSet = false;
        const header = `
            <div class="view-header view-animate">
                <h1>Financial Goals</h1>
                <button id="btn-add-goal" class="btn-primary"><i class="fa-solid fa-plus"></i> New Goal</button>
            </div>
            
            <div class="goals-grid" id="goals-container" style="margin-bottom: 2rem;">
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading goals...</p>
                </div>
            </div>

            <!-- New Analytical Chart -->
            <div class="card" style="margin-bottom: 2rem; border-radius: 20px;">
                <div class="card-header"><h3 class="card-title"><i class="fa-solid fa-chart-pie text-primary"></i> Goals Progress Overview</h3></div>
                <div style="padding: 1rem; position: relative; height: 300px; display: flex; justify-content: center;">
                    <canvas id="goalsChartCanvas"></canvas>
                </div>
            </div>
        `;

        const modalHtml = `
            <!-- Modal -->
            <div id="goal-modal" class="modal" style="display: none;" onclick="if(event.target===this) GoalsView.closeAddGoal()">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="modal-title">Add New Goal</h2>
                        <button class="close-modal" onclick="GoalsView.closeAddGoal()">&times;</button>
                    </div>
                    <form id="goal-form" onsubmit="GoalsView.handleSubmit(event)">
                        <input type="hidden" id="goal-id">
                        <div class="form-group">
                            <label>Goal Name</label>
                            <input type="text" id="goal-name" required placeholder="e.g. Dream House">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Target Amount</label>
                                <input type="number" id="goal-target" required step="0.01" placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label>Current Saved</label>
                                <input type="number" id="goal-current" step="0.01" value="0">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Target Date</label>
                            <input type="date" id="goal-date">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Icon</label>
                                <select id="goal-icon">
                                    <option value="fa-solid fa-bullseye">🎯 Target</option>
                                    <option value="fa-solid fa-house">🏠 House</option>
                                    <option value="fa-solid fa-car">🚗 Car</option>
                                    <option value="fa-solid fa-plane">✈️ Travel</option>
                                    <option value="fa-solid fa-graduation-cap">🎓 Education</option>
                                    <option value="fa-solid fa-ring">💍 Wedding</option>
                                    <option value="fa-solid fa-shield-heart">🛡️ Emergency</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Color</label>
                                <input type="color" id="goal-color" value="#0a84ff">
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="GoalsView.closeAddGoal()">Cancel</button>
                            <button type="submit" class="btn-primary">Save Goal</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Load goals after rendering
        setTimeout(() => this.loadGoals(), 0);

        return header + modalHtml;
    },

    async loadGoals() {
        const container = document.getElementById('goals-container');
        try {
            const res = await fetch('assets/api/goals.php');
            if (!res.ok) throw new Error('Failed to load goals');

            const goals = await res.json();
            this._lastData = goals;

            if (!goals || goals.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--text-secondary);">
                        <i class="fa-solid fa-bullseye" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <h3>No goals yet</h3>
                        <p>Start tracking your savings today!</p>
                        <button class="btn btn-primary" onclick="GoalsView.openAddGoal()" style="margin-top: 1rem;">
                            Create Your First Goal
                        </button>
                    </div>
                `;
                return;
            }

            container.innerHTML = goals.map((goal, index) => {
                const percent = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
                return `
                    <div class="card goal-card stagger-${(index % 3) + 1}" style="cursor: pointer;" onclick="GoalsView.editGoal(${goal.id})">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <div class="goal-icon" style="background: ${goal.color}20; color: ${goal.color}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                                <i class="${goal.icon}"></i>
                            </div>
                            <button class="icon-btn" onclick="event.stopPropagation(); GoalsView.deleteGoal(${goal.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
                        </div>
                        <h3 style="margin-bottom: 1rem;">${goal.name}</h3>
                        <div style="margin-bottom: 1rem;">
                            <div style="background: var(--bg-card-hover); border-radius: 8px; height: 8px; overflow: hidden; margin-bottom: 0.5rem;">
                                <div style="width: ${percent}%; height: 100%; background: ${goal.color}; border-radius: 8px; transition: width 0.3s ease;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary);">
                                <span>${ViewUtils.formatCurrency(goal.current_amount)}</span>
                                <span>${percent}%</span>
                            </div>
                        </div>
                        <div style="border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
                            <p style="margin: 0.5rem 0; font-size: 0.9rem;">Target: <strong>${ViewUtils.formatCurrency(goal.target_amount)}</strong></p>
                            ${goal.deadline ? `<p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);"><i class="fa-regular fa-calendar"></i> ${ViewUtils.formatDate(goal.deadline)}</p>` : ''}
                        </div>
                    </div>
                `;
            }).join('');

            // Call afterRender manually to draw chart since we loaded async
            if (typeof GoalsView.afterRender === 'function') {
                setTimeout(() => GoalsView.afterRender(goals), 50);
            }
        } catch (error) {
            console.error('Load Goals Error:', error);
            ViewUtils.showError(container, 'Failed to Load Goals', error.message);
        }

        // Setup event listeners
        this.setupEventListeners();
    },

    _listenersSet: false,

    setupEventListeners() {
        if (this._listenersSet) return;
        this._listenersSet = true;

        const btnAdd = document.getElementById('btn-add-goal');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.openAddGoal());
        }

        // Close on Escape key — store reference for cleanup
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
        }
        this._keydownHandler = (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('goal-modal');
                if (modal && (modal.classList.contains('active') || modal.style.display === 'flex')) {
                    GoalsView.closeAddGoal();
                }
            }
        };
        document.addEventListener('keydown', this._keydownHandler);
    },

    openAddGoal() {
        const modal = document.getElementById('goal-modal');
        document.getElementById('goal-form').reset();
        document.getElementById('goal-id').value = '';
        document.getElementById('modal-title').innerText = 'Add New Goal';

        modal.style.display = 'flex';
        // Small delay to allow CSS transition to apply
        setTimeout(() => {
            modal.classList.add('active');
            modal.classList.add('open');
        }, 10);
    },

    closeAddGoal() {
        const modal = document.getElementById('goal-modal');
        if (!modal) return;
        modal.classList.remove('active');
        modal.classList.remove('open');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Wait for transition
    },

    async handleSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('goal-id').value;
        const name = document.getElementById('goal-name').value;
        const target = document.getElementById('goal-target').value;
        const current = document.getElementById('goal-current').value;

        // Validate required fields
        if (!name || !target) {
            ViewUtils.showToast('Please fill in required fields', 'error');
            return;
        }

        const data = {
            id: id || null,
            name: name,
            target_amount: parseFloat(target),
            current_amount: parseFloat(current) || 0,
            deadline: document.getElementById('goal-date').value,
            icon: document.getElementById('goal-icon').value,
            color: document.getElementById('goal-color').value
        };

        try {
            const method = id ? 'PUT' : 'POST';
            const res = await fetch('assets/api/goals.php', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const responseText = await res.text();
            console.log('API Response:', responseText);

            if (!res.ok) {
                let errorMsg = 'Failed to save goal';
                try {
                    const errorObj = JSON.parse(responseText);
                    errorMsg = errorObj.error || errorMsg;
                } catch (_) { /* non-JSON response, use default */ }
                throw new Error(errorMsg);
            }

            ViewUtils.showToast('Goal saved successfully!', 'success');
            this.closeAddGoal();
            this.loadGoals();
        } catch (error) {
            console.error('Handle Submit Error:', error);
            ViewUtils.showToast(error.message || 'Error saving goal', 'error');
        }
    },

    async editGoal(id) {
        try {
            const res = await fetch('assets/api/goals.php');
            if (!res.ok) throw new Error('Failed to load goal');

            const goals = await res.json();
            const goal = goals.find(g => g.id == id);

            if (!goal) throw new Error('Goal not found');

            document.getElementById('goal-id').value = goal.id;
            document.getElementById('goal-name').value = goal.name;
            document.getElementById('goal-target').value = goal.target_amount;
            document.getElementById('goal-current').value = goal.current_amount;
            document.getElementById('goal-date').value = goal.deadline || '';
            document.getElementById('goal-icon').value = goal.icon;
            document.getElementById('goal-color').value = goal.color;

            document.getElementById('modal-title').innerText = 'Edit Goal';

            const modal = document.getElementById('goal-modal');
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('active');
                modal.classList.add('open');
            }, 10);
        } catch (error) {
            ViewUtils.showToast(error.message || 'Error loading goal', 'error');
        }
    },

    async deleteGoal(id) {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        try {
            const res = await fetch(`assets/api/goals.php?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete goal');

            ViewUtils.showToast('Goal deleted successfully!', 'success');
            this.loadGoals();
        } catch (error) {
            ViewUtils.showToast(error.message || 'Error deleting goal', 'error');
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

    cleanup() {
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
            this._keydownHandler = null;
        }
        this._listenersSet = false;
        this.destroyCharts();
    },

    afterRender(goalsData = this._lastData) {
        if (typeof Chart === 'undefined') return;

        this.destroyCharts();

        // Extract data for chart
        const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'rgba(255, 255, 255, 0.7)';
        const textColor = getCSSVar('--text-primary');

        let totalTarget = 0;
        let totalSaved = 0;

        if (goalsData && goalsData.length > 0) {
            goalsData.forEach(g => {
                totalTarget += parseFloat(g.target_amount);
                totalSaved += parseFloat(g.current_amount);
            });
        }

        const canvas = document.getElementById('goalsChartCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const remaining = Math.max(0, totalTarget - totalSaved);

            const cSuccess = getCSSVar('--color-success') || '#22c55e';
            const cDanger = getCSSVar('--color-accent') || '#ef4444';

            this._charts.progress = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: ['Saved', 'Remaining'],
                    datasets: [{
                        data: [totalSaved, remaining],
                        backgroundColor: [cSuccess, cDanger],
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
                                    return context.label + ': $' + context.parsed.toLocaleString(undefined, { minimumFractionDigits: 2 });
                                }
                            }
                        }
                    }
                }
            });
        }
    }
};
