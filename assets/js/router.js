/**
 * Router - Simple Hash-based routing for SPA
 */

const Router = {
    routes: {},
    defaultRoute: 'dashboard',
    viewContainer: null,

    init() {
        this.viewContainer = document.getElementById('view-container');

        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    },

    add(path, handler) {
        this.routes[path] = handler;
    },

    async handleRoute() {
        let hash = window.location.hash.slice(1) || this.defaultRoute;

        // Ensure sidebar is visible on non-auth pages by removing auth-mode
        if (hash !== 'login' && hash !== 'register' && hash !== 'forgot-password') {
            document.getElementById('app-shell')?.classList.remove('auth-mode');
        }

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('href') === `#${hash}`) {
                el.classList.add('active');
            }
        });

        // Handle 404
        if (!this.routes[hash]) {
            console.warn(`Route ${hash} not found, redirecting to default.`);
            hash = this.defaultRoute;
        }

        // Render View
        this.viewContainer.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';

        try {
            const content = await this.routes[hash]();
            this.viewContainer.innerHTML = content;

            // Initialize charts if on dashboard
            if (hash === 'dashboard' && window.ChartsModule) {
                setTimeout(() => ChartsModule.init(), 100);
            }

            // Initialize predictions if on insights page
            if (hash === 'insights' && window.InsightsView && window.InsightsView.init) {
                setTimeout(() => InsightsView.init(), 100);
            }

            // Allow views to run post-render scripts if needed (simple event dispatch)
            window.dispatchEvent(new CustomEvent('viewLoaded', { detail: { view: hash } }));

            // Update Page Title
            const title = hash.charAt(0).toUpperCase() + hash.slice(1);
            document.getElementById('page-title').innerText = title;

        } catch (e) {
            console.error("Error loading view:", e);
            this.viewContainer.innerHTML = `<p class="error">Error loading view: ${e.message}</p>`;
        }
    }
};
