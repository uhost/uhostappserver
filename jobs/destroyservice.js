var utils = require('../utils');
var chefconfig = require('config').Chef;
var fs = require('fs');
var awsconfig = require('config').AWS;

module.exports = function(params) {
  var jobs = params.jobs;
  var chef = params.chef;
  var Server = params.models.server;
  var AWS = params.AWS;
  var ec2 = new AWS.EC2();

  jobs.process('destroyservice', function(job, done){
    console.log(job.data.projectservice);

    var servercount = job.data.projectservice.serverids.length;

    job.data.projectservice.serverids.forEach(function(serverid) {

      Server.findById(serverid, function(err, server) {
        if (err) {
          console.log(err);
          console.log("Unable to find Server: " + serverid);
        } else {
          if (server && server.instance) {
            var params = {
             InstanceIds: [server.instance]
           };
  
           console.log(params)
           ec2.terminateInstances(params, function(err, data) {
             if (err) { 
               console.log("Could not terminate instance " + server.instance, err); 
             } else {
               console.log("Terminated: " + server.instance);
               console.log(data);
             }
             chef.chefDeleteNode(server.name, function(err) {
               if (err) {
                 console.log("Unable to delete chef node: " + server.name);
               } else {
                 console.log("Deleted chef node: " + server.name);
               }


               //@TODO: delete from route53

               var destroyserveractionjob = jobs.create('destroyserveraction', { serverid: serverid, projectserviceid: job.data.projectservice._id }).save( function(err) {
                 if (err) {
                   console.log(err);
                 }
                 console.log(destroyserveractionjob.type + ": " + destroyserveractionjob.id);
  
                 if (! --servercount) {
                   done();
                 }
               });
             });
           });
          } else {
           var destroyserveractionjob = jobs.create('destroyserveraction', { serverid: serverid, projectserviceid: job.data.projectservice._id }).save( function(err) {
             if (err) {
               console.log(err);
             }
             console.log(destroyserveractionjob.type + ": " + destroyserveractionjob.id);
     
             if (! --servercount) {
               done();
             }
           });
          }
        }
      });
    });
  });

};
