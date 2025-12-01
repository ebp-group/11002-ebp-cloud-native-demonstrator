import {createMap} from '../shared/map.ts';
import './style.scss';
import maplibregl from 'maplibre-gl';
import {cogProtocol, locationValues} from '@geomatico/maplibre-cog-protocol';

/**
 * * Download file from https://www.swisstopo.admin.ch/de/hoehenmodell-swissaltiregio
 * * Reproject it to EPSG:3857 with gdalwarp
 * * Make sure it is a COG - otherwise, create a COG like so:
 * gdal_translate swissaltiregio_2056_5728_transformed.tif swissaltiregio_2056_5728_transformed_cog.tif   -of COG   -co COMPRESS=LZW -co BIGTIF
 * F=YES
 * * Normalize the values to 0-255 for simpler color representation
 * gdal_translate -ot Byte -scale swissaltiregio_2056_5728_transformed_cog.tif swissaltiregio_2056_5728_transformed_cog_norm.tif -of COG -co COMPRESS=LZW -co BIGTIFF=YES -a_nodata 0
 */

const COGTIFF_URL = '/data/swissaltiregio_2056_5728_transformed_cog_norm.tif';
const RASTER_MIN_VALUE = 1.114; // obtained from gdalinfo before normalization
const RASTER_MAX_VALUE = 4799.446; // obtained from gdalinfo before normalization

maplibregl.addProtocol('cog', cogProtocol);
const map = createMap('map');

map.on('load', () => {
  map.addSource('cogSource', {
    type: 'raster',
    url: `cog://${COGTIFF_URL}`,
    tileSize: 128,
  });

  map.addLayer({
    id: 'cogLayer',
    source: 'cogSource',
    type: 'raster',
    paint: {
      'raster-opacity': 0.7,
    },
  });
});

map.on('click', ({lngLat}) => {
  locationValues(COGTIFF_URL, {latitude: lngLat.lat, longitude: lngLat.lng}, map.getZoom()).then((a) =>
    console.log(getDenormalizedElevationValue(a[0])),
  );
});

const getDenormalizedElevationValue = (value: number) => {
  return (value / 255) * (RASTER_MAX_VALUE - RASTER_MIN_VALUE) + RASTER_MIN_VALUE;
};
