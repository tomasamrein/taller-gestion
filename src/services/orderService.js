import { supabase } from '../lib/supabase'

export const getActiveOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        vehicles (
          *,
          clients ( * ) 
        )
      `)
      .neq('status', 'finalizado')
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching active orders:', error.message)
    return { data: [], error: error.message }
  }
}

export const getFinishedOrdersWithItems = async (page = null, limit = 30) => {
  try {
    let query = supabase
      .from('orders')
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

    if (page !== null && page !== undefined) {
      const from = page * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching finished orders:', error.message)
    return { data: [], error: error.message }
  }
}

export const createOrder = async (order) => {
  try {
    const payload = {
      vehicle_id: order.vehicle_id,
      description: order.description,
      status: 'pendiente'
    }
    
    if (order.km) {
      payload.km = Number(order.km)
    }
    
    if (order.notes) {
      payload.notes = order.notes
    }

    const { data, error } = await supabase.from('orders')
      .insert([payload])
      .select() 
    
    if (error) throw error
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Error creating order:', error.message)
    return { data: null, error: error.message }
  }
}

export const updateOrderStatus = async (id, status) => {
  try {
    const updates = { 
      status, 
      updated_at: new Date().toISOString() 
    }

    if (status === 'finalizado') {
      updates.delivery_date = new Date().toISOString()
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error updating order status:', error.message)
    return { error: error.message }
  }
}

export const getOrderItems = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching order items:', error.message)
    return { data: [], error: error.message }
  }
}

export const addOrderItem = async (item) => {
  try {
    const { error } = await supabase.from('order_items').insert([item])
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error adding order item:', error.message)
    return { error: error.message }
  }
}

export const deleteOrderItem = async (id) => {
  try {
    const { error } = await supabase.from('order_items').delete().eq('id', id)
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting order item:', error.message)
    return { error: error.message }
  }
}

export const updateOrderItem = async (id, updates) => {
  try {
    const { error } = await supabase
      .from('order_items')
      .update(updates)
      .eq('id', id)
    
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error updating order item:', error.message)
    return { error: error.message }
  }
}
