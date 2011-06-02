var http = require('http'),
	compressor = require('../lib/node-minify').minify;

http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(1337, "127.0.0.1");

new compressor({
	fileIn: 'public/js/base.js',
	fileOut: 'public/js/base-min.js'
});

new compressor({
	fileIn: 'public/css/base.css',
	fileOut: 'public/css/base-min.css'
});

console.log('Server running at http://127.0.0.1:1337/');