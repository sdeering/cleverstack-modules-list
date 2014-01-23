'use strict';

/*
    Cleverstack Module Repo Finder.
    http://cleverstack.io/modules

    1. Gets official modules list for cleverstack
    2. Searches github
    3. Filters by keywords

    todo:
    - npm publish check
    - community module scout bot
    - persistent caching

*/

var Q = require( 'q' );
var request = require( 'request' );
var _ = require( 'lodash' );
var async = require( 'async' );
var throat = require( 'throat' );
var cachedResults;

var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'ba861503f44aa44be939';
var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'fb7d5a721bea1e5c9292765835b342c3e68b3ef6';
var csOrgs = [ 'cleverstack' ];
var csKeywords = [ 'cleverstack-module', 'cleverstack-seed' ]; //(additions: frontend, backend)


// API / GET
exports.list = function( req, res ) {

    //caching
    if ( !_.isEmpty( cachedResults ) ) {
        res.json( cachedResults );
        return true;
    }
    exports.refresh( req, res );

};

exports.refresh = function( req, res ) {

    res.send( 'Regenerating results cache...' );
    _getRepos();

};

// Search GitHub
function  _getRepos() {

    var apiLimitExceeded = false;

    return Q.fcall(function () {

        var deferred = Q.defer();
        var options = {
            url: 'https://api.github.com/orgs/'+csOrgs+'/repos',
            qs: {
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET
            },
            headers: {
                'User-Agent': 'cleverstack list'
            },
            json: true,
            timeout: 60000
        };
        console.log( options.url );
        request.get( options, function ( err, res, body ) {

            if ( !err && body && /API Rate Limit Exceeded/.test(body.message) ) {

                apiLimitExceeded = true;
                deferred.resolve();

            }
            deferred.resolve( body );
        });

        return deferred.promise;

    }).then( function( repos ) {

        var results = repos.map(throat(10, function ( repo ) {

            var deferred = Q.defer();
            var userName = repo.owner.login;
            var repoName = repo.name;
            var options = {
                url: 'https://api.github.com/repos/'+userName+'/'+repoName,
                qs: {
                    client_id: GITHUB_CLIENT_ID,
                    client_secret: GITHUB_CLIENT_SECRET
                },
                headers: {
                    'User-Agent': 'cleverstack list'
                },
                json: true,
                timeout: 60000
            };
            console.log( 'fetching '+options.url );

            request.get( options, function ( err, res, body ) {

                if ( !err && body && /API Rate Limit Exceeded/.test(body.message) ) {

                    apiLimitExceeded = true;
                    deferred.resolve();

                } else if ( body && /Repository access blocked/.test(body.message) ) {

                    deferred.resolve();

                } else if ( !err && res.statusCode === 200 ) {

                    var complete = function ( keywords ) {

                        var model = _createModuleData( body, keywords );
                        csKeywords.forEach( function( k ) {

                            //http://jsperf.com/jquery-inarray-vs-underscore-indexof/18
                            for (var i = 0, m = keywords.length; i < m; i++) {
                                if (keywords[i] === k) {
                                    cachedResults.push( model );
                                    console.log( 'adding '+model.name );
                                    // deferred.resolve( model );
                                    return true;
                                }
                            }

                        });
                        deferred.resolve( false );

                    };

                    _fetchRepoKeywords(body.owner.login, body.name, 'package.json', function ( err, keywords ) {

                        if ( err == false ) {
                            complete( keywords );
                        }

                    });
                    return;

                } else {

                    if ( response && response.statusCode === 404 ) {
                        deferred.resolve();
                    } else {
                        console.log('err github fetch', org, response.statusCode, err, body);
                        deferred.resolve();
                    }

                }

                return deferred.promise;
            });

            return deferred.promise;
        }));

    }).then( function ( results ) {

        if ( apiLimitExceeded ) {

            console.log( 'API limit exceeded. Using cached GitHub results.' );
            return Q.all( cachedResults );

        }

        cachedResults = _.unique( _.compact( results ) );
        return Q.all( results );

    });

}

// construct the module data we need
function _createModuleData( data, keywords ) {

    var obj = {
        name: data.name,
        description: data.description,
        owner: data.owner.login,
        website: data.html_url,
        forks: data.forks,
        stars: data.watchers,
        created: data.created_at,
        updated: data.pushed_at
    };

    if ( keywords ) {
        obj.keywords = keywords;
    }

    return obj;
}

// get keywords from package.json
function _fetchRepoKeywords( user, repo, file, cb ) {

    var url = 'https://raw.github.com/' + user + '/' + repo + '/master/'+ file;
    console.log( 'fetching '+url );
    request.get(url, {json: true}, function ( err, res, body ) {
        if ( !err && body && body.keywords ) {
            // console.log(body.keywords);
            cb( false, body.keywords );
        } else {
            cb( true );
        }
    });

}
