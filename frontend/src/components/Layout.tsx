import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Navigation,
  User,
  MapPin,
  Clock,
  Phone,
  History,
  LogOut,
  Car,
  AlertTriangle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = {
  passenger: [
    { path: '/dashboard', label: 'Mi Viaje', icon: Navigation },
    { path: '/book', label: 'Pedir Viaje', icon: MapPin },
    { path: '/schedule', label: 'Programar', icon: Clock },
    { path: '/history', label: 'Historial', icon: History },
    { path: '/contacts', label: 'Contactos', icon: Phone },
  ],
  driver: [
    { path: '/dashboard', label: 'Viajes', icon: Navigation },
    { path: '/history', label: 'Historial', icon: History },
  ],
  admin: [
    { path: '/dashboard', label: 'Panel', icon: Navigation },
    { path: '/sos', label: 'Alertas SOS', icon: AlertTriangle },
  ],
};

export default function Layout() {
  const { role, isConnected, user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const items = role ? navItems[role] : [];
  const displayName = user?.profile?.firstName || user?.email?.split('@')[0] || '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <Car className="w-6 h-6 text-primary-600" />
            <span className="font-bold text-lg text-gray-900">Mobility</span>
          </button>
          <div className="flex items-center gap-2">
            {displayName && (
              <span className="text-xs text-gray-500 hidden sm:block max-w-[100px] truncate">
                {displayName}
              </span>
            )}
            <div
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                isConnected
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
              title={isConnected ? 'Conectado' : 'Desconectado'}
            >
              {isConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">
                {isConnected ? 'En vivo' : 'Sin conexión'}
              </span>
            </div>
            {role && (
              <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full capitalize font-medium hidden sm:inline">
                {role === 'admin' ? 'Admin' : role === 'passenger' ? 'Pasajero' : 'Conductor'}
              </span>
            )}
            <button onClick={handleLogout} className="btn-ghost p-2" title="Cerrar sesión">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-around py-2">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
