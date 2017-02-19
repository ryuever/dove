var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var env = process.env.NODE_ENV;

var isDev = env === 'development';
var isProd = env === 'production';

var filename = 'assets/[name].[hash:8].[ext]';

var viewPath = path.join(__dirname, '..', 'view');

var entries = {
  app: [
    'webpack-dev-server/client?http://localhost:3000/',
    'webpack/hot/dev-server',
    path.resolve(__dirname, '..', 'app', 'index.js'),
  ],
};

var rootPath = path.join(__dirname, '..', 'app');
var outputRootPath = path.join('..', 'build');
var entryFilePath = '';
var appEntries = fs.readdirSync(rootPath).reduce(function(entries, dirname) {
  entryFilePath = path.join(rootPath, dirname);
  
  if (fs.statSync(entryFilePath).isDirectory()) {
    entries[path.join(outputRootPath, dirname)] = path.join(entryFilePath, 'index.js');
  }
  return entries;  
}, {});

var staticFilePath = '';
var staticEntries = fs.readdirSync(viewPath).reduce(function(entries, dir) {
  staticFilePath = path.join(viewPath, dir);
  if (fs.statSync(staticFilePath).isDirectory()) {
    entries.push(new HtmlWebpackPlugin({
      xhtml: true,
      template: staticFilePath + '/app.pug',
      filename: dir + '.html',
      chunks: [path.join(outputRootPath, dir)],
    }))
  }

  return entries;
}, []);

module.exports = {
  devtool: 'source-map',
  // entry: entries,
  entry: appEntries,
  context: path.join(__dirname, '..'),  
  output: {
    path: 'build',
    publicPath: '/',
    filename: isProd ? '[name].[hash].js' : '[name].js',
    chunkFilename: isProd ? '[name].[hash].js' : '[name].js'    
  },

  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel', query: { cacheDirectory: true }, exclude: /node_modules/ },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style', `css${isProd ? '?minimize&discardComments' : ''}!postcss`) },
      { test: /\.(jpe?g|png|gif|)$/i, loader: 'url', query: { limit: 2048, name: filename } },
      { test: /\.woff((\?|\#)[\?\#\w\d_-]+)?$/, loader: 'url', query: { limit: 100, minetype: 'application/font-woff', name: filename } },
      { test: /\.woff2((\?|\#)[\?\#\w\d_-]+)?$/, loader: 'url', query: { limit: 100, minetype: 'application/font-woff2', name: filename } },
      { test: /\.ttf((\?|\#)[\?\#\w\d_-]+)?$/, loader: 'url', query: { limit: 100, minetype: 'application/octet-stream', name: filename } },
      { test: /\.eot((\?|\#)[\?\#\w\d_-]+)?$/, loader: 'url', query: { limit: 100, name: filename } },
      { test: /\.svg((\?|\#)[\?\#\w\d_-]+)?$/, loader: 'url', query: { limit: 10000, minetype: 'image/svg+xml', name: filename } },
      { test: /\.pug$/, loader: 'pug', query: { pretty: true } },      
    ]
  },  

  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(isProd ? 'production' : 'development')
      }
    }),
    new ExtractTextPlugin('[name].css', { allChunks: true }),
    // new HtmlWebpackPlugin({
    //   xhtml: true,
    //   template: './view/index.pug'
    // }),
  ].concat(isDev ? [
      new webpack.HotModuleReplacementPlugin(),
    ] : [
      new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false }, sourceMap: false }),
    ]
  ).concat(staticEntries),
}
