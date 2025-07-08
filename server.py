#!/usr/bin/env python3
"""
Simple Python HTTP server for Nymph web application.
Serves static files and handles basic routing.
"""

import os
import sys
import http.server
import socketserver
import webbrowser
from pathlib import Path

class NymphHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP request handler for Nymph application."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).parent), **kwargs)
    
    def end_headers(self):
        """Add CORS headers for local development."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_GET(self):
        """Handle GET requests with proper routing."""
        # Remove query parameters for routing
        path = self.path.split('?')[0]
        
        # Route handling
        if path == '/':
            self.path = '/index.html'
        elif path == '/dashboard':
            self.path = '/dashboard.html'
        elif path == '/bug-reports':
            self.path = '/bug-reports.html'
        elif path == '/feature-requests':
            self.path = '/feature-requests.html'
        
        # Call parent handler
        super().do_GET()
    
    def log_message(self, format, *args):
        """Custom logging format."""
        print(f"[{self.address_string()}] {format % args}")

def find_free_port(start_port=8000):
    """Find a free port starting from start_port."""
    import socket
    port = start_port
    while port < start_port + 100:  # Try 100 ports
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            port += 1
    raise RuntimeError("Could not find a free port")

def main():
    """Main server function."""
    # Change to the directory containing this script
    os.chdir(Path(__file__).parent)
    
    # Find a free port
    try:
        port = find_free_port()
    except RuntimeError as e:
        print(f"Error: {e}")
        sys.exit(1)
    
    # Create server
    handler = NymphHTTPRequestHandler
    httpd = socketserver.TCPServer(("", port), handler)
    
    # Server info
    server_url = f"http://localhost:{port}"
    print(f"🚀 Nymph server starting...")
    print(f"📍 Server running at: {server_url}")
    print(f"📁 Serving files from: {os.getcwd()}")
    print(f"🌐 Available routes:")
    print(f"   • {server_url}/ (index.html)")
    print(f"   • {server_url}/dashboard (dashboard.html)")
    print(f"   • {server_url}/bug-reports (bug-reports.html)")
    print(f"   • {server_url}/feature-requests (feature-requests.html)")
    print(f"")
    print(f"📊 Press Ctrl+C to stop the server")
    print(f"🔄 Opening browser automatically...")
    
    # Open browser
    try:
        webbrowser.open(server_url)
    except Exception as e:
        print(f"Could not open browser automatically: {e}")
        print(f"Please open {server_url} manually in your browser")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped.")
        httpd.shutdown()

if __name__ == "__main__":
    main()