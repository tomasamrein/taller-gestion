import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateStock } from '../../services/managementService'
import { AlertTriangle, Plus, Package } from 'lucide-react'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newProd, setNewProd] = useState({ name: '', brand: '', stock: 0, sale_price: 0 })

  useEffect(() => { load() }, [])

  const load = async () => { setProducts(await getProducts()) }

  const handleCreate = async (e) => {
    e.preventDefault()
    await createProduct(newProd)
    setIsModalOpen(false)
    load()
  }

  const handleStockChange = async (id, current, amount) => {
    const newStock = Math.max(0, current + amount)
    await updateStock(id, newStock)
    load() // Recarga "optimista"
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Package /> Control de Stock
        </h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Producto</th>
              <th className="p-4">Marca</th>
              <th className="p-4">Precio Venta</th>
              <th className="p-4 text-center">Stock</th>
              <th className="p-4 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-gray-500">{p.brand}</td>
                <td className="p-4 text-green-600 font-bold">${p.sale_price}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => handleStockChange(p.id, p.stock, -1)} className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold hover:bg-red-200">-</button>
                    <span className="w-8 text-center font-mono text-lg">{p.stock}</span>
                    <button onClick={() => handleStockChange(p.id, p.stock, 1)} className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold hover:bg-green-200">+</button>
                  </div>
                </td>
                <td className="p-4 text-center">
                  {p.stock <= p.min_stock ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                      <AlertTriangle size={12} /> REPONER
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Simple para crear (puedes mejorarlo visualmente despues) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg w-96 space-y-4">
            <h2 className="text-xl font-bold">Nuevo Repuesto</h2>
            <input placeholder="Nombre (ej: Filtro Aceite)" className="border p-2 w-full rounded" onChange={e => setNewProd({...newProd, name: e.target.value})} required />
            <input placeholder="Marca" className="border p-2 w-full rounded" onChange={e => setNewProd({...newProd, brand: e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Stock Inicial" className="border p-2 rounded" onChange={e => setNewProd({...newProd, stock: e.target.value})} />
              <input type="number" placeholder="Precio Venta" className="border p-2 rounded" onChange={e => setNewProd({...newProd, sale_price: e.target.value})} />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-500 font-medium">Cancelar</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}