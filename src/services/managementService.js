import { supabase } from '../lib/supabase'
import { logAction } from './auditService'

export const getExpenses = async () => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching expenses:', error.message)
    return { data: [], error: error.message }
  }
}

export const createExpense = async (expense, userRole, userName) => {
  try {
    const isAdmin = userRole === 'admin'
    const initialStatus = isAdmin ? 'approved' : 'pending'

    const { error } = await supabase.from('expenses').insert([{
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: new Date().toISOString().split('T')[0],
      status: initialStatus
    }])
    
    if (error) throw error

    if (isAdmin) {
      await logAction(userName, 'GASTO_DIRECTO', `Registró: ${expense.description} ($${expense.amount})`, 'warning')
    } else {
      await logAction(userName, 'SOLICITUD_GASTO', `Solicitó autorización para: ${expense.description} ($${expense.amount})`, 'warning')
    }
    
    return { error: null }
  } catch (error) {
    console.error('Error creating expense:', error.message)
    return { error: error.message }
  }
}

export const approveExpense = async (id, isApproved, userName) => {
  try {
    if (isApproved) {
      await supabase.from('expenses').update({ status: 'approved' }).eq('id', id)
      await logAction(userName, 'APROBAR_GASTO', `Aprobó el gasto ID ${id}`)
    } else {
      await supabase.from('expenses').delete().eq('id', id)
      await logAction(userName, 'RECHAZAR_GASTO', `Rechazó y eliminó el gasto ID ${id}`, 'error')
    }
    return { error: null }
  } catch (error) {
    console.error('Error approving expense:', error.message)
    return { error: error.message }
  }
}

export const deleteExpense = async (id) => {
  try {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting expense:', error.message)
    return { error: error.message }
  }
}

export const getSuppliers = async () => {
  try {
    const { data, error } = await supabase.from('suppliers').select('*').order('name')
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching suppliers:', error.message)
    return { data: [], error: error.message }
  }
}

export const createSupplier = async (supplier) => {
  try {
    const { error } = await supabase.from('suppliers').insert([supplier])
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error creating supplier:', error.message)
    return { error: error.message }
  }
}

export const deleteSupplier = async (id) => {
  try {
    const { error } = await supabase.from('suppliers').delete().eq('id', id)
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting supplier:', error.message)
    return { error: error.message }
  }
}

export const getProducts = async () => {
  try {
    const { data, error } = await supabase.from('products').select('*').order('name')
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching products:', error.message)
    return { data: [], error: error.message }
  }
}

export const createProduct = async (product) => {
  try {
    const newProduct = {
      name: product.name,
      stock: Number(product.stock),
      price: Number(product.price),
      min_stock: Number(product.min_stock || 5)
    }

    const { error } = await supabase.from('products').insert([newProduct])
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error creating product:', error.message)
    return { error: error.message }
  }
}

export const deleteProduct = async (id) => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting product:', error.message)
    return { error: error.message }
  }
}

export const updateStock = async (id, newStock) => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', id)
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error updating stock:', error.message)
    return { error: error.message }
  }
}
