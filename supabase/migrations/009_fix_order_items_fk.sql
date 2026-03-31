-- ============================================================================
-- Fix: Corregir foreign key de order_items y migrate datos
-- ============================================================================

-- PRIMERO: Eliminar la foreign key que apunta a work_orders
ALTER TABLE public.order_items 
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

-- SEGUNDO: Verificar los datos antes de crear la nueva FK
SELECT 
  oi.id as item_id,
  oi.order_id,
  oi.description,
  wo.id as in_work_orders,
  o.id as in_orders
FROM order_items oi
LEFT JOIN work_orders wo ON oi.order_id = wo.id
LEFT JOIN orders o ON oi.order_id = o.id;

-- TERCERO: Los order_items que apuntan a orders que NO existen, eliminarlos
-- (Esto limpia registros huérfanos)
DELETE FROM order_items 
WHERE order_id NOT IN (SELECT id FROM orders)
AND order_id NOT IN (SELECT id FROM work_orders);

-- CUARTO: Crear la nueva foreign key apuntando a orders
ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- QUINTO: Verificar que todo esté bien
SELECT COUNT(*) as total_order_items FROM order_items;
SELECT COUNT(*) as total_orders FROM orders;