
# Node-minify
      
  A very light minifier NodeJS module.

  Support:

  - YUI Compressor --version 2.4.7
  
  - Google Closure Compiler --version 1810

  - UglifyJS
  
  It allow you to compress javascript and css files.
  
  I recommend to execute it at boot time for production use.

  See server.js in examples/

## Installation

    npm install node-minify

## Quick Start

    var compressor = require('node-minify');
    
	// Using Google Closure
	new compressor.minify({
		type: 'gcc',
		fileIn: './public/js/base.js',
		fileOut: './public/js/base-min-gcc.js',
		callback: function(err){
			console.log(err);
		}
	});

	// Using YUI Compressor
	new compressor.minify({
		type: 'yui',
		fileIn: './public/css/base.css',
		fileOut: './public/css/base-min-yui.css',
		callback: function(err){
			console.log(err);
		}
	});

	// Using UglifyJS
	new compressor.minify({
		type: 'uglifyjs',
		fileIn: './public/css/base.css',
		fileOut: './public/css/base-min-uglifyjs.css',
		callback: function(err){
			console.log(err);
		}
	});
	
## Cocatenate Files

In order to concatenate files, simply pass in an array with the file paths to fileIn.
	
	fileIn: ['public/js/base.js', 'public/js/base2.js', ...]

## YUI Compressor

  Yahoo Compressor can compress both javascript and css files.

  http://developer.yahoo.com/yui/compressor/

## Google Closure Compiler

  Google Closure Compiler can compress only javascript files.

  It will throw an error if you try with css files.

  http://code.google.com/closure/compiler

## UglifyJS

  UglifyJS can compress only javascript files.

  It will throw an error if you try with css files.

  https://github.com/mishoo/UglifyJS

## Warning

  It assumes you have java installed on your environment for both GCC and Yui.

  java -version