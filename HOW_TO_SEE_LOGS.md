# How to See Server Logs When Registering

## Understanding Server Console Output

When you run `npm run server`, the server **keeps running** - it doesn't stop. New logs appear **in real-time** as requests come in.

## Steps to See Registration Logs:

### 1. Keep Server Running
Your terminal should show:
```
✅ Supabase Admin client initialized (can insert into Users2 table)
Supabase client initialized
Server running on port 3000
```

The server is **still running** - it's waiting for requests.

### 2. Submit Registration Form
- Open your frontend (http://localhost:5176)
- Fill out the registration form
- Click "Sign Up"

### 3. Watch Server Terminal
**New logs will appear BELOW "Server running on port 3000"**

You should see something like:
```
Server running on port 3000

📝 Registration request received
   Email: your@email.com
   Password: ***
   Additional data: none
→ Creating user in Supabase Auth...
✅ User created in auth.users
   User ID: uuid-here
   Email: your@email.com

✅ Profile inserted into Users2 table successfully
   User ID: uuid-here
   Email: your@email.com
   Created At: timestamp

```

### 4. If You Don't See Logs:

**Check:**
- Is the server terminal window visible?
- Did you scroll down to see new logs?
- Are you looking at the correct terminal window?

**Try:**
1. Submit the form again
2. Immediately check the server terminal
3. Scroll down if needed
4. Look for lines starting with `📝` or `✅` or `❌`

### 5. Alternative: Check via Direct Test

If you're not seeing logs when submitting the form, test directly:

```bash
# In a NEW terminal (keep server running in original terminal)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
```

Then check your **server terminal** (where `npm run server` is running) - you should see the logs there.

## Quick Checklist:

- [ ] Server is running (shows "Server running on port 3000")
- [ ] Server terminal window is visible
- [ ] Submit registration form
- [ ] Check server terminal for new logs below "Server running on port 3000"
- [ ] Look for `📝 Registration request received` message

## What You Should See:

**Success:**
```
✅ Profile inserted into Users2 table successfully
   User ID: ...
   Email: ...
   Created At: ...
```

**Error:**
```
❌ Profile creation failed (user still registered):
   Error: ...
   Code: ...
```

**Warning:**
```
⚠️  supabaseAdmin not initialized
```

The server terminal shows logs in **real-time** as requests happen. Keep it open and watch for new output when you submit the form!

