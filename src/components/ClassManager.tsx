import { useState, useEffect } from 'react';
import { db } from '../lib/database';
import { Class } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { t } = useLanguage();

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
    if (!newClassName.trim()) return;
    setLoading(true);
    try {
      const newClass = await db.createClass(newClassName.trim());
      setClasses([newClass, ...classes]);
      onSelectClass(newClass.id);
      setNewClassName('');
      setShowNewClass(false);
    } catch (error) {
      console.error('Error creating class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    setLoading(true);
    try {
      await db.updateClass(id, editName.trim());
      setClasses(classes.map(c => c.id === id ? { ...c, name: editName.trim() } : c));
      setEditingId(null);
      setEditName('');
    } catch (error) {
      console.error('Error renaming class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await db.deleteClass(id);
      setClasses(classes.filter(c => c.id !== id));
      if (selectedClassId === id) {
        const remaining = classes.filter(c => c.id !== id);
        onSelectClass(remaining.length > 0 ? remaining[0].id : null);
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting class:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{t('classes')}</h2>
        <button
          onClick={() => setShowNewClass(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('addClass')}
        </button>
      </div>

      {showNewClass && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder={t('className')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateClass}
              disabled={loading || !newClassName.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {t('create')}
            </button>
            <button
              onClick={() => {
                setShowNewClass(false);
                setNewClassName('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
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
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedClassId === cls.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
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
