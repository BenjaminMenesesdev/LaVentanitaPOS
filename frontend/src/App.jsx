import { Routes, Route } from 'react-router-dom'
import LoginView from './views/LoginView.jsx'
import DashboardView from './views/DashboardView.jsx'
import POSView from './views/POSView.jsx'
import InventoryView from './views/InventoryView.jsx'
import SuppliersView from './views/SuppliersView.jsx'
import UsersView from './views/UsersView.jsx'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <Layout>
              <POSView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Layout>
              <InventoryView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <SuppliersView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <UsersView />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
