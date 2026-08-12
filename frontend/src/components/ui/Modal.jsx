import { X } from "lucide-react";

export default function Modal({ title, subtitle, onClose, children, footer, width = "max-w-md" }) {
  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-40 p-4">
      <div className={`w-full ${width} bg-surface rounded-2xl shadow-xl max-h-[88vh] flex flex-col`}>
        <div className="flex items-start justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-[15px] font-bold text-ink">{title}</h2>
            {subtitle && <p className="text-[12px] text-inkmuted mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-inkmuted hover:text-ink p-1">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border">{footer}</div>}
      </div>
    </div>
  );
}
