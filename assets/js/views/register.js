window.RegisterView = {
    render() {
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
                        <h1 class="auth-title">Get Started</h1>
                        <p class="auth-subtitle">Create your SmartMoney X account</p>
                        
                        <form onsubmit="RegisterView.handleRegister(event)">
                            <div class="form-group">
                                <label class="form-label">Full Name</label>
                                <input type="text" id="reg-name" class="auth-input" placeholder="e.g. Rucha Gandhi" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Email Address</label>
                                <input type="email" id="reg-email" class="auth-input" placeholder="e.g. r12@gmail.com" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Password</label>
                                <input type="password" class="auth-input" placeholder="********" minlength="8" required>
                                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">Minimum 8 characters recommended</div>
                            </div>
                            
                             <div class="form-group">
                                <label class="form-label">Confirm Password</label>
                                <input type="password" class="auth-input" placeholder="********" required>
                            </div>
                            
                            <div class="checkbox-group">
                                <input type="checkbox" id="terms" required checked>
                                <label for="terms" style="color: var(--text-secondary); font-size: 0.9rem;">I agree to the Terms & Conditions</label>
                            </div>

                            <button type="submit" class="btn-auth">
                                Create Account <i class="fa-solid fa-arrow-right" style="margin-left: 0.5rem;"></i>
                            </button>
                        </form>

                        <div class="auth-footer">
                            Already have an account? <a href="#login" class="auth-link">Sign in</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    handleRegister(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const nameInput = document.getElementById('reg-name');
        const emailInput = document.getElementById('reg-email');
        const passwordInput = e.target.querySelectorAll('input[type="password"]')[0];
        const confirmPasswordInput = e.target.querySelectorAll('input[type="password"]')[1];
        const termsCheckbox = document.getElementById('terms');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validation
        if (!name || name.length < 2) {
            ViewUtils.showToast('Please enter a valid name (at least 2 characters)', 'error');
            return;
        }

        if (!ViewUtils.isValidEmail(email)) {
            ViewUtils.showToast('Please enter a valid email address', 'error');
            return;
        }

        if (!ViewUtils.isValidPassword(password)) {
            ViewUtils.showToast('Password must be at least 6 characters long', 'error');
            return;
        }

        if (password !== confirmPassword) {
            ViewUtils.showToast('Passwords do not match', 'error');
            return;
        }

        if (!termsCheckbox.checked) {
            ViewUtils.showToast('Please accept the Terms & Conditions', 'error');
            return;
        }

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';
        btn.disabled = true;

        // Real API Call
        ViewUtils.apiCall('assets/api/register.php', {
            method: 'POST',
            body: {
                name: name,
                email: email,
                password: password
            }
        })
            .then(data => {
                // Save Session to LocalStorage for App.js to read
                const dbData = MoneyDB.get();
                dbData.user = data.user;
                MoneyDB.save(dbData);

                localStorage.setItem('smartmoney_auth', 'true'); // Session Flag

                document.getElementById('app-shell').classList.remove('auth-mode');
                ViewUtils.showToast('Account created successfully! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.hash = '#dashboard';
                    window.location.reload();
                }, 1000);
            })
            .catch(error => {
                console.error('Registration Error:', error);
                ViewUtils.showToast(error.message || "Registration failed. Please try again.", 'error');
                btn.innerHTML = 'Create Account <i class="fa-solid fa-arrow-right" style="margin-left: 0.5rem;"></i>';
                btn.disabled = false;
            });
    }
};
