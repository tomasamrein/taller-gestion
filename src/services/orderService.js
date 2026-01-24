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