var exec = require('child_process').exec;

var minify = function(options) {
	this.type = options.type;
	this.fileIn = options.fileIn;
	this.fileOut = options.fileOut;
	this.options = options.options || [];
	if (typeof options.callback !== 'undefined') {
		this.callback = options.callback;
	}

	this.compress();
};

minify.prototype = {
	type: null,
	fileIn: null,
	fileOut: null,
	callback: null
};

minify.prototype.compress = function() {
	var self = this, command;

	switch (this.type) {
		case 'yui':
			command = 'java -jar -Xss2048k' + __dirname + '/yuicompressor-2.4.7.jar ' + this.fileIn + ' -o ' + this.fileOut + ' ' + this.options.join(' ');
			break;
		case 'gcc':
			command = 'java -jar ' + __dirname + '/google_closure_compiler-r1592.jar --js=' + this.fileIn + ' --js_output_file=' + this.fileOut + ' ' + this.options.join(' ');
			break;
		case 'uglifyjs':
			command = __dirname  + '/../node_modules/uglify-js/bin/uglifyjs --output ' + this.fileOut + ' --no-copyright ' + this.fileIn + ' ' + this.options.join(' ');
			break;
	}

	exec(command, function (err, stdout, stderr) {
		//console.log(err);
		//console.log(stdout);
		//console.log(stderr);

		if(self.callback){
			if (err) {
				self.callback(err);
			} else {
				self.callback(null);
			}
		}
	});
};

exports.version = '0.3.3';
exports.minify = minify;
