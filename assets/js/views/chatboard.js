/**
 * SmartMoney AI Chatboard
 */
window.ChatboardView = {
    currentConversation: [],
    isLoading: false,
    autoScroll: true,

    /**
     * Initialize chatboard
     */
    init() {
        this.renderView();
        this.attachEventListeners();
        this.loadHistory();
        console.log('Chatboard initialized');
    },

    /**
     * Render chatboard UI
     */
    renderView() {
        const content = document.getElementById('app-content');
        content.innerHTML = `
            <div class="chatboard-container">
                <div class="chatboard-header">
                    <div class="header-content">
                        <h1><i class="fa-solid fa-comments"></i> AI Finance Advisor</h1>
                        <p>Get personalized financial advice powered by AI</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn-icon" id="btn-clear-chat" title="Clear Chat">
                            <i class="fa-solid fa-trash"></i> Clear
                        </button>
                    </div>
                </div>

                <div class="chatboard-body">
                    <div class="chat-messages" id="chat-messages">
                        <div class="message-welcome">
                            <div class="welcome-icon">
                                <i class="fa-solid fa-robot"></i>
                            </div>
                            <h2>Welcome to AI Finance Advisor!</h2>
                            <p>Ask me anything about:</p>
                            <ul>
                                <li>💰 Budget management & expense tracking</li>
                                <li>📈 Investment strategies & stock analysis</li>
                                <li>🎯 Financial goals & planning</li>
                                <li>💳 Saving tips & money hacks</li>
                                <li>📊 Portfolio analysis & diversification</li>
                            </ul>
                            <p style="margin-top: 15px; font-size: 12px; color: #666;">
                                💡 Tip: Share your financial goals for personalized advice!
                            </p>
                        </div>
                    </div>

                    <div class="chat-input-area">
                        <form id="chat-form" onsubmit="ChatboardView.sendMessage(event)">
                            <div class="input-wrapper">
                                <input 
                                    type="text" 
                                    id="chat-input" 
                                    placeholder="Ask me about budgeting, investments, stocks..." 
                                    autocomplete="off"
                                    disabled
                                >
                                <button type="submit" class="btn-send" id="btn-send" disabled>
                                    <i class="fa-solid fa-paper-plane"></i>
                                </button>
                            </div>
                        </form>
                        <div class="loading-indicator" id="loading-indicator" style="display: none;">
                            <div class="spinner"></div>
                            <span>AI is thinking...</span>
                        </div>
                    </div>
                </div>

                <div class="chatboard-footer">
                    <p>AI responses may not be real-time market data. Check the Markets section for live prices.</p>
                </div>
            </div>
        `;

        // Enable input after a short delay
        setTimeout(() => {
            const input = document.getElementById('chat-input');
            const sendBtn = document.getElementById('btn-send');
            if (input) input.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
        }, 500);
    },

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const clearBtn = document.getElementById('btn-clear-chat');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearChat());
        }
    },

    /**
     * Send message
     */
    sendMessage(event) {
        event.preventDefault();

        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message) return;

        // Disable input while processing
        input.disabled = true;
        document.getElementById('btn-send').disabled = true;
        this.isLoading = true;

        // Show loading indicator
        document.getElementById('loading-indicator').style.display = 'flex';

        // Add user message to UI
        this.addMessage(message, 'user');
        input.value = '';

        // Send to API
        fetch('/r1/assets/api/chatboard.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                context: {
                    messages: this.currentConversation.slice(-10) // Send last 10 messages for context
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.addMessage(data.message, 'ai');
                this.currentConversation.push({ role: 'user', text: message });
                this.currentConversation.push({ role: 'assistant', text: data.message });
            } else {
                this.addMessage(
                    data.error || 'Sorry, I encountered an error. Please try again.',
                    'ai',
                    'error'
                );
            }
        })
        .catch(error => {
            console.error('Chat error:', error);
            this.addMessage(
                'Sorry, I could not connect to the server. Please check your internet connection.',
                'ai',
                'error'
            );
        })
        .finally(() => {
            this.isLoading = false;
            document.getElementById('loading-indicator').style.display = 'none';
            input.disabled = false;
            document.getElementById('btn-send').disabled = false;
            input.focus();
            this.scrollToBottom();
        });
    },

    /**
     * Add message to chat
     */
    addMessage(text, sender, type = 'normal') {
        const messagesDiv = document.getElementById('chat-messages');

        // Remove welcome message if it exists
        const welcomeMsg = messagesDiv.querySelector('.message-welcome');
        if (welcomeMsg && sender === 'user') {
            welcomeMsg.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender} ${type}`;

        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    ${this.escapeHtml(text)}
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fa-solid fa-robot"></i>
                </div>
                <div class="message-content">
                    ${this.formatMessage(text)}
                </div>
            `;
        }

        messagesDiv.appendChild(messageDiv);
        this.scrollToBottom();

        // Add animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(10px)';
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
    },

    /**
     * Format AI message (handle markdown-like formatting)
     */
    formatMessage(text) {
        // Escape HTML
        text = this.escapeHtml(text);

        // Convert markdown-like formatting
        text = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');

        return text;
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Scroll to bottom of chat
     */
    scrollToBottom() {
        const messagesDiv = document.getElementById('chat-messages');
        if (this.autoScroll && messagesDiv) {
            setTimeout(() => {
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }, 100);
        }
    },

    /**
     * Load chat history
     */
    loadHistory() {
        fetch('/r1/assets/api/chatboard.php?action=history')
            .then(response => response.json())
            .then(data => {
                if (data.history && Array.isArray(data.history)) {
                    // Show last few messages from history
                    const recentMessages = data.history.slice(-5);
                    const messagesDiv = document.getElementById('chat-messages');

                    if (messagesDiv && recentMessages.length > 0) {
                        const welcome = messagesDiv.querySelector('.message-welcome');
                        if (welcome) welcome.remove();

                        recentMessages.forEach(msg => {
                            this.addMessage(msg.user, 'user');
                            this.addMessage(msg.ai, 'ai');
                            this.currentConversation.push({ role: 'user', text: msg.user });
                            this.currentConversation.push({ role: 'assistant', text: msg.ai });
                        });
                    }
                }
            })
            .catch(error => console.error('Error loading history:', error));
    },

    /**
     * Clear chat
     */
    clearChat() {
        if (confirm('Clear entire conversation? This cannot be undone.')) {
            fetch('/r1/assets/api/chatboard.php?action=clear', { method: 'GET' })
                .then(() => {
                    this.currentConversation = [];
                    this.renderView();
                    this.attachEventListeners();
                    console.log('Chat cleared');
                })
                .catch(error => console.error('Error clearing chat:', error));
        }
    }
};
