var exec = require('child_process').exec;

var minify = function(options) {
	this.fileIn = options.fileIn;
	this.fileOut = options.fileOut;

	this.compress();
};

minify.prototype = {
	fileIn: null,
	fileOut: null
};

minify.prototype.compress = function() {
	var command = 'java -jar ' + __dirname + '/yuicompressor-2.4.6.jar ' + this.fileIn + ' -o ' + this.fileOut;

	exec(command, function (err, stdout, stderr) {
		/*
		console.log(err);
		console.log(stdout);
		console.log(stderr);
		*/
	});
};

exports.version = '0.1.1';
exports.minify = minify;