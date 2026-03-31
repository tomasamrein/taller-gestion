import { useEffect, useState, useCallback } from 'react'
import { createUser } from '../../services/authService'
import { getUsers, updateUserRole, disableUser } from '../../services/userService'
import { Users, Trash2, Shield, Wrench, Plus, X, Check, UserPlus, Eye, EyeOff, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeamManager({ userRole: currentUserRole }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [newUser, setNewUser] = useState({ email: '', password: '', fullName: '', role: 'empleado' })
  const [showPassword, setShowPassword] = useState(false)

  const isSupervisor = currentUserRole === 'supervisor'

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await getUsers()
    if (error) {
      toast.error('Error al cargar usuarios')
    } else {
      setUsers(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e) => {
    e.preventDefault()
    
    if (!newUser.email || !newUser.password || !newUser.fullName) {
      return toast.error('Completar todos los campos')
    }
    
    if (newUser.password.length < 6) {
      return toast.error('La contraseña debe tener al menos 6 caracteres')
    }

    const { error } = await createUser({
      email: newUser.email,
      password: newUser.password,
      fullName: newUser.fullName,
      role: newUser.role
    })
    
    if (error) {
      toast.error(error)
    } else {
      toast.success('Usuario creado exitosamente')
      setNewUser({ email: '', password: '', fullName: '', role: 'empleado' })
      setIsModalOpen(false)
      load()
    }
  }

  const handleDelete = async (user) => {
    if (user.role === 'supervisor') {
      toast.error('No se puede desactivar al Supervisor')
      return
    }
    
    const mensaje = user.role === 'admin' 
      ? `¿Desactivar al administrador "${user.full_name}"? No podrá acceder hasta que un admin lo reactive.`
      : `¿Desactivar al usuario "${user.full_name}"? No podrá acceder hasta que un admin lo reactive.`

    if (!confirm(mensaje)) return

    const { error } = await disableUser(user.auth_id)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Usuario desactivado')
      load()
    }
  }

  const handleRoleChange = async (user, newRole) => {
    if (user.role === 'supervisor') {
      toast.error('No se puede cambiar el rol del Supervisor')
      return
    }
    
    if (!confirm(`¿Cambiar el rol de "${user.full_name}" a ${newRole === 'supervisor' ? 'Supervisor' : newRole === 'admin' ? 'Administrador' : 'Empleado'}?`)) {
      return
    }

    const { error } = await updateUserRole(user.auth_id, newRole)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Rol actualizado')
      load()
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Users className="text-orange-600" /> Gestión de Equipo
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-orange-700 shadow-lg transition"
        >
          <UserPlus size={20} /> Nuevo Usuario
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando usuarios...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-400">
          No hay usuarios registrados
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold tracking-wider">
              <tr>
                <th className="p-4 text-left">Usuario</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-center">Rol</th>
                <th className="p-4 text-center">Fecha Creación</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(user => (
                <tr key={user.auth_id} className="hover:bg-orange-50/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-800">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4 text-center">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      disabled={user.role === 'supervisor' || (currentUserRole !== 'supervisor' && user.role === 'supervisor')}
                      className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer ${
                        user.role === 'supervisor'
                          ? 'bg-slate-800 text-white border-slate-800'
                          : user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                            : 'bg-orange-100 text-orange-700 border-orange-200'
                      }`}
                    >
                      <option value="empleado">Empleado</option>
                      {isSupervisor && <option value="supervisor">Supervisor</option>}
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  <td className="p-4 text-center text-gray-500 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    {user.role !== 'supervisor' && (
                      <button 
                        onClick={() => handleDelete(user)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UserPlus className="text-orange-500" size={24} /> Nuevo Usuario
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo</label>
                <input 
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newUser.fullName} 
                  onChange={e => setNewUser({...newUser, fullName: e.target.value})} 
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input 
                  type="email"
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newUser.email} 
                  onChange={e => setNewUser({...newUser, email: e.target.value})} 
                  placeholder="juan@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none pr-10"
                    value={newUser.password} 
                    onChange={e => setNewUser({...newUser, password: e.target.value})} 
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rol</label>
                <select 
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  value={newUser.role} 
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="empleado">Empleado (Acceso limitado)</option>
                  {!isSupervisor && <option value="supervisor">Supervisor (Máximo acceso)</option>}
                  <option value="admin">Administrador (Acceso total)</option>
                </select>
                {!isSupervisor && (
                  <p className="text-xs text-gray-400 mt-1">Solo un Supervisor puede crear otro Supervisor</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border p-3 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-orange-600 text-white p-3 rounded-lg font-bold hover:bg-orange-700 transition shadow-lg"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
