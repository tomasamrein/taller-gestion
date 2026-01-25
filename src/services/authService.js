import { supabase } from '../lib/supabase'

// LOGIN: Verifica si existe usuario y contraseña
export const loginUser = async (username, password) => {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single() // Esperamos solo uno

  if (error || !data) throw new Error('Usuario o contraseña incorrectos')
  return data
}

// GESTIÓN: Traer todos los empleados
export const getUsers = async () => {
  const { data, error } = await supabase.from('app_users').select('*').order('full_name')
  if (error) throw error
  return data
}

// GESTIÓN: Crear nuevo empleado
export const createUser = async (userData) => {
  const { error } = await supabase.from('app_users').insert([userData])
  if (error) throw error
}

// GESTIÓN: Borrar empleado
export const deleteUser = async (id) => {
  const { error } = await supabase.from('app_users').delete().eq('id', id)
  if (error) throw error
}