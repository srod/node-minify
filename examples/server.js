var http = require('http'),
	compressor = require('../lib/node-minify');

http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(1337, "127.0.0.1");

new compressor.minify({
	type: 'gcc',
	fileIn: 'public/js/base.js',
	fileOut: 'public/js/base-onefile-gcc.js',
	callback: function(err){
		console.log(err);
	}
});

new compressor.minify({
	type: 'gcc',
	fileIn: ['public/js/base.js', 'public/js/base2.js'],
	fileOut: 'public/js/base-concat-gcc.js',
	callback: function(err){
		console.log(err);
	}
});

console.log('Server running at http://127.0.0.1:1337/');