import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import Login from './features/auth/login'
import Layout from './components/shared/Layout'
import Dashboard from './features/dashboard/dashboard'
import ClientList from './features/clients/clientList'
import WorkshopBoard from './features/orders/workshopBoard'
import Inventory from './features/inventory/inventory'
import Expenses from './features/finance/expenses'
import Suppliers from './features/suppliers/suppliers'
import TeamManager from './features/team/teamManager'
import Agenda from './features/calendar/Agenda'
import BillingHistory from './features/admin/billingHistory'
import AuditLog from './features/admin/auditLog'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState(null)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted && session?.user) {
          const metadata = session.user.user_metadata || {}
          setIsAuthenticated(true)
          setUserRole(metadata.role || 'empleado')
          setUserData({
            id: session.user.id,
            email: session.user.email,
            name: metadata.full_name || session.user.email?.split('@')[0] || 'Usuario',
            role: metadata.role || 'empleado',
            taller_id: metadata.taller_id || null
          })
        }
      } catch (err) {
        console.error('Error inicializando auth:', err)
        if (mounted) setInitError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false)
        setUserRole(null)
        setUserData(null)
      } else if (session?.user) {
        const metadata = session.user.user_metadata || {}
        setIsAuthenticated(true)
        setUserRole(metadata.role || 'empleado')
        setUserData({
          id: session.user.id,
          email: session.user.email,
          name: metadata.full_name || session.user.email?.split('@')[0] || 'Usuario',
          role: metadata.role || 'empleado',
          taller_id: metadata.taller_id || null
        })
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleLogin = (data, rememberMe) => {
    setUserData(data)
    setUserRole(data.role)
    setIsAuthenticated(true)
    
    if (rememberMe) {
      localStorage.setItem('user_session', JSON.stringify(data))
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Error en logout:', err)
    }
    localStorage.removeItem('user_session')
    sessionStorage.removeItem('user_session')
    setIsAuthenticated(false)
    setUserRole(null)
    setUserData(null)
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">Error de Configuración</h1>
          <p className="text-gray-600 mb-4">Verificá que las variables de entorno estén configuradas.</p>
          <p className="text-sm text-gray-400 font-mono bg-gray-100 p-2 rounded">{initError}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff' } }} />
      
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        ) : (
          <Route path="/" element={<Layout onLogout={handleLogout} userRole={userRole} userData={userData} />}>
            <Route index element={<Dashboard />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="clientes" element={<ClientList />} />
            <Route path="taller" element={<WorkshopBoard userRole={userRole} />} />
            <Route path="inventario" element={<Inventory />} />
            <Route path="gastos" element={<Expenses userRole={userRole} userName={userData?.name || 'Usuario'} />} />
            <Route path="proveedores" element={<Suppliers />} />
            
            {userRole === 'admin' && (
              <> 
                <Route path="equipo" element={<TeamManager />} />
                <Route path="auditoria" element={<AuditLog />} />
                <Route path="facturacion" element={<BillingHistory />} />
              </>
            )}
            
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
    </>
  )
}

export default App
