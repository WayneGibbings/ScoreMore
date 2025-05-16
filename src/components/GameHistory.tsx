import React, { useState } from 'react';
import { GameResult } from '../App';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
interface GameHistoryProps {
  history: GameResult[];
}
export const GameHistory: React.FC<GameHistoryProps> = ({
  history
}) => {
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  const toggleGameDetails = (gameId: string) => {
    if (expandedGame === gameId) {
      setExpandedGame(null);
    } else {
      setExpandedGame(gameId);
    }
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
    </div>;
};