import { useEffect, useState } from 'react'
import { getVehiclesByClient, createVehicle, deleteVehicle } from '../../services/vehicleService'
import { createOrder } from '../../services/orderService'
import { Car, Trash2, Plus, Wrench, X, Check, Gauge, FileText, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const normalizePatent = (patent) => {
  if (!patent) return ''
  return patent.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

const validatePatent = (patent) => {
  const normalized = normalizePatent(patent)
  if (!normalized) return { valid: false, message: '' }
  
  const patterns = [
    /^[A-Z]{2}\d{3}[A-Z]{2}$/,  // AA-123-AA
    /^[A-Z]\d{3}[A-Z]{3}$/,        // A123AAA
    /^\d{3}[A-Z]{3}$/,             // 123AAA
    /^[A-Z]{3}\d{3}$/,             // AAA123
  ]
  
  if (patterns.some(p => p.test(normalized))) {
    return { valid: true, message: 'Patente válida' }
  }
  
  return { valid: false, message: 'Formato de patente inválido' }
}

export default function VehicleManager({ client, onClose }) {
  const [vehicles, setVehicles] = useState([])
  const [newCar, setNewCar] = useState({ brand: '', model: '', year: '', patent: '', km: '' })
  const [loading, setLoading] = useState(false)
  const [showWorkshopModal, setShowWorkshopModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [workshopForm, setWorkshopForm] = useState({ description: '', km: '', notes: '' })

  useEffect(() => { load() }, [client])

  const load = async () => {
    if (!client) return
    const { data, error } = await getVehiclesByClient(client.id)
    if (error) {
      toast.error('Error al cargar vehículos')
      return
    }
    setVehicles(data || [])
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    
    const patentValidation = validatePatent(newCar.patent)
    if (newCar.patent && !patentValidation.valid) {
      toast.error('Patente inválida. Ej: AA-123-BB o A123BCD')
      return
    }

    if (!client?.id) {
      toast.error('Error: Cliente no seleccionado')
      return
    }

    if (!newCar.brand || !newCar.model) {
      toast.error('Marca y modelo son obligatorios')
      return
    }

    setLoading(true)
    try {
        console.log('Intentando crear vehículo con:', {
          brand: newCar.brand,
          model: newCar.model,
          year: newCar.year || null,
          patent: normalizePatent(newCar.patent),
          km: newCar.km ? Number(newCar.km) : null,
          client_id: client.id
        })
        
        const { data, error } = await createVehicle({
          brand: newCar.brand,
          model: newCar.model,
          year: newCar.year || null,
          patent: normalizePatent(newCar.patent),
          km: newCar.km ? Number(newCar.km) : null,
          client_id: client.id
        })
        
        if (error) {
          console.error('Error de Supabase:', error)
          toast.error(`Error: ${error.message || error.code || JSON.stringify(error)}`)
          return
        }
        
        console.log('Vehículo creado:', data)
        toast.success('Vehículo agregado')
        setNewCar({ brand: '', model: '', year: '', patent: '', km: '' })
        load()
    } catch (error) {
        console.error('Error completo:', error)
        toast.error(`Error: ${error.message}`)
    } finally {
        setLoading(false)
    }
  }

  const handleDelete = async (v) => {
    if (!confirm(`¿Borrar el ${v.brand} ${v.model} (${v.patent})?`)) return
    
    const { error } = await deleteVehicle(v.id)
    if (error) {
      toast.error('Error al eliminar')
      return
    }
    toast.success('Vehículo eliminado')
    load()
  }

  const openWorkshopModal = (vehicle) => {
    setSelectedVehicle(vehicle)
    setWorkshopForm({ 
      description: '', 
      km: vehicle.km || '',
      notes: '' 
    })
    setShowWorkshopModal(true)
  }

  const handleSendToWorkshop = async (e) => {
    e.preventDefault()
    
    if (!workshopForm.description.trim()) {
      toast.error('Ingresá una descripción del trabajo')
      return
    }

    if (!selectedVehicle?.id) {
      toast.error('Error: Vehículo no seleccionado')
      return
    }

    console.log('Creando orden:', {
      vehicle_id: selectedVehicle.id,
      description: workshopForm.description.trim(),
      km: workshopForm.km ? Number(workshopForm.km) : null,
      notes: workshopForm.notes.trim() || null
    })
    
    const { data, error } = await createOrder({ 
      vehicle_id: selectedVehicle.id, 
      description: workshopForm.description.trim(),
      km: workshopForm.km ? Number(workshopForm.km) : null,
      notes: workshopForm.notes.trim() || null
    })
    
    if (error) {
      console.error('Error al crear orden:', error)
      toast.error(`No se pudo ingresar el auto: ${error.message || error}`)
    } else {
      console.log('Orden creada:', data)
      toast.success('Auto ingresar al Taller!')
      setShowWorkshopModal(false)
      onClose()
    }
  }

  const patentValidation = validatePatent(newCar.patent)
  const showPatentWarning = newCar.patent && !patentValidation.valid && patentValidation.message === ''

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b-4 border-orange-500">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
                <Car className="text-orange-500" /> Vehículos de {client.name || client.full_name}
            </h2>
            <p className="text-xs text-gray-400">{vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white px-2 hover:bg-slate-800 rounded transition">✕</button>
        </div>

        <div className="p-6 overflow-y-auto">
          
          <form onSubmit={handleCreate} className="bg-orange-50 p-4 rounded-xl border border-orange-200 mb-6 shadow-sm">
            <h3 className="text-xs font-bold text-orange-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Plus size={14} /> Agregar Vehículo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              <input 
                placeholder="Marca *" 
                className="border p-2 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white" 
                value={newCar.brand} 
                onChange={e => setNewCar({...newCar, brand: e.target.value})} 
                autoFocus 
              />
              <input 
                placeholder="Modelo *" 
                className="border p-2 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white" 
                value={newCar.model} 
                onChange={e => setNewCar({...newCar, model: e.target.value})} 
              />
              <input 
                placeholder="Año" 
                type="number" 
                min="1900" 
                max={new Date().getFullYear() + 1}
                className="border p-2 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white" 
                value={newCar.year} 
                onChange={e => setNewCar({...newCar, year: e.target.value})} 
              />
              <div className="relative">
                <input 
                  placeholder="Patente (AA-123-BB)" 
                  className={`border p-2 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white uppercase font-mono w-full ${newCar.patent && !patentValidation.valid && !showPatentWarning ? 'border-red-500 bg-red-50' : ''}`} 
                  value={newCar.patent} 
                  onChange={e => setNewCar({...newCar, patent: e.target.value.toUpperCase()})} 
                />
                {newCar.patent && !patentValidation.valid && !showPatentWarning && (
                  <AlertCircle size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500" />
                )}
              </div>
              <input 
                placeholder="Km actual" 
                type="number" 
                className="border p-2 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white" 
                value={newCar.km} 
                onChange={e => setNewCar({...newCar, km: e.target.value})} 
              />
            </div>
            {newCar.patent && !patentValidation.valid && !showPatentWarning && (
              <p className="text-xs text-red-600 mb-2 font-bold">Patente inválida. Formatos: AA-123-BB o A123BCD</p>
            )}
            <button disabled={loading || !newCar.brand || !newCar.model} className="w-full bg-orange-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Guardando...' : 'Agregar Vehículo'}
            </button>
          </form>

          <div className="space-y-3">
            {vehicles.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <Car size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400 italic">Este cliente no tiene vehículos cargados.</p>
                </div>
            ) : (
                vehicles.map(v => (
                    <div key={v.id} className="flex flex-col sm:flex-row justify-between items-center bg-white border p-4 rounded-xl shadow-sm hover:border-orange-300 transition gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                <Car size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">{v.brand} {v.model}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs font-bold text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                                      {v.patent || 'Sin patente'}
                                  </p>
                                  {v.year && (
                                    <span className="text-xs text-gray-400">{v.year}</span>
                                  )}
                                </div>
                                {v.km && (
                                  <p className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-1">
                                    <Gauge size={12} /> {Number(v.km).toLocaleString()} km
                                  </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                                onClick={() => openWorkshopModal(v)}
                                className="flex-1 sm:flex-none bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Wrench size={16} /> Ingresar al Taller
                            </button>
                            
                            <button 
                                onClick={() => handleDelete(v)}
                                className="bg-white text-gray-300 border border-gray-200 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>

      {showWorkshopModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-green-600 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold flex items-center gap-2">
                    <Wrench size={20} /> Ingresar al Taller
                </h3>
                <p className="text-sm text-green-100">{selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.patent})</p>
              </div>
              <button onClick={() => setShowWorkshopModal(false)} className="text-green-100 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSendToWorkshop} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Kilómetros del vehículo
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    value={workshopForm.km}
                    onChange={e => setWorkshopForm({...workshopForm, km: e.target.value})}
                    placeholder="Ej: 45000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">km</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Descripción del trabajo *
                </label>
                <textarea 
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
                  rows={3}
                  value={workshopForm.description}
                  onChange={e => setWorkshopForm({...workshopForm, description: e.target.value})}
                  placeholder="Ej: Cambio de aceite y filtro. Frenos adelante."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Notas internas (opcional)
                </label>
                <textarea 
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none bg-gray-50"
                  rows={2}
                  value={workshopForm.notes}
                  onChange={e => setWorkshopForm({...workshopForm, notes: e.target.value})}
                  placeholder="Notas privadas para el mecánico..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                    type="button"
                    onClick={() => setShowWorkshopModal(false)}
                    className="flex-1 border p-3 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                    Cancelar
                </button>
                <button 
                    type="submit"
                    className="flex-1 bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2"
                >
                    <Check size={18} /> Ingresar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
