import { supabase } from '../lib/supabase'

export const getClients = async () => {
  // Traemos todos los datos de la tabla 'clients'
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
    
  if (error) throw error
  return data
}

export const createClient = async (client) => {
  // Preparamos el objeto para enviar a la base de datos
  // Si tu base usa 'full_name' en lugar de name/lastname separados, avísame y cambiamos esto.
  // Por ahora asumo que corriste el SQL y tenés 'name' y 'lastname'.
  
  const payload = {
    name: client.name,
    lastname: client.lastname,
    phone: client.phone,
    email: client.email,
    cuil: client.cuil,
    // Creamos un full_name automático por si algún componente viejo lo usa
    full_name: `${client.name} ${client.lastname}`.trim() 
  }

  const { data, error } = await supabase
    .from('clients')
    .insert([payload])
    .select()

  if (error) {
    console.error("Error Supabase:", error.message) // Esto nos ayuda a ver el error real en consola
    throw error
  }
  return data
}

export const deleteClient = async (id) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) throw error
}