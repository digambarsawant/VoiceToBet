# Voice Betting Terminal

A voice-controlled betting interface that allows users to place bets through voice commands, featuring accessibility-first design with screen reader support and audio feedback.

- **Node.js** version 18 or higher - [Download from nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)

### Installation Steps

1. **Extract the project** to your desired folder
2. **Open command prompt/terminal** in the project folder
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the server**:
   ```bash
   npm run dev
   ```
5. **Open browser** to: `http://localhost:5000`

### Windows Users

If you get environment variable errors on Windows, try:
```bash
npx cross-env NODE_ENV=development tsx server/index.ts
```

### Browser Requirements

- **Best**: Chrome or Microsoft Edge (full voice support)
- **Good**: Safari 
- **Limited**: Firefox (voice recognition may not work)

## How to Use

### Voice Commands

1. **Click the blue microphone button**
2. **Allow microphone access** when your browser asks
3. **Speak clearly** one of these commands:

**Betting Commands:**
- "Bet 10 pounds on Djokovic" - Places £10 bet on Djokovic
- "Bet 25 on Arsenal to win" - Places £25 bet on Arsenal  
- "Bet 15 pounds on Nadal" - Places £15 bet on Nadal
- "Bet 20 on Manchester City" - Places £20 bet on Man City

**Information Commands:**
- "Show me current odds" - Displays all available odds
- "Cancel last bet" - Removes the most recent bet

### Alternative Methods

- **Click odds buttons** - Quick £10 bets on displayed odds
- **Remove button (×)** - Click to remove individual bets
- **Audio controls** - Adjust volume and speech speed
- **Test Audio button** - Verify audio is working

### Audio Settings

- **Volume slider** - Control how loud the voice feedback is
- **Speed slider** - Make speech faster or slower  
- **Test Audio** - Check if audio feedback is working


### High-Level Design (HLD)

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Data Layer    │
│   (React)       │◄──►│   (Express.js)   │◄──►│   (Memory)      │
│                 │    │                  │    │                 │
│ • Voice Input   │    │ • Voice Parser   │    │ • Matches       │
│ • Audio Output  │    │ • Bet Management │    │ • Bets          │
│ • UI Components │    │ • API Routes     │    │ • Options       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```
**Port 5000 already in use**
```bash
# Check what's using the port
netstat -ano | findstr :5000
# Kill the process or use different port
```

**Voice commands not recognized**
1. Use Chrome or Edge browser
2. Allow microphone permissions
3. Speak clearly and avoid background noise
4. Check System Status panel for service health

**Audio feedback not working**
1. Check browser volume settings
2. Use Audio Settings to adjust volume
3. Test with "Test Audio" button
4. Ensure speakers/headphones are working

**Environment variable errors (Windows)**
```bash
# Use cross-env for Windows compatibility
npx cross-env NODE_ENV=development tsx server/index.ts
```

**Dependencies installation fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```