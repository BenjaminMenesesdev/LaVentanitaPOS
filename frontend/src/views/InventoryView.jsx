import { useEffect, useState } from 'react'
import { inventoryService } from '../services/inventoryService'
import AlertBanner from '../components/AlertBanner.jsx'
import { formatDateTime } from '../utils.js'

const REASONS = [
  'merma', 'vencimiento', 'derretimiento', 'rotura',
  'consumo_personal', 'recepcion', 'traslado', 'ajuste_manual',
]

export default function InventoryView() {
  const [stocks, setStocks] = useState([])
  const [alerts, setAlerts] = useState({ critical_stock: [], expiring_soon: [] })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    ingredient_id: '', location: 'bodega', quantity_delta: '', unit: 'unidad', reason: 'recepcion', justification: '',
  })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const [stockData, alertData] = await Promise.all([
        inventoryService.list(),
        inventoryService.alerts(),
      ])
      setStocks(stockData)
      setAlerts(alertData)
    } catch (err) {
      setError('No se pudo cargar el inventario.')
    }
  }

  async function handleAdjust(e) {
    e.preventDefault()
    setError('')
    try {
      await inventoryService.adjust({
        ...form,
        ingredient_id: Number(form.ingredient_id),
        quantity_delta: Number(form.quantity_delta),
      })
      setSuccess('Ajuste registrado.')
      setForm({ ...form, quantity_delta: '', justification: '' })
      load()
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al ajustar stock.')
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Inventario</h1>
      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-2 font-semibold text-amber-600">Stock critico</h2>
          {alerts.critical_stock.length === 0 && <p className="text-sm text-gray-400">Sin alertas.</p>}
          <ul className="space-y-1 text-sm">
            {alerts.critical_stock.map((ing) => (
              <li key={ing.id} className="flex justify-between">
                <span>{ing.name}</span>
                <span className="font-medium text-amber-600">Bajo minimo</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-2 font-semibold text-red-600">Proximos a vencer</h2>
          {alerts.expiring_soon.length === 0 && <p className="text-sm text-gray-400">Sin alertas.</p>}
          <ul className="space-y-1 text-sm">
            {alerts.expiring_soon.map((s) => (
              <li key={s.id} className="flex justify-between">
                <span>{s.ingredient?.name}</span>
                <span className="font-medium text-red-600">{formatDateTime(s.expires_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-lg bg-white p-4 shadow">
          <h2 className="mb-3 font-semibold">Stock actual</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2">Insumo</th>
                <th className="pb-2">Ubicacion</th>
                <th className="pb-2">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="py-2">{s.ingredient?.name}</td>
                  <td className="py-2 capitalize">{s.location}</td>
                  <td className="py-2">{Number(s.quantity_base_unit).toLocaleString('es-CL')} {s.ingredient?.base_unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-3 font-semibold">Ajustar stock</h2>
          <form onSubmit={handleAdjust} className="space-y-2 text-sm">
            <input
              type="number"
              placeholder="ID de insumo"
              required
              value={form.ingredient_id}
              onChange={(e) => setForm({ ...form, ingredient_id: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5"
            />
            <select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5"
            >
              <option value="bodega">Bodega</option>
              <option value="vitrina">Vitrina</option>
            </select>
            <input
              type="number"
              step="any"
              placeholder="Cantidad (+ o -)"
              required
              value={form.quantity_delta}
              onChange={(e) => setForm({ ...form, quantity_delta: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5"
            />
            <input
              type="text"
              placeholder="Unidad (ej: bacha_18L, unidad, litro)"
              required
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5"
            />
            <select
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>{r.replace('_', ' ')}</option>
              ))}
            </select>
            <textarea
              placeholder="Justificacion (requerida para mermas/ajustes)"
              value={form.justification}
              onChange={(e) => setForm({ ...form, justification: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5"
              rows="2"
            />
            <button
              type="submit"
              className="w-full rounded bg-brand-600 py-2 font-semibold text-white hover:bg-brand-700"
            >
              Registrar ajuste
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
