import { useState, useEffect } from 'react';
import { db } from '../lib/database';
import { Flashcard } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { Sparkles, Trash2, RotateCcw } from 'lucide-react';

interface FlashcardGeneratorProps {
  classId: string;
}

export function FlashcardGenerator({ classId }: FlashcardGeneratorProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [topics, setTopics] = useState('');
  const [loading, setLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const { t, language } = useLanguage();

  useEffect(() => {
    loadFlashcards();
  }, [classId]);

  const loadFlashcards = async () => {
    try {
      const data = await db.getFlashcards(classId);
      setFlashcards(data);
    } catch (error) {
      console.error('Error loading flashcards:', error);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const notes = await db.getNotes(classId);
      const notesText = notes.map(n => n.content).join('\n\n');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-flashcards`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notes: notesText,
            topics: topics.trim() ? topics.split(',').map(t => t.trim()) : [],
            language,
          }),
        }
      );

      const result = await response.json();

      if (result.flashcards && result.flashcards.length > 0) {
        const newFlashcards = result.flashcards.map((fc: any) => ({
          class_id: classId,
          topic: fc.topic,
          question: fc.question,
          answer: fc.answer,
        }));

        const created = await db.createFlashcards(newFlashcards);
        setFlashcards([...created, ...flashcards]);
        setTopics('');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Error generating flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.deleteFlashcard(id);
      setFlashcards(flashcards.filter(fc => fc.id !== id));
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  const handleDeleteTopic = async (topic: string) => {
    if (!confirm(`${t('deleteTopic')}: ${topic}?`)) return;
    try {
      await db.deleteFlashcardsByTopic(classId, topic);
      setFlashcards(flashcards.filter(fc => fc.topic !== topic));
      if (selectedTopic === topic) setSelectedTopic('all');
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const toggleFlip = (id: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(id)) {
      newFlipped.delete(id);
    } else {
      newFlipped.add(id);
    }
    setFlippedCards(newFlipped);
  };

  const uniqueTopics = Array.from(new Set(flashcards.map(fc => fc.topic)));
  const filteredCards = selectedTopic === 'all'
    ? flashcards
    : flashcards.filter(fc => fc.topic === selectedTopic);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('generateFlashcards')}</h3>
        <input
          type="text"
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          placeholder={t('topicPlaceholder')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          {loading ? t('generating') : t('generateFlashcards')}
        </button>
      </div>

      {uniqueTopics.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">{t('topics')}</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTopic('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTopic === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('allTopics')} ({flashcards.length})
            </button>
            {uniqueTopics.map((topic) => {
              const count = flashcards.filter(fc => fc.topic === topic).length;
              return (
                <div key={topic} className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedTopic === topic
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {topic} ({count})
                  </button>
                  <button
                    onClick={() => handleDeleteTopic(topic)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredCards.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          {t('noFlashcards')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const isFlipped = flippedCards.has(card.id);
            return (
              <div
                key={card.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6 min-h-[200px] flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {card.topic}
                    </span>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 flex items-center justify-center text-center">
                    <p className="text-gray-900 font-medium">
                      {isFlipped ? card.answer : card.question}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleFlip(card.id)}
                    className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {isFlipped ? t('question') : t('answer')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
