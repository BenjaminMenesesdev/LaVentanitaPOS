export function formatCLP(value) {
  return "$" + Math.round(value).toLocaleString("es-CL");
}

export function formatQty(value, unit) {
  const isDecimalUnit = unit === "kg" || unit === "litros";
  return isDecimalUnit ? value.toFixed(1) : Math.round(value).toString();
}

export function formatTime(date) {
  return date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateLong(date) {
  return date.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "short" });
}

export function getProductBaseName(name) {
  return name.split(" (")[0].trim();
}

export function stockStatus(item) {
  const total = item.bodega + item.vitrina;
  if (total === 0) return { label: "Agotado", tone: "danger" };
  if (total <= item.min) return { label: "Stock bajo", tone: "warn" };
  return null;
}

export function expiryStatus(item) {
  if (item.expiryDays != null && item.expiryDays <= 5) {
    return { label: `Vence en ${item.expiryDays} d`, tone: "warn" };
  }
  return null;
}

export function getStockAlerts(stock) {
  return stock
    .map((item) => ({ item, stock: stockStatus(item), expiry: expiryStatus(item) }))
    .filter((row) => row.stock || row.expiry);
}
