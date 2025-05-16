import React, { useState } from 'react';
import { Player } from './Player';
import { TeamData } from '../App'; // Removed PlayerType import
import { Pencil } from 'lucide-react'; // Import Pencil icon

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
  const [isEditingName, setIsEditingName] = useState(false);
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
    setIsEditingName(false);
  };

  return <div className="bg-white rounded-lg shadow-md p-4 border-t-4" style={{ borderTopColor: `var(--color-${team.color}-500, #${getColorHex(team.color)})` }}>
      <div className="flex justify-between items-center mb-4">
        {isEditingName ? <form onSubmit={handleTeamNameSubmit} className="flex-1">
            <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} className="border rounded px-2 py-1 w-full" autoFocus />
            <div className="flex mt-2 space-x-2">
              <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                Save
              </button>
              <button type="button" onClick={() => {
            setTeamName(team.name);
            setTeamColor(team.color);
            setIsEditingName(false);
          }} className="bg-gray-500 text-white px-2 py-1 rounded text-sm">
                Cancel
              </button>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Select Team Color</label>
              <select value={teamColor} onChange={e => setTeamColor(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                {colorOptions.map(color => <option key={color} value={color}>
                    {color}
                  </option>)}
              </select>
            </div>
          </form> : <>
            <h2 className="text-xl font-bold">{team.name}</h2>
            <button onClick={() => setIsEditingName(true)} className="text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled={gameActive} title="Edit team name">
              <Pencil size={18} />
            </button>
          </>}
      </div>
      {team.players.length > 0 ? <div className="space-y-2 mb-4">
          {team.players.map(player => <Player key={player.id} player={player} gameActive={gameActive} onUpdateScore={points => onUpdateScore(player.id, points)} onRemove={() => onRemovePlayer(player.id)} />)}
        </div> : <div className="text-center py-4 text-gray-500">
          No players added yet
        </div>}
      <form onSubmit={handleAddPlayer} className="mt-4">
        <div className="flex flex-col space-y-2">
          <input type="text" placeholder="Add player..." value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" disabled={gameActive} />
          <button type="submit" className="w-full bg-gray-800 text-white px-4 py-2 rounded text-sm disabled:bg-gray-400" disabled={gameActive || !newPlayerName.trim()}>
            Add Player
          </button>
        </div>
      </form>
    </div>;
};