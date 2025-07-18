# Windows Setup Instructions

Since you're on Windows and encountered the environment variable error, here are **3 different ways** to run the project:

## Option 1: Use the Windows Batch File (Easiest)

I've created a Windows batch file for you:

```bash
# Just double-click this file or run:
start-windows.bat
```

## Option 2: Install cross-env (Recommended)

The cross-env package is already installed, but you need to run:

```bash
npx cross-env NODE_ENV=development tsx server/index.ts
```

## Option 3: Use PowerShell

If you're using PowerShell, run:

```powershell
$env:NODE_ENV="development"; tsx server/index.ts
```

## Option 4: Manual Start (If others fail)

```bash
# Start the server directly without environment variable
tsx server/index.ts
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