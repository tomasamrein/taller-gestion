import { useState } from 'react'
import { loginUser } from '../../services/authService'
import { Wrench, MessageCircle } from 'lucide-react' // <--- Importamos MessageCircle

export default function Login({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userData = await loginUser(user, pass)
      onLogin(userData, remember) 
    } catch (err) {
      setError('Credenciales inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl border-t-4 border-orange-500 animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
                <Wrench className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-wide">Taller <span className="text-orange-600">Mecánica</span></h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">SISTEMA DE GESTIÓN</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Usuario</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition bg-gray-50 focus:bg-white"
              value={user} onChange={(e) => setUser(e.target.value)}
              placeholder="Ej: admin"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
            <input 
              type="password" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition bg-gray-50 focus:bg-white"
              value={pass} onChange={(e) => setPass(e.target.value)}
              placeholder="•••••"
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer accent-orange-600"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
              Mantenerme conectado
            </label>
          </div>

          {error && <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-3 rounded border border-red-100">{error}</p>}

          <button disabled={loading} className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition disabled:bg-gray-400 shadow-lg transform active:scale-95">
            {loading ? 'Accediendo...' : 'INGRESAR AL SISTEMA'}
          </button>
        </form>
        
        {/* --- PIE DE PAGINA CON SOPORTE --- */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-2">v2.1 - Versión Estable</p>
            <a 
                href="https://wa.me/5493437479134?text=Hola,%20necesito%20ayuda%20para%20ingresar%20al%20sistema" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700 transition"
            >
                <MessageCircle size={16} /> Contactar Soporte Técnico
            </a>
        </div>
      </div>
    </div>
  )
}