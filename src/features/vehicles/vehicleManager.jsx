import { useEffect, useState } from 'react'
import { getVehiclesByClient, createVehicle, deleteVehicle } from '../../services/vehicleService'
import { createOrder } from '../../services/orderService' // <--- NUEVO

export default function VehicleManager({ client, onClose }) {
  const [vehicles, setVehicles] = useState([])
  const [newVehicle, setNewVehicle] = useState({ brand: '', model: '', patent: '', year: '' })
  
  useEffect(() => { loadVehicles() }, [client.id])

  const loadVehicles = async () => {
    const data = await getVehiclesByClient(client.id)
    setVehicles(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newVehicle.patent || !newVehicle.brand) return alert('Datos incompletos')
    try {
      await createVehicle({ ...newVehicle, client_id: client.id })
      setNewVehicle({ brand: '', model: '', patent: '', year: '' })
      loadVehicles()
    } catch (error) { alert('Error al crear auto') }
  }

  const handleDelete = async (id) => {
    if(!confirm('¿Borrar auto?')) return
    await deleteVehicle(id)
    loadVehicles()
  }

  // --- NUEVA FUNCIÓN: Crear Orden ---
  const handleCreateOrder = async (vehicle) => {
    const descripcion = prompt(`¿Qué problema tiene el ${vehicle.model}?`)
    if (!descripcion) return // Si cancela, no hacemos nada

    try {
      await createOrder(vehicle.id, descripcion)
      alert('¡Auto ingresado al taller exitosamente! 🔧')
      onClose() // Cerramos el modal para volver al inicio
    } catch (error) {
      alert('Error al crear la orden')
      console.error(error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Autos de {client.full_name}</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white font-bold">✕ Cerrar</button>
        </div>

        <div className="p-6">
          {/* Formulario (Igual que antes) */}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 mb-6 bg-gray-50 p-4 rounded border">
            <input placeholder="Marca" className="border p-2 rounded" 
              value={newVehicle.brand} onChange={e => setNewVehicle({...newVehicle, brand: e.target.value})} />
            <input placeholder="Modelo" className="border p-2 rounded" 
              value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} />
            <input placeholder="Patente" className="border p-2 rounded uppercase" 
              value={newVehicle.patent} onChange={e => setNewVehicle({...newVehicle, patent: e.target.value.toUpperCase()})} />
            <button className="col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold">+ Agregar Vehículo</button>
          </form>

          {/* Lista de Autos con BOTÓN NUEVO */}
          <ul className="space-y-3">
            {vehicles.map(v => (
              <li key={v.id} className="flex justify-between items-center border p-3 rounded hover:bg-gray-50 shadow-sm">
                <div>
                  <div className="font-bold text-lg">{v.brand} {v.model}</div>
                  <div className="text-sm text-gray-500">Patente: {v.patent}</div>
                </div>
                <div className="flex gap-2">
                  {/* BOTÓN MÁGICO */}
                  <button 
                    onClick={() => handleCreateOrder(v)}
                    className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-bold hover:bg-orange-600 shadow"
                  >
                    🛠️ Ingresar al Taller
                  </button>
                  
                  <button onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-600 text-xs px-2">
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}