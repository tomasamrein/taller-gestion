-- Migration: Create user profiles for all existing auth users
-- This ensures all users in Supabase Auth have a profile in the public.users table

-- Insert users that exist in auth.users but not in public.users
INSERT INTO public.users (auth_id, email, full_name, role, disabled, created_at)
SELECT 
    au.id AS auth_id,
    au.email,
    COALESCE(au.user_metadata->>'full_name', split_part(au.email, '@', 1)) AS full_name,
    COALESCE(au.user_metadata->>'role', 'empleado') AS role,
    false AS disabled,
    au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.auth_id
WHERE pu.id IS NULL
ON CONFLICT (auth_id) DO NOTHING;

-- Verify the migration
SELECT 
    au.email,
    au.user_metadata->>'full_name' as metadata_name,
    au.user_metadata->>'role' as metadata_role,
    pu.id IS NOT null as has_profile,
    pu.full_name as profile_name,
    pu.role as profile_role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.auth_id
ORDER BY au.created_at DESC;