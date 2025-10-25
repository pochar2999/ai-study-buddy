# AI Study Buddy - Quick Start Guide

Get your AI Study Buddy up and running in 15 minutes!

## Prerequisites

- Node.js 18+ installed
- Supabase account (your project is already configured)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## 3-Step Setup

### Step 1: Database Setup (3 minutes)

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor** → **New Query**
3. Copy and paste contents from: `supabase/migrations/00001_create_study_buddy_schema.sql`
4. Click **Run**
5. Verify 5 tables created in **Table Editor**

### Step 2: Deploy Edge Functions (7 minutes)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project (get YOUR_PROJECT_REF from Supabase dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF

# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=sk-your-key-here

# Deploy functions
supabase functions deploy generate-flashcards
supabase functions deploy generate-quiz
supabase functions deploy transcribe-audio
```

### Step 3: Run the App (2 minutes)

```bash
# Install dependencies
npm install

# Start app
npm run dev
```

Open `http://localhost:5173` in your browser!

## First Use

1. **Sign Up**: Create an account with email/password
2. **Add Class**: Click "Add Class" → Enter "Biology 101"
3. **Add Note**: Go to Notes tab → Paste some biology notes → Click "Add Note"
4. **Generate Flashcards**: Go to Flashcards tab → Click "Generate Flashcards"
5. **Study**: Click flashcards to flip between questions and answers!

## Need Help?

- **Detailed Setup**: See `SETUP_GUIDE.md`
- **Features**: See `FEATURES.md`
- **Deployment**: See `DEPLOYMENT_CHECKLIST.md`
- **Troubleshooting**: See `README.md`

## Quick Troubleshooting

**Functions not working?**
```bash
supabase secrets list  # Verify API key is set
supabase functions logs generate-flashcards  # Check logs
```

**Database errors?**
- Make sure migration SQL ran successfully
- Check RLS policies are enabled
- Verify you're authenticated

**Build fails?**
```bash
npm install  # Reinstall dependencies
npm run build  # Try again
```

## What's Next?

- Upload audio lectures for automatic transcription
- Generate quizzes to test your knowledge
- Try different languages (top-right corner)
- Add more classes and organize your studies!

---

**Happy Studying!** 📚✨
