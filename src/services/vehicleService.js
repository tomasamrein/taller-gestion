import { supabase } from '../lib/supabase'

export const getVehiclesByClient = async (clientId) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('client_id', clientId)
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching vehicles:', error.message)
    return { data: [], error: error.message }
  }
}

export const createVehicle = async (vehicleData) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicleData])
      .select()
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Error creating vehicle:', error.message)
    return { data: null, error: error.message }
  }
}

export const deleteVehicle = async (vehicleId) => {
  try {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)
    
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting vehicle:', error.message)
    return { error: error.message }
  }
}
