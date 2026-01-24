import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Wrench, Package, LogOut, Menu } from 'lucide-react'

export default function Layout({ onLogout }) {
  const location = useLocation()
  
  // Menú lateral
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: Wrench, label: 'Taller', path: '/taller' },
    // --- NUEVOS ---
    { icon: Package, label: 'Inventario', path: '/inventario' },
    { icon: LogOut, label: 'Gastos', path: '/gastos' }, // Usé LogOut temporalmente por el ícono, si querés importá 'Wallet' de lucide-react
    { icon: Users, label: 'Proveedores', path: '/proveedores' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR IZQUIERDA */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Wrench className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-xl font-bold tracking-wider">MECÁNICA <span className="text-blue-500">PRO</span></span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
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
          <button onClick={onLogout} className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full px-4 py-2 transition">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER SUPERIOR */}
        <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-8 z-10">
          <h2 className="text-gray-500 text-sm font-medium">Panel de Control Principal</h2>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">Admin Usuario</p>
              <p className="text-xs text-green-600 font-semibold">● Online</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200">
              AD
            </div>
          </div>
        </header>

        {/* AQUÍ SE CARGAN LAS PÁGINAS (Dashboard, Clientes, etc) */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}