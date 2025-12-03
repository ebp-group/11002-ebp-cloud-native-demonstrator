import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_next from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import {createMap, setupUI} from '../shared';
import {type GeoJSONSource} from 'maplibre-gl';
import type {Feature} from 'geojson';

document.getElementById('rendercountry')!.addEventListener('input', async (e) => {
  const select = e.target as HTMLSelectElement;
  const chosenValue = select.value;

  const res = await queryDuckDb(chosenValue);

  console.log(res.get(0)?.toJSON());
  res.toArray().forEach((r) => {
    console.log(r);

    const bbox = r.bbox!.toJSON();
    console.log(bbox);
    const coordinates: number[][] = [
      [bbox.xmin, bbox.ymin],
      [bbox.xmin, bbox.ymax],
      [bbox.xmax, bbox.ymax],
      [bbox.xmax, bbox.ymin],
      [bbox.xmin, bbox.ymin],
    ];

    const linestringGeoJSON: Feature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates,
      },
      properties: {},
    };
    (map.getSource('duckdbSource') as GeoJSONSource).setData(linestringGeoJSON);
  });
});

setupUI();
const map = createMap({minZoom: 4, maxZoom: 4, initialZoom: 8});

map.on('load', async () => {
  map.addSource('duckdbSource', {
    type: 'geojson',
    data: {type: 'FeatureCollection', features: []},
  });

  map.addLayer({
    id: 'rectangle',
    type: 'line',
    source: 'duckdbSource',
    paint: {
      'line-color': '#0000FF',
      'line-opacity': 0.9,
      'line-width': 3,
    },
  });
});

const queryDuckDb = async (id: string) => {
  const MANUAL_BUNDLES = {
    mvp: {
      mainModule: duckdb_wasm,
      mainWorker: mvp_worker,
    },
    eh: {
      mainModule: duckdb_wasm_next,
      mainWorker: eh_worker,
    },
  };
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

  const worker = new Worker(bundle.mainWorker);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

  const conn = await db.connect();
  const stmt = await conn.prepare(`
  SELECT id, country, names, bbox, region, subtype, class, type
  FROM read_parquet('http://127.0.0.1:8080/divisions_2025-11-19.parquet')
  WHERE id = ?`);
  const result = await stmt.query(id);

  await conn.close();
  await db.terminate();
  worker.terminate();
  return result;
};
