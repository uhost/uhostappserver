var express = require('express');
var morgan  = require('morgan');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override')
var session      = require('express-session')
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var mongodb = require('mongodb');
var MongoStore = require('connect-mongo')(session);
var fs = require('fs');
var sessiondb = require('config').Sessiondb;
var webserver = require('config').Webserver;
var AWS = require('aws-sdk');

var app = express();

app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())
app.use(methodOverride()); // must come after bodyParser
app.use(session({
  secret:'mysecretcookie',
  maxAge: new Date(Date.now() + 3600000),
  store: new MongoStore(
    {db: sessiondb.name, host: sessiondb.host},
    function(collection){
      if (collection.db && collection.db.databaseName) {
        console.log('connect-mongodb setup ok. Connected to: ' + collection.db.databaseName);
      } else {
        console.log(collection);
      }
  }), 
  resave: true,
  saveUninitialized: true
}));

AWS.config.loadFromPath('./awsconfig.json');

var routes = require('./routes');
routes({app: viasim.app, authorization: viasim.authorization, viasimmodels: viasim.models, models: models});

var server = require('http').createServer(app);
server.listen(webserver.port);

