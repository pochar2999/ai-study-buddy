# AI Study Buddy

A complete web application that helps students organize class notes, generate study materials, and prepare for exams using AI-powered features.

## Features

### Core Functionality
- **Class Management**: Create, rename, and delete multiple classes/subjects
- **Note Input**: Add notes manually via text input or paste
- **Audio Upload**: Upload lecture recordings (MP3, WAV, M4A) and automatically transcribe to text
- **AI Flashcards**: Generate topic-specific flashcards from your notes
- **AI Quizzes**: Create practice quizzes with multiple-choice questions
- **Multi-Language Support**: English, Spanish, French, and Mandarin Chinese

### Study Features
- **Topic-Based Organization**: Generate flashcards for specific topics
- **Flashcard Review**: Interactive flashcard system with flip animations
- **Practice Quizzes**: Take quizzes and see instant results with explanations
- **Audio Transcription**: Convert lecture recordings to searchable text notes

### Data Management
- **Persistent Storage**: All data saved to Supabase database
- **User Authentication**: Secure sign-up and sign-in
- **Data Privacy**: Row-level security ensures users only access their own data

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4 (flashcards/quizzes) + Whisper (transcription)
- **Icons**: Lucide React

## Data Structure

### Classes Table
```typescript
{
  id: uuid
  user_id: uuid
  name: string
  created_at: timestamp
  updated_at: timestamp
}
```

### Notes Table
```typescript
{
  id: uuid
  class_id: uuid
  content: string
  source: 'manual' | 'pdf' | 'audio'
  created_at: timestamp
}
```

### Flashcards Table
```typescript
{
  id: uuid
  class_id: uuid
  topic: string
  question: string
  answer: string
  created_at: timestamp
}
```

### Quizzes Table
```typescript
{
  id: uuid
  class_id: uuid
  title: string
  questions: QuizQuestion[]
  created_at: timestamp
}
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account
- OpenAI API key

### 1. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the migration file: `supabase/migrations/00001_create_study_buddy_schema.sql`
4. This creates all necessary tables with proper security policies

### 2. Edge Functions Setup

Deploy the three edge functions to Supabase:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy generate-flashcards
supabase functions deploy generate-quiz
supabase functions deploy transcribe-audio
```

### 3. Environment Variables

The edge functions need an OpenAI API key. Set it in your Supabase project:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## How to Use

### Getting Started
1. **Sign Up**: Create an account with email and password
2. **Add a Class**: Click "Add Class" and enter a class name (e.g., "Biology 101")
3. **Select Class**: Click on a class to start working with it

### Adding Notes
1. Go to the "Notes" tab
2. Type or paste your notes into the text area
3. Click "Add Note" to save

### Uploading Audio Lectures
1. Go to the "Audio Upload" tab
2. Click the upload button and select an audio file (MP3, WAV, M4A, max 25MB)
3. Wait for transcription to complete
4. The transcript will be saved as a note automatically

### Generating Flashcards
1. Go to the "Flashcards" tab
2. (Optional) Enter specific topics separated by commas (e.g., "Photosynthesis, Cell Division")
3. Click "Generate Flashcards"
4. Review and study your flashcards
5. Click on a flashcard to flip between question and answer
6. Delete individual cards or entire topic sets as needed

### Taking Quizzes
1. Go to the "Quizzes" tab
2. Choose quiz source: "All Topics" (from notes) or "From Flashcards"
3. (Optional) Enter specific topics to focus on
4. Click "Generate Quiz"
5. Click "Start Quiz" on any generated quiz
6. Answer all questions
7. Click "Submit Quiz" to see your score and correct answers

### Switching Languages
1. Click the language selector in the top-right corner
2. Choose your preferred language
3. All generated content will be in the selected language

### Managing Classes
- **Rename**: Click the edit icon next to a class name
- **Delete**: Click the trash icon (requires confirmation)
- **Note**: Deleting a class removes all associated notes, flashcards, and quizzes

## API Integration

The app uses three Supabase Edge Functions:

### 1. Generate Flashcards
- **Endpoint**: `/functions/v1/generate-flashcards`
- **Input**: Notes text, topics array, language
- **Output**: Array of flashcards with questions and answers

### 2. Generate Quiz
- **Endpoint**: `/functions/v1/generate-quiz`
- **Input**: Content (notes or flashcards), topics array, language
- **Output**: Array of multiple-choice questions

### 3. Transcribe Audio
- **Endpoint**: `/functions/v1/transcribe-audio`
- **Input**: Base64-encoded audio file, language
- **Output**: Transcribed text

## Security

- **Row Level Security (RLS)**: Enabled on all tables
- **Authentication Required**: All operations require valid user session
- **Data Isolation**: Users can only access their own data
- **API Keys**: OpenAI API key stored securely in Supabase secrets

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Auth.tsx         # Authentication UI
│   ├── ClassManager.tsx # Class management
│   ├── NoteInput.tsx    # Note creation
│   ├── FlashcardGenerator.tsx
│   ├── QuizGenerator.tsx
│   ├── AudioUpload.tsx
│   └── LanguageSelector.tsx
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── LanguageContext.tsx
├── lib/                 # Utilities
│   ├── supabase.ts      # Supabase client
│   ├── database.ts      # Database operations
│   └── translations.ts  # Multi-language support
└── App.tsx              # Main application

supabase/
├── functions/           # Edge functions
│   ├── generate-flashcards/
│   ├── generate-quiz/
│   └── transcribe-audio/
└── migrations/          # Database migrations
```

### Building for Production

```bash
npm run build
```

## Troubleshooting

### Edge Functions Not Working
- Verify OpenAI API key is set: `supabase secrets list`
- Check function logs: `supabase functions logs function-name`
- Ensure functions are deployed: `supabase functions list`

### Database Connection Issues
- Verify Supabase URL and anon key in `.env`
- Check if migrations have been applied
- Verify RLS policies are enabled

### Audio Upload Fails
- Check file size (must be under 25MB)
- Verify file format (MP3, WAV, M4A only)
- Ensure OpenAI API key has Whisper access

## License

MIT

## Support

For issues or questions, please check the troubleshooting section or review the Supabase and OpenAI documentation.
