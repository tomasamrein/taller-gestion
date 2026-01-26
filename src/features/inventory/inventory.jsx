import { useEffect, useState } from 'react'
import { getInventory, createProduct, deleteProduct, updateProductStock } from '../../services/inventoryService'
import { Package, Plus, Search, Trash2, AlertTriangle, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [newProd, setNewProd] = useState({ name: '', stock: '', price: '', min_stock: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    const data = await getInventory()
    setProducts(data)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newProd.name || !newProd.price) return toast.error('Nombre y Precio obligatorios')

    setLoading(true)
    try {
        await createProduct(newProd)
        toast.success('Producto agregado 📦')
        setNewProd({ name: '', stock: '', price: '', min_stock: '' }) // Limpiar form
        load() // Recargar lista
    } catch (error) {
        console.error(error)
        toast.error('Error al crear producto')
    } finally {
        setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('¿Borrar este producto?')) {
        await deleteProduct(id)
        toast.success('Producto eliminado')
        load()
    }
  }

  const handleStockChange = async (id, currentStock, change) => {
    const newStock = Math.max(0, currentStock + change)
    await updateProductStock(id, newStock)
    load()
  }

  // Filtramos por buscador
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto animate-fade-in">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Package className="text-orange-600" /> Control de Stock
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* FORMULARIO DE CARGA */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 h-fit">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-orange-600"/> Nuevo Producto
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Nombre del Repuesto</label>
                    <input className="border p-2 rounded w-full bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} placeholder="Ej: Filtro de Aceite" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Stock Inicial</label>
                        <input type="number" className="border p-2 rounded w-full bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500" value={newProd.stock} onChange={e => setNewProd({...newProd, stock: e.target.value})} placeholder="0" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Mínimo</label>
                        <input type="number" className="border p-2 rounded w-full bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500" value={newProd.min_stock} onChange={e => setNewProd({...newProd, min_stock: e.target.value})} placeholder="5" />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Precio de Venta ($)</label>
                    <input type="number" className="border p-2 rounded w-full bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500" value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} placeholder="15000" />
                </div>
                
                <button disabled={loading} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-orange-600 transition shadow-lg disabled:opacity-50">
                    {loading ? 'Guardando...' : 'Agregar al Inventario'}
                </button>
            </form>
        </div>

        {/* LISTA DE PRODUCTOS */}
        <div className="md:col-span-2 space-y-4">
            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500 transition" 
                    placeholder="Buscar repuesto..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
                            <tr>
                                <th className="p-4">Producto</th>
                                <th className="p-4 text-center">Stock</th>
                                <th className="p-4 text-right">Precio</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredProducts.map(p => (
                                <tr key={p.id} className="hover:bg-orange-50 transition group">
                                    <td className="p-4">
                                        <p className="font-bold text-gray-800">{p.name}</p>
                                        {p.stock <= p.min_stock && (
                                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mt-1">
                                                <AlertTriangle size={10} /> Stock Bajo
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleStockChange(p.id, p.stock, -1)} className="w-6 h-6 bg-gray-100 rounded text-gray-600 hover:bg-red-100 hover:text-red-600 font-bold">-</button>
                                            <span className={`font-mono font-bold w-8 text-center ${p.stock <= p.min_stock ? 'text-red-600' : 'text-slate-700'}`}>{p.stock}</span>
                                            <button onClick={() => handleStockChange(p.id, p.stock, 1)} className="w-6 h-6 bg-gray-100 rounded text-gray-600 hover:bg-green-100 hover:text-green-600 font-bold">+</button>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-bold text-slate-600">
                                        ${p.price.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => handleDelete(p.id)} className="text-gray-300 hover:text-red-500 transition">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-400">No se encontraron productos.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}