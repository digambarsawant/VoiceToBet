# Voice Betting Terminal

A voice-controlled betting interface that allows users to place bets through voice commands, featuring accessibility-first design with screen reader support and audio feedback.

## Features

- 🎤 **Voice Recognition**: Place bets using natural voice commands
- 🔊 **Audio Feedback**: Full text-to-speech confirmation for all actions
- ♿ **Accessibility**: Screen reader compatible with keyboard navigation
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎾 **Sports Betting**: Tennis and football matches with live odds
- 🎧 **Audio Controls**: Adjustable volume and speech speed

## Quick Start

### Prerequisites

Make sure you have the following installed on your system:
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Installation

1. **Extract the downloaded zip file** to your desired location
2. **Open a terminal/command prompt** and navigate to the project folder:
   ```bash
   cd voice-betting-terminal
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the application**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and go to: `http://localhost:5000`

That's it! The application should now be running.

## How to Use

### Voice Commands

Click the large microphone button and speak one of these commands:

- **"Bet 10 pounds on Djokovic to win"** - Places a £10 bet on Djokovic
- **"Bet 25 on Arsenal to win"** - Places a £25 bet on Arsenal
- **"Show me current odds"** - Displays all available odds
- **"Cancel last bet"** - Removes the most recent bet

### Alternative Methods

- **Click betting buttons** - Use the odds display to quickly add bets
- **Keyboard navigation** - Press Tab to navigate, Enter to select
- **Screen reader support** - Full compatibility with screen readers

### Audio Settings

- Adjust **volume** using the slider in Audio Settings
- Change **speech speed** from slow to fast
- Test audio with the "Test Audio" button

## Browser Requirements

This application requires a modern web browser with:
- **Speech Recognition** support (Chrome, Edge, Safari)
- **Text-to-Speech** support (most modern browsers)
- **Microphone access** (you'll be prompted to allow this)

### Supported Browsers
- ✅ Chrome (recommended)
- ✅ Microsoft Edge
- ✅ Safari
- ⚠️ Firefox (limited speech recognition support)

## Troubleshooting

### Voice commands not working?
1. Make sure your browser supports speech recognition
2. Check that microphone access is allowed
3. Try using Chrome or Edge browsers
4. Check the System Status panel for any issues

### Audio feedback not working?
1. Check your device volume
2. Adjust the volume slider in Audio Settings
3. Test with the "Test Audio" button

### Application won't start?
1. Make sure Node.js is installed: `node --version`
2. Delete `node_modules` folder and run `npm install` again
3. Check that port 5000 is not being used by another application

## Development

### Project Structure

```
├── client/src/           # Frontend React application
│   ├── components/       # UI components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Application pages
│   └── lib/             # Utility functions
├── server/              # Backend Express server
├── shared/              # Shared types and schemas
└── package.json         # Dependencies and scripts
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Voice**: Web Speech API
- **State Management**: TanStack Query
- **Build Tool**: Vite

## Architecture Overview

### High-Level Design (HLD)

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   Express API    │    │   Data Storage  │
│                 │    │                  │    │                 │
│ • Voice Input   │◄──►│ • Voice Parser   │◄──►│ • Matches DB    │
│ • Audio Output  │    │ • Bet Management │    │ • Bets DB       │
│ • UI Interface  │    │ • Odds Service   │    │ • Options DB    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Low-Level Design (LLD)

#### Voice Processing Flow
```
Voice Input → Speech Recognition API → Natural Language Parser → 
Bet Command Object → Validation → Database Storage → Audio Confirmation
```

#### API Endpoints
- `GET /api/matches` - Fetch available matches
- `GET /api/bets` - Get user's betting slip
- `POST /api/bets` - Add new bet
- `DELETE /api/bets/:id` - Remove bet
- `POST /api/voice-command` - Process voice commands

#### Data Models
```typescript
interface Bet {
  id: number;
  selection: string;
  match: string;
  stake: string;
  odds: string;
  potentialWin: string;
  status: string;
}

interface Match {
  id: number;
  title: string;
  player1: string;
  player2: string;
  player1Odds: string;
  player2Odds: string;
  sport: string;
  isLive: boolean;
}
```

## Contributing

This is a demonstration project showcasing voice interface capabilities for accessibility in betting applications.

## License

This project is for demonstration purposes only. Please ensure compliance with local gambling regulations before any commercial use.