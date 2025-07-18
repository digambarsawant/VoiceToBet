# Windows Quick Start Guide

The error you're seeing (EACCES port 5000) means port 5000 is already in use. Here are **working solutions**:

## 🚀 **EASIEST - Smart Batch File (Recommended)**

```bash
start-easy.bat
```

This automatically detects which port is available and starts the right server.

## 🎯 **Alternative - Simple Server**

```bash
node simple-start.js
```

Opens on port 3000: `http://localhost:3000`

## 🔧 **Fix Port Issue - Stop Existing Server**

If something is already running on port 5000:

**Method 1: Task Manager**
1. Open Task Manager (Ctrl + Shift + Esc)
2. Look for "Node.js" processes
3. End them
4. Try: `npx tsx server/index.ts`

**Method 2: Command Line**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID [PID_NUMBER] /F
```

## 🌐 **After Starting Successfully**

You'll see one of these messages:
```
🎤 Voice Betting Terminal Started Successfully!
🌐 Open your browser to: http://localhost:5000
```
OR
```
🎤 Voice Betting Terminal Started Successfully!
🌐 Open your browser to: http://localhost:3000
```

## 🎤 **Test Voice Commands**

1. **Open the URL** in Chrome or Edge
2. **Click the microphone button** (large blue circle)
3. **Allow microphone** when prompted
4. **Say**: "Bet 10 pounds on Djokovic to win"
5. **Listen** for audio confirmation

## ⚡ **Voice Commands to Try**

- "Bet 10 pounds on Djokovic to win"
- "Bet 25 on Arsenal to win" 
- "Show me current odds"
- "Cancel last bet"

## 🛠️ **Still Having Issues?**

**Update Node.js** (solves most compatibility issues):
1. Download Node.js 20+ from https://nodejs.org/
2. Install and restart command prompt
3. Run: `npm run dev`

**Check Browser Compatibility**:
- ✅ Chrome (best support)
- ✅ Microsoft Edge
- ⚠️ Firefox (limited voice support)
- ❌ Internet Explorer (not supported)

The voice interface uses your browser's built-in speech recognition, so modern browsers work best!