
# Node-minify
      
  A very light minifier NodeJS module.

  Support:
  - YUI Compressor --version 2.4.6
  - Google Closure Compiler --version 1043
  
  It allow you to compress javascript and css files.
  
  I recommend to execute it at boot time for production use.

## Installation

    npm install node-minify

## Quick Start

    var compressor = require('node-minify');
    
	// Using Google Closure
	new compressor.minify({
		type: 'gcc',
		fileIn: 'public/js/base.js',
		fileOut: 'public/js/base-min.js'
	});

	// Using YUI Compressor
	new compressor.minify({
		type: 'yui',
		fileIn: 'public/css/base.css',
		fileOut: 'public/css/base-min.css'
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