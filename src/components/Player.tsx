import React from 'react';
import { Player as PlayerType } from '../App';
import { MinusIcon, PlusIcon, TrashIcon } from 'lucide-react';
interface PlayerProps {
  player: PlayerType;
  gameActive: boolean;
  onUpdateScore: (points: number) => void;
  onRemove: () => void;
}
export const Player: React.FC<PlayerProps> = ({
  player,
  gameActive,
  onUpdateScore,
  onRemove
}) => {
  return <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
      <div className="flex items-center space-x-2">
        <button onClick={() => onRemove()} className="text-gray-400 hover:text-red-500" disabled={gameActive} title="Remove player">
          <TrashIcon size={16} />
        </button>
        <span>{player.name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={() => onUpdateScore(-1)} disabled={!gameActive || player.score <= 0} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50" title="Remove goal">
          <MinusIcon size={16} />
        </button>
        <span className="w-8 text-center font-bold">{player.score}</span>
        <button onClick={() => onUpdateScore(1)} disabled={!gameActive} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50" title="Add goal">
          <PlusIcon size={16} />
        </button>
      </div>
    </div>;
};