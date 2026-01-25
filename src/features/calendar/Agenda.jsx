import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Calendar, Clock, Plus, Trash2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Agenda() {
  const [appointments, setAppointments] = useState([])
  const [newApp, setNewApp] = useState({ client_name: '', date: '', time: '', note: '' })

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await supabase.from('appointments').select('*').order('date', { ascending: true })
    setAppointments(data || [])
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if(!newApp.client_name || !newApp.date || !newApp.time) return toast.error('Faltan datos')

    // Combinar fecha y hora
    const fullDate = new Date(`${newApp.date}T${newApp.time}`)

    await toast.promise(
        supabase.from('appointments').insert([{
            client_name: newApp.client_name,
            date: fullDate.toISOString(),
            note: newApp.note
        }]),
        {
            loading: 'Agendando...',
            success: 'Turno agendado',
            error: 'Error'
        }
    )
    
    setNewApp({ client_name: '', date: '', time: '', note: '' })
    load()
  }

  const handleDelete = async (id) => {
    if(confirm('¿Borrar turno?')) {
        await supabase.from('appointments').delete().eq('id', id)
        toast.success('Turno eliminado')
        load()
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Calendar className="text-orange-600" /> Agenda de Turnos
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: FORMULARIO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 h-fit">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-orange-600"/> Nuevo Turno
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Cliente</label>
                    <input className="border p-2 rounded w-full bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500" value={newApp.client_name} onChange={e => setNewApp({...newApp, client_name: e.target.value})} placeholder="Ej: Juan Pérez" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Fecha</label>
                    <input type="date" className="border p-2 rounded w-full bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500" value={newApp.date} onChange={e => setNewApp({...newApp, date: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Hora</label>
                    <input type="time" className="border p-2 rounded w-full bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500" value={newApp.time} onChange={e => setNewApp({...newApp, time: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Nota (Opcional)</label>
                    <input className="border p-2 rounded w-full bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500" value={newApp.note} onChange={e => setNewApp({...newApp, note: e.target.value})} placeholder="Ej: Cambio de pastillas" />
                </div>
                <button className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700 shadow-lg">Agendar</button>
            </form>
        </div>

        {/* COLUMNA 2: LISTA DE TURNOS */}
        <div className="md:col-span-2 space-y-4">
            {appointments.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-400">No hay turnos próximos.</p>
                </div>
            ) : (
                appointments.map(app => {
                    const d = new Date(app.date)
                    const isToday = new Date().toDateString() === d.toDateString()

                    return (
                        <div key={app.id} className={`bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center transition ${isToday ? 'border-l-4 border-l-orange-500' : 'border-gray-100'}`}>
                            <div className="flex gap-4 items-center">
                                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg ${isToday ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                                    <span className="text-xs font-bold uppercase">{d.toLocaleString('es-AR', { month: 'short' })}</span>
                                    <span className="text-2xl font-bold leading-none">{d.getDate()}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">{app.client_name}</h4>
                                    <p className="text-gray-500 text-sm flex items-center gap-1">
                                        <Clock size={14} /> {d.getHours()}:{d.getMinutes().toString().padStart(2, '0')} hs
                                        {app.note && <span className="text-gray-400">• {app.note}</span>}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(app.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={20}/></button>
                        </div>
                    )
                })
            )}
        </div>
      </div>
    </div>
  )
}