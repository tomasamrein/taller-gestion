import { supabase } from '../lib/supabase'
import { createUserProfile } from './userService'

export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password: password
  })

  if (error) {
    throw new Error(error.message || 'Credenciales inválidas')
  }

  if (!data.user) {
    throw new Error('Usuario no encontrado')
  }

  const userAdapter = {
    id: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
    role: data.user.user_metadata?.role || 'empleado',
    taller_id: data.user.user_metadata?.taller_id || null
  }

  return userAdapter
}

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.email.split('@')[0],
    role: user.user_metadata?.role || 'empleado',
    taller_id: user.user_metadata?.taller_id || null
  }
}

export const createUser = async ({ email, password, fullName, role = 'empleado' }) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password: password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          taller_id: null
        }
      }
    })

    if (error) {
      throw new Error(error.message || 'Error al crear usuario')
    }

    if (data.user) {
      await createUserProfile({
        authId: data.user.id,
        email: email.toLowerCase().trim(),
        fullName,
        role
      })
    }

    return { data: data.user, error: null }
  } catch (error) {
    console.error('Error creating user:', error.message)
    return { error: error.message }
  }
}

export const deleteUser = async (userId) => {
  console.log('deleteUser called with:', userId)
  return { error: 'Eliminación de usuarios requiere configuración adicional de Supabase. Contacta al administrador.' }
}

export const updateUserRole = async (userId, newRole) => {
  console.log('updateUserRole called with:', userId, newRole)
  return { error: 'Actualización de roles requiere configuración adicional de Supabase. Contacta al administrador.' }
}
