import React, { useState, useEffect } from 'react';
import { PlayIcon, StopCircleIcon, HourglassIcon } from 'lucide-react';

interface GameControlsProps {
  gameActive: boolean;
  startGame: () => void;
  endGame: () => void;
  resetGame?: () => void; // Add resetGame function prop
  isHalftime: boolean;
  onHalftime: () => void;
  disableStart: boolean;
  currentHalf: number;
  gameStatus: string;
  copyGameSummary?: () => Promise<void>;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameActive,
  startGame,
  endGame,
  resetGame,
  isHalftime,
  onHalftime,
  disableStart,
  currentHalf,
  gameStatus,
  copyGameSummary,
}) => {
  // Track the sequence of the game control button
  const [buttonPhase, setButtonPhase] = useState<number>(0);

  // Sync button phase with game state when component mounts or game state changes externally
  useEffect(() => {
    if (!gameActive) {
      // When game is not active, button should be "Start Game"
      setButtonPhase(0);
    } else if (gameActive && isHalftime && buttonPhase !== 3) {
      // When in halftime, button should be "Resume Game" - but only if we're not already in the "End Game" phase
      setButtonPhase(2);
    } else if (gameActive && !isHalftime && buttonPhase !== 3) {
      // When game is active but not in halftime:
      // - If currentHalf > 1 (second half), we should be in End Game phase (3)
      // - If currentHalf === 1 (first half), we should be in Half Time phase (1)
      const newPhase = currentHalf > 1 ? 3 : 1;
      setButtonPhase(newPhase);
      // console.log(`Game controls syncing phase to ${newPhase} based on currentHalf=${currentHalf}`);
    }
    // We preserve buttonPhase === 3 (End Game) state to avoid going back to Half Time
  }, [gameActive, isHalftime, buttonPhase, currentHalf]);

  // Handle the button click
  const handleGameControlClick = () => {
    // If game has ended and we're showing the Reset button
    if (!gameActive && gameStatus === 'final' && resetGame) {
      resetGame();
      return;
    }

    // Regular game control flow
    if (buttonPhase === 0) {
      // Phase 0: Start Game
      // console.log('Starting game...');
      startGame();
      setButtonPhase(1);
    } else if (buttonPhase === 1) {
      // Phase 1: Half Time
      // console.log('Going to halftime...');
      onHalftime();
      setButtonPhase(2);
    } else if (buttonPhase === 2) {
      // Phase 2: Resume Game - we're coming out of halftime
      // console.log('Resuming game after halftime...');
      onHalftime(); // Toggle halftime state to go to second half

      // Ensure the button phase is updated to reflect we're in the final phase
      // This prevents issues where the state might get confused about which half we're in
      setButtonPhase(3);
    } else if (buttonPhase === 3) {
      // Phase 3: End Game
      // console.log('Ending game...');
      endGame();
      setButtonPhase(0);
    }
  };

  // Determine the button properties based on button phase and game status
  const getButtonProps = () => {
    // If game has ended (status is 'final' and game is not active), show Reset button
    if (!gameActive && gameStatus === 'final' && resetGame) {
      return {
        className: 'flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
        disabled: false,
        title: 'Reset scores and start a new game',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 w-4 h-4"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        ),
        text: 'Reset',
      };
    }

    // Regular game control button phases
    switch (buttonPhase) {
      case 0:
        // Start Game
        return {
          className:
            'flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400',
          disabled: disableStart,
          title: disableStart ? 'Add players to both teams first' : 'Start new game',
          icon: <PlayIcon size={18} className="mr-2" />,
          text: 'Start Game',
        };
      case 1:
        // Half Time
        return {
          className:
            'flex items-center bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700',
          disabled: false,
          title: 'Pause the game for halftime',
          icon: <HourglassIcon size={18} className="mr-2" />,
          text: 'Half Time',
        };
      case 2:
        // Resume Game
        return {
          className:
            'flex items-center bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600',
          disabled: false,
          title: 'Resume the game after halftime',
          icon: <HourglassIcon size={18} className="mr-2" />,
          text: 'Resume Game',
        };
      case 3:
        // End Game
        return {
          className: 'flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700',
          disabled: false,
          title: 'End the current game',
          icon: <StopCircleIcon size={18} className="mr-2" />,
          text: 'End Game',
        };
      default:
        return {
          className:
            'flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400',
          disabled: disableStart,
          title: 'Start new game',
          icon: <PlayIcon size={18} className="mr-2" />,
          text: 'Start Game',
        };
    }
  };

  const buttonProps = getButtonProps();
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center sm:space-y-0 space-y-4">
        <div className="text-lg font-medium flex items-center">
          Game Status:{' '}
          <span
            className={
              gameActive
                ? 'text-green-600'
                : gameStatus === 'final'
                  ? 'text-red-600'
                  : 'text-gray-600'
            }
          >
            {!gameActive
              ? gameStatus === 'final'
                ? 'Ended'
                : 'Not Started'
              : isHalftime
                ? 'Half Time'
                : currentHalf > 1
                  ? 'Second Half'
                  : 'First Half'}
          </span>
          {/* Always show Copy Game Summary button when game has ended */}
          {!gameActive && gameStatus === 'final' && copyGameSummary && (
            <button
              onClick={copyGameSummary}
              className="ml-4 flex items-center bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              title="Copy game summary to clipboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1 w-4 h-4"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy Game Summary
            </button>
          )}
        </div>
        <div>
          {/* Single game control button with sequential states */}
          <button
            onClick={handleGameControlClick}
            className={buttonProps.className}
            disabled={buttonProps.disabled}
            title={buttonProps.title}
          >
            {buttonProps.icon}
            {buttonProps.text}
          </button>
        </div>
      </div>
    </div>
  );
};
