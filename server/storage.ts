import { bets, matches, betOptions, type Bet, type Match, type BetOption, type InsertBet, type InsertMatch, type InsertBetOption } from "@shared/schema";

export interface IStorage {
  // Bets
  createBet(bet: InsertBet): Promise<Bet>;
  getBets(): Promise<Bet[]>;
  getBetById(id: number): Promise<Bet | undefined>;
  updateBetStatus(id: number, status: string): Promise<Bet | undefined>;
  deleteBet(id: number): Promise<boolean>;
  
  // Matches
  getMatches(): Promise<Match[]>;
  getMatchById(id: number): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  
  // Bet Options
  getBetOptionsByMatchId(matchId: number): Promise<BetOption[]>;
  createBetOption(betOption: InsertBetOption): Promise<BetOption>;
}

export class MemStorage implements IStorage {
  private bets: Map<number, Bet> = new Map();
  private matches: Map<number, Match> = new Map();
  private betOptions: Map<number, BetOption> = new Map();
  private currentBetId = 1;
  private currentMatchId = 1;
  private currentBetOptionId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed matches
    const match1: Match = {
      id: this.currentMatchId++,
      title: "Wimbledon Final",
      player1: "Novak Djokovic",
      player2: "Rafael Nadal",
      player1Odds: "1.75",
      player2Odds: "2.10",
      matchTime: "Today 14:00",
      sport: "Tennis",
      isLive: true,
    };
    
    const match2: Match = {
      id: this.currentMatchId++,
      title: "Arsenal vs Manchester City",
      player1: "Arsenal",
      player2: "Manchester City",
      player1Odds: "2.40",
      player2Odds: "3.10",
      matchTime: "Tomorrow 17:30",
      sport: "Football",
      isLive: false,
    };

    this.matches.set(match1.id, match1);
    this.matches.set(match2.id, match2);

    // Seed bet options for tennis match
    const tennisOptions: BetOption[] = [
      { id: this.currentBetOptionId++, matchId: match1.id, description: "Djokovic 3-0", odds: "3.50", category: "set_score" },
      { id: this.currentBetOptionId++, matchId: match1.id, description: "Djokovic 3-1", odds: "4.20", category: "set_score" },
      { id: this.currentBetOptionId++, matchId: match1.id, description: "Nadal 3-1", odds: "5.80", category: "set_score" },
      { id: this.currentBetOptionId++, matchId: match1.id, description: "Nadal 3-0", odds: "6.50", category: "set_score" },
    ];

    tennisOptions.forEach(option => {
      this.betOptions.set(option.id, option);
    });

    // Seed football options
    const footballOptions: BetOption[] = [
      { id: this.currentBetOptionId++, matchId: match2.id, description: "Arsenal Win", odds: "2.40", category: "winner" },
      { id: this.currentBetOptionId++, matchId: match2.id, description: "Draw", odds: "3.20", category: "winner" },
      { id: this.currentBetOptionId++, matchId: match2.id, description: "Manchester City Win", odds: "3.10", category: "winner" },
    ];

    footballOptions.forEach(option => {
      this.betOptions.set(option.id, option);
    });
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const bet: Bet = {
      ...insertBet,
      id: this.currentBetId++,
      createdAt: new Date(),
      status: insertBet.status || "pending",
    };
    this.bets.set(bet.id, bet);
    return bet;
  }

  async getBets(): Promise<Bet[]> {
    return Array.from(this.bets.values());
  }

  async getBetById(id: number): Promise<Bet | undefined> {
    return this.bets.get(id);
  }

  async updateBetStatus(id: number, status: string): Promise<Bet | undefined> {
    const bet = this.bets.get(id);
    if (bet) {
      bet.status = status;
      this.bets.set(id, bet);
    }
    return bet;
  }

  async deleteBet(id: number): Promise<boolean> {
    return this.bets.delete(id);
  }

  async getMatches(): Promise<Match[]> {
    return Array.from(this.matches.values());
  }

  async getMatchById(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const match: Match = {
      ...insertMatch,
      id: this.currentMatchId++,
      isLive: insertMatch.isLive || false,
    };
    this.matches.set(match.id, match);
    return match;
  }

  async getBetOptionsByMatchId(matchId: number): Promise<BetOption[]> {
    return Array.from(this.betOptions.values()).filter(option => option.matchId === matchId);
  }

  async createBetOption(insertBetOption: InsertBetOption): Promise<BetOption> {
    const betOption: BetOption = {
      ...insertBetOption,
      id: this.currentBetOptionId++,
    };
    this.betOptions.set(betOption.id, betOption);
    return betOption;
  }
}

export const storage = new MemStorage();
