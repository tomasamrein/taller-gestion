import { useEffect, useState } from 'react'
import { getFinishedOrdersWithItems, getActiveOrders } from '../../services/orderService'
import { getExpenses } from '../../services/managementService'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Car, Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, LifeBuoy, Wrench } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, gananciaNeta: 0, pendientes: 0 })
  const [chartData, setChartData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  // Función auxiliar para normalizar fechas y evitar problemas de zona horaria
  const fixDate = (dateString) => {
    if (!dateString) return new Date()
    if (dateString.includes('T')) return new Date(dateString)
    return new Date(`${dateString}T12:00:00`)
  }

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    const ordenesFinalizadas = await getFinishedOrdersWithItems()
    const ordenesActivas = await getActiveOrders()
    const todosLosGastos = await getExpenses()

    // --- 1. FILTRO DE MES ACTUAL ---
    const hoy = new Date()
    const mesActual = hoy.getMonth()
    const anioActual = hoy.getFullYear()

    const esEsteMes = (fechaStr) => {
        const d = fixDate(fechaStr)
        return d.getMonth() === mesActual && d.getFullYear() === anioActual
    }

    // Filtramos solo lo de este mes
    const ordenesMes = ordenesFinalizadas.filter(o => esEsteMes(o.delivery_date || o.created_at))
    // Filtramos gastos: Que sean de este mes Y que estén APROBADOS
    const gastosMes = todosLosGastos.filter(g => esEsteMes(g.date) && g.status === 'approved')

    // --- 2. PROCESAR DATOS ---
    const movimientosIngresos = ordenesMes.map(o => {
        const total = o.order_items.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0)
        return {
            id: `ing-${o.id}`, // ID compuesto para diferenciar
            rawId: o.id,      // ID real para desempatar
            date: o.delivery_date || o.created_at,
            description: `Servicio ${o.vehicles?.brand} ${o.vehicles?.model}`,
            amount: total,
            type: 'ingreso'
        }
    })

    const movimientosGastos = gastosMes.map(g => ({
        id: `gas-${g.id}`,
        rawId: g.id,
        date: g.date,
        description: g.description,
        amount: Number(g.amount),
        type: 'egreso'
    }))

    // --- 3. FIX ORDEN (Más nuevo ARRIBA + Desempate por ID) ---
    const mix = [...movimientosIngresos, ...movimientosGastos].sort((a, b) => {
        const dateA = fixDate(a.date).getTime()
        const dateB = fixDate(b.date).getTime()

        // Si las fechas son distintas, gana la más reciente
        if (dateA !== dateB) {
            return dateB - dateA
        }

        // Si las fechas son IGUALES (mismo día), gana el ID más alto (el último cargado)
        return b.rawId - a.rawId
    })
    
    setRecentActivity(mix)

    // Gráfico (Solo muestra días del mes actual)
    const datosGrafico = {}
    mix.forEach(m => {
        const dia = fixDate(m.date).getDate() // Día del mes (1, 2, 25...)
        if (!datosGrafico[dia]) datosGrafico[dia] = { name: `Día ${dia}`, Ingresos: 0, Gastos: 0 }
        
        if (m.type === 'ingreso') datosGrafico[dia].Ingresos += m.amount
        else datosGrafico[dia].Gastos += m.amount
    })
    
    // Ordenamos gráfico por día (1 al 31)
    const dataFinal = Object.values(datosGrafico).sort((a,b) => 
        parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1])
    )
    setChartData(dataFinal)

    // Totales
    const totalIngresos = movimientosIngresos.reduce((sum, m) => sum + m.amount, 0)
    const totalGastos = movimientosGastos.reduce((sum, m) => sum + m.amount, 0)
    
    // Pendientes no se filtran por mes, son los que hay AHORA en el taller
    const totalPendientes = ordenesActivas.filter(o => o.status !== 'finalizado').length

    setStats({ 
        total: ordenesMes.length, 
        gananciaNeta: totalIngresos - totalGastos,
        pendientes: totalPendientes
    })
  }

  return (
    <div className="animate-fade-in space-y-6 pb-10 relative">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Tablero de Mando</h1>
        <p className="text-gray-500 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Viendo actividad de <b>{new Date().toLocaleString('es-AR', { month: 'long' }).toUpperCase()}</b>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Autos Entregados (Mes)" value={stats.total} icon={Car} color="slate" />
        <StatCard title="En Taller Ahora" value={stats.pendientes} icon={Wrench} color="orange" />
        <StatCard title="Caja Neta (Mes)" value={`$${stats.gananciaNeta.toLocaleString()}`} icon={Wallet} color={stats.gananciaNeta >= 0 ? "green" : "red"} />
        <StatCard title="Movimientos (Mes)" value={recentActivity.length} icon={TrendingUp} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-3 bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-700 mb-6 border-l-4 border-orange-500 pl-3">Flujo de Caja (Día a Día)</h3>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[400px]">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Movimientos del Mes</h3>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold">{recentActivity.length} regs</span>
        </div>
        
        <div className="overflow-y-auto overflow-x-auto flex-1 p-0">
            {recentActivity.length === 0 ? (
                <p className="text-center text-gray-400 py-10">Sin movimientos este mes.</p>
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