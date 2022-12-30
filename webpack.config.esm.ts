import * as path from 'path';
import type * as webpack from 'webpack';

export const config: webpack.Configuration = {
  output: {
    path: path.resolve(__dirname, './lib/module'),
    filename: '[name].js',
    publicPath: './lib/module',
    library: { type: 'module' },
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
