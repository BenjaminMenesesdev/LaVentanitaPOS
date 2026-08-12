import { useMemo, useState } from "react";
import { Search, Minus, Plus, Trash2, Settings2 } from "lucide-react";
import { useAppState, useAppDispatch } from "../../context/AppContext.jsx";
import { POS_CATEGORIES } from "../../data/data.js";
import { formatCLP, formatTime } from "../../utils.js";
import FlavorSheet from "./FlavorSheet.jsx";
import PaymentSheet from "./PaymentSheet.jsx";
import { createSale } from "../../services/api.js";

export default function OrderBuilder() {
  const { activeOrder } = useAppState();
  const { dispatch, showToast } = useAppDispatch();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [flavorProduct, setFlavorProduct] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const { products } = useAppState();

  const suggestions = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return list.filter((p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)).slice(0, 8);
    }
    if (categoryFilter) {
      return list.filter(
        (p) =>
          p.category === categoryFilter ||
          p.category_id === categoryFilter ||
          String(p.category_id) === categoryFilter
      );
    }
    return list.slice(0, 8);
  }, [search, categoryFilter, products]);

  if (!activeOrder) return null;

  const total = activeOrder.items.reduce((sum, it) => sum + it.qty * it.price, 0);

  function handlePick(product) {
    if (product.needsFlavor) {
      setFlavorProduct(product);
    } else {
      dispatch({ type: "ADD_ITEM", orderId: activeOrder.id, productId: product.id, name: product.name, price: product.price });
    }
    setSearch("");
  }

  function handleFlavorConfirm(flavors) {
    const name = `${flavorProduct.name} (${flavors.join(" + ")})`;
    dispatch({ type: "ADD_ITEM", orderId: activeOrder.id, productId: flavorProduct.id, name, price: flavorProduct.price, flavors });
    setFlavorProduct(null);
    setCategoryFilter(null);
  }

  async function handleConfirmSale(method) {
    if (!activeOrder || activeOrder.items.length === 0) return;

    const payload = {
      items: activeOrder.items.map((item) => ({
        product_id: item.productId,
        sku: item.productSku ?? item.productId,
        name: item.name,
        quantity: item.qty,
        price: item.price,
      })),
      payments: [
        {
          method,
          amount: total,
        },
      ],
    };

    try {
      await createSale(payload);
      dispatch({ type: "COMPLETE_SALE", orderId: activeOrder.id, method });
      setShowPayment(false);
      showToast("Venta registrada");
    } catch (error) {
      showToast(error.message || "Error al registrar venta");
      console.error("createSale error:", error);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[15px] font-bold text-ink">
            Pedido <span className="font-mono text-primary-dark">{activeOrder.id}</span>
          </h2>
          <p className="text-[12px] text-inkmuted">Hora inicio {formatTime(activeOrder.startedAt)}</p>
        </div>
        <input
          value={activeOrder.client}
          onChange={(e) =>
            dispatch({ type: "SET_ORDER_CLIENT", orderId: activeOrder.id, client: e.target.value })
          }
          placeholder="Cliente / mesa (opcional)"
          className="text-[13px] px-3 py-1.5 rounded-md border border-border bg-canvas w-56 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div className="px-5 py-3 border-b border-border">
        <p className="text-[11px] font-bold uppercase tracking-wide text-inkmuted mb-2">Adicionar</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCategoryFilter(null);
              }}
              placeholder="Buscar producto..."
              className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <button className="p-2 rounded-md border border-border text-inkmuted hover:bg-canvas">
            <Settings2 size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {POS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryFilter(categoryFilter === cat.id ? null : cat.id);
                setSearch("");
              }}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold border ${
                categoryFilter === cat.id
                  ? "bg-primary text-white border-primary"
                  : "bg-muted text-ink border-border hover:bg-canvas"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {suggestions.length > 0 && (
          <div className="mt-2 border border-border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            {suggestions.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePick(p)}
                className="w-full flex items-center justify-between px-3 py-2 text-[13px] bg-surface hover:bg-muted border-b border-border last:border-b-0"
              >
                <span className="text-ink font-medium">{p.name}</span>
                <span className="font-mono text-inkmuted">{formatCLP(p.price)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeOrder.items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[13px] text-inkmuted">
            Busca o elige una categoría para agregar productos al pedido.
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <tbody>
              {activeOrder.items.map((item) => (
                <tr key={item.cartId} className="border-b border-border bg-muted/40">
                  <td className="pl-5 py-2.5 w-28">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          dispatch({ type: "UPDATE_ITEM_QTY", orderId: activeOrder.id, cartId: item.cartId, delta: -1 })
                        }
                        className="w-6 h-6 rounded border border-border bg-surface flex items-center justify-center hover:bg-canvas"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center font-mono font-semibold">{item.qty}</span>
                      <button
                        onClick={() =>
                          dispatch({ type: "UPDATE_ITEM_QTY", orderId: activeOrder.id, cartId: item.cartId, delta: 1 })
                        }
                        className="w-6 h-6 rounded border border-border bg-surface flex items-center justify-center hover:bg-canvas"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 font-medium text-ink">{item.name}</td>
                  <td className="py-2.5 text-right font-mono text-inkmuted">{formatCLP(item.price)}</td>
                  <td className="py-2.5 pr-2 text-right font-mono font-semibold w-24">
                    {formatCLP(item.price * item.qty)}
                  </td>
                  <td className="pr-5 py-2.5 w-8">
                    <button
                      onClick={() => dispatch({ type: "REMOVE_ITEM", orderId: activeOrder.id, cartId: item.cartId })}
                      className="text-inkmuted hover:text-danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="border-t border-border px-5 py-3">
        <div className="flex items-center justify-between text-[13px] mb-3">
          <span className="text-inkmuted">Total a confirmar</span>
          <span className="font-mono font-bold text-[16px]">{formatCLP(total)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ type: "CANCEL_ORDER", orderId: activeOrder.id })}
            className="px-4 py-2.5 rounded-lg text-[13px] font-semibold border border-border text-inkmuted hover:bg-canvas"
          >
            Cancelar pedido
          </button>
          <button
            disabled={activeOrder.items.length === 0}
            onClick={() => setShowPayment(true)}
            className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold ${
              activeOrder.items.length > 0
                ? "bg-primary text-white hover:bg-primary-dark"
                : "bg-muted text-inkmuted"
            }`}
          >
            Cobrar
          </button>
        </div>
      </div>

      {flavorProduct && (
        <FlavorSheet product={flavorProduct} onClose={() => setFlavorProduct(null)} onConfirm={handleFlavorConfirm} />
      )}
      {showPayment && (
        <PaymentSheet total={total} onClose={() => setShowPayment(false)} onConfirm={handleConfirmSale} />
      )}
    </div>
  );
}
