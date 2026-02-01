import { supabase } from '../lib/supabase'
import { logAction } from './auditService'

// --- GASTOS ---
export const getExpenses = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export const createExpense = async (expense, userRole, userName) => {
  // 1. Decidir estado según el rol
  const isAdmin = userRole === 'admin'
  const initialStatus = isAdmin ? 'approved' : 'pending'

  const { error } = await supabase.from('expenses').insert([{
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    date: new Date().toISOString().split('T')[0], // Fecha de hoy
    status: initialStatus
  }])
  if (error) throw error

  // 2. LOGUEAR ACCIÓN DETALLADA (Acá estaba lo que querías cambiar)
  if (isAdmin) {
      // Si es Admin, se registra directamente
      await logAction(userName, 'GASTO_DIRECTO', `Registró: ${expense.description} ($${expense.amount})`, 'warning')
  } else {
      // Si es Empleado, queda registrado que fue una SOLICITUD
      await logAction(userName, 'SOLICITUD_GASTO', `Solicitó autorización para: ${expense.description} ($${expense.amount})`, 'warning')
  }
}

// Función para que el Admin apruebe/rechace
export const approveExpense = async (id, isApproved, userName) => {
    if (isApproved) {
        await supabase.from('expenses').update({ status: 'approved' }).eq('id', id)
        await logAction(userName, 'APROBAR_GASTO', `Aprobó el gasto ID ${id}`)
    } else {
        await supabase.from('expenses').delete().eq('id', id) // Si rechaza, lo borramos
        await logAction(userName, 'RECHAZAR_GASTO', `Rechazó y eliminó el gasto ID ${id}`, 'error')
    }
}

export const deleteExpense = async (id) => {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

// --- PROVEEDORES ---
export const getSuppliers = async () => {
  const { data, error } = await supabase.from('suppliers').select('*').order('name')
  if (error) throw error
  return data
}

export const createSupplier = async (supplier) => {
  const { error } = await supabase.from('suppliers').insert([supplier])
  if (error) throw error
}

export const deleteSupplier = async (id) => {
  const { error } = await supabase.from('suppliers').delete().eq('id', id)
  if (error) throw error
}

// --- PRODUCTOS / INVENTARIO ---
export const getProducts = async () => {
  const { data, error } = await supabase.from('products').select('*').order('name')
  if (error) throw error
  return data
}

export const createProduct = async (product) => {
  const { error } = await supabase.from('products').insert([product])
  if (error) throw error
}

export const deleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export const updateStock = async (id, newStock) => {
  const { error } = await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', id)
  if (error) throw error
}