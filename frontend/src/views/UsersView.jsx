import { useState } from 'react'
import { authService } from '../services/authService'
import AlertBanner from '../components/AlertBanner.jsx'

export default function UsersView() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '', role: 'cajero',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await authService.register(form)
      setSuccess(`Usuario ${form.name} creado correctamente.`)
      setForm({ name: '', email: '', password: '', password_confirmation: '', role: 'cajero' })
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear usuario.')
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Usuarios</h1>
      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

      <div className="max-w-md rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold">Crear nuevo usuario</h2>
        <form onSubmit={handleSubmit} className="space-y-2 text-sm">
          <input
            type="text" placeholder="Nombre" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1.5"
          />
          <input
            type="email" placeholder="Correo" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1.5"
          />
          <input
            type="password" placeholder="Contrasena (min. 8 caracteres)" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1.5"
          />
          <input
            type="password" placeholder="Confirmar contrasena" required
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1.5"
          />
          <select
            value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1.5"
          >
            <option value="cajero">Cajero</option>
            <option value="admin">Administrador</option>
          </select>
          <button
            type="submit"
            className="w-full rounded bg-brand-600 py-2 font-semibold text-white hover:bg-brand-700"
          >
            Crear usuario
          </button>
        </form>
      </div>
    </div>
  )
}
