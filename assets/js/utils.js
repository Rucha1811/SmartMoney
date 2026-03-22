/**
 * ViewUtils - Shared utilities for views
 */
window.ViewUtils = {
    /**
     * Format currency with dollar sign and commas
     */
    formatCurrency(amount) {
        const num = parseFloat(amount);
        if (isNaN(num)) return '$0.00';
        return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    /**
     * Format date to readable string
     */
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Remove existing toasts
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;

        const icon = type === 'success' ? 'fa-circle-check' :
            type === 'error' ? 'fa-circle-exclamation' :
                'fa-circle-info';

        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Show error message in container
     */
    showError(container, title, message) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--color-danger);">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>${title}</h3>
                <p style="color: var(--text-secondary);">${message}</p>
                <button class="btn btn-secondary" onclick="window.location.reload()" style="margin-top: 1rem;">
                    <i class="fa-solid fa-rotate-right"></i> Retry
                </button>
            </div>
        `;
    },

    /**
     * Show loading spinner in container
     */
    showLoading(container, message = 'Loading...') {
        container.innerHTML = `
            <div class="loading-state" style="grid-column: 1/-1;">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    },

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate password strength
     */
    isValidPassword(password) {
        return password && password.length >= 6;
    },

    /**
     * Safe API call wrapper with error handling
     */
    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: options.body ? JSON.stringify(options.body) : undefined
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
                throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Call Error:', error);
            throw error;
        }
    }
};
