import { useState } from "react";
import { Check } from "lucide-react";
import Layout from "./components/Layout.jsx";
import POSView from "./views/POSView.jsx";
import InventoryView from "./views/InventoryView.jsx";
import DashboardView from "./views/DashboardView.jsx";
import { useAppState } from "./context/AppContext.jsx";

export default function App() {
  const [view, setView] = useState("pos");
  const { toast } = useAppState();

  return (
    <Layout view={view} setView={setView}>
      {view === "pos" && <POSView />}
      {view === "inventario" && <InventoryView />}
      {view === "dashboard" && <DashboardView setView={setView} />}

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-ink text-white px-4 py-2 rounded-lg text-sm font-medium z-50 flex items-center gap-2 shadow-lg">
          <Check size={14} />
          {toast}
        </div>
      )}
    </Layout>
  );
}
