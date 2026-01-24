import { supabase } from '../lib/supabase'

// Buscar autos de UN cliente específico
export const getVehiclesByClient = async (clientId) => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('client_id', clientId) // El filtro mágico
  
  if (error) throw error
  return data
}

// Crear auto nuevo
export const createVehicle = async (vehicleData) => {
  const { data, error } = await supabase
    .from('vehicles')
    .insert([vehicleData])
    .select()
  
  if (error) throw error
  return data
}

// (Opcional) Borrar auto por si te equivocas
export const deleteVehicle = async (vehicleId) => {
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', vehicleId)
    
  if (error) throw error
}