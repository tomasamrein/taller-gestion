import { supabase } from '../lib/supabase'

// Traer todos los clientes ordenados por fecha de creación (los más nuevos primero)
export const getClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Crear un nuevo cliente
export const createClient = async (clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([clientData])
    .select()
  
  if (error) throw error
  return data
}