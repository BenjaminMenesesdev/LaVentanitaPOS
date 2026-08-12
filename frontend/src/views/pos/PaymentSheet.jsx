import { useState } from "react";
import { Check } from "lucide-react";
import Modal from "../../components/ui/Modal.jsx";
import { PAYMENT_METHODS } from "../../data/data.js";
import { formatCLP } from "../../utils.js";

export default function PaymentSheet({ total, onClose, onConfirm }) {
  const [method, setMethod] = useState(null);
  const selected = PAYMENT_METHODS.find((m) => m.id === method);
  const commission = selected ? total * selected.commission : 0;
  const net = total - commission;

  return (
    <Modal
      title="Método de pago"
      subtitle={`Total a cobrar ${formatCLP(total)}`}
      onClose={onClose}
      footer={
        <button
          disabled={!method}
          onClick={() => onConfirm(method)}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 ${
            method ? "bg-primary text-white hover:bg-primary-dark" : "bg-muted text-inkmuted"
          }`}
        >
          <Check size={16} /> Confirmar venta
        </button>
      }
    >
      <div className="flex flex-col gap-2 mb-4">
        {PAYMENT_METHODS.map((m) => {
          const active = m.id === method;
          return (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${
                active ? "bg-primary border-primary text-white" : "bg-muted border-border text-ink"
              }`}
            >
              <span className="text-[13px] font-semibold">{m.label}</span>
              <span className={`text-[11px] ${active ? "text-white/80" : "text-inkmuted"}`}>
                {m.commission === 0 ? "Sin comisión" : `Comisión ~${(m.commission * 100).toFixed(1)}%`}
              </span>
            </button>
          );
        })}
      </div>

      {selected && selected.commission > 0 && (
        <div className="text-[13px] space-y-1 border-t border-border pt-3">
          <div className="flex justify-between">
            <span className="text-inkmuted">Comisión estimada</span>
            <span className="font-mono text-warn">-{formatCLP(commission)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Neto estimado</span>
            <span className="font-mono">{formatCLP(net)}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}
