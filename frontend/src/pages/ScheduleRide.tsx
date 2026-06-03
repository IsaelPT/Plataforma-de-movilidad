import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function ScheduleRide() {
  const { userId } = useApp();
  const navigate = useNavigate();

  const [originLat, setOriginLat] = useState('');
  const [originLng, setOriginLng] = useState('');
  const [destLat, setDestLat] = useState('');
  const [destLng, setDestLng] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!originLat || !originLng || !destLat || !destLng || !scheduledDate || !scheduledTime) {
      setError('Completa todos los campos');
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`);
    if (scheduledAt <= new Date()) {
      setError('La fecha debe ser en el futuro');
      return;
    }

    setLoading(true);
    try {
      await api.scheduling.create({
        passengerId: userId,
        originLat: parseFloat(originLat),
        originLng: parseFloat(originLng),
        destinationLat: parseFloat(destLat),
        destinationLng: parseFloat(destLng),
        scheduledAt: scheduledAt.toISOString(),
        originAddress: originAddress || undefined,
        destinationAddress: destinationAddress || undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al programar el viaje');
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (success) {
    return (
      <div className="card text-center py-12">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Viaje programado
        </h2>
        <p className="text-sm text-gray-500">
          Te notificaremos cuando llegue el momento
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Programar un viaje</h1>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección de origen
          </label>
          <input
            type="text"
            placeholder="Ej: Av. Reforma 123"
            value={originAddress}
            onChange={(e) => setOriginAddress(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Latitud</label>
            <input
              type="number"
              step="any"
              placeholder="19.4326"
              value={originLat}
              onChange={(e) => setOriginLat(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Longitud</label>
            <input
              type="number"
              step="any"
              placeholder="-99.1332"
              value={originLng}
              onChange={(e) => setOriginLng(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección de destino
          </label>
          <input
            type="text"
            placeholder="Ej: Insurgentes Sur 456"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Latitud destino
            </label>
            <input
              type="number"
              step="any"
              placeholder="19.4326"
              value={destLat}
              onChange={(e) => setDestLat(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Longitud destino
            </label>
            <input
              type="number"
              step="any"
              placeholder="-99.1332"
              value={destLng}
              onChange={(e) => setDestLng(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha y hora del viaje
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={scheduledDate}
              min={minDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="input-field"
            />
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Programar viaje
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
