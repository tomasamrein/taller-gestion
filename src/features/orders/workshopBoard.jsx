import { useEffect, useState } from 'react'
import { getActiveOrders, updateOrderStatus } from '../../services/orderService'

export default function WorkshopBoard() {
  const [orders, setOrders] = useState([])

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    const data = await getActiveOrders()
    setOrders(data)
  }

  const handleStatusChange = async (id, newStatus) => {
    await updateOrderStatus(id, newStatus)
    loadOrders()
  }

  // --- NUEVA FUNCIÓN: Generar link de WhatsApp ---
  const sendWhatsApp = (order) => {
    const cliente = order.vehicles?.clients?.full_name
    const telefono = order.vehicles?.clients?.phone
    const auto = `${order.vehicles?.brand} ${order.vehicles?.model}`
    
    if (!telefono) return alert('El cliente no tiene teléfono cargado')

    // 1. Limpiamos el número (sacamos guiones, espacios, etc)
    let numeroLimpio = telefono.replace(/\D/g, '')
    
    // Si es argentina y no tiene el 54, se lo agregamos (asumiendo que puso 342...)
    if (!numeroLimpio.startsWith('54')) {
      numeroLimpio = '549' + numeroLimpio
    }

    // 2. Creamos el mensaje personalizado
    const mensaje = `Hola ${cliente}! Te escribimos del Taller. Tu ${auto} (Patente: ${order.vehicles?.patent}) ya está LISTO para retirar.`
    
    // 3. Abrimos WhatsApp Web
    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pendiente': return 'bg-red-100 text-red-800 border-red-200';
      case 'en_proceso': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'finalizado': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        🔧 Tablero de Control
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col relative transition hover:shadow-2xl">
            
            {/* Cabecera */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-xl text-gray-800">
                  {order.vehicles?.brand} {order.vehicles?.model}
                </h3>
                <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-500 font-mono tracking-wide">{order.vehicles?.patent}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-blue-600 font-medium">👤 {order.vehicles?.clients?.full_name}</p>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="p-4 flex-grow bg-white">
              <p className="text-gray-600 italic border-l-4 border-gray-200 pl-3">
                "{order.description}"
              </p>
            </div>

            {/* Pie de Acciones */}
            <div className="p-3 bg-gray-50 border-t flex flex-col gap-2">
              
              {/* Botones de Estado */}
              <div className="flex gap-2">
                {order.status === 'pendiente' && (
                  <button onClick={() => handleStatusChange(order.id, 'en_proceso')} className="flex-1 bg-yellow-500 text-white text-sm py-2 rounded font-bold hover:bg-yellow-600 transition">
                    ⚙️ Empezar
                  </button>
                )}
                {order.status !== 'finalizado' && (
                  <button onClick={() => handleStatusChange(order.id, 'finalizado')} className="flex-1 bg-green-600 text-white text-sm py-2 rounded font-bold hover:bg-green-700 transition">
                    ✅ Finalizar
                  </button>
                )}
              </div>

              {/* --- EL BOTÓN DE WHATSAPP --- */}
              {order.status === 'finalizado' && (
                <button 
                  onClick={() => sendWhatsApp(order)}
                  className="w-full bg-green-500 text-white text-sm py-2 rounded font-bold hover:bg-green-600 transition flex items-center justify-center gap-2 border-t-2 border-green-400 mt-1"
                >
                  <span className="text-lg">📲</span> Avisar al Cliente
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}