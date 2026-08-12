// ---- Catálogo de venta (Punto de Venta) ----
export const POS_CATEGORIES = [
  { id: "helados", label: "Helados" },
  { id: "bebidas", label: "Bebidas" },
  { id: "extras", label: "Extras" },
];

export const FLAVORS = [
  "Vainilla",
  "Chocolate",
  "Frutilla",
  "Dulce de Leche",
  "Menta",
  "Mango",
  "Maracuyá",
  "Manjar",
];

export const PRODUCTS = {
  helados: [
    { id: "vaso-s", name: "Vaso Simple", price: 2500, needsFlavor: true, maxFlavors: 1 },
    { id: "vaso-d", name: "Vaso Doble", price: 3300, needsFlavor: true, maxFlavors: 2 },
    { id: "vaso-t", name: "Vaso Triple", price: 4100, needsFlavor: true, maxFlavors: 2 },
    { id: "cono-s", name: "Cono Simple", price: 2700, needsFlavor: true, maxFlavors: 1 },
    { id: "cono-d", name: "Cono Doble", price: 3500, needsFlavor: true, maxFlavors: 2 },
    { id: "barquillo-r", name: "Barquillo Relleno", price: 4200, needsFlavor: true, maxFlavors: 2 },
    { id: "sundae", name: "Sundae", price: 4800, needsFlavor: true, maxFlavors: 2 },
    { id: "copa-brownie", name: "Copa Brownie", price: 5200, needsFlavor: true, maxFlavors: 2 },
    { id: "banana-split", name: "Banana Split", price: 5500, needsFlavor: true, maxFlavors: 2 },
  ],
  bebidas: [
    { id: "afogato", name: "Afogato", price: 3800, needsFlavor: false },
    { id: "choc-caliente", name: "Chocolate Caliente", price: 3200, needsFlavor: false },
    { id: "cafe-americano", name: "Café Americano", price: 2200, needsFlavor: false },
    { id: "cafe-leche", name: "Café con Leche", price: 2600, needsFlavor: false },
    { id: "te", name: "Té", price: 1800, needsFlavor: false },
    { id: "limonada", name: "Limonada", price: 2400, needsFlavor: false },
  ],
  extras: [
    { id: "topping", name: "Topping Extra", price: 500, needsFlavor: false },
    { id: "salsa", name: "Salsa Chocolate/Caramelo", price: 500, needsFlavor: false },
    { id: "chantilly-extra", name: "Crema Chantilly", price: 600, needsFlavor: false },
    { id: "barquillo-extra", name: "Barquillo Adicional", price: 300, needsFlavor: false },
    { id: "mani", name: "Maní Extra", price: 400, needsFlavor: false },
    { id: "chips", name: "Chips de Chocolate", price: 400, needsFlavor: false },
  ],
};

export const ALL_PRODUCTS = Object.values(PRODUCTS).flat();

export function findProductById(id) {
  return ALL_PRODUCTS.find((p) => p.id === id) || null;
}

export const PAYMENT_METHODS = [
  { id: "efectivo", label: "Efectivo", commission: 0 },
  { id: "debito", label: "Débito", commission: 0.012 },
  { id: "credito", label: "Crédito", commission: 0.025 },
];

// ---- Inventario ----
export const INVENTORY_CATEGORIES = [
  { id: "helados", label: "Helados" },
  { id: "insumos", label: "Insumos" },
  { id: "empaques", label: "Empaques" },
];

