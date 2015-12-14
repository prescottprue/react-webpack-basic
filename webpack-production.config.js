var devConfig = require('./webpack.config.js');

var babelLoader = {
 test: [/\.js$/],
 exclude: /node_modules/,
 loader: 'babel-loader'
}

devConfig.module.loaders.push(babelLoader);

module.exports = devConfig;
