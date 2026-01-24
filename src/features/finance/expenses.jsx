import { useEffect, useState } from 'react'
import { getExpenses, createExpense, deleteExpense } from '../../services/managementService' // <--- Import nuevo
import { DollarSign, TrendingDown, Trash2 } from 'lucide-react' // <--- Icono Trash2

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState({ description: '', amount: '', category: 'Varios' })

  useEffect(() => { load() }, [])
  const load = async () => { setExpenses(await getExpenses()) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createExpense(form)
    setForm({ description: '', amount: '', category: 'Varios' })
    load()
  }

  // --- NUEVA FUNCIÓN BORRAR ---
  const handleDelete = async (id) => {
    if(confirm('¿Borrar este gasto?')) {
      await deleteExpense(id)
      load()
    }
  }

  const totalGastos = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0)

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* ... (La parte del formulario igual que antes) ... */}
      <div className="space-y-6">
        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
          <h3 className="text-red-800 font-medium flex items-center gap-2">
            <TrendingDown size={20} /> Total Gastos (Mes)
          </h3>
          <p className="text-4xl font-bold text-red-600 mt-2">${totalGastos.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold mb-4">Registrar Salida</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
             {/* ... Inputs del formulario igual que antes ... */}
            <input placeholder="Descripción" className="w-full border p-2 rounded" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            <input type="number" placeholder="Monto" className="w-full border p-2 rounded" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
            <select className="w-full border p-2 rounded bg-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option>Insumos</option><option>Servicios</option><option>Alquiler</option><option>Varios</option>
            </select>
            <button className="w-full bg-slate-800 text-white py-2 rounded font-bold hover:bg-slate-700">Registrar</button>
          </form>
        </div>
      </div>

      {/* Lista Derecha con Botón Borrar */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4 text-left">Concepto</th>
              <th className="p-4 text-right">Monto</th>
              <th className="p-4 text-center">x</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {expenses.map(ex => (
              <tr key={ex.id} className="group hover:bg-gray-50">
                <td className="p-4 text-gray-500 text-sm">{ex.date}</td>
                <td className="p-4 font-medium">
                  {ex.description}
                  <span className="ml-2 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] uppercase">{ex.category}</span>
                </td>
                <td className="p-4 text-right font-bold text-red-500">- ${Number(ex.amount).toLocaleString()}</td>
                <td className="p-4 text-center">
                  <button onClick={() => handleDelete(ex.id)} className="text-gray-300 hover:text-red-500 transition">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}