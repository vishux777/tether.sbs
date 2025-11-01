-- Fix the Users2 table to work with the auth system
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Drop the default UUID generation on id column (we'll use auth.users ID instead)
ALTER TABLE public."Users2" 
  ALTER COLUMN id DROP DEFAULT;

-- 2. Add missing last_sign_in_at column
ALTER TABLE public."Users2" 
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE;

-- 3. Remove the malformed column (if it exists - you'll need to check the actual column name)
-- Replace 'malformed_column_name' with the actual column name if different
-- ALTER TABLE public."Users2" DROP COLUMN IF EXISTS "malformed_column_name";

-- 4. Add foreign key constraint to reference auth.users (if not already present)
-- Note: This will only work if the id values match auth.users(id)
-- If you already have data, you may need to delete it first or update the IDs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'Users2_id_fkey' 
    AND conrelid = 'public.Users2'::regclass
  ) THEN
    ALTER TABLE public."Users2" 
      ADD CONSTRAINT Users2_id_fkey 
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Update existing records to use NOW() for created_at/updated_at if they're null
UPDATE public."Users2" 
SET created_at = NOW(), updated_at = NOW()
WHERE created_at IS NULL OR updated_at IS NULL;

-- 6. Make email nullable (in case it's needed)
-- If you want email to be NOT NULL, skip this step
-- ALTER TABLE public."Users2" ALTER COLUMN email DROP NOT NULL;

-- 7. Enable Row Level Security
ALTER TABLE public."Users2" ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies
DROP POLICY IF EXISTS "Users can read their own profile" ON public."Users2";
CREATE POLICY "Users can read their own profile"
  ON public."Users2" FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public."Users2";
CREATE POLICY "Users can update their own profile"
  ON public."Users2" FOR UPDATE
  USING (auth.uid() = id);

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS Users2_email_idx ON public."Users2"(email);
CREATE INDEX IF NOT EXISTS Users2_created_at_idx ON public."Users2"(created_at);

