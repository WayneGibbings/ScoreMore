import React, { useState, useEffect } from 'react';
import { GameResult, LogEntry } from '../App';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Trash2Icon,
  Pencil,
  ClipboardCopyIcon,
  StickyNoteIcon,
  PencilIcon,
  TrashIcon,
} from 'lucide-react';
import { loadScoringLogForGame, editGameNote, deleteGameNote } from '../db';
import { copyToClipboard } from '../utils/clipboard';
import { formatGameSummary } from '../utils/gameSummary';
import { Toast } from '../utils/toast';

interface GameHistoryProps {
  history: GameResult[];
  onDeleteGame?: (gameId: string) => void;
  onEditGame?: (
    gameId: string,
    updatedTeams: { id: string; name: string; color: string }[]
  ) => void;
}

export const GameHistory: React.FC<GameHistoryProps> = ({ history, onDeleteGame, onEditGame }) => {
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editedTeamNames, setEditedTeamNames] = useState<{ [teamId: string]: string }>({});
  const [editedTeamColors, setEditedTeamColors] = useState<{ [teamId: string]: string }>({});
  // New state for note editing
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState<string>('');
  const [toastState, setToastState] = useState<Toast>({ message: '', visible: false });
  const [showManualCopyModal, setShowManualCopyModal] = useState<boolean>(false);
  const [manualCopyText, setManualCopyText] = useState<string>('');
  const [gameNotes, setGameNotes] = useState<{ [gameId: string]: LogEntry[] }>({});

  // When a game is expanded, load its notes
  useEffect(() => {
    if (expandedGame) {
      const loadGameNotes = async () => {
        // Only fetch if we don't already have the notes
        if (!gameNotes[expandedGame]) {
          const notes = await loadScoringLogForGame(expandedGame);
          setGameNotes(prev => ({
            ...prev,
            [expandedGame]: notes,
          }));
        }
      };
      loadGameNotes();
    }
  }, [expandedGame, gameNotes]);

  // Functions for note editing
  const startEditingNote = (_gameId: string, noteId: string, content: string) => {
    setEditingNoteId(noteId);
    setEditingNoteContent(content || '');
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const handleEditNote = async (e: React.FormEvent, gameId: string) => {
    e.preventDefault();
    if (!editingNoteId || !editingNoteContent.trim() || !gameId) return;

    const success = await editGameNote(editingNoteId, gameId, editingNoteContent);

    if (success) {
      // Update the note in the local state
      setGameNotes(prev => {
        const updatedNotes = prev[gameId].map(note =>
          note.id === editingNoteId ? { ...note, content: editingNoteContent } : note
        );
        return { ...prev, [gameId]: updatedNotes };
      });

      // Show success toast
      setToastState({
        message: 'Note updated successfully',
        visible: true,
        type: 'success',
      });

      // Hide toast after 3 seconds
      setTimeout(() => {
        setToastState({ message: '', visible: false });
      }, 3000);
    } else {
      // Show error toast
      setToastState({
        message: 'Failed to update note',
        visible: true,
        type: 'error',
      });

      // Hide toast after 3 seconds
      setTimeout(() => {
        setToastState({ message: '', visible: false });
      }, 3000);
    }

    // Reset editing state
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const handleDeleteNote = async (gameId: string, noteId: string) => {
    if (!noteId || !gameId) return;

    const success = await deleteGameNote(noteId, gameId);

    if (success) {
      // Remove the note from the local state
      setGameNotes(prev => {
        const updatedNotes = prev[gameId].filter(note => note.id !== noteId);
        return { ...prev, [gameId]: updatedNotes };
      });

      // Show success toast
      setToastState({
        message: 'Note deleted successfully',
        visible: true,
        type: 'success',
      });
    } else {
      // Show error toast
      setToastState({
        message: 'Failed to delete note',
        visible: true,
        type: 'error',
      });
    }

    // Hide toast after 3 seconds
    setTimeout(() => {
      setToastState({ message: '', visible: false });
    }, 3000);
  };

  // Predefined color options for consistent team colors
  const colorOptions = [
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'pink',
    'orange',
    'teal',
    'indigo',
    'black',
  ];

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
      [teamId]: newName,
    }));
  };

  const handleTeamColorChange = (teamId: string, newColor: string) => {
    setEditedTeamColors(prev => ({
      ...prev,
      [teamId]: newColor,
    }));
  };

  const saveTeamChanges = (e: React.FormEvent, game: GameResult) => {
    e.preventDefault();

    if (onEditGame) {
      // Create an array of updated teams with new names and colors
      const updatedTeams = game.teams.map(team => ({
        id: team.id,
        name: editedTeamNames[team.id] || team.name,
        color: editedTeamColors[team.id] || team.color,
      }));

      onEditGame(game.id, updatedTeams);
    }

    setEditingGameId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setEditingGameId(null);
  };

  // Using formatDateForDisplay from utils/dateFormat.ts
  const copyGameToClipboard = async (e: React.MouseEvent, game: GameResult) => {
    e.stopPropagation(); // Prevent triggering the parent onClick

    // Always load fresh notes for this game to ensure we have the latest data
    const notes = await loadScoringLogForGame(game.id);

    // Update the gameNotes state for future reference
    setGameNotes(prev => ({
      ...prev,
      [game.id]: notes,
    }));

    // Generate game summary using the utility function with the notes we just loaded
    const summary = formatGameSummary(game, { [game.id]: notes });

    // Try to copy to clipboard using utility function
    const success = await copyToClipboard(summary);

    if (success) {
      showSuccessToast();
    } else {
      // If clipboard API fails, show manual copy fallback
      showManualCopyFallback(summary);
    }
  };

  // Show success toast
  const showSuccessToast = () => {
    setToastState({
      message: 'Game summary copied to clipboard!',
      visible: true,
      type: 'success',
    });

    setTimeout(() => {
      setToastState({ message: '', visible: false });
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
    const isChrome = /Chrome/i.test(navigator.userAgent);

    let message = 'Please use the manual copy option';

    // Customize message based on browser/platform
    if (isAndroid && isChrome) {
      message = 'Using manual copy for Android Chrome';
    } else if (isAndroid) {
      message = 'Using manual copy for Android';
    } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      message = 'Using manual copy for iOS';
    }

    setToastState({
      message: message,
      visible: true,
      type: 'info',
    });

    setTimeout(() => {
      setToastState({ message: '', visible: false });
    }, 3000);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Game History</h2>
      <div className="bg-white rounded-lg shadow-md divide-y">
        {history.map(game => (
          <div key={game.id} className="p-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleGameDetails(game.id)}
            >
              <div>
                <div className="font-medium">{game.date}</div>
                <div className="text-sm text-gray-500">
                  {game.teams[0].name} {game.teams[0].totalScore} - {game.teams[1].totalScore}{' '}
                  {game.teams[1].name}
                </div>
              </div>
              <div className="flex items-center">
                <div
                  className={`mr-4 font-medium ${game.winner === 'Tie' ? 'text-gray-600' : 'text-green-600'}`}
                >
                  {game.winner === 'Tie' ? 'Tie' : `Winner: ${game.winner}`}
                </div>
                <button
                  onClick={e => copyGameToClipboard(e, game)}
                  className="mr-2 text-gray-400 hover:text-blue-500 focus:outline-none"
                  title="Copy game summary to clipboard"
                >
                  <ClipboardCopyIcon size={18} />
                </button>
                {onEditGame && (
                  <button
                    onClick={e => startEditing(e, game)}
                    className="mr-2 text-gray-400 hover:text-blue-500 focus:outline-none"
                    title="Edit team names"
                  >
                    <Pencil size={18} />
                  </button>
                )}
                {onDeleteGame && (
                  <button
                    onClick={e => confirmDelete(e, game.id)}
                    className="mr-2 text-gray-400 hover:text-red-500 focus:outline-none"
                    title="Delete game"
                  >
                    <Trash2Icon size={18} />
                  </button>
                )}
                {expandedGame === game.id ? (
                  <ChevronUpIcon size={20} />
                ) : (
                  <ChevronDownIcon size={20} />
                )}
              </div>
            </div>
            {/* Edit Form - only shown when editing this game */}
            {editingGameId === game.id && (
              <form
                onSubmit={e => saveTeamChanges(e, game)}
                className="mt-4 p-3 border border-blue-200 rounded-md bg-blue-50"
              >
                <h3 className="font-medium text-blue-800 mb-3">Edit Team Names</h3>
                <div className="space-y-4">
                  {game.teams.map(team => (
                    <div key={team.id} className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Team Name</label>
                        <input
                          type="text"
                          value={
                            editedTeamNames[team.id] !== undefined
                              ? editedTeamNames[team.id]
                              : team.name
                          }
                          onChange={e => handleTeamNameChange(team.id, e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Team Color
                        </label>
                        <select
                          value={
                            editedTeamColors[team.id] !== undefined
                              ? editedTeamColors[team.id]
                              : team.color
                          }
                          onChange={e => handleTeamColorChange(team.id, e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          {colorOptions.map(color => (
                            <option key={color} value={color}>
                              {color}
                            </option>
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
            {/* Game Details - only shown when expanded and not editing */}{' '}
            {expandedGame === game.id && !editingGameId && (
              <div className="mt-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {game.teams.map(team => (
                    <div key={team.id} className="border rounded p-3">
                      <h3 className="font-medium">{team.name}</h3>{' '}
                      <div className="mt-2 space-y-1">
                        {/* Sort and filter only active players alphabetically by name */}
                        {[...team.players]
                          .filter(player => player.active) // Only include active players
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

                {/* Game Notes Section */}
                {gameNotes[game.id] &&
                  gameNotes[game.id].filter(entry => entry.type === 'note').length > 0 && (
                    <div className="border rounded p-3 bg-blue-50">
                      <h3 className="font-medium flex items-center">
                        <StickyNoteIcon size={16} className="text-blue-500 mr-2" />
                        Game Notes
                      </h3>{' '}
                      <div className="mt-2 space-y-2">
                        {gameNotes[game.id]
                          .filter(entry => entry.type === 'note')
                          .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                          .map(note => (
                            <div
                              key={note.id}
                              className="relative group text-sm border-l-2 border-blue-300 pl-2 py-1"
                            >
                              <div className="text-xs text-gray-500">{note.timestamp}</div>

                              {editingNoteId === note.id ? (
                                <form onSubmit={e => handleEditNote(e, game.id)} className="mt-1">
                                  <textarea
                                    value={editingNoteContent}
                                    onChange={e => setEditingNoteContent(e.target.value)}
                                    className="w-full border rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    rows={2}
                                  />
                                  <div className="flex justify-end space-x-2 mt-1">
                                    <button
                                      type="button"
                                      onClick={cancelEditingNote}
                                      className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={!editingNoteContent.trim()}
                                      className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded hover:bg-blue-600 disabled:bg-gray-300"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <>
                                  <div className="pr-16">{note.content}</div>

                                  {/* Edit/Delete buttons */}
                                  <div className="absolute right-0 top-1 hidden group-hover:flex space-x-1 bg-white bg-opacity-75 rounded p-0.5">
                                    <button
                                      onClick={() =>
                                        startEditingNote(game.id, note.id, note.content || '')
                                      }
                                      className="text-gray-400 hover:text-blue-500 focus:outline-none"
                                      title="Edit note"
                                    >
                                      <PencilIcon size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNote(game.id, note.id)}
                                      className="text-gray-400 hover:text-red-500 focus:outline-none"
                                      title="Delete note"
                                    >
                                      <TrashIcon size={14} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Toast Notification */}
      {toastState.visible && (
        <div
          className={`fixed bottom-5 right-5 px-6 py-3 rounded-md shadow-lg z-50 flex items-center ${
            toastState.type === 'error'
              ? 'bg-red-600 text-white'
              : toastState.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white'
          }`}
        >
          {toastState.type === 'error' ? (
            <TrashIcon size={18} className="mr-2" />
          ) : toastState.type === 'success' ? (
            <ClipboardCopyIcon size={18} className="mr-2" />
          ) : (
            <StickyNoteIcon size={18} className="mr-2" />
          )}
          {toastState.message}
        </div>
      )}

      {/* Confirmation Dialog */}
      {gameToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Delete Game</h3>
            <p className="mb-6">
              Are you sure you want to delete this game? This action cannot be undone.
            </p>
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

      {/* Second toast notification removed as it's duplicate */}

      {/* Manual Copy Modal for Android fallback */}
      {showManualCopyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Copy Game Summary</h3>

            {/* Show different instructions based on device */}
            {/Android/i.test(navigator.userAgent) ? (
              <div className="mb-3 text-sm text-gray-600">
                <p className="mb-2 font-medium">For Android Chrome:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Tap the text below to try auto-selection</li>
                  <li>If needed, press and hold to manually select all</li>
                  <li>Tap "Copy" from the popup menu</li>
                </ol>
              </div>
            ) : (
              <p className="mb-2 text-sm text-gray-600">
                Press and hold to select the text below, then copy it manually:
              </p>
            )}

            {/* Text area that attempts to auto-select on tap */}
            <div
              className="bg-gray-100 p-3 rounded-md mb-4 max-h-60 overflow-auto border border-gray-300"
              onClick={e => {
                // Try to select all text when clicked
                try {
                  const selection = window.getSelection();
                  const range = document.createRange();
                  const preElement = e.currentTarget.querySelector('pre');

                  if (selection && preElement) {
                    range.selectNodeContents(preElement);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    // For mobile devices that support it
                    if ('setSelectionRange' in preElement) {
                      preElement.focus();
                      // @ts-expect-error - TypeScript doesn't know pre elements can have setSelectionRange
                      preElement.setSelectionRange(0, manualCopyText.length);
                    }

                    // Show visual feedback that selection happened
                    setToastState({
                      message: 'Text selected! Now copy it',
                      visible: true,
                      type: 'info',
                    });

                    setTimeout(() => {
                      setToastState({ message: '', visible: false });
                    }, 2000);
                  }
                } catch (err) {
                  console.error('Selection failed:', err);
                }
              }}
            >
              <pre
                className="whitespace-pre-wrap break-words text-sm focus:outline-none"
                tabIndex={0}
              >
                {manualCopyText}
              </pre>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => {
                  // Create a new temporary text field just for copying
                  const textField = document.createElement('textarea');
                  textField.value = manualCopyText;
                  document.body.appendChild(textField);
                  textField.select();

                  try {
                    // Try to copy one more time with execCommand
                    const successful = document.execCommand('copy');
                    if (successful) {
                      setToastState({
                        message: 'Copied to clipboard!',
                        visible: true,
                        type: 'success',
                      });
                      setTimeout(() => {
                        setToastState({ message: '', visible: false });
                      }, 2000);
                    }
                  } catch (err) {
                    console.error('Copy button failed:', err);
                  }

                  document.body.removeChild(textField);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Try Copy Again
              </button>

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
    </div>
  );
};
