# How to Verify Profile is Being Inserted into Users2 Table

## Current Status ✅

Your frontend is working correctly:
- ✅ Email confirmation message showing
- ✅ User registered successfully
- ✅ Auth success callback firing

## Next Step: Check Server Logs

### 1. Look at Your Server Console

When you registered the user, check the terminal where you ran `npm run server`. You should see one of these:

#### ✅ Success (Profile Inserted):
```
✅ Profile inserted into Users2 table successfully
   User ID: uuid-here
   Email: user@example.com
   Created At: timestamp
```

#### ❌ Failure (Check Error):
```
❌ Profile creation failed (user still registered):
   Error: [error message]
   Code: [error code]
   Details: [details]
   Hint: [hint]
```

#### ⚠️ Warning (Missing Key):
```
⚠️  supabaseAdmin not initialized - profile will NOT be inserted into Users2
   Missing SUPABASE_SERVICE_ROLE_KEY in .env file
```

### 2. Verify in Supabase Dashboard

1. **Go to Supabase Dashboard**
2. **Authentication → Users:**
   - Should see your registered user
   - Email: the one you registered with
   - Status: Email not confirmed (normal)

3. **Table Editor → Users2:**
   - Click on the "Users2" table
   - Should see a row with:
     - `id`: UUID (matches user ID from auth.users)
     - `email`: Your registered email
     - `created_at`: Timestamp
     - `updated_at`: Timestamp
     - `last_sign_in_at`: null (will be set on login)

### 3. If Profile is Missing

If you see the user in `auth.users` but NOT in `Users2`:

**Most Common Issue: Missing SUPABASE_SERVICE_ROLE_KEY**

1. Check your `.env` file has:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. Restart your server:
   ```bash
   # Stop server (Ctrl+C)
   npm run server
   ```

3. Try registering again

**Other Possible Issues:**

1. **Check Server Console for Errors:**
   - Look for any error messages when you register
   - The server logs will show exactly what went wrong

2. **Table Schema Issues:**
   - Make sure `Users2` table exists
   - Check table has correct columns: `id`, `email`, `created_at`, `updated_at`, `last_sign_in_at`

3. **Foreign Key Constraint:**
   - `id` column must reference `auth.users(id)`
   - The ID must match the user ID from `auth.users`

### 4. Quick Test

Run this to verify configuration:
```bash
node check-supabase-config.js
```

You should see:
```
✅ SUPABASE_SERVICE_ROLE_KEY: ✅ Set
✅ supabaseAdmin client: ✅ Initialized
✅ Can access Users2 table
```

### 5. Manual Test

Test profile insertion directly:
```bash
node test-supabase.js
```

This will:
- Create a test user
- Insert profile into Users2
- Verify data was inserted
- Show you exactly what happened

## Summary

Your frontend is working perfectly! Now you need to:
1. ✅ Check server console for profile insertion messages
2. ✅ Verify data in Supabase Dashboard → Table Editor → Users2
3. ✅ If missing, check `SUPABASE_SERVICE_ROLE_KEY` is set in `.env`

