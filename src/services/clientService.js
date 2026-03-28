import { supabase } from '../lib/supabase'

export const getClients = async () => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching clients:', error.message)
    return { data: [], error: error.message }
  }
}

export const createClient = async (client) => {
  try {
    const payload = {
      name: client.name,
      lastname: client.lastname,
      phone: client.phone,
      email: client.email,
      cuil: client.cuil,
      full_name: `${client.name} ${client.lastname}`.trim() 
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([payload])
      .select()

    if (error) throw error
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Error creating client:', error.message)
    return { data: null, error: error.message }
  }
}

export const deleteClient = async (id) => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting client:', error.message)
    return { error: error.message }
  }
}
