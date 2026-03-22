# 🎯 AI Stock Market Predictions Setup Guide

## Overview
Your insights page now includes **AI-powered stock market predictions** using hybrid analysis:
- 📊 **Technical Analysis** (RSI, Trend detection)
- 🤖 **Gemini AI** (Pattern interpretation)
- 🌍 **Multi-Market Support** (NSE, BSE, NASDAQ, NYSE)

---

## 🚀 Quick Start (No Configuration Required)

The system works **out of the box** with mock predictions. To get real AI predictions, configure API keys:

### Step 1: Get Gemini API Key (Free)

1. Go to: **https://aistudio.google.com/app/apikey**
2. Click **"Create API Key"** → **"Create API key in new project"**
3. Copy your API key
4. Add to `assets/config/predictions.config.php`:
```php
return [
    'gemini_api_key' => 'your-api-key-here', // PASTE HERE
    ...
];
```

### Step 2 (Optional): Add Alpha Vantage Key (Better Technical Data)

1. Sign up: **https://www.alphavantage.co/**
2. Copy your API key from email
3. Add to `assets/config/predictions.config.php`:
```php
return [
    'alpha_vantage_key' => 'your-alpha-vantage-key-here',
    ...
];
```

### Step 3: Test It!

1. Navigate to **AI Insights** page in your app
2. You should see stock predictions loading
3. Switch between markets using the dropdown

---

## 📋 Features

### ✅ Supported Markets
- **NSE** - Tata Consultancy Services, Infosys, Reliance, ICICI Bank, etc.
- **BSE** - Bombay Stock Exchange (stocks can be added)
- **NASDAQ** - Apple, Microsoft, Google, Amazon, Tesla
- **NYSE** - JPMorgan, Visa, Mastercard, Procter & Gamble

### ✅ Prediction Data
Each stock shows:
- 🎯 **Prediction** - BUY / SELL / HOLD
- 💯 **Confidence Level** - Based on technical indicators
- 📈 **Target Price Range** - Expected price movement
- 🔍 **Technical Analysis** - RSI, trend direction, volatility
- ⏱️ **Timeframe** - Typical 1-3 months
- 📝 **AI Reasoning** - Why this prediction

### ✅ Auto-Refresh
- Predictions refresh every 5 minutes
- Market data updates in real-time
- Beautiful UI with smooth animations

---

## 🔧 API Endpoints

### Get Stock Predictions
```bash
GET /assets/api/getStockPredictions.php?market=NSE&limit=10
```

**Parameters:**
- `market` (optional) - NSE, BSE, NASDAQ, NYSE (default: NSE)
- `limit` (optional) - Number of predictions to return (default: 10)

**Response:**
```json
{
  "success": true,
  "market": "NSE",
  "predictions": [
    {
      "symbol": "TCS",
      "prediction": "BUY",
      "target_price_change": "+5% to +12%",
      "confidence": "75%",
      "reasoning": "Strong uptrend with support levels holding...",
      "timeframe": "1-3 months",
      "technical_score": 72.5
    }
  ],
  "data_sources": ["Alpha Vantage", "Gemini AI", "Historical Data"],
  "timestamp": "2026-03-22T10:30:00Z"
}
```

---

## 🎨 Frontend Integration

The predictions are displayed on the **AI Insights** page with:

```javascript
// Load predictions for specific market
InsightsView.loadPredictions('NSE');

// Manually refresh
document.getElementById('market-selector').value = 'NASDAQ';
InsightsView.loadPredictions('NASDAQ');
```

---

## 📊 How It Works

### 1. **Data Collection**
- Fetches live stock prices from your cache
- Collects historical data if available

### 2. **Technical Analysis**
```python
RSI = Relative Strength Index (0-100)
- > 70: Overbought (potential SELL)
- < 30: Oversold (potential BUY)
- 30-70: Neutral zone

MACD = Moving Average Convergence Divergence
SMA = Simple Moving Average (trends)
```

### 3. **AI Processing**
- Sends technical data to Gemini API
- AI generates predictions & analysis
- Falls back to heuristic analysis if API unavailable

### 4. **Scoring**
```
Confidence = based on signal strength + AI agreement
Risk Level = based on volatility + price range
```

---

## ⚠️ Important Notes

1. **Disclaimer**: These predictions are **NOT financial advice**
   - AI is not 100% accurate
   - Past performance ≠ future results
   - Always do your own research

2. **API Limits**:
   - Gemini: Free tier = ~100 calls/day
   - Alpha Vantage: Free tier = 5 calls/min, 500/day
   - Consider upgrading for higher limits

3. **Accuracy**: Predictions improve with:
   - More historical data
   - Additional market sources
   - Longer prediction windows

---

## 🔐 Security

- API keys should be stored in **environment variables** (production)
- Never commit API keys to git
- Use `.env` file (add to `.gitignore`):

```bash
GEMINI_API_KEY=your-key-here
ALPHA_VANTAGE_KEY=your-key-here
```

Then load in `predictions.config.php`:
```php
'gemini_api_key' => getenv('GEMINI_API_KEY'),
```

---

## 🐛 Troubleshooting

### Predictions not loading?
```javascript
// Check browser console for errors
// Verify API endpoint: assets/api/getStockPredictions.php
fetch('assets/api/getStockPredictions.php?market=NSE')
  .then(r => r.json())
  .then(console.log);
```

### Getting "No predictions available"?
- Check API keys are configured
- Ensure `predictions.config.php` has correct keys
- Check `assets/api/getStockPredictions.php` for errors

### Market data not updating?
- Clear browser cache (Cmd+Shift+R)
- Check if `stocks_live_cache.json` has recent data
- Verify your stock fetching script is running

---

## 📈 Future Enhancements

Consider adding:
- ✨ Machine Learning model training
- ✨ Sentiment analysis from news/social media
- ✨ Portfolio-specific recommendations
- ✨ Backtesting historical accuracy
- ✨ Custom alerting system
- ✨ Export reports to PDF

---

## 💡 Example Usage

**JavaScript:**
```javascript
// Load NSE predictions
InsightsView.loadPredictions('NSE');

// Switch to US market
document.getElementById('market-selector').value = 'NASDAQ';
InsightsView.loadPredictions('NASDAQ');
```

**HTML:**
```html
<!-- Market selector dropdown -->
<select id="market-selector" onchange="InsightsView.loadPredictions(this.value)">
    <option value="NSE">NSE (India)</option>
    <option value="BSE">BSE (India)</option>
    <option value="NASDAQ">NASDAQ (USA)</option>
    <option value="NYSE">NYSE (USA)</option>
</select>
```

---

## 🎓 Learning Resources

- **Gemini API**: https://ai.google.dev/tutorials/python_quickstart
- **Technical Analysis**: https://en.wikipedia.org/wiki/Technical_analysis
- **Stock Prediction**: https://www.investopedia.com/articles/investing/092915/ai-replacing-financial-advisors.asp

---

## 📞 Support

Having issues? Check:
1. Browser console for JavaScript errors
2. PHP error logs for backend issues
3. API key configuration in `predictions.config.php`
4. Network requests in browser DevTools

---

**Last Updated:** March 22, 2026
**Version:** 1.0
**Status:** Production Ready ✅
