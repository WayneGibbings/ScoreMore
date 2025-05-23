import { useEffect, useState } from 'react';
import { Team } from './components/Team';
import { GameControls } from './components/GameControls';
import { ScoreBoard } from './components/ScoreBoard';
import { GameHistory } from './components/GameHistory';
import { ScoringLog } from './components/ScoringLog';
import { InfoPage } from './components/InfoPage';
import { AboutPage, PrivacyPolicy } from './components/legal';
import { StorageConsentBanner } from './components/StorageConsentBanner';
import { Mail, Info } from 'lucide-react'; // Import only icons we're using
import { formatDateYYYYMMDD, formatDateTimeYYYYMMDDHHMMSS } from './utils/dateFormat';
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
  type CurrentGameState, // Import the interface
} from './db';

export type Player = {
  id: string;
  name: string;
  score: number;
  active: boolean; // New property to track if player is active
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
  content?: string; // For notes content
  type: 'score' | 'halftime' | 'note';
};

// Helper functions for date formatting are moved to utils/dateFormat.ts

export function App() {
  const [teams, setTeams] = useState<TeamData[]>([
    {
      id: '1',
      name: 'Team A',
      color: 'blue',
      players: [],
      totalScore: 0,
    },
    {
      id: '2',
      name: 'Team B',
      color: 'red',
      players: [],
      totalScore: 0,
    },
  ]);
  const [gameActive, setGameActive] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [isHalftime, setIsHalftime] = useState(false);
  const [scoringLog, setScoringLog] = useState<LogEntry[]>([]);
  const [currentHalf, setCurrentHalf] = useState(1); // Renamed from currentInning
  const [gameStatus, setGameStatus] = useState('initial'); // Added for db state
  const [isLoading, setIsLoading] = useState(true); // To prevent rendering until DB is loaded
  const [isInfoPageOpen, setIsInfoPageOpen] = useState(false); // State for info page modal

  // States for legal pages
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isAboutPageOpen, setIsAboutPageOpen] = useState(false);

  // Removed unused variable appVersionFromEnv
  const buildNumberFromEnv = import.meta.env.VITE_BUILD_NUMBER;
  const buildDisplayInfo = buildNumberFromEnv
    ? `${buildNumberFromEnv}`
    : `Dev Build: ${new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

  // Handle storage consent
  const handleStorageConsent = () => {
    // Just store the consent in localStorage without updating state
    // since we don't actually use the state value in the UI
    localStorage.setItem('storageConsent', 'true');
  };

  // Load initial state from DB
  useEffect(() => {
    async function loadState() {
      const savedGameState = await loadCurrentGameState();
      if (savedGameState && savedGameState.teams) {
        // Make sure the teams array has players array defined
        const teamsWithPlayers = savedGameState.teams.map(team => ({
          ...team,
          // Ensure players is always an array, even if it's null or undefined in the saved state
          players: Array.isArray(team.players) ? team.players : [],
        }));

        // Extract state values ensuring they are consistent
        const { gameActive, isHalftime, currentHalf, gameStatus } = savedGameState;

        // Ensure state consistency with robust rules:
        // 1. If currentHalf > 1, we must be in second half (not halftime)
        // 2. Default currentHalf to 1 if not specified
        // 3. Use appropriate game status based on these values

        // Apply the rules
        const finalCurrentHalf = currentHalf || 1;
        const finalIsHalftime = finalCurrentHalf > 1 ? false : isHalftime;

        // Set appropriate game status
        let adjustedGameStatus = gameStatus || 'initial';

        // Ensure game status is consistent with halftime state and current half
        if (gameActive) {
          if (finalCurrentHalf > 1) {
            // We're in second half
            adjustedGameStatus = 'second_half';
          } else if (finalIsHalftime) {
            // We're in halftime
            adjustedGameStatus = 'halftime';
          } else {
            // We're in first half
            adjustedGameStatus = 'in_progress';
          }
        }

        // console.log('App loading state with consistency check:', {
        //   rawCurrentHalf: currentHalf,
        //   rawIsHalftime: isHalftime,
        //   finalCurrentHalf,
        //   finalIsHalftime,
        //   finalGameStatus: adjustedGameStatus
        // });

        // Update all state variables in one batch to avoid interim inconsistent states
        setTeams(teamsWithPlayers);
        setGameActive(gameActive);
        setIsHalftime(finalIsHalftime); // Use the checked value to ensure consistency
        setCurrentHalf(finalCurrentHalf);
        setGameStatus(adjustedGameStatus);
      } else {
        // If no saved game state, ensure default teams are part of what we might save initially.
        // This helps if saveCurrentGameState is called before any user interaction.
        const initialGameState: CurrentGameState = {
          teams, // Use initial teams from useState
          gameActive: false,
          isHalftime: false,
          currentHalf: 1,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  // Save game state to DB whenever it changes
  useEffect(() => {
    if (isLoading) return; // Don't save while initially loading

    // Perform additional validation to ensure consistent state before saving
    const validatedHalftime = currentHalf > 1 ? false : isHalftime;
    const validatedGameStatus = !gameActive
      ? 'initial'
      : validatedHalftime
        ? 'halftime'
        : currentHalf > 1
          ? 'second_half'
          : 'in_progress';

    const gameState: CurrentGameState = {
      teams,
      gameActive,
      isHalftime: validatedHalftime, // Ensure this is always consistent with currentHalf
      currentHalf, // Renamed from currentInning
      gameStatus: validatedGameStatus,
    };
    // Removed debug logging

    saveCurrentGameState(gameState);
  }, [teams, gameActive, isHalftime, currentHalf, gameStatus, isLoading]); // Renamed from currentInning

  // Update team total score whenever player scores change
  useEffect(() => {
    const updatedTeams = teams.map(team => {
      const totalScore = team.players.reduce((sum, player) => sum + player.score, 0);
      return {
        ...team,
        totalScore,
      };
    });
    // Only update if totalScore actually changed
    const changed = updatedTeams.some((t, i) => t.totalScore !== teams[i].totalScore);
    if (changed) {
      setTeams(updatedTeams);
    }
  }, [teams]); // Simplified dependency - will update when teams change

  const startGame = async () => {
    // Reset scores but keep players
    const resetTeams = teams.map(team => ({
      ...team,
      players: team.players.map(player => ({
        ...player,
        score: 0,
      })),
      totalScore: 0,
    }));
    setTeams(resetTeams);
    setGameActive(true);
    setIsHalftime(false);
    setCurrentHalf(1); // Renamed from setCurrentInning    setGameStatus('in_progress');
    await clearUnassociatedScoreLog(); // Clear logs from any previous unfinished game

    // Create a log entry for game start
    const gameStartLogEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: formatDateTimeYYYYMMDDHHMMSS(new Date()),
      teamName: '',
      playerName: '',
      points: 0,
      type: 'halftime', // Reusing halftime type for game state changes
      content: 'Game Started', // Clear indication that game has started
    };

    await addLogEntryToDb(gameStartLogEntry);
    setScoringLog([gameStartLogEntry]); // Start with fresh log including the game start entry
  };

  const endGame = async () => {
    const winner =
      teams[0].totalScore > teams[1].totalScore
        ? teams[0].name
        : teams[0].totalScore < teams[1].totalScore
          ? teams[1].name
          : 'Draw';
    const gameResult: GameResult = {
      id: Date.now().toString(),
      date: formatDateYYYYMMDD(new Date()), // Changed to YYYY-MM-DD
      teams: JSON.parse(JSON.stringify(teams)), // Deep copy
      winner,
    };
    await saveCompletedGame(gameResult);
    const logIdsToAssociate = scoringLog.map(log => log.id);
    if (logIdsToAssociate.length > 0) {
      await associateScoreLogToGameHistory(logIdsToAssociate, gameResult.id);
    } // Add game ended log entry
    const gameEndedLogEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: formatDateTimeYYYYMMDDHHMMSS(new Date()),
      teamName: '',
      playerName: '',
      points: 0,
      type: 'halftime', // Reusing halftime type for game state changes
      content: `Game Ended - ${winner === 'Draw' ? 'Draw' : `${winner} wins`}!`, // Include the winner info in the log
    };

    await addLogEntryToDb(gameEndedLogEntry);
    setScoringLog(prevLog => [gameEndedLogEntry, ...prevLog]);

    setGameHistory([gameResult, ...gameHistory]);
    setGameActive(false);
    setGameStatus('final');
    // scoringLog for the completed game is now associated, new game will start fresh or load unassociated logs
  };
  const addPlayer = (teamId: string, playerName: string) => {
    if (!playerName.trim()) return;
    setTeams(
      teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            players: [
              ...team.players,
              {
                id: Date.now().toString(),
                name: playerName,
                score: 0,
                active: true, // Set new players to active by default
              },
            ],
          };
        }
        return team;
      })
    );
  };
  const updatePlayerScore = async (teamId: string, playerId: string, points: number) => {
    // Prevent score updates if game is not active or during halftime
    if (!gameActive) {
      // Removed console.log
      return;
    }

    if (isHalftime) {
      // Removed console.log
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
        type: 'score',
      };
      await addLogEntryToDb(logEntry);
      setScoringLog(prevLog => [logEntry, ...prevLog]);
    }
    setTeams(
      teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            players: team.players.map(player => {
              if (player.id === playerId) {
                return {
                  ...player,
                  score: Math.max(0, player.score + points),
                };
              }
              return player;
            }),
          };
        }
        return team;
      })
    );
  };

  const removePlayer = (teamId: string, playerId: string) => {
    setTeams(
      teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            players: team.players.filter(player => player.id !== playerId),
          };
        }
        return team;
      })
    );
  };

  const updateTeamName = (teamId: string, newName: string, newColor: string) => {
    setTeams(
      teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            name: newName || team.name,
            color: newColor || team.color,
          };
        }
        return team;
      })
    );
  };
  const toggleHalftime = async () => {
    const newHalftimeState = !isHalftime;

    try {
      if (isHalftime && !newHalftimeState) {
        // Exiting halftime - going to second half
        // Removed debug logging

        // Create a local state object to ensure consistency
        const secondHalfState = {
          teams,
          gameActive: true,
          isHalftime: false,
          currentHalf: 2,
          gameStatus: 'second_half', // Use a more specific game status for second half
        };

        // Save to database FIRST to ensure it's persisted
        await saveCurrentGameState(secondHalfState);

        // Then update local state
        setCurrentHalf(2);
        setIsHalftime(false);
        setGameStatus('second_half'); // Use consistent game status with the saved state

        // Removed debug logging
      } else {
        // Entering halftime
        // Removed debug logging

        // Create a local state object to ensure consistency
        const halftimeState = {
          teams,
          gameActive: true,
          isHalftime: true,
          currentHalf: 1, // Explicitly keep as 1 during halftime
          gameStatus: 'halftime',
        };

        // Save to database first
        await saveCurrentGameState(halftimeState);

        // Then update local state
        setIsHalftime(true);
        setGameStatus('halftime');

        // Removed debug logging
      }
    } catch (error) {
      console.error('Error toggling halftime state:', error);
    }

    // Create a more descriptive log entry that shows whether we're entering or exiting halftime
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: formatDateTimeYYYYMMDDHHMMSS(new Date()),
      teamName: '',
      playerName: '',
      points: 0,
      type: 'halftime',
      content: newHalftimeState ? 'Halftime started' : 'Second half started', // Add context to the log entry
    };

    await addLogEntryToDb(logEntry);
    setScoringLog(prevLog => [logEntry, ...prevLog]);
  };

  const handleDeleteGame = async (gameId: string) => {
    const success = await deleteGameFromHistory(gameId);
    if (success) {
      // Update the game history state by removing the deleted game
      setGameHistory(prev => prev.filter(game => game.id !== gameId));
    } else {
      // Removed console.error - silent failure or could add error handling here if needed
      // Could add a toast notification here for error feedback
    }
  };

  const handleEditGame = async (
    gameId: string,
    updatedTeamInfo: { id: string; name: string; color: string }[]
  ) => {
    // Find the game to update
    const gameToUpdate = gameHistory.find(game => game.id === gameId);
    if (!gameToUpdate) {
      // Removed console.error - silent failure
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
          color: update.color,
        };
      }
      return team;
    });

    // Recalculate the winner
    if (updatedGame.winner !== 'Draw') {
      // Find which team was the winner by comparing totals
      const winnerTeam = updatedGame.teams.find(team => {
        const otherTeam = updatedGame.teams.find(t => t.id !== team.id);
        return team.totalScore > (otherTeam ? otherTeam.totalScore : 0);
      });

      if (winnerTeam) {
        updatedGame.winner = winnerTeam.name;
      }
    }

    // Save to database
    const success = await updateCompletedGame(gameId, updatedGame);

    if (success) {
      // Update the state with the edited game
      setGameHistory(prev => prev.map(game => (game.id === gameId ? updatedGame : game)));
    } else {
      // Removed console.error - silent failure
    }
  };

  // Add a function to create notes during games
  const addNote = async (content: string) => {
    if (!gameActive) {
      // Removed console.log
      return;
    }

    if (!content.trim()) return;

    const logEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: formatDateTimeYYYYMMDDHHMMSS(new Date()),
      teamName: '', // No specific team for notes
      playerName: '', // No player for notes
      points: 0, // No points for notes
      content, // The note content
      type: 'note',
    };

    await addLogEntryToDb(logEntry);
    setScoringLog(prevLog => [logEntry, ...prevLog]);
  };

  // Function to edit an existing note
  const editNote = async (noteId: string, newContent: string) => {
    if (!newContent.trim()) return;

    // Find the note in the scoring log
    const noteEntryIndex = scoringLog.findIndex(
      entry => entry.id === noteId && entry.type === 'note'
    );
    if (noteEntryIndex === -1) {
      // Removed console.error - silent failure
      return;
    }

    // Create an updated entry
    const updatedEntry: LogEntry = {
      ...scoringLog[noteEntryIndex],
      content: newContent,
      timestamp: formatDateTimeYYYYMMDDHHMMSS(new Date()), // Update timestamp to show it was edited
    };

    // Update in the database
    await addLogEntryToDb(updatedEntry);

    // Update in state
    setScoringLog(prevLog => {
      const newLog = [...prevLog];
      newLog[noteEntryIndex] = updatedEntry;
      return newLog;
    });
  };

  // Function to delete a note
  const deleteNote = async (noteId: string) => {
    // Find the note in the scoring log
    const noteEntry = scoringLog.find(entry => entry.id === noteId && entry.type === 'note');
    if (!noteEntry) {
      // Removed console.error - silent failure
      return;
    }

    // Remove from state
    setScoringLog(prevLog => prevLog.filter(entry => entry.id !== noteId));

    // For now, we don't have a delete function in the database
    // This means the note will still be in the database but not displayed
    // In a future update, we could add proper deletion from the database
  };

  const togglePlayerActive = (teamId: string, playerId: string, active: boolean) => {
    setTeams(
      teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            players: team.players.map(player => {
              if (player.id === playerId) {
                return {
                  ...player,
                  active,
                };
              }
              return player;
            }),
          };
        }
        return team;
      })
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-center">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Legal and info modals */}
      <InfoPage isOpen={isInfoPageOpen} onClose={() => setIsInfoPageOpen(false)} />
      <PrivacyPolicy isOpen={isPrivacyPolicyOpen} onClose={() => setIsPrivacyPolicyOpen(false)} />
      <AboutPage isOpen={isAboutPageOpen} onClose={() => setIsAboutPageOpen(false)} />

      {/* Local storage consent banner */}
      <StorageConsentBanner onAccept={handleStorageConsent} />

      <div className="max-w-4xl mx-auto relative">
        {/* Info Button in top right */}{' '}
        <button
          onClick={() => setIsInfoPageOpen(true)}
          className="absolute right-0 top-0 p-2 text-blue-600 hover:text-blue-800 focus:outline-none rounded-full bg-white shadow-sm hover:bg-blue-50"
          title="How to use HockeyScorer"
          aria-label="Information about how to use HockeyScorer"
        >
          <Info size={24} />
        </button>
        <h1 className="text-3xl font-bold text-center mb-6">
          {gameActive
            ? isHalftime
              ? 'Halftime'
              : currentHalf === 1
                ? 'First Half'
                : 'Second Half'
            : 'HockeyScorer'}
        </h1>
        <ScoreBoard teams={teams} isHalftime={isHalftime} />
        <GameControls
          gameActive={gameActive}
          startGame={startGame}
          endGame={endGame}
          isHalftime={isHalftime}
          onHalftime={toggleHalftime}
          disableStart={teams.some(team => team.players.length === 0)}
          currentHalf={currentHalf}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {' '}
          {teams.map(team => (
            <Team
              key={team.id}
              team={team}
              gameActive={gameActive}
              onAddPlayer={name => addPlayer(team.id, name)}
              onUpdateScore={(playerId, points) => updatePlayerScore(team.id, playerId, points)}
              onRemovePlayer={playerId => removePlayer(team.id, playerId)}
              onUpdateTeamName={(name, color) => updateTeamName(team.id, name, color)}
              onTogglePlayerActive={(playerId, active) =>
                togglePlayerActive(team.id, playerId, active)
              }
            />
          ))}
          <ScoringLog
            entries={scoringLog}
            gameActive={gameActive}
            onAddNote={addNote}
            onEditNote={editNote}
            onDeleteNote={deleteNote}
          />
        </div>
        {gameHistory.length > 0 && (
          <GameHistory
            history={gameHistory}
            onDeleteGame={handleDeleteGame}
            onEditGame={handleEditGame}
          />
        )}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div>
              <p>Build {buildDisplayInfo}</p>
            </div>
            <a
              href="mailto:feedback@hockeyscorer.app?subject=HockeyScorer%20Feedback"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              title="Send feedback"
            >
              <Mail className="w-4 h-4 mr-1" />
              Send Feedback
            </a>
          </div>

          {/* Legal links */}
          <div className="flex justify-center space-x-4 mb-4 flex-wrap">
            <button
              onClick={() => setIsAboutPageOpen(true)}
              className="text-blue-600 hover:underline"
            >
              About
            </button>
            <button
              onClick={() => setIsPrivacyPolicyOpen(true)}
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </button>
          </div>

          <p className="mt-2">© {new Date().getFullYear()} hockeyscorer.app</p>
        </footer>
      </div>
    </div>
  );
}
