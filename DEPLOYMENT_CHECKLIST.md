# AI Study Buddy - Deployment Checklist

Use this checklist to ensure everything is set up correctly before using the application.

## ✅ Pre-Deployment Checklist

### 1. Database Setup
- [ ] SQL migration file executed in Supabase SQL Editor
- [ ] All 5 tables visible in Table Editor (classes, notes, topics, flashcards, quizzes)
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Database policies created successfully

### 2. Edge Functions
- [ ] Supabase CLI installed
- [ ] Logged into Supabase CLI (`supabase login`)
- [ ] Project linked (`supabase link`)
- [ ] OpenAI API key set as secret (`supabase secrets set OPENAI_API_KEY=...`)
- [ ] `generate-flashcards` function deployed
- [ ] `generate-quiz` function deployed
- [ ] `transcribe-audio` function deployed
- [ ] All functions visible in `supabase functions list`

### 3. Application Setup
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file contains correct Supabase URL
- [ ] `.env` file contains correct Supabase anon key
- [ ] Application builds successfully (`npm run build`)
- [ ] Development server starts (`npm run dev`)

### 4. Authentication
- [ ] Can access sign-up page
- [ ] Can create new account
- [ ] Can sign in with created account
- [ ] Can sign out successfully

### 5. Core Features
- [ ] Can create a new class
- [ ] Can rename a class
- [ ] Can delete a class (with confirmation)
- [ ] Can add notes to a class
- [ ] Can delete notes

### 6. AI Features
- [ ] Flashcards generate successfully (requires notes)
- [ ] Flashcards display correctly
- [ ] Can flip flashcards
- [ ] Can delete individual flashcards
- [ ] Can delete flashcard topics
- [ ] Quizzes generate successfully
- [ ] Can take and submit quizzes
- [ ] Quiz results display correctly

### 7. Advanced Features
- [ ] Audio upload accepts files
- [ ] Audio transcription works (may take 30-60 seconds)
- [ ] Transcribed text appears in notes
- [ ] Language selector changes UI language
- [ ] Generated content respects selected language

### 8. Data Persistence
- [ ] Data survives page refresh
- [ ] Multiple classes can be managed
- [ ] Switching between classes works
- [ ] User data is isolated (create second account to test)

## 🚨 Common Issues and Solutions

### Issue: "Missing Supabase environment variables"
**Solution**: Check `.env` file exists and contains:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
```

### Issue: "OpenAI API key not configured"
**Solution**: Set the secret in Supabase:
```bash
supabase secrets set OPENAI_API_KEY=sk-your-key-here
```

### Issue: Edge functions return 404
**Solution**: Redeploy functions:
```bash
supabase functions deploy generate-flashcards
supabase functions deploy generate-quiz
supabase functions deploy transcribe-audio
```

### Issue: Database queries fail
**Solution**:
1. Check if migration ran successfully
2. Verify RLS policies exist
3. Ensure user is authenticated

### Issue: Audio upload fails immediately
**Solution**:
1. Check file size (max 25MB)
2. Verify file format (MP3, WAV, M4A only)
3. Check browser console for errors

## 📊 Testing Workflow

### Quick Test (5 minutes)
1. Sign up with test account
2. Create a class named "Test Class"
3. Add a note with some content
4. Generate 10 flashcards
5. Generate a quiz
6. Take the quiz

### Full Test (15 minutes)
1. Create account
2. Create 2 classes
3. Add notes to both classes
4. Generate topic-specific flashcards
5. Generate quizzes from notes and flashcards
6. Upload a short audio file
7. Test language switching
8. Delete flashcard topics
9. Delete notes
10. Delete a class

## 🚀 Production Deployment

### Before Deploying
- [ ] Run `npm run build` successfully
- [ ] Test built version locally (`npm run preview`)
- [ ] Verify all features work in production build
- [ ] Check browser console for errors
- [ ] Test on different browsers

### Environment Variables for Hosting
Set these in your hosting platform:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Post-Deployment
- [ ] Test sign up on production URL
- [ ] Test all core features
- [ ] Test AI generation features
- [ ] Verify mobile responsiveness
- [ ] Check performance and load times

## 📈 Monitoring

### Supabase Dashboard
- Monitor database usage
- Check authentication activity
- Review edge function logs
- Track API requests

### OpenAI Dashboard
- Monitor API usage
- Check credit balance
- Review rate limits

## 🔒 Security Verification

- [ ] RLS policies active on all tables
- [ ] Users can only see their own data
- [ ] Anon key (not service role key) used in frontend
- [ ] OpenAI key not exposed in frontend
- [ ] `.env` file not committed to version control
- [ ] CORS headers properly configured

## 💰 Cost Monitoring

### Free Tier Limits
- Supabase: 500MB database, 2GB bandwidth
- OpenAI: Pay-as-you-go pricing

### Expected Costs (Light Usage)
- Database: Free
- Edge Functions: Free
- OpenAI API: $5-10/month

### Cost Optimization
- Delete old quizzes and flashcards
- Limit flashcard generation to necessary topics
- Use shorter audio files
- Monitor OpenAI usage dashboard

## ✨ Optional Enhancements

Future improvements you could make:
- [ ] PDF upload and parsing
- [ ] Spaced repetition for flashcards
- [ ] Quiz history and analytics
- [ ] Export flashcards to Anki
- [ ] Collaborative study groups
- [ ] Calendar integration for study schedules
- [ ] Progress tracking and statistics

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **OpenAI Docs**: https://platform.openai.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

## ✅ Final Checklist

Before considering deployment complete:
- [ ] All items in "Pre-Deployment Checklist" checked
- [ ] At least one full test workflow completed
- [ ] No errors in browser console
- [ ] All features working as expected
- [ ] Documentation reviewed
- [ ] Backup of database schema saved
- [ ] OpenAI API key secured
- [ ] Ready for users!

---

**Status**: Ready for deployment when all items are checked ✓
