// Simple server starter for Windows compatibility
const express = require('express');
const path = require('path');
const { createServer } = require('http');

const app = express();
const port = process.env.PORT || 5000;

// In-memory storage for demo
let bets = [
  {
    id: 1,
    selection: "Novak Djokovic",
    match: "Wimbledon Final",
    stake: "10.00",
    odds: "1.75",
    potentialWin: "17.50",
    status: "pending",
    createdAt: new Date()
  }
];

let matches = [
  {
    id: 1,
    title: "Wimbledon Final",
    player1: "Novak Djokovic",
    player2: "Rafael Nadal",
    player1Odds: "1.75",
    player2Odds: "2.10",
    matchTime: "Today 14:00",
    sport: "Tennis",
    isLive: true
  },
  {
    id: 2,
    title: "Arsenal vs Manchester City",
    player1: "Arsenal",
    player2: "Manchester City",
    player1Odds: "2.40",
    player2Odds: "3.10",
    matchTime: "Tomorrow 17:30",
    sport: "Football",
    isLive: false
  }
];

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

// API endpoints
app.get('/api/bets', (req, res) => {
  res.json(bets);
});

app.post('/api/bets', (req, res) => {
  const newBet = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date()
  };
  bets.push(newBet);
  res.status(201).json(newBet);
});

app.delete('/api/bets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  bets = bets.filter(bet => bet.id !== id);
  res.json({ message: 'Bet deleted successfully' });
});

app.get('/api/matches', (req, res) => {
  res.json(matches);
});

app.post('/api/voice-command', (req, res) => {
  const { command } = req.body;
  console.log('Voice command received:', command);
  
  // Simple voice command processing
  if (command.toLowerCase().includes('bet') && command.toLowerCase().includes('djokovic')) {
    const newBet = {
      id: Date.now(),
      selection: "Novak Djokovic",
      match: "Wimbledon Final",
      stake: "10.00",
      odds: "1.75",
      potentialWin: "17.50",
      status: "pending",
      createdAt: new Date()
    };
    bets.push(newBet);
    
    res.json({
      success: true,
      action: "bet_created",
      bet: newBet,
      confirmation: "Bet placed: £10 on Djokovic to win at odds 1.75. Potential win: £17.50"
    });
  } else if (command.toLowerCase().includes('cancel')) {
    if (bets.length > 0) {
      bets.pop();
      res.json({
        success: true,
        action: "bet_cancelled",
        confirmation: "Last bet has been cancelled"
      });
    } else {
      res.json({
        success: false,
        action: "no_bets_to_cancel",
        confirmation: "No bets to cancel"
      });
    }
  } else {
    res.json({
      success: false,
      action: "command_not_understood",
      confirmation: "Sorry, I didn't understand that command. Try saying something like 'Bet 10 pounds on Djokovic to win'"
    });
  }
});

// Serve the main page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`
🎤 Voice Betting Terminal Started Successfully!
🌐 Open your browser to: http://localhost:${port}
📱 Or try: http://127.0.0.1:${port}

✅ Compatible with Node.js ${process.version}
✅ Voice commands ready
✅ API endpoints working

Try saying: "Bet 10 pounds on Djokovic to win"
  `);
});