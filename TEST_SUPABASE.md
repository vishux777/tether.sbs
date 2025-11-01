# Testing Supabase Data Insertion

## Method 1: Using the Test Script

Run the automated test script:

```bash
node test-supabase.js
```

This will:
- ✅ Create a test user in `auth.users`
- ✅ Try to insert profile into `Users2` table
- ✅ Verify the data was inserted
- ✅ Show detailed results

## Method 2: Test via API Endpoint

### Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"TestPassword123!"}'
```

**Expected Success Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "testuser@example.com",
    ...
  },
  "access_token": "token-here",
  "refresh_token": "token-here",
  ...
}
```

**Check if user was created in Supabase:**
1. Go to Supabase Dashboard → Authentication → Users
2. You should see the new user in the list

**Check if profile was inserted into Users2:**
1. Go to Supabase Dashboard → Table Editor → Users2
2. You should see a new row with the user's ID and email

## Method 3: Check Server Logs

When you register a user, check your server console logs. You should see:
- ✅ "Supabase client initialized"
- ✅ User created successfully
- ⚠️ Or warnings if profile insertion fails

## Troubleshooting

### If Profile Insertion Fails:

1. **Check SUPABASE_SERVICE_ROLE_KEY is set in `.env`:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. **Check Users2 table schema:**
   - Must have columns: `id`, `email`, `created_at`, `updated_at`, `last_sign_in_at`
   - `id` should be UUID (not auto-generated)
   - Should reference `auth.users(id)`

3. **Check for errors in server logs:**
   - Look for "Profile creation failed" warnings
   - Check the exact error message

### Common Issues:

- ❌ **"supabaseAdmin not initialized"** → Missing `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- ❌ **"relation 'Users2' does not exist"** → Table name is wrong or table doesn't exist
- ❌ **"column does not exist"** → Table schema doesn't match expected columns
- ❌ **"Foreign key violation"** → User ID doesn't match auth.users ID

## Verify Data in Supabase Dashboard

1. **Authentication → Users:**
   - Should see registered users
   - Email verification status

2. **Table Editor → Users2:**
   - Should see user profiles
   - Each row should have: id, email, created_at, updated_at, last_sign_in_at

3. **Check logs in Supabase Dashboard:**
   - Go to Logs → API Logs to see insert operations

