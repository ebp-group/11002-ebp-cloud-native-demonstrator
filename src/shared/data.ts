type DataType = 'pmtiles' | 'cogtiff' | 'flatgeobuf' | 'geoparquet';
type DataSourceConfig = {
  [key in DataType]: {
    development: string;
    production: string;
  };
};

const DATA_SOURCES: DataSourceConfig = {
  pmtiles: {
    development: '/data/divisions.pmtiles',
    production: 'https://digital.ebp.ch/cloud-native-demonstrator/divisions.pmtiles',
  },
  cogtiff: {
    development: '/data/swissaltiregio_2056_5728_transformed_cog_norm.tif',
    production: 'https://digital.ebp.ch/cloud-native-demonstrator/swissaltiregio_2056_5728_transformed_cog_norm.tif',
  },
  flatgeobuf: {
    development: '/data/solkat.fgb',
    production: 'https://digital.ebp.ch/cloud-native-demonstrator/solkat.fgb',
  },
  geoparquet: {
    development: 'http://127.0.0.1:8080/solkat.fgb', // see docs
    production: 'https://digital.ebp.ch/cloud-native-demonstrator/solkat.fgb',
  },
};

export const getDataSource = (type: DataType): string => {
  return import.meta.env.MODE === 'development' ? DATA_SOURCES[type].development : DATA_SOURCES[type].production;
};
