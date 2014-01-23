'use strict';

var http = require( 'http' );
var express = require( 'express' );
var Q = require( 'q' );
var crypto = require( 'crypto' );
var app = express();
var repos = require( './repos' );
var HTTP_PORT = process.env.PORT || 8011;
var UPDATE_CACHE_INTERVAL_IN_HOURS = 1;

//Express
app.configure( function () {
    app.use( express.logger( 'dev' ) );     /* 'default', 'short', 'tiny', 'dev' */
	app.use( express.json() );
	app.use( express.compress() );
	app.use( express.urlencoded() );

    // Enable CORS
    app.use(function( req, res, next ) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "x-requested-with, content-type");
        res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Max-Age", "1000000000");
        // intercept OPTIONS method
        if ('OPTIONS' == req.method) {
            res.send(200);
        }
        else {
            next();
        }
    });
});

//API
app.get( '/', repos.list );
app.get( '/refresh', repos.refresh );

app.listen( HTTP_PORT );
console.log( 'Server running on port ' + HTTP_PORT );

//interval for refreshing results cache
setInterval(repos.list, UPDATE_CACHE_INTERVAL_IN_HOURS * 60 * 60 * 1000);
