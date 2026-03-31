-- ============================================================================
-- TALLER GESTIÓN - SQL COMPLETO PARA SUPABASE
-- Ejecutar en SQL Editor de Supabase
-- ============================================================================

-- 1. VERIFICAR Y CORREGIR ESTRUCTURA DE vehicles
-- ============================================================================

-- Ver si client_id es uuid y convertir a bigint si es necesario
ALTER TABLE public.vehicles 
ALTER COLUMN client_id TYPE BIGINT USING client_id::bigint;

-- 2. VERIFICAR Y CORREGIR ESTRUCTURA DE clients
-- ============================================================================
-- Si clients tiene id como uuid, convertir a bigint
-- Primero verificar el tipo actual:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'clients' AND column_name = 'id';

-- 3. CREAR POLÍTICAS RLS PARA TODAS LAS TABLAS
-- ============================================================================

-- Tabla clients
DROP POLICY IF EXISTS "clients_select" ON public.clients;
DROP POLICY IF EXISTS "clients_insert" ON public.clients;
DROP POLICY IF EXISTS "clients_update" ON public.clients;
DROP POLICY IF EXISTS "clients_delete" ON public.clients;
CREATE POLICY "clients_all" ON public.clients FOR ALL USING (auth.role() = 'authenticated');

-- Tabla vehicles
DROP POLICY IF EXISTS "vehicles_select" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_insert" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_update" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_delete" ON public.vehicles;
CREATE POLICY "vehicles_all" ON public.vehicles FOR ALL USING (auth.role() = 'authenticated');

-- Tabla orders
DROP POLICY IF EXISTS "orders_select" ON public.orders;
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_update" ON public.orders;
DROP POLICY IF EXISTS "orders_delete" ON public.orders;
CREATE POLICY "orders_all" ON public.orders FOR ALL USING (auth.role() = 'authenticated');

-- Tabla order_items
DROP POLICY IF EXISTS "order_items_select" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
DROP POLICY IF EXISTS "order_items_update" ON public.order_items;
DROP POLICY IF EXISTS "order_items_delete" ON public.order_items;
CREATE POLICY "order_items_all" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');

-- Tabla expenses
DROP POLICY IF EXISTS "expenses_select" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete" ON public.expenses;
CREATE POLICY "expenses_all" ON public.expenses FOR ALL USING (auth.role() = 'authenticated');

-- Tabla inventory
DROP POLICY IF EXISTS "inventory_select" ON public.inventory;
DROP POLICY IF EXISTS "inventory_insert" ON public.inventory;
DROP POLICY IF EXISTS "inventory_update" ON public.inventory;
DROP POLICY IF EXISTS "inventory_delete" ON public.inventory;
CREATE POLICY "inventory_all" ON public.inventory FOR ALL USING (auth.role() = 'authenticated');

-- Tabla suppliers
DROP POLICY IF EXISTS "suppliers_select" ON public.suppliers;
DROP POLICY IF EXISTS "suppliers_insert" ON public.suppliers;
DROP POLICY IF EXISTS "suppliers_update" ON public.suppliers;
DROP POLICY IF EXISTS "suppliers_delete" ON public.suppliers;
CREATE POLICY "suppliers_all" ON public.suppliers FOR ALL USING (auth.role() = 'authenticated');

-- Tabla audit_log
DROP POLICY IF EXISTS "audit_log_select" ON public.audit_log;
DROP POLICY IF EXISTS "audit_log_insert" ON public.audit_log;
CREATE POLICY "audit_log_all" ON public.audit_log FOR ALL USING (auth.role() = 'authenticated');

-- Tabla users
DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_insert" ON public.users;
DROP POLICY IF EXISTS "users_update" ON public.users;
DROP POLICY IF EXISTS "users_delete" ON public.users;
CREATE POLICY "users_all" ON public.users FOR ALL USING (auth.role() = 'authenticated');

-- 4. OTORGAR PERMISOS
-- ============================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. VERIFICACIÓN
-- ============================================================================
SELECT 'Tablas verificadas: ' || count(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';