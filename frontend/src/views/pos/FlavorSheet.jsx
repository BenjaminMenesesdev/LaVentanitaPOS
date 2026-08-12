import { useState } from "react";
import Modal from "../../components/ui/Modal.jsx";
import { useAppState } from "../../context/AppContext.jsx";
import { FLAVORS } from "../../data/data.js";

export default function FlavorSheet({ product, onClose, onConfirm }) {
  const { stock } = useAppState();
  const [selected, setSelected] = useState([]);

  function stockFor(flavor) {
    const item = stock.find((s) => s.flavor === flavor);
    return item ? item.vitrina : 0;
  }

  function toggle(flavor) {
    const qty = stockFor(flavor);
    if (qty <= 0 && !selected.includes(flavor)) return;
    if (selected.includes(flavor)) {
      setSelected(selected.filter((f) => f !== flavor));
    } else if (selected.length < product.maxFlavors) {
      setSelected([...selected, flavor]);
    }
  }

  const ready = selected.length === product.maxFlavors;

  return (
    <Modal
      title={product.name}
      subtitle={
        product.maxFlavors === 1
          ? "Elige 1 sabor"
          : `Elige ${product.maxFlavors} sabores (${selected.length}/${product.maxFlavors})`
      }
      onClose={onClose}
      footer={
        <button
          disabled={!ready}
          onClick={() => onConfirm(selected)}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold ${
            ready ? "bg-primary text-white hover:bg-primary-dark" : "bg-muted text-inkmuted"
          }`}
        >
          Agregar al pedido
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        {FLAVORS.map((flavor) => {
          const qty = stockFor(flavor);
          const isSelected = selected.includes(flavor);
          const disabled = qty <= 0 && !isSelected;
          return (
            <button
              key={flavor}
              disabled={disabled}
              onClick={() => toggle(flavor)}
              className={`flex flex-col items-start px-3 py-2 rounded-lg border text-left ${
                isSelected
                  ? "bg-primary border-primary text-white"
                  : disabled
                  ? "bg-canvas border-border opacity-50"
                  : "bg-muted border-border text-ink"
              }`}
            >
              <span className="text-[13px] font-semibold">{flavor}</span>
              <span className={`text-[11px] ${isSelected ? "text-white/80" : "text-inkmuted"}`}>
                {qty === 0 ? "Agotado" : `${qty} porc.`}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
