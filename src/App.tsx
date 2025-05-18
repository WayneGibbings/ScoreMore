import { useEffect, useState } from 'react';
import { Team } from './components/Team';
import { GameControls } from './components/GameControls';
import { ScoreBoard } from './components/ScoreBoard';
import { GameHistory } from './components/GameHistory';
import { ScoringLog } from './components/ScoringLog';
import { Mail } from 'lucide-react'; // Import Mail icon for feedback button
import {
  loadCurrentGameState,
  saveCurrentGameState,
  loadGameHistory,
  saveCompletedGame,
  addLogEntryToDb,
  loadScoringLogForCurrentGame,
  associateScoreLogToGameHistory,
  clearUnassociatedScoreLog,
  deleteGameFromHistory,
  updateCompletedGame,
  type CurrentGameState // Import the interface
} from './db';

export type Player = {
  id: string;
  name: string;
  score: number;
};
export type TeamData = {
  id: string;
  name: string;
  color: string; // New property for team color
  players: Player[];
  totalScore: number;
};
export type GameResult = {
  id: string;
  date: string;
  teams: TeamData[];
  winner: string;
};
export type LogEntry = {
  id: string;
  timestamp: string;
  teamName: string;
  playerName: string;
  points: number;
  type: 'score' | 'halftime';
};

