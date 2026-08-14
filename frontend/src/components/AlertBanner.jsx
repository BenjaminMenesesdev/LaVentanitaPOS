export default function AlertBanner({ type = 'error', message, onClose }) {
  if (!message) return null

  const colors = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  return (
    <div className={`mb-4 flex items-center justify-between rounded border px-4 py-2 text-sm ${colors[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 font-bold">
          x
        </button>
      )}
    </div>
  )
}
