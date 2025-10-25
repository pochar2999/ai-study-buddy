import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://0ec90b57d6e95fcbda19832f.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

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
