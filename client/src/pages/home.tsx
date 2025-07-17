import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Volleyball, UserPlus, Settings, Users, UsersRound, RotateCcw, Save, AlertTriangle, History, Shield, Trash2 } from "lucide-react";

interface Player {
  id: number;
  name: string;
  position: 'levantador' | 'libero' | 'jogador';
}

interface Team {
  name: string;
  colors: {
    bg: string;
    border: string;
    text: string;
    badge: string;
  };
  levantador: Player;
  libero: Player;
  jogadores: Player[];
}

interface GameSession {
  id: number;
  gameType: string;
  numberOfTeams: number;
  teams: Team[];
  createdAt: string;
}

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [playerPosition, setPlayerPosition] = useState("");
  const [gameType, setGameType] = useState("sexteto");
  const [numberOfTeams, setNumberOfTeams] = useState("2");
  const [sortedTeams, setSortedTeams] = useState<Team[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch players
  const { data: players = [], isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  // Fetch game sessions
  const { data: gameSessions = [], isLoading: sessionsLoading } = useQuery<GameSession[]>({
    queryKey: ["/api/game-sessions"],
  });

  // Add player mutation
  const addPlayerMutation = useMutation({
    mutationFn: async (playerData: { name: string; position: string }) => {
      const response = await apiRequest("POST", "/api/players", playerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      setPlayerName("");
      setPlayerPosition("");
      toast({
        title: "Jogador adicionado",
        description: "Jogador foi adicionado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao adicionar jogador",
        variant: "destructive",
      });
    },
  });

  // Delete player mutation
  const deletePlayerMutation = useMutation({
    mutationFn: async (playerId: number) => {
      await apiRequest("DELETE", `/api/players/${playerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Jogador removido",
        description: "Jogador foi removido com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover jogador",
        variant: "destructive",
      });
    },
  });

  // Sort teams mutation
  const sortTeamsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sort-teams", {
        gameType,
        numberOfTeams: parseInt(numberOfTeams),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSortedTeams(data.teams);
      toast({
        title: "Times sorteados",
        description: "Times foram organizados com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no sorteio",
        description: error.message || "Falha ao sortear times",
        variant: "destructive",
      });
    },
  });

  // Save game session mutation
  const saveSessionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/game-sessions", {
        gameType,
        numberOfTeams: parseInt(numberOfTeams),
        teams: sortedTeams,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game-sessions"] });
      toast({
        title: "Sessão salva",
        description: "Configuração dos times foi salva no histórico!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar sessão",
        variant: "destructive",
      });
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      await apiRequest("DELETE", `/api/game-sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game-sessions"] });
      toast({
        title: "Sessão removida",
        description: "Sessão foi removida do histórico!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover sessão",
        variant: "destructive",
      });
    },
  });

  const handleAddPlayer = () => {
    if (!playerName.trim() || !playerPosition) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e selecione a posição",
        variant: "destructive",
      });
      return;
    }

    addPlayerMutation.mutate({
      name: playerName.trim(),
      position: playerPosition,
    });
  };

  const handleRemovePlayer = (playerId: number) => {
    deletePlayerMutation.mutate(playerId);
  };

  const handleSortTeams = () => {
    sortTeamsMutation.mutate();
  };

  const handleSaveTeams = () => {
    if (sortedTeams.length === 0) {
      toast({
        title: "Nenhum time sorteado",
        description: "Sortear os times antes de salvar",
        variant: "destructive",
      });
      return;
    }
    saveSessionMutation.mutate();
  };

  // Filter players by position
  const levantadores = players.filter(p => p.position === 'levantador');
  const liberos = players.filter(p => p.position === 'libero');
  const jogadores = players.filter(p => p.position === 'jogador');

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'levantador': return 'bg-blue-500';
      case 'libero': return 'bg-green-500';
      case 'jogador': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getPositionBgColor = (position: string) => {
    switch (position) {
      case 'levantador': return 'bg-blue-50 border-l-4 border-blue-500';
      case 'libero': return 'bg-green-50 border-l-4 border-green-500';
      case 'jogador': return 'bg-orange-50 border-l-4 border-orange-500';
      default: return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-net-white">
      {/* Header */}
      <header className="bg-volleyball-orange text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-3">
            <Volleyball className="h-8 w-8" />
            <h1 className="text-2xl md:text-3xl font-bold">Sorteador de Times</h1>
          </div>
          <p className="text-center text-orange-100 mt-2">Organize seus jogos de vôlei facilmente</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Player Registration */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <UserPlus className="text-volleyball-orange mr-3" />
              Adicionar Jogadores
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="playerName">Nome do Jogador</Label>
                <Input
                  id="playerName"
                  type="text"
                  placeholder="Digite o nome..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="playerPosition">Posição</Label>
                <Select value={playerPosition} onValueChange={setPlayerPosition}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione a posição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="levantador">Levantador</SelectItem>
                    <SelectItem value="libero">Líbero</SelectItem>
                    <SelectItem value="jogador">Jogador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleAddPlayer}
                  disabled={addPlayerMutation.isPending}
                  className="w-full bg-volleyball-orange hover:bg-orange-600"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Configuration */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Settings className="text-court-blue mr-3" />
              Configuração do Jogo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3">Tipo de Jogo</Label>
                <RadioGroup value={gameType} onValueChange={setGameType} className="mt-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quarteto" id="quarteto" />
                    <Label htmlFor="quarteto">Quarteto (4 jogadores por time)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sexteto" id="sexteto" />
                    <Label htmlFor="sexteto">Sexteto (6 jogadores por time)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="numberOfTeams">Número de Times</Label>
                <Select value={numberOfTeams} onValueChange={setNumberOfTeams}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Times</SelectItem>
                    <SelectItem value="3">3 Times</SelectItem>
                    <SelectItem value="4">4 Times</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Users className="text-court-blue mr-3" />
                Jogadores Cadastrados
                <span className="ml-2 bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                  {players.length}
                </span>
              </h2>
              
              <Button 
                onClick={handleSortTeams}
                disabled={sortTeamsMutation.isPending || players.length === 0}
                className="bg-green-500 hover:bg-green-600"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Sortear Times
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Levantadores */}
              <div>
                <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                  Levantadores <span className="ml-2 text-sm text-gray-500">({levantadores.length})</span>
                </h3>
                <div className="space-y-2">
                  {levantadores.map((player) => (
                    <div key={player.id} className={`flex items-center justify-between p-3 rounded-lg ${getPositionBgColor('levantador')}`}>
                      <span className="font-medium text-gray-800">{player.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePlayer(player.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Líberos */}
              <div>
                <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  Líberos <span className="ml-2 text-sm text-gray-500">({liberos.length})</span>
                </h3>
                <div className="space-y-2">
                  {liberos.map((player) => (
                    <div key={player.id} className={`flex items-center justify-between p-3 rounded-lg ${getPositionBgColor('libero')}`}>
                      <span className="font-medium text-gray-800">{player.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePlayer(player.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Jogadores */}
              <div>
                <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                  <div className="w-4 h-4 bg-volleyball-orange rounded-full mr-2"></div>
                  Jogadores <span className="ml-2 text-sm text-gray-500">({jogadores.length})</span>
                </h3>
                <div className="space-y-2">
                  {jogadores.map((player) => (
                    <div key={player.id} className={`flex items-center justify-between p-3 rounded-lg ${getPositionBgColor('jogador')}`}>
                      <span className="font-medium text-gray-800">{player.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePlayer(player.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teams Display */}
        {sortedTeams.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <UsersRound className="text-green-600 mr-3" />
                  Times Sorteados
                </h2>
                
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleSortTeams}
                    disabled={sortTeamsMutation.isPending}
                    variant="outline"
                    className="bg-amber-500 text-white hover:bg-amber-600 border-amber-500"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Novo Sorteio
                  </Button>
                  
                  <Button 
                    onClick={handleSaveTeams}
                    disabled={saveSessionMutation.isPending}
                    className="bg-court-blue hover:bg-blue-700"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedTeams.map((team, index) => (
                  <div key={index} className={`bg-gradient-to-br ${team.colors.bg} rounded-xl p-6 border-2 ${team.colors.border}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-bold ${team.colors.text} flex items-center`}>
                        <Shield className="mr-2" />
                        {team.name}
                      </h3>
                      <span className={`${team.colors.badge} px-3 py-1 rounded-full text-sm font-medium`}>
                        {2 + team.jogadores.length} jogadores
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Levantador */}
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Levantador</span>
                          <p className="font-medium text-gray-800">{team.levantador.name}</p>
                        </div>
                      </div>
                      
                      {/* Líbero */}
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Líbero</span>
                          <p className="font-medium text-gray-800">{team.libero.name}</p>
                        </div>
                      </div>
                      
                      {/* Jogadores */}
                      <div className="space-y-2">
                        {team.jogadores.map((player, playerIndex) => (
                          <div key={playerIndex} className="flex items-center space-x-3 p-2 bg-white rounded-lg">
                            <div className={`w-3 h-3 ${getPositionColor(player.position)} rounded-full`}></div>
                            <span className="font-medium text-gray-700">{player.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validation Message */}
        {players.length > 0 && (
          <Card className="bg-amber-50 border-l-4 border-amber-400 mb-8">
            <CardContent className="p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    <strong>Atenção:</strong> Certifique-se de ter pelo menos 1 levantador e 1 líbero para cada time que deseja formar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team History */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <History className="text-purple-600 mr-3" />
              Histórico de Sorteios
            </h2>
            
            <div className="space-y-4">
              {sessionsLoading ? (
                <p className="text-gray-500">Carregando histórico...</p>
              ) : gameSessions.length === 0 ? (
                <p className="text-gray-500">Nenhum sorteio salvo ainda.</p>
              ) : (
                gameSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">
                        Sorteio - {new Date(session.createdAt).toLocaleString('pt-BR')}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSessionMutation.mutate(session.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center space-x-4">
                      <span>{session.gameType === 'quarteto' ? 'Quarteto' : 'Sexteto'}</span>
                      <span>{session.numberOfTeams} times</span>
                      <span>{session.teams.reduce((total, team) => total + 2 + team.jogadores.length, 0)} jogadores</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
