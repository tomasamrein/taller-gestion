-- ============================================================================
-- DIAGNÓSTICO: Ver estructura de las tablas
-- Ejecutar primero para ver qué tipos de datos tienen
-- ============================================================================

-- Ver estructura de clients
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver estructura de vehicles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vehicles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver estructura de orders
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver políticas actuales de vehicles
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'vehicles';