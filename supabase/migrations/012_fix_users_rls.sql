-- Fix RLS for users table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_all" ON public.users;
DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON public.users;
DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_insert" ON public.users;
DROP POLICY IF EXISTS "users_update" ON public.users;
DROP POLICY IF EXISTS "users_delete" ON public.users;

-- Create new policy that allows all operations for authenticated users
CREATE POLICY "users_all" ON public.users FOR ALL USING (auth.role() = 'authenticated');

-- Also fix RLS for audit_logs
DROP POLICY IF EXISTS "audit_log_all" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_log_select" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_log_insert" ON public.audit_logs;

CREATE POLICY "audit_log_all" ON public.audit_logs FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;