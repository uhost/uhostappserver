var fmt = require('fmt');
var AWS = require('aws-sdk');

var models = require('./models')();

var chef = require('./chef');

var queues = require('./queues');
var jobs = queues({models: models});

var routes = require('./routes');
routes({models: models, chef: chef, jobs: jobs});


