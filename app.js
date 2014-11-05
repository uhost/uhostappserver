var express = require('express');
var morgan  = require('morgan');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override')
var session      = require('express-session')
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var sessiondb = require('config').Sessiondb;
var webserver = require('config').Webserver;

var nmea = require('nmea-0183');

var app = express();

app.use(morgan());
app.use(cookieParser());
app.use(bodyParser());
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
  })
}));

var server = require('http').createServer(app);
server.listen(webserver.port);

app.get('/', function(req, res){
  res.sendfile('index.html');
});
