# AI Chatboard Setup Guide

## What is the AI Chatboard?

The AI Chatboard is an intelligent financial advisor that uses Google's Gemini API to provide personalized financial advice to SmartMoney users. It can help with:
- Budget management & expense tracking
- Investment strategies & stock analysis
- Financial goals & planning
- Saving tips and money hacks
- Portfolio analysis & diversification

## Files Created

### Backend
- `assets/api/chatboard.php` - Main API endpoint for chat requests
- `assets/config/chatboard.config.php` - Configuration file

### Frontend
- `assets/js/views/chatboard.js` - Chatboard UI component
- `assets/css/chatboard.css` - Styling for chatboard

### Updates
- `index.html` - Added chatboard navigation link and CSS
- `assets/js/app.js` - Added chatboard route
- `assets/js/router.js` - Added chatboard initialization

## Setup Instructions

### Step 1: Get Gemini API Key
1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click "Get API Key" → "Create API key in new project"
3. Copy your API key (keep it safe!)

### Step 2: Configure Environment Variable
Create/edit `.env` file in project root:

```bash
cp .env.example .env
```

Add your Gemini API key:
```
GEMINI_API_KEY=your-actual-gemini-api-key-here
GEMINI_API_KEY=PASTE_YOUR_KEY_HERE
```

### Step 3: Test Locally
1. Start XAMPP (Apache + MySQL)
2. Visit `http://localhost/r1`
3. Click "AI Chat" in the sidebar
4. Send a financial question to the AI

## API Endpoint

### POST /assets/api/chatboard.php
Send a chat message and get AI response

**Request:**
```json
{
  "message": "How should I budget my monthly expenses?",
  "context": {
    "portfolio": {},
    "budget": {},
    "recent_transactions": [],
    "messages": []
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "AI response here...",
  "timestamp": "2024-03-22 15:30:00",
  "source": "gemini"
}
```

### GET /assets/api/chatboard.php?action=history
Get conversation history

### GET /assets/api/chatboard.php?action=clear
Clear conversation history

## Features

✅ **Real-time AI Responses** - Powered by Gemini Pro model  
✅ **Conversation History** - Keeps last 50 messages locally  
✅ **Context Aware** - Understands user's financial context  
✅ **Beautiful UI** - Modern gradient design with animations  
✅ **Mobile Responsive** - Works on any screen size  
✅ **Error Handling** - Graceful fallback if API unavailable  
✅ **Auto-scroll** - Message list auto-scrolls to latest message  

## Features in ChatboardView

| Feature | Description |
|---------|-------------|
| `init()` | Initialize the chatboard view |
| `renderView()` | Render UI structure |
| `sendMessage()` | Send user message to API |
| `addMessage()` | Add message to chat UI |
| `formatMessage()` | Format AI response with markdown |
| `loadHistory()` | Load previous conversation |
| `clearChat()` | Clear all messages |
| `scrollToBottom()` | Auto-scroll to latest message |

## Configuration Options

File: `assets/config/chatboard.config.php`

```php
$CHATBOARD_CONFIG = [
    'model' => 'gemini-pro',
    'temperature' => 0.7,              // Creativity (0-1)
    'max_tokens' => 2048,               // Max response length
    'max_history' => 50,                // Keep last N messages
    'enable_context' => true,           // Use user's financial context
    'financial_mode' => true,           // Financial advisor mode
];
```

## Troubleshooting

### API Key Not Working
- Verify key is correctly copied in `.env`
- Check at [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- Generate a new key if needed

### Chat Not Loading
- Check browser console for errors (F12)
- Verify `chatboard.php` endpoint is accessible
- Check GEMINI_API_KEY environment variable is set

### Slow Responses
- Gemini API response time is typically 1-3 seconds
- Check your internet connection
- Try a simpler question

## Deployment on Railway.app / Render

The chatboard will work automatically once deployed since:
1. ✅ Environment variables are set in platform dashboard
2. ✅ API files are included in Docker container
3. ✅ Chat history stored locally (can be moved to database)

### Example .env for Production
```
GEMINI_API_KEY=your-production-api-key
APP_ENV=production
```

## Future Enhancements

- [ ] Save chat history to database
- [ ] Multiple conversations
- [ ] Export chat as PDF
- [ ] Voice input/output
- [ ] Finance-specific training data
- [ ] Multi-language support
- [ ] Custom chatbot personality

## Security Notes

🔐 **Never**:
- Commit `.env` file to GitHub
- Share your Gemini API key
- Expose API key in frontend code

✅ **Always**:
- Use environment variables
- Set `.env` in `.gitignore`
- Use `.env.example` as template
- Handle errors gracefully

## Support

For issues or questions:
1. Check API key configuration
2. Review browser console (F12)
3. Verify Gemini API is enabled
4. Check internet connection
5. Restart the application

---

**Version:** 1.0  
**Last Updated:** March 22, 2025  
**Status:** Production Ready ✅
