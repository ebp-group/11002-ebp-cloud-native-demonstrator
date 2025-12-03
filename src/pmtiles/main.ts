import {createMap, setupUI} from '../shared';
import * as pmtiles from 'pmtiles';
import maplibregl from 'maplibre-gl';
import hljs from 'highlight.js';

setupUI();

const PMTILES_URL = '/data/divisions.pmtiles';
const PMTILES_SOURCE_ID = 'pmtilesSource';
const COUNTRY_LAYER_ID = 'countryLayer';
const REGION_LAYER_ID = 'regionLayer';

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
  map.on('click', COUNTRY_LAYER_ID, (e) => {
    const {value} = hljs.highlight(JSON.stringify(e.features?.[0]?.properties, null, 2), {language: 'json'});
    document.getElementById('clickresult')!.innerHTML = value;
  });
});
