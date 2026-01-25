import { supabase } from '../lib/supabase'

// --- GASTOS ---
export const getExpenses = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export const createExpense = async (expense) => {
  const { error } = await supabase.from('expenses').insert([{
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    date: new Date().toISOString().split('T')[0]
  }])
  if (error) throw error
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

// ESTA FALTABA (Borrar producto)
export const deleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

// ESTA TAMBIÉN (Actualizar stock con los botones + y -)
export const updateStock = async (id, newStock) => {
  const { error } = await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', id)
  if (error) throw error
}