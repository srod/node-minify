
# Node-minify
      
  A very light minifier NodeJS module.
  
  It allow you to compress javascript and css files.

  I recommend to execute it at boot time for production use.

## Installation

    npm install node-minify

## Quick Start

    var compressor = require('node-minify').minify;
    new compressor({
		fileIn: 'public/js/base.js',
		fileOut: 'public/js/base-min.js'
	});

## Warning

  It assumes you have java installed on your environment