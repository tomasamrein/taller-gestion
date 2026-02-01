import { useEffect, useState } from 'react'
import { getFinishedOrdersWithItems } from '../../services/orderService'
import { getExpenses } from '../../services/managementService'
import { FileText, ChevronDown, ChevronUp, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export default function BillingHistory() {
  const [history, setHistory] = useState([])
  const [expandedMonth, setExpandedMonth] = useState(null)

  // Función mágica para evitar que el UTC-3 nos robe un día
  const fixDate = (dateString) => {
    if (!dateString) return new Date()
    // Si ya tiene hora (T), la respetamos.
    if (dateString.includes('T')) return new Date(dateString)
    // Si es fecha pura (YYYY-MM-DD), le ponemos mediodía para que no reste horas y cambie de día
    return new Date(`${dateString}T12:00:00`)
  }

  useEffect(() => { load() }, [])

  const load = async () => {
    // 1. Traemos todo el historial
    const orders = await getFinishedOrdersWithItems() || []
    const expenses = await getExpenses() || []

    // 2. Agrupar por Mes (Clave: '2026-01')
    const grouped = {}

    // Procesar Ingresos
    orders.forEach(o => {
        // ACÁ ESTABA EL ERROR: Usamos fixDate en vez de new Date directo
        const d = fixDate(o.delivery_date || o.created_at)
        
        // Ahora d.getMonth() va a dar el mes correcto porque son las 12:00 del mediodía
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        
        const amount = o.order_items?.reduce((sum, i) => sum + (Number(i.unit_price) * Number(i.quantity)), 0) || 0

        if (!grouped[key]) grouped[key] = { income: 0, expense: 0, orders: 0, expenseCount: 0 }
        grouped[key].income += amount
        grouped[key].orders += 1
    })

    // Procesar Gastos (Solo Aprobados)
    expenses.forEach(e => {
        if (e.status !== 'approved') return // Ignorar pendientes
        
        // En gastos ya usabas el substring, que es seguro, pero por las dudas si usas dateObj después:
        // const d = fixDate(e.date) 
        
        // Tomamos "YYYY-MM" directo del string (esto ya funcionaba bien, lo dejo igual)
        const key = e.date.substring(0, 7) 
        
        if (!grouped[key]) grouped[key] = { income: 0, expense: 0, orders: 0, expenseCount: 0 }
        grouped[key].expense += Number(e.amount)
        grouped[key].expenseCount += 1
    })

    // 3. Convertir a Array y Ordenar (Más nuevo primero)
    const list = Object.entries(grouped).map(([key, data]) => {
        const [year, month] = key.split('-')
        // Creamos la fecha para el label, usando mediodía también para asegurar el nombre del mes
        const dateObj = new Date(year, month - 1, 15) 
        
        return {
            key,
            label: dateObj.toLocaleString('es-AR', { month: 'long', year: 'numeric' }),
            ...data,
            net: data.income - data.expense
        }
    }).sort((a, b) => b.key.localeCompare(a.key))

    setHistory(list)
  }

  const toggleMonth = (key) => {
    setExpandedMonth(expandedMonth === key ? null : key)
  }

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FileText className="text-orange-600" /> Historial de Facturación
      </h1>

      <div className="space-y-4">
        {history.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No hay registros históricos aún.</p>
        ) : (
            history.map(month => (
                <div key={month.key} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* CABECERA DEL MES */}
                    <div 
                        onClick={() => toggleMonth(month.key)}
                        className="p-4 flex flex-col md:flex-row justify-between items-center cursor-pointer hover:bg-gray-50 transition gap-4"
                    >
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className={`p-2 rounded-lg ${month.net >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 capitalize">{month.label}</h3>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${month.net >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    Neto: ${month.net.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                                <p className="text-gray-500 font-medium">Ingresos</p>
                                <p className="font-bold text-green-600">+${month.income.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500 font-medium">Gastos</p>
                                <p className="font-bold text-red-600">-${month.expense.toLocaleString()}</p>
                            </div>
                            {expandedMonth === month.key ? <ChevronUp className="text-gray-400"/> : <ChevronDown className="text-gray-400"/>}
                        </div>
                    </div>

                    {/* DETALLE DESPLEGABLE */}
                    {expandedMonth === month.key && (
                        <div className="bg-gray-50 p-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-white p-3 rounded border">
                                <p className="text-gray-500 flex items-center gap-2"><TrendingUp size={14} className="text-green-500"/> Trabajos Finalizados</p>
                                <p className="text-xl font-bold text-gray-800">{month.orders}</p>
                            </div>
                            <div className="bg-white p-3 rounded border">
                                <p className="text-gray-500 flex items-center gap-2"><TrendingDown size={14} className="text-red-500"/> Gastos Registrados</p>
                                <p className="text-xl font-bold text-gray-800">{month.expenseCount}</p>
                            </div>
                        </div>
                    )}
                </div>
            ))
        )}
      </div>
    </div>
  )
}