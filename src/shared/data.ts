type DataType = 'pmtiles' | 'cogtiff' | 'flatgeobuf' | 'geoparquet';
type DataSourceConfig = {
  [key in DataType]: {
    development: string;
    production: string;
  };
};

const DATA_SOURCES: DataSourceConfig = {
  pmtiles: {
    development: __GITHUB_PAGES_BASE__ + 'data/divisions.pmtiles',
    production: 'https://digital.ebp.ch/cloud-native-demonstrator/divisions.pmtiles',
  },
  cogtiff: {
    development: __GITHUB_PAGES_BASE__ + 'data/output_rgb_cog.tif',
    production: 'https://digital.ebp.ch/cloud-native-demonstrator/output_rgb_cog.tif',
  },
  flatgeobuf: {
    development: __GITHUB_PAGES_BASE__ + 'data/solkat.fgb',
    production: 'https://digital.ebp.ch/cloud-native-demonstrator/solkat.fgb',
  },
  geoparquet: {
    development: 'http://127.0.0.1:8080/divisions_2025-11-19.parquet', // see README for setup
    production: 'https://digital.ebp.ch/cloud-native-demonstrator/divisions_2025-11-19.parquet',
  },
};

export const getDataSource = (type: DataType): string => {
  return import.meta.env.MODE === 'development' ? DATA_SOURCES[type].development : DATA_SOURCES[type].production;
};
