import { useState, useEffect } from 'react';
import { db } from '../lib/database';
import { Class } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface ClassManagerProps {
  selectedClassId: string | null;
  onSelectClass: (classId: string | null) => void;
}

export function ClassManager({ selectedClassId, onSelectClass }: ClassManagerProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [showNewClass, setShowNewClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { t } = useLanguage();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await db.getClasses();
      setClasses(data);
      if (data.length > 0 && !selectedClassId) {
        onSelectClass(data[0].id);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const handleCreateClass = async () => {
    const trimmedName = newClassName.trim();

    if (!trimmedName) {
      setError(t('className') + ' cannot be empty');
      return;
    }

    if (classes.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('A class with this name already exists');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const newClass = await db.createClass(trimmedName);
      setClasses([newClass, ...classes]);
      onSelectClass(newClass.id);
      setNewClassName('');
      setShowNewClass(false);
      showNotification('success', `Class "${newClass.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating class:', error);
      showNotification('error', 'Failed to create class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (id: string) => {
    const trimmedName = editName.trim();

    if (!trimmedName) {
      showNotification('error', 'Class name cannot be empty');
      return;
    }

    if (classes.some(c => c.id !== id && c.name.toLowerCase() === trimmedName.toLowerCase())) {
      showNotification('error', 'A class with this name already exists');
      return;
    }

    setLoading(true);
    try {
      await db.updateClass(id, trimmedName);
      setClasses(classes.map(c => c.id === id ? { ...c, name: trimmedName } : c));
      setEditingId(null);
      setEditName('');
      showNotification('success', 'Class renamed successfully!');
    } catch (error) {
      console.error('Error renaming class:', error);
      showNotification('error', 'Failed to rename class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const deletedClass = classes.find(c => c.id === id);
      await db.deleteClass(id);
      setClasses(classes.filter(c => c.id !== id));
      if (selectedClassId === id) {
        const remaining = classes.filter(c => c.id !== id);
        onSelectClass(remaining.length > 0 ? remaining[0].id : null);
      }
      setDeleteConfirm(null);
      showNotification('success', `Class "${deletedClass?.name}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting class:', error);
      showNotification('error', 'Failed to delete class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t('classes')}</h2>
        <button
          onClick={() => setShowNewClass(true)}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('addClass')}</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {showNewClass && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-blue-200 animate-slide-down">
          <input
            type="text"
            value={newClassName}
            onChange={(e) => {
              setNewClassName(e.target.value);
              setError('');
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newClassName.trim()) {
                handleCreateClass();
              }
            }}
            placeholder={t('className')}
            className={`w-full px-3 py-2 border-2 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-600 mb-3 animate-fade-in">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleCreateClass}
              disabled={loading || !newClassName.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : t('create')}
            </button>
            <button
              onClick={() => {
                setShowNewClass(false);
                setNewClassName('');
                setError('');
              }}
              disabled={loading}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {classes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{t('noClasses')}</p>
      ) : (
        <div className="space-y-2">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className={`p-4 rounded-lg border-2 transition-all animate-fade-in ${
                selectedClassId === cls.id
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {editingId === cls.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRename(cls.id)}
                    disabled={loading}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditName('');
                    }}
                    className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : deleteConfirm === cls.id ? (
                <div>
                  <p className="text-sm text-gray-700 mb-3">{t('deleteConfirm')}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(cls.id)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {t('delete')}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onSelectClass(cls.id)}
                    className="flex-1 text-left font-medium text-gray-900"
                  >
                    {cls.name}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(cls.id);
                        setEditName(cls.name);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cls.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
