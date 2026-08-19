import { AlertTriangle } from "lucide-react";
import Modal from "./Modal.jsx";

// Doble confirmación para acciones destructivas (solo Administración).
export default function ConfirmDialog({ title, message, confirmLabel = "Eliminar", onCancel, onConfirm }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      width="max-w-sm"
      footer={
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-13px font-semibold border border-border text-inkmuted hover:bg-canvas">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg text-13px font-semibold bg-danger text-white hover:opacity-90">
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-dangerbg flex items-center justify-center shrink-0">
          <AlertTriangle size={17} className="text-danger" />
        </div>
        <p className="text-13px text-ink">{message}</p>
      </div>
    </Modal>
  );
}
