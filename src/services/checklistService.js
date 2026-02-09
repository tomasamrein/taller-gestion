import { supabase } from '../lib/supabase'

export const getChecklistByOrderId = async (orderId) => {
  const { data, error } = await supabase
    .from('checklists')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle() // Importante: usa maybeSingle para que no tire error si está vacío

  if (error) {
    console.error('Error trayendo chequeo:', error)
    // No lanzamos error (throw) para que no rompa la pantalla si es nuevo
    return null 
  }
  return data
}

export const saveChecklist = async (checklist) => {
  // ACÁ ESTABA EL ERROR: Faltaba decirle qué columna mirar para ver si ya existe
  const { data, error } = await supabase
    .from('checklists')
    .upsert(checklist, { onConflict: 'order_id' }) 
    .select()

  if (error) {
    console.error('Error guardando chequeo:', error)
    throw error
  }
  return data[0]
}