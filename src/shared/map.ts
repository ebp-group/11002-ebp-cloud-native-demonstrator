import maplibregl from 'maplibre-gl';

export const createMap = (containerId: string): maplibregl.Map => {
  return new maplibregl.Map({
    container: containerId,
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [7.99942, 46.92776],
    zoom: 9,
  });
};
