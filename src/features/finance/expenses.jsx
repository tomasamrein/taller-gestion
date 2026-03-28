import { useEffect, useState, useCallback } from 'react'
import { getExpenses, createExpense, deleteExpense } from '../../services/managementService'
import { TrendingDown, Trash2, Wallet, AlertCircle, Lock, RefreshCw, Plus, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const RECURRING_TEMPLATES_KEY = 'recurring_expense_templates'

export default function Expenses({ userRole, userName }) {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState({ description: '', amount: '', category: 'Varios' })
  const [templates, setTemplates] = useState([])
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    const savedTemplates = localStorage.getItem(RECURRING_TEMPLATES_KEY)
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates))
    }
  }, [])

  const load = useCallback(async () => { 
    const { data, error } = await getExpenses()
    if (error) {
      toast.error('Error al cargar gastos')
      return
    }
    const sortedData = (data || []).sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        if (dateA !== dateB) return dateB - dateA
        return b.id - a.id
    })
    setExpenses(sortedData) 
  }, [])

  useEffect(() => { load() }, [load])

  const saveTemplate = () => {
    if (!form.description || !form.amount) {
      toast.error('Completá descripción y monto para guardar como recurrente')
      return
    }

    const newTemplate = {
      id: Date.now(),
      description: form.description,
      amount: Number(form.amount),
      category: form.category
    }

    const updatedTemplates = [...templates, newTemplate]
    setTemplates(updatedTemplates)
    localStorage.setItem(RECURRING_TEMPLATES_KEY, JSON.stringify(updatedTemplates))
    toast.success('Gasto guardado como recurrente!')
  }

  const deleteTemplate = (templateId) => {
    if (!confirm('¿Eliminar este gasto recurrente?')) return
    
    const updatedTemplates = templates.filter(t => t.id !== templateId)
    setTemplates(updatedTemplates)
    localStorage.setItem(RECURRING_TEMPLATES_KEY, JSON.stringify(updatedTemplates))
    toast.success('Plantilla eliminada')
  }

  const useTemplate = (template) => {
    setForm({
      description: template.description,
      amount: String(template.amount),
      category: template.category
    })
    setShowTemplates(false)
    toast.success(`Usando: ${template.description}`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.description || !form.amount) {
        return toast.error('Completá todos los campos')
    }

    const sessionStr = localStorage.getItem('user_session')
    const sessionUser = sessionStr ? JSON.parse(sessionStr) : null
    
    const realRole = sessionUser?.role || userRole
    const realName = sessionUser?.name || userName 

    const { error } = await createExpense(form, realRole, realName)
    
    if (error) {
      toast.error('Error al guardar')
      return
    }
    
    toast.success(realRole === 'admin' ? 'Gasto registrado' : 'Enviado a aprobación')
    setForm({ description: '', amount: '', category: 'Varios' })
    load()
  }

  const handleDelete = async (id, status) => {
    const mensaje = status === 'approved' 
        ? 'CUIDADO! Estás por borrar un gasto YA APROBADO. Esto modificará el total de la caja. Estás seguro?'
        : '¿Borrar este gasto pendiente?'

    if(window.confirm(mensaje)) { 
      const { error } = await deleteExpense(id)
      if (error) {
        toast.error('Error al eliminar')
        return
      }
      load()
      toast.success('Gasto eliminado')
    }
  }

  const totalGastos = expenses
    .filter(e => e.status === 'approved') 
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm">
          <h3 className="text-gray-500 font-bold uppercase text-xs flex items-center gap-2 tracking-wider">
            <TrendingDown size={16} className="text-red-500" /> Total Egresos (Aprobados)
          </h3>
          <p className="text-3xl lg:text-4xl font-bold text-gray-800 mt-2">${totalGastos.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Wallet size={18} className="text-orange-500"/> Registrar Gasto
            </h3>
            {templates.length > 0 && (
              <button 
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-blue-100 transition"
              >
                <RefreshCw size={12} /> {templates.length} recurrent{templates.length > 1 ? 'es' : ''}
              </button>
            )}
          </div>

          {showTemplates && templates.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-blue-700">Gastos Recurrentes</span>
                <button onClick={saveTemplate} className="text-xs text-blue-600 font-bold hover:underline">
                  + Guardar actual
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {templates.map(t => (
                  <div key={t.id} className="flex justify-between items-center bg-white p-2 rounded border border-blue-100">
                    <button 
                      onClick={() => useTemplate(t)}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm font-bold text-gray-700">{t.description}</p>
                      <p className="text-xs text-gray-500">${t.amount.toLocaleString()} • {t.category}</p>
                    </button>
                    <button 
                      onClick={() => deleteTemplate(t.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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

            {form.description && form.amount && !showTemplates && (
              <button 
                type="button"
                onClick={saveTemplate}
                className="w-full border-2 border-dashed border-blue-300 text-blue-600 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Guardar como Recurrente
              </button>
            )}
          </form>
        </div>
      </div>

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
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-400">
                      No hay gastos registrados
                    </td>
                  </tr>
                ) : expenses.map(ex => (
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
