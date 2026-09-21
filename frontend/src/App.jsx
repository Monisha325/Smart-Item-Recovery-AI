import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute     from './components/AdminRoute';
import Layout         from './components/Layout';
import AuthLayout     from './components/AuthLayout';

import LandingPage        from './pages/LandingPage';
import NotFoundPage       from './pages/NotFoundPage';
import LoginPage          from './features/auth/LoginPage';
import RegisterPage       from './features/auth/RegisterPage';
import VerifyEmailPage    from './features/auth/VerifyEmailPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage  from './features/auth/ResetPasswordPage';
import ProfilePage        from './features/auth/ProfilePage';

import ItemsListPage  from './features/items/ItemsListPage';
import ItemDetailPage from './features/items/ItemDetailPage';
import CreateItemPage from './features/items/CreateItemPage';
import EditItemPage   from './features/items/EditItemPage';
import MyItemsPage    from './features/items/MyItemsPage';

import MatchesPage       from './features/matches/MatchesPage';
import NotificationsPage from './features/notifications/NotificationsPage';
import RecoveryPage      from './features/qr/RecoveryPage';

// ── Admin routes — lazy-loaded (code splitting) ────────────────────────────
const AdminLayout        = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./features/admin/AdminDashboardPage'));
const AdminUsersPage     = lazy(() => import('./features/admin/AdminUsersPage'));
const AdminItemsPage     = lazy(() => import('./features/admin/AdminItemsPage'));
const AdminMatchesPage   = lazy(() => import('./features/admin/AdminMatchesPage'));

function AdminFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
          {/* ── Landing (standalone layout) ────────────────────── */}
          <Route path="/" element={<LandingPage />} />

          {/* ── Auth pages (AuthLayout) ─────────────────────────── */}
          <Route path="/login"           element={<AuthLayout><LoginPage /></AuthLayout>} />
          <Route path="/register"        element={<AuthLayout><RegisterPage /></AuthLayout>} />
          <Route path="/verify-email"    element={<AuthLayout><VerifyEmailPage /></AuthLayout>} />
          <Route path="/forgot-password" element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />
          <Route path="/reset-password"  element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />

          {/* ── App routes (with navbar + footer) ──────────────── */}
          <Route path="/recover/:token" element={<Layout><RecoveryPage /></Layout>} />

          <Route path="/items"          element={<Layout><ItemsListPage /></Layout>} />
          <Route path="/items/new"      element={<Layout><ProtectedRoute><CreateItemPage /></ProtectedRoute></Layout>} />
          <Route path="/items/mine"     element={<Layout><ProtectedRoute><MyItemsPage /></ProtectedRoute></Layout>} />
          <Route path="/items/:id/edit" element={<Layout><ProtectedRoute><EditItemPage /></ProtectedRoute></Layout>} />
          <Route path="/items/:id"      element={<Layout><ItemDetailPage /></Layout>} />

          <Route path="/matches" element={
            <Layout><ProtectedRoute><MatchesPage /></ProtectedRoute></Layout>
          } />

          <Route path="/profile" element={
            <Layout><ProtectedRoute><ProfilePage /></ProtectedRoute></Layout>
          } />

          <Route path="/notifications" element={
            <Layout><ProtectedRoute><NotificationsPage /></ProtectedRoute></Layout>
          } />

          {/* ── Admin — lazy loaded ─────────────────────────────── */}
          <Route path="/admin" element={
            <AdminRoute>
              <Suspense fallback={<AdminFallback />}>
                <AdminLayout><AdminDashboardPage /></AdminLayout>
              </Suspense>
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <Suspense fallback={<AdminFallback />}>
                <AdminLayout><AdminUsersPage /></AdminLayout>
              </Suspense>
            </AdminRoute>
          } />
          <Route path="/admin/items" element={
            <AdminRoute>
              <Suspense fallback={<AdminFallback />}>
                <AdminLayout><AdminItemsPage /></AdminLayout>
              </Suspense>
            </AdminRoute>
          } />
          <Route path="/admin/matches" element={
            <AdminRoute>
              <Suspense fallback={<AdminFallback />}>
                <AdminLayout><AdminMatchesPage /></AdminLayout>
              </Suspense>
            </AdminRoute>
          } />

          {/* ── 404 ────────────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
  );
}
