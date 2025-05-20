import React, { useState } from 'react';
import { LogEntry } from '../App';
import { ClockIcon, StickyNoteIcon, PencilIcon, TrashIcon } from 'lucide-react';
interface ScoringLogProps {
  entries: LogEntry[];
  gameActive: boolean;
  onAddNote?: (content: string) => void;
  onEditNote?: (noteId: string, content: string) => void;
  onDeleteNote?: (noteId: string) => void;
}
export const ScoringLog: React.FC<ScoringLogProps> = ({
  entries,
  gameActive,
  onAddNote,
  onEditNote,
  onDeleteNote
}) => {
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteContent.trim() && onAddNote) {
      onAddNote(noteContent);
      setNoteContent('');
    }
  };
  
  const handleEditNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNoteId && editingContent.trim() && onEditNote) {
      onEditNote(editingNoteId, editingContent);
      setEditingNoteId(null);
      setEditingContent('');
    }
  };
  
  const startEditingNote = (noteId: string, content: string) => {
    setEditingNoteId(noteId);
    setEditingContent(content || '');
  };
  
  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };
  
  return <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">Scoring Log</h2>
      
      {/* Note input form - only show when game is active */}
      {gameActive && onAddNote && (
        <form onSubmit={handleAddNote} className="mb-4">
          <div className="flex flex-col space-y-2">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add a note about the game..."
              className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
            />
            <button 
              type="submit"
              disabled={!noteContent.trim()}
              className="self-end bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-gray-300"
            >
              Add Note
            </button>
          </div>
        </form>
      )}
      
      <div className="h-[350px] overflow-y-auto">
        {entries.length === 0 ? <div className="text-center text-gray-500 py-4">
            No entries yet
          </div> : <div className="space-y-2">
            {entries.map(entry => (
              <div key={entry.id} className="flex items-start space-x-2 p-2 border-b last:border-b-0">
                {/* Different icons for different entry types */}
                {entry.type === 'note' ? (
                  <StickyNoteIcon size={16} className="text-blue-400 mt-1" />
                ) : (
                  <ClockIcon size={16} className="text-gray-400 mt-1" />
                )}
                
                <div className="flex-1">
                  <div className="text-sm text-gray-500">{entry.timestamp}</div>
                  
                  {/* Display based on entry type */}
                  {entry.type === 'halftime' ? (
                    <div className="font-medium text-yellow-600">Half Time</div>
                  ) : entry.type === 'note' ? (
                    editingNoteId === entry.id ? (
                      <form onSubmit={handleEditNote} className="mt-1">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
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
                            disabled={!editingContent.trim()}
                            className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded hover:bg-blue-600 disabled:bg-gray-300"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="relative group">
                        <div className="text-gray-700 bg-blue-50 p-1.5 rounded">
                          {entry.content}
                        </div>
                        
                        {/* Edit/Delete controls - only show on hover and when game is active */}
                        {gameActive && onEditNote && onDeleteNote && (
                          <div className="absolute right-0 top-0 hidden group-hover:flex space-x-1 bg-white bg-opacity-75 rounded p-0.5">
                            <button 
                              onClick={() => startEditingNote(entry.id, entry.content || '')}
                              className="text-gray-400 hover:text-blue-500 focus:outline-none"
                              title="Edit note"
                            >
                              <PencilIcon size={14} />
                            </button>
                            <button 
                              onClick={() => onDeleteNote(entry.id)}
                              className="text-gray-400 hover:text-red-500 focus:outline-none"
                              title="Delete note"
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div>
                      <span className="font-medium">{entry.playerName}</span> (
                      {entry.teamName}){' '}
                      <span className={entry.points > 0 ? 'text-green-600' : 'text-red-600'}>
                        {entry.points > 0 ? '+' : ''}
                        {entry.points} goal
                        {Math.abs(entry.points) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>;
};