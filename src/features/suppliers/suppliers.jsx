import { useEffect, useState } from 'react'
import { getSuppliers, createSupplier } from '../../services/managementService'
import { Truck, Phone } from 'lucide-react'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [newName, setNewName] = useState('')

  useEffect(() => { load() }, [])
  const load = async () => { setSuppliers(await getSuppliers()) }

  const handleAdd = async () => {
    if(!newName) return
    await createSupplier({ name: newName, category: 'General' })
    setNewName('')
    load()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Truck /> Proveedores</h1>
      
      <div className="flex gap-4 mb-8">
        <input placeholder="Nombre del nuevo proveedor..." className="flex-1 border p-3 rounded-lg shadow-sm" value={newName} onChange={e => setNewName(e.target.value)} />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-700">Agregar</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map(sup => (
          <div key={sup.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{sup.name}</h3>
              <p className="text-gray-500 text-sm">{sup.category}</p>
            </div>
            <button className="text-blue-600 bg-blue-50 p-2 rounded-full hover:bg-blue-100">
              <Phone size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}