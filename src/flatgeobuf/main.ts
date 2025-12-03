import {createMap, setHighlightedResult, setupUI} from '../shared';
import {geojson} from 'flatgeobuf';
import type {ExpressionSpecification, GeoJSONSource} from 'maplibre-gl';
import type {FeatureCollection} from 'geojson';

setupUI();

const FGB_URL = '/data/solkat.fgb';
const ROOF_SOURCE_ID = 'roofsSource';
const RECTANGLE_SOURCE_ID = 'rectangleSource';
const ROOFS_FILL_LAYER_ID = 'roofs-fill';
// Color expression for roof classification, based on the official wms
const ROOF_CLASSIFICATION_COLOR_MAP: ExpressionSpecification = [
  'case',
  ['==', ['to-number', ['get', 'KLASSE']], 0],
  '#cccccc',
  ['==', ['to-number', ['get', 'KLASSE']], 1],
  '#00c5ff',
  ['==', ['to-number', ['get', 'KLASSE']], 2],
  '#ffff00',
  ['==', ['to-number', ['get', 'KLASSE']], 3],
  '#ffaa00',
  ['==', ['to-number', ['get', 'KLASSE']], 4],
  '#ff5500',
  ['==', ['to-number', ['get', 'KLASSE']], 5],
  '#a80000',
  '#000000',
];

const map = createMap({initialZoom: 15, minZoom: 15, initialPosition: {lat: 47.36523, lon: 8.55015}});

const fgBoundingBox = () => {
  const {lng, lat} = map.getCenter();
  const {_ne} = map.getBounds();
  const size = Math.min(_ne.lng - lng, _ne.lat - lat) * 0.8;
  return {minX: lng - size, minY: lat - size, maxX: lng + size, maxY: lat + size};
};

const getRect: () => FeatureCollection = () => {
  const bbox = fgBoundingBox();
  const coords = [
    [
      [bbox.minX, bbox.minY],
      [bbox.maxX, bbox.minY],
      [bbox.maxX, bbox.maxY],
      [bbox.minX, bbox.maxY],
      [bbox.minX, bbox.minY],
    ],
  ];
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {type: 'Polygon', coordinates: coords},
        properties: [],
      },
    ],
  };
};

const updateResults = async () => {
  let id = 0;
  const features: FeatureCollection = {type: 'FeatureCollection', features: []};
  const iter = geojson.deserialize(FGB_URL, fgBoundingBox());
  for await (const feature of iter) {
    features.features.push({...feature, id});
    id += 1;
  }
  (map.getSource(ROOF_SOURCE_ID) as GeoJSONSource)!.setData(features);
};

map.on('load', async () => {
  // setup roof layer with fill and outline
  map.addSource(ROOF_SOURCE_ID, {
    type: 'geojson',
    data: {type: 'FeatureCollection', features: []},
  });
  map.addLayer({
    id: ROOFS_FILL_LAYER_ID,
    type: 'fill',
    source: ROOF_SOURCE_ID,
    paint: {
      'fill-color': ROOF_CLASSIFICATION_COLOR_MAP,
    },
  });
  map.addLayer({
    id: 'roofs-outline',
    type: 'line',
    source: ROOF_SOURCE_ID,
    paint: {
      'line-color': '#000000',
      'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1.0, 0],
      'line-width': 1,
    },
  });

  // setup rectangle layer
  map.addSource(RECTANGLE_SOURCE_ID, {
    type: 'geojson',
    data: {type: 'FeatureCollection', features: []},
  });
  map.addLayer({
    id: 'rectangle',
    type: 'line',
    source: RECTANGLE_SOURCE_ID,
    paint: {
      'line-color': '#0000FF',
      'line-opacity': 0.9,
      'line-width': 3,
    },
  });
  (map.getSource(RECTANGLE_SOURCE_ID) as GeoJSONSource).setData(getRect());

  // handle interactions
  map.on('click', ROOFS_FILL_LAYER_ID, (e) => {
    setHighlightedResult(e.features?.[0]?.properties);
  });

  let hoveredStateId: string | number | undefined;
  map.on('mousemove', ROOFS_FILL_LAYER_ID, (e) => {
    if (e.features && e.features.length > 0) {
      if (hoveredStateId !== undefined) {
        map.setFeatureState({source: ROOF_SOURCE_ID, id: hoveredStateId}, {hover: false});
      }
      hoveredStateId = e.features[0].id;
      map.setFeatureState({source: ROOF_SOURCE_ID, id: hoveredStateId}, {hover: true});
    }
  });
  map.on('mouseenter', ROOFS_FILL_LAYER_ID, () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', ROOFS_FILL_LAYER_ID, () => {
    map.getCanvas().style.cursor = '';
    if (hoveredStateId !== undefined) {
      map.setFeatureState({source: ROOF_SOURCE_ID, id: hoveredStateId}, {hover: false});
    }
    hoveredStateId = undefined;
  });

  map.on('moveend', async () => {
    (map.getSource(RECTANGLE_SOURCE_ID) as GeoJSONSource).setData(getRect());
    await updateResults();
  });

  await updateResults();
});
