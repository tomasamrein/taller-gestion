import { useEffect, useState } from 'react'
import { getClients, createClient, deleteClient } from '../../services/clientService' // <--- Importamos deleteClient
import VehicleManager from '../vehicles/vehicleManager'
import { Trash2, Car, UserPlus } from 'lucide-react' // <--- Íconos nuevos

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

  // --- NUEVA FUNCIÓN DE BORRADO ---
  const handleDelete = async (id) => {
    if (window.confirm('⚠ ATENCIÓN: Si borras al cliente, se borrarán también sus autos y órdenes.\n¿Estás seguro?')) {
      try {
        await deleteClient(id)
        fetchClients() // Recargamos la lista
      } catch (error) {
        alert('Error al borrar cliente')
      }
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <UserPlus className="text-blue-600" /> Gestión de Clientes
      </h1>

      {/* Formulario */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full">
            <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
            <input className="border p-2 rounded w-full bg-gray-50" value={newClient.full_name} onChange={(e) => setNewClient({...newClient, full_name: e.target.value})} />
          </div>
          <div className="w-full md:w-1/3">
            <label className="text-xs font-bold text-gray-500 uppercase">Teléfono</label>
            <input className="border p-2 rounded w-full bg-gray-50" value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone: e.target.value})} />
          </div>
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded font-bold hover:bg-blue-700 transition w-full md:w-auto">
            Guardar
          </button>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-50 border-b text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Contacto</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-700">{client.full_name}</td>
                <td className="p-4 text-gray-500">{client.phone || '-'}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => setSelectedClient(client)} className="text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 font-medium text-sm flex items-center gap-1">
                    <Car size={16} /> Autos
                  </button>
                  {/* BOTÓN BORRAR */}
                  <button onClick={() => handleDelete(client.id)} className="text-red-500 bg-red-50 p-1.5 rounded hover:bg-red-100 transition" title="Borrar Cliente">
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