-- Diagnóstico de estructura de tablas
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name IN ('vehicles', 'orders', 'work_orders', 'order_items', 'clients')
ORDER BY table_name, ordinal_position;