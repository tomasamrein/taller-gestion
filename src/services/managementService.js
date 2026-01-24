import { supabase } from '../lib/supabase'

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

// --- INVENTARIO ---
export const getProducts = async () => {
  // Traemos el producto Y el nombre del proveedor
  const { data, error } = await supabase
    .from('products')
    .select('*, suppliers(name)')
    .order('name')
  if (error) throw error
  return data
}

export const createProduct = async (product) => {
  const { error } = await supabase.from('products').insert([product])
  if (error) throw error
}

export const updateStock = async (id, newStock) => {
  const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id)
  if (error) throw error
}

// --- GASTOS ---
export const getExpenses = async () => {
  const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false })
  if (error) throw error
  return data
}

export const createExpense = async (expense) => {
  const { error } = await supabase.from('expenses').insert([expense])
  if (error) throw error
}