import { useEffect, useState } from 'react'
import { getClients, createClient, deleteClient } from '../../services/clientService'
import VehicleManager from '../vehicles/vehicleManager'
import { Trash2, Car, UserPlus, Search, Phone, Mail, FileText, MessageCircle, User, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ClientList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Estado para el formulario con los campos nuevos
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
            error: 'Error al guardar. Verificá la conexión.',
        }
    )
    
    // Limpiamos el formulario
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

  // Lógica de filtrado: Busca por Nombre, Apellido, Teléfono o CUIL
  const filteredClients = clients.filter(c => {
    const term = searchTerm.toLowerCase()
    // Armamos un string con todo para buscar fácil
    const fullName = `${c.name || ''} ${c.lastname || ''} ${c.full_name || ''}`.toLowerCase() 
    return (
        fullName.includes(term) || 
        (c.phone && c.phone.includes(term)) ||
        (c.cuil && c.cuil.includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term))
    )
  })

  // Estilos reutilizables
  const inputClasses = "w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50 focus:bg-white transition text-gray-700"
  const labelClasses = "block text-xs font-bold text-gray-500 uppercase mb-1.5"

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <UserPlus className="text-orange-600" /> Gestión de Clientes
            </h1>
            <p className="text-gray-500 text-sm mt-1">Administrá los dueños de los vehículos.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="Buscar cliente..."
                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-700 shadow-lg transition flex items-center gap-2 whitespace-nowrap"
            >
                <UserPlus size={20} /> <span className="hidden sm:inline">Nuevo Cliente</span>
            </button>
        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                <th className="p-5">Cliente</th>
                <th className="p-5">Contacto</th>
                <th className="p-5 hidden md:table-cell">Datos Fiscales</th>
                <th className="p-5 text-right">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-orange-50/50 transition group">
                        {/* NOMBRE (Sin ID) */}
                        <td className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold border border-slate-200 uppercase">
                                    {(client.name || client.full_name || '?').charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-lg capitalize">
                                        {client.name} {client.lastname}
                                        {/* Fallback para clientes viejos que solo tienen full_name */}
                                        {!client.name && client.full_name} 
                                    </p>
                                    {/* Aquí antes estaba el ID, ahora está limpio */}
                                </div>
                            </div>
                        </td>

                        {/* CONTACTO */}
                        <td className="p-5">
                            <div className="flex flex-col gap-1.5">
                                {client.phone ? (
                                    <div className="flex items-center gap-2">
                                        <a href={`tel:${client.phone}`} className="text-gray-600 hover:text-orange-600 font-medium text-sm flex items-center gap-2 transition" title="Llamar">
                                            <Phone size={14} /> {client.phone}
                                        </a>
                                        <button onClick={() => handleWhatsApp(client.phone)} className="text-green-500 hover:text-green-600 bg-green-50 p-1 rounded-full transition" title="WhatsApp">
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

                        {/* DATOS FISCALES (CUIL) */}
                        <td className="p-5 hidden md:table-cell">
                            {client.cuil ? (
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-mono border border-gray-200 inline-flex items-center gap-2">
                                    <FileText size={14} className="text-gray-400"/> {client.cuil}
                                </span>
                            ) : <span className="text-gray-300 text-sm">-</span>}
                        </td>

                        {/* BOTONES */}
                        <td className="p-5 text-right">
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => setSelectedClient(client)} 
                                    className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition transform active:scale-95"
                                >
                                    <Car size={16} /> <span className="hidden sm:inline">Autos</span>
                                </button>
                                <button 
                                    onClick={() => handleDelete(client.id)} 
                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                                    title="Eliminar Cliente"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" className="p-12 text-center text-gray-400">
                            <div className="flex flex-col items-center gap-3">
                                <Search size={40} className="text-gray-300" />
                                <p>No se encontraron clientes con "{searchTerm}"</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* MODAL NUEVO CLIENTE */}
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
                    {/* Nombre y Apellido */}
                    <div>
                        <label className={labelClasses}>Nombre *</label>
                        <input className={inputClasses} value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} autoFocus placeholder="Ej: Juan" />
                    </div>
                    <div>
                        <label className={labelClasses}>Apellido</label>
                        <input className={inputClasses} value={newClient.lastname} onChange={e => setNewClient({...newClient, lastname: e.target.value})} placeholder="Ej: Pérez" />
                    </div>

                    {/* Contacto */}
                    <div>
                        <label className={labelClasses}><Phone size={14} className="inline mr-1"/> Teléfono / Celular</label>
                        <input type="tel" className={inputClasses} value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} placeholder="342..." />
                    </div>
                    <div>
                        <label className={labelClasses}><Mail size={14} className="inline mr-1"/> Email</label>
                        <input type="email" className={inputClasses} value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} placeholder="cliente@email.com" />
                    </div>

                    {/* Fiscal */}
                    <div className="md:col-span-2">
                        <label className={labelClasses}><FileText size={14} className="inline mr-1"/> CUIL / CUIT</label>
                        <input className={inputClasses} value={newClient.cuil} onChange={e => setNewClient({...newClient, cuil: e.target.value})} placeholder="20-..." />
                    </div>
                </div>
            </div>

            <div className="p-5 bg-white border-t border-gray-100 shrink-0 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition">
                    Cancelar
                </button>
                <button className="px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition shadow-lg active:scale-95 transform flex items-center gap-2">
                    <Check size={18} /> Guardar Cliente
                </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE VEHÍCULOS (Se mantiene igual) */}
      {selectedClient && <VehicleManager client={selectedClient} onClose={() => setSelectedClient(null)} />}
    </div>
  )
}