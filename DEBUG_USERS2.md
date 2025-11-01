# Debugging Users2 Table - Why Data Isn't Appearing

## Quick Diagnosis

### 1. Check Server Console Logs

When you register a user, check your server console (where `npm run server` is running). You should see:

**✅ If SUPABASE_SERVICE_ROLE_KEY is set:**
```
✅ Supabase Admin client initialized (can insert into Users2 table)
✅ Profile inserted into Users2 table successfully
   User ID: uuid-here
   Email: testuser@example.com
```

**❌ If SUPABASE_SERVICE_ROLE_KEY is NOT set:**
```
⚠️  SUPABASE_SERVICE_ROLE_KEY not set - profile insertion will fail
⚠️  supabaseAdmin not initialized - profile will NOT be inserted into Users2
```

**❌ If there's a database error:**
```
❌ Profile creation failed (user still registered): [error message]
   Error details: {...}
   Profile data attempted: {...}
```

### 2. Most Common Issues

#### Issue #1: Missing SUPABASE_SERVICE_ROLE_KEY (90% of cases)

**Symptom:** Users created in `auth.users` but NOT in `Users2` table

**Solution:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the "service_role" key (NOT the anon key!)
3. Add to your `.env` file:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
4. Restart your server: `npm run server`

#### Issue #2: Table Schema Mismatch

**Symptom:** Error like "column does not exist" or "relation does not exist"

**Check:**
- Table name must be exactly `Users2` (case-sensitive with quotes in SQL)
- Required columns: `id`, `email`, `created_at`, `updated_at`, `last_sign_in_at`
- `id` column must be UUID (not auto-generated)

#### Issue #3: Foreign Key Constraint

**Symptom:** Error like "foreign key violation"

**Solution:**
- Make sure `id` column references `auth.users(id)`
- The `id` value must match a user ID from `auth.users`

#### Issue #4: RLS Blocking Insert

**Symptom:** Silent failure or permission denied error

**Solution:**
- RLS shouldn't block admin client, but check if RLS is enabled
- If needed, temporarily disable RLS:
  ```sql
  ALTER TABLE public."Users2" DISABLE ROW LEVEL SECURITY;
  ```

### 3. Manual Test

Run this to see detailed error messages:

```bash
node test-supabase.js
```

This will show:
- ✅ If Supabase is connected
- ✅ If admin client is initialized  
- ✅ If user is created in auth.users
- ❌ Any errors when inserting into Users2
- ✅ If data was successfully inserted

### 4. Check in Supabase Dashboard

1. **Authentication → Users:**
   - Should see registered users here
   - This confirms auth.users is working

2. **Table Editor → Users2:**
   - If empty, check server logs for errors
   - Click "Insert" button and try manually inserting a row to test

3. **Logs → API Logs:**
   - Go to Supabase Dashboard → Logs → API Logs
   - Look for INSERT operations on Users2 table
   - Check for errors

### 5. Verify Environment Variables

Check your `.env` file has:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ← This is critical!
```

### 6. Test Direct Insert

You can test if the admin client can insert directly:

```bash
# After setting SUPABASE_SERVICE_ROLE_KEY, restart server and run:
node test-supabase.js
```

This will show exactly what's failing.

