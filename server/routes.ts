import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBetSchema } from "@shared/schema";
import { z } from "zod";

const voiceCommandSchema = z.object({
  command: z.string(),
  confidence: z.number().optional(),
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
      console.log('req.body', req.body)
      const { command, confidence } = voiceCommandSchema.parse(req.body);
      
      // Simple NLU processing
      const parsedCommand = parseVoiceCommand(command);
      console.log('parsedCommand', parsedCommand); // Debug log for parsed command
      
      if (parsedCommand.type === "bet") {
        console.log('parsedCommand.type', parsedCommand.type)
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
          confirmation: "Sorry, I didn't understand that command. Try saying something similar like 'Bet 10 pounds on Djokovic to win'",
        });
      }
    } catch (error) {
      console.error("Error processing voice command:", error);
      res.status(500).json({ message: "Failed to process voice command" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simple NLU parser for voice commands
function parseVoiceCommand(command: string): any {
  const lowercaseCommand = command.toLowerCase();

  // Bet pattern: "bet X on Y to win Z"
   const betPattern = /(?:bet|place|place a bet)\s+(\d+(?:\.\d+)?)\s+(?:pound|pounds|dollar|dollars|£|$)\s+on\s+([a-zA-Z\s]+?)\s+to\s+win(?:\s+([\d-]+))?(?:\s+at\s+odds\s+(\d+(?:\.\d+)?))?/i;
   const betMatch = lowercaseCommand.match(betPattern);
  if (betMatch) {
    const stake = parseFloat(betMatch[1]);
    const selection = betMatch[2];
    const outcome = betMatch[3] || "to win";
    const odds = betMatch[4] ? parseFloat(betMatch[4]) : 2.0; // Default odds
    const MatchSelection = inferMatchName(selection)
    const correctedMatch = inferMatch(selection)

    if(correctedMatch){
    return {
      type: "bet",
      stake,
      selection: MatchSelection,
      match: inferMatch(selection),
      odds: inferOdds(selection, outcome),
    };
  }
  return { type: "unknown" };
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

function inferMatch(selection: string): string | null {
  const lowerSelection = selection.toLowerCase();
  
  if (lowerSelection.includes("djokovic") || lowerSelection.includes("nadal") || lowerSelection.includes("Novak") || lowerSelection.includes("Rafael")) {
    return "Wimbledon Final";
  }
  
  if (lowerSelection.includes("arsenal") || lowerSelection.includes("manchester") || lowerSelection.includes("city")) {
    return "Arsenal vs Manchester City";
  }
  
  return null;
}

function inferMatchName(selection: string): string | null {
  const lowerSelection = selection.toLowerCase();
  
  if (lowerSelection.includes("djokovic") || lowerSelection.includes("novak")) {
    return "Djokovic Nadal";
  } else if ( lowerSelection.includes("nadal") || lowerSelection.includes("Rafael")){
    return "Novak Rafael";
  }else if (lowerSelection.includes("arsenal")) {
    return "Arsenal";
  } else if(lowerSelection.includes("manchester") || lowerSelection.includes("city")){
    return "Manchester City";
  }
  
  return null;
}

function inferOdds(selection: string, outcome: string | any): number {
  const lowerSelection = selection.toLowerCase();
  const lowerOutcome = outcome.toLowerCase();

  // Combined selection + outcome odds
  const specificOddsMap: { [key: string]: number } = {
    "rafael_3-1": 5.80,
    "nadal_3-1":5.80,
    "rafael_3-0": 6.50,
    "nadal_3-0": 6.50,
    "djokovic_3-0": 3.50,
    "djokovic_3-1": 4.20,
    "novak_3-0": 3.50,
    "novak_3-1": 4.20
  };

  // General selection-only odds
  const generalOddsMap: { [key: string]: number } = {
    "djokovic": 1.75,
    "nadal": 2.10,
    "novak": 1.75,
    "rafael": 2.10,
    "arsenal": 2.40,
    "manchester city": 3.10,
    "man city": 3.10,
    "city": 3.10,
    "draw": 3.20
  };

  // Try specific match first
  for (const [key, odds] of Object.entries(specificOddsMap)) {
    const [selKey, outKey] = key.split('_');
    if (lowerSelection.includes(selKey) && lowerOutcome.includes(outKey)) {
      return odds;
    }
  }

  // Try general selection-based match
  for (const [key, odds] of Object.entries(generalOddsMap)) {
    if (lowerSelection.includes(key)) {
      return odds;
    }
  }

  return 2.0;
}