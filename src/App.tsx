import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Auth } from './components/Auth';
import { ClassManager } from './components/ClassManager';
import { NoteInput } from './components/NoteInput';
import { FlashcardGenerator } from './components/FlashcardGenerator';
import { QuizGenerator } from './components/QuizGenerator';
import { AudioUpload } from './components/AudioUpload';
import { LanguageSelector } from './components/LanguageSelector';
import { BookOpen, LogOut } from 'lucide-react';

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { t } = useLanguage();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'quizzes' | 'audio'>('notes');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">{t('appTitle')}</h1>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSelector />
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ClassManager
              selectedClassId={selectedClassId}
              onSelectClass={setSelectedClassId}
            />
          </div>

          <div className="lg:col-span-3">
            {!selectedClassId ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">{t('selectClass')}</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-md mb-6">
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('notes')}
                      className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                        activeTab === 'notes'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('notes')}
                    </button>
                    <button
                      onClick={() => setActiveTab('flashcards')}
                      className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                        activeTab === 'flashcards'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('flashcards')}
                    </button>
                    <button
                      onClick={() => setActiveTab('quizzes')}
                      className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                        activeTab === 'quizzes'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('quizzes')}
                    </button>
                    <button
                      onClick={() => setActiveTab('audio')}
                      className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                        activeTab === 'audio'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('audioUpload')}
                    </button>
                  </div>
                </div>

                <div>
                  {activeTab === 'notes' && <NoteInput classId={selectedClassId} />}
                  {activeTab === 'flashcards' && <FlashcardGenerator classId={selectedClassId} />}
                  {activeTab === 'quizzes' && <QuizGenerator classId={selectedClassId} />}
                  {activeTab === 'audio' && (
                    <AudioUpload
                      classId={selectedClassId}
                      onTranscriptionComplete={() => setActiveTab('notes')}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
