export interface Place {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  admin?: string;
  label: string;
}

/** Place search via Open-Meteo's free geocoder (no key, CORS-friendly). */
export async function searchPlace(q: string): Promise<Place[]> {
  if (!q.trim()) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=6&language=de&format=json`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((r: any) => ({
      name: r.name,
      lat: r.latitude,
      lon: r.longitude,
      country: r.country,
      admin: r.admin1,
      label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    }));
  } catch {
    return [];
  }
}
