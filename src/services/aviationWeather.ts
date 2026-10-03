export interface MetarData {
  icaoId?: string;
  name?: string;
  obsTime?: number;
  reportTime?: string;
  temp?: number;
  dewp?: number;
  wdir?: number | string;
  wspd?: number;
  wgst?: number;
  visib?: number | string;
  altim?: number;
  slp?: number;
  wxString?: string;
  rawOb?: string;
  fltCat?: string;
  clouds?: Array<{
    cover?: string;
    base?: number;
    type?: string;
  }>;
}

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  'https://weathergptbackend-six.vercel.app'
).replace(/\/+$/, '');

export async function fetchMetar(
  icao: string
): Promise<MetarData> {
  const response = await fetch(
    `${BACKEND_URL}/aviation/metar?icao=${encodeURIComponent(icao)}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.detail ||
      `Unable to fetch METAR data (${response.status}).`
    );
  }

  return response.json();
}