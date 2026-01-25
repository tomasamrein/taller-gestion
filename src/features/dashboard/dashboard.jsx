import { useEffect, useState } from 'react'
import { getFinishedOrdersWithItems, getActiveOrders } from '../../services/orderService'
import { getExpenses } from '../../services/managementService'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Car, Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, LifeBuoy, Wrench } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, gananciaNeta: 0, pendientes: 0 })
  const [chartData, setChartData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  // Función para arreglar el bug de fechas (GMT-3)
  const fixDate = (dateString) => {
    if (!dateString) return new Date()
    if (dateString.includes('T')) return new Date(dateString)
    return new Date(`${dateString}T12:00:00`)
  }

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    const ordenesFinalizadas = await getFinishedOrdersWithItems()
    const ordenesActivas = await getActiveOrders()
    const gastos = await getExpenses()

    // 1. Ingresos
    const movimientosIngresos = ordenesFinalizadas.map(o => {
        const total = o.order_items.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0)
        return {
            id: `ing-${o.id}`,
            date: o.delivery_date || o.created_at,
            description: `Servicio ${o.vehicles?.brand} ${o.vehicles?.model}`,
            amount: total,
            type: 'ingreso'
        }
    })

    // 2. Gastos
    const movimientosGastos = gastos.map(g => ({
        id: `gas-${g.id}`,
        date: g.date,
        description: g.description,
        amount: Number(g.amount),
        type: 'egreso'
    }))

    // 3. Mezcla Cronológica Correcta
    const mix = [...movimientosIngresos, ...movimientosGastos].sort((a, b) => {
        return fixDate(b.date) - fixDate(a.date)
    })
    setRecentActivity(mix)

    // 4. Datos para el Gráfico
    const ingresosPorMes = {}
    movimientosIngresos.forEach(m => {
      const mes = fixDate(m.date).toLocaleString('es-AR', { month: 'short' })
      ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + m.amount
    })
    
    const egresosPorMes = {}
    movimientosGastos.forEach(m => {
        const mes = fixDate(m.date).toLocaleString('es-AR', { month: 'short' })
        egresosPorMes[mes] = (egresosPorMes[mes] || 0) + m.amount
    })

    const meses = [...new Set([...Object.keys(ingresosPorMes), ...Object.keys(egresosPorMes)])]
    const dataFinal = meses.map(mes => ({
      name: mes.toUpperCase(),
      Ingresos: ingresosPorMes[mes] || 0,
      Gastos: egresosPorMes[mes] || 0,
    }))
    setChartData(dataFinal)

    // 5. Totales
    const totalIngresos = Object.values(ingresosPorMes).reduce((a, b) => a + b, 0)
    const totalGastos = Object.values(egresosPorMes).reduce((a, b) => a + b, 0)
    const totalPendientes = ordenesActivas.filter(o => o.status !== 'finalizado').length

    setStats({ 
        total: ordenesFinalizadas.length, 
        gananciaNeta: totalIngresos - totalGastos,
        pendientes: totalPendientes
    })
  }

  return (
    <div className="animate-fade-in space-y-6 pb-10 relative">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Rentabilidad del Taller</h1>
        <p className="text-gray-500 text-sm lg:text-base">Resumen de caja y actividad.</p>
      </div>

      {/* TARJETAS DE CONTADORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Autos Entregados" value={stats.total} icon={Car} color="slate" />
        <StatCard title="En Taller Ahora" value={stats.pendientes} icon={Wrench} color="orange" />
        <StatCard title="Caja Neta" value={`$${stats.gananciaNeta.toLocaleString()}`} icon={Wallet} color={stats.gananciaNeta >= 0 ? "green" : "red"} />
        <StatCard title="Movimientos" value={recentActivity.length} icon={TrendingUp} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* GRÁFICO (Ahora ocupa más espacio al sacar la torta) */}
        <div className="lg:col-span-3 bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-700 mb-6 border-l-4 border-orange-500 pl-3">Ingresos vs Gastos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Legend />
              <Bar dataKey="Ingresos" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HISTORIAL DETALLADO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[400px]">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Últimos Movimientos Financieros</h3>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold">{recentActivity.length} regs</span>
        </div>
        
        <div className="overflow-y-auto overflow-x-auto flex-1 p-0">
            {recentActivity.length === 0 ? (
                <p className="text-center text-gray-400 py-10">Sin movimientos.</p>
            ) : (
                <table className="w-full">
                    <tbody className="divide-y">
                        {recentActivity.map((mov) => (
                            <tr key={mov.id} className="hover:bg-orange-50 transition">
                                <td className="p-4 w-12">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mov.type === 'ingreso' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {mov.type === 'ingreso' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="font-bold text-sm text-gray-800">{mov.description}</p>
                                    <p className="text-xs uppercase font-bold text-gray-400">{fixDate(mov.date).toLocaleDateString()}</p>
                                </td>
                                <td className={`p-4 text-right font-bold text-sm whitespace-nowrap ${mov.type === 'ingreso' ? 'text-green-600' : 'text-red-500'}`}>
                                    {mov.type === 'ingreso' ? '+' : '-'} ${mov.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>

      <a href="https://wa.me/5493437479134" target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-full shadow-xl hover:bg-orange-600 transition-all duration-300 flex items-center gap-2 text-sm font-bold z-50 hover:scale-105 group border-2 border-slate-700 hover:border-orange-500">
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
      green: "bg-green-50 text-green-600 border-green-100", 
      slate: "bg-slate-50 text-slate-600 border-slate-100" 
  }
  return (
    <div className={`bg-white p-5 rounded-xl shadow-sm border flex items-center justify-between ${colors[color].replace('bg-', 'border-')}`}>
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${colors[color]}`}><Icon size={24} /></div>
    </div>
  )
}