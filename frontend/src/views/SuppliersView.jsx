import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Truck, Phone, Mail } from "lucide-react";
import { useAppDispatch } from "../context/AppContext.jsx";
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import Badge from "../components/ui/Badge.jsx";
import { formatCLP } from "../utils.js";
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/api.js";

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const emptyForm = {
  name: "",
  contact_name: "",
  phone: "",
  email: "",
  avg_lead_time_days: 1,
  no_delivery_days: [],
  min_order_amount: 0,
};

// Solo Administración accede a esta vista (ver roles.js / NAV_BY_ROLE). El backend aplica
// la misma restricción con el middleware role:admin en las rutas /suppliers.
export default function SuppliersView() {
  const { showToast } = useAppDispatch();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [formError, setFormError] = useState("");

  async function loadSuppliers() {
    setLoading(true);
    try {
      const data = await fetchSuppliers();
      setSuppliers(Array.isArray(data) ? data : data.data ?? []);
    } catch (error) {
      console.error("Error cargando proveedores", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(supplier) {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      contact_name: supplier.contact_name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      avg_lead_time_days: supplier.avg_lead_time_days,
      no_delivery_days: supplier.no_delivery_days || [],
      min_order_amount: supplier.min_order_amount,
    });
    setFormError("");
    setShowForm(true);
  }

  function toggleDeliveryDay(day) {
    setForm((prev) => {
      const has = prev.no_delivery_days.includes(day);
      const next = has
        ? prev.no_delivery_days.filter((d) => d !== day)
        : [...prev.no_delivery_days, day].sort();
      return { ...prev, no_delivery_days: next };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    try {
      const payload = {
        ...form,
        avg_lead_time_days: Number(form.avg_lead_time_days),
        min_order_amount: Number(form.min_order_amount),
      };
      if (editing) {
        await updateSupplier(editing.id, payload);
        showToast("Proveedor actualizado");
      } else {
        await createSupplier(payload);
        showToast("Proveedor creado");
      }
      setShowForm(false);
      loadSuppliers();
    } catch (error) {
      setFormError(error.response?.data?.message || "Error al guardar el proveedor");
    }
  }

  async function confirmDelete() {
    try {
      await deleteSupplier(pendingDelete.id);
      showToast("Proveedor eliminado");
      setPendingDelete(null);
      loadSuppliers();
    } catch (error) {
      showToast(error.response?.data?.message || "Error al eliminar proveedor");
      setPendingDelete(null);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-18px font-bold text-ink flex items-center gap-2">
            <Truck size={18} className="text-primary" />
            Proveedores
          </h1>
          <p className="text-12.5px text-inkmuted mt-0.5">
            Gestiona los proveedores de ingredientes y sus condiciones de entrega.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 text-13px font-semibold bg-primary text-white px-3 py-2 rounded-md hover:bg-primary-dark"
        >
          <Plus size={14} />
          Nuevo proveedor
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-13px">
          <thead>
            <tr className="text-inkmuted text-left border-b border-border bg-muted/40">
              <th className="font-medium px-4 py-2.5">Proveedor</th>
              <th className="font-medium py-2.5">Contacto</th>
              <th className="font-medium py-2.5">Lead time</th>
              <th className="font-medium py-2.5">Sin entrega</th>
              <th className="font-medium py-2.5">Pedido mínimo</th>
              <th className="font-medium py-2.5 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-2.5 font-medium text-ink">{s.name}</td>
                <td className="py-2.5 text-inkmuted">
                  <div className="flex flex-col gap-0.5">
                    {s.contact_name && <span className="text-ink">{s.contact_name}</span>}
                    {s.phone && (
                      <span className="flex items-center gap-1 text-11.5px">
                        <Phone size={11} /> {s.phone}
                      </span>
                    )}
                    {s.email && (
                      <span className="flex items-center gap-1 text-11.5px">
                        <Mail size={11} /> {s.email}
                      </span>
                    )}
                    {!s.contact_name && !s.phone && !s.email && "—"}
                  </div>
                </td>
                <td className="py-2.5">
                  <Badge tone="neutral">{s.avg_lead_time_days} día{s.avg_lead_time_days === 1 ? "" : "s"}</Badge>
                </td>
                <td className="py-2.5">
                  {s.no_delivery_days?.length ? (
                    <div className="flex gap-1 flex-wrap">
                      {s.no_delivery_days.map((d) => (
                        <Badge key={d} tone="warn">{DAY_LABELS[d]}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-inkmuted">Todos los días</span>
                  )}
                </td>
                <td className="py-2.5 text-ink font-medium">{formatCLP(s.min_order_amount)}</td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(s)} className="text-inkmuted hover:text-primary">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setPendingDelete(s)} className="text-inkmuted hover:text-danger">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && suppliers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-inkmuted">
                  Aún no hay proveedores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal
          title={editing ? "Editar proveedor" : "Nuevo proveedor"}
          onClose={() => setShowForm(false)}
          footer={
            <button
              type="submit"
              form="supplier-form"
              className="w-full py-2.5 rounded-lg text-13px font-semibold bg-primary text-white hover:bg-primary-dark"
            >
              {editing ? "Guardar cambios" : "Crear proveedor"}
            </button>
          }
        >
          <form id="supplier-form" onSubmit={handleSubmit} className="space-y-3">
            {formError && (
              <div className="text-12.5px text-danger bg-dangerbg rounded-lg px-3 py-2">{formError}</div>
            )}
            <div>
              <label className="text-12px font-medium text-ink">Nombre del proveedor</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-13px"
              />
            </div>
            <div>
              <label className="text-12px font-medium text-ink">Nombre de contacto</label>
              <input
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-13px"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-12px font-medium text-ink">Teléfono</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-13px"
                />
              </div>
              <div>
                <label className="text-12px font-medium text-ink">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-13px"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-12px font-medium text-ink">Días de entrega (lead time)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.avg_lead_time_days}
                  onChange={(e) => setForm({ ...form, avg_lead_time_days: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-13px"
                />
              </div>
              <div>
                <label className="text-12px font-medium text-ink">Pedido mínimo (CLP)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={form.min_order_amount}
                  onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-13px"
                />
              </div>
            </div>
            <div>
              <label className="text-12px font-medium text-ink">Días sin entrega</label>
              <div className="flex gap-1.5 mt-1.5">
                {DAY_LABELS.map((label, day) => {
                  const active = form.no_delivery_days.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDeliveryDay(day)}
                      className={`flex-1 py-1.5 rounded-md text-11.5px font-semibold border ${
                        active ? "bg-warnbg text-warn border-warn/40" : "border-border text-inkmuted hover:bg-canvas"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Eliminar proveedor"
          message={`¿Deseas realmente eliminar a "${pendingDelete.name}"? Esta acción no se puede deshacer.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
