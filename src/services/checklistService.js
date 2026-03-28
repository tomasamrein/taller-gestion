import { supabase } from '../lib/supabase'

export const getChecklistByOrderId = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('checklists')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle()
    
    if (error && error.code !== 'PGRST116') throw error
    return { data: data || null, error: null }
  } catch (error) {
    console.error('Error fetching checklist:', error.message)
    return { data: null, error: error.message }
  }
}

export const saveChecklist = async ({ order_id, values }) => {
  try {
    const { data: existing } = await supabase
      .from('checklists')
      .select('id')
      .eq('order_id', order_id)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('checklists')
        .update({ 
          values, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', existing.id)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('checklists')
        .insert([{ 
          order_id, 
          values,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
      
      if (error) throw error
    }
    
    return { error: null }
  } catch (error) {
    console.error('Error saving checklist:', error.message)
    return { error: error.message }
  }
}
