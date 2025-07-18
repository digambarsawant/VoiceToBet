// Simple server starter for Windows compatibility
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'client')));

// Basic API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Voice Betting Terminal is running!' });
});

// Serve the main page
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client', 'index.html'));
});

const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`
🎤 Voice Betting Terminal Started Successfully!
🌐 Open your browser to: http://localhost:${port}
📱 Or try: http://127.0.0.1:${port}

Note: This is a simplified server. For full functionality, 
you'll need Node.js 20+ or try the main server with:
tsx server/index.ts
  `);
});