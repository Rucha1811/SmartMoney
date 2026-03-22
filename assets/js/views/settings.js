window.SettingsView = {
    render() {
        const user = MoneyDB.getUser();

        return `
            <div class="card" style="max-width: 800px; margin: 0 auto; background: var(--bg-card); border-radius: 24px; box-shadow: var(--shadow-md);">
                <div class="card-header" style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 1.5rem; margin-bottom: 2rem;">
                    <h3 class="card-title" style="font-size: 1.5rem;"><i class="fa-solid fa-sliders text-primary"></i> App Settings</h3>
                </div>
                
                <!-- Profile Section -->
                <div style="padding-bottom: 2rem; border-bottom: 1px solid var(--border-subtle); margin-bottom: 2rem;">
                    <h4 style="margin-bottom: 1.5rem; font-size: 1.1rem; color: var(--text-primary);">Profile Match</h4>
                    <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 2rem;">
                         <div style="width: 90px; height: 90px; border-radius: 20px; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white; font-weight: 800; box-shadow: 0 10px 25px rgba(var(--color-primary-rgb), 0.3); flex-shrink: 0;">
                            ${user.avatar}
                         </div>
                         <div style="flex: 1; min-width: 250px;">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;">
                                <div>
                                    <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-secondary);">Full Name</label>
                                    <input type="text" value="${user.name}">
                                </div>
                                <div>
                                    <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-secondary);">Email</label>
                                    <input type="email" value="${user.email}">
                                </div>
                            </div>
                         </div>
                    </div>
                </div>

                <!-- Appearance -->
                <div style="padding-bottom: 2rem; border-bottom: 1px solid var(--border-subtle); margin-bottom: 2rem;">
                    <h4 style="margin-bottom: 1.5rem; font-size: 1.1rem; color: var(--text-primary);">Theme Engine</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
                        <button class="btn btn-secondary" onclick="SettingsView.setTheme('dark-pro')" style="display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem; gap: 1rem; border-radius: 16px; border: 1px solid var(--border-subtle); transition: transform 0.2s;">
                            <i class="fa-solid fa-moon" style="font-size: 2rem; color: #3b82f6;"></i>
                            <span style="font-weight: 600;">Midnight Obsidian</span>
                        </button>
                        <button class="btn btn-secondary" onclick="SettingsView.setTheme('light-professional')" style="display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem; gap: 1rem; border-radius: 16px; border: 1px solid var(--border-subtle); transition: transform 0.2s;">
                            <i class="fa-solid fa-sun" style="font-size: 2rem; color: #f59e0b;"></i>
                            <span style="font-weight: 600;">Nordic Frost</span>
                        </button>
                        <button class="btn btn-secondary" onclick="SettingsView.setTheme('glass')" style="display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem; gap: 1rem; border-radius: 16px; border: 1px solid var(--border-subtle); transition: transform 0.2s;">
                            <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 2rem; color: #d946ef;"></i>
                            <span style="font-weight: 600;">Cyberware</span>
                        </button>
                    </div>
                </div>

                <!-- Data Management -->
                <div>
                    <h4 style="margin-bottom: 1rem; color: var(--color-accent); font-size: 1.1rem;">Danger Zone</h4>
                    <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Manage your local data.</p>
                    
                    <button class="btn" onclick="SettingsView.resetData()" style="background: rgba(244, 63, 94, 0.1); color: var(--color-accent); border: 1px solid rgba(244, 63, 94, 0.2); padding: 1rem 2rem;">
                        <i class="fa-solid fa-trash"></i> Reset Database
                    </button>
                    <p style="font-size: 0.85rem; margin-top: 1rem; color: var(--text-tertiary);">This will clear all transactions and reset to default seed data.</p>
                </div>
            </div>
        `;
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('smartmoney_theme', theme);
        // Dispatch event for other components if needed
        window.location.reload(); // Simple reload to apply cleanly
    },

    resetData() {
        if (confirm("Are you sure? This will wipe all your custom data and restore the defaults.")) {
            localStorage.removeItem(MoneyDB.key);
            window.location.reload();
        }
    }
};
