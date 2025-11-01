-- Clean up and fix the Users2 table
-- Run this SQL in your Supabase SQL Editor

-- 1. First, check what that malformed column is actually called
-- Run this to see the column name:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'Users2' AND table_schema = 'public';

-- 2. Drop the malformed column (you may need to adjust the name based on the actual column name)
-- The column seems to have a name like "Column	Type	Description	Constraints id	UUID	Primary key, refere"
-- Check the actual column name first, then drop it:
DO $$
DECLARE
    malformed_col_name TEXT;
BEGIN
    -- Find the column with unusual name (contains tabs/newlines or is very long)
    SELECT column_name INTO malformed_col_name
    FROM information_schema.columns
    WHERE table_name = 'Users2' 
      AND table_schema = 'public'
      AND (column_name LIKE '%Column%' OR column_name LIKE '%Type%' OR column_name LIKE '%Description%')
      AND column_name NOT IN ('id', 'email', 'created_at', 'updated_at');
    
    IF malformed_col_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public."Users2" DROP COLUMN IF EXISTS %I', malformed_col_name);
        RAISE NOTICE 'Dropped malformed column: %', malformed_col_name;
    ELSE
        RAISE NOTICE 'No malformed column found';
    END IF;
END $$;

-- 3. Add missing last_sign_in_at column
ALTER TABLE public."Users2" 
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE;

-- 4. Add foreign key constraint to reference auth.users(id)
-- First drop existing foreign key if any (replace 'old_constraint_name' if needed)
DO $$
BEGIN
  -- Drop any existing foreign key constraints on id column
  ALTER TABLE public."Users2" 
    DROP CONSTRAINT IF EXISTS Users2_id_fkey;
  
  -- Add the foreign key constraint
  ALTER TABLE public."Users2" 
    ADD CONSTRAINT Users2_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    
  RAISE NOTICE 'Foreign key constraint added';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not add foreign key. You may need to clean existing data first. Error: %', SQLERRM;
END $$;

-- 5. Update any null timestamps
UPDATE public."Users2" 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE public."Users2" 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- 6. Enable Row Level Security
ALTER TABLE public."Users2" ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if any and create new ones
DROP POLICY IF EXISTS "Users can read their own profile" ON public."Users2";
DROP POLICY IF EXISTS "Users can update their own profile" ON public."Users2";

CREATE POLICY "Users can read their own profile"
  ON public."Users2" FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public."Users2" FOR UPDATE
  USING (auth.uid() = id);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS Users2_email_idx ON public."Users2"(email);
CREATE INDEX IF NOT EXISTS Users2_created_at_idx ON public."Users2"(created_at);

-- 9. Verify the final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'Users2' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

