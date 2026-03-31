-- Primero ver qué datos hay en order_items
SELECT oi.id, oi.order_id, o.id as actual_order_id, o.status
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.id IS NULL;

-- Ver si hay orders en work_orders
SELECT COUNT(*) as total FROM work_orders;

-- Ver si hay orders en orders  
SELECT COUNT(*) as total FROM orders;