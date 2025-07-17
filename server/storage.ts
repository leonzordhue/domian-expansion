import { players, gameSessions, type Player, type InsertPlayer, type GameSession, type InsertGameSession } from "@shared/schema";

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

export const storage = new MemStorage();
