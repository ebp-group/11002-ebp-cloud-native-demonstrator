import {createMap, getDataSource, setHighlightedResult, setupUI} from '../shared';
import maplibregl, {type AddLayerObject} from 'maplibre-gl';
import {cogProtocol, locationValues} from '@geomatico/maplibre-cog-protocol';

setupUI();

const COGTIFF_URL = getDataSource('cogtiff');

const COG_SOURCE_ID = 'cogSource';
const COG_LAYER: AddLayerObject = {
  id: 'cogLayer',
  source: COG_SOURCE_ID,
  type: 'raster',
  paint: {
    'raster-opacity': 0.7,
  },
};
const HILLSHADE_SOURCE_ID = 'cogSourceHsh';
const HILLSHADE_LAYER: AddLayerObject = {
  id: 'hills',
  type: 'hillshade',
  source: HILLSHADE_SOURCE_ID,
  paint: {'hillshade-shadow-color': '#797975', 'hillshade-exaggeration': 0.3},
};
const TERRAIN_SOURCE_ID = 'cogSourceTerrain';

maplibregl.addProtocol('cog', cogProtocol);
const map = createMap({initialPitch: 60, initialZoom: 10, initialBearing: 145, initialPosition: {lat: 46.61443, lon: 7.94621}});

map.on('load', () => {
  map.addSource(COG_SOURCE_ID, {
    type: 'raster',
    url: `cog://${COGTIFF_URL}`,
    tileSize: 256,
  });
  map.addSource(TERRAIN_SOURCE_ID, {
    type: 'raster-dem',
    url: `cog://${COGTIFF_URL}`,
    tileSize: 256,
    attribution:
      '©Bundesamt für Landestopografie swisstopo; Tarquini S., I. Isola, M. Favalli, A. Battistini, G.' +
      ' Dotta (2023).' +
      ' TINITALY, a digital elevation model of Italy with a 10 meters cell size (Version 1.1). Istituto Nazionale di Geofisica e Vulcanologia (INGV). https://doi.org/10.13127/tinitaly/1.1; DGM Österreich, geoland.at; DGM1, Bayerische Vermessungsverwaltung – www.geodaten.bayern.de; DGM 1 Baden-Württemberg: LGL, www.lgl-bw.de, dl-de/by-2-0”; RGEAlti, Institut National de l’information géographique et forestière, données originales tétéchargées sur https://geoservices.ign.fr/rgealti#telechargement5m, mise à jour du juillet 2023',
  });
  map.addSource(HILLSHADE_SOURCE_ID, {
    type: 'raster-dem',
    url: `cog://${COGTIFF_URL}`,
    tileSize: 256,
  });

  map.addLayer(HILLSHADE_LAYER);
  map.setTerrain({source: TERRAIN_SOURCE_ID});
});

map.on('click', ({lngLat}) => {
  locationValues(COGTIFF_URL, {latitude: lngLat.lat, longitude: lngLat.lng}, map.getZoom()).then((a) => {
    setHighlightedResult(`${getElevationFromMapboxEncodedTerrain(a[0], a[1], a[2]).toFixed(2)} masl`);
  });
});

const getElevationFromMapboxEncodedTerrain = (r: number, g: number, b: number) => {
  return (r * 256 * 256 + g * 256 + b) * 0.1 - 10000;
};

document.getElementById('toggleRaster')!.addEventListener('click', () => {
  if (map.getLayer(COG_LAYER.id)) {
    map.removeLayer(COG_LAYER.id);
  } else {
    map.addLayer(COG_LAYER);
  }
});
