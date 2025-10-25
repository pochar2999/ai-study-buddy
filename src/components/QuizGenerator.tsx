import { useState, useEffect } from 'react';
import { db } from '../lib/database';
import { Quiz } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { Sparkles, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface QuizGeneratorProps {
  classId: string;
}

export function QuizGenerator({ classId }: QuizGeneratorProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizSource, setQuizSource] = useState<'notes' | 'flashcards'>('notes');
  const [topics, setTopics] = useState('');
  const { t, language } = useLanguage();

  useEffect(() => {
    loadQuizzes();
  }, [classId]);

  const loadQuizzes = async () => {
    try {
      const data = await db.getQuizzes(classId);
      setQuizzes(data);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      let sourceData = '';

      if (quizSource === 'notes') {
        const notes = await db.getNotes(classId);
        sourceData = notes.map(n => n.content).join('\n\n');
      } else {
        const flashcards = await db.getFlashcards(classId);
        sourceData = flashcards
          .map(fc => `Topic: ${fc.topic}\nQ: ${fc.question}\nA: ${fc.answer}`)
          .join('\n\n');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: sourceData,
            topics: topics.trim() ? topics.split(',').map(t => t.trim()) : [],
            language,
            source: quizSource,
          }),
        }
      );

      const result = await response.json();

      if (result.questions && result.questions.length > 0) {
        const title = `Quiz - ${new Date().toLocaleDateString()}`;
        const quiz = await db.createQuiz(classId, title, result.questions);
        setQuizzes([quiz, ...quizzes]);
        setTopics('');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Error generating quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quiz?')) return;
    try {
      await db.deleteQuiz(id);
      setQuizzes(quizzes.filter(q => q.id !== id));
      if (activeQuiz?.id === id) {
        setActiveQuiz(null);
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setUserAnswers(new Array(quiz.questions.length).fill(-1));
    setShowResults(false);
  };

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!activeQuiz) return 0;
    const correct = activeQuiz.questions.filter(
      (q, i) => q.answer_index === userAnswers[i]
    ).length;
    return Math.round((correct / activeQuiz.questions.length) * 100);
  };

  if (activeQuiz) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">{activeQuiz.title}</h3>
            <button
              onClick={() => {
                setActiveQuiz(null);
                setShowResults(false);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {t('cancel')}
            </button>
          </div>

          {showResults && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-xl font-bold text-blue-900">
                {t('score')}: {calculateScore()}%
              </p>
            </div>
          )}

          <div className="space-y-6">
            {activeQuiz.questions.map((question, qIndex) => {
              const isCorrect = showResults && question.answer_index === userAnswers[qIndex];
              const isIncorrect = showResults && question.answer_index !== userAnswers[qIndex];

              return (
                <div
                  key={qIndex}
                  className={`p-6 rounded-lg border-2 ${
                    showResults
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    {showResults && (
                      isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      )
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-4">
                        {qIndex + 1}. {question.question}
                      </p>

                      <div className="space-y-2">
                        {question.choices.map((choice, cIndex) => (
                          <button
                            key={cIndex}
                            onClick={() => !showResults && handleAnswer(qIndex, cIndex)}
                            disabled={showResults}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              userAnswers[qIndex] === cIndex
                                ? showResults
                                  ? cIndex === question.answer_index
                                    ? 'border-green-500 bg-green-100'
                                    : 'border-red-500 bg-red-100'
                                  : 'border-blue-500 bg-blue-50'
                                : showResults && cIndex === question.answer_index
                                ? 'border-green-500 bg-green-100'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>

                      {showResults && isIncorrect && (
                        <div className="mt-4 text-sm">
                          <p className="text-red-700 font-medium">{t('yourAnswer')}: {question.choices[userAnswers[qIndex]]}</p>
                          <p className="text-green-700 font-medium">{t('correctAnswer')}: {question.choices[question.answer_index]}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!showResults && (
            <button
              onClick={submitQuiz}
              disabled={userAnswers.some(a => a === -1)}
              className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {t('submitQuiz')}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('generateQuiz')}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('quizSource')}
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setQuizSource('notes')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                  quizSource === 'notes'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('allTopics')}
              </button>
              <button
                onClick={() => setQuizSource('flashcards')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                  quizSource === 'flashcards'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('fromFlashcards')}
              </button>
            </div>
          </div>

          <input
            type="text"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder={t('topicPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            {loading ? t('generating') : t('generateQuiz')}
          </button>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          {t('noQuizzes')}
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{quiz.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {quiz.questions.length} {t('question')}s
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startQuiz(quiz)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('startQuiz')}
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
