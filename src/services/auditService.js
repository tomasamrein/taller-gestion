import { supabase } from '../lib/supabase'

export const logAction = async (userName, action, details, status = 'info') => {
  try {
    const { error } = await supabase.from('audit_logs').insert([{
      user_name: userName || 'Sistema',
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
      .limit(100)
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching audit logs:', error.message)
    return { data: [], error: error.message }
  }
}
