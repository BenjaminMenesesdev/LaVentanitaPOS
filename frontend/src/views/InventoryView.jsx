import { useMemo, useState } from "react";
import { AlertTriangle, ChevronRight, Search } from "lucide-react";
import { useAppState } from "../context/AppContext.jsx";
import { INVENTORY_CATEGORIES } from "../data/data.js";
import { formatQty, stockStatus, expiryStatus, getStockAlerts } from "../utils.js";
import Badge from "../components/ui/Badge.jsx";
import ItemDetailModal from "./inventory/ItemDetailModal.jsx";
import { permissionsFor } from "../roles.js";

export default function InventoryView() {
  const { stock, user } = useAppState();
  const perms = permissionsFor(user?.role);
  const [category, setCategory] = useState("helados");
  const [search, setSearch] = useState("");
  const [showAlerts, setShowAlerts] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const alerts = getStockAlerts(stock);
  const filtered = useMemo(
    () => stock.filter((item) => item.category === category && item.name.toLowerCase().includes(search.toLowerCase())),
    [stock, category, search]
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {INVENTORY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-12px font-semibold border ${
                category === cat.id ? "bg-primary text-white border-primary" : "bg-muted text-ink border-border hover:bg-canvas"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-8 pr-3 py-1.5 rounded-md border border-border bg-surface text-13px w-48 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          {alerts.length > 0 && (
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-12px font-semibold bg-warnbg text-warn"
            >
              <AlertTriangle size={13} />
              {alerts.length} alertas
            </button>
          )}
        </div>
      </div>

      {!perms.inventoryWaste && !perms.inventoryTransfer && (
        <div className="px-5 py-2 bg-muted/60 border-b border-border text-11.5px text-inkmuted">
          {perms.inventoryPurchase
            ? "Puedes registrar compras. Traslados y mermas los gestiona Administración."
            : "Modo solo lectura. Cualquier ajuste debe solicitarse a Administración."}
        </div>
      )}

      {showAlerts && (
        <div className="px-5 py-3 border-b border-border bg-warnbg/40 space-y-1">
          {alerts.map((a) => (
            <p key={a.item} className="text-12.5px text-warn">
              <strong>{a.item}</strong>: {a.qty} {a.unit} (mínimo {a.min})
            </p>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <table className="w-full text-13px">
          <thead>
            <tr className="text-inkmuted text-left border-b border-border">
              <th className="font-medium py-2">Producto</th>
              <th className="font-medium py-2">Bodega</th>
              <th className="font-medium py-2">Vitrina</th>
              <th className="font-medium py-2">Total</th>
              <th className="font-medium py-2">Estado</th>
              <th className="font-medium py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const total = item.bodega + item.vitrina;
              const s = stockStatus(item);
              const exp = expiryStatus(item);
              return (
                <tr
                  key={item.id}
                  onClick={() => setDetailId(item.id)}
                  className="border-b border-border hover:bg-muted/50 cursor-pointer"
                >
                  <td className="py-2.5 font-medium text-ink">{item.name}</td>
                  <td className="py-2.5 font-mono text-inkmuted">{formatQty(item.bodega, item.unit)} {item.unit}</td>
                  <td className="py-2.5 font-mono text-inkmuted">{formatQty(item.vitrina, item.unit)} {item.unit}</td>
                  <td className="py-2.5 font-mono font-semibold">{formatQty(total, item.unit)} {item.unit}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Badge tone={s.tone}>{s.label}</Badge>
                      {exp && <Badge tone={exp.tone}>{exp.label}</Badge>}
                    </div>
                  </td>
                  <td className="py-2.5 text-inkmuted">
                    <ChevronRight size={15} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-inkmuted">
                  No se encontraron ítems.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detailId && <ItemDetailModal itemId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}
