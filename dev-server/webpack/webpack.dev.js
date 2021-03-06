const path = require('path');
const webpack = require('webpack');
const { mergeWithCustomize } = require('webpack-merge');
const common = require('./webpack.common');
const CopyPlugin = require('copy-webpack-plugin');

const config = mergeWithCustomize({
    'entry.familie-ef-ettersending': 'prepend',
    'module.rules': 'append',
})(common, {
    mode: 'development',
    entry: {
        'familie-ef-ettersending': [
            'babel-polyfill',
            'react-hot-loader/patch',
            'webpack-hot-middleware/client?reload=true&overlay=false',
        ],
    },
    output: {
        path: path.join(__dirname, '../../frontend_development'),
        filename: '[name].[hash].js',
        publicPath: '/assets/',
        globalObject: 'this',
    },
    module: {
        rules: [
            {
                test: /\.(less)$/,
                use: [
                    { loader: require.resolve('style-loader') },
                    {
                        loader: require.resolve('css-loader'),
                        options: {
                            modules: {
                                compileType: 'icss',
                            },
                        },
                    },
                    { loader: require.resolve('less-loader') },
                ],
            },
        ],
    },
    devtool: 'inline-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
        new webpack.HotModuleReplacementPlugin(),
        new CopyPlugin({
            patterns: [
                {
                    from: path.join(__dirname, '../../assets'),
                    to: path.join(__dirname, '../../frontend_development'),
                },
            ],
        }),
    ],
});

module.exports = config;
