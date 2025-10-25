/*
  # AI Study Buddy Database Schema

  ## Overview
  This migration creates the complete database structure for the AI Study Buddy application,
  enabling students to manage classes, notes, flashcards, and quizzes with AI-powered study tools.

  ## Tables Created

  ### 1. classes
  Stores user classes/subjects with basic information
  - `id` (uuid, primary key): Unique identifier for each class
  - `user_id` (uuid): Reference to authenticated user
  - `name` (text): Name of the class/subject
  - `created_at` (timestamptz): When the class was created
  - `updated_at` (timestamptz): Last modification timestamp

  ### 2. notes
  Stores text notes associated with each class
  - `id` (uuid, primary key): Unique identifier for each note
  - `class_id` (uuid, foreign key): Reference to parent class
  - `content` (text): The actual note content
  - `source` (text): Source type (manual, pdf, audio)
  - `created_at` (timestamptz): When the note was created

  ### 3. topics
  Stores topics for organizing flashcards and quizzes
  - `id` (uuid, primary key): Unique identifier for each topic
  - `class_id` (uuid, foreign key): Reference to parent class
  - `name` (text): Topic name
  - `created_at` (timestamptz): When the topic was created

  ### 4. flashcards
  Stores flashcards generated from notes
  - `id` (uuid, primary key): Unique identifier for each flashcard
  - `class_id` (uuid, foreign key): Reference to parent class
  - `topic` (text): Associated topic
  - `question` (text): Flashcard question
  - `answer` (text): Flashcard answer
  - `created_at` (timestamptz): When the flashcard was created

  ### 5. quizzes
  Stores generated quizzes
  - `id` (uuid, primary key): Unique identifier for each quiz
  - `class_id` (uuid, foreign key): Reference to parent class
  - `title` (text): Quiz title
  - `questions` (jsonb): Array of question objects with choices and answers
  - `created_at` (timestamptz): When the quiz was created

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Authenticated users required for all operations
  - Policies enforce ownership through user_id or class ownership chain

  ## Important Notes
  1. All tables use UUID primary keys for security and scalability
  2. Cascading deletes ensure data consistency when classes are removed
  3. JSONB used for flexible quiz question storage
  4. Timestamps track creation and modification times
  5. Foreign key constraints maintain referential integrity
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  content text NOT NULL,
  source text DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  topic text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classes table
CREATE POLICY "Users can view own classes"
  ON classes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own classes"
  ON classes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notes table
CREATE POLICY "Users can view notes in own classes"
  ON notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = notes.class_id
      AND classes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert notes in own classes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = notes.class_id
      AND classes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes in own classes"
  ON notes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = notes.class_id
      AND classes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = notes.class_id
      AND classes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes in own classes"
  ON notes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = notes.class_id
      AND classes.user_id = auth.uid()
    )
  );

-- RLS Policies for topics table
CREATE POLICY "Users can view topics in own classes"
  ON topics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = topics.class_id
      AND classes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert topics in own classes"
  ON topics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = topics.class_id
      AND classes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete topics in own classes"
  ON topics FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = topics.class_id
      AND classes.user_id = auth.uid()
    )
  );

-- RLS Policies for flashcards table
CREATE POLICY "Users can view flashcards in own classes"
  ON flashcards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = flashcards.class_id
      AND classes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert flashcards in own classes"
  ON flashcards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = flashcards.class_id
      AND classes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete flashcards in own classes"
  ON flashcards FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = flashcards.class_id
      AND classes.user_id = auth.uid()
    )
  );

-- RLS Policies for quizzes table
CREATE POLICY "Users can view quizzes in own classes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = quizzes.class_id
      AND classes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert quizzes in own classes"
  ON quizzes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = quizzes.class_id
      AND classes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete quizzes in own classes"
  ON quizzes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = quizzes.class_id
      AND classes.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_classes_user_id ON classes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_class_id ON notes(class_id);
CREATE INDEX IF NOT EXISTS idx_topics_class_id ON topics(class_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_class_id ON flashcards(class_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON flashcards(topic);
CREATE INDEX IF NOT EXISTS idx_quizzes_class_id ON quizzes(class_id);
