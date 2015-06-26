var utils = require('../utils');

module.exports = function(params) {

  var app = params.app;
  var Service = params.models.service;
  var jobs = params.jobs;

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
        var job = jobs.create('rolecreate', { service: service }).save( function(err) {
          if (err) {
            return next(err);
          }
        });
        job.on('complete', function(result){
          return res.send(service);
        });
        job.on('failed', function(result){
          return next(result);
        });
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
      //@todo allow for role to be updated
      req.body.role = service.role;
      utils.updateModel(req.body, service, function(service) {
        service.save(function(err) {
          if(err) {
            return next(err);
          } 
          var job = jobs.create('roleupdate', { service: service }).save( function(err) {
            if (err) {
              return next(err);
            }
          });
          job.on('complete', function(result){
            return res.send(service);
          });
          job.on('failed', function(result){
            return next(result);
          });
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
        var job = jobs.create('roledelete', { service: service }).save( function(err) {
          if (err) {
            return next(err);
          }
        });
        job.on('complete', function(result){
          return res.send("Done");
        });
        job.on('failed', function(result){
          return next(result);
        });
      });
    });
  });

};
