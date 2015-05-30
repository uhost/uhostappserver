var fmt = require('fmt');
var awsconfig = require('config').AWS;
var AWS = require('aws-sdk');

AWS.config.region = awsconfig.region;
AWS.config.credentials = new AWS.Credentials({
  accessKeyId: awsconfig.awsAccessKey, secretAccessKey: awsconfig.awsSecretKey
});

var models = require('./models')();

var chef = require('./chef');

var queues = require('./queues');
var jobs = queues({models: models, chef: chef, AWS: AWS});

var routes = require('./routes');
routes({models: models, chef: chef, jobs: jobs});


