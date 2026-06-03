import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { SosAlert } from '../types';

export default function SosAlerts() {
  const { userId, role } = useApp();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'activa' | 'resuelta' | 'all'>('all');
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || role !== 'admin') return;
    setLoading(true);
    api.sos
      .listAlerts(filter === 'all' ? undefined : filter)
      .then(setAlerts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, role, filter]);

  const handleResolve = async (id: string) => {
    setResolving(id);
    try {
      await api.sos.resolveAlert(id);
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: 'resuelta' as const, resolvedAt: new Date().toISOString() }
            : a,
        ),
      );
    } catch {
      alert('Error al resolver la alerta');
    } finally {
      setResolving(null);
    }
  };

  const tabs = [
    { key: 'all' as const, label: 'Todas' },
    { key: 'activa' as const, label: 'Activas' },
    { key: 'resuelta' as const, label: 'Resueltas' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Alertas SOS</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === t.key
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="card text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Sin alertas
          </h2>
          <p className="text-sm text-gray-400">
            {filter === 'all'
              ? 'No hay alertas SOS registradas'
              : `No hay alertas ${
                  filter === 'activa' ? 'activas' : 'resueltas'
                }`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`card ${
                alert.status === 'activa'
                  ? 'border-red-200 border-2'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      alert.status === 'activa'
                        ? 'text-red-500 animate-pulse'
                        : 'text-gray-400'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      alert.status === 'activa'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {alert.status === 'activa' ? 'Activa' : 'Resuelta'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(alert.createdAt).toLocaleString('es-MX')}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">Pasajero:</span>{' '}
                  <span className="font-medium">
                    {alert.passengerId.slice(0, 12)}...
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Viaje:</span>{' '}
                  <span className="font-medium">
                    {alert.rideId.slice(0, 12)}...
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Ubicación:</span>{' '}
                  <span className="font-medium">
                    {alert.locationLat.toFixed(4)},{' '}
                    {alert.locationLon.toFixed(4)}
                  </span>
                </p>
              </div>

              {alert.status === 'activa' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/ride/${alert.rideId}`)}
                    className="btn-primary flex-1 text-sm"
                  >
                    Ver viaje
                  </button>
                  <button
                    onClick={() => handleResolve(alert.id)}
                    disabled={resolving === alert.id}
                    className="btn-secondary flex-1 text-sm flex items-center justify-center gap-1"
                  >
                    {resolving === alert.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Resolver
                      </>
                    )}
                  </button>
                </div>
              )}

              {alert.resolvedAt && (
                <p className="text-xs text-gray-400 mt-3">
                  Resuelta: {new Date(alert.resolvedAt).toLocaleString('es-MX')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
