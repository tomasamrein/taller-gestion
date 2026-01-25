import { useEffect, useState } from 'react'
import { getVehiclesByClient, createVehicle, deleteVehicle } from '../../services/vehicleService'
import { createOrder } from '../../services/orderService'
import { Car, Trash2, Plus, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VehicleManager({ client, onClose }) {
  const [vehicles, setVehicles] = useState([])
  const [newCar, setNewCar] = useState({ brand: '', model: '', year: '', patent: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [client])

  const load = async () => {
    if (!client) return
    const data = await getVehiclesByClient(client.id)
    setVehicles(data)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newCar.brand || !newCar.patent) return toast.error('Marca y Patente obligatorias')

    setLoading(true)
    try {
        await createVehicle({ ...newCar, client_id: client.id })
        toast.success('Vehículo agregado')
        setNewCar({ brand: '', model: '', year: '', patent: '' })
        load()
    } catch (error) {
        console.error(error)
        toast.error('Error al crear vehículo')
    } finally {
        setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('¿Borrar vehículo?')) {
        await deleteVehicle(id)
        toast.success('Vehículo eliminado')
        load()
    }
  }

  // --- AQUÍ ESTABA EL ERROR: Aseguramos que los datos se envíen bien ---
  const handleSendToWorkshop = async (vehicle) => {
    const description = prompt(`¿Qué trabajo hay que hacerle al ${vehicle.model}?`)
    if (!description) return 

    await toast.promise(
        createOrder({ 
            vehicle_id: vehicle.id, 
            description: description 
        }),
        {
            loading: 'Ingresando al taller...',
            success: '¡Auto ingresado al Taller! 🔧',
            error: 'Error: No se pudo ingresar el auto',
        }
    )
    
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b-4 border-orange-500">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
                <Car className="text-orange-500" /> Vehículos de {client.full_name}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white px-2 hover:bg-slate-800 rounded transition">✕</button>
        </div>

        <div className="p-6 overflow-y-auto">
          
          <form onSubmit={handleCreate} className="bg-orange-50 p-4 rounded-xl border border-orange-200 mb-6 shadow-sm">
            <h3 className="text-xs font-bold text-orange-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Plus size={14} /> Nuevo Vehículo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <input placeholder="Marca (Fiat)" className="border p-2 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white" value={newCar.brand} onChange={e => setNewCar({...newCar, brand: e.target.value})} autoFocus />
              <input placeholder="Modelo (Palio)" className="border p-2 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white" value={newCar.model} onChange={e => setNewCar({...newCar, model: e.target.value})} />
              <input placeholder="Año (2015)" type="number" className="border p-2 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white" value={newCar.year} onChange={e => setNewCar({...newCar, year: e.target.value})} />
              <input placeholder="Patente (AE...)" className="border p-2 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white uppercase font-mono" value={newCar.patent} onChange={e => setNewCar({...newCar, patent: e.target.value.toUpperCase()})} />
            </div>
            <button disabled={loading} className="w-full bg-orange-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition shadow-md disabled:opacity-50">
              {loading ? 'Guardando...' : 'Agregar Auto'}
            </button>
          </form>

          <div className="space-y-3">
            {vehicles.length === 0 ? (
                <p className="text-center text-gray-400 italic py-4">Este cliente no tiene autos cargados.</p>
            ) : (
                vehicles.map(v => (
                    <div key={v.id} className="flex flex-col sm:flex-row justify-between items-center bg-white border p-4 rounded-xl shadow-sm hover:border-orange-300 transition gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                <Car size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">{v.brand} {v.model}</h4>
                                <p className="text-xs font-bold text-gray-400 font-mono bg-gray-100 px-1 rounded inline-block">
                                    {v.patent} • {v.year}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                                onClick={() => handleSendToWorkshop(v)}
                                className="flex-1 sm:flex-none bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Wrench size={14} /> Taller
                            </button>
                            
                            <button 
                                onClick={() => handleDelete(v.id)}
                                className="bg-white text-gray-300 border border-gray-200 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))
            )}
          </div>

        </div>
      </div>
    </div>
  )
}