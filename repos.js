'use strict';

/*
	Cleverstack Module Repo Finder.

	1. Search for official & community modules
	2. npm, github & bower
	3. Keywords:

	cleverstack-module
	cleverstack-seed
	/+ frontend
	/+ backend

*/

var Q = require( 'q' );
var request = require( 'request' );
var _ = require( 'lodash' );
var keepProperties = [ 'name','description','html_url','git_url','created_at','updated_at','forks','stargazers_count' ];
var keepKeywords = [ 'cleverstack-module','cleverstack-seed' ];
var repos = [];


// API / GET
exports.list = function( req, res ) {

    //caching
    if (!_.isEmpty(repos)) {
        res.json( repos );
        return true;
    }
    exports.newList( req, res );

};

exports.newList = function( req, res ) {

	GIT.getOfficialRepos( function( results ) {
		res.json( results );
	});

};

// Search GitHub
var GIT = {

    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || 'ba861503f44aa44be939',
	GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || 'fb7d5a721bea1e5c9292765835b342c3e68b3ef6',
	orgs: [ 'cleverstack', 'clevertech' ],

	getOfficialRepos: function( done ) {

		this.orgs.forEach( function( org ) {
			repos.push( _fetchGitOrgRepos( org ) );
		});

		Q.all( repos ).then( function( ful ) {
			ful = _.flatten( ful );
			done( ful );
		});

	}
};

// get the repo list for the organisation
function _fetchGitOrgRepos( org ) {
	var deferred = Q.defer();

	var options = {
	    url: 'https://api.github.com/orgs/'+org+'/repos',
	    headers: {
	        'User-Agent': 'request'
	    },
	    json: true
	};
	console.log( options.url );

	request(options, function ( err, res, body ) {

		if ( !!err ) {
			deferred.reject( error );
		}

		if (!err && res.statusCode == 200) {
			deferred.resolve( body );
		}

	});

	return deferred.promise;
}
