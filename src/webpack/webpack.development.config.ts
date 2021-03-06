import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import webpack from 'webpack';
import { CustomizeRule, mergeWithRules } from 'webpack-merge';

import baseConfig, { createHtmlWebpackPlugin } from './webpack.common.config';

const devConfig: webpack.Configuration = mergeWithRules({
  module: {
    rules: {
      test: CustomizeRule.Match,
      options: CustomizeRule.Replace,
    },
  },
})(baseConfig, {
  mode: 'development',
  entry: ['webpack-hot-middleware/client'],
  devtool: 'inline-source-map',
  plugins: [
    createHtmlWebpackPlugin(false),
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(jsx|tsx|ts|js)?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['react-app'],
          plugins: ['react-refresh/babel'],
        },
      },
      {
        test: /\.(less|css)$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: {
                compileType: 'icss',
              },
            },
          },
          { loader: 'less-loader' },
        ],
      },
    ],
  },
});

export default devConfig;
