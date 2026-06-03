import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng, DriverLocation } from '../types';

const driverIcon = L.divIcon({
  html: `<div class="w-6 h-6 bg-primary-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M5 11l7-7 7 7"/></svg>
  </div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const passengerIcon = L.divIcon({
  html: `<div class="w-6 h-6 bg-green-500 border-2 border-white rounded-full shadow-lg"></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const destinationIcon = L.divIcon({
  html: `<div class="w-6 h-6 bg-red-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
  </div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function FitBounds({
  points,
}: {
  points: { lat: number; lng: number }[];
}) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
}

interface MapViewProps {
  origin?: LatLng | null;
  destination?: LatLng | null;
  drivers?: DriverLocation[];
  route?: { lat: number; lng: number }[];
  height?: string;
}

export default function MapView({
  origin,
  destination,
  drivers = [],
  route,
  height = '300px',
}: MapViewProps) {
  const center: [number, number] = origin
    ? [origin.lat, origin.lng]
    : [19.4326, -99.1332];

  const boundsPoints: { lat: number; lng: number }[] = [];
  if (origin) boundsPoints.push(origin);
  if (destination) boundsPoints.push(destination);
  if (route) boundsPoints.push(...route);

  return (
    <div style={{ height }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {boundsPoints.length > 0 && (
          <FitBounds points={boundsPoints} />
        )}
        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={passengerIcon}>
            <Popup>Origen</Popup>
          </Marker>
        )}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup>Destino</Popup>
          </Marker>
        )}
        {drivers.map((d) => (
          <Marker
            key={d.driverId}
            position={[d.lat, d.lng]}
            icon={driverIcon}
          >
            <Popup>Conductor #{d.driverId.slice(0, 6)}</Popup>
          </Marker>
        ))}
        {route && route.length > 1 && (
          <Polyline
            positions={route.map((p) => [p.lat, p.lng])}
            color="#2563eb"
            weight={4}
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
}
