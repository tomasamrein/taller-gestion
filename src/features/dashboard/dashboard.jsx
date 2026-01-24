import { useEffect, useState } from 'react'
import { getActiveOrders } from '../../services/orderService'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Car, Wrench, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    proceso: 0,
    terminados: 0
  })

  // Datos simulados para el gráfico (Para impresionar al cliente por ahora)
  const dataFacturacion = [
    { name: 'Ene', ingresos: 4000 },
    { name: 'Feb', ingresos: 3000 },
    { name: 'Mar', ingresos: 2000 },
    { name: 'Abr', ingresos: 2780 },
    { name: 'May', ingresos: 1890 },
    { name: 'Jun', ingresos: 2390 },
    { name: 'Jul', ingresos: 3490 },
  ]

  useEffect(() => {
    calcularEstadisticas()
  }, [])

  const calcularEstadisticas = async () => {
    // Usamos tu servicio existente
    const ordenes = await getActiveOrders() // Nota: Esto trae solo activas, idealmente haríamos un servicio getAllOrders
    
    // Calculamos rápido (esto es MVP)
    const pendientes = ordenes.filter(o => o.status === 'pendiente').length
    const proceso = ordenes.filter(o => o.status === 'en_proceso' || o.status === 'esperando_repuestos').length
    const terminados = ordenes.filter(o => o.status === 'finalizado').length // En tu logica actual
    
    setStats({
      total: ordenes.length,
      pendientes,
      proceso,
      terminados
    })
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Resumen General</h1>
        <p className="text-gray-500">Bienvenido al panel de control de tu taller.</p>
      </div>

      {/* TARJETAS DE CONTADORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Ingresados (Mes)" value={stats.total} icon={Car} color="blue" />
        <StatCard title="Sin Revisar" value={stats.pendientes} icon={AlertCircle} color="red" />
        <StatCard title="En Reparación" value={stats.proceso} icon={Wrench} color="yellow" />
        <StatCard title="Listos / Entregados" value={stats.terminados} icon={CheckCircle} color="green" />
      </div>

      {/* SECCIÓN DE GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico Principal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-700">Facturación Estimada (Semestral)</h3>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <TrendingUp size={14} /> +12% vs mes anterior
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataFacturacion}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="ingresos" stroke="#3B82F6" fillOpacity={1} fill="url(#colorIngresos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista Lateral de Accesos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-700 mb-4">Accesos Rápidos</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition flex justify-between items-center group">
              <span className="font-medium">📅 Ver Turnos</span>
              <span className="text-gray-400 group-hover:text-blue-500">→</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition flex justify-between items-center group">
              <span className="font-medium">📦 Pedir Repuestos</span>
              <span className="text-gray-400 group-hover:text-blue-500">→</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition flex justify-between items-center group">
              <span className="font-medium">📄 Exportar Excel</span>
              <span className="text-gray-400 group-hover:text-blue-500">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente pequeño para las tarjetas de arriba
function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
    green: "bg-green-100 text-green-600",
  }
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon size={24} />
      </div>
    </div>
  )
}