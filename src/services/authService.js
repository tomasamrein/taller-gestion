import { supabase } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

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

export const getUsers = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No hay sesión activa')
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/list-users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Error al obtener usuarios')
    }

    return { data: result.users || [], error: null }
  } catch (error) {
    console.error('Error fetching users:', error.message)
    return { data: [], error: error.message }
  }
}

export const createUser = async ({ email, password, fullName, role = 'empleado' }) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No hay sesión activa')
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ email, password, fullName, role })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Error al crear usuario')
    }

    return { data: result.user, error: null }
  } catch (error) {
    console.error('Error creating user:', error.message)
    return { error: error.message }
  }
}

export const deleteUser = async (userId) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No hay sesión activa')
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/delete-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Error al eliminar usuario')
    }

    return { error: null }
  } catch (error) {
    console.error('Error deleting user:', error.message)
    return { error: error.message }
  }
}

export const updateUserRole = async (userId, newRole) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No hay sesión activa')
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/update-user-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId, role: newRole })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Error al actualizar rol')
    }

    return { error: null }
  } catch (error) {
    console.error('Error updating user role:', error.message)
    return { error: error.message }
  }
}