// Helper function to format dates as YYYY-MM-DD
const formatDateYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format dates and times as YYYY-MM-DD HH:MM:SS
const formatDateTimeYYYYMMDDHHMMSS = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export function App() {
  const [teams, setTeams] = useState<TeamData[]>([{
    id: '1',
    name: 'Honeyeaters',
    color: 'blue',
    players: [],
    totalScore: 0
  }, {
    id: '2',
    name: 'Team B',
    color: 'red',
    players: [],
    totalScore: 0
  }]);
  const [gameActive, setGameActive] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [isHalftime, setIsHalftime] = useState(false);
  const [scoringLog, setScoringLog] = useState<LogEntry[]>([]);
  const [currentHalf, setCurrentHalf] = useState(1); // Renamed from currentInning
  const [gameStatus, setGameStatus] = useState('initial'); // Added for db state
  const [isLoading, setIsLoading] = useState(true); // To prevent rendering until DB is loaded

  // Load initial state from DB
  useEffect(() => {
    async function loadState() {
      const savedGameState = await loadCurrentGameState();
      if (savedGameState) {
        setTeams(savedGameState.teams);
        setGameActive(savedGameState.gameActive);
        setIsHalftime(savedGameState.isHalftime);
        setCurrentHalf(savedGameState.currentHalf || 1); // Renamed from currentInning
        setGameStatus(savedGameState.gameStatus || 'initial');
      } else {
        // If no saved game state, ensure default teams are part of what we might save initially.
        // This helps if saveCurrentGameState is called before any user interaction.
        const initialGameState: CurrentGameState = {
          teams: teams, // Use initial teams from useState
          gameActive: false,
          isHalftime: false,
          currentHalf: 1, // Renamed from currentInning
          gameStatus: 'initial',
        };
        await saveCurrentGameState(initialGameState);
      }

      const history = await loadGameHistory();
      setGameHistory(history);

      const currentLog = await loadScoringLogForCurrentGame();
      setScoringLog(currentLog);
      setIsLoading(false);
    }
    loadState();
  }, []); // Empty dependency array means this runs once on mount

  // Save game state to DB whenever it changes
  useEffect(() => {
    if (isLoading) return; // Don't save while initially loading

    const gameState: CurrentGameState = {
      teams,
      gameActive,
      isHalftime,
      currentHalf, // Renamed from currentInning
      gameStatus
    };
    saveCurrentGameState(gameState);
  }, [teams, gameActive, isHalftime, currentHalf, gameStatus, isLoading]); // Renamed from currentInning

  // Update team total score whenever player scores change
  useEffect(() => {
    const updatedTeams = teams.map(team => {
      const totalScore = team.players.reduce((sum, player) => sum + player.score, 0);
      return {
        ...team,
        totalScore
      };
    });
    setTeams(updatedTeams);
  }, [teams.map(team => team.players.map(player => player.score).join(',')).join(',')]);

  const startGame = async () => {
    // Reset scores but keep players
    const resetTeams = teams.map(team => ({
      ...team,
      players: team.players.map(player => ({
        ...player,
        score: 0
      })),
      totalScore: 0
    }));
    setTeams(resetTeams);
    setGameActive(true);
    setIsHalftime(false);
    setCurrentHalf(1); // Renamed from setCurrentInning
    setGameStatus('in_progress');
    await clearUnassociatedScoreLog(); // Clear logs from any previous unfinished game
    setScoringLog([]); // Clear UI log
  };

  const endGame = async () => {
    const winner = teams[0].totalScore > teams[1].totalScore ? teams[0].name : teams[0].totalScore < teams[1].totalScore ? teams[1].name : 'Tie';
    const gameResult: GameResult = {
      id: Date.now().toString(),
      date: formatDateYYYYMMDD(new Date()), // Changed to YYYY-MM-DD
      teams: JSON.parse(JSON.stringify(teams)), // Deep copy
      winner
    };
    await saveCompletedGame(gameResult);
    const logIdsToAssociate = scoringLog.map(log => log.id);
    if (logIdsToAssociate.length > 0) {
      await associateScoreLogToGameHistory(logIdsToAssociate, gameResult.id);
    }
    setGameHistory([gameResult, ...gameHistory]);
    setGameActive(false);
    setGameStatus('final');
    // scoringLog for the completed game is now associated, new game will start fresh or load unassociated logs
  };

  const addPlayer = (teamId: string, playerName: string) => {
    if (!playerName.trim()) return;
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          players: [...team.players, {
            id: Date.now().toString(),
            name: playerName,
            score: 0
          }]
        };
      }
      return team;
    }));
  };

  const updatePlayerScore = async (teamId: string, playerId: string, points: number) => {
    if (isHalftime) {
      console.log("Cannot update score during halftime.");
      return;
    }
    const team = teams.find(t => t.id === teamId);
    const player = team?.players.find(p => p.id === playerId);
    if (team && player) {
      const logEntry: LogEntry = {
        id: Date.now().toString(),
        timestamp: formatDateTimeYYYYMMDDHHMMSS(new Date()), // Changed to include time
        teamName: team.name,
        playerName: player.name,
        points,
        type: 'score'
      };
      await addLogEntryToDb(logEntry);
      setScoringLog(prevLog => [logEntry, ...prevLog]);
    }
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          players: team.players.map(player => {
            if (player.id === playerId) {
              return {
                ...player,
                score: Math.max(0, player.score + points)
              };
            }
            return player;
          })
        };
      }
      return team;
    }));
  };

  const removePlayer = (teamId: string, playerId: string) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          players: team.players.filter(player => player.id !== playerId)
        };
      }
      return team;
    }));
  };

  const updateTeamName = (teamId: string, newName: string, newColor: string) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          name: newName || team.name,
          color: newColor || team.color
        };
      }
      return team;
    }));
  };

  const toggleHalftime = async () => {
    const newHalftimeState = !isHalftime;
    setIsHalftime(newHalftimeState);
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: formatDateTimeYYYYMMDDHHMMSS(new Date()), // Changed to include time
      teamName: '',
      playerName: '',
      points: 0,
      type: 'halftime'
    };
    await addLogEntryToDb(logEntry);
    setScoringLog(prevLog => [logEntry, ...prevLog]);
    setGameStatus(newHalftimeState ? 'halftime' : 'in_progress');
  };

  const handleDeleteGame = async (gameId: string) => {
    const success = await deleteGameFromHistory(gameId);
    if (success) {
      // Update the game history state by removing the deleted game
      setGameHistory(prev => prev.filter(game => game.id !== gameId));
    } else {
      console.error("Failed to delete game with ID:", gameId);
      // Could add a toast notification here for error feedback
    }
  };
  
  const handleEditGame = async (gameId: string, updatedTeamInfo: { id: string, name: string, color: string }[]) => {
    // Find the game to update
    const gameToUpdate = gameHistory.find(game => game.id === gameId);
    if (!gameToUpdate) {
      console.error("Game not found for editing:", gameId);
      return;
    }
    
    // Create a deep copy of the game
    const updatedGame: GameResult = JSON.parse(JSON.stringify(gameToUpdate));
    
    // Update team names and colors
    updatedGame.teams = updatedGame.teams.map(team => {
      const update = updatedTeamInfo.find(info => info.id === team.id);
      if (update) {
        // Update the name and color if provided in the updates
        return {
          ...team,
          name: update.name,
          color: update.color
        };
      }
      return team;
    });
    
    // Recalculate the winner
    if (updatedGame.winner !== 'Tie') {
      // Find which team was the winner by comparing totals
      const winnerTeam = updatedGame.teams.find(team => team.totalScore > 
        updatedGame.teams.find(t => t.id !== team.id)?.totalScore || 0);
        
      if (winnerTeam) {
        updatedGame.winner = winnerTeam.name;
      }
    }
    
    // Save to database
    const success = await updateCompletedGame(gameId, updatedGame);
    
    if (success) {
      // Update the state with the edited game
      setGameHistory(prev => prev.map(game => 
        game.id === gameId ? updatedGame : game
      ));
    } else {
      console.error("Failed to update game with ID:", gameId);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-center"><h1 className="text-3xl font-bold">Loading...</h1></div>;
  }

  return <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">
          {gameActive ? (isHalftime ? 'Halftime' : currentHalf === 1 ? 'First Half' : 'Second Half') : 'Scoreboard'}
        </h1>
        <ScoreBoard teams={teams} isHalftime={isHalftime} />
        <GameControls gameActive={gameActive} startGame={startGame} endGame={endGame} isHalftime={isHalftime} onHalftime={toggleHalftime} disableStart={teams.some(team => team.players.length === 0)} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {teams.map(team => <Team key={team.id} team={team} gameActive={gameActive} onAddPlayer={name => addPlayer(team.id, name)} onUpdateScore={(playerId, points) => updatePlayerScore(team.id, playerId, points)} onRemovePlayer={playerId => removePlayer(team.id, playerId)} onUpdateTeamName={(name, color) => updateTeamName(team.id, name, color)} />)}
          <ScoringLog entries={scoringLog} />
        </div>
        {gameHistory.length > 0 && <GameHistory history={gameHistory} onDeleteGame={handleDeleteGame} onEditGame={handleEditGame} />}
      </div>
      <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <p>ScoreMore v0.0.1</p>
            <p>Build: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
          </div>
          <a 
            href="mailto:wayne+scoremore@gibbings.net?subject=ScoreMore%20Feedback" 
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Send feedback"
          >
            <Mail className="w-4 h-4 mr-1" />
            Send Feedback
          </a>
        </div>
        <p className="mt-2">© 2025 Wayne Gibbings. All rights reserved.</p>
      </footer>
    </div>;
}