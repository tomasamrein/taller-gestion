import { useEffect, useState } from 'react'
import { getFinishedOrdersWithItems } from '../../services/orderService'
import { getExpenses } from '../../services/managementService'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Car, Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, LifeBuoy } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, gananciaNeta: 0 })
  const [chartData, setChartData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    const ordenes = await getFinishedOrdersWithItems()
    const gastos = await getExpenses()

    // Procesar Ingresos
    const movimientosIngresos = ordenes.map(o => {
        const total = o.order_items.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0)
        return {
            id: `ing-${o.id}`,
            date: o.delivery_date || new Date().toISOString(),
            description: `Servicio Taller #${o.id}`,
            amount: total,
            type: 'ingreso'
        }
    })

    // Procesar Gastos
    const movimientosGastos = gastos.map(g => ({
        id: `gas-${g.id}`,
        date: g.date,
        description: g.description,
        amount: Number(g.amount),
        type: 'egreso'
    }))

    // Mezclar y Ordenar (Feed de Actividad)
    const mix = [...movimientosIngresos, ...movimientosGastos].sort((a, b) => new Date(b.date) - new Date(a.date))
    setRecentActivity(mix)

    // Agrupar por Mes para el Gráfico
    const ingresosPorMes = {}
    movimientosIngresos.forEach(m => {
      const mes = new Date(m.date).toLocaleString('es-AR', { month: 'short' })
      ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + m.amount
    })
    
    const egresosPorMes = {}
    movimientosGastos.forEach(m => {
        const mes = new Date(m.date).toLocaleString('es-AR', { month: 'short' })
        egresosPorMes[mes] = (egresosPorMes[mes] || 0) + m.amount
    })

    const meses = [...new Set([...Object.keys(ingresosPorMes), ...Object.keys(egresosPorMes)])]
    const dataFinal = meses.map(mes => ({
      name: mes.toUpperCase(),
      Ingresos: ingresosPorMes[mes] || 0,
      Gastos: egresosPorMes[mes] || 0,
    }))
    setChartData(dataFinal)

    // Calcular Totales Generales
    const totalIngresos = Object.values(ingresosPorMes).reduce((a, b) => a + b, 0)
    const totalGastos = Object.values(egresosPorMes).reduce((a, b) => a + b, 0)
    setStats({ total: ordenes.length, gananciaNeta: totalIngresos - totalGastos })
  }

  return (
    <div className="animate-fade-in space-y-6 pb-10 relative">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Rentabilidad del Taller</h1>
        <p className="text-gray-500 text-sm lg:text-base">Balance y últimos movimientos.</p>
      </div>

      {/* TARJETAS DE CONTADORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <StatCard title="Autos Finalizados" value={stats.total} icon={Car} color="orange" />
        <StatCard title="Caja Neta" value={`$${stats.gananciaNeta.toLocaleString()}`} icon={Wallet} color={stats.gananciaNeta >= 0 ? "green" : "red"} />
        <StatCard title="Movimientos" value={recentActivity.length} icon={TrendingUp} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* COLUMNA IZQUIERDA: GRÁFICO */}
        <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100 min-h-[350px]">
          <h3 className="font-bold text-lg text-gray-700 mb-6">Flujo de Caja Mensual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}} />
              <Legend />
              <Bar dataKey="Ingresos" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* COLUMNA DERECHA: HISTORIAL DETALLADO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-700">Últimos Movimientos</h3>
            </div>
            
            {/* TABLA SCROLLEABLE */}
            <div className="overflow-y-auto overflow-x-auto flex-1 p-0">
                {recentActivity.length === 0 ? (
                    <p className="text-center text-gray-400 py-10">Sin movimientos.</p>
                ) : (
                    <table className="w-full">
                        <tbody className="divide-y">
                            {recentActivity.map((mov) => (
                                <tr key={mov.id} className="hover:bg-gray-50 transition">
                                    <td className="p-3 w-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mov.type === 'ingreso' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {mov.type === 'ingreso' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <p className="font-bold text-sm text-gray-700 line-clamp-1">{mov.description}</p>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">{new Date(mov.date).toLocaleDateString()}</p>
                                    </td>
                                    <td className={`p-3 text-right font-bold text-sm whitespace-nowrap ${mov.type === 'ingreso' ? 'text-green-600' : 'text-red-500'}`}>
                                        {mov.type === 'ingreso' ? '+' : '-'} ${mov.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
      </div>

      {/* --- BOTÓN FLOTANTE DE SOPORTE --- */}
      <a
        href="https://wa.me/5493437479134?text=Hola,%20tengo%20una%20consulta%20sobre%20el%20sistema"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-full shadow-xl hover:bg-orange-600 transition-all duration-300 flex items-center gap-2 text-sm font-bold z-50 hover:scale-105 group"
      >
        <LifeBuoy size={20} className="group-hover:animate-spin-slow" />
        <span>Soporte</span>
      </a>

    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = { 
      orange: "bg-orange-100 text-orange-600", 
      red: "bg-red-100 text-red-600", 
      green: "bg-green-100 text-green-600", 
      slate: "bg-slate-100 text-slate-600" 
  }
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${colors[color]}`}><Icon size={24} /></div>
    </div>
  )
}