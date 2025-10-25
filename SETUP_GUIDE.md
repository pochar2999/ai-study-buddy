# AI Study Buddy - Complete Setup Guide

This guide will walk you through setting up the AI Study Buddy application from scratch.

## Prerequisites

Before you begin, make sure you have:

1. **Node.js 18+** installed on your computer
2. A **Supabase account** (free tier works fine) - [Sign up here](https://supabase.com)
3. An **OpenAI API key** - [Get one here](https://platform.openai.com/api-keys)

## Step 1: Database Setup (5 minutes)

### 1.1 Access Your Supabase Project

1. Log in to your Supabase dashboard
2. Your project URL and keys should already be configured in the `.env` file
3. Note your project reference ID from the URL (e.g., `https://app.supabase.com/project/YOUR-PROJECT-REF`)

### 1.2 Run Database Migration

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/00001_create_study_buddy_schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the migration
6. You should see a success message

### 1.3 Verify Tables Created

1. In the left sidebar, click on **Table Editor**
2. You should see these tables:
   - `classes`
   - `notes`
   - `topics`
   - `flashcards`
   - `quizzes`

## Step 2: Edge Functions Setup (10 minutes)

Edge functions power the AI features (flashcard generation, quiz creation, audio transcription).

### 2.1 Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (using scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Alternative: NPM (all platforms)
npm install -g supabase
```

### 2.2 Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project (replace YOUR_PROJECT_REF with your actual project ref)
supabase link --project-ref YOUR_PROJECT_REF
```

You can find your project reference in your Supabase dashboard URL.

### 2.3 Set OpenAI API Key

```bash
# Set the OpenAI API key as a secret
supabase secrets set OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Important**: Replace `sk-your-openai-api-key-here` with your actual OpenAI API key.

### 2.4 Deploy Edge Functions

```bash
# Deploy all three functions
supabase functions deploy generate-flashcards
supabase functions deploy generate-quiz
supabase functions deploy transcribe-audio
```

You should see success messages for each deployment.

### 2.5 Verify Functions

```bash
# List deployed functions
supabase functions list
```

You should see all three functions listed:
- `generate-flashcards`
- `generate-quiz`
- `transcribe-audio`

## Step 3: Run the Application (2 minutes)

### 3.1 Install Dependencies

```bash
npm install
```

### 3.2 Verify Environment Variables

Check that your `.env` file contains:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

These should already be configured.

### 3.3 Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

## Step 4: Test the Application

### 4.1 Create an Account

1. Open the app in your browser
2. Click "Need an account? Sign Up"
3. Enter an email and password (min 6 characters)
4. Click "Sign Up"

### 4.2 Create Your First Class

1. Click "Add Class"
2. Enter a class name (e.g., "Biology 101")
3. Click "Create"

### 4.3 Add Notes

1. Make sure your class is selected
2. Go to the "Notes" tab
3. Type or paste some notes
4. Click "Add Note"

### 4.4 Generate Flashcards

1. Go to the "Flashcards" tab
2. (Optional) Enter topics like "Photosynthesis, Cell Division"
3. Click "Generate Flashcards"
4. Wait a few seconds for AI to generate flashcards
5. Click on flashcards to flip them

### 4.5 Generate a Quiz

1. Go to the "Quizzes" tab
2. Select "All Topics" or "From Flashcards"
3. Click "Generate Quiz"
4. Click "Start Quiz" to take it
5. Submit and see your score

### 4.6 Test Audio Upload (Optional)

1. Go to the "Audio Upload" tab
2. Upload an MP3, WAV, or M4A file (max 25MB)
3. Wait for transcription
4. Check the "Notes" tab for the transcript

## Troubleshooting

### Problem: Database Migration Fails

**Solution:**
- Make sure you're logged into the correct Supabase project
- Check that no tables already exist with the same names
- Try running the migration again
- Check the SQL Editor error messages for details

### Problem: Edge Functions Don't Deploy

**Solution:**
```bash
# Re-login to Supabase
supabase logout
supabase login

# Re-link your project
supabase link --project-ref YOUR_PROJECT_REF

# Try deploying again
supabase functions deploy generate-flashcards
```

### Problem: Flashcards/Quizzes Don't Generate

**Possible causes:**
1. OpenAI API key not set correctly
2. OpenAI API key has no credits
3. Edge functions not deployed

**Solution:**
```bash
# Verify secret is set
supabase secrets list

# Check function logs
supabase functions logs generate-flashcards

# Redeploy if needed
supabase functions deploy generate-flashcards
```

### Problem: Audio Upload Fails

**Possible causes:**
1. File too large (max 25MB)
2. Wrong file format
3. OpenAI API key issue

**Solution:**
- Reduce file size or trim audio
- Convert to MP3, WAV, or M4A format
- Check edge function logs: `supabase functions logs transcribe-audio`

### Problem: Can't Sign Up/Sign In

**Solution:**
- Check browser console for errors
- Verify `.env` file has correct Supabase URL and key
- Check Supabase dashboard → Authentication → Settings
- Make sure email auth is enabled

## Production Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

### Deploy Options

You can deploy to:
- **Vercel**: Connect GitHub repo, automatic deployments
- **Netlify**: Drag and drop `dist` folder or connect repo
- **Supabase Hosting**: Use Supabase's built-in hosting

Make sure to set environment variables in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Security Notes

1. **Never commit** your `.env` file to version control
2. **Never expose** your Supabase service role key
3. The anon key is safe to use in the frontend
4. OpenAI API key is stored securely in Supabase secrets
5. All database operations use Row Level Security (RLS)

## Cost Estimates

- **Supabase Free Tier**: 500MB database, 2GB bandwidth (sufficient for personal use)
- **OpenAI API**:
  - Flashcards (10 cards): ~$0.01
  - Quiz (5 questions): ~$0.005
  - Audio transcription (1 hour): ~$0.36
- **Estimated monthly cost for moderate use**: $5-10

## Getting Help

If you encounter issues:

1. Check the browser console for errors (F12)
2. Check Supabase function logs: `supabase functions logs function-name`
3. Review the main README.md for feature documentation
4. Check that all environment variables are set correctly

## Next Steps

Now that everything is set up, you can:

1. Add more classes for different subjects
2. Upload lecture recordings for automatic transcription
3. Generate topic-specific flashcards for exam prep
4. Create practice quizzes to test your knowledge
5. Switch between languages for multilingual studying

Enjoy studying with AI Study Buddy!
