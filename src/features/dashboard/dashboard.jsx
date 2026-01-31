import { useEffect, useState } from 'react'
import { getFinishedOrdersWithItems, getActiveOrders } from '../../services/orderService'
import { getExpenses } from '../../services/managementService'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Car, Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, LifeBuoy, Wrench, Calendar, BarChart3 } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, gananciaNeta: 0, pendientes: 0 })
  const [chartData, setChartData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [viewMode, setViewMode] = useState('day') 

  const [rawData, setRawData] = useState({ orders: [], expenses: [] })

// Función auxiliar a prueba de errores
const fixDate = (dateString) => {
  // Si no hay fecha, devolvemos la fecha de hoy para que no explote
  if (!dateString) return new Date()
  
  // Si es un objeto Date real, lo devolvemos
  if (dateString instanceof Date) return dateString

  // Si tiene hora (T), la usamos
  if (dateString.includes('T')) return new Date(dateString)
  
  // Si es fecha vieja (sin hora), le ponemos mediodía
  return new Date(`${dateString}T12:00:00`)
}

  useEffect(() => { cargarDatosIniciales() }, [])

  useEffect(() => {
    if (rawData.orders.length > 0 || rawData.expenses.length > 0) {
        procesarGrafico(viewMode, rawData.orders, rawData.expenses)
    }
  }, [viewMode, rawData])

  const cargarDatosIniciales = async () => {
    try {
        const ordenesFinalizadas = await getFinishedOrdersWithItems() || []
        const ordenesActivas = await getActiveOrders() || []
        const todosLosGastos = await getExpenses() || []

        setRawData({ orders: ordenesFinalizadas, expenses: todosLosGastos })

        // --- ESTADÍSTICAS ---
        const hoy = new Date()
        const mesActual = hoy.getMonth()
        const anioActual = hoy.getFullYear()
        const esEsteMes = (d) => d.getMonth() === mesActual && d.getFullYear() === anioActual

        // Para totales ($) usamos la fecha de entrega/cobro
        const ordenesMes = ordenesFinalizadas.filter(o => esEsteMes(fixDate(o.delivery_date || o.created_at)))
        const gastosMes = todosLosGastos.filter(g => esEsteMes(fixDate(g.date)) && g.status === 'approved')

        // --- LISTA DE MOVIMIENTOS (FEED) ---
        // ACÁ ESTÁ EL CAMBIO: Usamos 'created_at' para la lista, así vemos la hora real de carga
        const ingresosLista = ordenesMes.map(o => ({
            id: `ing-${o.id}`,
            rawId: o.id,
            // PRIORIDAD: created_at para que tenga la hora exacta
            displayDate: o.created_at || o.delivery_date, 
            description: `Servicio ${o.vehicles?.brand || ''} ${o.vehicles?.model || ''}`,
            amount: o.order_items?.reduce((sum, i) => sum + (Number(i.unit_price) * Number(i.quantity)), 0) || 0,
            type: 'ingreso'
        }))

        const gastosLista = gastosMes.map(g => ({
            id: `gas-${g.id}`,
            rawId: g.id,
            // PRIORIDAD: created_at si existe, sino la fecha manual
            displayDate: g.created_at || g.date,
            description: g.description,
            amount: Number(g.amount),
            type: 'egreso'
        }))

        // ORDENAMIENTO ESTRICTO POR TIMESTAMP
        const mix = [...ingresosLista, ...gastosLista].sort((a, b) => {
            const dateA = new Date(a.displayDate).getTime()
            const dateB = new Date(b.displayDate).getTime()
            // Ordenar por milisegundos (el más nuevo arriba)
            return dateB - dateA
        })
        setRecentActivity(mix)

        // Totales de Dinero
        const totalIngresos = ingresosLista.reduce((s, i) => s + i.amount, 0)
        const totalGastos = gastosLista.reduce((s, g) => s + g.amount, 0)
        
        setStats({ 
            total: ordenesMes.length, 
            gananciaNeta: totalIngresos - totalGastos,
            pendientes: ordenesActivas.filter(o => o.status !== 'finalizado').length
        })

    } catch (error) {
        console.error("Error cargando datos:", error)
    }
  }

  const procesarGrafico = (modo, orders, expenses) => {
    const hoy = new Date()
    const anioActual = hoy.getFullYear()
    const mesActual = hoy.getMonth()
    let datosGrafico = {}

    const safeOrders = orders || []
    const safeExpenses = expenses.filter(g => g.status === 'approved') || []

    if (modo === 'day') {
        const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate()
        for(let i=1; i<=diasEnMes; i++) datosGrafico[i] = { name: `${i}`, Ingresos: 0, Gastos: 0, order: i }

        safeOrders.forEach(o => {
            const d = fixDate(o.delivery_date || o.created_at) // Gráfico usa fecha contable
            if (d.getMonth() === mesActual && d.getFullYear() === anioActual) {
                const dia = d.getDate()
                const total = o.order_items?.reduce((sum, i) => sum + (Number(i.unit_price) * Number(i.quantity)), 0) || 0
                if(datosGrafico[dia]) datosGrafico[dia].Ingresos += total
            }
        })

        safeExpenses.forEach(g => {
            const d = fixDate(g.date) // Gráfico usa fecha contable
            if (d.getMonth() === mesActual && d.getFullYear() === anioActual) {
                const dia = d.getDate()
                if(datosGrafico[dia]) datosGrafico[dia].Gastos += Number(g.amount)
            }
        })
    } 
    else if (modo === 'month') {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        meses.forEach((m, i) => datosGrafico[i] = { name: m, Ingresos: 0, Gastos: 0, order: i })

        safeOrders.forEach(o => {
            const d = fixDate(o.delivery_date || o.created_at)
            if (d.getFullYear() === anioActual) {
                const mes = d.getMonth()
                const total = o.order_items?.reduce((sum, i) => sum + (Number(i.unit_price) * Number(i.quantity)), 0) || 0
                datosGrafico[mes].Ingresos += total
            }
        })

        safeExpenses.forEach(g => {
            const d = fixDate(g.date)
            if (d.getFullYear() === anioActual) {
                const mes = d.getMonth()
                datosGrafico[mes].Gastos += Number(g.amount)
            }
        })
    } 
    else if (modo === 'semester') {
        datosGrafico[1] = { name: 'Semestre 1', Ingresos: 0, Gastos: 0, order: 1 }
        datosGrafico[2] = { name: 'Semestre 2', Ingresos: 0, Gastos: 0, order: 2 }
        const getSemestre = (mes) => mes < 6 ? 1 : 2

        safeOrders.forEach(o => {
            const d = fixDate(o.delivery_date || o.created_at)
            if (d.getFullYear() === anioActual) {
                const sem = getSemestre(d.getMonth())
                const total = o.order_items?.reduce((sum, i) => sum + (Number(i.unit_price) * Number(i.quantity)), 0) || 0
                datosGrafico[sem].Ingresos += total
            }
        })

        safeExpenses.forEach(g => {
            const d = fixDate(g.date)
            if (d.getFullYear() === anioActual) {
                const sem = getSemestre(d.getMonth())
                datosGrafico[sem].Gastos += Number(g.amount)
            }
        })
    }

    const dataFinal = Object.values(datosGrafico).sort((a,b) => a.order - b.order)
    setChartData(dataFinal)
  }

  return (
    <div className="animate-fade-in space-y-6 pb-10 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Panel de Control</h1>
            <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Estado general del taller
            </p>
        </div>
        
        <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex">
            {[
                { id: 'day', label: 'Día a Día' },
                { id: 'month', label: 'Mensual' },
                { id: 'semester', label: 'Semestral' }
            ].map((v) => (
                <button
                    key={v.id}
                    onClick={() => setViewMode(v.id)}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                        viewMode === v.id 
                        ? 'bg-orange-600 text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                >
                    {v.label}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Autos Entregados (Mes)" value={stats.total} icon={Car} color="slate" />
        <StatCard title="En Taller Ahora" value={stats.pendientes} icon={Wrench} color="orange" />
        <StatCard title="Caja Neta (Mes)" value={`$${stats.gananciaNeta.toLocaleString()}`} icon={Wallet} color={stats.gananciaNeta >= 0 ? "green" : "red"} />
        <StatCard title="Movimientos (Mes)" value={recentActivity.length} icon={TrendingUp} color="slate" />
      </div>

      <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-l-4 border-violet-500 pl-3">
             <BarChart3 className="text-violet-600" size={24}/>
             <div>
                <h3 className="font-bold text-lg text-gray-800">Análisis Financiero</h3>
                <p className="text-xs text-gray-400 font-medium uppercase">
                    Vista: {viewMode === 'day' ? 'Días del mes actual' : viewMode === 'month' ? 'Meses del año actual' : 'Semestres del año'}
                </p>
             </div>
          </div>
          
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} cursor={{fill: '#f9fafb'}}/>
              <Legend wrapperStyle={{paddingTop: '20px'}}/>
              <Bar dataKey="Ingresos" name="Ingresos" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={50} />
              <Bar dataKey="Gastos" name="Egresos" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[400px]">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Calendar size={18} className="text-gray-400"/>
                Actividad Reciente (Mes Actual)
            </h3>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold">{recentActivity.length} regs</span>
        </div>
        
        <div className="overflow-y-auto overflow-x-auto flex-1 p-0 custom-scrollbar">
            {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400 font-medium">Sin movimientos este mes.</p>
                </div>
            ) : (
                <table className="w-full">
                    <tbody className="divide-y divide-gray-50">
                        {recentActivity.map((mov) => (
                            <tr key={mov.id} className="hover:bg-violet-50/50 transition duration-150 group">
                                <td className="p-4 w-14">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${mov.type === 'ingreso' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        {mov.type === 'ingreso' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="font-bold text-sm text-gray-800 group-hover:text-violet-700 transition">{mov.description}</p>
                                    <p className="text-xs uppercase font-bold text-gray-400 flex items-center gap-1">
                                    {/* Usamos fixDate acá para proteger la fecha */}
                                    {fixDate(mov.displayDate).toLocaleDateString()}
                                    <span className="text-gray-300">•</span>
                                    {fixDate(mov.displayDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}hs
                                </p>
                                </td>
                                <td className={`p-4 text-right font-bold text-sm whitespace-nowrap ${mov.type === 'ingreso' ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {mov.type === 'ingreso' ? '+' : '-'} ${mov.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>
      
      {/* Botón Soporte */}
      <a href="https://wa.me/5493437479134" target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-full shadow-xl hover:bg-violet-600 transition-all duration-300 flex items-center gap-2 text-sm font-bold z-50 hover:scale-105 group border-2 border-slate-700 hover:border-violet-500">
        <LifeBuoy size={20} className="group-hover:animate-spin-slow" />
        <span className="hidden sm:inline">Soporte Técnico</span>
      </a>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = { 
      orange: "bg-orange-50 text-orange-600 border-orange-100", 
      red: "bg-red-50 text-red-600 border-red-100", 
      green: "bg-emerald-50 text-emerald-600 border-emerald-100", 
      slate: "bg-slate-50 text-slate-600 border-slate-100" 
  }
  return (
    <div className={`bg-white p-5 rounded-xl shadow-sm border flex items-center justify-between hover:shadow-md transition-shadow ${colors[color].replace('bg-', 'border-')}`}>
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800 tracking-tight">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${colors[color]}`}><Icon size={24} /></div>
    </div>
  )
}