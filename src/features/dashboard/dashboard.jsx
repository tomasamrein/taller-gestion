import { useEffect, useState } from 'react'
import { getFinishedOrdersWithItems } from '../../services/orderService'
import { getExpenses } from '../../services/managementService'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Car, Wallet, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, gananciaNeta: 0 })
  const [chartData, setChartData] = useState([])
  const [recentActivity, setRecentActivity] = useState([]) // Lista mezclada

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    const ordenes = await getFinishedOrdersWithItems()
    const gastos = await getExpenses()

    // 1. Unificamos Ingresos y Egresos en una sola lista para el historial
    const movimientosIngresos = ordenes.map(o => {
        const total = o.order_items.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0)
        return {
            id: `ing-${o.id}`,
            date: o.delivery_date || new Date().toISOString(), // Fecha entrega o hoy
            description: `Servicio Taller #${o.id}`,
            amount: total,
            type: 'ingreso'
        }
    })

    const movimientosGastos = gastos.map(g => ({
        id: `gas-${g.id}`,
        date: g.date,
        description: g.description,
        amount: Number(g.amount),
        type: 'egreso'
    }))

    // Mezclamos y ordenamos por fecha (el más nuevo arriba)
    const mix = [...movimientosIngresos, ...movimientosGastos].sort((a, b) => new Date(b.date) - new Date(a.date))
    setRecentActivity(mix)

    // 2. Procesamos datos para el Gráfico (Igual que antes)
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

    // Totales
    const totalIngresos = Object.values(ingresosPorMes).reduce((a, b) => a + b, 0)
    const totalGastos = Object.values(egresosPorMes).reduce((a, b) => a + b, 0)
    setStats({ total: ordenes.length, gananciaNeta: totalIngresos - totalGastos })
  }

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Rentabilidad del Taller</h1>
        <p className="text-gray-500">Balance y últimos movimientos.</p>
      </div>

      {/* TARJETAS DE CONTADORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Autos Finalizados" value={stats.total} icon={Car} color="blue" />
        <StatCard title="Caja Neta (Ingresos - Gastos)" value={`$${stats.gananciaNeta.toLocaleString()}`} icon={Wallet} color={stats.gananciaNeta >= 0 ? "green" : "red"} />
        <StatCard title="Movimientos Totales" value={recentActivity.length} icon={TrendingUp} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: GRÁFICO (Ocupa 2 espacios) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="font-bold text-lg text-gray-700 mb-6">Flujo de Caja Mensual</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="Ingresos" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* COLUMNA DERECHA: HISTORIAL DETALLADO (El Feed) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-700">Últimos Movimientos</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-0">
                {recentActivity.length === 0 ? (
                    <p className="text-center text-gray-400 py-10">No hay movimientos aún.</p>
                ) : (
                    <table className="w-full">
                        <tbody className="divide-y">
                            {recentActivity.map((mov) => (
                                <tr key={mov.id} className="hover:bg-gray-50 transition">
                                    <td className="p-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mov.type === 'ingreso' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {mov.type === 'ingreso' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <p className="font-medium text-sm text-gray-800">{mov.description}</p>
                                        <p className="text-xs text-gray-400">{new Date(mov.date).toLocaleDateString()}</p>
                                    </td>
                                    <td className={`p-3 text-right font-bold text-sm ${mov.type === 'ingreso' ? 'text-green-600' : 'text-red-500'}`}>
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
    </div>
  )
}

// Componente Tarjeta simple
function StatCard({ title, value, icon: Icon, color }) {
  const colors = { blue: "bg-blue-100 text-blue-600", red: "bg-red-100 text-red-600", green: "bg-green-100 text-green-600", yellow: "bg-yellow-100 text-yellow-600" }
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${colors[color]}`}><Icon size={24} /></div>
    </div>
  )
}