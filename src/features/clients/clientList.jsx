import { useEffect, useState } from 'react'
import { getClients, createClient, deleteClient } from '../../services/clientService'
import VehicleManager from '../vehicles/vehicleManager'
import { Trash2, Car, UserPlus, Search, Phone, Mail, FileText, MessageCircle, User, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ClientList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [newClient, setNewClient] = useState({ name: '', lastname: '', phone: '', email: '', cuil: '' })
  const [selectedClient, setSelectedClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { fetchClients() }, [])

  const fetchClients = async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (error) { 
        console.error(error)
        toast.error('Error al cargar clientes')
    } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newClient.name) return toast.error('El nombre es obligatorio')
    
    await toast.promise(
        createClient(newClient),
        {
            loading: 'Guardando cliente...',
            success: '¡Cliente creado con éxito!',
            error: 'Error al guardar.',
        }
    )
    
    setNewClient({ name: '', lastname: '', phone: '', email: '', cuil: '' })
    setIsModalOpen(false)
    fetchClients()
  }

  const handleDelete = async (id) => {
    if (window.confirm('⚠ ¿Estás seguro de borrar este cliente? Se borrarán sus autos también.')) {
      await deleteClient(id)
      toast.success('Cliente eliminado')
      fetchClients()
    }
  }

  const handleWhatsApp = (phone) => {
    if (!phone) return toast.error('Sin número')
    let num = phone.replace(/\D/g, '')
    if (num.startsWith('0')) num = num.substring(1)
    if (!num.startsWith('54')) num = '549' + num
    window.open(`https://wa.me/${num}`, '_blank')
  }

  const filteredClients = clients.filter(c => {
    const term = searchTerm.toLowerCase()
    const fullName = `${c.name || ''} ${c.lastname || ''} ${c.full_name || ''}`.toLowerCase() 
    return (
        fullName.includes(term) || 
        (c.phone && c.phone.includes(term)) ||
        (c.cuil && c.cuil.includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term))
    )
  })

  // Estilos
  const inputClasses = "w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50 focus:bg-white transition text-gray-700"
  const labelClasses = "block text-xs font-bold text-gray-500 uppercase mb-1.5"

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in pb-24"> 
      
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <UserPlus className="text-orange-600" /> Clientes
            </h1>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="Buscar..."
                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none shadow-sm text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-orange-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-orange-700 shadow-lg transition flex items-center gap-2 whitespace-nowrap"
            >
                <UserPlus size={20} /> <span className="hidden sm:inline">Nuevo</span>
            </button>
        </div>
      </div>

      {/* TABLA OPTIMIZADA PARA MÓVIL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                {/* En móvil esta columna ocupa casi todo */}
                <th className="p-4">Cliente</th>
                
                {/* Ocultamos Contacto y Fiscal en móvil, los metemos dentro de Cliente */}
                <th className="p-4 hidden md:table-cell">Contacto</th>
                <th className="p-4 hidden lg:table-cell">Datos Fiscales</th>
                
                <th className="p-4 text-right">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-orange-50/50 transition group">
                        
                        {/* COLUMNA 1: NOMBRE + (INFO MÓVIL) */}
                        <td className="p-3 md:p-5">
                            <div className="flex items-center gap-3">
                                {/* Avatar más chico en móvil */}
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold border border-slate-200 uppercase text-xs md:text-base shrink-0">
                                    {(client.name || client.full_name || '?').charAt(0)}
                                </div>
                                <div className="min-w-0"> {/* min-w-0 ayuda al truncate */}
                                    <p className="font-bold text-gray-800 text-sm md:text-lg capitalize truncate max-w-[140px] md:max-w-none leading-tight">
                                        {client.name} {client.lastname}
                                        {!client.name && client.full_name} 
                                    </p>
                                    
                                    {/* --- INFO EXTRA SOLO VISIBLE EN MÓVIL --- */}
                                    <div className="md:hidden mt-1 space-y-0.5">
                                        {client.phone && (
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Phone size={10} /> {client.phone}
                                            </p>
                                        )}
                                        {client.cuil && (
                                            <p className="text-[10px] text-gray-400">CUIL: {client.cuil}</p>
                                        )}
                                    </div>
                                    {/* -------------------------------------- */}
                                </div>
                            </div>
                        </td>

                        {/* COLUMNA 2: CONTACTO (Solo PC) */}
                        <td className="p-5 hidden md:table-cell">
                            <div className="flex flex-col gap-1.5">
                                {client.phone ? (
                                    <div className="flex items-center gap-2">
                                        <a href={`tel:${client.phone}`} className="text-gray-600 hover:text-orange-600 font-medium text-sm flex items-center gap-2 transition">
                                            <Phone size={14} /> {client.phone}
                                        </a>
                                        <button onClick={() => handleWhatsApp(client.phone)} className="text-green-500 bg-green-50 p-1 rounded-full hover:bg-green-100 transition">
                                            <MessageCircle size={14} />
                                        </button>
                                    </div>
                                ) : <span className="text-gray-400 text-sm italic">Sin teléfono</span>}

                                {client.email && (
                                    <a href={`mailto:${client.email}`} className="text-gray-500 hover:text-blue-600 text-sm flex items-center gap-2 transition truncate max-w-[200px]">
                                        <Mail size={14} /> {client.email}
                                    </a>
                                )}
                            </div>
                        </td>

                        {/* COLUMNA 3: FISCAL (Solo PC Grande) */}
                        <td className="p-5 hidden lg:table-cell">
                            {client.cuil ? (
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-mono border border-gray-200 inline-flex items-center gap-2">
                                    <FileText size={14} className="text-gray-400"/> {client.cuil}
                                </span>
                            ) : <span className="text-gray-300 text-sm">-</span>}
                        </td>

                        {/* COLUMNA 4: BOTONES */}
                        <td className="p-3 md:p-5 text-right">
                            <div className="flex justify-end gap-2">
                                {/* Botón Autos Compacto en Móvil */}
                                <button 
                                    onClick={() => setSelectedClient(client)} 
                                    className="bg-slate-800 text-white p-2 md:px-4 md:py-2 rounded-lg hover:bg-slate-700 font-medium text-sm flex items-center gap-2 shadow-md active:scale-95 transition"
                                    title="Ver Autos"
                                >
                                    <Car size={16} /> <span className="hidden md:inline">Autos</span>
                                </button>
                                
                                {/* Botón Borrar */}
                                <button 
                                    onClick={() => handleDelete(client.id)} 
                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                                >
                                    <Trash2 size={18} />
                                </button>
                                
                                {/* Botón WhatsApp Rápido (Solo Móvil) */}
                                <button 
                                    onClick={() => handleWhatsApp(client.phone)} 
                                    className="md:hidden text-green-600 bg-green-50 p-2 rounded-lg"
                                >
                                    <MessageCircle size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" className="p-12 text-center text-gray-400">
                           <p>No se encontraron clientes.</p>
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* MODAL NUEVO CLIENTE (Igual que antes) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b-4 border-orange-500 shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-3">
                    <UserPlus className="text-orange-500" size={24} /> Nuevo Cliente
                </h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition bg-slate-800 p-2 rounded-full hover:bg-slate-700">
                    <X size={20} />
                </button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-gray-50 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClasses}>Nombre *</label>
                        <input className={inputClasses} value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} autoFocus />
                    </div>
                    <div>
                        <label className={labelClasses}>Apellido</label>
                        <input className={inputClasses} value={newClient.lastname} onChange={e => setNewClient({...newClient, lastname: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClasses}><Phone size={14} className="inline mr-1"/> Teléfono / Celular</label>
                        <input type="tel" className={inputClasses} value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClasses}><Mail size={14} className="inline mr-1"/> Email</label>
                        <input type="email" className={inputClasses} value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClasses}><FileText size={14} className="inline mr-1"/> CUIL / CUIT</label>
                        <input className={inputClasses} value={newClient.cuil} onChange={e => setNewClient({...newClient, cuil: e.target.value})} />
                    </div>
                </div>
            </div>

            <div className="p-5 bg-white border-t border-gray-100 shrink-0 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
                <button className="px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition shadow-lg flex items-center gap-2">
                    <Check size={18} /> Guardar
                </button>
            </div>
          </form>
        </div>
      )}

      {selectedClient && <VehicleManager client={selectedClient} onClose={() => setSelectedClient(null)} />}
    </div>
  )
}