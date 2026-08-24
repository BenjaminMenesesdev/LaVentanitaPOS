import { useState } from "react";
import { Check } from "lucide-react";
import Layout from "./components/Layout.jsx";
import LoginView from "./views/LoginView.jsx";
import POSView from "./views/POSView.jsx";
import InventoryView from "./views/InventoryView.jsx";
import DashboardView from "./views/DashboardView.jsx";
import UsersView from "./views/UsersView.jsx";
import SuppliersView from "./views/SuppliersView.jsx";
import { useAppState } from "./context/AppContext.jsx";
import { canAccessView, NAV_BY_ROLE } from "./roles.js";

export default function App() {
  const { user, authLoading, toast } = useAppState();
  const [view, setView] = useState("pos");

  if (authLoading) {
    return <div className="min-h-screen bg-canvas" />;
  }

  if (!user) {
    return <LoginView />;
  }

  const allowed = NAV_BY_ROLE[user.role] || [];
  const effectiveView = canAccessView(user.role, view) ? view : allowed[0];

  return (
    <Layout view={effectiveView} setView={setView}>
      {effectiveView === "pos" && <POSView />}
      {effectiveView === "inventario" && <InventoryView />}
      {effectiveView === "dashboard" && <DashboardView setView={setView} />}
      {effectiveView === "proveedores" && <SuppliersView />}
      {effectiveView === "usuarios" && <UsersView />}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-ink text-white text-13px font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Check size={14} />
          {toast}
        </div>
      )}
    </Layout>
  );
}
