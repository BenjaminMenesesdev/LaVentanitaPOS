import { useEffect, useState } from "react";
import { LogOut, ShoppingCart, Boxes, LayoutDashboard, Users, IceCreamCone } from "lucide-react";
import { useAppState, useAppDispatch } from "../context/AppContext.jsx";
import { NAV_BY_ROLE, ROLE_LABELS } from "../roles.js";
import { logout as logoutRequest } from "../services/api.js";
import { formatDateLong, formatTime } from "../utils.js";

const NAV_ITEMS = [
  { id: "pos", label: "Mostrador", icon: ShoppingCart },
  { id: "inventario", label: "Inventario", icon: Boxes },
  { id: "dashboard", label: "Panel de Control", icon: LayoutDashboard },
  { id: "usuarios", label: "Usuarios", icon: Users },
];

export default function Layout({ view, setView, children }) {
  const { user } = useAppState();
  const { logoutLocal } = useAppDispatch();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

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
      <header className="bg-primary text-white">
        <div className="px-4 lg:px-6 py-2.5 flex items-center gap-6">
          <div className="flex items-center gap-2 pr-4 border-r border-white/25">
            <IceCreamCone size={22} strokeWidth={2.2} />
            <div className="leading-tight">
              <p className="font-extrabold text-[15px] tracking-tight">LA VENTANITA</p>
              <p className="text-[10px] uppercase tracking-wider text-white/70">Sistema de gestión</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 flex-1">
            {visibleItems.map(({ id, label, icon: Icon }) => {
              const active = view === id;
              return (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                    active ? "bg-white text-primary-dark" : "text-white/85 hover:bg-white/10"
                  }`}
                >
                  <Icon size={16} strokeWidth={2.2} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 text-right">
            <div className="hidden md:block leading-tight">
              <p className="text-[13px] font-semibold tabular-nums">{formatTime(now)}</p>
              <p className="text-[10px] text-white/70 capitalize">{formatDateLong(now)}</p>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-white/25">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
                {(user?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-[12px] text-white/90 font-semibold">{user?.name}</p>
                <p className="text-[10px] text-white/70">{ROLE_LABELS[user?.role] || user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>
      <div className="scallop bg-canvas" />

      <main className="flex-1 flex min-h-0">{children}</main>
    </div>
  );
}
