import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapPin,
  ArrowLeft,
  Clock,
  DollarSign,
  Ruler,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';
import MapView from '../components/MapView';
import StatusBadge from '../components/StatusBadge';
import type { Ride } from '../types';

export default function RideDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.rides
      .getById(id)
      .then(setRide)
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!ride) return null;

  const dist = ride.estimatedDistanceKm
    ? `${Number(ride.estimatedDistanceKm).toFixed(1)} km`
    : '—';
  const dur = ride.estimatedDurationMin
    ? `${Math.round(Number(ride.estimatedDurationMin))} min`
    : '—';
  const cost = ride.totalCost
    ? `$${Number(ride.totalCost).toFixed(2)}`
    : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Detalle del viaje</h1>
      </div>

      <MapView
        origin={ride.origin}
        destination={ride.destination}
        height="250px"
      />

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={ride.status} />
          <span className="text-xs text-gray-400">
            ID: {ride.id.slice(0, 8)}...
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="w-0.5 h-10 bg-gray-300" />
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">Origen</p>
              <p className="font-medium text-gray-900">
                {ride.originAddress || `${ride.origin.lat.toFixed(4)}, ${ride.origin.lng.toFixed(4)}`}
              </p>
              <p className="text-sm text-gray-500 mt-3">Destino</p>
              <p className="font-medium text-gray-900">
                {ride.destinationAddress || `${ride.destination.lat.toFixed(4)}, ${ride.destination.lng.toFixed(4)}`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <Ruler className="w-5 h-5 text-primary-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Distancia</p>
            <p className="font-semibold text-sm">{dist}</p>
          </div>
          <div className="text-center">
            <Clock className="w-5 h-5 text-primary-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Duración</p>
            <p className="font-semibold text-sm">{dur}</p>
          </div>
          <div className="text-center">
            <DollarSign className="w-5 h-5 text-primary-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Costo</p>
            <p className="font-semibold text-sm">{cost}</p>
          </div>
        </div>

        {(ride.startedAt || ride.finishedAt) && (
          <div className="pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-500">
            {ride.startedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Inicio: {new Date(ride.startedAt).toLocaleString('es-MX')}
              </div>
            )}
            {ride.finishedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fin: {new Date(ride.finishedAt).toLocaleString('es-MX')}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-400 pt-2">
          Solicitado: {new Date(ride.createdAt).toLocaleString('es-MX')}
        </div>
      </div>
    </div>
  );
}
