import React from 'react';
import { X } from 'lucide-react'; // Import X icon for closing the modal

interface InfoPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">How to Use ScoreMore</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
            <p className="mb-4">
              ScoreMore is an application designed to help you keep track of scores during games.
              It supports two teams and allows you to track individual player scores, game history,
              and provides real-time updates to the scoreboard.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Setting Up Teams</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Enter team names in the provided fields at the top of each team box.</li>
              <li>Select a color for each team from the dropdown menu.</li>
              <li>Add players to each team by typing their names in the "Add Player" field and pressing Enter.</li>
              <li>You must add at least one player to each team before starting the game.</li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Game Controls</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Start Game:</strong> Click the "Start Game" button once your teams are ready.</li>
              <li><strong>Halftime:</strong> Toggle halftime by clicking the "Halftime" button.</li>
              <li><strong>End Game:</strong> Click "End Game" to finish the current game and record it in the history.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Scoring</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>During an active game, use the "+" button next to a player's name to add a point.</li>
              <li>Use the "-" button to subtract a point if needed.</li>
              <li>The scoreboard at the top automatically updates as points are added or removed.</li>
              <li>The scoring log on the right side shows a chronological record of all scoring events.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Game History</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>After ending a game, it will appear in the Game History section.</li>
              <li>Click on a game in the history to expand and view details.</li>
              <li>Use the edit icon to modify team names for completed games.</li>
              <li>Use the clipboard icon to copy the game summary to your clipboard.</li>
              <li>Use the delete icon to remove a game from the history.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Data Storage</h3>
            <p>
              Your game data is stored locally in your browser. This means:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your data will persist between sessions on the same device and browser.</li>
              <li>Clearing your browser data will also clear your game history.</li>
              <li>Your data is not synced between devices (yet!).</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
            <p>
              If you encounter any issues or have suggestions for improvements,
              please use the "Send Feedback" button at the bottom of the page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
