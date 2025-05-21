import React from 'react';
import { Player as PlayerType } from '../App';
import { MinusIcon, TrashIcon, ToggleLeft, ToggleRight } from 'lucide-react';
interface PlayerProps {
  player: PlayerType;
  gameActive: boolean;
  onUpdateScore: (points: number) => void;
  onRemove: () => void;
  isEditMode: boolean;
  onToggleActive?: (active: boolean) => void;
}
export const Player: React.FC<PlayerProps> = ({
  player,
  gameActive,
  onUpdateScore,
  onRemove,
  isEditMode,
  onToggleActive
}) => {
  return <div className="flex items-center justify-between bg-gray-50 p-2 rounded">      <div className="flex items-center space-x-2">
        {isEditMode && (
          <>
            <button onClick={() => onRemove()} className="text-gray-400 hover:text-red-500" title="Remove player">
              <TrashIcon size={16} />
            </button>            {onToggleActive && (
              <button 
                onClick={() => onToggleActive(!player.active)} 
                className={`${player.active ? "text-green-600 bg-green-100" : "text-gray-500 bg-gray-100"} hover:opacity-90 p-1 rounded`}
                title={player.active ? "Set inactive" : "Set active"}
              >
                {player.active ? 
                  <ToggleRight size={16} /> : 
                  <ToggleLeft size={16} />
                }
              </button>
            )}
          </>
        )}
        <span className={!player.active && isEditMode ? "text-gray-400 italic" : ""}>{player.name}</span>
      </div><div className="flex items-center space-x-2">
        {/* Show minus button only when in edit mode or when game is active */}
        {(isEditMode || gameActive) && (
          <button 
            onClick={() => onUpdateScore(-1)} 
            disabled={player.score <= 0} 
            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50" 
            title="Remove goal"
          >
            <MinusIcon size={16} />
          </button>        )}            <span className="w-8 text-center font-bold">{player.score}</span>            {/* Show goal button only when game is active and not in edit mode */}
        {!isEditMode && (
          <button 
            onClick={() => onUpdateScore(1)} 
            disabled={!gameActive} 
            className="px-2 h-8 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50" 
            title={gameActive ? "Add goal" : "Game must be active to score"}
          >
            <span role="img" aria-label="Add goal" className="flex items-center space-x-1">
              <span>🏑</span><span>🥅</span>
            </span>
          </button>
        )}
        {/* In edit mode, replace the add goal button with another remove goal button for balance */}
        {isEditMode && (
          <button 
            onClick={() => onUpdateScore(-1)} 
            disabled={player.score <= 0} 
            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50" 
            title="Remove goal"
          >
            <MinusIcon size={16} />
          </button>
        )}
      </div>
    </div>;
};