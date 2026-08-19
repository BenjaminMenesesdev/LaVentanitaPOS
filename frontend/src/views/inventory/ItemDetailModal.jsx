import { useState } from "react";
import { Package, ArrowRightLeft, Trash2, Bell, Lock } from "lucide-react";
import Modal from "../../components/ui/Modal.jsx";
import { useAppState, useAppDispatch } from "../../context/AppContext.jsx";
import { formatQty, formatTime } from "../../utils.js";
import { permissionsFor } from "../../roles.js";
import { notifyLowStock } from "../../services/api.js";

const REASONS = ["Vencimiento", "Derretimiento / Rotura", "Consumo interno", "Otro"];

export default function ItemDetailModal({ itemId, onClose }) {
  const { stock, user } = useAppState();
  const { dispatch, showToast } = useAppDispatch();
  const perms = permissionsFor(user?.role);

  const [formType, setFormType] = useState(null);
  const [qty, setQty] = useState("");
  const [location, setLocation] = useState("vitrina");
  const [reason, setReason] = useState(REASONS[0]);
  const [notifying, setNotifying] = useState(false);

  const item = stock.find((s) => s.id === itemId);
  if (!item) return null;

  const isLow = item.bodega + item.vitrina <= item.min;

  function resetForm() {
    setFormType(null);
    setQty("");
    setReason(REASONS[0]);
  }

  function submitPurchase() {
    const value = parseFloat(qty);
    if (!value || value <= 0) return;
    dispatch({ type: "PURCHASE", itemId: item.id, qty: value });
    showToast("Compra registrada");
    resetForm();
  }

  function submitTransfer() {
    const value = parseFloat(qty);
    if (!value || value <= 0 || value > item.bodega) return;
    dispatch({ type: "TRANSFER", itemId: item.id, qty: value });
    showToast("Traslado registrado");
    resetForm();
  }

  function submitWaste() {
    const value = parseFloat(qty);
    const available = location === "vitrina" ? item.vitrina : item.bodega;
    if (!value || value <= 0 || value > available) return;
    dispatch({ type: "WASTE", itemId: item.id, qty: value, location, reason });
    showToast("Merma registrada");
    resetForm();
  }

  async function handleNotifyLowStock() {
    setNotifying(true);
    try {
      await notifyLowStock(item.id);
      showToast("Administración fue notificada (correo/WhatsApp)");
    } catch {
      showToast("No se pudo enviar la alerta. Intenta más tarde.");
    } finally {
      setNotifying(false);
    }
  }

  return (
    <Modal title={item.name} subtitle={`${item.unit} · ${item.category}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="border border-border rounded-lg p-3 bg-muted">
          <p className="text-11px text-inkmuted">Bodega</p>
          <p className="text-18px font-mono font-bold mt-0.5">
            {formatQty(item.bodega, item.unit)} <span className="text-12px font-sans font-normal">{item.unit}</span>
          </p>
        </div>
        <div className="border border-border rounded-lg p-3 bg-muted">
          <p className="text-11px text-inkmuted">Vitrina</p>
          <p className="text-18px font-mono font-bold mt-0.5">
            {formatQty(item.vitrina, item.unit)} <span className="text-12px font-sans font-normal">{item.unit}</span>
          </p>
        </div>
      </div>

      {isLow && !perms.inventoryTransfer && (
        <button
          onClick={handleNotifyLowStock}
          disabled={notifying}
          className="w-full mb-4 py-2.5 rounded-lg text-13px font-semibold bg-warnbg text-warn flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Bell size={14} />
          {notifying ? "Enviando..." : "Avisar a administración (stock bajo)"}
        </button>
      )}

      {!perms.inventoryPurchase && !perms.inventoryTransfer && !perms.inventoryWaste && (
        <div className="flex items-center gap-2 text-12.5px text-inkmuted bg-muted rounded-lg px-3 py-2.5 mb-4">
          <Lock size={13} />
          Solo lectura. Los ajustes de inventario los realiza Administración.
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {perms.inventoryPurchase && (
          <button
            onClick={() => setFormType(formType === "compra" ? null : "compra")}
            className={`flex-1 py-2 rounded-lg text-[12px] font-semibold border flex flex-col items-center gap-1 ${
              formType === "compra" ? "bg-primary text-white border-primary" : "bg-muted border-border text-ink"
            }`}
          >
            <Package size={14} />
            Compra
          </button>
        )}
        {perms.inventoryTransfer && (
          <button
            onClick={() => setFormType(formType === "traslado" ? null : "traslado")}
            className={`flex-1 py-2 rounded-lg text-[12px] font-semibold border flex flex-col items-center gap-1 ${
              formType === "traslado" ? "bg-primary text-white border-primary" : "bg-muted border-border text-ink"
            }`}
          >
            <ArrowRightLeft size={14} />
            Traslado
          </button>
        )}
        {perms.inventoryWaste && (
          <button
            onClick={() => setFormType(formType === "merma" ? null : "merma")}
            className={`flex-1 py-2 rounded-lg text-[12px] font-semibold border flex flex-col items-center gap-1 ${
              formType === "merma" ? "bg-warn text-white border-warn" : "bg-muted border-border text-warn"
            }`}
          >
            <Trash2 size={14} />
            Merma
          </button>
        )}
      </div>

      {formType === "compra" && perms.inventoryPurchase && (
        <div className="mb-4 space-y-2">
          <label className="text-12px font-medium text-ink">Cantidad a ingresar a bodega ({item.unit})</label>
          <input
            type="number"
            min="0"
            step="any"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-13px"
            placeholder="0"
          />
          <button onClick={submitPurchase} className="w-full py-2.5 rounded-lg bg-primary text-white text-13px font-semibold">
            Registrar compra
          </button>
        </div>
      )}

      {formType === "traslado" && perms.inventoryTransfer && (
        <div className="mb-4 space-y-2">
          <label className="text-12px font-medium text-ink">
            Trasladar bodega → vitrina (disp. {formatQty(item.bodega, item.unit)})
          </label>
          <input
            type="number"
            min="0"
            max={item.bodega}
            step="any"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-13px"
            placeholder="0"
          />
          <button onClick={submitTransfer} className="w-full py-2.5 rounded-lg bg-primary text-white text-13px font-semibold">
            Confirmar traslado
          </button>
        </div>
      )}

      {formType === "merma" && perms.inventoryWaste && (
        <div className="mb-4 space-y-2">
          <label className="text-12px font-medium text-ink">Ubicación</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-13px"
          >
            <option value="vitrina">Vitrina ({formatQty(item.vitrina, item.unit)} {item.unit})</option>
            <option value="bodega">Bodega ({formatQty(item.bodega, item.unit)} {item.unit})</option>
          </select>
          <label className="text-12px font-medium text-ink">Motivo</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-13px"
          >
            {REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <label className="text-12px font-medium text-ink">Cantidad</label>
          <input
            type="number"
            min="0"
            step="any"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-13px"
            placeholder="0"
          />
          <button onClick={submitWaste} className="w-full py-2.5 rounded-lg bg-warn text-white text-13px font-semibold">
            Registrar merma
          </button>
        </div>
      )}

      <p className="text-11px font-bold uppercase tracking-wide text-inkmuted mb-1.5 mt-2">Movimientos recientes</p>
      {item.log.length === 0 ? (
        <p className="text-12.5px text-inkmuted py-3">Sin movimientos registrados en esta sesión.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          {item.log.slice(0, 5).map((l, idx) => (
            <div key={idx} className="flex justify-between px-3 py-2 text-12.5px border-b border-border last:border-b-0">
              <span>{l.text}</span>
              <span className="text-inkmuted font-mono">{formatTime(l.time)}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
