-- ============================================================================
-- Fix: Migrar order_items de work_orders a orders
-- ============================================================================

-- 1. Ver cuántos registros hay en cada tabla
SELECT 'work_orders' as table_name, COUNT(*) as total FROM work_orders
UNION ALL
SELECT 'orders' as table_name, COUNT(*) as total FROM orders
UNION ALL
SELECT 'order_items' as table_name, COUNT(*) as total FROM order_items;

-- 2. Verificar si los order_id en order_items existen en work_orders o orders
SELECT 
  oi.id,
  oi.order_id,
  wo.id as exists_in_work_orders,
  o.id as exists_in_orders
FROM order_items oi
LEFT JOIN work_orders wo ON oi.order_id = wo.id
LEFT JOIN orders o ON oi.order_id = o.id
WHERE wo.id IS NULL AND o.id IS NULL;