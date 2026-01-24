import { useEffect, useState } from 'react'
import { getClients, createClient } from '../../services/clientService'
// CAMBIO 1: Importamos el componente de la ventanita (Modal)
import VehicleManager from '../vehicles/vehicleManager' 

export default function ClientList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [newClient, setNewClient] = useState({ full_name: '', phone: '', dni: '' })
  
  // CAMBIO 2: Creamos un estado para saber qué cliente estamos editando
  // Si es null, la ventana está cerrada. Si tiene datos, se abre.
  const [selectedClient, setSelectedClient] = useState(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (error) {
      console.error('Error cargando clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newClient.full_name) return alert('El nombre es obligatorio')

    try {
      await createClient(newClient)
      setNewClient({ full_name: '', phone: '', dni: '' })
      fetchClients()
    } catch (error) {
      alert('Error al crear cliente')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Clientes</h1>

      {/* Formulario de Carga Rápida */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-blue-600">Nuevo Cliente</h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Nombre Completo"
            className="border p-2 rounded w-full"
            value={newClient.full_name}
            onChange={(e) => setNewClient({...newClient, full_name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Teléfono / WhatsApp"
            className="border p-2 rounded w-full md:w-1/3"
            value={newClient.phone}
            onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
          />
           <input
            type="text"
            placeholder="DNI (Opcional)"
            className="border p-2 rounded w-full md:w-1/4"
            value={newClient.dni}
            onChange={(e) => setNewClient({...newClient, dni: e.target.value})}
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-bold">
            Guardar
          </button>
        </form>
      </div>

      {/* Lista de Clientes */}
      {loading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Nombre</th>
                <th className="p-4 font-semibold text-gray-600">Teléfono</th>
                <th className="p-4 font-semibold text-gray-600">DNI</th>
                <th className="p-4 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">
                    No hay clientes cargados aún.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium">{client.full_name}</td>
                    <td className="p-4 text-gray-600">{client.phone || '-'}</td>
                    <td className="p-4 text-gray-600">{client.dni || '-'}</td>
                    <td className="p-4">
                      {/* CAMBIO 3a: El botón ahora activa el estado selectedClient */}
                      <button 
                        onClick={() => setSelectedClient(client)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium border border-blue-200 px-3 py-1 rounded hover:bg-blue-50"
                      >
                        Gestionar Autos 🚗
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CAMBIO 3b: Si hay un cliente seleccionado, mostramos el componente VehicleManager */}
      {selectedClient && (
        <VehicleManager 
          client={selectedClient} 
          onClose={() => setSelectedClient(null)} 
        />
      )}
    </div>
  )
}