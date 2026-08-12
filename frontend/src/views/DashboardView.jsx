import { useMemo } from "react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Download, Printer, AlertTriangle, ShoppingCart, Boxes } from "lucide-react";
import { useAppState } from "../context/AppContext.jsx";
import { PAYMENT_METHODS, HISTORICAL_DAILY_TOTALS, HISTORICAL_PRODUCT_UNITS } from "../data/data.js";
import { formatCLP, formatTime, getStockAlerts } from "../utils.js";
import Badge from "../components/ui/Badge.jsx";

const COGS_RATE = 0.31; // costo estimado de insumos como % de la venta, para el cálculo demo del margen

function baseName(name) {
  return name.split(" (")[0];
}

export default function DashboardView({ setView }) {
  const { sales, stock, movements, dashboard, alerts: backendAlerts } = useAppState();

  const ventasHoy = dashboard?.total ?? sales.reduce((s, sale) => s + sale.total, 0);
  const transacciones = dashboard?.count ?? sales.length;
  const comisionesHoy = useMemo(() => sales.reduce((s, sale) => s + sale.commission, 0), [sales]);
  const margenNeto = ventasHoy - comisionesHoy - ventasHoy * COGS_RATE;
  const ticketPromedio = transacciones > 0 ? ventasHoy / transacciones : 0;

  const alerts =
    Array.isArray(backendAlerts) && backendAlerts.length > 0 && backendAlerts[0]?.item
      ? backendAlerts
      : getStockAlerts(stock);

  const paymentBreakdown = useMemo(() => {
    return PAYMENT_METHODS.map((m) => {
      const forMethod = sales.filter((s) => s.method === m.id);
      const bruto = forMethod.reduce((sum, s) => sum + s.total, 0);
      const neto = bruto * (1 - m.commission);
      return { ...m, bruto, neto };
    });
  }, [sales]);

  const chartData = useMemo(() => {
    const days = [...HISTORICAL_DAILY_TOTALS, { day: "Hoy", total: ventasHoy }];
    return days;
  }, [ventasHoy]);

  const ranking = useMemo(() => {
    const units = { ...HISTORICAL_PRODUCT_UNITS };
    sales.forEach((sale) => {
      sale.items.forEach((it) => {
        const key = baseName(it.name);
        units[key] = (units[key] || 0) + it.qty;
      });
    });
    return Object.entries(units)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [sales]);

  const recentSales = sales.slice(0, 5);
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
    <div className="flex-1 overflow-y-auto px-5 py-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Ventas del día" value={formatCLP(ventasHoy)} sub={`${transacciones} transacciones`} />
        <KpiCard label="Margen neto" value={formatCLP(margenNeto)} sub="descuenta insumos y comisiones" />
        <KpiCard label="Ticket promedio" value={formatCLP(ticketPromedio)} sub="por transacción" />
        <KpiCard label="Alertas activas" value={alerts.length} sub="stock y vencimientos" tone="warn" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <Card title="Tendencia últimos 7 días" className="lg:col-span-2">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#5C7085" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => formatCLP(value)}
                  contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#C6DEF6" }}
                />
                <Bar dataKey="total" radius={[6, 6, 2, 2]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.day === "Hoy" ? "#5080BE" : "#C6DEF6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Medios de pago">
          <div className="space-y-2.5">
            {paymentBreakdown.map((p) => {
              const pct = ventasHoy > 0 ? (p.bruto / ventasHoy) * 100 : 0;
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-[12.5px] mb-1">
                    <span className="font-medium text-ink">{p.label}</span>
                    <span className="font-mono text-inkmuted">{formatCLP(p.bruto)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <Card
          title="Alertas de inventario"
          action={
            <button onClick={() => setView && setView("inventario")} className="text-[11px] font-semibold text-primary-dark hover:underline">
              Ver inventario →
            </button>
          }
        >
          {alerts.length === 0 ? (
            <p className="text-[12.5px] text-inkmuted py-2">Sin alertas activas.</p>
          ) : (
            <div className="space-y-2">
              {alerts.map(({ item, stock: s, expiry: e }) => (
                <div key={item.id} className="flex items-center justify-between text-[12.5px]">
                  <span className="flex items-center gap-1.5 text-ink">
                    <AlertTriangle size={13} className="text-warn" /> {item.name}
                  </span>
                  <Badge tone={s?.tone === "danger" ? "danger" : "warn"}>{[s?.label, e?.label].filter(Boolean).join(" · ")}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Ranking de productos">
          <div className="space-y-2">
            {ranking.map(([name, units], idx) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-primary-dark w-4">{idx + 1}</span>
                <div className="flex-1">
                  <p className="text-[12.5px] font-medium text-ink">{name}</p>
                  <div className="h-1 rounded-full bg-muted overflow-hidden mt-1">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${(units / ranking[0][1]) * 100}%` }} />
                  </div>
                </div>
                <span className="text-[12px] font-mono text-inkmuted whitespace-nowrap">{units} uds</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <Card title="Ventas recientes" action={<ShoppingCart size={14} className="text-inkmuted" />}>
          <div className="space-y-2">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between text-[12.5px] border-b border-border last:border-b-0 pb-2">
                <div>
                  <p className="font-mono text-ink">{sale.id}</p>
                  <p className="text-inkmuted">{formatTime(sale.time)} · {PAYMENT_METHODS.find((m) => m.id === sale.method)?.label}</p>
                </div>
                <span className="font-mono font-semibold">{formatCLP(sale.total)}</span>
              </div>
            ))}
            {recentSales.length === 0 && <p className="text-[12.5px] text-inkmuted py-2">Aún no hay ventas hoy.</p>}
          </div>
        </Card>

        <Card title="Movimientos de inventario" action={<Boxes size={14} className="text-inkmuted" />}>
          <div className="space-y-2">
            {recentMovements.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-[12.5px] border-b border-border last:border-b-0 pb-2">
                <div>
                  <p className="text-ink font-medium">{m.itemName}</p>
                  <p className="text-inkmuted">{m.text}</p>
                </div>
                <span className="text-inkmuted font-mono">{formatTime(m.time)}</span>
              </div>
            ))}
            {recentMovements.length === 0 && <p className="text-[12.5px] text-inkmuted py-2">Sin movimientos recientes.</p>}
          </div>
        </Card>
      </div>

      <Card title="Reportes">
        <div className="flex gap-2">
          <button
            onClick={exportExcel}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-muted text-[13px] font-semibold text-ink hover:bg-canvas"
          >
            <Download size={14} /> Exportar Excel
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-muted text-[13px] font-semibold text-ink hover:bg-canvas"
          >
            <Printer size={14} /> Exportar PDF
          </button>
        </div>
      </Card>
    </div>
  );
}

function KpiCard({ label, value, sub, tone }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3.5">
      <p className="text-[11.5px] text-inkmuted">{label}</p>
      <p className={`text-[20px] font-bold font-mono mt-1 ${tone === "warn" ? "text-warn" : "text-ink"}`}>{value}</p>
      <p className="text-[11px] text-inkmuted mt-0.5">{sub}</p>
    </div>
  );
}

function Card({ title, children, className = "", action }) {
  return (
    <div className={`bg-surface border border-border rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-inkmuted">{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}
