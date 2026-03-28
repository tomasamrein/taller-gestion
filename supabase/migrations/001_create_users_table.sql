-- Migration: Create users table for team management
-- Run this in Supabase SQL Editor (Project → SQL Editor)

-- Create users table to store team members
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'empleado' CHECK (role IN ('admin', 'empleado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies: anyone authenticated can read, only admin can write
CREATE POLICY "Users are viewable by authenticated users" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete users" ON public.users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
