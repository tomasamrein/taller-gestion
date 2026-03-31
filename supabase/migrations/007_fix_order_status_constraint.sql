-- Fix status constraint to include all valid statuses
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check CHECK (
  status IN ('pendiente', 'en_progreso', 'esperando', 'revision', 'finalizado', 'entregado')
);

-- Verify current data
SELECT id, status FROM public.orders ORDER BY created_at DESC LIMIT 10;