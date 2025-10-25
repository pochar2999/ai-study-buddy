import { useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ClassManager } from './components/ClassManager';
import { NoteInput } from './components/NoteInput';
import { FlashcardGenerator } from './components/FlashcardGenerator';
import { QuizGenerator } from './components/QuizGenerator';
import { AudioUpload } from './components/AudioUpload';
import { LanguageSelector } from './components/LanguageSelector';
import { BookOpen } from 'lucide-react';

function AppContent() {
  const { t } = useLanguage();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'quizzes' | 'audio'>('notes');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{t('appTitle')}</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
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
                  <div className="flex border-b border-gray-200 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('notes')}
                      className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-colors whitespace-nowrap ${
                        activeTab === 'notes'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('notes')}
                    </button>
                    <button
                      onClick={() => setActiveTab('flashcards')}
                      className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-colors whitespace-nowrap ${
                        activeTab === 'flashcards'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('flashcards')}
                    </button>
                    <button
                      onClick={() => setActiveTab('quizzes')}
                      className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-colors whitespace-nowrap ${
                        activeTab === 'quizzes'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('quizzes')}
                    </button>
                    <button
                      onClick={() => setActiveTab('audio')}
                      className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-colors whitespace-nowrap ${
                        activeTab === 'audio'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="hidden sm:inline">{t('audioUpload')}</span>
                      <span className="sm:hidden">Audio</span>
                    </button>
                  </div>
                </div>

                <div className="animate-fade-in">
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
    <LanguageProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </LanguageProvider>
  );
}
