import { useEffect, useState } from 'react'
import { getVehiclesByClient, createVehicle, deleteVehicle } from '../../services/vehicleService'
import { createOrder } from '../../services/orderService'
import { Car, Trash2, Plus, Wrench } from 'lucide-react'

export default function VehicleManager({ client, onClose }) {
  const [vehicles, setVehicles] = useState([])
  // Estado del formulario
  const [newVehicle, setNewVehicle] = useState({ brand: '', model: '', patent: '', year: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadVehicles()
  }, [client.id])

  const loadVehicles = async () => {
    const data = await getVehiclesByClient(client.id)
    setVehicles(data)
  }

  // --- LÓGICA DE CREACIÓN (Aquí suele romperse) ---
  const handleSubmit = async (e) => {
    e.preventDefault() // <--- Evita que se recargue la página
    
    // Validación básica
    if (!newVehicle.patent || !newVehicle.brand) return alert('Marca y Patente son obligatorios')

    setLoading(true)
    try {
      // 1. Enviamos a Supabase con el ID del cliente
      await createVehicle({ ...newVehicle, client_id: client.id })
      
      // 2. Limpiamos el formulario
      setNewVehicle({ brand: '', model: '', patent: '', year: '' }) 
      
      // 3. Recargamos la lista
      loadVehicles() 
    } catch (error) {
      console.error(error)
      alert('Error: Quizás la patente ya existe o hay un problema de conexión.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if(!confirm('¿Borrar este auto y su historial?')) return
    await deleteVehicle(id)
    loadVehicles()
  }

  const handleCreateOrder = async (vehicle) => {
    const descripcion = prompt(`¿Qué problema tiene el ${vehicle.model}?`)
    if (!descripcion) return

    try {
      await createOrder(vehicle.id, descripcion)
      alert('¡Auto ingresado al taller! 🔧')
      onClose()
    } catch (error) {
      alert('Error al crear la orden')
    }
  }

  return (
    // Overlay oscuro
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      
      {/* Modal Blanco */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Encabezado Naranja/Oscuro */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b-4 border-orange-500">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Car className="text-orange-500" /> Autos de {client.full_name}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-xl hover:bg-slate-700 px-2 rounded transition">✕</button>
        </div>

        <div className="p-6 overflow-y-auto">
          
          {/* Formulario de Carga */}
          <form onSubmit={handleSubmit} className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6">
            <h3 className="font-bold text-orange-800 mb-3 text-sm uppercase tracking-wide">Nuevo Vehículo</h3>
            <div className="grid grid-cols-2 gap-3">
              <input 
                placeholder="Marca (ej: Ford)" 
                className="border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" 
                value={newVehicle.brand} onChange={e => setNewVehicle({...newVehicle, brand: e.target.value})} 
              />
              <input 
                placeholder="Modelo (ej: Ka)" 
                className="border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" 
                value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} 
              />
              <input 
                placeholder="PATENTE (AAA-123)" 
                className="border p-2 rounded uppercase font-mono focus:ring-2 focus:ring-orange-500 outline-none" 
                value={newVehicle.patent} onChange={e => setNewVehicle({...newVehicle, patent: e.target.value.toUpperCase()})} 
              />
              <input 
                placeholder="Año" type="number" 
                className="border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" 
                value={newVehicle.year} onChange={e => setNewVehicle({...newVehicle, year: e.target.value})} 
              />
            </div>
            
            <button disabled={loading} className="w-full mt-3 bg-orange-600 text-white py-2 rounded font-bold hover:bg-orange-700 transition shadow flex items-center justify-center gap-2 disabled:opacity-50">
              <Plus size={18} /> {loading ? 'Guardando...' : 'Agregar Vehículo'}
            </button>
          </form>

          {/* Lista de Autos */}
          <h3 className="font-bold text-gray-700 mb-3 border-b pb-1">Vehículos Registrados</h3>
          {vehicles.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-400 italic">Este cliente no tiene autos cargados.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {vehicles.map(v => (
                <li key={v.id} className="flex flex-col sm:flex-row justify-between items-center border p-3 rounded-lg hover:bg-gray-50 shadow-sm transition group">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="bg-slate-100 p-2 rounded-full text-slate-600">
                        <Car size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{v.brand} {v.model} <span className="text-xs font-normal text-gray-500">({v.year})</span></div>
                      <div className="text-xs font-mono font-bold bg-slate-200 inline-block px-1.5 rounded text-slate-700 mt-0.5">{v.patent}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
                    <button 
                      onClick={() => handleCreateOrder(v)}
                      className="flex-1 sm:flex-none bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-700 shadow flex items-center justify-center gap-1 transition"
                    >
                      <Wrench size={14} /> Taller
                    </button>
                    
                    <button onClick={() => handleDelete(v.id)} className="text-gray-300 hover:text-red-500 p-1.5 transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}