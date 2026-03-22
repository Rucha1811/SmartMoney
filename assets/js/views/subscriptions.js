window.SubscriptionsView = {
    _lastData: null,
    _charts: {},
    render() {
        const header = `
            <div class="view-header view-animate">
                <h1>Subscription Manager</h1>
                <button id="btn-add-sub" class="btn-primary" onclick="SubscriptionsView.openAddModal()"><i class="fa-solid fa-plus"></i> Add Subscription</button>
            </div>
        `;

        const statsHtml = `
            <div class="grid-2 view-animate stagger-1">
                <div class="card stat-card">
                    <div class="stat-header"><i class="fa-solid fa-calendar-check"></i> Monthly Cost</div>
                    <div class="stat-value" id="total-monthly">--</div>
                </div>
                <div class="card stat-card">
                    <div class="stat-header"><i class="fa-solid fa-calendar-days"></i> Yearly Cost</div>
                    <div class="stat-value" id="total-yearly">--</div>
                </div>
            </div>

            <!-- New Analytical Chart -->
            <div class="card" style="margin-top: 1.5rem; border-radius: 20px;">
                <div class="card-header"><h3 class="card-title"><i class="fa-solid fa-pie-chart text-accent"></i> Subscription Breakdown (Monthly equivalent)</h3></div>
                <div style="padding: 1rem; position: relative; height: 300px; display: flex; justify-content: center;">
                    <canvas id="subsChartCanvas"></canvas>
                </div>
            </div>

            <div id="subs-container" class="goals-grid" style="margin-top: 1.5rem;">
                <div class="loading-state" style="grid-column: 1/-1;">
                    <div class="spinner"></div>
                    <p>Loading subscriptions...</p>
                </div>
            </div>
        `;

        const modalHtml = `
            <!-- Modal -->
            <div id="sub-modal" class="modal" style="display: none;" onclick="if(event.target===this) SubscriptionsView.closeAddModal()">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="sub-modal-title">Add Subscription</h2>
                        <button class="close-modal close-btn" onclick="SubscriptionsView.closeAddModal()">&times;</button>
                    </div>
                    <form id="sub-form" onsubmit="SubscriptionsView.handleSubmit(event)">
                        <input type="hidden" id="sub-id">
                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" id="sub-name" required placeholder="Netflix">
                        </div>
                        <div class="form-row">
                            <div class="form-group" style="margin-bottom: 1rem;">
                                <label>Amount</label>
                                <input type="number" id="sub-amount" required step="0.01">
                            </div>
                            <div class="form-group" style="margin-bottom: 1rem;">
                                <label>Billing Cycle</label>
                                <select id="sub-cycle" style="width: 100%; border-radius: 6px;">
                                    <option value="Monthly">Monthly</option>
                                    <option value="Yearly">Yearly</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label>Next Payment</label>
                            <input type="date" id="sub-next" required>
                        </div>
                        <div class="form-group">
                            <label>Icon</label>
                            <select id="sub-icon">
                                <option value="fa-brands fa-netflix">Netflix</option>
                                <option value="fa-brands fa-spotify">Spotify</option>
                                <option value="fa-brands fa-youtube">YouTube</option>
                                <option value="fa-brands fa-amazon">Amazon</option>
                                <option value="fa-solid fa-dumbbell">Gym</option>
                                <option value="fa-solid fa-cloud">iCloud/Drive</option>
                                <option value="fa-solid fa-ticket">Other</option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="SubscriptionsView.closeAddModal()">Cancel</button>
                            <button type="submit" class="btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Load subscriptions after rendering
        setTimeout(() => this.loadSubscriptions(), 0);

        return header + statsHtml + modalHtml;
    },

    async loadSubscriptions() {
        const container = document.getElementById('subs-container');
        try {
            const res = await fetch('assets/api/subscriptions.php');
            if (!res.ok) throw new Error('Failed to load subscriptions');

            const subs = await res.json();
            this._lastData = subs;

            // Calculate Totals
            let monthly = 0;
            let yearly = 0;
            subs.forEach(s => {
                if (s.billing_cycle === 'Monthly') {
                    monthly += parseFloat(s.amount);
                    yearly += parseFloat(s.amount) * 12;
                } else {
                    monthly += parseFloat(s.amount) / 12;
                    yearly += parseFloat(s.amount);
                }
            });

            // Update stats
            document.getElementById('total-monthly').textContent = ViewUtils.formatCurrency(monthly);
            document.getElementById('total-yearly').textContent = ViewUtils.formatCurrency(yearly);

            if (!subs || subs.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--text-secondary);">
                        <i class="fa-solid fa-ticket" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <h3>No subscriptions tracked yet</h3>
                        <p>Add your subscriptions to track their costs</p>
                        <button class="btn btn-primary" onclick="SubscriptionsView.openAddModal()" style="margin-top: 1rem;">
                            Add Subscription
                        </button>
                    </div>
                `;
                return;
            }

            const brandColors = {
                'netflix': '#E50914',
                'spotify': '#1DB954',
                'youtube': '#FF0000',
                'amazon': '#FF9900',
                'icloud': '#007AFF',
                'apple': '#007AFF',
                'gym': '#FF2D55'
            };

            const items = subs.map((sub, index) => {
                let color = 'var(--color-primary)';
                const lowerName = sub.name.toLowerCase();
                for (let [key, brandColor] of Object.entries(brandColors)) {
                    if (lowerName.includes(key)) {
                        color = brandColor;
                        break;
                    }
                }

                return `
                    <div class="card goal-card stagger-${(index % 3) + 2}" style="cursor: pointer; border-left: 4px solid ${color};" onclick="SubscriptionsView.editSubscription(${sub.id})">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <div style="background: ${color}20; color: ${color}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                                <i class="${sub.icon}"></i>
                            </div>
                            <button class="icon-btn" onclick="event.stopPropagation(); SubscriptionsView.deleteSubscription(${sub.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
                        </div>
                        <h3 style="margin-bottom: 0.5rem;">${sub.name}</h3>
                        <p style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">${ViewUtils.formatCurrency(sub.amount)}<span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 400;">/${sub.billing_cycle === 'Monthly' ? 'mo' : 'yr'}</span></p>
                        <div style="border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.9rem; color: var(--text-secondary);"><i class="fa-solid fa-calendar"></i> Next: ${ViewUtils.formatDate(sub.next_payment_date)}</span>
                                <span class="badge" style="background:${sub.status === 'Active' ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 69, 58, 0.15)'}; color:${sub.status === 'Active' ? '#30d158' : '#ff453a'}">${sub.status}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = items;

            // Call afterRender manually to draw chart
            if (typeof SubscriptionsView.afterRender === 'function') {
                setTimeout(() => SubscriptionsView.afterRender(subs), 50);
            }
        } catch (error) {
            console.error('Load Subscriptions Error:', error);
            ViewUtils.showError(container, 'Failed to Load Subscriptions', error.message);
        }
    },

    openAddModal() {
        const modal = document.getElementById('sub-modal');
        document.getElementById('sub-form').reset();
        document.getElementById('sub-id').value = '';
        document.getElementById('sub-modal-title').innerText = 'Add Subscription';

        // Set next payment date to today
        document.getElementById('sub-next').valueAsDate = new Date();

        modal.style.display = 'flex';
        // Small delay to allow CSS transition to apply
        setTimeout(() => {
            modal.classList.add('active');
            modal.classList.add('open');
        }, 10);
    },

    closeAddModal() {
        const modal = document.getElementById('sub-modal');
        if (!modal) return;
        modal.classList.remove('active');
        modal.classList.remove('open');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Wait for transition
    },

    async handleSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('sub-id').value;
        const data = {
            id: id || null,
            name: document.getElementById('sub-name').value,
            amount: parseFloat(document.getElementById('sub-amount').value),
            billing_cycle: document.getElementById('sub-cycle').value,
            next_payment_date: document.getElementById('sub-next').value,
            icon: document.getElementById('sub-icon').value
        };

        try {
            const method = id ? 'PUT' : 'POST';
            const res = await fetch('assets/api/subscriptions.php', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to save subscription');

            ViewUtils.showToast('Subscription saved successfully!', 'success');
            this.closeAddModal();
            this.loadSubscriptions();
        } catch (error) {
            ViewUtils.showToast(error.message || 'Error saving subscription', 'error');
        }
    },

    async editSubscription(id) {
        try {
            const res = await fetch('assets/api/subscriptions.php');
            if (!res.ok) throw new Error('Failed to load subscriptions');

            const subs = await res.json();
            const sub = subs.find(s => s.id == id);

            if (!sub) throw new Error('Subscription not found');

            document.getElementById('sub-id').value = sub.id;
            document.getElementById('sub-name').value = sub.name;
            document.getElementById('sub-amount').value = sub.amount;
            document.getElementById('sub-cycle').value = sub.billing_cycle;
            document.getElementById('sub-next').value = sub.next_payment_date;
            document.getElementById('sub-icon').value = sub.icon;

            document.getElementById('sub-modal-title').innerText = 'Edit Subscription';

            const modal = document.getElementById('sub-modal');
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('active');
                modal.classList.add('open');
            }, 10);
        } catch (error) {
            ViewUtils.showToast(error.message || 'Error loading subscription', 'error');
        }
    },

    async deleteSubscription(id) {
        if (!confirm('Are you sure you want to delete this subscription?')) return;

        try {
            const res = await fetch(`assets/api/subscriptions.php?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete subscription');

            ViewUtils.showToast('Subscription deleted successfully!', 'success');
            this.loadSubscriptions();
        } catch (error) {
            ViewUtils.showToast(error.message || 'Error deleting subscription', 'error');
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

    afterRender(subsData = this._lastData) {
        if (typeof Chart === 'undefined') return;

        this.destroyCharts();

        const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'rgba(255, 255, 255, 0.7)';
        const textColor = getCSSVar('--text-primary');

        const canvas = document.getElementById('subsChartCanvas');
        if (!canvas) return;

        const labels = [];
        const data = [];
        const c1 = getCSSVar('--color-primary');
        const c2 = getCSSVar('--color-secondary');
        const c3 = getCSSVar('--color-accent');
        const c4 = getCSSVar('--color-warning');
        const c5 = getCSSVar('--color-success');
        const bgColors = [c1, c2, c3, c4, c5, '#a855f7', '#ec4899', '#0ea5e9'];

        if (subsData && subsData.length > 0) {
            subsData.forEach(s => {
                labels.push(s.name);
                const amt = parseFloat(s.amount);
                // convert to monthly
                data.push(s.billing_cycle === 'Yearly' ? amt / 12 : amt);
            });
        } else {
            labels.push("No Active Subs");
            data.push(1);
        }

        this._charts.breakdown = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: bgColors.slice(0, Math.max(1, data.length)),
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
                                if (labels[0] === "No Active Subs") return "No Data";
                                return context.label + ': $' + context.parsed.toLocaleString(undefined, { minimumFractionDigits: 2 }) + ' /mo';
                            }
                        }
                    }
                }
            }
        });
    }
};
