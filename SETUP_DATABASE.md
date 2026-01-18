# Database Setup Guide

## Quick Setup (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (or create one if needed)

### Step 2: Run SQL Schema
1. Click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `supabase/schema.sql` from this project
4. Copy ALL the contents
5. Paste into the Supabase SQL Editor
6. Click **Run** (or press Cmd+Enter)

**Expected Result:** You should see "Success. No rows returned" - this is GOOD! ✓

### Step 3: Create Storage Bucket
1. Click **Storage** in the left sidebar
2. Click **New Bucket**
3. Name: `profile-photos`
4. Make it **Public** (check the box)
5. Click **Create Bucket**

### Step 4: Verify Tables Created
1. Click **Table Editor** in the left sidebar
2. You should see these tables:
   - users_profile
   - trust_scores
   - user_subscriptions
   - matches
   - swipes
   - messages
   - friend_requests
   - blocked_users
   - reported_users
   - daily_swipe_limits

### Step 5: Restart Your App
```bash
# The app will auto-reload, or press 'r' in the terminal
```

**You're done!** The error should be gone.

---

## Troubleshooting

**Error: "relation already exists"**
- This means tables are already created. You're good to go!

**Error: "permission denied"**
- Make sure you're logged into the correct Supabase project
- Check that your API keys in `.env` match this project

**Still seeing errors?**
- Check Supabase logs: Dashboard → Logs → Postgres Logs
- Verify `.env` file has correct `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
