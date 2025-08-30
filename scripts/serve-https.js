// scripts/serve-https.js
const https = require('https');
const fs = require('fs');
const path = require('path');

// Self-signed certificate for local development
const options = {
  key: fs.readFileSync(path.join(__dirname, '../certs/localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certs/localhost.pem'))
};

const express = require('express');
const app = express();

// Serve static files from out directory
app.use(express.static(path.join(__dirname, '../out')));

// Handle all routes for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../out/index.html'));
});

const server = https.createServer(options, app);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 HTTPS Server running on https://localhost:${PORT}`);
  console.log(`📱 PWA ready for testing!`);
  console.log(`💡 Open https://localhost:${PORT} in Chrome to test PWA features`);
});
