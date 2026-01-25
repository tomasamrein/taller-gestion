import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Wrench, Package, LogOut, Wallet, Truck, Shield } from 'lucide-react'

// Recibimos userRole para saber si mostrar el menú de Admin
export default function Layout({ onLogout, userRole }) {
  const location = useLocation()
  
  // 1. Definimos la lista base (lo que ven todos)
  let menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: Wrench, label: 'Taller', path: '/taller' },
    { icon: Package, label: 'Inventario', path: '/inventario' },
    { icon: Wallet, label: 'Gastos', path: '/gastos' },
    { icon: Truck, label: 'Proveedores', path: '/proveedores' },
  ]

  // 2. Si es ADMIN, le agregamos el botón de Equipo
  if (userRole === 'admin') {
    menuItems.push({ icon: Shield, label: 'Equipo / Usuarios', path: '/equipo' })
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR IZQUIERDA */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Wrench className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-xl font-bold tracking-wider">MECÁNICA <span className="text-blue-500">PRO</span></span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Botón de Salir */}
        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full px-4 py-2 transition hover:bg-slate-800 rounded-lg">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER SUPERIOR */}
        <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-8 z-10">
          <h2 className="text-gray-500 text-sm font-medium flex items-center gap-2">
             Panel de Control Principal
             {userRole === 'admin' && <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold border border-purple-200">ADMINISTRADOR</span>}
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800 capitalize">{userRole || 'Usuario'}</p>
              <p className="text-xs text-green-600 font-semibold flex items-center justify-end gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
              </p>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold border ${userRole === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
              {userRole === 'admin' ? 'AD' : 'OP'}
            </div>
          </div>
        </header>

        {/* AQUÍ SE CARGAN LAS PÁGINAS */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}