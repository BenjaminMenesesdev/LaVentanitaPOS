import { useEffect, useState } from 'react'
import { dashboardService } from '../services/dashboardService'
import { useAuth } from '../context/AuthContext.jsx'
import { formatCurrency } from '../utils.js'
import AlertBanner from '../components/AlertBanner.jsx'

export default function DashboardView() {
  const [summary, setSummary] = useState(null)
  const [ranking, setRanking] = useState([])
  const [error, setError] = useState('')
  const { isAdmin } = useAuth()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const data = await dashboardService.today()
      setSummary(data)
      if (isAdmin) {
        const rankingData = await dashboardService.productRanking()
        setRanking(rankingData)
      }
    } catch (err) {
      setError('No se pudo cargar el dashboard.')
    }
  }

  if (!summary) {
    return <div>Cargando dashboard...</div>
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard - {summary.date}</h1>
      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard label="Ventas brutas" value={formatCurrency(summary.total_gross)} />
        <MetricCard label="Ventas netas" value={formatCurrency(summary.total_net)} />
        <MetricCard label="Comisiones" value={formatCurrency(summary.total_commission)} />
        <MetricCard label="Margen neto" value={formatCurrency(summary.net_margin)} highlight />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-3 font-semibold">Desglose por medio de pago</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2">Medio</th>
                <th className="pb-2">Bruto</th>
                <th className="pb-2">Neto</th>
                <th className="pb-2">Transacciones</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.by_payment_method || {}).map(([method, data]) => (
                <tr key={method} className="border-t">
                  <td className="py-2 capitalize">{method}</td>
                  <td className="py-2">{formatCurrency(data.gross)}</td>
                  <td className="py-2">{formatCurrency(data.net)}</td>
                  <td className="py-2">{data.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-3 font-semibold">Alertas</h2>
          <div className="space-y-2 text-sm">
            <AlertRow
              label="Insumos en stock critico"
              count={summary.alerts?.critical_stock ?? 0}
              tone="warning"
            />
            <AlertRow
              label="Proximos a vencer"
              count={summary.alerts?.expiring_soon ?? 0}
              tone="error"
            />
          </div>
        </div>
      </div>

      {isAdmin && ranking.length > 0 && (
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-3 font-semibold">Ranking de productos</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2">Producto</th>
                <th className="pb-2">Cantidad vendida</th>
                <th className="pb-2">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((row) => (
                <tr key={row.name} className="border-t">
                  <td className="py-2">{row.name}</td>
                  <td className="py-2">{row.total_quantity}</td>
                  <td className="py-2">{formatCurrency(row.total_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, highlight }) {
  return (
    <div className={`rounded-lg p-4 shadow ${highlight ? 'bg-brand-600 text-white' : 'bg-white'}`}>
      <div className={`text-xs ${highlight ? 'text-brand-100' : 'text-gray-500'}`}>{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  )
}

function AlertRow({ label, count, tone }) {
  const colors = { warning: 'text-amber-600', error: 'text-red-600' }
  return (
    <div className="flex items-center justify-between rounded bg-gray-50 px-3 py-2">
      <span>{label}</span>
      <span className={`font-bold ${count > 0 ? colors[tone] : 'text-gray-400'}`}>{count}</span>
    </div>
  )
}
