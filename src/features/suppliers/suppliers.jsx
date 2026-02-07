import { useEffect, useState } from 'react'
import { getSuppliers, createSupplier, deleteSupplier } from '../../services/managementService'
import { Truck, Phone, MessageCircle, Trash2, Plus, User, CreditCard, Mail, FileText, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSup, setNewSup] = useState({ name: '', phone: '', category: '', alias: '', cuil: '', email: '' })
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => { load() }, [])
  const load = async () => { setSuppliers(await getSuppliers()) }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newSup.name) return toast.error('El nombre es obligatorio')
    
    await createSupplier(newSup)
    toast.success('Proveedor guardado')
    
    setNewSup({ name: '', phone: '', category: '', alias: '', cuil: '', email: '' })
    setIsModalOpen(false)
    load()
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Dejar de trabajar con este proveedor?')) {
      await deleteSupplier(id)
      load()
      toast.success('Proveedor eliminado')
    }
  }

  const handleWhatsApp = (phone) => {
    if (!phone) return toast.error('No tiene número cargado')
    let num = phone.replace(/\D/g, '')
    if (num.startsWith('0')) num = num.substring(1)
    if (!num.startsWith('54')) num = '549' + num
    window.open(`https://wa.me/${num}`, '_blank')
  }

  const copyToClipboard = (text, id) => {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success('Alias copiado')
      setTimeout(() => setCopiedId(null), 2000)
  }

  // Clases comunes para los inputs y labels (para no repetir tanto)
  const inputClasses = "w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white transition text-gray-700 text-sm"
  const labelClasses = "block text-xs font-bold text-gray-600 uppercase mb-2 tracking-wide"

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* --- CABECERA Y LISTA (Igual que antes) --- */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Truck className="text-orange-600" /> Proveedores
          </h1>
          <p className="text-gray-500 mt-1 text-sm lg:text-base">Agenda de pagos, repuestos e insumos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-orange-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold hover:bg-orange-700 shadow-lg transition transform hover:-translate-y-0.5"
        >
          <Plus size={20} /> <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {suppliers.map(sup => (
          <div key={sup.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 transition flex flex-col justify-between h-auto group relative hover:shadow-md">
            <button 
                onClick={() => handleDelete(sup.id)} 
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                title="Eliminar"
            >
                <Trash2 size={18} />
            </button>

            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl border border-orange-200 shadow-inner">
                        {sup.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight truncate w-40">{sup.name}</h3>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                            {sup.category || 'General'}
                        </span>
                    </div>
                </div>

                <div className="space-y-2.5 mb-4">
                    {sup.alias && (
                        <div 
                            onClick={() => copyToClipboard(sup.alias, sup.id)}
                            className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer hover:bg-blue-100 transition border border-blue-100"
                            title="Click para copiar Alias"
                        >
                            <span className="flex items-center gap-2"><CreditCard size={14}/> {sup.alias}</span>
                            {copiedId === sup.id ? <Check size={14} /> : <Copy size={14} className="opacity-50"/>}
                        </div>
                    )}

                    <p className="text-gray-500 text-sm flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" /> 
                        {sup.phone ? sup.phone : <span className="text-gray-300 italic">Sin teléfono</span>}
                    </p>
                    
                    {sup.email && (
                        <a href={`mailto:${sup.email}`} className="text-gray-500 text-sm flex items-center gap-2 hover:text-orange-600 transition truncate">
                            <Mail size={14} className="text-gray-400" /> {sup.email}
                        </a>
                    )}
                    
                    {sup.cuil && (
                        <p className="text-gray-400 text-xs flex items-center gap-2 pl-0.5">
                            <FileText size={12} /> CUIL: {sup.cuil}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-50 mt-auto">
                <a 
                    href={sup.phone ? `tel:${sup.phone}` : '#'} 
                    className={`flex-1 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition ${!sup.phone ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-gray-50 text-gray-700 hover:bg-gray-200'}`}
                >
                    <Phone size={16} /> Llamar
                </a>
                <button 
                    onClick={() => handleWhatsApp(sup.phone)} 
                    className={`flex-1 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition border ${!sup.phone ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'}`}
                >
                    <MessageCircle size={16} /> WhatsApp
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL CORREGIDO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b-4 border-orange-500 shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-3">
                    <User className="text-orange-500" size={24} /> Nuevo Proveedor
                </h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition bg-slate-800 p-2 rounded-full hover:bg-slate-700">✕</button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre (Ocupa 2 columnas) */}
                    <div className="md:col-span-2">
                        <label className={labelClasses}>Nombre / Empresa *</label>
                        <input className={inputClasses} value={newSup.name} onChange={e => setNewSup({...newSup, name: e.target.value})} autoFocus placeholder="Ej: Repuestos El Tuerca" />
                    </div>
                    
                    {/* Rubro y Teléfono */}
                    <div>
                        <label className={labelClasses}>Rubro</label>
                        <input className={inputClasses} value={newSup.category} onChange={e => setNewSup({...newSup, category: e.target.value})} placeholder="Ej: Aceites y Filtros" />
                    </div>
                    <div>
                        <label className={labelClasses}><Phone size={14} className="inline mr-1"/> Teléfono / Celular</label>
                        <input type="tel" className={inputClasses} value={newSup.phone} onChange={e => setNewSup({...newSup, phone: e.target.value})} placeholder="Ej: 342 123456" />
                    </div>

                    {/* Alias (Ocupa 2 columnas y es azulcito) */}
                    <div className="md:col-span-2">
                        <label className={labelClasses + " text-blue-600 flex items-center gap-2"}><CreditCard size={16}/> Alias / CBU (Para pagos)</label>
                        <input className={inputClasses + " bg-blue-50/30 border-blue-200 focus:ring-blue-500 focus:border-blue-500"} value={newSup.alias} onChange={e => setNewSup({...newSup, alias: e.target.value})} placeholder="Ej: TALLER.GARCIA.MP" />
                    </div>

                    {/* Email y CUIL */}
                    <div>
                        <label className={labelClasses}><Mail size={14} className="inline mr-1"/> Email</label>
                        <input type="email" className={inputClasses} value={newSup.email} onChange={e => setNewSup({...newSup, email: e.target.value})} placeholder="contacto@empresa.com" />
                    </div>
                    <div>
                        <label className={labelClasses}><FileText size={14} className="inline mr-1"/> CUIL / CUIT</label>
                        <input className={inputClasses} value={newSup.cuil} onChange={e => setNewSup({...newSup, cuil: e.target.value})} placeholder="Ej: 20-12345678-9" />
                    </div>
                </div>
            </div>

            <div className="p-5 bg-white border-t border-gray-100 shrink-0 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition">
                    Cancelar
                </button>
                <button className="px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition shadow-lg active:scale-95 transform flex items-center gap-2">
                    <Check size={18} /> Guardar Contacto
                </button>
            </div>
          </form>
        </div>
      )}
      {/* Se eliminó el bloque <style jsx> */}
    </div>
  )
}