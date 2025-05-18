import React, { useState } from 'react';
import { GameResult } from '../App';
import { ChevronDownIcon, ChevronUpIcon, Trash2Icon, Pencil } from 'lucide-react';

interface GameHistoryProps {
  history: GameResult[];
  onDeleteGame?: (gameId: string) => void;
  onEditGame?: (gameId: string, updatedTeams: { id: string, name: string, color: string }[]) => void;
}

export const GameHistory: React.FC<GameHistoryProps> = ({
  history,
  onDeleteGame,
  onEditGame
}) => {
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editedTeamNames, setEditedTeamNames] = useState<{ [teamId: string]: string }>({});
  const [editedTeamColors, setEditedTeamColors] = useState<{ [teamId: string]: string }>({});
  
  // Predefined color options for consistent team colors
  const colorOptions = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'teal', 'indigo', 'black'];
  
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
  
  const startEditing = (e: React.MouseEvent, game: GameResult) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setEditingGameId(game.id);
    
    // Initialize the edited team names and colors with current values
    const initialTeamNames: { [teamId: string]: string } = {};
    const initialTeamColors: { [teamId: string]: string } = {};
    
    game.teams.forEach(team => {
      initialTeamNames[team.id] = team.name;
      initialTeamColors[team.id] = team.color;
    });
    
    setEditedTeamNames(initialTeamNames);
    setEditedTeamColors(initialTeamColors);
  };
  
  const handleTeamNameChange = (teamId: string, newName: string) => {
    setEditedTeamNames(prev => ({
      ...prev,
      [teamId]: newName
    }));
  };
  
  const handleTeamColorChange = (teamId: string, newColor: string) => {
    setEditedTeamColors(prev => ({
      ...prev,
      [teamId]: newColor
    }));
  };
  
  const saveTeamChanges = (e: React.FormEvent, game: GameResult) => {
    e.preventDefault();
    
    if (onEditGame) {
      // Create an array of updated teams with new names and colors
      const updatedTeams = game.teams.map(team => ({
        id: team.id,
        name: editedTeamNames[team.id] || team.name,
        color: editedTeamColors[team.id] || team.color
      }));
      
      onEditGame(game.id, updatedTeams);
    }
    
    setEditingGameId(null);
  };
  
  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setEditingGameId(null);
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
                {onEditGame && (
                  <button 
                    onClick={(e) => startEditing(e, game)}
                    className="mr-2 text-gray-400 hover:text-blue-500 focus:outline-none"
                    title="Edit team names"
                  >
                    <Pencil size={18} />
                  </button>
                )}
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
            
            {/* Edit Form - only shown when editing this game */}
            {editingGameId === game.id && (
              <form onSubmit={(e) => saveTeamChanges(e, game)} className="mt-4 p-3 border border-blue-200 rounded-md bg-blue-50">
                <h3 className="font-medium text-blue-800 mb-3">Edit Team Names</h3>
                <div className="space-y-4">
                  {game.teams.map(team => (
                    <div key={team.id} className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Team Name
                        </label>
                        <input
                          type="text"
                          value={editedTeamNames[team.id] !== undefined ? editedTeamNames[team.id] : team.name}
                          onChange={(e) => handleTeamNameChange(team.id, e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Team Color
                        </label>
                        <select
                          value={editedTeamColors[team.id] !== undefined ? editedTeamColors[team.id] : team.color}
                          onChange={(e) => handleTeamColorChange(team.id, e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          {colorOptions.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
            
            {/* Game Details - only shown when expanded and not editing */}
            {expandedGame === game.id && !editingGameId && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {game.teams.map(team => (
                  <div key={team.id} className="border rounded p-3">
                    <h3 className="font-medium">{team.name}</h3>
                    <div className="mt-2 space-y-1">
                      {team.players.map(player => (
                        <div key={player.id} className="flex justify-between text-sm">
                          <span>{player.name}</span>
                          <span className="font-medium">
                            {player.score} {player.score === 1 ? 'goal' : 'goals'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
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