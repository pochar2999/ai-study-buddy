import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Class {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  class_id: string;
  content: string;
  source: string;
  created_at: string;
}

export interface Topic {
  id: string;
  class_id: string;
  name: string;
  created_at: string;
}

export interface Flashcard {
  id: string;
  class_id: string;
  topic: string;
  question: string;
  answer: string;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  choices: string[];
  answer_index: number;
  topic: string;
}

export interface Quiz {
  id: string;
  class_id: string;
  title: string;
  questions: QuizQuestion[];
  created_at: string;
}
