-- Migration: Add disabled column to users table for soft delete
-- Run this in Supabase SQL Editor (Project → SQL Editor)

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS disabled BOOLEAN DEFAULT FALSE;

-- Update existing users to not be disabled
UPDATE public.users SET disabled = FALSE WHERE disabled IS NULL;

-- Index for filtering disabled users
CREATE INDEX IF NOT EXISTS idx_users_disabled ON public.users(disabled) WHERE disabled = TRUE;
