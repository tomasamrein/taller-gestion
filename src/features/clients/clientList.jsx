import { useEffect, useState } from 'react'
import { getClients, createClient, deleteClient } from '../../services/clientService'
import VehicleManager from '../vehicles/vehicleManager'
import { Trash2, Car, UserPlus, Search } from 'lucide-react'
import toast from 'react-hot-toast' // <--- IMPORTAR TOAST

export default function ClientList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [newClient, setNewClient] = useState({ full_name: '', phone: '', dni: '' })
  const [selectedClient, setSelectedClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('') // <--- ESTADO PARA BÚSQUEDA

  useEffect(() => { fetchClients() }, [])

  const fetchClients = async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newClient.full_name) return toast.error('El nombre es obligatorio') // <--- ERROR LINDO
    
    // Promesa con notificación de carga
    await toast.promise(
        createClient(newClient),
        {
            loading: 'Guardando cliente...',
            success: '¡Cliente creado con éxito!',
            error: 'Error al guardar.',
        }
    )
    setNewClient({ full_name: '', phone: '', dni: '' })
    fetchClients()
  }

  const handleDelete = async (id) => {
    if (window.confirm('⚠ ¿Estás seguro de borrar este cliente?')) {
      await deleteClient(id)
      toast.success('Cliente eliminado') // <--- EXITO LINDO
      fetchClients()
    }
  }

  // LÓGICA DE FILTRADO
  const filteredClients = clients.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  )

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <UserPlus className="text-orange-600" /> Gestión de Clientes
      </h1>

      {/* FORMULARIO DE CARGA */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full">
            <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
            <input className="border p-2 rounded w-full bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none" value={newClient.full_name} onChange={(e) => setNewClient({...newClient, full_name: e.target.value})} />
          </div>
          <div className="w-full md:w-1/3">
            <label className="text-xs font-bold text-gray-500 uppercase">Teléfono</label>
            <input className="border p-2 rounded w-full bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none" value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone: e.target.value})} />
          </div>
          <button className="bg-orange-600 text-white px-6 py-2.5 rounded font-bold hover:bg-orange-700 transition w-full md:w-auto shadow-md">Guardar</button>
        </form>
      </div>

      {/* BARRA DE BÚSQUEDA NUEVA */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-400" size={20} />
        </div>
        <input 
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-3 lg:p-4">Nombre</th>
              <th className="p-3 lg:p-4">Teléfono</th>
              <th className="p-3 lg:p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                    <td className="p-3 lg:p-4 font-bold text-gray-700">{client.full_name}</td>
                    <td className="p-3 lg:p-4 text-gray-500 text-sm">{client.phone || '-'}</td>
                    <td className="p-3 lg:p-4 text-right flex justify-end gap-2">
                    <button onClick={() => setSelectedClient(client)} className="text-orange-600 bg-orange-50 px-3 py-1 rounded hover:bg-orange-100 font-medium text-sm flex items-center gap-1">
                        <Car size={18} /> <span className="hidden sm:inline">Autos</span>
                    </button>
                    <button onClick={() => handleDelete(client.id)} className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded transition">
                        <Trash2 size={18} />
                    </button>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="3" className="p-8 text-center text-gray-400">
                        No se encontraron clientes con "{searchTerm}"
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedClient && <VehicleManager client={selectedClient} onClose={() => setSelectedClient(null)} />}
    </div>
  )
}