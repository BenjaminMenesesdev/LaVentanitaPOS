import { useEffect, useState } from 'react'
import { CartProvider, useCart } from '../context/CartContext.jsx'
import { productService } from '../services/productService'
import { saleService } from '../services/saleService'
import BarcodeScanner from '../components/BarcodeScanner.jsx'
import AlertBanner from '../components/AlertBanner.jsx'
import { formatCurrency } from '../utils.js'

function POSInner() {
  const [products, setProducts] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { items, addItem, updateQuantity, removeItem, clear, total } = useCart()

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const data = await productService.list()
      setProducts(data.data || data)
    } catch (err) {
      setError('No se pudieron cargar los productos.')
    }
  }

  async function handleScan(barcode) {
    setError('')
    try {
      const product = await productService.findByBarcode(barcode)
      addItem(product)
      setSuccess(`Agregado: ${product.name}`)
      setTimeout(() => setSuccess(''), 1500)
    } catch (err) {
      setError(`Codigo no encontrado: ${barcode}`)
    }
  }

  async function handleCheckout() {
    if (items.length === 0) return
    setSubmitting(true)
    setError('')
    try {
      const payload = items.map((i) => ({ product_id: i.product.id, quantity: i.quantity }))
      await saleService.create(payload, paymentMethod)
      setSuccess('Venta registrada correctamente.')
      clear()
      setTimeout(() => setSuccess(''), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar la venta.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Punto de Venta</h1>
      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

      <div className="mb-4">
        <BarcodeScanner onScan={handleScan} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="mb-2 font-semibold">Catalogo</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => addItem(product)}
                className="rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-brand-500"
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-500">{formatCurrency(product.sale_price)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-3 font-semibold">Carrito</h2>
          {items.length === 0 && <p className="text-sm text-gray-400">Sin productos.</p>}
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <div>{item.product.name}</div>
                  <div className="text-gray-400">{formatCurrency(item.product.sale_price)} c/u</div>
                </div>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product.id, Number(e.target.value))}
                  className="w-14 rounded border border-gray-300 px-1 py-0.5 text-center"
                />
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  x
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t pt-3">
            <div className="mb-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <label className="mb-1 block text-xs font-medium text-gray-600">Medio de pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mb-3 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="efectivo">Efectivo</option>
              <option value="debito">Debito</option>
              <option value="credito">Credito</option>
            </select>

            <button
              onClick={handleCheckout}
              disabled={items.length === 0 || submitting}
              className="w-full rounded bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? 'Procesando...' : 'Cobrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function POSView() {
  return (
    <CartProvider>
      <POSInner />
    </CartProvider>
  )
}
