import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(), // 'levantador', 'libero', 'jogador'
});

export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  gameType: text("game_type").notNull(), // 'quarteto' or 'sexteto'
  numberOfTeams: integer("number_of_teams").notNull(),
  teams: jsonb("teams").notNull(), // Array of team objects
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  position: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).pick({
  gameType: true,
  numberOfTeams: true,
  teams: true,
});

export const positionSchema = z.enum(['levantador', 'libero', 'jogador']);

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSessions.$inferSelect;
export type Position = z.infer<typeof positionSchema>;
