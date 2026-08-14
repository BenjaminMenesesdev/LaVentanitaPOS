import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { classNames } from '../utils.js'

const navItems = [
  { to: '/', label: 'Dashboard', roles: ['admin', 'cajero'] },
  { to: '/pos', label: 'Punto de Venta', roles: ['admin', 'cajero'] },
  { to: '/inventory', label: 'Inventario', roles: ['admin', 'cajero'] },
  { to: '/suppliers', label: 'Proveedores', roles: ['admin'] },
  { to: '/users', label: 'Usuarios', roles: ['admin'] },
]

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen">
      <aside className="w-60 flex-shrink-0 bg-brand-700 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-brand-600">La Ventanita</div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems
            .filter((item) => item.roles.includes(user?.role))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  classNames(
                    'block rounded px-3 py-2 text-sm font-medium',
                    isActive ? 'bg-brand-600' : 'hover:bg-brand-600/60'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
        <div className="p-4 border-t border-brand-600 text-sm">
          <div className="font-semibold">{user?.name}</div>
          <div className="text-brand-100 text-xs mb-2">{isAdmin ? 'Administrador' : 'Cajero'}</div>
          <button
            onClick={handleLogout}
            className="w-full rounded bg-brand-600 hover:bg-brand-500 px-3 py-1.5 text-xs font-medium"
          >
            Cerrar sesion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
    </div>
  )
}
