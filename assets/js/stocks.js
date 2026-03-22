/**
 * Live Stock Market Module
 * 
 * Displays REAL live stock prices with smart caching.
 * Updates every 30 seconds by default, or on-demand with refresh button.
 * 
 * Features:
 * - Real-time price updates via Alpha Vantage API
 * - Smart 30-second caching to prevent excessive API calls
 * - Auto-refresh with visual loading state
 * - Color-coded price changes (green = up, red = down)
 * - Last update timestamp
 * - Responsive grid layout
 */

const StocksView = (() => {
    let stocks = [];
    let isLoading = false;
    let lastUpdateTime = null;
    let autoRefreshInterval = null;

    const REFRESH_INTERVAL = 30000; // Auto-refresh every 30 seconds

    return {
        /**
         * Initialize stock market view
         */
        init() {
            console.log('📈 Initializing Live Stock Market...');
            this.loadStocks();

            // Auto-refresh every 30 seconds
            autoRefreshInterval = setInterval(() => {
                this.loadStocks();
            }, REFRESH_INTERVAL);
        },

        async loadStocks() {
            const container = document.getElementById('stocks-list');
            if (!container) return; // Container not in DOM

            if (isLoading) return;

            isLoading = true;
            const stocksContainer = document.querySelector('.stocks-container');
            if (stocksContainer) {
                stocksContainer.classList.add('stocks-loading');
            }

            try {
                // Use new Python-powered live stocks API
                const response = await fetch('assets/api/getLiveStocks.php');
                if (!response.ok) throw new Error('Network response was not ok');

                const result = await response.json();

                if (result.status === 'success') {
                    stocks = result.data || [];
                    lastUpdateTime = result.timestamp;

                    // Update cache age info with proper formatting
                    let ageText = '';
                    if (result.cached) {
                        const age = result.cacheAge || 0;
                        ageText = age < 60 ? `(${age}s ago)` : `(${Math.floor(age/60)}m ago)`;
                    } else {
                        ageText = '(📡 Live)';
                    }
                    
                    const lastUpdateEl = document.querySelector('.stocks-last-update');
                    if (lastUpdateEl) {
                        const dataStatus = result.data && result.data.length > 0 && result.data[0].status === 'live' 
                            ? '✓ Live Data' 
                            : '⚠ Offline Data';
                        lastUpdateEl.textContent = `${dataStatus} • ${lastUpdateTime} ${ageText}`;
                    }

                    this.render();
                } else {
                    container.innerHTML = '<p class="error">Unable to fetch stock data.</p>';
                }
            } catch (error) {
                console.error('Stock fetch error:', error);
                container.innerHTML = '<p class="error">Connection error. Please check your data feed.</p>';
            } finally {
                isLoading = false;
                if (stocksContainer) {
                    stocksContainer.classList.remove('stocks-loading');
                }
            }
        },

        /**
         * Render stocks to DOM with compact design
         */
        render() {
            const container = document.getElementById('stocks-list');
            if (!container) return;

            if (!stocks || stocks.length === 0) {
                container.innerHTML = '<p style="padding: 1rem; text-align: center; color: var(--text-secondary); grid-column: 1/-1;">No stock data</p>';
                return;
            }

            const html = stocks.map(stock => {
                const changeClass = stock.price_change >= 0 ? 'positive' : 'negative';
                const changeSymbol = stock.price_change >= 0 ? '📈' : '📉';
                const changeSign = stock.price_change >= 0 ? '+' : '';
                const isLive = stock.status === 'live';

                return `
                    <div class="stock-card" style="border-left: 3px solid ${stock.price_change >= 0 ? '#10b981' : '#ef4444'}; padding: 0.75rem; border-radius: 8px; background: var(--bg-card); border: 1px solid var(--border-color); transition: all 0.2s;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                            <div style="flex: 1;">
                                <div style="font-weight: 700; font-size: 0.9rem;">${stock.symbol}</div>
                                <div style="font-size: 0.7rem; color: var(--text-secondary);">₹${stock.current_price.toFixed(0)}</div>
                            </div>
                            <div style="text-align: right; font-size: 0.85rem; font-weight: 600; ${stock.price_change >= 0 ? 'color: #10b981' : 'color: #ef4444'};">
                                ${changeSymbol}<br/>${changeSign}${stock.change_percent.toFixed(2)}%
                            </div>
                        </div>
                        
                        <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.5rem; line-height: 1.3;">
                            <div>P/E: ${stock.pe_ratio ? stock.pe_ratio : '--'}</div>
                            <div>${isLive ? '🔴 Live' : '⚪'}</div>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = html;
        },

        /**
         * Manual refresh button
         */
        refresh() {
            console.log('🔄 Manual refresh...');
            this.loadStocks();
        },

        /**
         * Destroy and cleanup
         */
        destroy() {
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
            }
        }
    };
})();

/**
 * Helper function to format market cap
 */
function formatMarketCap(cap) {
    if (!cap || cap === 0) return 'N/A';
    if (cap >= 1e12) return '₹' + (cap / 1e12).toFixed(1) + 'T';
    if (cap >= 1e9) return '₹' + (cap / 1e9).toFixed(1) + 'B';
    if (cap >= 1e6) return '₹' + (cap / 1e6).toFixed(1) + 'M';
    return '₹' + cap;
}

// Initialize on load if stocks container exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('stocks-list')) {
        StocksView.init();
    }
});
