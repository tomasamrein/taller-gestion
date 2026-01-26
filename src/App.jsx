import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
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
// AHORA EN MINÚSCULA (Como lo dejaste vos)
import AuditLog from './features/admin/auditLog'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const localAuth = localStorage.getItem('auth') === 'true'
    const localRole = localStorage.getItem('role')
    const sessionAuth = sessionStorage.getItem('auth') === 'true'
    const sessionRole = sessionStorage.getItem('role')

    if (localAuth) {
      setIsAuthenticated(true)
      setUserRole(localRole)
    } else if (sessionAuth) {
      setIsAuthenticated(true)
      setUserRole(sessionRole)
    }
  }, [])

  const handleLogin = (userData, rememberMe) => {
    if (rememberMe) {
      localStorage.setItem('auth', 'true')
      localStorage.setItem('role', userData.role)
    } else {
      sessionStorage.setItem('auth', 'true')
      sessionStorage.setItem('role', userData.role)
    }
    setIsAuthenticated(true)
    setUserRole(userData.role)
  }

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    setIsAuthenticated(false)
    setUserRole(null)
  }

  return (
    <BrowserRouter>
      <Toaster position="bottom-center" toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff' } }} />
      
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        ) : (
          <Route path="/" element={<Layout onLogout={handleLogout} userRole={userRole} />}>
            <Route index element={<Dashboard />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="clientes" element={<ClientList />} />
            <Route path="taller" element={<WorkshopBoard userRole={userRole} />} />
            <Route path="inventario" element={<Inventory />} />
            
            {/* ESTA LÍNEA ARREGLA EL BUG DE GASTOS (Le pasa el rol) */}
            <Route path="gastos" element={<Expenses userRole={userRole} userName="Admin" />} />
            
            <Route path="proveedores" element={<Suppliers />} />
            
            {/* ESTO ARREGLA EL ERROR ROJO DE SINTAXIS (Las etiquetas <>) */}
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
    </BrowserRouter>
  )
}

export default App