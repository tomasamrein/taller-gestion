-- Fix RLS for users table to allow all authenticated users to read
ALTER TABLE public.users DROP POLICY IF EXISTS "users_all" ON public.users;
CREATE POLICY "users_all" ON public.users FOR ALL USING (auth.role() = 'authenticated');

-- Also fix RLS for audit_logs
ALTER TABLE public.audit_logs DROP POLICY IF EXISTS "audit_log_all" ON public.audit_logs;
CREATE POLICY "audit_log_all" ON public.audit_logs FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;