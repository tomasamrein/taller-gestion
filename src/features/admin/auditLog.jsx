import { useEffect, useState, useMemo } from 'react'
import { getAuditLogs } from '../../services/auditService'
import { Search, Filter, ShieldAlert, RefreshCw, TrendingUp, TrendingDown, Settings, Users, ShoppingCart, FileCheck, XCircle, CheckCircle, AlertTriangle, DollarSign, Clock } from 'lucide-react'

const getActionIcon = (action) => {
  if (action.includes('GASTO')) return <DollarSign size={16} />
  if (action.includes('ORDEN') || action.includes('TRABAJO')) return <ShoppingCart size={16} />
  if (action.includes('CLIENTE') || action.includes('VEHICULO')) return <Users size={16} />
  if (action.includes('APROBAR')) return <CheckCircle size={16} />
  if (action.includes('RECHAZAR') || action.includes('ERROR')) return <XCircle size={16} />
  if (action.includes('SOLICITUD')) return <AlertTriangle size={16} />
  if (action.includes('USER') || action.includes('USUARIO')) return <Settings size={16} />
  return <Clock size={16} />
}

const getActionColor = (action, status) => {
  if (status === 'error') return 'bg-red-100 text-red-700 border-red-200'
  if (status === 'warning') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  if (action.includes('APROBAR') || action.includes('COBRO') || action.includes('INGRESO')) return 'bg-green-100 text-green-700 border-green-200'
  if (action.includes('RECHAZAR') || action.includes('ELIMINAR')) return 'bg-red-100 text-red-700 border-red-200'
  if (action.includes('SOLICITUD')) return 'bg-purple-100 text-purple-700 border-purple-200'
  if (action.includes('CREAR') || action.includes('REGISTRAR')) return 'bg-blue-100 text-blue-700 border-blue-200'
  return 'bg-gray-100 text-gray-700 border-gray-200'
}

const getActionLabel = (action) => {
  const labels = {
    'GASTO_DIRECTO': 'Gasto Registrado',
    'SOLICITUD_GASTO': 'Solicitud de Gasto',
    'APROBAR_GASTO': 'Aprobó Gasto',
    'RECHAZAR_GASTO': 'Rechazó Gasto',
    'CREAR_ORDEN': 'Nueva Orden de Trabajo',
    'ORDEN_FINALIZADA': 'Orden Finalizada',
    'ORDEN_ENTREGADA': 'Vehículo Entregado',
    'PRESUPUESTO_FINALIZADO': 'Presupuesto Finalizado',
    'CREAR_CLIENTE': 'Nuevo Cliente',
    'CREAR_VEHICULO': 'Nuevo Vehículo',
    'CREAR_USUARIO': 'Usuario Creado',
    'ACTUALIZAR_USUARIO': 'Usuario Actualizado',
    'DESACTIVAR_USUARIO': 'Usuario Desactivado'
  }
  return labels[action] || action.replace(/_/g, ' ')
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const load = async () => {
    setLoading(true)
    const { data, error } = await getAuditLogs()
    if (error) {
      console.error('Error cargando logs:', error)
    } else {
      setLogs(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filteredLogs = useMemo(() => {
    let filtered = logs

    if (filterType !== 'all') {
      if (filterType === 'gastos') filtered = filtered.filter(l => l.action.includes('GASTO'))
      if (filterType === 'ordenes') filtered = filtered.filter(l => l.action.includes('ORDEN') || l.action.includes('TRABAJO') || l.action.includes('PRESUPUESTO'))
      if (filterType === 'usuarios') filtered = filtered.filter(l => l.action.includes('USUARIO') || l.action.includes('CLIENTE') || l.action.includes('VEHICULO'))
      if (filterType === 'autorizaciones') filtered = filtered.filter(l => l.action.includes('SOLICITUD') || l.action.includes('APROBAR') || l.action.includes('RECHAZAR'))
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(l => 
        l.user_name?.toLowerCase().includes(term) ||
        l.action?.toLowerCase().includes(term) ||
        l.details?.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [logs, searchTerm, filterType])

  const stats = useMemo(() => ({
    total: logs.length,
    gastos: logs.filter(l => l.action.includes('GASTO')).length,
    ordenes: logs.filter(l => l.action.includes('ORDEN') || l.action.includes('TRABAJO')).length,
    autorizaciones: logs.filter(l => l.action.includes('SOLICITUD')).length
  }), [logs])

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="text-orange-600" /> Registro de Auditoría
          </h1>
          <p className="text-gray-500 text-sm mt-1">Seguimiento de todas las acciones del sistema</p>
        </div>
        <button onClick={load} className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-600 hover:text-orange-600 hover:border-orange-300 transition flex items-center gap-2 shadow-sm">
          <RefreshCw size={18} /> Actualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase">Total Acciones</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase">Gastos</p>
          <p className="text-2xl font-bold text-red-600">{stats.gastos}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase">Órdenes</p>
          <p className="text-2xl font-bold text-blue-600">{stats.ordenes}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase">Autorizaciones</p>
          <p className="text-2xl font-bold text-purple-600">{stats.autorizaciones}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por usuario, acción o detalles..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'gastos', label: 'Gastos', icon: DollarSign },
              { id: 'ordenes', label: 'Órdenes', icon: ShoppingCart },
              { id: 'autorizaciones', label: 'Autorizaciones', icon: AlertTriangle },
              { id: 'usuarios', label: 'Usuarios', icon: Users }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${
                  filterType === filter.id 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.icon && <filter.icon size={14} />}
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ShieldAlert size={40} className="mx-auto mb-2 opacity-50" />
            <p>No hay registros para mostrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                <tr>
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Acción</th>
                  <th className="p-4">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-orange-50/50 transition">
                    <td className="p-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {new Date(log.created_at).toLocaleDateString('es-AR')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(log.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}hs
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                          {(log.user_name || 'S')[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-800">{log.user_name || 'Sistema'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${getActionColor(log.action, log.status)}`}>
                        {getActionIcon(log.action)}
                        {getActionLabel(log.action)}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-md">
                      <p className="truncate" title={log.details}>{log.details || '-'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-center text-gray-400 text-xs mt-4">
        Mostrando los últimos {filteredLogs.length} registros
      </p>
    </div>
  )
}