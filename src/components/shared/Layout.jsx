import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Wrench, Package, Wallet, Truck, Shield, LogOut, Menu, X, Calendar, Briefcase } from 'lucide-react'
import { FileText } from 'lucide-react'
import NotificationCenter from './NotificationCenter'

export default function Layout({ onLogout, userRole }) {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  let menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Calendar, label: 'Agenda Turnos', path: '/agenda' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: Wrench, label: 'Taller', path: '/taller' },
    { icon: Package, label: 'Inventario', path: '/inventario' },
    { icon: Wallet, label: 'Gastos', path: '/gastos' },
    { icon: Truck, label: 'Proveedores', path: '/proveedores' },
  ]

  // AGREGAMOS LOS MENÚS DE ADMIN
  if (userRole === 'admin') {
    menuItems.push({ icon: FileText, label: 'Facturación', path: '/facturacion' }) // Nuevo 26.01
    menuItems.push({ icon: Briefcase, label: 'Equipo', path: '/equipo' }) // Agregado
    menuItems.push({ icon: Shield, label: 'Auditoría', path: '/auditoria' }) // Agregado
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:inset-auto
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center">
            <Wrench className="w-6 h-6 text-orange-500 mr-2" />
            <span className="text-xl font-bold tracking-wider uppercase">Taller <span className="text-orange-500">Mecánica</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full px-4 py-2 transition hover:bg-slate-800 rounded-lg">
            <LogOut size={20} />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-4 lg:px-8 z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <Menu size={24} />
          </button>

          <h2 className="hidden md:flex text-gray-500 text-sm font-medium items-center gap-2">
             Panel de Control
             {userRole === 'admin' && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold border border-orange-200">ADMIN</span>}
          </h2>

          <div className="flex items-center gap-3 ml-auto">
            
            {userRole === 'admin' && (
                <NotificationCenter userRole={userRole} userName="Admin" />
            )}

            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800 capitalize">{userRole || 'Usuario'}</p>
              <p className="text-xs text-green-600 font-semibold flex items-center justify-end gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
              </p>
            </div>
            <div className={`h-9 w-9 lg:h-10 lg:w-10 rounded-full flex items-center justify-center font-bold border ${userRole === 'admin' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              {userRole === 'admin' ? 'AD' : 'OP'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50 relative">
          <Outlet />
        </main>
      </div>
    </div>
  )
}