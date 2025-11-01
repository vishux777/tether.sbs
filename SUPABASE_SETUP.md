# Supabase Setup Guide

## Required Tables

### Profiles Table

Create a `profiles` table in your Supabase project with the following schema:

```sql
-- Create the profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  -- Add any additional user metadata fields below as needed
  -- Example: name TEXT, avatar_url TEXT, phone TEXT, etc.
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Note: Insert operations are handled by the backend service role,
-- so users don't need INSERT policy (handled by service role key)
```

## Table Schema Details

### Required Columns:
- **`id`** (UUID, PRIMARY KEY): References `auth.users(id)`, automatically set to user's auth ID
- **`email`** (TEXT): User's email address (optional, can be null)
- **`created_at`** (TIMESTAMP WITH TIME ZONE): When profile was created (auto-set on insert)
- **`updated_at`** (TIMESTAMP WITH TIME ZONE): Last profile update (updated on login)
- **`last_sign_in_at`** (TIMESTAMP WITH TIME ZONE): Last sign-in timestamp (updated on login)

### Optional Additional Columns:
You can add additional columns for user metadata:
```sql
ALTER TABLE public.profiles ADD COLUMN name TEXT;
ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN phone TEXT;
ALTER TABLE public.profiles ADD COLUMN preferences JSONB;
-- Add any other custom fields as needed
```

### Alternative: Auto-create Profile Trigger

You can optionally set up a database trigger to automatically create a profile when a user signs up in Supabase Auth (this is optional since the backend also handles it):

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate inserts
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Note:** The backend also creates profiles, so this trigger is optional. If you use the trigger, it will create the profile immediately when auth.users is created, and the backend will update it with additional data.

## Environment Variables

Make sure your `.env` file includes:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Features

With this setup:
- ✅ User profiles are automatically created on signup
- ✅ Last sign-in timestamp is updated on login
- ✅ Session tokens (access_token, refresh_token) are stored in localStorage
- ✅ User data is accessible via `/api/users/profile` endpoint
