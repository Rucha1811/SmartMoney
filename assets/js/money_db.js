/**
 * MoneyDB - A mock client-side database using localStorage
 * Simulates a backend for SmartMoney X
 */

const MoneyDB = {
    key: 'smartmoney_db_v1',

    // Initial Seed Data
    seedData: {
        user: {
            id: 1,
            name: "Tejas Gandhi",
            email: "tejas@example.com",
            plan: "Premium",
            avatar: "TG",
            currency: "$"
        },
        transactions: [
            { id: 1, title: "Apple Store", category: "Shopping", date: "2023-10-24", amount: -1299.00, type: "expense", icon: "fa-brands fa-apple" },
            { id: 2, title: "Salary Deposit", category: "Income", date: "2023-10-25", amount: 4500.00, type: "income", icon: "fa-solid fa-building-columns" },
            { id: 3, title: "Netflix Subscription", category: "Entertainment", date: "2023-10-26", amount: -15.99, type: "expense", icon: "fa-solid fa-film" },
            { id: 4, title: "Uber Ride", category: "Transport", date: "2023-10-27", amount: -24.50, type: "expense", icon: "fa-solid fa-car" },
            { id: 5, title: "Freelance Project", category: "Income", date: "2023-10-28", amount: 1200.00, type: "income", icon: "fa-solid fa-laptop-code" },
        ],
        portfolio: {
            stocks: [
                { symbol: "AAPL", name: "Apple Inc.", shares: 10, avgPrice: 145.00, currentPrice: 173.50, change: 1.25 },
                { symbol: "TSLA", name: "Tesla Inc.", shares: 5, avgPrice: 200.00, currentPrice: 215.30, change: -0.85 },
                { symbol: "NVDA", name: "NVIDIA Corp.", shares: 8, avgPrice: 420.00, currentPrice: 460.10, change: 2.40 },
            ],
            crypto: [
                { symbol: "BTC", name: "Bitcoin", shares: 0.15, avgPrice: 28000, currentPrice: 34500, change: 5.2 },
                { symbol: "ETH", name: "Ethereum", shares: 2.5, avgPrice: 1600, currentPrice: 1850, change: 1.8 }
            ]
        },
        stats: {
            netWorth: 84520.50,
            monthlyIncome: 6200.00,
            monthlyExpense: 2450.00,
            savingsRate: 45
        },
        budgets: [
            { id: 1, category: "Shopping", limit: 500.00, spent: 350.00, color: "var(--color-primary)" },
            { id: 2, category: "Entertainment", limit: 100.00, spent: 85.00, color: "var(--color-secondary)" },
            { id: 3, category: "Transport", limit: 200.00, spent: 120.50, color: "var(--color-warning)" },
            { id: 4, category: "Food", limit: 600.00, spent: 450.00, color: "var(--color-accent)" }
        ]
    },

    init() {
        if (!localStorage.getItem(this.key)) {
            console.log('MoneyDB: Seeding initial data...');
            this.save(this.seedData);
        }
    },

    get() {
        return JSON.parse(localStorage.getItem(this.key)) || this.seedData;
    },

    save(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
    },

    // --- Helpers ---

    getUser() {
        return this.get().user;
    },

    getTransactions() {
        return this.get().transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    addTransaction(tx) {
        const db = this.get();
        tx.id = Date.now();
        db.transactions.unshift(tx);

        // Ensure stats and budgets objects exist
        if (!db.stats) db.stats = { monthlyIncome: 0, monthlyExpense: 0, netWorth: 0, savingsRate: 0 };
        if (!db.budgets) db.budgets = [];

        // Update stats roughly
        if (tx.type === 'income') {
            db.stats.monthlyIncome += tx.amount;
        } else {
            db.stats.monthlyExpense += Math.abs(tx.amount);

            // Update budget spent calculation (simple match)
            if (db.budgets && Array.isArray(db.budgets)) {
                const budget = db.budgets.find(b => b.category === tx.category);
                if (budget) {
                    budget.spent += Math.abs(tx.amount);
                }
            }
        }

        this.save(db);
        return tx;
    },

    getPortfolio() {
        return this.get().portfolio;
    },

    getStats() {
        return this.get().stats;
    },

    getBudgets() {
        return this.get().budgets || [];
    },

    addBudget(budget) {
        const db = this.get();
        budget.id = Date.now();
        budget.spent = 0; // New budget starts at 0
        if (!db.budgets) db.budgets = [];
        db.budgets.push(budget);
        this.save(db);
        return budget;
    },

    // --- Live Stats (fetch from API) ---
    async getLiveStats() {
        try {
            const response = await fetch('assets/api/getLiveStats.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            
            if (result.status === 'success' && result.data) {
                // Update local stats with live data
                const db = this.get();
                db.stats = {
                    ...db.stats,
                    netWorth: result.data.netWorth || db.stats.netWorth,
                    monthlyIncome: result.data.monthlyIncome || db.stats.monthlyIncome,
                    monthlyExpense: result.data.monthlyExpense || db.stats.monthlyExpense,
                    savingsRate: result.data.savingsRate || db.stats.savingsRate,
                    accountBalance: result.data.accountBalance,
                    investmentValue: result.data.investmentValue,
                    expenseChangePercent: result.data.expenseChangePercent || 0,
                    insight: result.data.insight || 'Add transactions to get insights',
                    lastUpdated: new Date().toLocaleTimeString()
                };
                this.save(db);
                return db.stats;
            } else {
                console.error('Invalid response from getLiveStats:', result);
                return this.getStats();
            }
        } catch (error) {
            console.error('Failed to fetch live stats:', error);
            return this.getStats();
        }
    }
};
