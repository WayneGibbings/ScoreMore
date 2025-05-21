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
              <li>Click the edit (pencil) icon on a team to enter edit mode.</li> 
              <li>In edit mode, you can update the team name and select a color from the dropdown menu.</li>
              <li>Add players by typing their names in the "Add player" field and clicking "Add Player".</li>
              <li>Click the checkmark icon to save your changes and exit edit mode.</li>
              <li>You must add at least one player to each team before starting the game.</li>
            </ol>
          </section>          <section>
            <h3 className="text-lg font-semibold mb-2">Game Controls</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>The game control button changes based on the current game state, progressing through these states:</li>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li><strong>Start Game:</strong> Click to begin a new game when your teams are ready.</li>
                <li><strong>Half Time:</strong> Click to pause the game at halftime.</li>
                <li><strong>Resume Game:</strong> Click to continue playing after halftime.</li>
                <li><strong>End Game:</strong> Click to finish the current game and record it in the history.</li>
              </ol>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Scoring</h3>
            <ul className="list-disc pl-5 space-y-2">              <li>Use the hockey and goal emojis (🏑🥅) next to a player's name to add a point during an active game.</li>
              <li>The "-" button to remove points is available during an active game or in edit mode.</li>
              <li>To add or remove players at any time, enter edit mode by clicking the edit icon.</li>
              <li>The scoreboard at the top automatically updates as points are added or removed.</li>
              <li>The scoring log shows a chronological record of all scoring events.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Edit Mode</h3>
            <ul className="list-disc pl-5 space-y-2">              <li>Edit mode is indicated by a blue outline around the team card and a checkmark icon.</li>
              <li>You can enter edit mode at any time, even during an active game.</li>
              <li>While in edit mode, you can:</li>              <ul className="list-disc pl-5 space-y-1">
                <li>Change team name and color</li>
                <li>Add new players (useful for late arrivals)</li>
                <li>Remove existing players (trash icon)</li>
                <li>Set players as active or inactive (toggle button)</li>
                <li>Correct scores (add or remove points)</li>
              </ul>
              <li>Click the checkmark icon to save changes and exit edit mode.</li>
              <li><strong>Note:</strong> Starting a game will automatically save changes and exit edit mode for all teams.</li>
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
            <h3 className="text-lg font-semibold mb-2">Game Notes</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>During an active game, you can add notes in the Scoring Log section.</li>
              <li>Notes are useful for recording important events, player substitutions, or general observations.</li>
              <li>To add a note:
                <ul className="list-disc pl-5 space-y-1">
                  <li>Type your note in the text area at the top of the Scoring Log.</li>
                  <li>Click "Add Note" to save it to the game log.</li>
                </ul>
              </li>
              <li>Notes appear with a note icon in the scoring log.</li>
              <li>You can edit or delete notes during the active game by hovering over them and using the edit or delete buttons.</li>
              <li>Notes are saved with the game and will appear in the game history.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Player Active Status</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Each player can be set as active or inactive using the toggle button in edit mode.</li>
              <li>Only active players are shown on the team when not in edit mode.</li>
              <li>All players (active and inactive) are visible when in edit mode.</li>
              <li>Game summaries only include active players.</li>
              <li>New players are automatically set to active when added.</li>
              <li>Use this feature to manage large teams or substitute players without deleting them.</li>
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
              <li>Your data is not synced between devices.</li>
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
