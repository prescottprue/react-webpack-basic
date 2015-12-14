'use strict';

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

var buildPath = 'dist';
var publicPath = 'assets';
var port = process.env.PORT || 3000;
var webpackPort = process.env.WEBPACK_PORT || 3001;

function createWebpackConfig(options) {
  if (!options) { options = {}; }

  var devtool = options.dev ? 'eval-source-map' : 'sourcemap';

  var entry = options.entry || [
    './src/index.js'
  ];

  if (options.dev) {
    entry = entry.concat(
      'webpack/hot/only-dev-server',
      'webpack-dev-server/client?http://localhost:' + webpackPort
    )
  }

  var output = {
    path: path.resolve(__dirname, '..', buildPath),
    filename: options.outputFilename || 'bundle.js',
    publicPath: options.dev ?
      'http://localhost:' + webpackPort + '/' + publicPath + '/' :
      '/' + publicPath + '/'
  };

  var plugins = [
    new webpack.NoErrorsPlugin(),
    new webpack.IgnorePlugin(/vertx/),
    new ExtractTextPlugin('style.css', {allChunks: true})
  ];

  if (options.dev) {
    plugins = plugins.concat(new webpack.HotModuleReplacementPlugin());
  }



  if (options.target === 'node') {
    plugins = plugins.concat(
      [
        new webpack.BannerPlugin('require("source-map-support").install();',
        {raw: true, entryOnly: false})
      ]
    );
    if (options.dev) {
      plugins = plugins.concat(new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }));
    }
  } else {
    plugins = plugins.concat([
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.DedupePlugin(),
      function() {
        this.plugin('done', function(stats) {
          fs.writeFileSync(
            path.resolve(__dirname, '..', 'stats.json'),
            JSON.stringify(stats.toJson())
          );
        });
      }
    ]);
  }

  if (options.target) {
    plugins = plugins.concat([
      new webpack.DefinePlugin({
        'process.env': {
          WEBPACK_TARGET: JSON.stringify(options.target)
        }
      }),
    ]);
  }

  var resolve = {
    alias: {
      assets: path.resolve(__dirname, '..', 'assets')
    },
    extensions: ['', '.js']
  };

  var cssLoaders = [
    'css?root=..',
    'sass?outputStyle=expanded&' +
    'includePaths[]=' + path.resolve(__dirname, 'bower_components')
  ].join('!');

  var loaders = [
    {
      exclude: [/node_modules/],
      test: /\.js$/,
      loaders: options.dev ?
        ['react-hot', 'babel'] :
        ['babel']
    },
    {
      test: /\.(scss|css)$/,
      loader: options.dev ?
        'style!' + cssLoaders
        :
        ExtractTextPlugin.extract(cssLoaders)
    },
    {
      test: /\.(jpg|png|svg)$/,
      loader: 'url?limit=8192'
    },
    {
      exclude: [/node_modules/],
      test: /\.json$/,
      loader: 'json'
    }
  ];

  return {
    bail: !options.dev,
    devtool: devtool,
    entry: entry,
    output: output,
    plugins: plugins,
    resolve: resolve,
    module: {loaders: loaders},
    target: options.target,

    port: port,
    webpackPort: webpackPort,
    buildPath: buildPath,
    publicPath: publicPath
  };
}

module.exports = createWebpackConfig;
