-- ============================================================================
-- FIX: Agregar columnas faltantes a orders
-- ============================================================================

-- Agregar km si no existe
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS km BIGINT;

-- Agregar notes si no existe (para reemplazar internal_notes)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Agregar delivery_date si no existe
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMPTZ;

-- ============================================================================
-- FIX: Agregar columnas faltantes a vehicles
-- ============================================================================

-- Agregar km a vehicles
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS km BIGINT;

-- ============================================================================
-- Verificar estructura final
-- ============================================================================
SELECT 
  table_name, 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name IN ('vehicles', 'orders', 'order_items', 'clients')
ORDER BY table_name, ordinal_position;