export const INITIAL_STOCK = [
  { id: "h-vainilla", name: "Helado Vainilla", category: "helados", flavor: "Vainilla", unit: "porciones", bodega: 240, vitrina: 40, min: 60, expiryDays: null },
  { id: "h-chocolate", name: "Helado Chocolate", category: "helados", flavor: "Chocolate", unit: "porciones", bodega: 180, vitrina: 30, min: 60, expiryDays: null },
  { id: "h-frutilla", name: "Helado Frutilla", category: "helados", flavor: "Frutilla", unit: "porciones", bodega: 22, vitrina: 10, min: 60, expiryDays: null },
  { id: "h-dulceleche", name: "Helado Dulce de Leche", category: "helados", flavor: "Dulce de Leche", unit: "porciones", bodega: 140, vitrina: 28, min: 50, expiryDays: null },
  { id: "h-menta", name: "Helado Menta", category: "helados", flavor: "Menta", unit: "porciones", bodega: 120, vitrina: 24, min: 50, expiryDays: null },
  { id: "h-mango", name: "Helado Mango", category: "helados", flavor: "Mango", unit: "porciones", bodega: 0, vitrina: 0, min: 40, expiryDays: null },
  { id: "h-maracuya", name: "Helado Maracuyá", category: "helados", flavor: "Maracuyá", unit: "porciones", bodega: 16, vitrina: 6, min: 40, expiryDays: null },
  { id: "h-manjar", name: "Helado Manjar", category: "helados", flavor: "Manjar", unit: "porciones", bodega: 160, vitrina: 32, min: 50, expiryDays: null },

  { id: "cafe-grano", name: "Café en Grano", category: "insumos", flavor: null, unit: "kg", bodega: 4.5, vitrina: 0.5, min: 2, expiryDays: 25 },
  { id: "choc-taza", name: "Chocolate para Taza", category: "insumos", flavor: null, unit: "kg", bodega: 6, vitrina: 1, min: 3, expiryDays: null },
  { id: "chantilly", name: "Crema Chantilly", category: "insumos", flavor: null, unit: "litros", bodega: 3, vitrina: 1, min: 2, expiryDays: 3 },
  { id: "salsa-choc", name: "Salsa Chocolate", category: "insumos", flavor: null, unit: "litros", bodega: 5, vitrina: 1.5, min: 2, expiryDays: null },
  { id: "salsa-caramelo", name: "Salsa Caramelo", category: "insumos", flavor: null, unit: "litros", bodega: 0.8, vitrina: 0.4, min: 2, expiryDays: null },

  { id: "barquillos", name: "Barquillos", category: "empaques", flavor: null, unit: "unidades", bodega: 320, vitrina: 60, min: 100, expiryDays: null },
  { id: "conos", name: "Conos", category: "empaques", flavor: null, unit: "unidades", bodega: 410, vitrina: 80, min: 120, expiryDays: null },
  { id: "vasos", name: "Vasos", category: "empaques", flavor: null, unit: "unidades", bodega: 500, vitrina: 90, min: 150, expiryDays: null },
];

// ---- Datos históricos (para que el Dashboard no arranque vacío) ----
export const HISTORICAL_DAILY_TOTALS = [
  { day: "Vie", total: 118000 },
  { day: "Sáb", total: 145000 },
  { day: "Dom", total: 231000 },
  { day: "Lun", total: 96000 },
  { day: "Mar", total: 121000 },
  { day: "Mié", total: 158000 },
];

export const HISTORICAL_PRODUCT_UNITS = {
  "Vaso Simple": 110,
  "Cono Doble": 88,
  "Vaso Doble": 64,
  "Afogato": 46,
  "Chocolate Caliente": 35,
  "Sundae": 22,
  "Cono Simple": 40,
  "Copa Brownie": 14,
};

function minutesAgo(mins) {
  return new Date(Date.now() - mins * 60000);
}

export const SEED_TODAY_SALES = [
  {
    id: "V-118421",
    time: minutesAgo(260),
    client: "",
    items: [{ name: "Vaso Simple (Vainilla)", price: 2500, qty: 2 }],
    method: "efectivo",
    total: 5000,
  },
  {
    id: "V-118422",
    time: minutesAgo(215),
    client: "",
    items: [
      { name: "Cono Doble (Chocolate + Vainilla)", price: 3500, qty: 1 },
      { name: "Chocolate Caliente", price: 3200, qty: 1 },
    ],
    method: "debito",
    total: 6700,
  },
  {
    id: "V-118423",
    time: minutesAgo(140),
    client: "Mesa 2",
    items: [{ name: "Sundae (Manjar + Chocolate)", price: 4800, qty: 2 }],
    method: "credito",
    total: 9600,
  },
  {
    id: "V-118424",
    time: minutesAgo(75),
    client: "",
    items: [{ name: "Vaso Doble (Frutilla + Vainilla)", price: 3300, qty: 3 }],
    method: "efectivo",
    total: 9900,
  },
  {
    id: "V-118425",
    time: minutesAgo(20),
    client: "",
    items: [
      { name: "Afogato", price: 3800, qty: 2 },
      { name: "Barquillo Adicional", price: 300, qty: 2 },
    ],
    method: "debito",
    total: 8200,
  },
];

export const SEED_MOVEMENTS = [
  { id: "M-3301", time: minutesAgo(400), type: "Compra", itemName: "Café en Grano", text: "+3.0 kg a bodega" },
  { id: "M-3302", time: minutesAgo(300), type: "Traslado", itemName: "Helado Frutilla", text: "10 porciones bodega → vitrina" },
  { id: "M-3303", time: minutesAgo(180), type: "Merma", itemName: "Crema Chantilly", text: "-0.5 litros (Vencimiento) — vitrina" },
];
