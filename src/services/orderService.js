import { supabase } from '../lib/supabase'

export const createOrder = async (order) => {
  const { data, error } = await supabase.from('work_orders')
    .insert([{
      vehicle_id: order.vehicle_id,
      description: order.description,
      status: 'pendiente' 
    }])
    .select() 
  
  if (error) throw error
  return data
}

export const getActiveOrders = async () => {
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      vehicles (
        *,
        clients ( * ) 
      )
    `)
    .neq('status', 'finalizado')
    .order('updated_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }
  return data || []
}

// --- CAMBIO: Paginación Inteligente ---
export const getFinishedOrdersWithItems = async (page = null, limit = 30) => {
  let query = supabase
    .from('work_orders')
    .select(`
      *,
      vehicles (
        *,
        clients ( * )
      ),
      order_items ( * )
    `)
    .eq('status', 'finalizado')
    .order('updated_at', { ascending: false }) 

  // Si nos pasan número de página (desde el Tablero), limitamos los resultados.
  // Si no nos pasan (desde el Dashboard), trae todo para armar los gráficos.
  if (page !== null && page !== undefined) {
      const from = page * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
  }

  const { data, error } = await query;
  if (error) console.error(error)
  return data || []
}

export const updateOrderStatus = async (id, status) => {
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

// FUNCIONES DE ITEMS
export const getOrderItems = async (orderId) => {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    
  if (error) console.error(error)
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

export const updateOrderItem = async (id, updates) => {
  const { error } = await supabase
    .from('order_items')
    .update(updates)
    .eq('id', id)
  
  if (error) throw error
}