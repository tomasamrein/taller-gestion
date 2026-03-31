import { supabase } from '../lib/supabase'

export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching users:', error.message)
    return { data: [], error: error.message }
  }
}

export const createUserProfile = async ({ authId, email, fullName, role }) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        auth_id: authId,
        email: email.toLowerCase().trim(),
        full_name: fullName,
        role: role
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating user profile:', error.message)
    return { error: error.message }
  }
}

export const disableUser = async (authId) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ disabled: true, updated_at: new Date().toISOString() })
      .eq('auth_id', authId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error disabling user:', error.message)
    return { error: error.message }
  }
}

export const updateUserRole = async (authId, newRole) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('auth_id', authId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error updating user role:', error.message)
    return { error: error.message }
  }
}

export const getCurrentUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  } catch (error) {
    console.error('Error fetching user profile:', error.message)
    return null
  }
}
