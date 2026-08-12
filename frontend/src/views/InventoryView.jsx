import { useMemo, useState } from "react";
import { AlertTriangle, ChevronRight, Search } from "lucide-react";
import { useAppState } from "../context/AppContext.jsx";
import { INVENTORY_CATEGORIES } from "../data/data.js";
import { formatQty, stockStatus, expiryStatus, getStockAlerts } from "../utils.js";
import Badge from "../components/ui/Badge.jsx";
import ItemDetailModal from "./inventory/ItemDetailModal.jsx";

export default function InventoryView() {
  const { stock } = useAppState();
  const [category, setCategory] = useState("helados");
  const [search, setSearch] = useState("");
  const [showAlerts, setShowAlerts] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const alerts = getStockAlerts(stock);

  const filtered = useMemo(
    () =>
      stock.filter(
        (item) => item.category === category && item.name.toLowerCase().includes(search.toLowerCase())
      ),
    [stock, category, search]
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 py-3 border-b border-border bg-surface flex items-center gap-4 flex-wrap">
        <h2 className="text-[15px] font-bold text-ink shrink-0">Inventario</h2>
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar insumo o producto..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-border bg-canvas text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex items-center gap-1">
          {INVENTORY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border ${
                category === cat.id
                  ? "bg-primary text-white border-primary"
                  : "bg-muted text-ink border-border hover:bg-canvas"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {alerts.length > 0 && (
          <button
            onClick={() => setShowAlerts((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold bg-warnbg text-warn ml-auto"
          >
            <AlertTriangle size={14} />
            {alerts.length} {alerts.length === 1 ? "alerta" : "alertas"}
            <ChevronRight size={13} style={{ transform: showAlerts ? "rotate(90deg)" : "none" }} />
          </button>
        )}
      </div>

      {showAlerts && alerts.length > 0 && (
        <div className="bg-warnbg/60 border-b border-border px-5 py-2 flex flex-wrap gap-x-6 gap-y-1 text-[12.5px]">
          {alerts.map(({ item, stock: s, expiry: e }) => (
            <div key={item.id} className="flex items-center gap-1.5">
              <span className="text-ink font-medium">{item.name}</span>
              <span className="text-warn font-semibold">{[s?.label, e?.label].filter(Boolean).join(" · ")}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-3">
        <table className="w-full text-[13px] bg-surface rounded-lg overflow-hidden border border-border">
          <thead>
            <tr className="text-left bg-canvas text-inkmuted border-b border-border">
              <th className="font-semibold px-4 py-2.5">Producto</th>
              <th className="font-semibold py-2.5">Bodega</th>
              <th className="font-semibold py-2.5">Vitrina</th>
              <th className="font-semibold py-2.5">Total</th>
              <th className="font-semibold py-2.5">Estado</th>
              <th className="py-2.5 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const total = item.bodega + item.vitrina;
              const s = stockStatus(item);
              const e = expiryStatus(item);
              return (
                <tr
                  key={item.id}
                  onClick={() => setDetailId(item.id)}
                  className="border-b border-border last:border-b-0 cursor-pointer hover:bg-canvas"
                >
                  <td className="px-4 py-2.5 font-medium text-ink">{item.name}</td>
                  <td className="py-2.5 font-mono text-inkmuted">
                    {formatQty(item.bodega, item.unit)} {item.unit}
                  </td>
                  <td className="py-2.5 font-mono text-inkmuted">
                    {formatQty(item.vitrina, item.unit)} {item.unit}
                  </td>
                  <td className="py-2.5 font-mono font-semibold">
                    {formatQty(total, item.unit)} {item.unit}
                  </td>
                  <td className="py-2.5">
                    <div className="flex gap-1.5">
                      {s && <Badge tone={s.tone === "danger" ? "danger" : "warn"}>{s.label}</Badge>}
                      {e && <Badge tone="warn">{e.label}</Badge>}
                      {!s && !e && <Badge tone="ok">OK</Badge>}
                    </div>
                  </td>
                  <td className="pr-4 text-right text-inkmuted">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-inkmuted">
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
