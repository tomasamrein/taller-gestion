import { supabase } from '../lib/supabase'

export const getInventory = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error loading inventory:', error.message)
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

export const updateProductStock = async (id, newStock) => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', id)
    
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error updating product stock:', error.message)
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
