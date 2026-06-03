import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, ArrowRight, Loader2, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { searchAddress } from '../services/geocoding';
import MapView from '../components/MapView';
import type { LatLng, DriverLocation, GeocodingResult } from '../types';

export default function BookRide() {
  const { userId } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  searchParams.get('cancel');

  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [originLat, setOriginLat] = useState('');
  const [originLng, setOriginLng] = useState('');
  const [destLat, setDestLat] = useState('');
  const [destLng, setDestLng] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nearbyDrivers, setNearbyDrivers] = useState<DriverLocation[]>([]);

  const [originSuggestions, setOriginSuggestions] = useState<GeocodingResult[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<GeocodingResult[]>([]);
  const [searchingOrigin, setSearchingOrigin] = useState(false);
  const [searchingDest, setSearchingDest] = useState(false);
  const originTimeout = useRef<ReturnType<typeof setTimeout>>();
  const destTimeout = useRef<ReturnType<typeof setTimeout>>();

  const origin: LatLng | null =
    originLat && originLng
      ? { lat: parseFloat(originLat), lng: parseFloat(originLng) }
      : null;
  const destination: LatLng | null =
    destLat && destLng
      ? { lat: parseFloat(destLat), lng: parseFloat(destLng) }
      : null;

  const handleSearchDrivers = useCallback(async () => {
    if (!origin) return;
    try {
      const drivers = await api.geo.nearbyDrivers(origin.lat, origin.lng);
      setNearbyDrivers(drivers);
    } catch {
      // ignore
    }
  }, [origin]);

  const handleOriginSearch = (value: string) => {
    setOriginAddress(value);
    if (originTimeout.current) clearTimeout(originTimeout.current);
    if (value.length < 3) { setOriginSuggestions([]); return; }
    setSearchingOrigin(true);
    originTimeout.current = setTimeout(async () => {
      try {
        const results = await searchAddress(value);
        setOriginSuggestions(results);
      } catch { /* ignore */ }
      setSearchingOrigin(false);
    }, 400);
  };

  const handleDestSearch = (value: string) => {
    setDestinationAddress(value);
    if (destTimeout.current) clearTimeout(destTimeout.current);
    if (value.length < 3) { setDestSuggestions([]); return; }
    setSearchingDest(true);
    destTimeout.current = setTimeout(async () => {
      try {
        const results = await searchAddress(value);
        setDestSuggestions(results);
      } catch { /* ignore */ }
      setSearchingDest(false);
    }, 400);
  };

  const selectOrigin = (result: GeocodingResult) => {
    setOriginAddress(result.displayName);
    setOriginLat(result.lat.toString());
    setOriginLng(result.lng.toString());
    setOriginSuggestions([]);
  };

  const selectDestination = (result: GeocodingResult) => {
    setDestinationAddress(result.displayName);
    setDestLat(result.lat.toString());
    setDestLng(result.lng.toString());
    setDestSuggestions([]);
  };

  useEffect(() => {
    return () => {
      if (originTimeout.current) clearTimeout(originTimeout.current);
      if (destTimeout.current) clearTimeout(destTimeout.current);
    };
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!originLat || !originLng || !destLat || !destLng) {
      setError('Completa las coordenadas de origen y destino');
      return;
    }

    setLoading(true);
    try {
      const ride = await api.rides.request({
        passengerId: userId,
        originLat: parseFloat(originLat),
        originLng: parseFloat(originLng),
        destinationLat: parseFloat(destLat),
        destinationLng: parseFloat(destLng),
        originAddress: originAddress || undefined,
        destinationAddress: destinationAddress || undefined,
      });
      navigate(`/dashboard`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al solicitar el viaje');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no disponible');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOriginLat(pos.coords.latitude.toFixed(6));
        setOriginLng(pos.coords.longitude.toFixed(6));
        handleSearchDrivers();
      },
      () => setError('No se pudo obtener tu ubicación'),
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Pedir un viaje</h1>

      <MapView
        origin={origin}
        destination={destination}
        drivers={nearbyDrivers}
        height="250px"
      />

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección de origen
          </label>
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ej: Av. Reforma 123, CDMX"
                  value={originAddress}
                  onChange={(e) => handleOriginSearch(e.target.value)}
                  className="input-field w-full pr-10"
                />
                {searchingOrigin && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
              <button
                onClick={handleUseCurrentLocation}
                className="btn-secondary px-3"
                title="Usar ubicación actual"
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
            {originSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {originSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => selectOrigin(s)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-primary-50 border-b border-gray-100 last:border-0 flex items-start gap-2"
                  >
                    <Search className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{s.displayName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
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
          <div className="relative">
            <input
              type="text"
              placeholder="Ej: Insurgentes Sur 456, CDMX"
              value={destinationAddress}
              onChange={(e) => handleDestSearch(e.target.value)}
              className="input-field w-full pr-10"
            />
            {searchingDest && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            )}
            {destSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {destSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => selectDestination(s)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-primary-50 border-b border-gray-100 last:border-0 flex items-start gap-2"
                  >
                    <Search className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{s.displayName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
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
              Solicitar viaje
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {nearbyDrivers.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Conductores cercanos ({nearbyDrivers.length})
          </h3>
          <div className="space-y-1">
            {nearbyDrivers.map((d) => (
              <div
                key={d.driverId}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <Navigation className="w-3 h-3 text-primary-500" />
                <span>Conductor #{d.driverId.slice(0, 6)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
