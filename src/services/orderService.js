import { supabase } from '../lib/supabase'

// Traer órdenes activas con TODOS los datos (Auto y Dueño)
export const getActiveOrders = async () => {
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      vehicles (
        brand, model, patent,
        clients (full_name, phone)
      )
    `)
    .neq('status', 'entregado') // Solo lo que está en el taller
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Crear una nueva orden (Ingresar auto)
export const createOrder = async (vehicleId, description) => {
  const { data, error } = await supabase
    .from('work_orders')
    .insert([{ 
      vehicle_id: vehicleId, 
      description: description,
      status: 'pendiente'
    }])
    .select()
  
  if (error) throw error
  return data
}

// Cambiar estado (De Pendiente -> En Proceso -> Finalizado)
export const updateOrderStatus = async (orderId, newStatus) => {
  const { error } = await supabase
    .from('work_orders')
    .update({ status: newStatus })
    .eq('id', orderId)
    
  if (error) throw error
}

// Agregar un item (Ej: Filtro $5000)
export const addOrderItem = async (item) => {
    const { error } = await supabase
      .from('order_items')
      .insert([item])
    if (error) throw error
  }
  
  // Traer los items de una orden específica
  export const getOrderItems = async (orderId) => {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
    if (error) throw error
    return data
  }
  
  // Traer TODAS las órdenes finalizadas con sus items para el gráfico
  export const getFinishedOrdersWithItems = async () => {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        id, 
        status, 
        delivery_date,
        order_items (unit_price, quantity)
      `)
      .eq('status', 'finalizado') // Solo lo cobrado cuenta
    
    if (error) throw error
    return data
  }