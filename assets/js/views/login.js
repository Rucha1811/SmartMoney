window.LoginView = {
    render() {
        // Apply auth mode layout fixes
        document.getElementById('app-shell').classList.add('auth-mode');

        return `
            <div class="auth-wrapper">
                <!-- Branding Panel -->
                <div class="auth-brand-panel">
                    <div class="brand-header">
                        <div class="brand-logo-circle">
                            <i class="fa-solid fa-sack-dollar"></i>
                        </div>
                        <div>
                            <h2 style="font-size: 1.5rem; margin:0;">SmartMoney X</h2>
                            <span style="opacity: 0.8; font-size: 0.9rem;">Smart Money Management</span>
                        </div>
                    </div>
                    
                    <div class="feature-list">
                         <div class="feature-item">
                            <div class="feature-icon"><i class="fa-solid fa-chart-column"></i></div>
                            <div class="feature-text">
                                <h4>Smart Analytics</h4>
                                <p>Get deeper insights on your spending patterns</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon"><i class="fa-solid fa-bullseye"></i></div>
                            <div class="feature-text">
                                <h4>Goal Tracking</h4>
                                <p>Track your financial goals in real time</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon"><i class="fa-solid fa-lightbulb"></i></div>
                            <div class="feature-text">
                                <h4>Learn & Grow</h4>
                                <p>Educational resources on financial literacy</p>
                            </div>
                        </div>
                         <div class="feature-item">
                            <div class="feature-icon"><i class="fa-solid fa-trophy"></i></div>
                            <div class="feature-text">
                                <h4>Gamified Rewards</h4>
                                <p>Earn rewards for achieving your goals</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form Panel -->
                <div class="auth-form-panel">
                    <div class="auth-form-container">
                        <h1 class="auth-title">Welcome Back</h1>
                        <p class="auth-subtitle">Login to access your financial dashboard</p>
                        
                        <form onsubmit="LoginView.handleLogin(event)" method="POST">
                            <div class="form-group">
                                <label class="form-label">Email Address</label>
                                <input type="email" class="auth-input" placeholder="tejas@example.com" autocomplete="email" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Password</label>
                                <input type="password" class="auth-input" placeholder="password" autocomplete="current-password" required>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; font-size: 0.9rem;">
                                <div class="checkbox-group" style="margin-bottom: 0;">
                                    <input type="checkbox" id="remember">
                                    <label for="remember" style="color: var(--text-secondary);">Remember me</label>
                                </div>
                                <a href="#forgot-password" class="auth-link">Forgot Password?</a>
                            </div>

                            <button type="submit" class="btn-auth">
                                Sign In <i class="fa-solid fa-arrow-right" style="margin-left: 0.5rem;"></i>
                            </button>
                        </form>

                        <div class="auth-footer">
                            Don't have an account? <a href="#register" class="auth-link">Sign up</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    handleLogin(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalText = btn.innerHTML;

        const emailInput = e.target.querySelector('input[type="email"]');
        const passwordInput = e.target.querySelector('input[type="password"]');
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validation
        if (!ViewUtils.isValidEmail(email)) {
            ViewUtils.showToast('Please enter a valid email address', 'error');
            return;
        }

        if (!password) {
            ViewUtils.showToast('Please enter your password', 'error');
            return;
        }

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
        btn.disabled = true;

        // Real API Call
        ViewUtils.apiCall('assets/api/login.php', {
            method: 'POST',
            body: {
                email: email,
                password: password
            }
        })
            .then(data => {
                // Save Session to LocalStorage for App.js to read
                const dbData = MoneyDB.get();
                dbData.user = data.user;
                MoneyDB.save(dbData);

                localStorage.setItem('smartmoney_auth', 'true');

                document.getElementById('app-shell').classList.remove('auth-mode');
                ViewUtils.showToast('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.hash = '#dashboard';
                    window.location.reload();
                }, 1000);
            })
            .catch(error => {
                console.error('Login Error:', error);
                ViewUtils.showToast(error.message || "Login failed. Please try again.", 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
    }
};
