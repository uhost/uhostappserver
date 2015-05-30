var utils = require('../utils');
var chefconfig = require('config').Chef;
var fs = require('fs');
var awsconfig = require('config').AWS;

module.exports = function(params) {
  var jobs = params.jobs;
  var Server = params.models.server;
  var AWS = params.AWS;
  var ec2 = new AWS.EC2();

  jobs.process('servicestatus', function(job, done){
    var servercounter = job.data.projectservice.serverids.length;

    var params = {
      InstanceIds: []
    };

    job.data.projectservice.serverids.forEach(function(serverid) {
      Server.findById(serverid, function(err, server) { 
        params.InstanceIds.push(server.instance);
     
        if (! --servercounter) {
          ec2.describeInstances(params, function(err, data) {
            if (err) { 
              console.log("Could not describe instances " + job.data.projectservice.serverids, err); 
            }

            done(err, data);
          });
        }
      });
    });
  });

};
