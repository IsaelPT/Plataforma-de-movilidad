import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { CancellationReason } from '../types';

export default function CancelRide() {
  const { id } = useParams<{ id: string }>();
  const { userId, role } = useApp();
  const navigate = useNavigate();

  const [reasons, setReasons] = useState<CancellationReason[]>([]);
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.cancellation
      .reasons(role === 'driver' ? 'driver' : 'passenger')
      .then(setReasons)
      .catch(() => {});
  }, [role]);

  const handleCancel = async () => {
    if (!id || !userId || !role) return;
    setLoading(true);
    setError('');
    try {
      await api.rides.cancel(id, {
        userId,
        role: role === 'passenger' ? 'cliente' : 'conductor',
        reasonCode: selectedReason || undefined,
        notes: notes || undefined,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cancelar el viaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="btn-ghost p-2">
          <X className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Cancelar viaje</h1>
      </div>

      <div className="card space-y-4">
        <p className="text-sm text-gray-600">
          Selecciona un motivo para la cancelación:
        </p>

        {reasons.length > 0 ? (
          <div className="space-y-2">
            {reasons.map((r) => (
              <label
                key={r.id}
                className={`block p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedReason === r.code
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="reason"
                    value={r.code}
                    checked={selectedReason === r.code}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-red-600"
                  />
                  <span className="text-sm font-medium">{r.label}</span>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[
              { code: 'CLIENTE_CAMBIO_PLANES', label: 'Cambio de planes' },
              { code: 'CLIENTE_TIEMPO_ESPERA', label: 'Tiempo de espera muy largo' },
              { code: 'CLIENTE_OTRO', label: 'Otro motivo' },
            ].map((r) => (
              <label
                key={r.code}
                className={`block p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedReason === r.code
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="reason"
                    value={r.code}
                    checked={selectedReason === r.code}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-red-600"
                  />
                  <span className="text-sm font-medium">{r.label}</span>
                </div>
              </label>
            ))}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comentarios adicionales (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe el motivo..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
        )}

        <button
          onClick={handleCancel}
          disabled={loading}
          className="btn-danger w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Confirmar cancelación'
          )}
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full text-sm text-gray-500 py-2 hover:text-gray-700 transition-colors"
        >
          Volver sin cancelar
        </button>
      </div>
    </div>
  );
}
