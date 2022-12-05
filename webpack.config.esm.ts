import * as path from 'path';
import * as webpack from 'webpack';

export const config: webpack.Configuration = {
  output: {
    path: path.resolve(__dirname, './lib-esm'),
    filename: '[name].js',
    publicPath: './lib-esm',
    library: {type: 'module'},
    environment: {
      module: true,
    },
  },
  experiments: {
    outputModule: true,
  },
  externalsType: 'module',
  externals: {
    react: 'react',
    '@bearei/react-util': '@bearei/react-util',
  },
};
