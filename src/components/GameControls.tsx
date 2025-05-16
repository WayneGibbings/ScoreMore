import React from 'react';
import { PlayIcon, StopCircleIcon, HourglassIcon } from 'lucide-react';
interface GameControlsProps {
  gameActive: boolean;
  startGame: () => void;
  endGame: () => void;
  isHalftime: boolean;
  onHalftime: () => void;
  disableStart: boolean;
}
export const GameControls: React.FC<GameControlsProps> = ({
  gameActive,
  startGame,
  endGame,
  isHalftime,
  onHalftime,
  disableStart
}) => {
  return <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center sm:space-y-0 space-y-4">
        <div className="text-lg font-medium">
          Game Status:{' '}
          <span className={gameActive ? 'text-green-600' : 'text-gray-600'}>
            {!gameActive ? 'Not Started' : isHalftime ? 'Half Time' : 'In Progress'}
          </span>
        </div>
        <div className="flex gap-2">
          {gameActive && <button onClick={onHalftime} className={`flex items-center px-4 py-2 rounded ${isHalftime ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-yellow-600 hover:bg-yellow-700'} text-white`}>
              <HourglassIcon size={18} className="mr-2" />
              {isHalftime ? 'Resume Game' : 'Half Time'}
            </button>}
          {gameActive ? <button onClick={endGame} className="flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              <StopCircleIcon size={18} className="mr-2" />
              End Game
            </button> : <button onClick={startGame} className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400" disabled={disableStart} title={disableStart ? 'Add players to both teams first' : 'Start new game'}>
              <PlayIcon size={18} className="mr-2" />
              Start Game
            </button>}
        </div>
      </div>
    </div>;
};