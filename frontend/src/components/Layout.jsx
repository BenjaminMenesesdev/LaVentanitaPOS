import { useEffect, useState } from "react";
import { ShoppingCart, Boxes, LayoutDashboard, IceCreamCone, HelpCircle } from "lucide-react";
import { formatDateLong, formatTime } from "../utils.js";

const NAV_ITEMS = [
  { id: "pos", label: "Mostrador", icon: ShoppingCart },
  { id: "inventario", label: "Inventario", icon: Boxes },
  { id: "dashboard", label: "Panel de Control", icon: LayoutDashboard },
];

export default function Layout({ view, setView, children }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

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
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
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
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/15 border border-white/30 tracking-wide">
              MVP
            </span>
            <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-white/25">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
                E
              </div>
              <span className="text-[12px] text-white/85">Encargado</span>
            </div>
            <HelpCircle size={17} className="text-white/70 hidden sm:block" />
          </div>
        </div>
      </header>
      <div className="scallop bg-canvas" />

      <main className="flex-1 flex flex-col min-h-0">{children}</main>
    </div>
  );
}
