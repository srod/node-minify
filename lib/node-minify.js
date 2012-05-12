var minify = (function(undefined) {

	var exec = require('child_process').exec,
			_fs = require('fs');

	var minify = function(options) {
		this.type = options.type;
		this.tempFile = new Date().getTime().toString();
		
		if(typeof options.fileIn === 'string') {
			this.fileIn = options.fileIn;
		}
	
		if(typeof options.fileIn === 'object' && options.fileIn instanceof Array) {
			var out = options.fileIn.map(function(path) {
				return _fs.readFileSync(path, 'utf8');
			});
		
			_fs.writeFileSync(this.tempFile, out.join('\n'), 'utf8');
		
			this.fileIn = this.tempFile;
		}
	
		this.fileOut = options.fileOut;
		this.options = options.options || [];
		this.buffer = options.buffer || 1000 * 1024;
		if (typeof options.callback !== 'undefined') {
			this.callback = options.callback;
		}

		this.compress();
	};

	minify.prototype = minify.fn = {
		type: null,
		fileIn: null,
		fileOut: null,
		callback: null,
		buffer: null, // with larger files you will need a bigger buffer for closure compiler
		compress: function() {
			var self = this, command;

	
			switch (this.type) {
				case 'yui':		
					command = 'java -jar -Xss2048k "' + __dirname + '/yuicompressor-2.4.7.jar" "' + this.fileIn + '" -o "' + this.fileOut + '" --type css ' + this.options.join(' ');
					break;
				case 'gcc':
					command = 'java -jar "' + __dirname + '/google_closure_compiler-r1810.jar" --js="' + this.fileIn + '" --js_output_file="' + this.fileOut + '" ' + this.options.join(' ');
					break;
				case 'uglifyjs':
					command = '"' + __dirname  + '/../node_modules/uglify-js/bin/uglifyjs" --output "' + this.fileOut + '" --no-copyright "' + this.fileIn + '" ' + this.options.join(' ');
					break;
			}
	
			exec(command, { maxBuffer: this.buffer }, function (err, stdout, stderr) {
				//console.log(err);
				//console.log(stdout);
				//console.log(stderr);
		
				if(self.fileIn === self.tempFile) {
					// remove the temp concat file here
					_fs.unlinkSync(self.tempFile);
				}
		
				if(self.callback){
					if (err) {
						self.callback(err);
					} else {
						self.callback(null);
					}
				}
			});
		}
	};
	
	return minify;
	
})();

exports.version = '0.3.7';
exports.minify = minify;