import { useEffect, useState } from 'react'
import { supplierService } from '../services/supplierService'
import AlertBanner from '../components/AlertBanner.jsx'
import { formatCurrency } from '../utils.js'

export default function SuppliersView() {
  const [suppliers, setSuppliers] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const [supplierData, suggestionData] = await Promise.all([
        supplierService.list(),
        supplierService.purchaseSuggestions(),
      ])
      setSuppliers(supplierData)
      setSuggestions(suggestionData)
    } catch (err) {
      setError('No se pudo cargar proveedores.')
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Proveedores y sugerencia de compra</h1>
      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold">Sugerencia automatica de compras</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="pb-2">Insumo</th>
              <th className="pb-2">Stock actual</th>
              <th className="pb-2">Consumo diario</th>
              <th className="pb-2">Dias cubiertos</th>
              <th className="pb-2">Sugerido</th>
              <th className="pb-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s) => (
              <tr key={s.ingredient_id} className="border-t">
                <td className="py-2">{s.ingredient_name}</td>
                <td className="py-2">{s.current_stock}</td>
                <td className="py-2">{s.daily_burn_rate}</td>
                <td className="py-2">{s.days_covered ?? '-'}</td>
                <td className="py-2">{s.suggested_purchase_qty_base_unit}</td>
                <td className="py-2">
                  {s.is_critical ? (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">Critico</span>
                  ) : (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold">Directorio de proveedores</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="pb-2">Nombre</th>
              <th className="pb-2">Contacto</th>
              <th className="pb-2">Lead time</th>
              <th className="pb-2">Pedido minimo</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((sup) => (
              <tr key={sup.id} className="border-t">
                <td className="py-2">{sup.name}</td>
                <td className="py-2">{sup.contact_name || '-'}</td>
                <td className="py-2">{sup.avg_lead_time_days} dia(s)</td>
                <td className="py-2">{formatCurrency(sup.min_order_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
