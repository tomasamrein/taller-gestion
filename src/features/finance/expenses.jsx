import { useEffect, useState } from 'react'
import { getExpenses, createExpense, deleteExpense } from '../../services/managementService'
import { TrendingDown, Trash2, Wallet, AlertCircle, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Expenses({ userRole, userName }) {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState({ description: '', amount: '', category: 'Varios' })

  useEffect(() => { load() }, [])

  const load = async () => { 
    const data = await getExpenses()
    // FIX DE ORDEN: Ordenamos por fecha descendente (Más nuevo arriba)
    // Asumimos que la fecha viene en formato YYYY-MM-DD o ISO
    const sortedData = (data || []).sort((a, b) => new Date(b.date) - new Date(a.date))
    setExpenses(sortedData) 
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar campos
    if (!form.description || !form.amount) {
        return toast.error('Completá todos los campos')
    }

    await toast.promise(
        createExpense(form, userRole, userName),
        {
            loading: 'Procesando...',
            success: (data) => userRole === 'admin' ? 'Gasto guardado ✅' : 'Enviado a aprobación 👮‍♂️',
            error: 'Error al guardar',
        }
    )
    
    setForm({ description: '', amount: '', category: 'Varios' })
    load()
  }

  const handleDelete = async (id, status) => {
    // Si está aprobado, pedimos doble confirmación
    const mensaje = status === 'approved' 
        ? '⚠️ ¡CUIDADO! Estás por borrar un gasto YA APROBADO.\nEsto modificará el total de la caja.\n\n¿Estás seguro?'
        : '¿Borrar este gasto pendiente?'

    if(window.confirm(mensaje)) { 
        await deleteExpense(id); 
        load(); 
        toast.success('Gasto eliminado')
    }
  }

  // Calculamos solo los APROBADOS para el total (Caja Real)
  const totalGastos = expenses
    .filter(e => e.status === 'approved') 
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* Panel Izquierdo */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm">
          <h3 className="text-gray-500 font-bold uppercase text-xs flex items-center gap-2 tracking-wider">
            <TrendingDown size={16} className="text-red-500" /> Total Egresos (Aprobados)
          </h3>
          <p className="text-3xl lg:text-4xl font-bold text-gray-800 mt-2">${totalGastos.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
          <h3 className="font-bold mb-4 text-gray-700 flex items-center gap-2">
            <Wallet size={18} className="text-orange-500"/> Registrar Gasto
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input 
                placeholder="Descripción (ej: Luz)" 
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50 focus:bg-white transition" 
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} required 
            />
            <input 
                type="number" placeholder="Monto ($)" 
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50 focus:bg-white transition" 
                value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required 
            />
            <select 
                className="w-full border p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 outline-none" 
                value={form.category} onChange={e => setForm({...form, category: e.target.value})}
            >
              <option>Insumos</option><option>Servicios</option><option>Alquiler</option><option>Varios</option>
            </select>
            
            <button className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-700 shadow-lg transition transform active:scale-95">
                {userRole === 'admin' ? 'Registrar Salida' : 'Solicitar Aprobación'}
            </button>
          </form>
        </div>
      </div>

      {/* Lista Derecha */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold tracking-wider">
                <tr>
                <th className="p-4 text-left hidden sm:table-cell">Fecha</th>
                <th className="p-4 text-left">Concepto</th>
                <th className="p-4 text-right">Monto</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center"></th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {expenses.map(ex => (
                <tr key={ex.id} className="group hover:bg-orange-50 transition-colors">
                    <td className="p-4 text-gray-500 text-sm hidden sm:table-cell font-mono">{ex.date}</td>
                    <td className="p-4 font-medium text-gray-800">
                        <div className="flex flex-col">
                            <span>{ex.description}</span>
                            <span className="text-[10px] text-gray-400 uppercase sm:hidden font-bold tracking-wide mt-1">
                                {ex.category} • {ex.date.substring(5)}
                            </span>
                        </div>
                    </td>
                    <td className="p-4 text-right font-bold text-red-600 whitespace-nowrap">
                        - ${Number(ex.amount).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                        {ex.status === 'pending' ? (
                            <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center justify-center gap-1">
                                <AlertCircle size={10} /> Pendiente
                            </span>
                        ) : (
                            <span className="text-green-500 text-[10px] font-bold uppercase">Aprobado</span>
                        )}
                    </td>
                    
                    <td className="p-4 text-center">
                    {(userRole === 'admin' || ex.status === 'pending') ? (
                        <button 
                            onClick={() => handleDelete(ex.id, ex.status)} 
                            className="text-gray-400 hover:text-red-600 transition p-2"
                            title={ex.status === 'approved' ? "Borrar gasto aprobado (Cuidado)" : "Cancelar solicitud"}
                        >
                            <Trash2 size={18} />
                        </button>
                    ) : (
                        <div className="flex justify-center p-2" title="Gasto Aprobado (Solo el Admin puede borrarlo)">
                            <Lock size={16} className="text-gray-300" />
                        </div>
                    )}
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