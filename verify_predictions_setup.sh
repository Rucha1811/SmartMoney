#!/bin/bash
# Stock Predictions Setup Verification Script

echo "🔍 Verifying AI Stock Predictions Installation..."
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check files
echo "📁 Checking Files..."
files=(
    "assets/api/getStockPredictions.php"
    "assets/config/predictions.config.php"
    "assets/js/views/insights.js"
    "assets/js/router.js"
    "predict_stocks.py"
    "STOCK_PREDICTIONS_SETUP.md"
    "PREDICTIONS_QUICK_START.md"
    "AI_STOCK_PREDICTIONS_IMPLEMENTATION_COMPLETE.md"
    "stocks_live_cache.json"
)

all_files_ok=true

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file (MISSING)"
        all_files_ok=false
    fi
done

echo ""
echo "📋 Checking Configuration..."

# Check if config file has placeholders for API keys
if grep -q "getenv('GEMINI_API_KEY')" assets/config/predictions.config.php; then
    echo -e "${YELLOW}⚠️  ${NC} Gemini API key not yet configured"
else
    echo -e "${GREEN}✅${NC} Gemini API key configured"
fi

echo ""
echo "💻 PHP Syntax Check..."

# Check PHP syntax
if php -l assets/api/getStockPredictions.php > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} getStockPredictions.php syntax OK"
else
    echo -e "${RED}❌${NC} getStockPredictions.php has syntax errors"
    php -l assets/api/getStockPredictions.php
fi

if php -l assets/config/predictions.config.php > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} predictions.config.php syntax OK"
else
    echo -e "${RED}❌${NC} predictions.config.php has syntax errors"
    php -l assets/config/predictions.config.php
fi

echo ""
echo "🐍 Python Syntax Check..."

# Check Python syntax
if python3 -m py_compile predict_stocks.py 2>/dev/null; then
    echo -e "${GREEN}✅${NC} predict_stocks.py syntax OK"
else
    echo -e "${RED}❌${NC} predict_stocks.py has syntax errors"
fi

echo ""
echo "📊 Live Data Check..."

# Check if live data cache exists
if [ -f "stocks_live_cache.json" ]; then
    stock_count=$(grep -o '"symbol"' stocks_live_cache.json | wc -l)
    echo -e "${GREEN}✅${NC} stocks_live_cache.json found ($stock_count stocks)"
else
    echo -e "${YELLOW}⚠️  ${NC} stocks_live_cache.json not found (predictions may be limited)"
fi

echo ""
echo "🎯 Frontend Integration Check..."

# Check if insights.js has the new methods
if grep -q "loadPredictions" assets/js/views/insights.js; then
    echo -e "${GREEN}✅${NC} loadPredictions() method found"
else
    echo -e "${RED}❌${NC} loadPredictions() method NOT found"
fi

if grep -q "renderPredictions" assets/js/views/insights.js; then
    echo -e "${GREEN}✅${NC} renderPredictions() method found"
else
    echo -e "${RED}❌${NC} renderPredictions() method NOT found"
fi

if grep -q "renderPredictionCard" assets/js/views/insights.js; then
    echo -e "${GREEN}✅${NC} renderPredictionCard() method found"
else
    echo -e "${RED}❌${NC} renderPredictionCard() method NOT found"
fi

# Check if router has initialization
if grep -q "InsightsView.init" assets/js/router.js; then
    echo -e "${GREEN}✅${NC} InsightsView initialization found in router"
else
    echo -e "${RED}❌${NC} InsightsView initialization NOT found in router"
fi

echo ""
echo "🌍 API Endpoint Check..."

if grep -q "getStockPredictions.php" assets/js/views/insights.js; then
    echo -e "${GREEN}✅${NC} API endpoint configured in frontend"
else
    echo -e "${RED}❌${NC} API endpoint NOT configured"
fi

echo ""
echo "=================================================="

if [ "$all_files_ok" = true ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "📚 Next Steps:"
    echo "  1. Get Gemini API key: https://aistudio.google.com/app/apikey"
    echo "  2. Edit: assets/config/predictions.config.php"
    echo "  3. Add: 'gemini_api_key' => 'your-key-here',"
    echo "  4. Save and refresh the page"
    echo "  5. Go to AI Insights page to see predictions!"
    echo ""
    echo "📖 Read the documentation:"
    echo "  - Quick Start: PREDICTIONS_QUICK_START.md"
    echo "  - Full Setup: STOCK_PREDICTIONS_SETUP.md"
    echo "  - Implementation: AI_STOCK_PREDICTIONS_IMPLEMENTATION_COMPLETE.md"
else
    echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
    echo "Please ensure all files are present before proceeding."
    exit 1
fi

echo ""
