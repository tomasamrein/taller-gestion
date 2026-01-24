import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './features/auth/login'
import Layout from './components/shared/Layout'
import Dashboard from './features/dashboard/dashboard'
import ClientList from './features/clients/clientList'
import WorkshopBoard from './features/orders/workshopBoard'
import Inventory from './features/inventory/inventory'
import Expenses from './features/finance/expenses'
import Suppliers from './features/suppliers/suppliers'

function App() {
  // Estado para saber si está logueado
  // Truco: Leemos de localStorage para que si recarga la página no se salga
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('auth') === 'true'
  )

  const handleLogin = () => {
    localStorage.setItem('auth', 'true')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth')
    setIsAuthenticated(false)
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Si NO está logueado, mostrar Login */}
        {!isAuthenticated ? (
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        ) : (
          /* Si ESTÁ logueado, mostrar el Layout con las páginas adentro */
          <Route path="/" element={<Layout onLogout={handleLogout} />}>
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<ClientList />} />
            <Route path="taller" element={<WorkshopBoard />} />
            {/* Si pone una ruta cualquiera, vuelve al dashboard */}
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="inventario" element={<Inventory />} />
            <Route path="gastos" element={<Expenses />} />
            <Route path="proveedores" element={<Suppliers />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App