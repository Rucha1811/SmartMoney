window.ForgotPasswordView = {
    render() {
        document.getElementById('app-shell').classList.add('auth-mode');

        return `
            <div class="auth-wrapper">
                <!-- Branding Panel -->
                <div class="auth-brand-panel">
                    <div class="brand-header">
                        <div class="brand-logo-circle">
                            <i class="fa-solid fa-key"></i>
                        </div>
                        <div>
                            <h2 style="font-size: 1.5rem; margin:0;">Account Recovery</h2>
                            <span style="opacity: 0.8; font-size: 0.9rem;">Secure Password Reset</span>
                        </div>
                    </div>
                    
                    <div class="feature-list">
                         <div class="feature-item">
                            <div class="feature-icon"><i class="fa-solid fa-envelope-circle-check"></i></div>
                            <div class="feature-text">
                                <h4>Email Verification</h4>
                                <p>We'll send a secure link to your inbox</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon"><i class="fa-solid fa-shield-halved"></i></div>
                            <div class="feature-text">
                                <h4>Account Security</h4>
                                <p>Your data is protected with encryption</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form Panel -->
                <div class="auth-form-panel">
                    <div class="auth-form-container">
                        <div style="text-align: center; margin-bottom: 2rem;">
                             <div style="width: 60px; height: 60px; background: rgba(127, 86, 217, 0.1); color: #7F56D9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 1rem auto;">
                                <i class="fa-solid fa-lock"></i>
                            </div>
                            <h1 class="auth-title">Forgot Password?</h1>
                            <p class="auth-subtitle">No worries, we'll send you reset instructions.</p>
                        </div>
                        
                        <form onsubmit="ForgotPasswordView.handleSubmit(event)">
                            <div class="form-group">
                                <label class="form-label">Email Address</label>
                                <input type="email" id="reset-email" class="auth-input" placeholder="Enter your email" required>
                            </div>
                            
                            <button type="submit" class="btn-auth">
                                Send Reset Link <i class="fa-solid fa-paper-plane" style="margin-left: 0.5rem;"></i>
                            </button>
                        </form>

                        <div class="auth-footer">
                            <a href="#login" class="auth-link"><i class="fa-solid fa-arrow-left"></i> Back to Login</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    handleSubmit(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const email = document.getElementById('reset-email').value;

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;

        // Simulation
        setTimeout(() => {
            alert(`If an account exists for ${email}, we have sent a password reset link.`);
            window.location.hash = '#login';
        }, 1500);
    }
};
