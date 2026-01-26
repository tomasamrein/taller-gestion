import { supabase } from '../lib/supabase'

export const getInventory = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) console.error('Error cargando inventario:', error)
  return data || []
}

export const createProduct = async (product) => {
  // Aseguramos que los números sean números
  const newProduct = {
    name: product.name,
    stock: Number(product.stock),
    price: Number(product.price),
    min_stock: Number(product.min_stock || 5)
  }

  const { error } = await supabase.from('products').insert([newProduct])
  if (error) throw error
}

export const updateProductStock = async (id, newStock) => {
  const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id)
  if (error) throw error
}

export const deleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}