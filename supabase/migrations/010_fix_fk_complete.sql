-- ============================================================================
-- Fix completo: Primero DROP, luego DELETE, luego ADD
-- ============================================================================

-- 1. Eliminar la foreign key que apunta a work_orders
ALTER TABLE public.order_items 
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

-- 2. Ver qué order_ids en order_items no existen en orders
SELECT order_id, COUNT(*) as cantidad 
FROM order_items 
WHERE order_id NOT IN (SELECT id FROM orders)
GROUP BY order_id;

-- 3. Eliminar esos registros huérfanos
DELETE FROM order_items 
WHERE order_id NOT IN (SELECT id FROM orders);

-- 4. Crear nueva foreign key apuntando a orders
ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- 5. Verificar
SELECT 
  (SELECT COUNT(*) FROM order_items) as items_total,
  (SELECT COUNT(*) FROM orders) as orders_total;