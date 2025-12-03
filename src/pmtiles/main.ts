import {createMap, setHighlightedResult, setupUI} from '../shared';
import * as pmtiles from 'pmtiles';
import maplibregl, {type MapGeoJSONFeature} from 'maplibre-gl';

setupUI();

const PMTILES_URL = '/data/divisions.pmtiles';
const PMTILES_SOURCE_ID = 'pmtilesSource';
const COUNTRY_LAYER_ID = 'countryLayer';
const REGION_LAYER_ID = 'regionLayer';
const AVAILABLE_LAYERS = [COUNTRY_LAYER_ID, REGION_LAYER_ID];

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);

const map = createMap({initialZoom: 0, minZoom: 0, initialPosition: {lat: 47.36523, lon: 8.55015}});

map.on('load', () => {
  map.addSource(PMTILES_SOURCE_ID, {
    type: 'vector',
    url: `pmtiles://${PMTILES_URL}`,
    attribution: '©OpenStreetMap contributors, Overture Maps Foundation.',
  });

  // render layers with outline + fill, since maplibre cannot properly style outlines
  map.addLayer({
    id: COUNTRY_LAYER_ID,
    source: PMTILES_SOURCE_ID,
    type: 'fill',
    'source-layer': 'division_area',
    filter: ['==', 'subtype', 'country'],
    paint: {
      'fill-color': 'lightgrey',
      'fill-opacity': 0.7,
    },
  });
  map.addLayer({
    id: `${COUNTRY_LAYER_ID}_outline`,
    source: PMTILES_SOURCE_ID,
    type: 'line',
    'source-layer': 'division_area',
    filter: ['==', 'subtype', 'country'],
    paint: {
      'line-color': 'black',
    },
  });
  map.addLayer({
    id: REGION_LAYER_ID,
    source: PMTILES_SOURCE_ID,
    type: 'fill',
    'source-layer': 'division_area',
    filter: ['==', 'subtype', 'region'],
    paint: {
      'fill-color': 'transparent',
    },
  });
  map.addLayer({
    id: `${REGION_LAYER_ID}_outline`,
    source: PMTILES_SOURCE_ID,
    type: 'line',
    'source-layer': 'division_area',
    filter: ['==', 'subtype', 'region'],
    paint: {
      'line-color': 'black',
      'line-dasharray': [2, 4],
      'line-width': 0.5,
    },
  });

  // click handlers
  map.on('click', AVAILABLE_LAYERS, (e) => {
    const result: {[key: string]: object[]} = {};
    e.features?.forEach((feature) => {
      const data = parseNestedJSON(feature.properties);
      if (result[feature.layer.id]) {
        result[feature.layer.id]!.push(data);
      } else {
        result[feature.layer.id] = [data];
      }
    });

    setHighlightedResult(result);
  });

  // First, we subscribe to 'sourcedata' events to get notified when new data is loaded for counting features...
  const sourceDataSub = map.on('sourcedata', () => {
    const features = map.queryRenderedFeatures({layers: AVAILABLE_LAYERS});
    updateLayerStats(features);
  });

  // ... and unsubscribe as soon as we move, because then the user is in control
  map.on('move', () => {
    sourceDataSub.unsubscribe();
    const features = map.queryRenderedFeatures({layers: AVAILABLE_LAYERS});
    updateLayerStats(features);
  });
});

const updateLayerStats = (features: MapGeoJSONFeature[]) => {
  const result = features.reduce(
    (acc, feature) => {
      if (acc[feature.layer.id] !== undefined) {
        acc[feature.layer.id]++;
      }
      return acc;
    },
    Object.fromEntries(AVAILABLE_LAYERS.map((id) => [id, 0])),
  );
  document.getElementById('layerCount')!.innerText = Object.entries(result)
    .map((r) => `${r[0]}: ${r[1]}`)
    .join(', ');
};

/**
 * Parses nested JSON strings in an object's values; unfortunately, PMTiles properties are sometimes stringified
 * @param obj
 */
const parseNestedJSON = (obj: {[key: string]: unknown}) => {
  const parsedObj: {[key: string]: unknown} = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      try {
        parsedObj[key] = JSON.parse(value);
      } catch {
        parsedObj[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      parsedObj[key] = value;
    }
  }
  return parsedObj;
};
