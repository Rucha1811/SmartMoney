/**
 * App - Main Application Entry Point
 */

const App = {
    init() {
        console.log('SmartMoney X: Initializing...');

        // 1. Initialize Database
        MoneyDB.init();

        // 2. Load User Profile
        this.loadProfile();

        // 3. Initialize Router & Views
        this.setupRoutes();

        // 4. Initialize Theme Engine
        this.setupTheme();

        // 5. Global Event Listeners
        this.setupEventListeners();

        // 6. Security Check
        this.checkAuth();
    },

    checkAuth() {
        const isAuth = localStorage.getItem('smartmoney_auth');
        const hash = window.location.hash.slice(1);

        // If not authenticated and not on login page, redirect
        if (!isAuth && hash !== 'login' && hash !== 'register' && hash !== 'forgot-password') {
            window.location.hash = '#login';
        }

        // If authenticated and on login page, redirect to dashboard
        if (isAuth && (hash === 'login' || hash === 'register' || hash === 'forgot-password')) {
            window.location.hash = '#dashboard';
        }
    },

    logout() {
        localStorage.removeItem('smartmoney_auth');
        window.location.hash = '#login';
        window.location.reload();
    },

    loadProfile() {
        const user = MoneyDB.getUser();
        if (user) {
            document.querySelector('.user-info .name').textContent = user.name;
            document.querySelector('.user-info .plan').textContent = user.plan;
            document.querySelector('.avatar').textContent = user.avatar;
        }
    },

    setupRoutes() {
        Router.init();

        // Dashboard View
        Router.add('dashboard', async () => {
            if (window.DashboardView) return window.DashboardView.render();
            await this.loadScript('assets/js/views/dashboard.js');
            return window.DashboardView.render();
        });

        // Transactions View
        Router.add('transactions', async () => {
            if (window.TransactionsView) return window.TransactionsView.render();
            await this.loadScript('assets/js/views/transactions.js');
            return window.TransactionsView.render();
        });

        // Investments View
        Router.add('investments', async () => {
            if (window.InvestmentsView) return window.InvestmentsView.render();
            await this.loadScript('assets/js/views/investments.js');
            return window.InvestmentsView.render();
        });

        // Goals View
        Router.add('goals', async () => {
            if (window.GoalsView) return window.GoalsView.render();
            await this.loadScript('assets/js/views/goals.js');
            return window.GoalsView.render();
        });

        // Subscriptions View
        Router.add('subscriptions', async () => {
            if (window.SubscriptionsView) return window.SubscriptionsView.render();
            await this.loadScript('assets/js/views/subscriptions.js');
            return window.SubscriptionsView.render();
        });

        // Virtual Trading View
        Router.add('trading', async () => {
            if (window.TradingView) return window.TradingView.render();
            await this.loadScript('assets/js/views/trading.js');
            return window.TradingView.render();
        });

        // AI Insights View
        Router.add('insights', async () => {
            if (window.InsightsView) return window.InsightsView.render();
            await this.loadScript('assets/js/views/insights.js');
            return window.InsightsView.render();
        });

        // Register View
        Router.add('register', async () => {
            if (window.RegisterView) return window.RegisterView.render();
            await this.loadScript('assets/js/views/register.js');
            return window.RegisterView.render();
        });

        // Login View
        Router.add('login', async () => {
            if (window.LoginView) return window.LoginView.render();
            await this.loadScript('assets/js/views/login.js');
            return window.LoginView.render();
        });

        // Forgot Password View
        Router.add('forgot-password', async () => {
            if (window.ForgotPasswordView) return window.ForgotPasswordView.render();
            await this.loadScript('assets/js/views/forgot_password.js');
            return window.ForgotPasswordView.render();
        });

        // Settings View
        Router.add('settings', async () => {
            if (window.SettingsView) return window.SettingsView.render();
            await this.loadScript('assets/js/views/settings.js');
            return window.SettingsView.render();
        });

        // Reports View
        Router.add('reports', async () => {
            if (window.ReportsView) return window.ReportsView.render();
            await this.loadScript('assets/js/views/reports.js');
            return window.ReportsView.render();
        });

        // Budget View
        Router.add('budget', async () => {
            if (window.BudgetView) return window.BudgetView.render();
            await this.loadScript('assets/js/views/budget.js');
            return window.BudgetView.render();
        });
    },

    setupTheme() {
        const toggleBtn = document.getElementById('theme-toggle');
        const themes = ['dark-pro', 'light-professional', 'glass'];
        let currentThemeIndex = 0;

        // Restore theme
        const savedTheme = localStorage.getItem('smartmoney_theme');
        if (savedTheme && themes.includes(savedTheme)) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            currentThemeIndex = themes.indexOf(savedTheme);
            this.updateThemeIcon(savedTheme);
        }

        toggleBtn.addEventListener('click', () => {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            const newTheme = themes[currentThemeIndex];

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('smartmoney_theme', newTheme);
            this.updateThemeIcon(newTheme);

            // Notify components that the theme changed
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));

            // Refresh all charts with new theme colors
            setTimeout(() => {
                // Refresh main ChartsModule (dashboard's expense/budget/trend charts)
                if (window.ChartsModule) {
                    window.ChartsModule.refreshAll();
                }

                // Refresh the currently active view's charts
                const hash = window.location.hash.slice(1) || 'dashboard';
                const viewMap = {
                    'dashboard': 'DashboardView',
                    'transactions': 'TransactionsView',
                    'investments': 'InvestmentsView',
                    'trading': 'TradingView',
                    'goals': 'GoalsView',
                    'subscriptions': 'SubscriptionsView',
                    'budget': 'BudgetView',
                    'reports': 'ReportsView'
                };

                const viewName = viewMap[hash];
                if (viewName && window[viewName]) {
                    // Destroy old charts first if the view supports it
                    if (typeof window[viewName].destroyCharts === 'function') {
                        window[viewName].destroyCharts();
                    }
                    // Re-render charts with new theme colors
                    if (typeof window[viewName].afterRender === 'function') {
                        window[viewName].afterRender();
                    }
                    // Reports uses loadCharts instead of afterRender
                    if (viewName === 'ReportsView' && typeof window[viewName].loadCharts === 'function') {
                        window[viewName].loadCharts();
                    }
                }
            }, 150);
        });
    },

    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle i');
        icon.className = '';
        if (theme === 'dark-pro') icon.className = 'fa-solid fa-moon';
        else if (theme === 'light-professional') icon.className = 'fa-solid fa-sun';
        else if (theme === 'glass') icon.className = 'fa-solid fa-wand-magic-sparkles';
    },

    setupEventListeners() {
        // Mobile Menu
        const menuBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.getElementById('sidebar');

        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuBtn.contains(e.target) && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                }
            }

            // Close notification dropdown when clicking outside
            const notifDropdown = document.getElementById('notification-dropdown');
            const notifBtn = document.getElementById('btn-notifications');
            if (notifDropdown && notifDropdown.classList.contains('active')) {
                if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
                    notifDropdown.classList.remove('active');
                }
            }
        });

        // Notifications Toggle
        const notifBtn = document.getElementById('btn-notifications');
        if (notifBtn) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('notification-dropdown');
                dropdown.classList.toggle('active');
            });
        }

        // Settings Navigation
        const settingsBtn = document.getElementById('btn-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                window.location.hash = '#settings';
            });
        }

        // Add Logout Button to Navigation
        const navUl = document.querySelector('.main-nav ul');
        const existingLogout = navUl.querySelector('[onclick*="logout"]');
        if (!existingLogout) {
            const logoutBtn = document.createElement('li');
            logoutBtn.innerHTML = `<a href="#" class="nav-item" onclick="App.logout(); return false;"><i class="fa-solid fa-right-from-bracket"></i> <span>Logout</span></a>`;
            navUl.appendChild(logoutBtn);
        }

        // View Loaded Handler (trigger afterRender)
        window.addEventListener('viewLoaded', (e) => {
            const view = e.detail.view;
            // Convert kebab-case to PascalCase (e.g. 'forgot-password' -> 'ForgotPasswordView')
            const viewName = view.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'View';

            if (window[viewName] && typeof window[viewName].afterRender === 'function') {
                window[viewName].afterRender();
            }
        });
    },

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve(); // Already loaded
                return;
            }
            const script = document.createElement('script');
            script.src = src + '?v=10'; // Force reload v10
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
};

// Start App
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
