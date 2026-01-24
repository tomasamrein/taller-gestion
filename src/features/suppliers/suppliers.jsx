import { useEffect, useState } from 'react'
import { getSuppliers, createSupplier, deleteSupplier } from '../../services/managementService'
import { Truck, Phone, MessageCircle, Trash2, Plus, User } from 'lucide-react'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Ahora el estado incluye teléfono y categoría
  const [newSup, setNewSup] = useState({ name: '', phone: '', category: '' })

  useEffect(() => { load() }, [])
  const load = async () => { setSuppliers(await getSuppliers()) }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newSup.name) return alert('El nombre es obligatorio')
    
    await createSupplier(newSup)
    setNewSup({ name: '', phone: '', category: '' }) // Limpiar form
    setIsModalOpen(false)
    load()
  }

  const handleDelete = async (id) => {
    if (confirm('¿Dejar de trabajar con este proveedor?')) {
      await deleteSupplier(id)
      load()
    }
  }

  // Funciones de Contacto Rápido
  const handleCall = (phone) => {
    if (!phone) return alert('No tiene número cargado')
    window.location.href = `tel:${phone}`
  }

  const handleWhatsApp = (phone, name) => {
    if (!phone) return alert('No tiene número cargado')
    
    // Limpieza de número para WPP
    let num = phone.replace(/\D/g, '')
    if (!num.startsWith('54')) num = '549' + num
    
    const url = `https://wa.me/${num}?text=Hola ${name}, te escribo del Taller Mecánico.`
    window.open(url, '_blank')
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Truck className="text-blue-600" /> Directorio de Proveedores
          </h1>
          <p className="text-gray-500 mt-1">Gestioná tus contactos de repuestos e insumos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 shadow-lg transition transform hover:-translate-y-0.5"
        >
          <Plus size={20} /> Nuevo Proveedor
        </button>
      </div>

      {/* GRILLA DE TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400 text-lg">No tenés proveedores agendados.</p>
            </div>
        ) : (
            suppliers.map(sup => (
            <div key={sup.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between h-48 group">
                {/* Info Principal */}
                <div>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                            {sup.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg leading-tight">{sup.name}</h3>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{sup.category || 'General'}</span>
                        </div>
                    </div>
                    {/* Botón Borrar (Invisible hasta hacer hover) */}
                    <button 
                        onClick={() => handleDelete(sup.id)} 
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                        title="Eliminar Proveedor"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
                
                {/* Datos de contacto */}
                <div className="mt-4 pl-13">
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                        <Phone size={14} /> {sup.phone || 'Sin teléfono'}
                    </p>
                </div>
                </div>

                {/* Botonera de Acción */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                    <button 
                        onClick={() => handleCall(sup.phone)}
                        className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 flex items-center justify-center gap-2 transition"
                    >
                        <Phone size={16} /> Llamar
                    </button>
                    <button 
                        onClick={() => handleWhatsApp(sup.phone, sup.name)}
                        className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg font-medium text-sm hover:bg-green-100 flex items-center justify-center gap-2 transition"
                    >
                        <MessageCircle size={16} /> WhatsApp
                    </button>
                </div>
            </div>
            ))
        )}
      </div>

      {/* MODAL PARA AGREGAR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreate} className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >✕</button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User /> Nuevo Proveedor
            </h2>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Empresa / Vendedor</label>
                    <input 
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Ej: Repuestos Santa Fe"
                        value={newSup.name} 
                        onChange={e => setNewSup({...newSup, name: e.target.value})} 
                        autoFocus
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / Celular</label>
                    <input 
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Ej: 342 123 4567"
                        type="tel"
                        value={newSup.phone} 
                        onChange={e => setNewSup({...newSup, phone: e.target.value})} 
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rubro / Categoría</label>
                    <input 
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Ej: Baterías, Lubricentro..."
                        value={newSup.category} 
                        onChange={e => setNewSup({...newSup, category: e.target.value})} 
                    />
                </div>

                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition mt-2 shadow-lg">
                    Guardar Contacto
                </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}