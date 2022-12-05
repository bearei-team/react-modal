import * as path from 'path';
import * as webpack from 'webpack';

export const config: webpack.Configuration = {
  output: {
    path: path.resolve(__dirname, './lib'),
    filename: '[name].js',
    publicPath: './lib/',
    library: {type: 'commonjs'},
  },
  externalsType: 'commonjs',
  externals: {
    react: 'react',
    '@bearei/react-util': '@bearei/react-util',
  },
};
