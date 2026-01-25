import { supabase } from '../lib/supabase'

// --- ESTA FALTABA (CREAR NUEVA ORDEN) ---
export const createOrder = async (order) => {
  const { error } = await supabase.from('work_orders').insert([{
    vehicle_id: order.vehicle_id,
    description: order.description,
    status: 'pendiente' // Arranca siempre pendiente
  }])
  if (error) throw error
}

// Traer órdenes activas (pendientes, en proceso o en revisión)
export const getActiveOrders = async () => {
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      vehicles (
        brand, model, year, patent,
        clients ( full_name, phone )
      )
    `)
    .neq('status', 'finalizado') // Trae todo lo que NO esté finalizado
    .order('updated_at', { ascending: false })
  
  if (error) console.error(error)
  return data || []
}

// Traer órdenes finalizadas (para el dashboard y la caja)
export const getFinishedOrdersWithItems = async () => {
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      vehicles ( brand, model ),
      order_items ( * )
    `)
    .eq('status', 'finalizado')
    .order('delivery_date', { ascending: false })

  if (error) console.error(error)
  return data || []
}

// CAMBIAR ESTADO (Aprobaciones y flujo de trabajo)
export const updateOrderStatus = async (id, status) => {
  // Si finalizamos, guardamos la fecha de entrega. Si no, solo actualizamos el status.
  const updates = { 
    status, 
    updated_at: new Date().toISOString() 
  }

  if (status === 'finalizado') {
    updates.delivery_date = new Date().toISOString()
  }

  const { error } = await supabase
    .from('work_orders')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}

// FUNCIONES DE ITEMS (Repuestos y Mano de Obra)
export const getOrderItems = async (orderId) => {
  const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId)
  return data || []
}

export const addOrderItem = async (item) => {
  const { error } = await supabase.from('order_items').insert([item])
  if (error) throw error
}

export const deleteOrderItem = async (id) => {
    const { error } = await supabase.from('order_items').delete().eq('id', id)
    if (error) throw error
}