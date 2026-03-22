#!/usr/bin/env python3
"""
Background Stock Data Updater
Updates stock data periodically and saves to cache file
Run this in background: python3 update_stocks_cache.py
"""

import json
import time
from datetime import datetime
import yfinance as yf
import os
import sys

CACHE_FILE = os.path.join(os.path.dirname(__file__), 'stocks_live_cache.json')
UPDATE_INTERVAL = 60  # Update every 60 seconds
MAX_RETRIES = 3

def get_live_stocks():
    """Fetch live stock data"""
    stocks = [
        'TCS.NS', 'INFY.NS', 'RELIANCE.NS', 'ICICIBANK.NS', 
        'WIPRO.NS', 'BAJAJ-AUTO.NS', 'LT.NS', 'SBIN.NS'
    ]
    
    data = []
    for symbol in stocks:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period='5d')
            
            if hist.empty:
                continue
            
            current = hist['Close'].iloc[-1]
            previous = hist['Close'].iloc[-2] if len(hist) > 1 else current
            change = current - previous
            change_pct = (change / previous * 100) if previous != 0 else 0
            
            data.append({
                'symbol': symbol.replace('.NS', ''),
                'full_symbol': symbol,
                'company_name': info.get('longName', symbol.replace('.NS', '')),
                'current_price': round(float(current), 2),
                'previous_price': round(float(previous), 2),
                'price_change': round(float(change), 2),
                'change_percent': round(float(change_pct), 2),
                'market_cap': int(info.get('marketCap', 0)),
                'pe_ratio': round(float(info.get('trailingPE', 0)), 2) if info.get('trailingPE') else 0,
                'currency': 'INR',
                'timestamp': datetime.now().isoformat(),
                'status': 'live'
            })
        except Exception as e:
            print(f"Error fetching {symbol}: {e}", file=sys.stderr)
    
    return data

def update_cache():
    """Update cache file with latest stock data"""
    try:
        stocks = get_live_stocks()
        
        if stocks:
            cache_data = {
                'timestamp': int(time.time()),
                'dataAge': datetime.now().isoformat(),
                'stocks': stocks
            }
            
            with open(CACHE_FILE, 'w') as f:
                json.dump(cache_data, f)
            
            print(f"[{datetime.now()}] Updated {len(stocks)} stocks")
            return True
    except Exception as e:
        print(f"[{datetime.now()}] Error updating cache: {e}", file=sys.stderr)
    
    return False

def main():
    """Main loop"""
    print(f"Starting stock cache updater...")
    print(f"Cache file: {CACHE_FILE}")
    print(f"Update interval: {UPDATE_INTERVAL}s")
    
    # Initial update
    for attempt in range(MAX_RETRIES):
        if update_cache():
            break
        if attempt < MAX_RETRIES - 1:
            print(f"Retry {attempt + 1}/{MAX_RETRIES}...", file=sys.stderr)
            time.sleep(5)
    
    # Continuous updates
    while True:
        try:
            time.sleep(UPDATE_INTERVAL)
            update_cache()
        except KeyboardInterrupt:
            print("\nShutting down...")
            break
        except Exception as e:
            print(f"Error in main loop: {e}", file=sys.stderr)
            time.sleep(10)

if __name__ == '__main__':
    main()
