
# Node-minify
      
  A very light minifier NodeJS module.

  Support:

  - YUI Compressor --version 2.4.6
  
  - Google Closure Compiler --version 1043
  
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
		fileIn: 'public/js/base.js',
		fileOut: 'public/js/base-min.js',
		callback: function(err){
			console.log(err);
		}
	});

	// Using YUI Compressor
	new compressor.minify({
		type: 'yui',
		fileIn: 'public/css/base.css',
		fileOut: 'public/css/base-min.css',
		callback: function(err){
			console.log(err);
		}
	});

## YUI Compressor

  Yahoo Compressor can compress both javascript and css files.

  http://developer.yahoo.com/yui/compressor/

## Google Closure Compiler

  Google Closure Compiler can compress only javascript files.

  It will throw an error if you try with css files.

  http://code.google.com/closure/compiler

## Warning

  It assumes you have java installed on your environment.

  java -version