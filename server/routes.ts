import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertGameSessionSchema, positionSchema } from "@shared/schema";
import { z } from "zod";

// Team sorting utility
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function sortTeams(players: any[], gameType: string, numberOfTeams: number) {
  const levantadores = players.filter(p => p.position === 'levantador');
  const liberos = players.filter(p => p.position === 'libero');
  const jogadores = players.filter(p => p.position === 'jogador');

  // Validation
  if (levantadores.length < numberOfTeams) {
    throw new Error(`Não há levantadores suficientes. Necessário: ${numberOfTeams}, Disponível: ${levantadores.length}`);
  }
  
  if (liberos.length < numberOfTeams) {
    throw new Error(`Não há líberos suficientes. Necessário: ${numberOfTeams}, Disponível: ${liberos.length}`);
  }

  const playersPerTeam = gameType === 'quarteto' ? 4 : 6;
  const totalPlayersNeeded = numberOfTeams * playersPerTeam;
  
  if (players.length < totalPlayersNeeded) {
    throw new Error(`Não há jogadores suficientes. Necessário: ${totalPlayersNeeded}, Disponível: ${players.length}`);
  }

  // Shuffle positions
  const shuffledLevantadores = shuffleArray(levantadores);
  const shuffledLiberos = shuffleArray(liberos);
  const shuffledJogadores = shuffleArray(jogadores);

  const teams = [];
  const teamNames = ['A', 'B', 'C', 'D'];
  const teamColors = [
    { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-200 text-blue-800' },
    { bg: 'from-red-50 to-red-100', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-200 text-red-800' },
    { bg: 'from-green-50 to-green-100', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-200 text-green-800' },
    { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-200 text-purple-800' }
  ];

  for (let i = 0; i < numberOfTeams; i++) {
    const team = {
      name: `Time ${teamNames[i]}`,
      colors: teamColors[i],
      levantador: shuffledLevantadores[i],
      libero: shuffledLiberos[i],
      jogadores: []
    };
    teams.push(team);
  }

  // Distribute remaining players
  const remainingJogadores = shuffledJogadores.slice();
  const remainingLevantadores = shuffledLevantadores.slice(numberOfTeams);
  const remainingLiberos = shuffledLiberos.slice(numberOfTeams);
  
  const allRemainingPlayers = [...remainingJogadores, ...remainingLevantadores, ...remainingLiberos];
  const shuffledRemainingPlayers = shuffleArray(allRemainingPlayers);

  const playersToDistribute = playersPerTeam - 2; // minus levantador and libero
  
  for (let i = 0; i < numberOfTeams; i++) {
    const startIndex = i * playersToDistribute;
    const endIndex = startIndex + playersToDistribute;
    teams[i].jogadores = shuffledRemainingPlayers.slice(startIndex, endIndex);
  }

  return teams;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all players
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  // Create player
  app.post("/api/players", async (req, res) => {
    try {
      const data = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(data);
      res.json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid player data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create player" });
      }
    }
  });

  // Delete player
  app.delete("/api/players/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePlayer(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete player" });
    }
  });

  // Sort teams
  app.post("/api/sort-teams", async (req, res) => {
    try {
      const { gameType, numberOfTeams } = req.body;
      
      if (!['quarteto', 'sexteto'].includes(gameType)) {
        return res.status(400).json({ error: "Invalid game type" });
      }
      
      if (![2, 3, 4].includes(numberOfTeams)) {
        return res.status(400).json({ error: "Invalid number of teams" });
      }

      const players = await storage.getAllPlayers();
      const teams = sortTeams(players, gameType, numberOfTeams);
      
      res.json({ teams });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get game sessions (history)
  app.get("/api/game-sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllGameSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch game sessions" });
    }
  });

  // Save game session
  app.post("/api/game-sessions", async (req, res) => {
    try {
      const data = insertGameSessionSchema.parse(req.body);
      const session = await storage.createGameSession(data);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid session data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to save game session" });
      }
    }
  });

  // Delete game session
  app.delete("/api/game-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGameSession(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete game session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
