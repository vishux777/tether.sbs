# Debugging Registration - Why Data Isn't in Users2 Table

## Issue: Sign-up form not adding data to Supabase Users2 table

### Common Causes:

#### 1. ✅ Email Confirmation Required (Session is null)
**This is normal!** When Supabase requires email confirmation:
- User is created in `auth.users` ✅
- Profile should be inserted into `Users2` ✅  
- But `session` and `access_token` are `null` ⚠️

**Check:** Look at browser console - you should see:
```
⚠️  Email confirmation required - session will be available after email confirmation
✅ User registered - email confirmation required
```

#### 2. ❌ SUPABASE_SERVICE_ROLE_KEY Not Set
**Most Common Issue!**

**Symptoms:**
- User created in `auth.users` ✅
- Profile NOT in `Users2` table ❌
- Server console shows: `⚠️  supabaseAdmin not initialized`

**Fix:**
1. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env`
2. Restart server
3. Try registration again

#### 3. ❌ Profile Insertion Failing Silently

**Check server console logs** when you register. You should see:

**✅ Success:**
```
✅ Profile inserted into Users2 table successfully
   User ID: uuid-here
   Email: user@example.com
   Created At: timestamp
```

**❌ Failure:**
```
❌ Profile creation failed (user still registered):
   Error: [error message]
   Code: [error code]
   Details: [details]
```

**Common errors:**
- `relation "Users2" does not exist` → Table name wrong
- `column does not exist` → Missing column in table
- `foreign key violation` → ID doesn't match auth.users
- `permission denied` → RLS blocking (shouldn't with admin client)

### How to Debug:

#### Step 1: Check Server Console
When you register, watch your server console (where `npm run server` is running) for:
- ✅ Profile insertion success message
- ❌ Error messages

#### Step 2: Check Browser Console
Open browser DevTools → Console. Look for:
- `✅ User registered - email confirmation required` (good!)
- `❌ Registration error:` (bad!)

#### Step 3: Verify in Supabase Dashboard
1. **Authentication → Users:** Should see registered user
2. **Table Editor → Users2:** Should see profile row

If user exists in auth.users but NOT in Users2:
→ Profile insertion failed (check server logs for error)

#### Step 4: Test Directly
```bash
# Test if profile insertion works:
node test-supabase.js

# Check configuration:
node check-supabase-config.js
```

### Expected Flow:

1. User fills form and clicks Sign Up
2. Frontend sends POST to `/api/auth/register`
3. Backend creates user in `auth.users` ✅
4. Backend inserts profile into `Users2` ✅ (if SUPABASE_SERVICE_ROLE_KEY is set)
5. Frontend receives response with user data
6. Frontend stores user data (even if token is null due to email confirmation)

### What to Look For:

**In Server Console:**
```
✅ Supabase Admin client initialized (can insert into Users2 table)
✅ Profile inserted into Users2 table successfully
   User ID: uuid
   Email: user@example.com
```

**In Browser Console:**
```
✅ User registered - email confirmation required
Auth success: { user: {...}, session: null }
```

**In Supabase Dashboard:**
- Authentication → Users: User exists
- Table Editor → Users2: Profile row exists

### Quick Fix Checklist:

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in `.env`
- [ ] Server restarted after adding service role key
- [ ] Check server console for profile insertion messages
- [ ] Check browser console for errors
- [ ] Verify Users2 table exists with correct schema
- [ ] Check if email confirmation is required (this is normal)

