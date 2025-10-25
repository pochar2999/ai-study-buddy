import { supabase, Class, Note, Flashcard, Quiz, Topic } from './supabase';

export const db = {
  // Classes
  async getClasses(): Promise<Class[]> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createClass(name: string): Promise<Class> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('classes')
      .insert({ name, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateClass(id: string, name: string): Promise<void> {
    const { error } = await supabase
      .from('classes')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteClass(id: string): Promise<void> {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Notes
  async getNotes(classId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createNote(classId: string, content: string, source: string = 'manual'): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert({ class_id: classId, content, source })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Topics
  async getTopics(classId: string): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTopic(classId: string, name: string): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .insert({ class_id: classId, name })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Flashcards
  async getFlashcards(classId: string, topic?: string): Promise<Flashcard[]> {
    let query = supabase
      .from('flashcards')
      .select('*')
      .eq('class_id', classId);

    if (topic) {
      query = query.eq('topic', topic);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createFlashcards(flashcards: Omit<Flashcard, 'id' | 'created_at'>[]): Promise<Flashcard[]> {
    const { data, error } = await supabase
      .from('flashcards')
      .insert(flashcards)
      .select();

    if (error) throw error;
    return data || [];
  },

  async deleteFlashcard(id: string): Promise<void> {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteFlashcardsByTopic(classId: string, topic: string): Promise<void> {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('class_id', classId)
      .eq('topic', topic);

    if (error) throw error;
  },

  // Quizzes
  async getQuizzes(classId: string): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createQuiz(classId: string, title: string, questions: any[]): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .insert({ class_id: classId, title, questions })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteQuiz(id: string): Promise<void> {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
