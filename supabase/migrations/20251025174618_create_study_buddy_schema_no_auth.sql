/*
  # AI Study Buddy Database Schema (No Authentication)

  ## Overview
  This migration creates the complete database structure for the AI Study Buddy application,
  enabling students to manage classes, notes, flashcards, and quizzes with AI-powered study tools.
  Authentication has been removed for easier access.

  ## Tables Created

  ### 1. classes
  Stores user classes/subjects with basic information
  - `id` (uuid, primary key): Unique identifier for each class
  - `user_id` (text): Mock user identifier (no authentication required)
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
  - Anonymous access allowed for all operations
  - No authentication required

  ## Important Notes
  1. All tables use UUID primary keys for scalability
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
  user_id text DEFAULT 'anonymous-user',
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

-- RLS Policies - Allow all operations for anonymous and authenticated users
CREATE POLICY "Allow all operations on classes"
  ON classes FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on notes"
  ON notes FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on topics"
  ON topics FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on flashcards"
  ON flashcards FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on quizzes"
  ON quizzes FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_classes_user_id ON classes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_class_id ON notes(class_id);
CREATE INDEX IF NOT EXISTS idx_topics_class_id ON topics(class_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_class_id ON flashcards(class_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON flashcards(topic);
CREATE INDEX IF NOT EXISTS idx_quizzes_class_id ON quizzes(class_id);
