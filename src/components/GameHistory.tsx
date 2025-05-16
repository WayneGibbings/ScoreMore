import React, { useState } from 'react';
import { GameResult } from '../App';
import { ChevronDownIcon, ChevronUpIcon, Trash2Icon } from 'lucide-react';
interface GameHistoryProps {
  history: GameResult[];
  onDeleteGame?: (gameId: string) => void;
}
export const GameHistory: React.FC<GameHistoryProps> = ({
  history,
  onDeleteGame
}) => {
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  
  const toggleGameDetails = (gameId: string) => {
    if (expandedGame === gameId) {
      setExpandedGame(null);
    } else {
      setExpandedGame(gameId);
    }
  };
  
  const confirmDelete = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setGameToDelete(gameId);
  };
  
  const handleDeleteConfirm = () => {
    if (gameToDelete && onDeleteGame) {
      onDeleteGame(gameToDelete);
    }
    setGameToDelete(null);
  };
  
  const handleDeleteCancel = () => {
    setGameToDelete(null);
  };
  return <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Game History</h2>
      <div className="bg-white rounded-lg shadow-md divide-y">
        {history.map(game => <div key={game.id} className="p-4">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleGameDetails(game.id)}>
              <div>
                <div className="font-medium">{game.date}</div>
                <div className="text-sm text-gray-500">
                  {game.teams[0].name} {game.teams[0].totalScore} -{' '}
                  {game.teams[1].totalScore} {game.teams[1].name}
                </div>
              </div>
              <div className="flex items-center">
                <div className={`mr-4 font-medium ${game.winner === 'Tie' ? 'text-gray-600' : 'text-green-600'}`}>
                  {game.winner === 'Tie' ? 'Tie' : `Winner: ${game.winner}`}
                </div>
                {onDeleteGame && (
                  <button 
                    onClick={(e) => confirmDelete(e, game.id)}
                    className="mr-2 text-gray-400 hover:text-red-500 focus:outline-none"
                    title="Delete game"
                  >
                    <Trash2Icon size={18} />
                  </button>
                )}
                {expandedGame === game.id ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
              </div>
            </div>
            {expandedGame === game.id && <div className="mt-4 grid grid-cols-2 gap-4">
                {game.teams.map(team => <div key={team.id} className="border rounded p-3">
                    <h3 className="font-medium">{team.name}</h3>
                    <div className="mt-2 space-y-1">
                      {team.players.map(player => <div key={player.id} className="flex justify-between text-sm">
                          <span>{player.name}</span>
                            <span className="font-medium">
                            {player.score} {player.score === 1 ? 'goal' : 'goals'}
                            </span>
                        </div>)}
                    </div>
                  </div>)}
              </div>}
          </div>)}
      </div>
      
      {/* Confirmation Dialog */}
      {gameToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Delete Game</h3>
            <p className="mb-6">Are you sure you want to delete this game? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={handleDeleteCancel} 
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>;
};