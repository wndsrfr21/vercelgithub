import os
import json
import requests
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        data = json.loads(body)

        repo_name = data.get('name')
        description = data.get('description', '')
        private = data.get('private', False)

        if not repo_name:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Repository name is required'}).encode())
            return

        token = os.getenv('GITHUB_TOKEN')
        url = 'https://api.github.com/user/repos'
        headers = {
            'Authorization': f'token {token}',
            'Content-Type': 'application/json'
        }
        payload = {
            'name': repo_name,
            'description': description,
            'private': private
        }

        response = requests.post(url, headers=headers, data=json.dumps(payload))

        self.send_response(response.status_code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(response.content)

# Ensure you have a `requirements.txt` file with `requests` listed
