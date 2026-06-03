import type { GeocodingResult } from '../types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

export async function searchAddress(query: string): Promise<GeocodingResult[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    'accept-language': 'es',
  });

  const res = await fetch(`${NOMINATIM_URL}/search?${params}`, {
    headers: { 'User-Agent': 'MobilityPlatform/1.0' },
  });

  if (!res.ok) throw new Error('Error al buscar dirección');

  const data = await res.json();

  return data.map((item: any) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}
