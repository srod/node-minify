var exec = require('child_process').exec;

var minify = function(options) {
	this.type = options.type;
	this.fileIn = options.fileIn;
	this.fileOut = options.fileOut;

	this.compress();
};

minify.prototype = {
	type: null,
	fileIn: null,
	fileOut: null
};

minify.prototype.compress = function() {
	var command;

	switch(this.type){
		case 'yui':
			command = 'java -jar ' + __dirname + '/yuicompressor-2.4.6.jar ' + this.fileIn + ' -o ' + this.fileOut;
			break;
		case 'gcc':
			command = 'java -jar ' + __dirname + '/google_closure_compiler.jar --js=' + this.fileIn + ' --js_output_file=' + this.fileOut;
			break;
	}

	exec(command, function (err, stdout, stderr) {
		/*
		console.log(err);
		console.log(stdout);
		console.log(stderr);
		*/
	});
};

exports.version = '0.2.0';
exports.minify = minify;