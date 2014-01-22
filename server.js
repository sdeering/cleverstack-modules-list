'use strict';

var http = require('http');
var express = require('express');
var Q = require('q');
var crypto = require('crypto');
var app = express();
var repos = require('./repos');
var HTTP_PORT = process.env.PORT || 8011;

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});
app.get('/', repos.list);
app.get('/refresh', repos.newList);

app.listen(HTTP_PORT);

console.log('Server running on port ' + HTTP_PORT);
