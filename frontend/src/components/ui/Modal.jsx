import { X } from "lucide-react";

export default function Modal({ title, subtitle, onClose, children, footer, width = "max-w-md" }) {
  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4">
      <div className={`w-full ${width} bg-surface rounded-xl shadow-lg border border-border max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div>
            <h3 className="text-15px font-bold text-ink">{title}</h3>
            {subtitle && <p className="text-12px text-inkmuted mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-inkmuted hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-5 py-3.5 border-t border-border">{footer}</div>}
      </div>
    </div>
  );
}
