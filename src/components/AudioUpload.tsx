import { useState } from 'react';
import { db } from '../lib/database';
import { useLanguage } from '../contexts/LanguageContext';
import { Upload, Loader } from 'lucide-react';

interface AudioUploadProps {
  classId: string;
  onTranscriptionComplete?: () => void;
}

export function AudioUpload({ classId, onTranscriptionComplete }: AudioUploadProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const { t, language } = useLanguage();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload an MP3, WAV, or M4A file');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('File size must be less than 25MB');
      return;
    }

    setLoading(true);
    setProgress(t('uploadingAudio'));

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64Audio = reader.result as string;

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audio: base64Audio,
              language: language,
            }),
          }
        );

        const result = await response.json();

        if (result.text) {
          await db.createNote(classId, result.text, 'audio');
          setProgress(t('transcriptionComplete'));
          if (onTranscriptionComplete) {
            onTranscriptionComplete();
          }
          setTimeout(() => {
            setProgress('');
            setLoading(false);
          }, 2000);
        } else {
          throw new Error('No transcription received');
        }
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Error transcribing audio. Please try again.');
      setLoading(false);
      setProgress('');
    }

    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{t('uploadAudio')}</h3>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-gray-700 font-medium">{progress}</p>
          </div>
        ) : (
          <label className="cursor-pointer">
            <input
              type="file"
              accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-4">
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-gray-700 font-medium mb-1">
                  {t('uploadAudio')}
                </p>
                <p className="text-sm text-gray-500">
                  MP3, WAV, M4A (max 25MB)
                </p>
              </div>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {t('uploadAudio')}
              </button>
            </div>
          </label>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium mb-2">How it works:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Upload an audio recording of a lecture</li>
          <li>AI transcribes the audio to text</li>
          <li>Transcription is saved as a note</li>
          <li>Generate flashcards and quizzes from the transcript</li>
        </ol>
      </div>
    </div>
  );
}
