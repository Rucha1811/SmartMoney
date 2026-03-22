# 🚀 AI Stock Predictions - Quick Reference

## What's New?
Your **AI Insights** page now displays **real-time stock market predictions** for multiple markets!

---

## 🎯 Quick Setup (2 minutes)

### Option A: Use Default Mock Predictions (Works immediately)
```
✅ No configuration needed
✅ Go to AI Insights page
✅ View predictions right away
```

### Option B: Enable Real AI Predictions
```
1. Get Gemini API key: https://aistudio.google.com/app/apikey
2. Add to: assets/config/predictions.config.php
   'gemini_api_key' => 'paste-key-here',
3. Done! Real predictions enabled
```

---

## 📍 Where to Find It

**Navigation:** 
```
Dashboard → Sidebar → AI Insights → Scroll down to "Stock Market Predictions"
```

---

## 🎨 Features

### Prediction Cards Display:
```
┌─────────────────────────────────┐
│ TCS                    BUY 75%  │
│ 1-3 months                      │
│                                 │
│ Target: +5% to +12%            │
│ Score:  72.5/100               │
│                                 │
│ Analysis: Strong uptrend with   │
│ support levels holding strong   │
│                                 │
│ [View Details →]                │
└─────────────────────────────────┘
```

### Market Selector:
- 🇮🇳 NSE (National Stock Exchange - India)
- 🇮🇳 BSE (Bombay Stock Exchange - India)
- 🇺🇸 NASDAQ (USA Tech)
- 🇺🇸 NYSE (USA Blue Chip)

---

## 📊 What Each Metric Means

| Metric | Meaning | Example |
|--------|---------|---------|
| **Prediction** | BUY/SELL/HOLD signal | BUY = undervalued |
| **Confidence** | Signal strength (%) | 75% = high certainty |
| **Target** | Expected price movement | +5% to +12% = growth potential |
| **Technical Score** | RSI-based indicator | 72.5 = strong momentum |
| **Timeframe** | How long to wait | 1-3 months typical |

---

## 🔄 Auto-Updates
- Predictions refresh **every 5 minutes** automatically
- No manual refresh needed
- Latest market data used

---

## 💻 For Developers

### Using the Python Utility:
```bash
# Predict single market
python3 predict_stocks.py --market NSE

# Predict all markets
python3 predict_stocks.py --all

# Save predictions to file
python3 predict_stocks.py --market NASDAQ --cache
```

### API Endpoint:
```bash
curl "http://localhost/assets/api/getStockPredictions.php?market=NSE&limit=10"
```

### Response Format:
```json
{
  "predictions": [
    {
      "symbol": "TCS",
      "prediction": "BUY",
      "confidence": "75%",
      "target_price_change": "+5% to +12%",
      "technical_score": 72.5,
      "reasoning": "..."
    }
  ]
}
```

---

## ⚠️ Important Reminders

1. **Not Financial Advice**
   - AI predictions can be wrong
   - Do your own research before investing
   - Consult a financial advisor if uncertain

2. **API Limits**
   - Gemini Free: ~100 calls/day
   - Alpha Vantage Free: 5 calls/min
   - Upgrade if needed

3. **Best Practices**
   - Check multiple sources
   - Diversify your portfolio
   - Use long-term strategy
   - Don't panic trade

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Predictions not showing | Check browser console (F12), verify API keys |
| "No predictions available" | Ensure `stocks_live_cache.json` has data |
| Slow loading | May be API rate limit, try later |
| Wrong market data | Clear cache (Cmd+Shift+R) and refresh |

---

## 📚 Documentation

- **Full Setup Guide:** [STOCK_PREDICTIONS_SETUP.md](./STOCK_PREDICTIONS_SETUP.md)
- **Configuration:** `assets/config/predictions.config.php`
- **API Code:** `assets/api/getStockPredictions.php`
- **Frontend:** `assets/js/views/insights.js`
- **Python Utility:** `predict_stocks.py`

---

## 🎓 Technical Details

### How It Works (Simple Version):
```
1. Fetch live stock prices
   ↓
2. Calculate technical indicators (RSI, trends)
   ↓
3. Send to Gemini AI for analysis
   ↓
4. AI generates BUY/SELL/HOLD predictions
   ↓
5. Display with confidence scores
```

### Supported Stock Indices:

**NSE (Indian stocks):**
- TCS, INFY, RELIANCE, ICICIBANK, WIPRO, BAJAJ-AUTO, LT, SBIN

**NASDAQ (US Tech):**
- AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA, META, NFLX

**NYSE (US Blue Chip):**
- JNJ, V, JPM, PG, MA, UNH, HD, WMT

---

## 💡 Tips & Tricks

### Pro Tip 1: Market Comparison
Switch between markets to see which performs better:
```
NSE → Check predictions
NASDAQ → Compare tech stocks
NYSE → Compare blue chips
```

### Pro Tip 2: Technical Analysis
Higher Technical Score (> 70) = Stronger momentum
Lower Score (< 30) = Potential bounce opportunity

### Pro Tip 3: Timeframe Strategy
- **1-3 months** = Medium-term investment
- Good for portfolio building
- Not for day trading

---

## 🔐 Security Notes

**Protect Your API Keys:**
1. Never share keys in public
2. Use environment variables in production
3. Rotate keys regularly
4. Monitor API usage

---

## 📞 Getting Help

1. Check [STOCK_PREDICTIONS_SETUP.md](./STOCK_PREDICTIONS_SETUP.md)
2. Look at browser console errors (F12)
3. Verify API keys in config file
4. Check PHP error logs

---

## 🎊 What's Next?

Future enhancements planned:
- 📈 Sentiment analysis from news
- 🤖 ML model training
- 🎯 Portfolio recommendations
- 📊 Backtesting accuracy
- 🔔 Custom alerts

---

**Version:** 1.0  
**Last Updated:** March 22, 2026  
**Status:** ✅ Ready to Use

Happy predicting! 🚀📈
