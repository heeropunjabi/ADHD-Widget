var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'src/client/app');
var APP_DIR = path.resolve(__dirname, 'src/client/app/react-components');

var config = {
    entry: {
        'app': APP_DIR + '/index.jsx',
    },

    module: {
        loaders: [
            {
                test: /\.jsx?/,
                include: APP_DIR,
                loader: 'babel-loader'
            }
        ]
    },

    output: {
        path: BUILD_DIR,
        filename: '[name].js'
    }

};

module.exports = config;