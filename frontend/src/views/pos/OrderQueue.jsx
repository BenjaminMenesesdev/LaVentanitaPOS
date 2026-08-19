import { Plus } from "lucide-react";
import { useAppState, useAppDispatch } from "../../context/AppContext.jsx";
import { formatCLP, formatTime } from "../../utils.js";
import { PAYMENT_METHODS } from "../../data/data.js";

function orderTotal(order) {
  return order.items.reduce((sum, it) => sum + it.qty * it.price, 0);
}

export default function OrderQueue() {
  const { openOrders, activeOrderId, sales } = useAppState();
  const { dispatch } = useAppDispatch();
  const recentSales = sales.slice(0, 5);

  return (
    <div className="w-full lg:w-[380px] shrink-0 bg-surface border-r border-border flex flex-col min-h-0">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <h2 className="text-13px font-bold uppercase tracking-wide text-ink">Mostrador</h2>
        <button
          onClick={() => dispatch({ type: "NEW_ORDER" })}
          className="flex items-center gap-1 text-12px font-semibold bg-primary text-white px-2.5 py-1.5 rounded-md hover:bg-primary-dark"
        >
          <Plus size={14} />
          Nuevo pedido
        </button>
      </div>

      <div className="overflow-y-auto flex-1 no-scrollbar">
        <div className="px-4 pt-3 pb-1">
          <p className="text-11px font-bold uppercase tracking-wide text-inkmuted">En curso</p>
        </div>
        <table className="w-full text-12.5px">
          <thead>
            <tr className="text-inkmuted text-left border-b border-border">
              <th className="font-medium px-4 py-1.5">ID</th>
              <th className="font-medium py-1.5">Hora</th>
              <th className="font-medium py-1.5">Cliente</th>
              <th className="font-medium py-1.5 pr-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {openOrders.map((order) => {
              const active = order.id === activeOrderId;
              return (
                <tr
                  key={order.id}
                  onClick={() => dispatch({ type: "SET_ACTIVE_ORDER", orderId: order.id })}
                  className={`cursor-pointer border-b border-border ${active ? "bg-muted" : "hover:bg-canvas"}`}
                >
                  <td className="px-4 py-2 font-mono font-semibold text-primary-dark">{order.id}</td>
                  <td className="py-2 tabular-nums text-inkmuted">{formatTime(order.startedAt)}</td>
                  <td className="py-2 text-inkmuted">{order.client || "—"}</td>
                  <td className="py-2 pr-4 text-right font-mono font-semibold">{formatCLP(orderTotal(order))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="px-4 pt-4 pb-1">
          <p className="text-11px font-bold uppercase tracking-wide text-inkmuted">Cerradas (últimas 5)</p>
        </div>
        <table className="w-full text-12.5px">
          <thead>
            <tr className="text-inkmuted text-left border-b border-border">
              <th className="font-medium px-4 py-1.5">ID</th>
              <th className="font-medium py-1.5">Hora</th>
              <th className="font-medium py-1.5">Método</th>
              <th className="font-medium py-1.5 pr-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentSales.map((sale) => (
              <tr key={sale.id} className="border-b border-border">
                <td className="px-4 py-2 font-mono text-inkmuted">{sale.id}</td>
                <td className="py-2 tabular-nums text-inkmuted">{formatTime(sale.time)}</td>
                <td className="py-2 text-inkmuted">{PAYMENT_METHODS.find((m) => m.id === sale.method)?.label}</td>
                <td className="py-2 pr-4 text-right font-mono">{formatCLP(sale.total)}</td>
              </tr>
            ))}
            {recentSales.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-inkmuted">
                  Aún no hay ventas cerradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
