import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBetSchema } from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import { transcribeAudio, validateBettingCommand, generateConfirmationMessage, handleUnclearCommand } from "./ai-agent";

const voiceCommandSchema = z.object({
  command: z.string(),
  confidence: z.number().optional(),
});

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all bets
  app.get("/api/bets", async (req, res) => {
    try {
      const bets = await storage.getBets();
      res.json(bets);
    } catch (error) {
      console.error("Error fetching bets:", error);
      res.status(500).json({ message: "Failed to fetch bets" });
    }
  });

  // Create a new bet
  app.post("/api/bets", async (req, res) => {
    try {
      const betData = insertBetSchema.parse(req.body);
      const bet = await storage.createBet(betData);
      res.status(201).json(bet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bet data", errors: error.errors });
      } else {
        console.error("Error creating bet:", error);
        res.status(500).json({ message: "Failed to create bet" });
      }
    }
  });

  // Delete a bet
  app.delete("/api/bets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBet(id);
      if (success) {
        res.json({ message: "Bet deleted successfully" });
      } else {
        res.status(404).json({ message: "Bet not found" });
      }
    } catch (error) {
      console.error("Error deleting bet:", error);
      res.status(500).json({ message: "Failed to delete bet" });
    }
  });

  // Update bet status
  app.patch("/api/bets/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const bet = await storage.updateBetStatus(id, status);
      if (bet) {
        res.json(bet);
      } else {
        res.status(404).json({ message: "Bet not found" });
      }
    } catch (error) {
      console.error("Error updating bet status:", error);
      res.status(500).json({ message: "Failed to update bet status" });
    }
  });

  // Get all matches
  app.get("/api/matches", async (req, res) => {
    try {
      const matches = await storage.getMatches();
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Get bet options for a match
  app.get("/api/matches/:id/bet-options", async (req, res) => {
    try {
      const matchId = parseInt(req.params.id);
      const betOptions = await storage.getBetOptionsByMatchId(matchId);
      res.json(betOptions);
    } catch (error) {
      console.error("Error fetching bet options:", error);
      res.status(500).json({ message: "Failed to fetch bet options" });
    }
  });

  // Process voice command
  app.post("/api/voice-command", async (req, res) => {
    try {
      const { command, confidence } = voiceCommandSchema.parse(req.body);
      
      // Simple NLU processing
      const parsedCommand = parseVoiceCommand(command);
      
      if (parsedCommand.type === "bet") {
        // Create a bet from the voice command
        const bet = await storage.createBet({
          selection: parsedCommand.selection,
          match: parsedCommand.match,
          stake: parsedCommand.stake.toString(),
          odds: parsedCommand.odds.toString(),
          potentialWin: (parsedCommand.stake * parsedCommand.odds).toFixed(2),
          status: "pending",
        });
        
        res.json({
          success: true,
          action: "bet_created",
          bet,
          confirmation: `Bet placed: ${parsedCommand.stake} on ${parsedCommand.selection} at odds ${parsedCommand.odds}. Potential win: ${bet.potentialWin}`,
        });
      } else if (parsedCommand.type === "show_odds") {
        const matches = await storage.getMatches();
        res.json({
          success: true,
          action: "show_odds",
          matches,
          confirmation: "Displaying current odds for all matches",
        });
      } else if (parsedCommand.type === "cancel_bet") {
        const bets = await storage.getBets();
        if (bets.length > 0) {
          const lastBet = bets[bets.length - 1];
          await storage.deleteBet(lastBet.id);
          res.json({
            success: true,
            action: "bet_cancelled",
            confirmation: "Last bet has been cancelled",
          });
        } else {
          res.json({
            success: false,
            action: "no_bets_to_cancel",
            confirmation: "No bets to cancel",
          });
        }
      } else {
        res.json({
          success: false,
          action: "command_not_understood",
          confirmation: "Sorry, I didn't understand that command. Try saying something like 'Bet 10 pounds on Djokovic to win'",
        });
      }
    } catch (error) {
      console.error("Error processing voice command:", error);
      res.status(500).json({ message: "Failed to process voice command" });
    }
  });

  // AI-powered voice transcription using Whisper
  app.post("/api/transcribe-audio", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const transcription = await transcribeAudio(req.file.buffer);
      res.json(transcription);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      res.status(500).json({ message: "Failed to transcribe audio" });
    }
  });

  // AI-powered voice command validation and processing
  app.post("/api/validate-voice-command", async (req, res) => {
    try {
      const { command } = voiceCommandSchema.parse(req.body);
      
      const validation = await validateBettingCommand(command);
      
      if (validation.isValid && validation.extractedData.action === 'bet') {
        // Auto-create bet if validation is successful and doesn't require confirmation
        if (!validation.requiresConfirmation) {
          try {
            const betData = {
              selection: validation.extractedData.selection || '',
              match: validation.extractedData.match || '',
              stake: validation.extractedData.amount?.toString() || '0',
              odds: validation.extractedData.odds?.toString() || '1.0',
              potentialWin: validation.extractedData.amount && validation.extractedData.odds 
                ? (validation.extractedData.amount * validation.extractedData.odds).toString()
                : '0',
              status: 'pending'
            };
            
            const bet = await storage.createBet(betData);
            validation.message = await generateConfirmationMessage(validation);
          } catch (betError) {
            console.error("Error creating bet:", betError);
            validation.isValid = false;
            validation.message = "Failed to place bet. Please try again.";
          }
        }
      }
      
      res.json(validation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid voice command data", errors: error.errors });
      } else {
        console.error("Error validating voice command:", error);
        res.status(500).json({ message: "Failed to validate voice command" });
      }
    }
  });

  // Handle unclear or confusing voice commands
  app.post("/api/clarify-command", async (req, res) => {
    try {
      const { command } = voiceCommandSchema.parse(req.body);
      
      const suggestion = await handleUnclearCommand(command);
      
      res.json({
        suggestion,
        originalCommand: command,
        clarificationNeeded: true
      });
    } catch (error) {
      console.error("Error clarifying command:", error);
      res.status(500).json({ message: "Failed to clarify command" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simple NLU parser for voice commands
function parseVoiceCommand(command: string): any {
  const lowercaseCommand = command.toLowerCase();
  
  // Bet pattern: "bet X on Y to win Z"
  const betPattern = /bet\s+(?:£|pounds?|dollars?|)\s*(\d+(?:\.\d+)?)\s+on\s+(.+?)\s+(?:to\s+win\s+(.+?))?(?:\s+at\s+odds\s+(\d+(?:\.\d+)?))?/i;
  const betMatch = lowercaseCommand.match(betPattern);
  
  if (betMatch) {
    const stake = parseFloat(betMatch[1]);
    const selection = betMatch[2];
    const outcome = betMatch[3] || "to win";
    const odds = betMatch[4] ? parseFloat(betMatch[4]) : 2.0; // Default odds
    
    return {
      type: "bet",
      stake,
      selection: `${selection} ${outcome}`,
      match: inferMatch(selection),
      odds,
    };
  }
  
  // Show odds pattern
  if (lowercaseCommand.includes("show") && lowercaseCommand.includes("odds")) {
    return { type: "show_odds" };
  }
  
  // Cancel bet pattern
  if (lowercaseCommand.includes("cancel") && lowercaseCommand.includes("bet")) {
    return { type: "cancel_bet" };
  }
  
  return { type: "unknown" };
}

function inferMatch(selection: string): string {
  const lowerSelection = selection.toLowerCase();
  
  if (lowerSelection.includes("djokovic") || lowerSelection.includes("nadal")) {
    return "Wimbledon Final";
  }
  
  if (lowerSelection.includes("arsenal") || lowerSelection.includes("manchester") || lowerSelection.includes("city")) {
    return "Arsenal vs Manchester City";
  }
  
  return "Unknown match";
}
