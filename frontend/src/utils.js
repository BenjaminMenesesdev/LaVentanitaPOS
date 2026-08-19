export function formatCLP(value) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value || 0);
}

export function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
}

export function formatQty(value, unit) {
  if (unit === "unidades") return Math.round(value).toString();
  return Number(value).toFixed(1);
}

export function stockStatus(item) {
  const total = item.bodega + item.vitrina;
  if (total <= 0) return { tone: "danger", label: "Sin stock" };
  if (total <= item.min) return { tone: "warn", label: "Stock bajo" };
  return { tone: "ok", label: "Ok" };
}

export function expiryStatus(item) {
  if (!item.expiryDays) return null;
  if (item.expiryDays <= 3) return { tone: "danger", label: `Vence en ${item.expiryDays}d` };
  if (item.expiryDays <= 10) return { tone: "warn", label: `Vence en ${item.expiryDays}d` };
  return null;
}

export function getStockAlerts(stock) {
  return stock
    .filter((item) => item.bodega + item.vitrina <= item.min)
    .map((item) => ({ item: item.name, qty: item.bodega + item.vitrina, min: item.min, unit: item.unit }));
}
