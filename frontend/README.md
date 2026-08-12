# La Ventanita — MVP de Sistema de Gestión

MVP en React (Vite + Tailwind) con tres módulos conectados por un mismo estado:

- **Mostrador (POS):** cola de pedidos en curso + últimos cerrados a la izquierda, armador de pedido con búsqueda de productos, selección de sabores, tabla de ítems y cobro a la derecha — inspirado en el flujo de sistemas de mostrador reales.
- **Inventario:** stock por producto/insumo en Bodega y Vitrina, alertas de stock crítico y vencimientos, registro de compras, traslados y mermas con motivo.
- **Panel de Control:** ventas del día, margen neto estimado, desglose por medio de pago, tendencia de 7 días, ranking de productos, alertas de inventario y actividad reciente — todo alimentado por lo que ocurre en Mostrador e Inventario.

No tiene backend: los datos viven en memoria (React Context) durante la sesión del navegador, con algunos datos históricos de ejemplo para que el Panel de Control no arranque vacío.

## Cómo correrlo

Necesitas [Node.js](https://nodejs.org) 18 o superior instalado.

```bash
npm install
npm run dev
```

Abre la URL que muestre la terminal (normalmente `http://localhost:5173`).

## Estructura

```
src/
  context/AppContext.jsx   estado global (pedidos, stock, ventas, movimientos)
  data/data.js              catálogo, stock inicial y datos de ejemplo
  utils.js                  formateo y helpers de stock/alertas
  components/                layout, badges, modal
  views/
    POSView.jsx              Mostrador
    InventoryView.jsx        Inventario
    DashboardView.jsx        Panel de Control
```

## Próximos pasos sugeridos

- Conectar a una base de datos real (Laravel + MySQL, según la propuesta original) en lugar del estado en memoria.
- Persistir ventas e inventario entre sesiones.
- Integrar la comisión real de SumUp/Transbank vía API en vez de la estimación fija.
