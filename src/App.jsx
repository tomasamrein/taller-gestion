import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './features/auth/login'
import Layout from './components/shared/Layout'
import Dashboard from './features/dashboard/dashboard'
import ClientList from './features/clients/clientList'
import WorkshopBoard from './features/orders/workshopBoard'
import Inventory from './features/inventory/inventory'
import Expenses from './features/finance/expenses'
import Suppliers from './features/suppliers/suppliers'
import TeamManager from './features/team/teamManager' // <--- IMPORT NUEVO

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null) // <--- NUEVO ESTADO PARA EL ROL

  // Al cargar, revisamos si hay sesión guardada
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth') === 'true'
    const storedRole = localStorage.getItem('role')
    if (storedAuth) {
      setIsAuthenticated(true)
      setUserRole(storedRole)
    }
  }, [])

  const handleLogin = (userData) => {
    localStorage.setItem('auth', 'true')
    localStorage.setItem('role', userData.role) // Guardamos el rol (admin/empleado)
    setIsAuthenticated(true)
    setUserRole(userData.role)
  }

  const handleLogout = () => {
    localStorage.clear()
    setIsAuthenticated(false)
    setUserRole(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        ) : (
          /* Pasamos el userRole al Layout para que oculte botones */
          <Route path="/" element={<Layout onLogout={handleLogout} userRole={userRole} />}>
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<ClientList />} />
            <Route path="taller" element={<WorkshopBoard />} />
            <Route path="inventario" element={<Inventory />} />
            <Route path="gastos" element={<Expenses />} />
            <Route path="proveedores" element={<Suppliers />} />
            
            {/* Solo dejamos entrar acá si es ADMIN */}
            {userRole === 'admin' && (
              <Route path="equipo" element={<TeamManager />} />
            )}
            
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App