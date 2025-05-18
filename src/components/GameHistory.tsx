import React, { useState } from 'react';
import { GameResult } from '../App';
import { ChevronDownIcon, ChevronUpIcon, Trash2Icon, Pencil, ClipboardCopyIcon } from 'lucide-react';

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
  const [toast, setToast] = useState<{message: string; visible: boolean}>({message: '', visible: false});
  const [showManualCopyModal, setShowManualCopyModal] = useState<boolean>(false);
  const [manualCopyText, setManualCopyText] = useState<string>('');
  
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
  
  // Format date as "Saturday 5th May 2025"
  const formatDateForSummary = (dateStr: string): string => {
    const date = new Date(dateStr);
    
    // Day of the week
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = dayNames[date.getDay()];
    
    // Day of month with suffix (1st, 2nd, 3rd, etc)
    const day = date.getDate();
    let daySuffix = "th";
    if (day % 10 === 1 && day !== 11) daySuffix = "st";
    else if (day % 10 === 2 && day !== 12) daySuffix = "nd";
    else if (day % 10 === 3 && day !== 13) daySuffix = "rd";
    
    // Month name
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", 
                        "August", "September", "October", "November", "December"];
    const month = monthNames[date.getMonth()];
    
    // Year
    const year = date.getFullYear();
    
    return `${dayOfWeek} ${day}${daySuffix} ${month} ${year}`;
  };

  const copyGameToClipboard = (e: React.MouseEvent, game: GameResult) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    // Format the game summary for clipboard
    let summary = `Game Summary (${formatDateForSummary(game.date)})\n`;
    summary += `${game.teams[0].name} ${game.teams[0].totalScore} - ${game.teams[1].totalScore} ${game.teams[1].name}\n\n`;
    
    // Add team summaries
    game.teams.forEach(team => {
      summary += `${team.name} Players:\n`;
      
      // Make sure we have players to show
      if (team.players && team.players.length > 0) {
        // Sort all players alphabetically
        [...team.players]
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach(player => {
            if (player.score > 0) {
              summary += `- ${player.name}: ${player.score} ${player.score === 1 ? 'goal' : 'goals'}\n`;
            } else {
              summary += `- ${player.name}\n`;
            }
          });
      } else {
        summary += `- No players\n`;
      }
      
      summary += '\n';
    });
    
    // Detect Android Chrome specifically
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isChrome = /Chrome/i.test(navigator.userAgent);
    
    // If it's Android Chrome, go directly to manual copy to avoid issues
    if (isAndroid && isChrome) {
      console.log("Android Chrome detected, using manual copy fallback");
      showManualCopyFallback(summary);
      return;
    }
    
    // More robust check for clipboard API availability
    if (
      typeof navigator !== 'undefined' && 
      navigator.clipboard && 
      window.isSecureContext && 
      typeof navigator.clipboard.writeText === 'function'
    ) {
      try {
        navigator.clipboard.writeText(summary)
          .then(() => {
            showSuccessToast();
          })
          .catch(err => {
            console.error("Modern clipboard API failed:", err);
            androidFallbackCopy(summary);
          });
      } catch (err) {
        console.error("Error calling clipboard API:", err);
        androidFallbackCopy(summary);
      }
    } else {
      // Navigator clipboard API not available or writeText not a function
      console.log("Using fallback clipboard method");
      androidFallbackCopy(summary);
    }
  };
  
  // Fallback clipboard method for devices with compatibility issues
  const androidFallbackCopy = (text: string) => {
    try {
      // For Android, directly use manual copy on devices known to have issues
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isChrome = /Chrome/i.test(navigator.userAgent);
      
      // If it's Android Chrome, skip trying execCommand which often fails
      if (isAndroid && isChrome) {
        showManualCopyFallback(text);
        return;
      }
      
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = text;
      
      // Make it invisible but part of the document
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '1px';
      textarea.style.height = '1px';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      document.body.appendChild(textarea);
      
      // For mobile focus and selection
      if (/webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        textarea.style.opacity = '1'; // Make it visible for mobile
        textarea.style.fontSize = '16px'; // Prevent zoom
        textarea.contentEditable = 'true';
        textarea.readOnly = false;
      }
      
      // Select the text
      textarea.focus();
      textarea.select();
      
      // For iOS devices
      const range = document.createRange();
      range.selectNodeContents(textarea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        textarea.setSelectionRange(0, textarea.value.length); // For mobile devices
      }
      
      // Try the copy command
      const successful = document.execCommand('copy');
      
      // Clean up
      document.body.removeChild(textarea);
      
      if (successful) {
        showSuccessToast();
      } else {
        showManualCopyFallback(text);
      }
    } catch (err) {
      console.error('Fallback clipboard method failed:', err);
      showManualCopyFallback(text);
    }
  };
  
  // Show success toast
  const showSuccessToast = () => {
    setToast({
      message: 'Game summary copied to clipboard!', 
      visible: true
    });
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setToast({message: '', visible: false});
    }, 3000);
  };
  
  // Show a modal with text for manual copying when all else fails
  const showManualCopyFallback = (text: string) => {
    // Store the text temporarily for the modal
    setManualCopyText(text);
    // Show the modal
    setShowManualCopyModal(true);
    
    // Show different message based on device
    const isAndroid = /Android/i.test(navigator.userAgent);
    setToast({
      message: isAndroid 
        ? 'Using manual copy for Android compatibility' 
        : 'Please use the manual copy option', 
      visible: true
    });
    
    setTimeout(() => {
      setToast({message: '', visible: false});
    }, 3000);
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
                <button 
                  onClick={(e) => copyGameToClipboard(e, game)}
                  className="mr-2 text-gray-400 hover:text-blue-500 focus:outline-none"
                  title="Copy game summary to clipboard"
                >
                  <ClipboardCopyIcon size={18} />
                </button>
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
                      {/* Sort players alphabetically by name */}
                      {[...team.players]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(player => (
                          <div key={player.id} className="flex justify-between text-sm">
                            <span>{player.name}</span>
                            {player.score > 0 && (
                              <span className="font-medium">
                                {player.score} {player.score === 1 ? 'goal' : 'goals'}
                              </span>
                            )}
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
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-5 right-5 bg-gray-800 text-white px-6 py-3 rounded-md shadow-lg z-50 flex items-center">
          <ClipboardCopyIcon size={18} className="mr-2" />
          {toast.message}
        </div>
      )}
      
      {/* Manual Copy Modal for Android fallback */}
      {showManualCopyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Copy Game Summary</h3>
            <p className="mb-2 text-sm text-gray-600">
              {/Android/i.test(navigator.userAgent) 
                ? "Tap below and press 'Select all' to select everything, then copy it:"
                : "Press and hold to select the text below, then copy it manually:"}
            </p>
            <div 
              className="bg-gray-100 p-3 rounded-md mb-4 max-h-60 overflow-auto"
              onClick={(e) => {
                // On Android, try to select all text in the pre element when clicked
                if (/Android/i.test(navigator.userAgent)) {
                  const selection = window.getSelection();
                  const range = document.createRange();
                  if (selection && e.currentTarget.querySelector('pre')) {
                    range.selectNodeContents(e.currentTarget.querySelector('pre')!);
                    selection.removeAllRanges();
                    selection.addRange(range);
                  }
                }
              }}
            >
              <pre className="whitespace-pre-wrap break-words text-sm">{manualCopyText}</pre>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowManualCopyModal(false)} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>;
};