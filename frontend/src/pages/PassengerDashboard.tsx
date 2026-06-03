import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Navigation, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { rideSocket, geoSocket } from '../services/socket';
import MapView from '../components/MapView';
import StatusBadge from '../components/StatusBadge';
import type { Ride, DriverLocation } from '../types';

export default function PassengerDashboard() {
  const { userId, role, isConnected, setActiveRide } = useApp();
  const navigate = useNavigate();
  const [activeRide, setLocalRide] = useState<Ride | null>(null);
  const [drivers, setDrivers] = useState<DriverLocation[]>([]);
  const [history, setHistory] = useState<Ride[]>([]);

  useEffect(() => {
    if (!userId || role !== 'passenger') return;
    api.rides.history(userId).then(setHistory).catch(() => {});

    const unsubStatus = rideSocket.onRideStatusChanged((data) => {
      if (data.rideId === activeRide?.id) {
        setActiveRide((prev) =>
          prev ? { ...prev, status: data.status } : prev,
        );
      }
    });

    const unsubLoc = geoSocket.onDriverLocationUpdate((data) => {
      setDrivers(data || []);
    });

    const unsubAccepted = rideSocket.onRideAccepted((data) => {
      if (data.rideId) {
        api.rides.getById(data.rideId).then(setLocalRide).catch(() => {});
      }
    });

    const unsubCancelled = rideSocket.onRideCancelled((data) => {
      if (data.rideId === activeRide?.id) {
        setLocalRide(null);
        setActiveRide(null);
      }
    });

    return () => {
      unsubStatus();
      unsubLoc();
      unsubAccepted();
      unsubCancelled();
    };
  }, [userId, role, activeRide?.id]);

  const currentRide = activeRide || history.find((r) =>
    ['solicitado', 'en_camino', 'llego', 'iniciado'].includes(r.status),
  );

  const recentHistory = history
    .filter((r) => r.status === 'finalizado' || r.status.startsWith('cancelado'))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {currentRide ? (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Viaje activo</h2>
            <StatusBadge status={currentRide.status} />
          </div>

          <MapView
            origin={currentRide.origin}
            destination={currentRide.destination}
            drivers={drivers.filter(
              (d) => d.driverId === currentRide.driverId,
            )}
            height="200px"
          />

          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">
                {currentRide.originAddress || 'Origen'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="text-gray-600">
                {currentRide.destinationAddress || 'Destino'}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {currentRide.status === 'solicitado' && (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex-1 text-center text-sm"
              >
                Cancelar viaje
              </button>
            )}
            {['en_camino', 'llego'].includes(currentRide.status) && (
              <button
                onClick={() => navigate(`/cancel/${currentRide.id}`)}
                className="btn-secondary flex-1 text-center text-sm"
              >
                Cancelar viaje
              </button>
            )}
            {['solicitado', 'en_camino', 'llego', 'iniciado'].includes(currentRide.status) && (
              <button
                onClick={() =>
                  api.sos
                    .trigger({
                      rideId: currentRide.id,
                      passengerId: userId,
                      lat: currentRide.origin.lat,
                      lng: currentRide.origin.lng,
                    })
                    .then(() => alert('Alerta SOS enviada a tus contactos'))
                    .catch(() => alert('Error al enviar SOS'))
                }
                className="btn-danger flex-1 text-center text-sm flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                SOS
              </button>
            )}
          </div>

          <button
            onClick={() => navigate(`/ride/${currentRide.id}`)}
            className="w-full mt-2 text-sm text-primary-600 py-2 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Ver detalle del viaje
          </button>
        </div>
      ) : (
        <div className="card text-center py-12">
          <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Sin viajes activos
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Solicita un viaje o programa uno para más tarde
          </p>
          <button
            onClick={() => navigate('/book')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Pedir viaje
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/book')}
          className="flex-1 card flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-sm">Pedir viaje</p>
            <p className="text-xs text-gray-400">Ahora</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/schedule')}
          className="flex-1 card flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-sm">Programar</p>
            <p className="text-xs text-gray-400">Para después</p>
          </div>
        </button>
      </div>

      {recentHistory.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
            Viajes recientes
          </h3>
          <div className="space-y-2">
            {recentHistory.map((ride) => (
              <button
                key={ride.id}
                onClick={() => navigate(`/ride/${ride.id}`)}
                className="w-full card !p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm truncate">
                    {ride.originAddress || 'Viaje'}
                  </span>
                </div>
                <StatusBadge status={ride.status} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
