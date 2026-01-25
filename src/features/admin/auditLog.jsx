import { useEffect, useState } from 'react'
import { getAuditLogs } from '../../services/auditService'
import { ShieldAlert, RefreshCw } from 'lucide-react'

export default function AuditLog() {
  const [logs, setLogs] = useState([])

  useEffect(() => { load() }, [])
  const load = async () => { setLogs(await getAuditLogs()) }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="text-orange-600" /> Registro de Auditoría
        </h1>
        <button onClick={load} className="text-gray-500 hover:text-orange-600 transition"><RefreshCw size={20}/></button>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-700 text-slate-300 font-mono text-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-black text-orange-500 uppercase text-xs tracking-wider border-b border-slate-700">
                    <tr>
                        <th className="p-4">Hora</th>
                        <th className="p-4">Usuario</th>
                        <th className="p-4">Acción</th>
                        <th className="p-4">Detalles</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {logs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-800 transition">
                            <td className="p-4 text-slate-500 whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="p-4 font-bold text-white">
                                {log.user_name}
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                    log.status === 'error' ? 'bg-red-900 text-red-200' : 
                                    log.status === 'warning' ? 'bg-yellow-900 text-yellow-200' : 
                                    'bg-blue-900 text-blue-200'
                                }`}>
                                    {log.action}
                                </span>
                            </td>
                            <td className="p-4 text-slate-400">
                                {log.details}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}