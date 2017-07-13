require('babel-polyfill');
require('babel-register')({
  presets: ['es2015', 'es2017'],
  plugins: ['transform-object-rest-spread']
});
require('./src/app');
