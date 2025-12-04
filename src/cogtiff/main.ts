import {createMap, getDataSource, setHighlightedResult, setupUI} from '../shared';
import maplibregl, {type AddLayerObject} from 'maplibre-gl';
import {cogProtocol, locationValues} from '@geomatico/maplibre-cog-protocol';

setupUI();

const COGTIFF_URL = getDataSource('cogtiff');
const RASTER_MIN_VALUE = 2.3872721195221; // obtained from gdalinfo before normalization
const RASTER_MAX_VALUE = 4420.6870117188; // obtained from gdalinfo before normalization
const EXAGGERATION_FACTOR = 255 / RASTER_MAX_VALUE / 20; // hacky workaround to get proper elevation exaggeration

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
  paint: {'hillshade-shadow-color': '#797975', 'hillshade-exaggeration': 0.05},
};
const TERRAIN_SOURCE_ID = 'cogSourceTerrain';

maplibregl.addProtocol('cog', cogProtocol);
const map = createMap();

map.on('load', () => {
  map.addSource(COG_SOURCE_ID, {
    type: 'raster',
    url: `cog://${COGTIFF_URL}`,
    tileSize: 128,
    attribution:
      '©Bundesamt für Landestopografie swisstopo; Tarquini S., I. Isola, M. Favalli, A. Battistini, G. Dotta (2023). TINITALY, a digital elevation model of Italy with a 10 meters cell size (Version 1.1). Istituto Nazionale di Geofisica e Vulcanologia (INGV). https://doi.org/10.13127/tinitaly/1.1; DGM Österreich, geoland.at; DGM1, Bayerische Vermessungsverwaltung – www.geodaten.bayern.de; DGM 1 Baden-Württemberg: LGL, www.lgl-bw.de, dl-de/by-2-0”; RGEAlti, Institut National de l’information géographique et forestière, données originales tétéchargées sur https://geoservices.ign.fr/rgealti#telechargement5m, mise à jour du juillet 2023',
  });
  map.addSource(TERRAIN_SOURCE_ID, {
    type: 'raster-dem',
    url: `cog://${COGTIFF_URL}`,
    tileSize: 128,
  });
  map.addSource(HILLSHADE_SOURCE_ID, {
    type: 'raster-dem',
    url: `cog://${COGTIFF_URL}`,
    tileSize: 128,
  });

  map.addLayer(COG_LAYER);

  map.addControl(
    new maplibregl.TerrainControl({
      source: TERRAIN_SOURCE_ID,
      exaggeration: EXAGGERATION_FACTOR,
    }),
  );

  map.on('terrain', () => {
    if (map.getTerrain()) {
      map.removeLayer(COG_LAYER.id);
      map.addLayer(HILLSHADE_LAYER);
    } else {
      map.removeLayer(HILLSHADE_LAYER.id);
      map.addLayer(COG_LAYER);
    }
  });
});

map.on('click', ({lngLat}) => {
  locationValues(COGTIFF_URL, {latitude: lngLat.lat, longitude: lngLat.lng}, map.getZoom()).then((a) => {
    setHighlightedResult(`${getDenormalizedElevationValue(a[0]).toFixed(2)} masl`);
  });
});

const getDenormalizedElevationValue = (value: number) => {
  return value * ((RASTER_MAX_VALUE - RASTER_MIN_VALUE) / 255) + RASTER_MIN_VALUE;
};
