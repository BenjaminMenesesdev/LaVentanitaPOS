import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { useAppState, useAppDispatch } from "../context/AppContext.jsx";
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import Badge from "../components/ui/Badge.jsx";
import { ROLES, ROLE_LABELS } from "../roles.js";
import { fetchUsers, createUser, updateUser, deleteUser } from "../services/api.js";

const ROLE_TONE = {
  [ROLES.ADMIN]: "ok",
  [ROLES.OPERADOR]: "neutral",
  [ROLES.AUDITORIA]: "warn",
};

const emptyForm = { name: "", username: "", password: "", role: ROLES.OPERADOR };

// Solo Administración accede a esta vista (ver roles.js / NAV_BY_ROLE).
export default function UsersView() {
  const { user } = useAppState();
  const { showToast } = useAppDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(Array.isArray(data) ? data : data.data ?? []);
    } catch (error) {
      console.error("Error cargando usuarios", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(u) {
    setEditing(u);
    setForm({ name: u.name, username: u.username, password: "", role: u.role });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await updateUser(editing.id, form);
        showToast("Usuario actualizado");
      } else {
        await createUser(form);
        showToast("Usuario creado");
      }
      setShowForm(false);
      loadUsers();
    } catch (error) {
      showToast(error.response?.data?.message || "Error al guardar usuario");
    }
  }

  async function confirmDelete() {
    try {
      await deleteUser(pendingDelete.id);
      showToast("Usuario eliminado");
      setPendingDelete(null);
      loadUsers();
    } catch (error) {
      showToast(error.response?.data?.message || "Error al eliminar usuario");
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-18px font-bold text-ink flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            Usuarios y permisos
          </h1>
          <p className="text-12.5px text-inkmuted mt-0.5">
            Solo Administración puede crear, editar o eliminar cuentas.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 text-13px font-semibold bg-primary text-white px-3 py-2 rounded-md hover:bg-primary-dark"
        >
          <Plus size={14} />
          Nuevo usuario
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-13px">
          <thead>
            <tr className="text-inkmuted text-left border-b border-border bg-muted/40">
              <th className="font-medium px-4 py-2.5">Nombre</th>
              <th className="font-medium py-2.5">Usuario</th>
              <th className="font-medium py-2.5">Rol</th>
              <th className="font-medium py-2.5 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-2.5 font-medium text-ink">
                  {u.name} {u.id === user?.id && <span className="text-inkmuted text-11px">(tú)</span>}
                </td>
                <td className="py-2.5 text-inkmuted font-mono">{u.username}</td>
                <td className="py-2.5">
                  <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABELS[u.role] || u.role}</Badge>
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(u)} className="text-inkmuted hover:text-primary">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setPendingDelete(u)} className="text-inkmuted hover:text-danger">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-inkmuted">
                  Aún no hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal
          title={editing ? "Editar usuario" : "Nuevo usuario"}
          onClose={() => setShowForm(false)}
          footer={
            <button
              type="submit"
              form="user-form"
              className="w-full py-2.5 rounded-lg text-13px font-semibold bg-primary text-white hover:bg-primary-dark"
            >
              {editing ? "Guardar cambios" : "Crear usuario"}
            </button>
          }
        >
          <form id="user-form" onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-12px font-medium text-ink">Nombre completo</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-13px"
              />
            </div>
            <div>
              <label className="text-12px font-medium text-ink">Usuario</label>
              <input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-13px"
              />
            </div>
            <div>
              <label className="text-12px font-medium text-ink">
                {editing ? "Nueva contraseña (opcional)" : "Contraseña"}
              </label>
              <input
                type="password"
                required={!editing}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-13px"
              />
            </div>
            <div>
              <label className="text-12px font-medium text-ink">Rol</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-13px"
              >
                {Object.values(ROLES).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Eliminar usuario"
          message={`¿Deseas realmente eliminar a "${pendingDelete.name}"? Esta acción no se puede deshacer.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
