import { useState, useEffect } from 'react';
import { db } from '../lib/database';
import { Note } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { Plus, Trash2 } from 'lucide-react';

interface NoteInputProps {
  classId: string;
}

export function NoteInput({ classId }: NoteInputProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadNotes();
  }, [classId]);

  const loadNotes = async () => {
    try {
      const data = await db.getNotes(classId);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      showNotification('warning', 'Note content cannot be empty');
      return;
    }
    setLoading(true);
    try {
      const note = await db.createNote(classId, newNote.trim());
      setNotes([note, ...notes]);
      setNewNote('');
      showNotification('success', 'Note added successfully!');
    } catch (error) {
      console.error('Error adding note:', error);
      showNotification('error', 'Failed to add note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    setLoading(true);
    try {
      await db.deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
      showNotification('success', 'Note deleted successfully!');
    } catch (error) {
      console.error('Error deleting note:', error);
      showNotification('error', 'Failed to delete note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('addNote')}</h3>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={t('pasteNotes')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px]"
          rows={6}
        />
        <button
          onClick={handleAddNote}
          disabled={loading || !newNote.trim()}
          className="mt-3 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          {loading ? 'Adding...' : t('addNote')}
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-lg font-medium mb-2">{t('noNotes')}</p>
          <p className="text-gray-500 text-sm">Add your first note above to get started with flashcards and quizzes!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
