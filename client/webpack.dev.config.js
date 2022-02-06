const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    app: {
      import: './app/App.js',
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist-dev', 'static'),
    publicPath: '',
    filename: '[name].js',
  },
  watchOptions: {
    aggregateTimeout: 100,
    ignored: [
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({}),
    }),
  ],
};
