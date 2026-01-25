import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActiveOrders, updateOrderStatus } from '../../services/orderService'
import OrderBilling from './orderBilling'
import { Wrench, Calendar, MessageCircle, ArrowRight, Car, Lock } from 'lucide-react' // <--- Lock icon agregado
import toast from 'react-hot-toast'

// 1. AHORA RECIBIMOS userRole COMO PROP
export default function WorkshopBoard({ userRole }) {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    setLoading(true)
    const data = await getActiveOrders()
    setOrders(data)
    setLoading(false)
  }

  // 2. AQUÍ ESTÁ LA LÓGICA DE APROBACIÓN
  const handleStatusChange = async (id, newStatus) => {
    
    // Si intentan FINALIZAR y NO son admin...
    if (newStatus === 'finalizado' && userRole !== 'admin') {
        
        // ...lo mandamos a REVISIÓN en lugar de finalizado
        await updateOrderStatus(id, 'revision')
        toast('Enviado a revisión del Admin 👮‍♂️', { icon: '🔒' })
        
    } else {
        // Si es Admin, o si es cualquier otro cambio (ej: pendiente -> proceso), pasa directo
        await updateOrderStatus(id, newStatus)
        if(newStatus === 'finalizado') toast.success('Orden Finalizada y Cobrada 💰')
    }
    
    loadOrders()
  }

  const sendWhatsApp = (order) => {
    const cliente = order.vehicles?.clients?.full_name
    const telefono = order.vehicles?.clients?.phone
    const auto = `${order.vehicles?.brand} ${order.vehicles?.model}`
    if (!telefono) return toast.error('Sin teléfono cargado')
    let num = telefono.replace(/\D/g, '')
    if (!num.startsWith('54')) num = '549' + num
    const mensaje = `Hola ${cliente}! Tu ${auto} (Patente: ${order.vehicles?.patent}) ya está LISTO para retirar. 🚗💨`
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case 'pendiente': return 'bg-red-100 text-red-800 border-red-200';
      case 'en_proceso': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'revision': return 'bg-purple-100 text-purple-800 border-purple-200'; // <--- COLOR NUEVO (REVISIÓN)
      case 'finalizado': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Wrench className="text-orange-600" /> Tablero de Taller
      </h1>

      {loading ? (
        <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-400 font-medium">Cargando taller...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="bg-orange-50 p-6 rounded-full mb-6">
                <Car className="w-16 h-16 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No hay autos en reparación</h3>
            <p className="text-gray-500 max-w-md mb-8">
                El taller está libre. Para ingresar un vehículo nuevo, andá a la sección de Clientes.
            </p>
            <Link to="/clientes" className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition flex items-center gap-2 shadow-lg group">
                Ir a Clientes <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative transition hover:shadow-md hover:border-orange-300 group">
              
              <div className="p-4 border-b bg-gray-50 group-hover:bg-orange-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 leading-tight">
                      {order.vehicles?.brand} {order.vehicles?.model}
                    </h3>
                    <p className="text-xs font-bold text-gray-500 font-mono mt-1 bg-white inline-block px-1 rounded border">
                      {order.vehicles?.patent}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wide ${getStatusStyle(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                   <span className="font-medium text-orange-700 bg-orange-100 px-2 rounded-full text-xs py-0.5">
                     {order.vehicles?.clients?.full_name}
                   </span>
                </div>
              </div>

              <div className="p-4 flex-grow bg-white">
                <p className="text-gray-600 italic text-sm border-l-2 border-orange-200 pl-3">
                  "{order.description}"
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <Calendar size={12} />
                  <span>Ingreso: {new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 border-t flex flex-col gap-2">
                
                {/* SI ESTÁ EN REVISIÓN, BLOQUEAMOS TODO (Solo mensaje) */}
                {order.status === 'revision' ? (
                    <div className="bg-purple-50 text-purple-700 text-xs font-bold p-2 rounded text-center border border-purple-100 flex items-center justify-center gap-2">
                        <Lock size={14}/> Esperando aprobación del Admin
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2">
                        <button 
                            onClick={() => setSelectedOrder(order)}
                            className="bg-white text-gray-700 px-3 py-2 rounded-lg font-bold hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-200 transition shadow-sm"
                            title="Cargar Costos"
                        >
                            💲
                        </button>

                        {order.status === 'pendiente' && (
                            <button 
                            onClick={() => handleStatusChange(order.id, 'en_proceso')} 
                            className="flex-1 bg-slate-700 text-white text-sm py-2 rounded-lg font-bold hover:bg-slate-800 transition shadow-sm"
                            >
                            ⚙️ Empezar
                            </button>
                        )}

                        {order.status !== 'finalizado' && (
                            <button 
                            onClick={() => handleStatusChange(order.id, 'finalizado')} 
                            className={`flex-1 text-white text-sm py-2 rounded-lg font-bold transition shadow-sm ${
                                userRole === 'admin' 
                                    ? 'bg-green-600 hover:bg-green-700'  // Admin ve botón verde normal
                                    : 'bg-slate-600 hover:bg-slate-700'   // Empleado ve botón gris/serio
                            }`}
                            >
                            {userRole === 'admin' ? '✅ Finalizar' : '📩 Solicitar Cierre'}
                            </button>
                        )}
                        </div>
                        
                        {order.status === 'finalizado' && (
                        <button 
                            onClick={() => sendWhatsApp(order)}
                            className="w-full bg-green-500 text-white text-sm py-2 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center gap-2 border border-green-600 shadow-sm"
                        >
                            <MessageCircle size={16} /> Avisar al Cliente
                        </button>
                        )}
                    </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderBilling 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  )
}