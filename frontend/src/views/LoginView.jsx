import { useState } from "react";
import { LogIn, AlertCircle } from "lucide-react";
import { useAppDispatch } from "../context/AppContext.jsx";
import { login as loginRequest } from "../services/api.js";

export default function LoginView() {
  const { login } = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Ingresa correo y contraseña.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await loginRequest({ email, password });
      login(response.user, { access_token: response.access_token, refresh_token: response.refresh_token });
    } catch (err) {
      setError(err.response?.data?.message || "Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-surface rounded-2xl shadow-lg overflow-hidden grid md:grid-cols-2 border border-border">
        <div className="hidden md:flex flex-col justify-between bg-primary text-white p-8 relative">
          <div className="absolute inset-0 bg-[url('/local-la-ventanita.jpg')] bg-cover bg-center opacity-25" />
          <div className="relative z-10">
            <p className="text-13px font-bold uppercase tracking-wide text-white/80">La Ventanita</p>
            <h1 className="text-28px font-bold mt-2 leading-tight">
              Sistema de gestión operativa e inventario
            </h1>
          </div>
          <p className="relative z-10 text-13px text-white/80">
            Ventas, inventario y control financiero en un solo lugar.
          </p>
        </div>

        <div className="p-8 flex flex-col justify-center">
          <div className="mb-6">
            <p className="text-13px font-bold uppercase tracking-wide text-primary">La Ventanita</p>
            <h2 className="text-20px font-bold text-ink mt-1">Iniciar sesión</h2>
            <p className="text-13px text-inkmuted mt-1">Ingresa con tu cuenta asignada por administración.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-12px font-medium text-ink">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-canvas text-13px focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="usuario@laventanita.cl"
                autoFocus
              />
            </div>
            <div>
              <label className="text-12px font-medium text-ink">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-canvas text-13px focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-13px text-danger bg-dangerbg px-3 py-2 rounded-lg">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-13px font-semibold bg-primary text-white hover:bg-primary-dark flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <LogIn size={15} />
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="text-11px text-inkmuted mt-6 text-center">
            Los usuarios son creados y administrados por Administración.
          </p>
        </div>
      </div>
    </div>
  );
}
