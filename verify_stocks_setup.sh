#!/bin/bash

# Live Stock Market Feature - Setup Verification Script
# This script verifies that all components are properly installed

echo "🔍 Verifying Live Stock Market Implementation..."
echo "================================================"
echo ""

# Check PHP Backend
echo "1️⃣  Checking PHP Backend..."
if [ -f "/Applications/XAMPP/xamppfiles/htdocs/r1/assets/api/getStocks.php" ]; then
    echo "   ✅ getStocks.php exists"
    LINES=$(wc -l < "/Applications/XAMPP/xamppfiles/htdocs/r1/assets/api/getStocks.php")
    echo "   📊 Lines: $LINES"
else
    echo "   ❌ getStocks.php NOT FOUND"
fi
echo ""

# Check JavaScript Module
echo "2️⃣  Checking JavaScript Module..."
if [ -f "/Applications/XAMPP/xamppfiles/htdocs/r1/assets/js/stocks.js" ]; then
    echo "   ✅ stocks.js exists"
    LINES=$(wc -l < "/Applications/XAMPP/xamppfiles/htdocs/r1/assets/js/stocks.js")
    echo "   📊 Lines: $LINES"
else
    echo "   ❌ stocks.js NOT FOUND"
fi
echo ""

# Check CSS Styling
echo "3️⃣  Checking CSS Styling..."
if grep -q "stocks-container" "/Applications/XAMPP/xamppfiles/htdocs/r1/assets/css/components.css"; then
    echo "   ✅ Stock styles added to components.css"
    STOCK_CLASSES=$(grep -c "\.stocks-" "/Applications/XAMPP/xamppfiles/htdocs/r1/assets/css/components.css")
    echo "   📊 Stock CSS classes: $STOCK_CLASSES"
else
    echo "   ❌ Stock styles NOT FOUND in components.css"
fi
echo ""

# Check Dashboard Integration
echo "4️⃣  Checking Dashboard Integration..."
if grep -q "stocks-container" "/Applications/XAMPP/xamppfiles/htdocs/r1/assets/js/views/dashboard.js"; then
    echo "   ✅ Stock widget added to dashboard"
else
    echo "   ❌ Stock widget NOT FOUND in dashboard"
fi
echo ""

# Check HTML Script Tags
echo "5️⃣  Checking HTML Integration..."
if grep -q "assets/js/stocks.js" "/Applications/XAMPP/xamppfiles/htdocs/r1/index.html"; then
    echo "   ✅ stocks.js script tag added to index.html"
else
    echo "   ❌ stocks.js script tag NOT FOUND in index.html"
fi
echo ""

# Check Database Schema
echo "6️⃣  Checking Database Schema..."
if grep -q "stocks_cache" "/Applications/XAMPP/xamppfiles/htdocs/r1/money.sql"; then
    echo "   ✅ stocks_cache table in money.sql"
else
    echo "   ❌ stocks_cache table NOT FOUND in money.sql"
fi
echo ""

# Summary
echo "================================================"
echo "✅ Verification Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Run: mysql -u root < money.sql (to create stocks_cache table)"
echo "   2. Open: http://localhost/r1 in your browser"
echo "   3. Navigate to Dashboard view"
echo "   4. Look for 'Live Market Snapshot' card"
echo ""
echo "📚 Documentation:"
echo "   - Full Guide: LIVE_STOCK_MARKET_IMPLEMENTATION.md"
echo "   - Quick Ref: LIVE_STOCK_MARKET_QUICK_REFERENCE.md"
echo ""
