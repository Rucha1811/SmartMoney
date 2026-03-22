window.InsightsView = {
    render() {
        // 1. Fetch Data
        const user = MoneyDB.getUser();
        const stats = MoneyDB.getStats();
        const budgets = MoneyDB.getBudgets();
        const transactions = MoneyDB.getTransactions();

        // 2. Calculate AI Metrics
        const income = stats.monthlyIncome || 0;
        const expense = stats.monthlyExpense || 0;
        const savings = income - expense;
        const savingsRate = income > 0 ? (savings / income) * 100 : 0;

        // Health Score Logic (0-100)
        let healthScore = 50; // Base
        if (savingsRate > 20) healthScore += 20;
        else if (savingsRate > 10) healthScore += 10;
        if (expense < income) healthScore += 10;
        if (budgets.every(b => b.spent <= b.limit)) healthScore += 20;
        // Cap at 100
        healthScore = Math.min(100, Math.max(0, healthScore));

        // Generate Insights dynamically
        const insights = this.generateInsights(transactions, budgets);

        return `
            <div style="padding-bottom: 3rem;">
                <!-- Header -->
                <div style="margin-bottom: 2rem; padding: 2.5rem; border-radius: 20px; background: linear-gradient(135deg, rgba(127, 86, 217, 0.15) 0%, rgba(20, 20, 30, 0.4) 100%); border: 1px solid rgba(127, 86, 217, 0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 1.5rem;">
                        <div style="width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #7F56D9 0%, #BF5AF2 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(127, 86, 217, 0.4);">
                            <i class="fa-solid fa-brain" style="color: white; font-size: 2rem;"></i>
                        </div>
                        <div>
                            <h2 class="auth-title" style="text-align: left; font-size: 2.2rem; margin: 0; background: linear-gradient(90deg, #fff, #aeb5d1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">AI Financial Intelligence</h2>
                            <p class="auth-subtitle" style="text-align: left; margin: 0; font-size: 1.1rem; opacity: 0.8;">Real-time analysis & neural projections of your wealth flow</p>
                        </div>
                    </div>
                </div>

                <!-- Stock Market Predictions Section -->
                <div class="card" style="margin-bottom: 2rem; background: rgba(0,0,0,0.2); backdrop-filter: blur(12px); border: 1px solid rgba(34, 197, 94, 0.2);">
                    <div class="card-header" style="border-bottom: 1px solid rgba(34, 197, 94, 0.2); background: rgba(34, 197, 94, 0.05);">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <h3 class="card-title"><i class="fa-solid fa-chart-line" style="color: #22c55e;"></i> Stock Market Predictions</h3>
                            <select id="market-selector" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(34, 197, 94, 0.3); color: #fff; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;" onchange="InsightsView.loadPredictions(this.value)">
                                <option value="NSE">NSE (India)</option>
                                <option value="BSE">BSE (India)</option>
                                <option value="NASDAQ">NASDAQ (USA)</option>
                                <option value="NYSE">NYSE (USA)</option>
                            </select>
                        </div>
                    </div>
                    <div id="predictions-container" style="padding: 1.5rem;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; color: var(--text-secondary);">
                            <i class="fa-solid fa-spinner fa-spin"></i> Loading market predictions...
                        </div>
                    </div>
                </div>

                <div class="grid-2" style="gap: 2rem;">
                    <!-- Health Score Card -->
                    <div class="card" style="background: rgba(0,0,0,0.2); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); overflow: hidden; position: relative;">
                        <!-- Decorative gradient blob behind score -->
                        <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: ${this.getScoreColor(healthScore)}; filter: blur(80px); opacity: 0.15; border-radius: 50%;"></div>
                        
                        <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <h3 class="card-title"><i class="fa-solid fa-heart-pulse" style="color: ${this.getScoreColor(healthScore)};"></i> Vector Health Score</h3>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 2rem; padding: 2rem 1rem;">
                            <div style="position: relative; width: 160px; height: 160px; display: flex; align-items: center; justify-content: center;">
                                <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg); filter: drop-shadow(0 0 10px ${this.getScoreColor(healthScore)}50);">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2.5" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="${this.getScoreColor(healthScore)}" stroke-width="2.5" stroke-dasharray="${healthScore}, 100" style="transition: stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1);"/>
                                </svg>
                                <div style="position: absolute; text-align: center;">
                                    <div style="font-size: 3rem; font-weight: 800; color: ${this.getScoreColor(healthScore)}; line-height: 1;">${healthScore}</div>
                                    <div style="font-size: 0.85rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px;">Index</div>
                                </div>
                            </div>
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 0.75rem 0; font-size: 1.4rem; font-weight: 700;">${this.getScoreLabel(healthScore)}</h4>
                                <p style="font-size: 1rem; color: var(--text-secondary); line-height: 1.6;">${this.getScoreMessage(healthScore)}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Smart Insights List -->
                    <div class="card" style="background: rgba(0,0,0,0.2); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05);">
                         <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <h3 class="card-title"><i class="fa-solid fa-bolt" style="color: #FFAA00;"></i> Neural Recommendations</h3>
                         </div>
                         <ul style="list-style: none; display: flex; flex-direction: column; gap: 1rem; padding: 1.5rem;">
                            ${insights.map(item => `
                                <li style="display: flex; gap: 1.25rem; align-items: center; padding: 1rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); border-radius: 12px; transition: transform 0.2s ease, background 0.2s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.background='rgba(255,255,255,0.04)';" onmouseout="this.style.transform='translateY(0)'; this.style.background='rgba(255,255,255,0.02)';">
                                    <div style="background: ${item.bg}; color: ${item.color}; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-size: 1.2rem; flex-shrink: 0;"><i class="${item.icon}"></i></div>
                                    <div>
                                        <div style="font-weight: 600; font-size: 1.05rem; margin-bottom: 0.3rem; color: #fff;">${item.title}</div>
                                        <div style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">${item.desc}</div>
                                    </div>
                                </li>
                            `).join('')}
                         </ul>
                    </div>
                </div>

                <!-- Deep Dive Analytics -->
                <div class="grid-2" style="margin-top: 2rem; gap: 2rem;">
                    <div class="card" style="background: rgba(0,0,0,0.2); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05);">
                        <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <h3 class="card-title"><i class="fa-solid fa-chart-area text-success"></i> Trajectory Projection</h3>
                        </div>
                        <div style="padding: 2rem 1.5rem;">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 16px;">
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem;">Current Target</div>
                                    <div style="font-size: 1.8rem; font-weight: 700; color: #fff;">${user.currency}${savings.toFixed(2)}</div>
                                </div>
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center;">
                                    <i class="fa-solid fa-arrow-right" style="color: var(--color-success);"></i>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 0.9rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem;">Year End EOY</div>
                                    <div style="font-size: 1.8rem; font-weight: 700; color: var(--color-success);">${user.currency}${(savings * 12).toFixed(2)}</div>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span style="font-size: 0.9rem; font-weight: 500;">Velocity Rate</span>
                                    <span style="font-size: 0.9rem; font-weight: 700; color: var(--color-success);">${savingsRate.toFixed(1)}%</span>
                                </div>
                                <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
                                    <div style="width: ${Math.min(savingsRate, 100)}%; height: 100%; background: linear-gradient(90deg, #22c55e 0%, #34d399 100%); border-radius: 4px; box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);"></div>
                                </div>
                            </div>
                            <p style="font-size: 0.9rem; color: var(--text-secondary); text-align: center; margin-top: 1.5rem;"><i class="fa-solid fa-shield-halved" style="margin-right: 0.5rem;"></i> Based on an aggregate of your localized history.</p>
                        </div>
                    </div>

                    <div class="card" style="display: flex; flex-direction: column; height: 500px; background: rgba(0,0,0,0.2); backdrop-filter: blur(12px); border: 1px solid rgba(127, 86, 217, 0.3);">
                         <div class="card-header" style="border-bottom: 1px solid rgba(127, 86, 217, 0.2); background: rgba(127, 86, 217, 0.05);">
                            <h3 class="card-title"><i class="fa-solid fa-robot" style="color: #BF5AF2;"></i> Genesis AI Assistant</h3>
                        </div>
                        
                        <!-- Chat Area -->
                        <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 1.5rem; background: transparent; margin-bottom: 0;">
                            <!-- Welcome Message -->
                            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #7F56D9 0%, #BF5AF2 100%); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(127, 86, 217, 0.3);"><i class="fa-solid fa-robot" style="font-size: 1.2rem;"></i></div>
                                <div style="background: rgba(255,255,255,0.03); padding: 1rem 1.25rem; border-radius: 4px 16px 16px 16px; border: 1px solid rgba(255,255,255,0.05); max-width: 85%; line-height: 1.6; font-size: 0.95rem; color: #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                                    Greetings. I am Genesis, your neural financial copilot. What vectors of your portfolio shall we analyze today?
                                </div>
                            </div>
                        </div>

                        <!-- Input Area -->
                        <div style="display: flex; gap: 0.75rem; padding: 1rem 1.5rem; background: rgba(0,0,0,0.1); border-top: 1px solid rgba(255,255,255,0.05);">
                            <div style="flex: 1; position: relative;">
                                <i class="fa-solid fa-terminal" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); opacity: 0.5;"></i>
                                <input type="text" id="chat-input" class="auth-input" placeholder="Execute query..." style="margin-bottom: 0; width: 100%; border: 1px solid rgba(127, 86, 217, 0.3); background: rgba(0,0,0,0.2); color: #fff; border-radius: 12px; padding: 0.8rem 1rem 0.8rem 2.5rem; transition: all 0.2s;" onfocus="this.style.border='1px solid #BF5AF2'; this.style.boxShadow='0 0 0 3px rgba(191, 90, 242, 0.1)';" onblur="this.style.border='1px solid rgba(127, 86, 217, 0.3)'; this.style.boxShadow='none';" onkeypress="if(event.key === 'Enter') InsightsView.sendMessage()">
                            </div>
                            <button class="btn btn-primary" style="background: linear-gradient(135deg, #7F56D9 0%, #BF5AF2 100%); border: none; width: auto; padding: 0 1.5rem; border-radius: 12px; color: #fff; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onclick="InsightsView.sendMessage()">
                                <i class="fa-solid fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        const chatBox = document.getElementById('chat-messages');

        if (!message) return;

        // 1. Add User Message
        this.appendMessage('user', message);
        input.value = '';

        // 2. Show Loading
        const loadingId = this.appendMessage('ai', '<i class="fa-solid fa-spinner fa-spin"></i> Thinking...', true);

        try {
            // 3. Call Backend
            const response = await fetch('assets/api/chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });
            const data = await response.json();

            // 4. Update AI Message
            const loadingElem = document.getElementById(loadingId);
            if (loadingElem) {
                if (data.status === 'success') {
                    // Convert markdown-style **bold** to <b>bold</b> for basic formatting if needed, or just text
                    let formatted = data.reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                    loadingElem.innerHTML = formatted;
                } else {
                    loadingElem.innerHTML = `<span style="color: var(--color-danger);">Error: ${data.message}</span>`;
                    if (data.message.includes("API Key")) { // Hint for user
                        loadingElem.innerHTML += `<br><small>Did you paste your API Key in chat.php?</small>`;
                    }
                }
            }

        } catch (err) {
            console.error(err);
            const loadingElem = document.getElementById(loadingId);
            if (loadingElem) loadingElem.innerHTML = "Connection Error. Please try again.";
        }
    },

    appendMessage(sender, text, isTemp = false) {
        const chatBox = document.getElementById('chat-messages');
        const id = 'msg-' + Date.now();

        const isUser = sender === 'user';
        const bg = isUser ? 'linear-gradient(135deg, #7F56D9 0%, #BF5AF2 100%)' : 'rgba(255,255,255,0.03)';
        const color = isUser ? 'white' : '#e2e8f0';
        const radius = isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px';
        const border = isUser ? 'none' : '1px solid rgba(255,255,255,0.05)';
        const icon = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
        const avatarBg = isUser ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #7F56D9 0%, #BF5AF2 100%)';

        // Icon Logic
        const avatar = `<div style="width: 40px; height: 40px; background: ${avatarBg}; color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">${icon}</div>`;

        const html = `
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-direction: ${isUser ? 'row-reverse' : 'row'};">
                ${avatar}
                <div id="${id}" style="background: ${bg}; color: ${color}; padding: 1rem 1.25rem; border-radius: ${radius}; border: ${border}; max-width: 85%; box-shadow: 0 4px 15px rgba(0,0,0,0.1); line-height: 1.6; font-size: 0.95rem;">
                    ${text}
                </div>
            </div>
        `;

        chatBox.insertAdjacentHTML('beforeend', html);
        chatBox.scrollTop = chatBox.scrollHeight;
        return id;
    },

    getScoreColor(score) {
        if (score >= 80) return '#30D158'; // Success Green
        if (score >= 50) return '#FF9F0A'; // Warning Orange
        return '#FF453A'; // Danger Red
    },

    getScoreLabel(score) {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Attention';
    },

    getScoreMessage(score) {
        if (score >= 80) return 'You are mastering your finances! Your savings rate is strong and spending is under control.';
        if (score >= 60) return 'You are doing well, but there is room for optimization in your discretionary spending.';
        if (score >= 40) return 'You are getting by, but try to increase your savings buffer for better security.';
        return 'Critical: Your expenses are dangerously close to or exceeding your income. Immediate action needed.';
    },

    generateInsights(transactions, budgets) {
        const insights = [];

        // 1. Budget Alerts
        const overBudget = budgets.filter(b => b.spent > b.limit);
        if (overBudget.length > 0) {
            insights.push({
                title: 'Budget Overflow',
                desc: `You have exceeded the limit on ${overBudget[0].category}. Try to cut back for the rest of the month.`,
                icon: 'fa-solid fa-circle-exclamation',
                color: '#FF453A',
                bg: 'rgba(255, 69, 58, 0.1)'
            });
        } else {
            insights.push({
                title: 'On Track',
                desc: `Great job! All your category budgets are within limits so far.`,
                icon: 'fa-solid fa-circle-check',
                color: '#30D158',
                bg: 'rgba(48, 209, 88, 0.1)'
            });
        }

        // 2. Spending Pattern (Mock Logic based on recent txn)
        if (transactions.length > 0) {
            const recent = transactions[0];
            insights.push({
                title: 'Recent Activity',
                desc: `You just spent ${recent.amount < 0 ? Math.abs(recent.amount) : 0} on ${recent.category}. This fits your usual pattern.`,
                icon: 'fa-solid fa-wallet',
                color: '#0A84FF',
                bg: 'rgba(10, 132, 255, 0.1)'
            });
        }

        // 3. Investment Tip
        insights.push({
            title: 'Investment Opportunity',
            desc: 'Based on market trends, consider diversifying into Green Energy ETFs this month.',
            icon: 'fa-solid fa-arrow-trend-up',
            color: '#BF5AF2', // Purple
            bg: 'rgba(191, 90, 242, 0.1)'
        });

        return insights;
    },

    /**
     * Load and display stock market predictions
     */
    async loadPredictions(market = 'NSE') {
        const container = document.getElementById('predictions-container');
        
        // Show loading state
        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; color: var(--text-secondary); padding: 2rem;">
                <i class="fa-solid fa-spinner fa-spin"></i> Analyzing ${market} market trends...
            </div>
        `;

        try {
            // Fetch predictions from API
            const response = await fetch(`assets/api/getStockPredictions.php?market=${market}&limit=10`);
            const data = await response.json();

            if (data.success && data.predictions && data.predictions.length > 0) {
                // Render predictions
                container.innerHTML = this.renderPredictions(data);
                
                // Refresh data every 5 minutes
                setTimeout(() => this.loadPredictions(market), 5 * 60 * 1000);
            } else {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <i class="fa-solid fa-triangle-exclamation" style="color: #FF9F0A; font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        <p style="color: var(--text-secondary); margin: 0;">No predictions available at this time.</p>
                        <small style="color: var(--text-secondary); opacity: 0.7;">Please ensure API keys are configured.</small>
                    </div>
                `;
            }
        } catch (err) {
            console.error('Error loading predictions:', err);
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fa-solid fa-circle-exclamation" style="color: #FF453A; font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    <p style="color: #FF453A; margin: 0;">Failed to load predictions</p>
                    <small style="color: var(--text-secondary);">${err.message}</small>
                </div>
            `;
        }
    },

    /**
     * Render predictions list
     */
    renderPredictions(data) {
        if (!data.predictions || data.predictions.length === 0) {
            return '<p style="text-align: center; color: var(--text-secondary);">No predictions available</p>';
        }

        const predictions = data.predictions.map(pred => this.renderPredictionCard(pred)).join('');
        
        return `
            <div style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(34, 197, 94, 0.1);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; font-size: 0.9rem;">
                    <div>
                        <span style="color: var(--text-secondary);">Market: <strong>${data.market}</strong></span>
                        <span style="margin-left: 1.5rem; color: var(--text-secondary);">Data Sources: ${data.data_sources.join(', ')}</span>
                    </div>
                    <span style="color: #22c55e; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Updated: ${new Date(data.timestamp).toLocaleTimeString()}</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                ${predictions}
            </div>

            <div style="margin-top: 2rem; padding: 1rem; background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.15); border-radius: 12px; font-size: 0.9rem; color: var(--text-secondary);">
                <i class="fa-solid fa-info-circle" style="color: #22c55e; margin-right: 0.5rem;"></i>
                <strong>Disclaimer:</strong> These predictions are AI-generated based on technical analysis and historical patterns. They should not be considered financial advice. Always conduct your own research before investing.
            </div>
        `;
    },

    /**
     * Render individual prediction card
     */
    renderPredictionCard(prediction) {
        const symbol = prediction.symbol || 'UNKNOWN';
        const pred = prediction.prediction || 'HOLD';
        const confidence = prediction.confidence || '0%';
        const targetChange = prediction.target_price_change || 'N/A';
        const reasoning = prediction.reasoning || 'Neutral technical setup';
        const timeframe = prediction.timeframe || 'N/A';
        const technicalScore = prediction.technical_score || 50;

        // Color coding based on prediction
        let predColor, predBg, predIcon;
        if (pred === 'BUY') {
            predColor = '#22c55e';
            predBg = 'rgba(34, 197, 94, 0.1)';
            predIcon = 'fa-arrow-trend-up';
        } else if (pred === 'SELL') {
            predColor = '#FF453A';
            predBg = 'rgba(255, 69, 58, 0.1)';
            predIcon = 'fa-arrow-trend-down';
        } else {
            predColor = '#FFB800';
            predBg = 'rgba(255, 152, 0, 0.1)';
            predIcon = 'fa-pause';
        }

        return `
            <div style="background: ${predBg}; border: 1px solid ${predColor}33; border-radius: 14px; padding: 1.5rem; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 30px ${predColor}20';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                <!-- Header -->
                <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem;">
                    <div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem;">${symbol}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">${timeframe}</div>
                    </div>
                    <div style="background: ${predColor}1a; border-radius: 12px; padding: 0.75rem 1rem; text-align: center;">
                        <div style="color: ${predColor}; font-weight: 700; font-size: 1.1rem; margin-bottom: 0.25rem;">${pred}</div>
                        <div style="color: ${predColor}; font-size: 0.8rem; opacity: 0.8;">${confidence}</div>
                    </div>
                </div>

                <!-- Technical Score Bar -->
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.5rem;">
                        <span style="color: var(--text-secondary);">Technical Score</span>
                        <span style="color: ${predColor}; font-weight: 600;">${technicalScore.toFixed(1)}/100</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${technicalScore}%; height: 100%; background: linear-gradient(90deg, ${predColor} 0%, ${predColor}cc 100%); border-radius: 4px;"></div>
                    </div>
                </div>

                <!-- Target Price Change -->
                <div style="background: rgba(0,0,0,0.2); border-radius: 10px; padding: 1rem; margin-bottom: 1rem; text-align: center;">
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Target Price Range</div>
                    <div style="font-size: 1.2rem; font-weight: 700; color: ${predColor};">${targetChange}</div>
                </div>

                <!-- Reasoning -->
                <div style="padding: 1rem; background: rgba(0,0,0,0.1); border-radius: 10px; border-left: 3px solid ${predColor}; margin-bottom: 1rem;">
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Analysis</div>
                    <div style="font-size: 0.95rem; color: #e2e8f0; line-height: 1.5;">${reasoning}</div>
                </div>

                <!-- Action Button -->
                <button style="width: 100%; padding: 0.75rem; background: linear-gradient(135deg, ${predColor} 0%, ${predColor}cc 100%); border: none; border-radius: 10px; color: #fff; font-weight: 600; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" onclick="alert('View ${symbol} details in Investments page')">
                    View Details → 
                </button>
            </div>
        `;
    },

    /**
     * Initialize predictions on page load
     */
    init() {
        // Auto-load predictions when insights page is rendered
        setTimeout(() => {
            const selector = document.getElementById('market-selector');
            if (selector) {
                this.loadPredictions(selector.value);
            }
        }, 500);
    }
};
