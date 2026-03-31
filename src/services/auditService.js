import { supabase } from '../lib/supabase'

export const logAction = async (userName, action, details, status = 'info') => {
  try {
    // Get user full name from users table if available
    let displayName = userName || 'Sistema'
    
    if (userName && userName !== 'Sistema') {
      // Try to get the full name from users table
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('auth_id', userName)
        .single()
      
      if (userData?.full_name) {
        displayName = userData.full_name
      }
    }

    const { error } = await supabase.from('audit_logs').insert([{
      user_name: displayName,
      action,
      details,
      status
    }])
    
    if (error) {
      console.error('Error logging action:', error.message)
    }
  } catch (error) {
    console.error('Error in logAction:', error.message)
  }
}

export const getAuditLogs = async () => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching audit logs:', error.message)
    return { data: [], error: error.message }
  }
}
