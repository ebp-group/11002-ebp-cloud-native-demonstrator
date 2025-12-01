import maplibregl, {type ILngLatLike} from 'maplibre-gl';

type MapOptions = {
  containerId?: string;
  maxZoom?: number;
  minZoom?: number;
  initialZoom?: number;
  initialPosition?: {
    lat: number;
    lon: number;
  };
};

const SWISS_CENTER: ILngLatLike = [7.99942, 46.92776];

export const createMap = (options: MapOptions = {}): maplibregl.Map => {
  const initialCenter: ILngLatLike = options.initialPosition ? [options.initialPosition.lon, options.initialPosition.lat] : SWISS_CENTER;
  return new maplibregl.Map({
    container: options.containerId ?? 'map',
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: initialCenter,
    zoom: options.initialZoom ?? 9,
    maxZoom: options.maxZoom,
    minZoom: options.minZoom,
  });
};
