import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { approveExpense } from '../../services/managementService'
import { updateOrderStatus } from '../../services/orderService' // Asumiendo que tenés esta
import { logAction } from '../../services/auditService'
import { Bell, Check, X, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NotificationCenter({ userRole, userName }) {
  const [pendingExpenses, setPendingExpenses] = useState([])
  const [pendingOrders, setPendingOrders] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  // Solo el admin carga notificaciones
  if (userRole !== 'admin') return null

  useEffect(() => { loadPending() }, [isOpen]) // Recarga al abrir

  const loadPending = async () => {
    // 1. Buscar Gastos Pendientes
    const { data: expenses } = await supabase.from('expenses').select('*').eq('status', 'pending')
    setPendingExpenses(expenses || [])

    // 2. Buscar Órdenes en Revisión (Si el empleado intentó finalizar)
    const { data: orders } = await supabase.from('work_orders').select('*, vehicles(brand, model, patent)').eq('status', 'revision')
    setPendingOrders(orders || [])
  }

  // --- MANEJADORES DE GASTOS ---
  const handleExpense = async (id, approved) => {
    await approveExpense(id, approved, userName)
    toast.success(approved ? 'Gasto Aprobado' : 'Gasto Rechazado')
    loadPending()
  }

  // --- MANEJADORES DE ÓRDENES ---
  const handleOrder = async (id, approved) => {
    if (approved) {
        await updateOrderStatus(id, 'finalizado') // Pasa a finalizado real
        await logAction(userName, 'APROBAR_ORDEN', `Orden #${id} finalizada`)
        toast.success('Orden Finalizada')
    } else {
        await updateOrderStatus(id, 'en_proceso') // Vuelve a taller
        await logAction(userName, 'RECHAZAR_ORDEN', `Orden #${id} devuelta a taller`)
        toast('Orden devuelta a proceso')
    }
    loadPending()
  }

  const totalCount = pendingExpenses.length + pendingOrders.length

  return (
    <div className="relative z-50">
      {/* CAMPANA */}
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-500 hover:text-orange-600 transition">
        <Bell size={24} />
        {totalCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {totalCount}
            </span>
        )}
      </button>

      {/* DROPDOWN DE ALERTAS */}
      {isOpen && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div> {/* Cierra al clickear afuera */}
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="bg-slate-900 text-white p-3 font-bold text-sm border-b-4 border-orange-500">
                    Autorizaciones Pendientes
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                    {totalCount === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-sm">Todo al día. 🌴</div>
                    ) : (
                        <div className="divide-y">
                            {/* LISTA GASTOS */}
                            {pendingExpenses.map(ex => (
                                <div key={ex.id} className="p-3 bg-red-50 hover:bg-red-100 transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-red-600 uppercase bg-red-200 px-1 rounded">Gasto</span>
                                        <span className="font-bold text-gray-700">${ex.amount}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{ex.description}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleExpense(ex.id, true)} className="flex-1 bg-green-600 text-white text-xs py-1 rounded hover:bg-green-700">Aprobar</button>
                                        <button onClick={() => handleExpense(ex.id, false)} className="flex-1 bg-gray-300 text-gray-700 text-xs py-1 rounded hover:bg-gray-400">Rechazar</button>
                                    </div>
                                </div>
                            ))}

                            {/* LISTA ÓRDENES */}
                            {pendingOrders.map(ord => (
                                <div key={ord.id} className="p-3 bg-orange-50 hover:bg-orange-100 transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-orange-600 uppercase bg-orange-200 px-1 rounded">Cierre Caja</span>
                                        <span className="font-mono text-xs font-bold text-gray-500">{ord.vehicles?.patent}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">Intento de cobro: {ord.vehicles?.brand} {ord.vehicles?.model}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOrder(ord.id, true)} className="flex-1 bg-green-600 text-white text-xs py-1 rounded hover:bg-green-700">Confirmar</button>
                                        <button onClick={() => handleOrder(ord.id, false)} className="flex-1 bg-gray-300 text-gray-700 text-xs py-1 rounded hover:bg-gray-400">Revisar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
      )}
    </div>
  )
}