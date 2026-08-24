import { LogOut, ShoppingCart, Boxes, LayoutDashboard, Users } from "lucide-react";
import { useAppState, useAppDispatch } from "../context/AppContext.jsx";
import { NAV_BY_ROLE, ROLE_LABELS } from "../roles.js";
import { logout as logoutRequest } from "../services/api.js";

const NAV_ITEMS = [
  { id: "pos", label: "Ventas", icon: ShoppingCart },
  { id: "inventario", label: "Inventario", icon: Boxes },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "usuarios", label: "Usuarios", icon: Users },
];

export default function Layout({ view, setView, children }) {
  const { user } = useAppState();
  const { logoutLocal } = useAppDispatch();
  const allowed = NAV_BY_ROLE[user?.role] || [];
  const visibleItems = NAV_ITEMS.filter((item) => allowed.includes(item.id));

  async function handleLogout() {
    try {
      await logoutRequest();
    } catch {
      // si falla la llamada al backend, igual cerramos sesión localmente
    } finally {
      logoutLocal();
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="bg-surface border-b border-border px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <p className="text-15px font-bold text-primary-dark">La Ventanita</p>
          <nav className="flex items-center gap-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-13px font-semibold ${
                    active ? "bg-primary text-white" : "text-inkmuted hover:bg-muted"
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-13px font-semibold text-ink leading-tight">{user?.name}</p>
            <p className="text-11px text-inkmuted leading-tight">{ROLE_LABELS[user?.role] || user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md border border-border text-inkmuted hover:bg-canvas hover:text-danger"
            title="Cerrar sesión"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex min-h-0">{children}</main>
    </div>
  );
}
