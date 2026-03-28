import { useEffect, useState, useCallback, useMemo } from 'react'
import { getClients, createClient, deleteClient, updateClient, getClientVehicles } from '../../services/clientService'
import VehicleManager from '../vehicles/vehicleManager'
import { useDebounce } from '../../hooks/useDebounce'
import { Trash2, Car, UserPlus, Search, Phone, Mail, FileText, MessageCircle, User, X, Check, Edit2, Gauge } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ClientList() {
  const [clients, setClients] = useState([])
  const [vehiclesByClient, setVehiclesByClient] = useState({})
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  
  const [newClient, setNewClient] = useState({ name: '', lastname: '', phone: '', email: '', cuil: '' })
  const [editForm, setEditForm] = useState({ name: '', lastname: '', phone: '', email: '', cuil: '' })
  const [selectedClient, setSelectedClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const fetchClients = useCallback(async () => {
    try {
      const { data, error } = await getClients()
      if (error) throw new Error(error)
      setClients(data)
      
      const vehiclesPromises = (data || []).map(async (client) => {
        const { data: vehicles } = await getClientVehicles(client.id)
        return { clientId: client.id, vehicles: vehicles || [] }
      })
      
      const vehiclesResults = await Promise.all(vehiclesPromises)
      const vehiclesMap = {}
      vehiclesResults.forEach(({ clientId, vehicles }) => {
        vehiclesMap[clientId] = vehicles
      })
      setVehiclesByClient(vehiclesMap)
    } catch (error) { 
      console.error(error)
      toast.error('Error al cargar clientes')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newClient.name) return toast.error('El nombre es obligatorio')
    
    const { error } = await createClient(newClient)
    if (error) {
      toast.error('Error al guardar cliente')
      return
    }
    
    toast.success('Cliente creado!')
    setNewClient({ name: '', lastname: '', phone: '', email: '', cuil: '' })
    setIsModalOpen(false)
    fetchClients()
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editForm.name) return toast.error('El nombre es obligatorio')
    
    const { error } = await updateClient(editingClient.id, editForm)
    if (error) {
      toast.error('Error al actualizar')
      return
    }
    
    toast.success('Cliente actualizado!')
    setEditingClient(null)
    fetchClients()
  }

  const startEdit = (client) => {
    setEditingClient(client)
    setEditForm({
      name: client.name || client.full_name?.split(' ')[0] || '',
      lastname: client.lastname || client.full_name?.split(' ').slice(1).join(' ') || '',
      phone: client.phone || '',
      email: client.email || '',
      cuil: client.cuil || ''
    })
  }

  const handleDelete = async (client) => {
    const vehicleCount = vehiclesByClient[client.id]?.length || 0
    const mensaje = vehicleCount > 0 
      ? `¿Eliminar a ${client.name || client.full_name}? Tiene ${vehicleCount} vehículo${vehicleCount > 1 ? 's' : ''} cargados.`
      : `¿Eliminar a ${client.name || client.full_name}?`
    
    if (window.confirm(mensaje)) {
      const { error } = await deleteClient(client.id)
      if (error) {
        toast.error('Error al eliminar cliente')
        return
      }
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

  const filteredClients = useMemo(() => {
    if (!debouncedSearchTerm) return clients
    
    const term = debouncedSearchTerm.toLowerCase()
    return clients.filter(c => {
      const fullName = `${c.name || ''} ${c.lastname || ''} ${c.full_name || ''}`.toLowerCase() 
      
      const clientVehicles = vehiclesByClient[c.id] || []
      const patents = clientVehicles.map(v => v.patent?.toLowerCase() || '').join(' ')
      const brands = clientVehicles.map(v => `${v.brand || ''} ${v.model || ''}`.toLowerCase()).join(' ')
      
      return (
        fullName.includes(term) || 
        (c.phone && c.phone.includes(term)) ||
        (c.cuil && c.cuil.includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        patents.includes(term) ||
        brands.includes(term)
      )
    })
  }, [clients, vehiclesByClient, debouncedSearchTerm])

  const inputClasses = "w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50 focus:bg-white transition text-gray-700"
  const labelClasses = "block text-xs font-bold text-gray-500 uppercase mb-1.5"

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in pb-24"> 
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <UserPlus className="text-orange-600" /> Clientes
            </h1>
            <p className="text-gray-500 text-sm mt-1">{clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="Buscar por nombre, patente, auto..."
                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none shadow-sm text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1">
                    <X size={14} />
                  </button>
                )}
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-orange-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-orange-700 shadow-lg transition flex items-center gap-2 whitespace-nowrap"
            >
                <UserPlus size={20} /> <span className="hidden sm:inline">Nuevo</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4 hidden md:table-cell">Contacto</th>
                <th className="p-4 hidden lg:table-cell">Vehículos</th>
                <th className="p-4 text-right">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredClients.length > 0 ? (
                    filteredClients.map((client) => {
                      const clientVehicles = vehiclesByClient[client.id] || []
                      return (
                      <tr key={client.id} className="hover:bg-orange-50/50 transition group">
                          <td className="p-3 md:p-5">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold border border-slate-200 uppercase shrink-0">
                                      {(client.name || client.full_name || '?').charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                      <p className="font-bold text-gray-800 capitalize truncate">
                                          {client.name} {client.lastname}
                                          {!client.name && client.full_name} 
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        {client.phone && (
                                          <p className="text-xs text-gray-500 flex items-center gap-1">
                                              <Phone size={10} /> {client.phone}
                                          </p>
                                        )}
                                        {client.cuil && (
                                          <p className="text-[10px] text-gray-400 font-mono">{client.cuil}</p>
                                        )}
                                      </div>
                                  </div>
                              </div>
                          </td>

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

                          <td className="p-5 hidden lg:table-cell">
                            {clientVehicles.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {clientVehicles.map(v => (
                                  <span key={v.id} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                    <Car size={12} /> {v.patent || v.brand}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-300 text-sm">Sin vehículos</span>
                            )}
                          </td>

                          <td className="p-3 md:p-5 text-right">
                              <div className="flex justify-end gap-1 md:gap-2">
                                  <button 
                                      onClick={() => setSelectedClient(client)} 
                                      className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700 font-medium text-sm flex items-center gap-1 shadow-md active:scale-95 transition"
                                      title="Ver Vehículos"
                                  >
                                      <Car size={16} /> <span className="hidden md:inline">Autos</span>
                                      {clientVehicles.length > 0 && (
                                        <span className="bg-white/20 px-1.5 rounded text-xs">{clientVehicles.length}</span>
                                      )}
                                  </button>
                                  
                                  <button 
                                      onClick={() => startEdit(client)}
                                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                                      title="Editar"
                                  >
                                      <Edit2 size={16} />
                                  </button>
                                  
                                  <button 
                                      onClick={() => handleDelete(client)} 
                                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          </td>
                      </tr>
                    )})
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

      {editingClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <form onSubmit={handleUpdate} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-blue-600 text-white p-5 flex justify-between items-center border-b-4 border-blue-400 shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-3">
                    <Edit2 className="text-white" size={24} /> Editar Cliente
                </h2>
                <button type="button" onClick={() => setEditingClient(null)} className="text-blue-100 hover:text-white transition bg-blue-700 p-2 rounded-full hover:bg-blue-500">
                    <X size={20} />
                </button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-gray-50 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClasses}>Nombre *</label>
                        <input className={inputClasses} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClasses}>Apellido</label>
                        <input className={inputClasses} value={editForm.lastname} onChange={e => setEditForm({...editForm, lastname: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClasses}><Phone size={14} className="inline mr-1"/> Teléfono / Celular</label>
                        <input type="tel" className={inputClasses} value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClasses}><Mail size={14} className="inline mr-1"/> Email</label>
                        <input type="email" className={inputClasses} value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClasses}><FileText size={14} className="inline mr-1"/> CUIL / CUIT</label>
                        <input className={inputClasses} value={editForm.cuil} onChange={e => setEditForm({...editForm, cuil: e.target.value})} />
                    </div>
                </div>
            </div>

            <div className="p-5 bg-white border-t border-gray-100 shrink-0 flex justify-end gap-4">
                <button type="button" onClick={() => setEditingClient(null)} className="px-6 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg flex items-center gap-2">
                    <Check size={18} /> Guardar Cambios
                </button>
            </div>
          </form>
        </div>
      )}

      {selectedClient && <VehicleManager client={selectedClient} onClose={() => setSelectedClient(null)} />}
    </div>
  )
}
