import { useEffect, useState } from 'react'
import { getSuppliers, createSupplier, deleteSupplier } from '../../services/managementService'
import { Truck, Phone, MessageCircle, Trash2, Plus, User } from 'lucide-react'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSup, setNewSup] = useState({ name: '', phone: '', category: '' })

  useEffect(() => { load() }, [])
  const load = async () => { setSuppliers(await getSuppliers()) }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newSup.name) return alert('Nombre obligatorio')
    await createSupplier(newSup)
    setNewSup({ name: '', phone: '', category: '' })
    setIsModalOpen(false)
    load()
  }

  const handleDelete = async (id) => {
    if (confirm('¿Dejar de trabajar con este proveedor?')) {
      await deleteSupplier(id)
      load()
    }
  }

  const handleWhatsApp = (phone) => {
    if (!phone) return alert('Sin número')
    let num = phone.replace(/\D/g, '')
    if (!num.startsWith('54')) num = '549' + num
    window.open(`https://wa.me/${num}`, '_blank')
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Truck className="text-orange-600" /> Proveedores
          </h1>
          <p className="text-gray-500 mt-1 text-sm lg:text-base">Agenda de repuestos e insumos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-orange-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold hover:bg-orange-700 shadow-lg transition transform hover:-translate-y-0.5"
        >
          <Plus size={20} /> <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(sup => (
          <div key={sup.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 transition flex flex-col justify-between h-48 group relative">
            
            <button 
                onClick={() => handleDelete(sup.id)} 
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
            >
                <Trash2 size={18} />
            </button>

            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-lg border border-orange-100">
                        {sup.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{sup.name}</h3>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{sup.category || 'General'}</span>
                    </div>
                </div>
                <p className="text-gray-500 text-sm flex items-center gap-2 mt-4 pl-1">
                    <Phone size={14} /> {sup.phone || 'Sin contacto'}
                </p>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                <a href={`tel:${sup.phone}`} className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 flex items-center justify-center gap-2 transition">
                    <Phone size={16} /> Llamar
                </a>
                <button onClick={() => handleWhatsApp(sup.phone)} className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg font-medium text-sm hover:bg-green-100 flex items-center justify-center gap-2 transition border border-green-200">
                    <MessageCircle size={16} /> WhatsApp
                </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b-4 border-orange-500">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <User className="text-orange-500" /> Nuevo Proveedor
                </h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Empresa</label>
                    <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50" value={newSup.name} onChange={e => setNewSup({...newSup, name: e.target.value})} autoFocus />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
                    <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50" value={newSup.phone} onChange={e => setNewSup({...newSup, phone: e.target.value})} placeholder="342..." />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rubro</label>
                    <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50" value={newSup.category} onChange={e => setNewSup({...newSup, category: e.target.value})} placeholder="Repuestos..." />
                </div>
                <button className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition mt-2 shadow-lg">Guardar Contacto</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}