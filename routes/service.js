var utils = require('../utils');

module.exports = function(params) {

  var app = params.app;
  var Service = params.models.service;

  // Service

  app.get('/api/services', function (req, res, next) {
    Service.find({userid: req.user.id}, function (err, services) {
      res.send(services);
    });
  });

  app.post('/api/service', function (req, res, next) {
    var user = req.user;
    var service = new Service();
    service.userid = user.id;

    utils.updateModel(req.body, service, function(service) {
      service.save(function(err) {
        if(err) {
          return next(err);
        }
        res.send(service);
      });
    });
  });

  app.get('/api/service/:id', function (req, res, next) {
    var user = req.user;
    Service.findById(req.params.id, function (err, service) {
      if (err) {
        return next(err);
      }
      return res.send(service);
    });
  });

  app.put('/api/service/:id', function (req, res, next) {
    Service.findById(req.params.id, function (err, service) {
      if (err) {
        return next(err);
      }
      if (! service) {
        return next("Can't find service for: " + req.params.id);
      }
      utils.updateModel(req.body, service, function(service) {
        service.save(function(err) {
          if(err) {
            return next(err);
          } 
          res.send(service);
        });
      });
    });
  });

  app.delete('/api/service/:id', function (req, res, next) {
    var user = req.user;
    Service.findById(req.params.id, function (err, service) {
      if (err) {
        return next(err);
      }  
      if (! service) {
        return next("Can't find service for: " + req.params.id);
      }
      service.remove(function(err) {
        if (err) {
          return next(err);
        }
        return res.send("Done");
      });
    });
  });

};
