-- Simple fix for Users2 table
-- Run this in Supabase SQL Editor

-- Step 1: See what columns exist (run this first to identify the malformed column)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Users2' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Drop the malformed column (replace 'YOUR_COLUMN_NAME' with actual name from Step 1)
-- ALTER TABLE public."Users2" DROP COLUMN "YOUR_COLUMN_NAME";

-- Or if you know the exact name, uncomment and run:
-- ALTER TABLE public."Users2" DROP COLUMN IF EXISTS "Column	Type	Description	Constraints id	UUID	Primary key, refere";

-- Step 3: Add missing last_sign_in_at column
ALTER TABLE public."Users2" 
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE;

-- Step 4: Add foreign key to auth.users (if table is empty, this will work)
-- If you have existing data that doesn't match auth.users IDs, you'll need to truncate first
ALTER TABLE public."Users2" 
  DROP CONSTRAINT IF EXISTS Users2_id_fkey;

ALTER TABLE public."Users2" 
  ADD CONSTRAINT Users2_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 5: Enable RLS
ALTER TABLE public."Users2" ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
DROP POLICY IF EXISTS "Users can read their own profile" ON public."Users2";
CREATE POLICY "Users can read their own profile"
  ON public."Users2" FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public."Users2";
CREATE POLICY "Users can update their own profile"
  ON public."Users2" FOR UPDATE
  USING (auth.uid() = id);

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS Users2_email_idx ON public."Users2"(email);
CREATE INDEX IF NOT EXISTS Users2_created_at_idx ON public."Users2"(created_at);

-- Step 8: Verify final structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'Users2' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

