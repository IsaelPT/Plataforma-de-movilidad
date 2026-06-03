import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, MapPin, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import RideCard from '../components/RideCard';
import type { Ride } from '../types';

export default function RideHistory() {
  const { userId, role } = useApp();
  const navigate = useNavigate();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.rides
      .history(userId)
      .then(setRides)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const filtered = rides.filter((r) => {
    if (filter === 'active')
      return ['solicitado', 'en_camino', 'llego', 'iniciado'].includes(r.status);
    if (filter === 'completed') return r.status === 'finalizado';
    if (filter === 'cancelled') return r.status.startsWith('cancelado');
    return true;
  });

  const tabs = [
    { key: 'all' as const, label: 'Todos' },
    { key: 'active' as const, label: 'Activos' },
    { key: 'completed' as const, label: 'Completados' },
    { key: 'cancelled' as const, label: 'Cancelados' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Historial de viajes</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === t.key
                ? 'bg-primary-100 text-primary-700'
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
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Sin viajes
          </h2>
          <p className="text-sm text-gray-400">
            {filter === 'all'
              ? 'No has realizado ningún viaje aún'
              : `No hay viajes ${
                  filter === 'active'
                    ? 'activos'
                    : filter === 'completed'
                    ? 'completados'
                    : 'cancelados'
                }`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
          ))}
        </div>
      )}
    </div>
  );
}
