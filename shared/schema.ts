import { pgTable, text, serial, decimal, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  selection: text("selection").notNull(),
  match: text("match").notNull(),
  stake: decimal("stake", { precision: 10, scale: 2 }).notNull(),
  odds: decimal("odds", { precision: 10, scale: 2 }).notNull(),
  potentialWin: decimal("potential_win", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, placed, won, lost
  createdAt: timestamp("created_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  player1: text("player1").notNull(),
  player2: text("player2").notNull(),
  player1Odds: decimal("player1_odds", { precision: 10, scale: 2 }).notNull(),
  player2Odds: decimal("player2_odds", { precision: 10, scale: 2 }).notNull(),
  matchTime: text("match_time").notNull(),
  sport: text("sport").notNull(),
  isLive: boolean("is_live").default(false),
});

export const betOptions = pgTable("bet_options", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id).notNull(),
  description: text("description").notNull(),
  odds: decimal("odds", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // winner, score, handicap, etc.
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
});

export const insertBetOptionSchema = createInsertSchema(betOptions).omit({
  id: true,
});

export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertBetOption = z.infer<typeof insertBetOptionSchema>;
export type BetOption = typeof betOptions.$inferSelect;
