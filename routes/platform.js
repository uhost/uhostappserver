var utils = require('../utils');

module.exports = function(params) {

  var app = params.app;
  var Platform = params.models.platform;

  // Platform

  app.get('/api/platforms', function (req, res, next) {
    Platform.find({userid: req.user.id}, function (err, platforms) {
      res.send(platforms);
    });
  });

  app.post('/api/platform', function (req, res, next) {
    var user = req.user;
    var platform = new Platform();
    platform.userid = user.id;

    utils.updateModel(req.body, platform, function(platform) {
      platform.save(function(err) {
        if(err) {
          return next(err);
        }
        res.send(platform);
      });
    });
  });

  app.get('/api/platform/:id', function (req, res, next) {
    var user = req.user;
    Platform.findById(req.params.id, function (err, platform) {
      if (err) {
        return next(err);
      }
      return res.send(platform);
    });
  });

  app.put('/api/platform/:id', function (req, res, next) {
    Platform.findById(req.params.id, function (err, platform) {
      if (err) {
        return next(err);
      }
      if (! platform) {
        return next("Can't find platform for: " + req.params.id);
      }
      if (req.body.fullname) {
        platform.fullname = req.body.fullname;
      }
      if (! utils.checkDnsName(platform.fullname)) {
        return next(platform.fullname + " is not a valid dns name");
      }
      platform.save(function(err) {
        if(err) {
          return next(err);
        } 
        res.send(platform);
      });
    });
  });

  app.delete('/api/platform/:id', function (req, res, next) {
    var user = req.user;
    Platform.findById(req.params.id, function (err, platform) {
      if (err) {
        return next(err);
      }  
      if (! platform) {
        return next("Can't find platform for: " + req.params.id);
      }
      platform.remove(function(err) {
        if (err) {
          return next(err);
        }
        return res.send("Done");
      });
    });
  });

};
