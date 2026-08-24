import { useMemo } from "react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Download, AlertTriangle, ShoppingCart, Boxes } from "lucide-react";
import { useAppState } from "../context/AppContext.jsx";
import { PAYMENT_METHODS, HISTORICAL_DAILY_TOTALS, HISTORICAL_PRODUCT_UNITS } from "../data/data.js";
import { formatCLP, formatTime, getStockAlerts } from "../utils.js";
import Badge from "../components/ui/Badge.jsx";
import { permissionsFor } from "../roles.js";

const COGS_RATE = 0.31;

function baseName(name) {
  return name.split(" (")[0];
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <p className="text-11px font-bold uppercase tracking-wide text-inkmuted">{label}</p>
      <p className="text-22px font-mono font-bold mt-1">{value}</p>
      {sub && <p className="text-11.5px text-inkmuted mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardView() {
  const { sales, stock, movements, dashboard, alerts: backendAlerts, user } = useAppState();
  const perms = permissionsFor(user?.role);

  const ventasHoy = dashboard?.total ?? sales.reduce((s, sale) => s + sale.total, 0);
  const transacciones = dashboard?.count ?? sales.length;
  const comisionesHoy = useMemo(() => sales.reduce((s, sale) => s + (sale.commission || 0), 0), [sales]);
  const margenNeto = ventasHoy - comisionesHoy - ventasHoy * COGS_RATE;
  const ticketPromedio = transacciones > 0 ? ventasHoy / transacciones : 0;

  const alerts =
    Array.isArray(backendAlerts) && backendAlerts.length > 0 && backendAlerts[0]?.item ? backendAlerts : getStockAlerts(stock);

  const paymentBreakdown = useMemo(() => {
    return PAYMENT_METHODS.map((m) => {
      const forMethod = sales.filter((s) => s.method === m.id);
      const bruto = forMethod.reduce((sum, s) => sum + s.total, 0);
      const neto = bruto * (1 - m.commission);
      return { ...m, bruto, neto };
    });
  }, [sales]);

  const chartData = useMemo(() => [...HISTORICAL_DAILY_TOTALS, { day: "Hoy", total: ventasHoy }], [ventasHoy]);

  const ranking = useMemo(() => {
    const units = { ...HISTORICAL_PRODUCT_UNITS };
    sales.forEach((sale) => {
      sale.items.forEach((it) => {
        const key = baseName(it.name);
        units[key] = (units[key] || 0) + it.qty;
      });
    });
    return Object.entries(units).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [sales]);

  const recentMovements = movements.slice(0, 5);

  function exportExcel() {
    const rows = [["Producto", "Unidades"], ...ranking.map(([name, units]) => [name, units])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ventas-hoy.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-18px font-bold text-ink">Dashboard</h1>
        {perms.dashboardFinancials && (
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 text-12.5px font-semibold border border-border px-3 py-1.5 rounded-md text-inkmuted hover:bg-canvas"
          >
            <Download size={13} />
            Exportar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Ventas hoy" value={formatCLP(ventasHoy)} sub={`${transacciones} transacciones`} />
        <StatCard label="Ticket promedio" value={formatCLP(ticketPromedio)} />
        {perms.dashboardFinancials && <StatCard label="Comisiones" value={formatCLP(comisionesHoy)} />}
        {perms.dashboardFinancials && <StatCard label="Margen neto estimado" value={formatCLP(margenNeto)} sub="Insumos + comisiones descontados" />}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-4">
          <p className="text-13px font-bold text-ink mb-3">Ventas últimos días</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatCLP(v)} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.day === "Hoy" ? "#5080BE" : "#7EBBDA"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-13px font-bold text-ink mb-3 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-warn" />
            Alertas de stock
          </p>
          {alerts.length === 0 ? (
            <p className="text-12.5px text-inkmuted">Sin alertas activas.</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((a, idx) => (
                <div key={idx} className="flex justify-between text-12.5px bg-warnbg/50 px-3 py-2 rounded-lg">
                  <span className="text-ink font-medium">{a.item}</span>
                  <span className="text-warn font-mono">{a.qty} {a.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {perms.dashboardFinancials && (
        <div className="grid lg:grid-cols-3 gap-4 mt-4">
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-13px font-bold text-ink mb-3 flex items-center gap-1.5">
              <ShoppingCart size={14} />
              Por medio de pago
            </p>
            <div className="space-y-2">
              {paymentBreakdown.map((m) => (
                <div key={m.id} className="flex justify-between text-12.5px">
                  <span className="text-inkmuted">{m.label}</span>
                  <span className="font-mono font-semibold">{formatCLP(m.neto)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-13px font-bold text-ink mb-3">Ranking de productos</p>
            <div className="space-y-1.5">
              {ranking.map(([name, units]) => (
                <div key={name} className="flex justify-between text-12.5px">
                  <span className="text-ink">{name}</span>
                  <Badge tone="neutral">{units} u.</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-13px font-bold text-ink mb-3 flex items-center gap-1.5">
              <Boxes size={14} />
              Movimientos recientes
            </p>
            {recentMovements.length === 0 ? (
              <p className="text-12.5px text-inkmuted">Sin movimientos recientes.</p>
            ) : (
              <div className="space-y-2">
                {recentMovements.map((m) => (
                  <div key={m.id} className="text-12.5px">
                    <p className="text-ink font-medium">{m.itemName}</p>
                    <p className="text-inkmuted">
                      {m.text} · {formatTime(m.time)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
