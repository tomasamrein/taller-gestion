-- ============================================================================
-- AGREGAR COLUMNAS FALTANTES A vehicles
-- ============================================================================

-- Agregar columna km
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS km BIGINT;

-- Verificar estructura actual
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vehicles' AND table_schema = 'public'
ORDER BY ordinal_position;