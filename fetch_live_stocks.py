#!/usr/bin/env python3
"""
Live Stock Data Fetcher using yfinance
Fetches real-time stock prices for Indian stocks (NSE)
"""

import json
import sys
from datetime import datetime
import yfinance as yf

def get_live_stocks(symbols):
    """
    Fetch live stock data for given symbols
    Args:
        symbols: List of stock symbols (e.g., ['TCS.NS', 'INFY.NS'])
    Returns:
        List of dictionaries with stock data
    """
    stocks_data = []
    
    for symbol in symbols:
        try:
            # Fetch stock data
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period='5d')
            
            if hist.empty:
                continue
            
            # Get current price
            current_price = hist['Close'].iloc[-1]
            previous_price = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
            
            # Calculate change
            price_change = current_price - previous_price
            change_percent = (price_change / previous_price * 100) if previous_price != 0 else 0
            
            # Get company name
            company_name = info.get('longName', symbol.replace('.NS', ''))
            
            # Get market data
            market_cap = info.get('marketCap', 0)
            pe_ratio = info.get('trailingPE', 0)
            
            stocks_data.append({
                'symbol': symbol.replace('.NS', ''),
                'full_symbol': symbol,
                'company_name': company_name,
                'current_price': round(float(current_price), 2),
                'previous_price': round(float(previous_price), 2),
                'price_change': round(float(price_change), 2),
                'change_percent': round(float(change_percent), 2),
                'market_cap': int(market_cap) if market_cap else 0,
                'pe_ratio': round(float(pe_ratio), 2) if pe_ratio else 0,
                'currency': 'INR',
                'timestamp': datetime.now().isoformat(),
                'status': 'live'
            })
            
        except Exception as e:
            print(f"Error fetching {symbol}: {str(e)}", file=sys.stderr)
            continue
    
    return stocks_data

def main():
    """Main function to fetch and output stock data"""
    
    # Indian stocks (NSE format)
    indian_stocks = [
        'TCS.NS',      # Tata Consultancy Services
        'INFY.NS',     # Infosys
        'RELIANCE.NS', # Reliance Industries
        'HDFC.NS',     # HDFC Bank
        'ICICIBANK.NS',# ICICI Bank
        'WIPRO.NS',    # Wipro
        'BAJAJ-AUTO.NS',# Bajaj Auto
        'LT.NS',       # Larsen & Toubro
    ]
    
    try:
        stocks = get_live_stocks(indian_stocks)
        
        output = {
            'status': 'success',
            'timestamp': datetime.now().isoformat(),
            'count': len(stocks),
            'data': stocks
        }
        
        print(json.dumps(output, indent=2))
        return 0
        
    except Exception as e:
        error_output = {
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }
        print(json.dumps(error_output), file=sys.stderr)
        return 1

if __name__ == '__main__':
    sys.exit(main())
