#!/usr/bin/env python3
"""Minimal test app to verify Docker setup works."""

from flask import Flask, jsonify
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return jsonify({
        'message': 'Masterlist API is running!',
        'status': 'success',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'masterlist',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/stats')
def stats():
    return jsonify({
        'total_projects': 605,
        'categories': 10,
        'platforms': 15,
        'average_quality': 7.5
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)