export interface ParsedBetCommand {
  type: 'bet' | 'show_odds' | 'cancel_bet' | 'unknown';
  stake?: number;
  selection?: string;
  match?: string;
  odds?: number;
  confidence?: number;
}

export function parseVoiceCommand(command: string): ParsedBetCommand {
  const lowercaseCommand = command.toLowerCase().trim();
  
  // Bet patterns
  const betPatterns = [
    // "bet X on Y to win Z"
    /bet\s+(?:£|pounds?|dollars?|)\s*(\d+(?:\.\d+)?)\s+on\s+(.+?)\s+to\s+win\s+(.+?)(?:\s+at\s+odds\s+(\d+(?:\.\d+)?))?$/i,
    // "bet X on Y"
    /bet\s+(?:£|pounds?|dollars?|)\s*(\d+(?:\.\d+)?)\s+on\s+(.+?)$/i,
    // "place X on Y"
    /place\s+(?:£|pounds?|dollars?|)\s*(\d+(?:\.\d+)?)\s+on\s+(.+?)$/i,
  ];

  for (const pattern of betPatterns) {
    const match = lowercaseCommand.match(pattern);
    if (match) {
      const stake = parseFloat(match[1]);
      const selection = match[2];
      const outcome = match[3] || "";
      const odds = match[4] ? parseFloat(match[4]) : inferOdds(selection);
      
      return {
        type: "bet",
        stake,
        selection: outcome ? `${selection} ${outcome}` : selection,
        match: inferMatch(selection),
        odds,
        confidence: 0.8,
      };
    }
  }

  // Show odds patterns
  const oddsPatterns = [
    /show.*odds/i,
    /what.*odds/i,
    /current.*odds/i,
    /display.*odds/i,
  ];

  for (const pattern of oddsPatterns) {
    if (lowercaseCommand.match(pattern)) {
      return {
        type: "show_odds",
        confidence: 0.9,
      };
    }
  }

  // Cancel bet patterns
  const cancelPatterns = [
    /cancel.*bet/i,
    /remove.*bet/i,
    /delete.*bet/i,
  ];

  for (const pattern of cancelPatterns) {
    if (lowercaseCommand.match(pattern)) {
      return {
        type: "cancel_bet",
        confidence: 0.9,
      };
    }
  }

  return {
    type: "unknown",
    confidence: 0.1,
  };
}

function inferMatch(selection: string): string {
  const lowerSelection = selection.toLowerCase();
  
  // Tennis players
  if (lowerSelection.includes("djokovic") || lowerSelection.includes("nadal")) {
    return "Wimbledon Final";
  }
  
  // Football teams
  if (lowerSelection.includes("arsenal") || lowerSelection.includes("manchester") || lowerSelection.includes("city")) {
    return "Arsenal vs Manchester City";
  }

  // Generic patterns
  if (lowerSelection.includes("tennis") || lowerSelection.includes("3-0") || lowerSelection.includes("3-1")) {
    return "Tennis Match";
  }

  if (lowerSelection.includes("football") || lowerSelection.includes("soccer")) {
    return "Football Match";
  }
  
  return "Unknown Match";
}

function inferOdds(selection: string): number {
  const lowerSelection = selection.toLowerCase();
  
  // Common odds mapping
  const oddsMap: { [key: string]: number } = {
    "djokovic": 1.75,
    "nadal": 2.10,
    "arsenal": 2.40,
    "manchester city": 3.10,
    "man city": 3.10,
    "draw": 3.20,
    "3-0": 3.50,
    "3-1": 4.20,
  };

  for (const [key, odds] of Object.entries(oddsMap)) {
    if (lowerSelection.includes(key)) {
      return odds;
    }
  }

  // Default odds
  return 2.0;
}

export function generateConfirmationMessage(command: ParsedBetCommand): string {
  switch (command.type) {
    case "bet":
      return `Bet placed: £${command.stake} on ${command.selection} at odds ${command.odds}. Potential win: £${((command.stake || 0) * (command.odds || 0)).toFixed(2)}`;
    case "show_odds":
      return "Displaying current odds for all matches";
    case "cancel_bet":
      return "Last bet has been cancelled";
    default:
      return "Sorry, I didn't understand that command. Try saying something like 'Bet 10 pounds on Djokovic to win'";
  }
}
