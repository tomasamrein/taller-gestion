import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateStock, deleteProduct } from '../../services/managementService'
import { Package, AlertTriangle, Plus, Trash2 } from 'lucide-react'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [newProd, setNewProd] = useState({ name: '', stock: '', min_stock: 5, price: '' })

  useEffect(() => { load() }, [])
  const load = async () => { setProducts(await getProducts()) }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newProd.name) return
    await createProduct(newProd)
    setNewProd({ name: '', stock: '', min_stock: 5, price: '' })
    load()
  }

  const handleDelete = async (id) => {
    if(confirm('¿Borrar producto?')) { await deleteProduct(id); load(); }
  }

  const handleStock = async (id, current, amount) => {
    const newStock = current + amount
    if (newStock < 0) return
    await updateStock(id, newStock)
    load()
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto animate-fade-in">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Package className="text-orange-600" /> Control de Inventario
      </h1>

      {/* Formulario Naranja */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 mb-8">
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full">
            <label className="text-xs font-bold text-gray-500 uppercase">Producto / Repuesto</label>
            <input className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} placeholder="Ej: Filtro de Aceite" />
          </div>
          <div className="w-24">
            <label className="text-xs font-bold text-gray-500 uppercase">Stock</label>
            <input type="number" className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50" value={newProd.stock} onChange={e => setNewProd({...newProd, stock: e.target.value})} />
          </div>
          <div className="w-24 hidden sm:block">
            <label className="text-xs font-bold text-gray-500 uppercase">Mínimo</label>
            <input type="number" className="border p-2 rounded w-full focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50" value={newProd.min_stock} onChange={e => setNewProd({...newProd, min_stock: e.target.value})} />
          </div>
          <button className="bg-orange-600 text-white px-6 py-2.5 rounded font-bold hover:bg-orange-700 transition w-full md:w-auto shadow-md flex justify-center items-center gap-2">
            <Plus size={18} /> <span className="md:hidden">Agregar</span>
          </button>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-4">Producto</th>
              <th className="p-4 text-center">Stock Actual</th>
              <th className="p-4 text-center hidden sm:table-cell">Mínimo</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => {
              const isLow = p.stock <= p.min_stock
              return (
                <tr key={p.id} className={`hover:bg-gray-50 transition ${isLow ? 'bg-red-50' : ''}`}>
                  <td className="p-4">
                    <div className="font-bold text-gray-700">{p.name}</div>
                    {isLow && <div className="text-red-500 text-xs flex items-center gap-1 mt-1 font-bold"><AlertTriangle size={12}/> Stock Bajo</div>}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleStock(p.id, p.stock, -1)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center">-</button>
                      <span className={`font-mono font-bold text-lg ${isLow ? 'text-red-600' : 'text-gray-800'}`}>{p.stock}</span>
                      <button onClick={() => handleStock(p.id, p.stock, 1)} className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold flex items-center justify-center">+</button>
                    </div>
                  </td>
                  <td className="p-4 text-center text-gray-500 hidden sm:table-cell">{p.min_stock}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-gray-300 hover:text-red-500 p-2 transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}