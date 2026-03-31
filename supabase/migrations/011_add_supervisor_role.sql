-- Add Supervisor role to users table
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check CHECK (
  role IN ('supervisor', 'admin', 'empleado')
);

-- If existing users need to be migrated, update them:
-- UPDATE public.users SET role = 'supervisor' WHERE email = 'your-email@supervisor.com';

-- Add supervisor column to users if not exists
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS disabled BOOLEAN DEFAULT FALSE;