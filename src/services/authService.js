import { supabase } from '../lib/supabase'

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

  // Get role from users table (authoritative source)
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .select('role, full_name, disabled')
    .eq('auth_id', data.user.id)
    .single()

  if (profileData?.disabled) {
    await supabase.auth.signOut()
    throw new Error('Esta cuenta ha sido desactivada. Contacta al administrador.')
  }

  const metadata = data.user.user_metadata || {}
  const role = profileData?.role || metadata.role || 'empleado'
  const name = profileData?.full_name || metadata.full_name || data.user.email.split('@')[0]

  const userAdapter = {
    id: data.user.id,
    email: data.user.email,
    name: name,
    role: role,
    taller_id: metadata.taller_id || null
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
    console.log('Creating user:', { email, fullName, role })
    
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
      console.error('Supabase signUp error:', error)
      throw new Error(error.message || 'Error al crear usuario')
    }

    console.log('User created in auth:', data.user)

    if (data.user) {
      // Create profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          auth_id: data.user.id,
          email: email.toLowerCase().trim(),
          full_name: fullName,
          role: role,
          disabled: false
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // Don't fail the whole operation, just log it
      } else {
        console.log('User profile created successfully')
      }
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
