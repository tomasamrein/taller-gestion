import { useState } from 'react'
import { loginUser } from '../../services/authService'
import { Wrench, MessageCircle, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email || !password) {
        throw new Error('Email y contraseña son obligatorios')
      }

      const userData = await loginUser(email, password)
      
      onLogin(userData, remember) 
    } catch (err) {
      setError(err.message || 'Credenciales inválidas.')
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
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
            <input 
              type="email" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition bg-gray-50 focus:bg-white"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition bg-gray-50 focus:bg-white pr-10"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••"
                autoComplete="current-password"
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

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm text-center font-bold bg-red-50 p-3 rounded border border-red-100">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button 
            disabled={loading} 
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition disabled:bg-gray-400 shadow-lg transform active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Verificando...
              </>
            ) : (
              'INGRESAR AL SISTEMA'
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
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
