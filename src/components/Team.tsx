import React, { useState } from 'react';
import { Player } from './Player';
import { TeamData } from '../App'; // Removed PlayerType import
import { Edit, ArrowLeft } from 'lucide-react'; // Import Edit and ArrowLeft icons

// Helper function to get hex color codes
const getColorHex = (color: string): string => {
  const colorMap: Record<string, string> = {
    'red': 'ef4444',
    'blue': '3b82f6',
    'green': '22c55e',
    'yellow': 'eab308',
    'purple': 'a855f7',
    'pink': 'ec4899',
    'orange': 'f97316',
    'teal': '14b8a6',
    'indigo': '6366f1',
    'black': '1a1a1a' // Much darker gray, very close to black
  };
  return colorMap[color] || '3b82f6'; // Default to blue if color not found
};

interface TeamProps {
  team: TeamData;
  gameActive: boolean;
  onAddPlayer: (name: string) => void;
  onUpdateScore: (playerId: string, points: number) => void;
  onRemovePlayer: (playerId: string) => void;
  onUpdateTeamName: (name: string, color: string) => void;
}
export const Team: React.FC<TeamProps> = ({
  team,
  gameActive,
  onAddPlayer,
  onUpdateScore,
  onRemovePlayer,
  onUpdateTeamName
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [teamName, setTeamName] = useState(team.name);
  const [teamColor, setTeamColor] = useState(team.color);
  
  const colorOptions = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'teal', 'indigo', 'black'];

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName);
      setNewPlayerName('');
    }
  };
  
  const handleTeamNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTeamName(teamName, teamColor);
    // Don't exit edit mode, just update the team name
  };

  const toggleEditMode = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    
    // If leaving edit mode and name/color has changed, save it
    if (!newEditMode && (teamName !== team.name || teamColor !== team.color)) {
      onUpdateTeamName(teamName, teamColor);
    }
  };

  return <div className={`bg-white rounded-lg shadow-md p-4 border-t-4 ${isEditMode ? 'ring-2 ring-blue-500' : ''}`} style={{ borderTopColor: `var(--color-${team.color}-500, #${getColorHex(team.color)})` }}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {isEditMode ? (
            <form onSubmit={handleTeamNameSubmit} className="w-full">
              <label htmlFor={`team-name-${team.id}`} className="block text-sm font-medium text-gray-700">Team Name</label>
              <input 
                type="text"
                id={`team-name-${team.id}`}
                name={`team-name-${team.id}`}
                value={teamName} 
                onChange={e => setTeamName(e.target.value)} 
                className="border rounded px-2 py-1 w-full" 
                autoFocus 
              />
              <div className="mt-2">
                <label htmlFor={`team-color-${team.id}`} className="block text-sm font-medium text-gray-700">Team Color</label>
                <select 
                  id={`team-color-${team.id}`}
                  name={`team-color-${team.id}`}
                  value={teamColor} 
                  onChange={e => setTeamColor(e.target.value)} 
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {colorOptions.map(color => <option key={color} value={color}>
                      {color}
                    </option>)}
                </select>
              </div>
            </form>
          ) : (
            <h2 className="text-xl font-bold">{team.name}</h2>
          )}
        </div>
        <button 
          onClick={toggleEditMode} 
          className={`ml-3 p-1 rounded-full ${isEditMode ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' : 'text-gray-500 hover:bg-gray-100'}`}
          disabled={gameActive}
          title={isEditMode ? "Save & Exit edit mode" : "Edit team"}
        >
          {isEditMode ? <ArrowLeft size={18} /> : <Edit size={18} />}
        </button>
      </div>
      {team.players.length > 0 ? <div className="space-y-2 mb-4">
          {team.players.map(player => <Player 
            key={player.id} 
            player={player} 
            gameActive={gameActive} 
            onUpdateScore={points => onUpdateScore(player.id, points)} 
            onRemove={() => onRemovePlayer(player.id)} 
            isEditMode={isEditMode}
          />)}
        </div> : <div className="text-center py-4 text-gray-500">
          No players added yet
        </div>}
      {!gameActive && isEditMode && (
        <form onSubmit={handleAddPlayer} className="mt-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor={`add-player-${team.id}`} className="sr-only">Add player name</label>
            <input 
              type="text" 
              id={`add-player-${team.id}`}
              name={`add-player-${team.id}`}
              placeholder="Add player..." 
              value={newPlayerName} 
              onChange={e => setNewPlayerName(e.target.value)} 
              className="w-full border rounded px-3 py-2 text-sm" 
            />
            <button type="submit" className="w-full bg-gray-800 text-white px-4 py-2 rounded text-sm disabled:bg-gray-400" disabled={!newPlayerName.trim()}>
              Add Player
            </button>
          </div>
        </form>
      )}
    </div>;
};