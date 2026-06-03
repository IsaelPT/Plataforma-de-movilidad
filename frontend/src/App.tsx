import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import AuthLoading from './components/auth/AuthLoading';
import Login from './pages/Login';
import Register from './pages/Register';
import PassengerDashboard from './pages/PassengerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import BookRide from './pages/BookRide';
import ScheduleRide from './pages/ScheduleRide';
import RideHistory from './pages/RideHistory';
import RideDetail from './pages/RideDetail';
import TrustedContacts from './pages/TrustedContacts';
import CancelRide from './pages/CancelRide';
import SosAlerts from './pages/SosAlerts';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useApp();
  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useApp();
  if (isLoading) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RootRedirect() {
  const { isAuthenticated, isLoading } = useApp();
  if (isLoading) return <AuthLoading />;
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function DashboardRedirect() {
  const { role } = useApp();
  if (role === 'admin') return <Navigate to="/sos" replace />;
  if (role === 'driver') return <DriverDashboard />;
  return <PassengerDashboard />;
}

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/book" element={<BookRide />} />
          <Route path="/schedule" element={<ScheduleRide />} />
          <Route path="/history" element={<RideHistory />} />
          <Route path="/ride/:id" element={<RideDetail />} />
          <Route path="/contacts" element={<TrustedContacts />} />
          <Route path="/cancel/:id" element={<CancelRide />} />
          <Route path="/sos" element={<SosAlerts />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}
