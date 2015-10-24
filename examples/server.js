var http = require('http');
var compressor = require('../lib/node-minify');

http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');

new compressor.minify({
  type: 'gcc',
  fileIn: 'public/js/**/*.js',
  fileOut: 'public/js-dist/wildcards-match-gcc.js',
  sync: true,
  callback: function(err, min) {
    console.log('wildcards match GCC');
    console.log(err);
    //console.log(min);
  }
});

compressor.minify({
  type: 'gcc',
  publicFolder: './public/',
  //fileIn: '/js/**/*.js',
  fileIn: ['js/base.js', 'js/base2.js'],
  fileOut: 'public/js-dist/wildcards-match-gcc.js',
  sync: true,
  callback: function(err, min) {
    console.log('wildcards match GCC');
    console.log(err);
    //console.log(min);
  }
});

compressor.minify({
  type: 'gcc',
  publicFolder: './public/',
  //fileIn: '/js/**/*.js',
  fileIn: 'js/base.js',
  fileOut: 'public/js-dist/wildcards-match-gcc.js',
  sync: true
});

console.log('Server running at http://127.0.0.1:1337/');