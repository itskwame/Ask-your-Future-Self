/*
  # Add Demographics and Enhanced Context Support

  ## Purpose
  Enable hyper-personalized AI responses by collecting key demographic information
  and detailed context for each goal category. This allows Future Self to provide
  truly tailored guidance based on the user's specific situation.

  ## Changes to user_profiles
  Add demographic fields collected during registration:
  - `age` (integer) - User's age
  - `gender` (text) - User's gender identity
  - `location` (text) - User's location (city/country)
  
  ## Changes to plans table
  Add fields to store context-specific information gathered during plan creation:
  - `context_data` (jsonb) - Stores category-specific details (fitness level, 
    career history, relationship situation, financial status, etc.)

  ## Security
  All tables already have RLS enabled. No changes needed.

  ## Notes
  - Demographics are optional but help personalize responses
  - Context data structure varies by goal category (health, career, relationships, etc.)
  - All data is stored as JSONB for flexibility
*/

-- Add demographics to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'age'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN age integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'gender'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN gender text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN location text DEFAULT '';
  END IF;
END $$;

-- Add context data to plans table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plans' AND column_name = 'context_data'
  ) THEN
    ALTER TABLE plans ADD COLUMN context_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;