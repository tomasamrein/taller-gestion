import { supabase } from '../lib/supabase'

// LOGIN: Verifica si existe usuario y contraseña
export const loginUser = async (username, password) => {
  // 1. Buscamos en la tabla CORRECTA (app_users)
  const { data, error } = await supabase
    .from('app_users') 
    .select('*')
    .eq('username', username)
    .eq('password', password) // O como estés validando la pass
    .single()

  if (error) throw new Error('Usuario no encontrado')

  // 2. ACÁ ESTÁ EL TRUCO: Mapeamos 'full_name' a 'name'
  const userAdapter = {
    id: data.id,
    // La base tiene 'full_name', pero la app espera 'name'. Hacemos el puente:
    name: data.full_name, 
    role: data.role,
    username: data.username
  }

  // 3. Guardamos este objeto adaptado (con 'name' correcto)
  localStorage.setItem('user_session', JSON.stringify(userAdapter))
  
  return userAdapter
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