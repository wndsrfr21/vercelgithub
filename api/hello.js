const https = require('https');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, description = '', private = false } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Repository name is required' });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const data = JSON.stringify({
    name,
    description,
    private,
  });

  const options = {
    hostname: 'api.github.com',
    path: '/user/repos',
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'User-Agent': 'Node.js Serverless Function'
    }
  };

  const apiRequest = https.request(options, (apiResponse) => {
    let body = '';

    apiResponse.on('data', (chunk) => {
      body += chunk;
    });

    apiResponse.on('end', () => {
      if (apiResponse.statusCode === 201) {
        res.status(201).json({ message: 'Repository created successfully' });
      } else {
        res.status(apiResponse.statusCode).json({ error: 'Failed to create repository', details: JSON.parse(body) });
      }
    });
  });

  apiRequest.on('error', (error) => {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  });

  apiRequest.write(data);
  apiRequest.end();
}
