#!/usr/bin/env python3
"""
Stock Market Predictions Generator
Standalone utility for generating and caching stock predictions.

Usage:
    python predict_stocks.py                    # Predict NSE stocks
    python predict_stocks.py --market NASDAQ    # Predict NASDAQ stocks
    python predict_stocks.py --all              # All markets
    python predict_stocks.py --cache            # Save to cache file
"""

import json
import sys
import os
import argparse
from datetime import datetime, timedelta
import requests
from typing import Dict, List, Optional, Any

class StockPredictor:
    """Generate AI-powered stock predictions using technical analysis"""
    
    def __init__(self, gemini_key: str = "", alpha_vantage_key: str = ""):
        self.gemini_key = gemini_key or os.getenv('GEMINI_API_KEY', '')
        self.alpha_vantage_key = alpha_vantage_key or os.getenv('ALPHA_VANTAGE_KEY', '')
        self.market_configs = {
            'NSE': {
                'name': 'National Stock Exchange (India)',
                'currency': 'INR',
                'symbols': ['TCS', 'INFY', 'RELIANCE', 'ICICIBANK', 'WIPRO', 'BAJAJ-AUTO', 'LT', 'SBIN'],
            },
            'BSE': {
                'name': 'Bombay Stock Exchange (India)',
                'currency': 'INR',
                'symbols': [],
            },
            'NASDAQ': {
                'name': 'Nasdaq (USA)',
                'currency': 'USD',
                'symbols': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'],
            },
            'NYSE': {
                'name': 'New York Stock Exchange (USA)',
                'currency': 'USD',
                'symbols': ['JNJ', 'V', 'JPM', 'PG', 'MA', 'UNH', 'HD', 'WMT'],
            },
        }
    
    def load_live_data(self) -> List[Dict]:
        """Load live stock data from cache file"""
        cache_file = 'stocks_live_cache.json'
        
        if not os.path.exists(cache_file):
            print(f"⚠️  Cache file not found: {cache_file}")
            return []
        
        try:
            with open(cache_file, 'r') as f:
                data = json.load(f)
                return data.get('stocks', [])
        except Exception as e:
            print(f"❌ Error loading cache: {e}")
            return []
    
    def calculate_rsi(self, change_percent: float) -> float:
        """Calculate simplified RSI (0-100)"""
        rsi = 50 + (change_percent * 5)
        return max(0, min(100, rsi))
    
    def generate_signals(self, change_percent: float, rsi: float) -> List[str]:
        """Generate trading signals"""
        signals = []
        
        if change_percent > 2:
            signals.append('bullish')
        elif change_percent < -2:
            signals.append('bearish')
        else:
            signals.append('neutral')
        
        if rsi > 70:
            signals.append('overbought')
        elif rsi < 30:
            signals.append('oversold')
        
        return signals
    
    def get_trend_direction(self, change_percent: float) -> str:
        """Determine trend direction"""
        if change_percent > 1.5:
            return 'Strong Uptrend'
        elif change_percent > 0.5:
            return 'Mild Uptrend'
        elif change_percent < -1.5:
            return 'Strong Downtrend'
        elif change_percent < -0.5:
            return 'Mild Downtrend'
        else:
            return 'Consolidation'
    
    def analyze_technical(self, stocks: List[Dict]) -> Dict[str, Any]:
        """Perform technical analysis on stocks"""
        analysis = {}
        
        for stock in stocks:
            symbol = stock.get('symbol', 'UNKNOWN')
            price = stock.get('current_price') or stock.get('price', 0)
            change = stock.get('change_percent', 0)
            
            rsi = self.calculate_rsi(change)
            signals = self.generate_signals(change, rsi)
            
            analysis[symbol] = {
                'current_price': price,
                'change_percent': change,
                'rsi': rsi,
                'signals': signals,
                'trend': self.get_trend_direction(change),
                'volatility': 'Medium',
            }
        
        return analysis
    
    def generate_prediction(self, symbol: str, analysis: Dict) -> Dict:
        """Generate prediction for a stock"""
        data = analysis.get(symbol, {})
        change = data.get('change_percent', 0)
        rsi = data.get('rsi', 50)
        signals = data.get('signals', [])
        
        # Determine prediction
        if 'bullish' in signals and rsi < 70:
            prediction = 'BUY'
            target = '+5% to +12%'
            confidence = f"{min(95, 60 + rsi - 40)}%"
        elif 'bearish' in signals and rsi > 30:
            prediction = 'SELL'
            target = '-3% to -8%'
            confidence = f"{min(95, 60 + (100 - rsi) - 40)}%"
        else:
            prediction = 'HOLD'
            target = '-2% to +2%'
            confidence = '55%'
        
        reasoning = self._get_reasoning(symbol, prediction, data)
        
        return {
            'symbol': symbol,
            'prediction': prediction,
            'target_price_change': target,
            'confidence': confidence,
            'reasoning': reasoning,
            'timeframe': '1-3 months',
            'technical_score': round(rsi, 1),
        }
    
    def _get_reasoning(self, symbol: str, prediction: str, analysis: Dict) -> str:
        """Generate human-readable reasoning"""
        trend = analysis.get('trend', 'unknown')
        
        if prediction == 'BUY':
            return f"{ucfirst(trend)} observed. Technical indicators support upside potential."
        elif prediction == 'SELL':
            return f"{ucfirst(trend)} noted. Resistance levels limiting upside."
        else:
            return "Mixed signals. Current data suggests consolidation phase."
    
    def predict_market(self, market: str = 'NSE') -> Dict:
        """Generate predictions for a market"""
        market_upper = market.upper()
        
        if market_upper not in self.market_configs:
            print(f"❌ Unknown market: {market}")
            return {}
        
        config = self.market_configs[market_upper]
        market_data = self.load_live_data()
        
        # Filter by market
        market_stocks = [s for s in market_data if market.lower() in s.get('symbol', '').lower()]
        
        if not market_stocks:
            # Use configured symbols as fallback
            market_stocks = []
            for symbol in config['symbols']:
                for stock in market_data:
                    if stock.get('symbol') == symbol:
                        market_stocks.append(stock)
                        break
        
        if not market_stocks:
            print(f"⚠️  No stock data found for {market}")
            return {'stocks': []}
        
        # Analyze technical indicators
        analysis = self.analyze_technical(market_stocks)
        
        # Generate predictions
        predictions = [
            self.generate_prediction(symbol, analysis)
            for symbol in analysis.keys()
        ]
        
        return {
            'market': market_upper,
            'stocks': sorted(predictions, key=lambda x: float(x['confidence'].rstrip('%')), reverse=True),
            'market_outlook': self._get_market_outlook(predictions),
            'risk_level': 'Medium',
            'timestamp': datetime.now().isoformat(),
        }
    
    def _get_market_outlook(self, predictions: List[Dict]) -> str:
        """Generate market outlook based on predictions"""
        buys = len([p for p in predictions if p['prediction'] == 'BUY'])
        sells = len([p for p in predictions if p['prediction'] == 'SELL'])
        holds = len([p for p in predictions if p['prediction'] == 'HOLD'])
        
        if buys > sells:
            return f"Bullish sentiment: {buys} BUY signals vs {sells} SELL signals"
        elif sells > buys:
            return f"Bearish sentiment: {sells} SELL signals vs {buys} BUY signals"
        else:
            return f"Mixed sentiment: {buys} BUY, {sells} SELL, {holds} HOLD"
    
    def save_predictions(self, market: str, predictions: Dict, filename: str = None):
        """Save predictions to file"""
        if filename is None:
            filename = f"predictions_{market}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filename, 'w') as f:
            json.dump(predictions, f, indent=2)
        
        print(f"✅ Predictions saved to {filename}")
    
    def display_predictions(self, predictions: Dict):
        """Display predictions in console"""
        print(f"\n{'='*70}")
        print(f"📊 PREDICTIONS FOR {predictions.get('market', 'UNKNOWN')} MARKET")
        print(f"{'='*70}")
        print(f"🔍 Outlook: {predictions.get('market_outlook', 'N/A')}")
        print(f"⚠️  Risk Level: {predictions.get('risk_level', 'N/A')}")
        print(f"⏰ Time: {predictions.get('timestamp', 'N/A')}")
        print(f"\n{'SYMBOL':<10} {'PREDICTION':<12} {'CONFIDENCE':<12} {'TARGET':<15} {'SCORE':<8}")
        print(f"{'-'*70}")
        
        for pred in predictions.get('stocks', []):
            symbol = pred.get('symbol', 'N/A')[:8]
            prediction = pred.get('prediction', 'N/A')
            confidence = pred.get('confidence', 'N/A')
            target = pred.get('target_price_change', 'N/A')
            score = pred.get('technical_score', 'N/A')
            
            print(f"{symbol:<10} {prediction:<12} {confidence:<12} {target:<15} {score:<8}")
            print(f"  → {pred.get('reasoning', 'N/A')}")
            print()
        
        print(f"{'='*70}\n")


def ucfirst(s):
    """Capitalize first letter"""
    return s[0].upper() + s[1:] if s else s


def main():
    parser = argparse.ArgumentParser(description='Stock Market Predictions Generator')
    parser.add_argument('--market', default='NSE', help='Market to predict (NSE, BSE, NASDAQ, NYSE)')
    parser.add_argument('--all', action='store_true', help='Predict all markets')
    parser.add_argument('--cache', action='store_true', help='Save to cache file')
    parser.add_argument('--output', default=None, help='Output filename')
    
    args = parser.parse_args()
    
    predictor = StockPredictor()
    
    markets = ['NSE', 'BSE', 'NASDAQ', 'NYSE'] if args.all else [args.market.upper()]
    all_predictions = {}
    
    for market in markets:
        print(f"\n🔄 Predicting {market}...")
        predictions = predictor.predict_market(market)
        
        if predictions.get('stocks'):
            predictor.display_predictions(predictions)
            all_predictions[market] = predictions
            
            if args.cache:
                predictor.save_predictions(market, predictions, args.output)
        else:
            print(f"⚠️  No predictions generated for {market}")
    
    if args.all and all_predictions:
        print(f"\n✅ Generated predictions for {len(all_predictions)} markets")


if __name__ == '__main__':
    main()
