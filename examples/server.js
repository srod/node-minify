var http = require('http'),
	compressor = require('../lib/node-minify');

http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(1337, "127.0.0.1");

new compressor.minify({
	type: 'gcc',
	fileIn: 'public/js/base.js',
	fileOut: 'public/js/base-min-gcc.js',
	callback: function(err){
		console.log(err);
	}
});

new compressor.minify({
	type: 'yui',
	fileIn: './public/js/base.js',
	fileOut: './public/js/base-min-yui.js',
	callback: function(err){
		console.log(err);
	}
});

new compressor.minify({
	type: 'uglifyjs',
	fileIn: './public/js/base.js',
	fileOut: './public/js/base-min-uglifyjs.js',
	callback: function(err){
		console.log(err);
	}
});

new compressor.minify({
	type: 'yui',
	fileIn: './public/css/base.css',
	fileOut: './public/css/base-min.css',
	callback: function(err){
		console.log(err);
	}
});

console.log('Server running at http://127.0.0.1:1337/');