import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  MapPin,
  Check,
  X,
  Circle,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { rideSocket } from '../services/socket';
import MapView from '../components/MapView';
import StatusBadge from '../components/StatusBadge';
import type { Ride, RideOfferEvent, SosAlertEvent } from '../types';

export default function DriverDashboard() {
  const { userId, role } = useApp();
  const navigate = useNavigate();
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [pendingOffer, setPendingOffer] = useState<RideOfferEvent | null>(null);
  const [history, setHistory] = useState<Ride[]>([]);
  const [driverStatus, setDriverStatus] = useState<'available' | 'busy'>('available');
  const [driverId, setDriverId] = useState<string | null>(null);
  const [sosAlert, setSosAlert] = useState<SosAlertEvent | null>(null);
  const locationInterval = useRef<ReturnType<typeof setInterval>>();

  // Register driver and load history
  useEffect(() => {
    if (!userId || role !== 'driver') return;
    api.drivers.register(userId).then((d) => setDriverId(d.id)).catch(() => {});
    api.rides.history(userId).then(setHistory).catch(() => {});
  }, [userId, role]);

  // Sync driver availability with backend
  useEffect(() => {
    if (!driverId) return;
    const status = driverStatus === 'available' ? 'disponible' : 'ocupado';
    api.drivers.updateStatus(driverId, status).catch(() => {});
  }, [driverStatus, driverId]);

  // Periodically send location when available
  useEffect(() => {
    if (!driverId || driverStatus !== 'available' || !navigator.geolocation) return;

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          rideSocket.updateLocation(
            driverId,
            pos.coords.latitude,
            pos.coords.longitude,
          );
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 },
      );
    };

    sendLocation();
    locationInterval.current = setInterval(sendLocation, 10000);

    return () => {
      if (locationInterval.current) clearInterval(locationInterval.current);
    };
  }, [driverId, driverStatus]);

  // WebSocket listeners
  useEffect(() => {
    const unsubOffer = rideSocket.onRideOffer((data) => {
      setPendingOffer(data);
      setTimeout(() => setPendingOffer(null), 20000);
    });

    const unsubAccepted = rideSocket.onRideAccepted((data) => {
      setPendingOffer(null);
      if (data.rideId) {
        api.rides.getById(data.rideId).then(setActiveRide).catch(() => {});
      }
    });

    const unsubStatus = rideSocket.onRideStatusChanged((data) => {
      if (data.rideId === activeRide?.id) {
        setActiveRide((prev) =>
          prev ? { ...prev, status: data.status } : prev,
        );
      }
    });

    const unsubCancel = rideSocket.onRideCancelled((data) => {
      if (data.rideId === activeRide?.id) {
        setActiveRide(null);
      }
    });

    const unsubNav = rideSocket.onStartNavigation((data) => {
      if (data.rideId && activeRide) {
        setActiveRide((prev) =>
          prev ? { ...prev, routePolyline: data.routePolyline } : prev,
        );
      }
    });

    const unsubSos = rideSocket.onSosAlert((data) => {
      setSosAlert(data);
    });

    return () => {
      unsubOffer();
      unsubAccepted();
      unsubStatus();
      unsubCancel();
      unsubNav();
      unsubSos();
    };
  }, [activeRide?.id]);

  const handleAccept = () => {
    if (!pendingOffer) return;
    rideSocket.acceptRide(pendingOffer.rideId, userId);
    setDriverStatus('busy');
  };

  const handleReject = () => {
    if (!pendingOffer) return;
    rideSocket.rejectRide(pendingOffer.rideId, userId);
    setPendingOffer(null);
  };

  const handleStatusUpdate = (status: string) => {
    if (!activeRide) return;
    rideSocket.changeRideStatus(activeRide.id, status);
  };

  const handleToggleAvailability = () => {
    setDriverStatus((prev) => (prev === 'available' ? 'busy' : 'available'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Panel del Conductor</h1>
        <button
          onClick={handleToggleAvailability}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            driverStatus === 'available'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          <Circle
            className={`w-3 h-3 fill-current ${
              driverStatus === 'available' ? 'text-green-500' : 'text-gray-400'
            }`}
          />
          {driverStatus === 'available' ? 'Disponible' : 'Ocupado'}
        </button>
      </div>

      {sosAlert && (
        <div className="card border-2 border-red-300 bg-red-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="font-semibold text-red-900">Alerta SOS</h2>
          </div>
          <p className="text-sm text-red-700 mb-3">
            Pasajero {sosAlert.passengerId.slice(0, 8)}... en el viaje{' '}
            {sosAlert.rideId.slice(0, 8)}...
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/ride/${sosAlert.rideId}`)}
              className="btn-primary flex-1 text-sm"
            >
              Ver viaje
            </button>
            <button
              onClick={() => setSosAlert(null)}
              className="btn-secondary flex-1 text-sm"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {pendingOffer && (
        <div className="card border-2 border-primary-200 bg-primary-50/50 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-primary-900">
              Nueva solicitud de viaje
            </h2>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-green-500" />
              <span>{pendingOffer.originAddress || 'Origen'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{pendingOffer.destinationAddress || 'Destino'}</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>{pendingOffer.estimatedDistance.toFixed(1)} km</span>
              <span>{Math.round(pendingOffer.estimatedDuration)} min</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Aceptar
            </button>
            <button
              onClick={handleReject}
              className="flex-1 bg-white text-gray-700 py-3 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Rechazar
            </button>
          </div>
        </div>
      )}

      {activeRide && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Viaje asignado</h2>
            <StatusBadge status={activeRide.status} />
          </div>

          <MapView
            origin={activeRide.origin}
            destination={activeRide.destination}
            height="200px"
          />

          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">
                {activeRide.originAddress || 'Origen'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="text-gray-600">
                {activeRide.destinationAddress || 'Destino'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {activeRide.status === 'solicitado' && (
              <button
                onClick={() => handleStatusUpdate('en_camino')}
                className="btn-primary col-span-2 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Iniciar viaje
              </button>
            )}
            {activeRide.status === 'en_camino' && (
              <button
                onClick={() => handleStatusUpdate('llego')}
                className="btn-primary col-span-2"
              >
                Llegué al origen
              </button>
            )}
            {activeRide.status === 'llego' && (
              <button
                onClick={() => handleStatusUpdate('iniciado')}
                className="btn-primary col-span-2"
              >
                Iniciar viaje
              </button>
            )}
            {activeRide.status === 'iniciado' && (
              <button
                onClick={() => handleStatusUpdate('finalizado')}
                className="btn-primary col-span-2"
              >
                Finalizar viaje
              </button>
            )}
          </div>

          {['solicitado', 'en_camino', 'llego'].includes(
            activeRide.status,
          ) && (
            <button
              onClick={() => navigate(`/cancel/${activeRide.id}`)}
              className="w-full mt-2 text-sm text-red-600 py-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              Cancelar viaje
            </button>
          )}
        </div>
      )}

      {!activeRide && !pendingOffer && (
        <div className="card text-center py-12">
          <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Esperando solicitudes
          </h2>
          <p className="text-sm text-gray-400">
            {driverStatus === 'available'
              ? 'Las solicitudes de viaje aparecerán aquí'
              : 'Activa tu disponibilidad para recibir viajes'}
          </p>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
            Viajes recientes
          </h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((ride) => (
              <div
                key={ride.id}
                className="card !p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/ride/${ride.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm truncate">
                      {ride.originAddress || 'Viaje'}
                    </span>
                  </div>
                  <StatusBadge status={ride.status} />
                </div>
                {ride.totalCost && (
                  <p className="text-sm font-semibold text-gray-700 mt-1">
                    ${Number(ride.totalCost).toFixed(2)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
