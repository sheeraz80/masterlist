#!/usr/bin/env python3
"""
Run the Masterlist Web Interface
"""

import os
import sys
import argparse

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

def main():
    parser = argparse.ArgumentParser(description='Run the Masterlist Web Interface')
    parser.add_argument('--host', default='127.0.0.1', help='Host to bind to (default: 127.0.0.1)')
    parser.add_argument('--port', type=int, default=5000, help='Port to bind to (default: 5000)')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    parser.add_argument('--production', action='store_true', help='Run in production mode with Waitress')
    
    args = parser.parse_args()
    
    if args.production:
        # Production mode with Waitress
        try:
            from waitress import serve
            print(f"Starting Masterlist Web Interface in production mode...")
            print(f"Server running at http://{args.host}:{args.port}")
            serve(app, host=args.host, port=args.port)
        except ImportError:
            print("Error: Waitress not installed. Run: pip install waitress")
            sys.exit(1)
    else:
        # Development mode with Flask's built-in server
        print(f"Starting Masterlist Web Interface in development mode...")
        print(f"Server running at http://{args.host}:{args.port}")
        print("Press CTRL+C to stop the server")
        app.run(host=args.host, port=args.port, debug=args.debug)

if __name__ == '__main__':
    main()