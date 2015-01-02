var fmt = require('fmt');
var AWS = require('aws-sdk');

var models = require('./models')();

var routes = require('./routes');
routes({models: models});


