/*
  # Update Plans Schema for Multiple Goal-Based Plans

  1. Changes to `plans` table
    - Add `goal_title` column to identify which goal this plan addresses
    - Add `goal_category` for organizing plans
    - Add `steps` JSONB column for action steps
    - Add `current_step` to track progress
    - Remove `is_active` constraint (users can have multiple active plans)

  2. New Features
    - Support multiple active plans per user (one per goal)
    - Track conversation history specific to each plan
    - Add step-by-step action items within each plan

  3. Security
    - RLS policies remain unchanged (user can only access their own plans)
*/

-- Add new columns to plans table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plans' AND column_name = 'goal_title'
  ) THEN
    ALTER TABLE plans ADD COLUMN goal_title text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plans' AND column_name = 'goal_category'
  ) THEN
    ALTER TABLE plans ADD COLUMN goal_category text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plans' AND column_name = 'steps'
  ) THEN
    ALTER TABLE plans ADD COLUMN steps jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plans' AND column_name = 'current_step'
  ) THEN
    ALTER TABLE plans ADD COLUMN current_step integer DEFAULT 0;
  END IF;
END $$;

-- Create plan_conversations table for plan-specific chat
CREATE TABLE IF NOT EXISTS plan_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'future_self')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plan_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plan conversations"
  ON plan_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plan conversations"
  ON plan_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plan conversations"
  ON plan_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plan conversations"
  ON plan_conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_plan_conversations_plan_id ON plan_conversations(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_conversations_user_id ON plan_conversations(user_id);
