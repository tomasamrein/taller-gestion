import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActiveOrders, updateOrderStatus, getFinishedOrdersWithItems } from '../../services/orderService'
import OrderBilling from './orderBilling'
import ChecklistManager from '../checklist/checklistManager' 
import { Wrench, Calendar, MessageCircle, ArrowRight, Car, Lock, History, PlayCircle, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WorkshopBoard({ userRole }) {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null) 
  const [checklistOrder, setChecklistOrder] = useState(null) 
  const [loading, setLoading] = useState(true)
  const [viewTab, setViewTab] = useState('activas') 
  
  // --- ESTADOS PARA BÚSQUEDA Y PAGINACIÓN ---
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Reseteamos y cargamos cada vez que se cambia de pestaña
  useEffect(() => { 
      setPage(0)
      setHasMore(true)
      setSearchTerm('')
      loadOrders(0, true) 
  }, [viewTab])

  // Lógica de carga unificada
  const loadOrders = async (currentPage = page, isReset = false) => {
    if (isReset) setLoading(true)
    else setLoadingMore(true)

    try {
        if (viewTab === 'activas') {
            const data = await getActiveOrders()
            setOrders(data)
        } else {
            // Traemos las finalizadas paginadas de a 30
            const data = await getFinishedOrdersWithItems(currentPage, 30)
            
            if (data.length < 30) setHasMore(false)
            else setHasMore(true)

            if (isReset) setOrders(data)
            else setOrders(prev => [...prev, ...data])
        }
    } catch (error) {
        console.error("Error al cargar ordenes:", error)
        toast.error("Error cargando tablero")
    } finally {
        setLoading(false)
        setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadOrders(nextPage, false)
  }

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'finalizado' && userRole !== 'admin') {
        try {
            await updateOrderStatus(id, 'revision')
            toast('Enviado a revisión del Admin 👮‍♂️', { icon: '🔒' })
            setPage(0); loadOrders(0, true); 
        } catch (error) {
            toast.error('Error al solicitar revisión')
        }
    } else {
        try {
            await updateOrderStatus(id, newStatus)
            if(newStatus === 'finalizado') toast.success('Orden Finalizada y Cobrada 💰')
            if(newStatus === 'en_proceso') toast.success('Orden Reabierta 🔄')
            setPage(0); loadOrders(0, true);
        } catch (error) {
            toast.error('Error al cambiar estado')
        }
    }
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
      case 'revision': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'finalizado': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const handleRestrictedClick = (order, action) => {
    if (order.status === 'pendiente') {
        toast.error('🚫 Debés iniciar la orden primero')
        return
    }
    action()
  }

  // Lógica de Filtrado Local (Buscador)
  const filteredOrders = orders.filter(order => {
      if (viewTab === 'activas' || !searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const clientName = order.vehicles?.clients?.full_name?.toLowerCase() || '';
      const patent = order.vehicles?.patent?.toLowerCase() || '';
      const vehicleInfo = `${order.vehicles?.brand} ${order.vehicles?.model}`.toLowerCase();
      
      return clientName.includes(term) || patent.includes(term) || vehicleInfo.includes(term);
  });

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Wrench className="text-orange-600" /> Tablero de Taller
          </h1>
          
          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex w-full md:w-auto">
             <button 
                onClick={() => setViewTab('activas')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewTab === 'activas' ? 'bg-orange-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
             >
                <PlayCircle size={16}/> Activas
             </button>
             <button 
                onClick={() => setViewTab('finalizadas')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewTab === 'finalizadas' ? 'bg-slate-700 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
             >
                <History size={16}/> Finalizadas
             </button>
          </div>
      </div>

      {/* BARRA DE BÚSQUEDA (Solo visible en Finalizadas) */}
      {viewTab === 'finalizadas' && (
          <div className="mb-6 animate-fade-in relative max-w-md">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex items-center p-2 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200 transition-all">
                  <Search className="text-gray-400 ml-2 shrink-0" size={20} />
                  <input
                      type="text"
                      placeholder="Buscar por cliente, vehículo o patente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-3 pr-4 py-1 outline-none text-sm text-gray-700 bg-transparent"
                  />
                  {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600 mr-2 bg-gray-100 rounded-full p-1">✕</button>
                  )}
              </div>
          </div>
      )}

      {loading ? (
        <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-400 font-medium">Cargando tablero...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="bg-orange-50 p-6 rounded-full mb-6">
                <Car className="w-16 h-16 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
                {viewTab === 'activas' ? 'No hay autos en reparación' : searchTerm ? 'No se encontraron resultados' : 'No hay historial de órdenes'}
            </h3>
            <p className="text-gray-500 max-w-md mb-8">
                {viewTab === 'activas' 
                    ? 'El taller está libre. Para ingresar un vehículo nuevo, andá a la sección de Clientes.'
                    : searchTerm ? 'Probá buscar con otro nombre o revisá si la patente está bien escrita.' : 'Aún no se ha finalizado y entregado ninguna orden de trabajo.'}
            </p>
            {viewTab === 'activas' && (
                <Link to="/clientes" className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition flex items-center gap-2 shadow-lg group">
                    Ir a Clientes <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                </Link>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredOrders.map(order => {
            const isPending = order.status === 'pendiente'
            const isFinished = order.status === 'finalizado'
            
            return (
            <div key={order.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col relative transition hover:shadow-md ${isFinished ? 'border-gray-200 opacity-95 hover:opacity-100' : 'border-gray-200 hover:border-orange-300'} group`}>
              
              <div className={`p-4 border-b transition-colors ${isFinished ? 'bg-gray-100' : 'bg-gray-50 group-hover:bg-orange-50'}`}>
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
                    <span className={`font-medium px-2 rounded-full text-xs py-0.5 ${isFinished ? 'bg-gray-200 text-gray-700' : 'text-orange-700 bg-orange-100'}`}>
                      {order.vehicles?.clients?.full_name}
                    </span>
                </div>
              </div>

              <div className="p-4 flex-grow bg-white">
                <p className={`text-sm pl-3 border-l-2 ${isFinished ? 'text-gray-500 italic border-gray-300' : 'text-gray-600 italic border-orange-200'}`}>
                  "{order.description}"
                </p>
                <div className="mt-4 flex flex-col gap-1 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} />
                    <span>Ingreso: {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}hs</span>
                  </div>
                  {isFinished && order.delivery_date && (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <ArrowRight size={12} />
                        <span>Entregado: {new Date(order.delivery_date).toLocaleDateString()} {new Date(order.delivery_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}hs</span>
                      </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-gray-50 border-t flex flex-col gap-2">
                
                {order.status === 'revision' ? (
                    <div className="bg-purple-50 text-purple-700 text-xs font-bold p-2 rounded text-center border border-purple-100 flex items-center justify-center gap-2">
                        <Lock size={14}/> Esperando aprobación del Admin
                    </div>
                ) : isFinished ? (
                    <>
                        <div className="flex gap-2">
                            <button onClick={() => setSelectedOrder(order)} className="flex-1 bg-white border border-gray-200 text-gray-700 hover:text-orange-600 text-xs py-2 rounded-lg font-bold transition shadow-sm" title="Ver Costos">
                                💲 Costos
                            </button>
                            <button onClick={() => setChecklistOrder(order)} className="flex-1 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 text-xs py-2 rounded-lg font-bold transition shadow-sm" title="Ver Informe">
                                📋 Informe
                            </button>
                            {userRole === 'admin' && (
                                <button onClick={() => handleStatusChange(order.id, 'en_proceso')} className="flex-1 bg-white border border-gray-200 text-red-600 hover:bg-red-50 text-xs py-2 rounded-lg font-bold transition shadow-sm" title="Reabrir">
                                    🔙 Reabrir
                                </button>
                            )}
                        </div>
                        <button onClick={() => sendWhatsApp(order)} className="w-full bg-green-50 text-green-700 text-sm py-2 rounded-lg font-bold hover:bg-green-500 hover:text-white transition flex items-center justify-center gap-2 border border-green-200 shadow-sm">
                            <MessageCircle size={16} /> Re-enviar Aviso
                        </button>
                    </>
                ) : (
                    <>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleRestrictedClick(order, () => setSelectedOrder(order))}
                                className={`px-3 py-2 rounded-lg font-bold border transition shadow-sm ${
                                    isPending 
                                    ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed' 
                                    : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-gray-200 hover:border-orange-200'
                                }`}
                                title="Cargar Costos"
                            >
                                💲
                            </button>

                            <button 
                                onClick={() => handleRestrictedClick(order, () => setChecklistOrder(order))}
                                className={`px-3 py-2 rounded-lg font-bold border transition shadow-sm ${
                                    isPending 
                                    ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed' 
                                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-gray-200 hover:border-blue-200'
                                }`}
                                title="Chequeo General"
                            >
                                📋
                            </button>

                            {order.status === 'pendiente' ? (
                                <button 
                                onClick={() => handleStatusChange(order.id, 'en_proceso')} 
                                className="flex-1 bg-slate-700 text-white text-sm py-2 rounded-lg font-bold hover:bg-slate-800 transition shadow-sm animate-pulse"
                                >
                                ⚙️ Empezar
                                </button>
                            ) : order.status !== 'finalizado' && (
                                <button 
                                onClick={() => handleStatusChange(order.id, 'finalizado')} 
                                className={`flex-1 text-white text-sm py-2 rounded-lg font-bold transition shadow-sm ${
                                    userRole === 'admin' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700' 
                                }`}
                                >
                                {userRole === 'admin' ? '✅ Finalizar' : '📩 Solicitar Cierre'}
                                </button>
                            )}
                        </div>
                    </>
                )}
              </div>
            </div>
          )})}
        </div>
      )}

      {/* BOTÓN CARGAR MÁS */}
      {viewTab === 'finalizadas' && hasMore && filteredOrders.length > 0 && (
          <div className="mt-8 flex justify-center">
              <button 
                  onClick={handleLoadMore} 
                  disabled={loadingMore}
                  className="bg-white text-gray-700 border border-gray-300 shadow-sm px-6 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50"
              >
                  {loadingMore ? 'Cargando...' : 'Cargar más resultados'}
              </button>
          </div>
      )}

      {selectedOrder && (
        <OrderBilling order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {checklistOrder && (
        <ChecklistManager orderId={checklistOrder.id} order={checklistOrder} onClose={() => setChecklistOrder(null)} />
      )}
    </div>
  )
}