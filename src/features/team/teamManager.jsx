import { useEffect, useState } from 'react'
import { getUsers, createUser, deleteUser } from '../../services/authService'
import { Users, Trash2, Shield, Wrench } from 'lucide-react'

export default function TeamManager() {
  const [users, setUsers] = useState([])
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'empleado' })

  useEffect(() => { load() }, [])
  const load = async () => { setUsers(await getUsers()) }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newUser.username || !newUser.password) return alert('Completar datos')
    
    try {
      await createUser(newUser)
      setNewUser({ username: '', password: '', full_name: '', role: 'empleado' })
      load()
    } catch (error) {
      alert('Error: Quizás el usuario ya existe')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar acceso a este empleado?')) {
      await deleteUser(id)
      load()
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Users className="text-orange-600" /> Gestión de Equipo
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Alta */}
        <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
          <h2 className="font-bold text-lg mb-4 text-gray-700">Nuevo Usuario</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500">Nombre Real</label>
              <input className="w-full border p-2 rounded" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} placeholder="Ej: Juan Pérez" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Usuario (Login)</label>
              <input className="w-full border p-2 rounded" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} placeholder="Ej: juanp" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Contraseña</label>
              <input className="w-full border p-2 rounded" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Rol / Permisos</label>
              <select className="w-full border p-2 rounded bg-white" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                <option value="empleado">Empleado (Limitado)</option>
                <option value="admin">Administrador (Total)</option>
              </select>
            </div>
            <button className="w-full bg-slate-800 text-white py-2 rounded font-bold hover:bg-slate-700">Crear Acceso</button>
          </form>
        </div>

        {/* Lista de Usuarios */}
        <div className="lg:col-span-2 space-y-4">
          {users.map(u => (
            <div key={u.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                  {u.role === 'admin' ? <Shield size={24} /> : <Wrench size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{u.full_name}</h3>
                  <p className="text-sm text-gray-500">@{u.username} • <span className="uppercase text-xs font-bold">{u.role}</span></p>
                </div>
              </div>
              
              {/* No permitimos borrar al admin principal para no bloquearnos */}
              {u.username !== 'admin' && (
                <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded transition">
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}