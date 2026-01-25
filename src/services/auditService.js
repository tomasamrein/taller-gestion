import { supabase } from '../lib/supabase'

// Función para registrar acciones
export const logAction = async (userName, action, details, status = 'info') => {
  await supabase.from('audit_logs').insert([{
    user_name: userName || 'Sistema',
    action,
    details,
    status
  }])
}

// Función para leer el historial (Solo Admin)
export const getAuditLogs = async () => {
  const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)
  return data
}