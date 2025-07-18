# Windows Setup Instructions - FIXED

The error you encountered is due to Node.js version compatibility. Here are **5 solutions** ordered from easiest to most technical:

## ✅ Option 1: Simple JavaScript Server (Recommended for Windows)

```bash
node simple-start.js
```

This bypasses the vite configuration issue entirely.

## ✅ Option 2: Update Node.js (Best Long-term Solution)

Your Node.js v18.20.8 is causing the issue. Download and install Node.js 20+ from:
https://nodejs.org/

Then run:
```bash
npm run dev
```

## ✅ Option 3: Use the Windows Batch File

```bash
start-windows.bat
```

## ✅ Option 4: Direct Server Start

```bash
npx tsx server/index.ts
```

## ✅ Option 5: PowerShell Method

```powershell
$env:NODE_ENV="development"; npx tsx server/index.ts
```

## After Starting

Once any of these commands work, you should see:
```
[express] serving on port 5000
```

Then open your browser to: **http://localhost:5000**

## Troubleshooting

**If you get "tsx is not recognized":**
```bash
npm install -g tsx
```

**If Node.js is not installed:**
- Download from https://nodejs.org/
- Choose the LTS version
- Restart your command prompt after installation

**If port 5000 is busy:**
- The app will automatically use a different port
- Check the console output for the actual port number

## Quick Test

After the server starts, test the voice interface:
1. Click the microphone button
2. Allow microphone access when prompted
3. Say: "Bet 10 pounds on Djokovic to win"
4. You should hear audio confirmation

The application works best in **Chrome or Edge browsers** for full speech recognition support.