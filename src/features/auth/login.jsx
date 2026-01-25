import { useState } from 'react'
import { loginUser } from '../../services/authService' // <--- Importamos el servicio

export default function Login({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Intentamos loguear contra Supabase
      const userData = await loginUser(user, pass)
      
      // Si pasa, le avisamos a la App quién entró (Admin o Empleado)
      onLogin(userData) 
    } catch (err) {
      setError('Credenciales inválidas. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">MECÁNICA PRO</h1>
          <p className="text-gray-500 mt-2">Acceso al Sistema</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={user} onChange={(e) => setUser(e.target.value)}
              placeholder="Ej: admin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={pass} onChange={(e) => setPass(e.target.value)}
              placeholder="•••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded">{error}</p>}

          <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400">
            {loading ? 'Verificando...' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  )
}