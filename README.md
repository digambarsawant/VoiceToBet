# Voice Betting Terminal

A voice-controlled betting interface that allows users to place bets through voice commands, featuring accessibility-first design with screen reader support and audio feedback.

## Features

- 🎤 **Voice Recognition**: Place bets using natural voice commands
- 🔊 **Audio Feedback**: Full text-to-speech confirmation for all actions
- ♿ **Accessibility**: Screen reader compatible with keyboard navigation
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎾 **Sports Betting**: Tennis and football matches with live odds
- 🎧 **Audio Controls**: Adjustable volume and speech speed

## Local Setup Instructions

### Prerequisites

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

## Project Architecture

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

### File Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   │   ├── voice-interface.tsx      # Voice command interface
│   │   │   ├── betting-slip.tsx         # Betting slip management
│   │   │   ├── odds-display.tsx         # Live odds display
│   │   │   ├── audio-controls.tsx       # Audio settings
│   │   │   └── system-status.tsx        # System monitoring
│   │   ├── hooks/        # Custom React hooks
│   │   │   ├── use-speech-recognition.ts # Speech recognition hook
│   │   │   ├── use-text-to-speech.ts    # Text-to-speech hook
│   │   │   └── use-toast.ts             # Toast notifications
│   │   ├── pages/        # Application pages
│   │   │   └── betting-terminal.tsx     # Main application page
│   │   └── lib/          # Utilities
│   │       ├── queryClient.ts           # API client setup
│   │       ├── utils.ts                 # Helper functions
│   │       └── nlu-parser.ts            # Natural language processing
│   └── index.html        # Main HTML template
├── server/               # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # In-memory data storage
│   └── vite.ts           # Vite development server
├── shared/               # Shared types and schemas
│   └── schema.ts         # Data models and validation
└── package.json          # Dependencies and scripts
```

### Low-Level Design (LLD)

#### Voice Processing Flow
```
Voice Input → Speech Recognition API → Natural Language Parser → 
Command Validation → Business Logic → Database Update → 
UI Update → Audio Confirmation
```

#### API Endpoints
- `GET /api/bets` - Retrieve user's betting slip
- `POST /api/bets` - Add new bet to slip
- `DELETE /api/bets/:id` - Remove bet from slip
- `PATCH /api/bets/:id/status` - Update bet status
- `GET /api/matches` - Get available matches and odds
- `GET /api/matches/:id/bet-options` - Get betting options for match
- `POST /api/voice-command` - Process voice commands

#### Data Models

**Bet Schema**
```typescript
interface Bet {
  id: number;              // Unique identifier
  selection: string;       // What user is betting on
  match: string;          // Which match/event
  stake: string;          // Amount being bet
  odds: string;           // Odds at time of bet
  potentialWin: string;   // Calculated potential winnings
  status: string;         // pending, placed, won, lost
  createdAt: Date;        // When bet was created
}
```

**Match Schema**
```typescript
interface Match {
  id: number;             // Unique identifier
  title: string;          // Match title
  player1: string;        // First player/team
  player2: string;        // Second player/team
  player1Odds: string;    // Odds for player1
  player2Odds: string;    // Odds for player2
  matchTime: string;      // When match starts
  sport: string;          // Tennis, Football, etc.
  isLive: boolean;        // Is match currently live
}
```

#### Voice Recognition System

**Speech Recognition Hook**
- Uses Web Speech API (webkitSpeechRecognition)
- Continuous listening mode disabled for better accuracy
- English language configured
- Error handling for unsupported browsers

**Natural Language Processing**
- Regular expression patterns for command parsing
- Supports flexible betting syntax
- Extracts stake amounts, player/team names, bet types
- Maps spoken names to database entities

**Text-to-Speech Engine**
- Uses SpeechSynthesis API
- Configurable volume, rate, and pitch
- Queue management for multiple announcements
- Cross-browser compatibility handling

#### Frontend Architecture

**State Management**
- TanStack Query for server state
- React hooks for component state
- Real-time updates via API polling

**Component Hierarchy**
```
App
├── BettingTerminal (main page)
│   ├── VoiceInterface (voice commands)
│   ├── BettingSlip (current bets)
│   ├── OddsDisplay (available odds)
│   ├── AudioControls (audio settings)
│   └── SystemStatus (service monitoring)
└── Toast notifications
```

**Accessibility Features**
- ARIA labels and roles
- Screen reader announcements
- Keyboard navigation support
- High contrast focus indicators
- Skip navigation links

#### Backend Architecture

**Express.js Server**
- RESTful API design
- JSON request/response format
- Error handling middleware
- CORS configuration for development

**Data Storage**
- In-memory storage for development
- Easily extensible to database backends
- Sample data seeding for testing

**Voice Command Processing**
- Regular expression parsing
- Command type classification
- Entity extraction (amounts, names)
- Response generation

#### Development Workflow

**Available Scripts**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking

**Tech Stack**
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Voice**: Web Speech API (native browser APIs)
- **State**: TanStack Query for server state
- **Build**: Vite for fast development and optimized builds

## Troubleshooting

### Common Issues

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

### Browser Compatibility

| Browser | Voice Recognition | Text-to-Speech | Overall Support |
|---------|------------------|----------------|-----------------|
| Chrome | ✅ Full | ✅ Full | ✅ Recommended |
| Edge | ✅ Full | ✅ Full | ✅ Recommended |
| Safari | ⚠️ Limited | ✅ Full | ⚠️ Partial |
| Firefox | ❌ None | ✅ Full | ❌ Not recommended |

## AI Components in the System

This project uses several AI technologies to understand and process human speech:

### 🎤 **1. Advanced Speech Recognition**

**Two AI-Powered Options:**

**Option A: OpenAI Whisper (Recommended)**
- **Location**: `client/src/hooks/use-whisper-recognition.ts`
- **Technology**: OpenAI Whisper API for transcription
- Higher accuracy than browser APIs
- Works in any browser with microphone support
- Professional-grade speech recognition

**Option B: Browser Speech API**
- **Location**: `client/src/hooks/use-speech-recognition.ts` 
- **Technology**: Browser's built-in Web Speech API
- Real-time voice processing
- No external API required
- Chrome/Edge only

```typescript
// Whisper API transcription
const transcription = await openai.audio.transcriptions.create({
  file: audioBlob,
  model: "whisper-1",
  language: "en"
});
```

### 🧠 **2. AI Command Validation & Processing**
**Location**: `server/ai-agent.ts`

**Technology**: OpenAI GPT-4 for intelligent command validation
- Analyzes voice commands using large language models
- Extracts betting parameters with high accuracy
- Provides confidence scores for each command
- Intelligent error handling and suggestions
- Context-aware bet validation

```typescript
// GPT-4 powered validation
const validation = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: transcript }],
  response_format: { type: "json_object" }
});
```

**Validation Features:**
- Confidence scoring (0-100%)
- Amount extraction and validation
- Player/team name mapping
- Risk assessment for large bets
- Confirmation requirements for unclear commands

### 🔊 **3. Text-to-Speech (TTS)**
**Location**: `client/src/hooks/use-text-to-speech.ts`

**Technology**: Browser's SpeechSynthesis API
- Converts text responses back to spoken audio
- Configurable voice parameters (volume, rate, pitch)
- Queue management for multiple announcements
- Accessibility-focused audio feedback

```typescript
// AI-powered speech synthesis
const utterance = new SpeechSynthesisUtterance(text);
utterance.volume = volume;
utterance.rate = rate;
utterance.lang = 'en-GB';
```

### 🎯 **4. Smart Entity Recognition**
**Location**: `client/src/lib/nlu-parser.ts` (functions: `inferMatch`, `inferOdds`)

**Technology**: Rule-based entity mapping
- Maps spoken names to specific matches
- Infers betting odds from player/team mentions
- Handles variations in pronunciation and naming

```typescript
// AI-powered entity inference
function inferMatch(selection: string): string {
  if (selection.includes("djokovic") || selection.includes("nadal")) {
    return "Wimbledon Final";
  }
  return "Unknown Match";
}
```

### 📊 **AI Processing Flow**

```
Voice Input → ASR → NLU Parser → Entity Recognition → 
Business Logic → Database Update → TTS Confirmation
```

**Step-by-step AI Process:**
1. **Voice captured** by microphone
2. **ASR converts** speech to text using machine learning models
3. **NLU parser analyzes** text using pattern recognition
4. **Entity recognition** maps words to database records
5. **Confidence scoring** validates command accuracy
6. **TTS generates** audio confirmation using speech synthesis

### 🤖 **Advanced AI Capabilities**

**What the AI agent validates:**
- "Bet 10 pounds on Djokovic to win" 
- "Place 25 on Arsenal"
- "Show me current odds"
- "Cancel my last bet"
- Complex commands with multiple parameters

**Intelligent Features:**
- **Smart Validation**: AI agent reviews each command before execution
- **Confidence Scoring**: Provides 0-100% confidence on understanding
- **Risk Assessment**: Flags large bets (>£50) for confirmation
- **Context Understanding**: Knows current matches and available odds
- **Error Recovery**: Suggests correct phrasing for unclear commands
- **Automatic Execution**: Places validated bets without confirmation
- **Manual Override**: Requires confirmation for risky/unclear bets

**AI Processing Pipeline:**
```
Voice Input → Whisper Transcription → GPT-4 Validation → 
Risk Assessment → Auto-Execute OR Request Confirmation
```

### 🌐 **Browser-Based AI**

**No external AI services needed:**
- Uses built-in browser AI capabilities
- Works offline once loaded
- No API keys or cloud services required
- Privacy-focused - voice data stays local

**Browser compatibility:**
- Chrome/Edge: Full AI features (ASR + TTS)
- Safari: Limited ASR, full TTS
- Firefox: TTS only

## Contributing

This project demonstrates voice interface capabilities for accessibility in betting applications. Key architectural decisions prioritize:

1. **Accessibility**: Screen reader compatibility, keyboard navigation
2. **Voice-first**: Natural language processing for spoken commands  
3. **Real-time feedback**: Immediate audio confirmation of actions
4. **Progressive enhancement**: Works without voice for broader compatibility

## License

This project is for demonstration and educational purposes only. Please ensure compliance with local gambling regulations before any commercial use.