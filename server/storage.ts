import { players, gameSessions, type Player, type InsertPlayer, type GameSession, type InsertGameSession } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Player operations
  getAllPlayers(): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  deletePlayer(id: number): Promise<void>;
  
  // Game session operations
  getAllGameSessions(): Promise<GameSession[]>;
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  deleteGameSession(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAllPlayers(): Promise<Player[]> {
    const result = await db.select().from(players);
    return result;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values(insertPlayer)
      .returning();
    return player;
  }

  async deletePlayer(id: number): Promise<void> {
    await db.delete(players).where(eq(players.id, id));
  }

  async getAllGameSessions(): Promise<GameSession[]> {
    const result = await db
      .select()
      .from(gameSessions)
      .orderBy(desc(gameSessions.createdAt));
    return result;
  }

  async createGameSession(insertSession: InsertGameSession): Promise<GameSession> {
    const [session] = await db
      .insert(gameSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async deleteGameSession(id: number): Promise<void> {
    await db.delete(gameSessions).where(eq(gameSessions.id, id));
  }
}

export class MemStorage implements IStorage {
  private players: Map<number, Player>;
  private gameSessions: Map<number, GameSession>;
  private currentPlayerId: number;
  private currentSessionId: number;

  constructor() {
    this.players = new Map();
    this.gameSessions = new Map();
    this.currentPlayerId = 1;
    this.currentSessionId = 1;
  }

  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    const player: Player = { ...insertPlayer, id };
    this.players.set(id, player);
    return player;
  }

  async deletePlayer(id: number): Promise<void> {
    this.players.delete(id);
  }

  async getAllGameSessions(): Promise<GameSession[]> {
    return Array.from(this.gameSessions.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createGameSession(insertSession: InsertGameSession): Promise<GameSession> {
    const id = this.currentSessionId++;
    const session: GameSession = { 
      ...insertSession, 
      id, 
      createdAt: new Date() 
    };
    this.gameSessions.set(id, session);
    return session;
  }

  async deleteGameSession(id: number): Promise<void> {
    this.gameSessions.delete(id);
  }
}

// Use DatabaseStorage for production, MemStorage for fallback
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
