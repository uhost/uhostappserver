var utils = require('../utils');
var chefconfig = require('config').Chef;
var fs = require('fs');
var awsconfig = require('config').AWS;

module.exports = function(params) {
  var jobs = params.jobs;
  var Server = params.models.server;
  var chef = params.chef;

  jobs.process('rolecreate', function(job, done){
    var service = job.data.service;

    var role = chef.chefRole(service.role, service.name, service.runlist, service.defaultattributes[0], service.overrideattributes[0]);

    chef.chefCreateRole(role, function(err, result) {
      done(err, result);
    });
  });

  jobs.process('roleupdate', function(job, done){
    var service = job.data.service;

    chef.chefGetRole(service.role, function(err, role) {
      if (err) {
        return done(err, null);
      }
      role.description = service.name;
      role.run_list = service.runlist;
      role.default_attributes = service.defaultattributes[0];
      role.override_attributes = service.overrideattributes[0];

      chef.chefUpdateRole(service.role, role, function(err, result) {
        done(err, result);
      });
    });
  });

  jobs.process('roledelete', function(job, done){
    var service = job.data.service;

    chef.chefDeleteRole(service.role, function(err, result) {
      done(err, result);
    });
  });

};
