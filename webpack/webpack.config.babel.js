import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const env = process.env.NODE_ENV;

const isDev = env === 'development';
const isProd = env === 'production';

const filename = 'assets/[name].[hash:8].[ext]';

const entries = {
  app: [
    'webpack-dev-server/client?http://localhost:3000/',
    'webpack/hot/dev-server',
    path.resolve(__dirname, '..', 'app', 'index.js'),
  ],
};

module.exports = {
  devtool: 'source-map',
  entry: entries,
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
    new ExtractTextPlugin("style.css", { allChunks: true }),
  ].concat(isDev ? [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        xhtml: true,
        template: './index.pug'
      }),
    ] : [
      new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false }, sourceMap: false }),
      new HtmlWebpackPlugin({
        xhtml: true,
        template: './index.pug'
      }),
    ]
  ),
}
