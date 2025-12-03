import {createMap, setHighlightedResult, setupUI} from '../shared';
import maplibregl, {type AddLayerObject} from 'maplibre-gl';
import {cogProtocol, locationValues} from '@geomatico/maplibre-cog-protocol';

setupUI();

const COGTIFF_URL = '/data/swissaltiregio_2056_5728_transformed_cog_norm.tif';
const RASTER_MIN_VALUE = 1.114; // obtained from gdalinfo before normalization
const RASTER_MAX_VALUE = 4799.446; // obtained from gdalinfo before normalization
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
  return (value / 255) * (RASTER_MAX_VALUE - RASTER_MIN_VALUE) + RASTER_MIN_VALUE;
};
