import type { RideStatus } from '../types';

const statusConfig: Record<RideStatus, { label: string; color: string }> = {
  solicitado: { label: 'Buscando conductor', color: 'bg-yellow-100 text-yellow-800' },
  en_camino: { label: 'Conductor en camino', color: 'bg-blue-100 text-blue-800' },
  llego: { label: 'Conductor llegó', color: 'bg-indigo-100 text-indigo-800' },
  iniciado: { label: 'Viaje en curso', color: 'bg-green-100 text-green-800' },
  finalizado: { label: 'Viaje finalizado', color: 'bg-gray-100 text-gray-800' },
  cancelado_cliente: { label: 'Cancelado (tú)', color: 'bg-red-100 text-red-800' },
  cancelado_conductor: { label: 'Cancelado (conductor)', color: 'bg-red-100 text-red-800' },
};

export default function StatusBadge({ status }: { status: RideStatus }) {
  const config = statusConfig[status] ?? {
    label: status,
    color: 'bg-gray-100 text-gray-800',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}
