import { MapPin } from 'lucide-react';
import type { Ride } from '../types';
import StatusBadge from './StatusBadge';

interface RideCardProps {
  ride: Ride;
  onClick?: () => void;
}

export default function RideCard({ ride, onClick }: RideCardProps) {
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
    <div
      className="card cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <StatusBadge status={ride.status} />
        <span className="text-sm text-gray-400 font-medium">{cost}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <div className="w-0.5 h-8 bg-gray-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {ride.originAddress || 'Origen'}
            </p>
            <p className="text-sm text-gray-500 truncate mt-2">
              {ride.destinationAddress || 'Destino'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
        <span>{dist}</span>
        <span>{dur}</span>
        <span className="text-gray-300">|</span>
        <span className="text-xs text-gray-400">
          {new Date(ride.createdAt).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
