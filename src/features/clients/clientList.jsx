import { useEffect, useState } from 'react'
import { getClients, createClient, deleteClient } from '../../services/clientService'
import VehicleManager from '../vehicles/vehicleManager'
import { Trash2, Car, UserPlus } from 'lucide-react'

export default function ClientList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [newClient, setNewClient] = useState({ full_name: '', phone: '', dni: '' })
  const [selectedClient, setSelectedClient] = useState(null)

  useEffect(() => { fetchClients() }, [])

  const fetchClients = async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newClient.full_name) return alert('El nombre es obligatorio')
    await createClient(newClient)
    setNewClient({ full_name: '', phone: '', dni: '' })
    fetchClients()
  }

  const handleDelete = async (id) => {
    if (window.confirm('⚠ ATENCIÓN: Se borrará el cliente y TODOS sus datos.\n¿Confirmar?')) {
      await deleteClient(id)
      fetchClients()
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <UserPlus className="text-orange-600" /> Gestión de Clientes
      </h1>

      {/* Formulario Naranja */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full">
            <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
            <input 
              className="border p-2 rounded w-full bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none" 
              value={newClient.full_name} 
              onChange={(e) => setNewClient({...newClient, full_name: e.target.value})} 
            />
          </div>
          <div className="w-full md:w-1/3">
            <label className="text-xs font-bold text-gray-500 uppercase">Teléfono</label>
            <input 
              className="border p-2 rounded w-full bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none" 
              value={newClient.phone} 
              onChange={(e) => setNewClient({...newClient, phone: e.target.value})} 
            />
          </div>
          <button className="bg-orange-600 text-white px-6 py-2.5 rounded font-bold hover:bg-orange-700 transition w-full md:w-auto shadow-md">
            Guardar
          </button>
        </form>
      </div>

      {/* Tabla Responsive */}
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
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="p-3 lg:p-4 font-bold text-gray-700">{client.full_name}</td>
                <td className="p-3 lg:p-4 text-gray-500 text-sm">{client.phone || '-'}</td>
                <td className="p-3 lg:p-4 text-right flex justify-end gap-2">
                  {/* Botón Autos: En celu solo ícono, en PC ícono + texto */}
                  <button onClick={() => setSelectedClient(client)} className="text-orange-600 bg-orange-50 px-2 lg:px-3 py-1 rounded hover:bg-orange-100 font-medium text-xs lg:text-sm flex items-center gap-1 transition">
                    <Car size={18} /> <span className="hidden sm:inline">Autos</span>
                  </button>
                  {/* Botón Borrar */}
                  <button onClick={() => handleDelete(client.id)} className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded transition">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedClient && <VehicleManager client={selectedClient} onClose={() => setSelectedClient(null)} />}
    </div>
  )
}