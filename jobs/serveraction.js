var utils = require('../utils');
var awsconfig = require('config').AWS;
var dnsconfig = require('config').DNS;

module.exports = function(params) {
  var jobs = params.jobs;
  var ProjectService = params.models.projectservice;
  var Server = params.models.server;
  var ServerAction = params.models.serveraction;

  jobs.process('createserveraction', function(job, done){
    var server = new Server();
    server.name = job.data.nodename;
    server.fullname = server.name + "." + dnsconfig.domainname;
    server.instance = job.data.instance;

    server.save(function(err, server) {
      if (err) {
        console.log(err);
        console.log("Unable to save server for: " + job.data.projectservice.name);
        done(err);
      } else {
        console.log("Create Server: " + server._id);
        var serveraction = new ServerAction();
        serveraction.serverid = server._id;
        serveraction.action = 'create';
        serveraction.save(function(err, serveraction) {
          if (err) {
            console.log("Unable to create server action: create for: " + server._id);
          } else  {
            console.log("Create ServerAction: " + serveraction._id);
          }
          ProjectService.findById(job.data.projectservice._id, function(err, projectservice) {
            if (err) {
              console.log("Unable to find projectservice: " + job.data.projectservice._id);
              console.log(err);
              done(err);
            } else {
              projectservice.serverids.push(server._id);
              projectservice.save(function(err, projectservice) {
                if(err) {
                  console.log(err);
                  console.log("Unable to save projectservice: " + job.data.projectservice._id);
                } else {
                  console.log("Updated ProjectService: " + projectservice._id);
                }
                done(err, projectservice);
              });
            }
          });
        });
      }
    });
  });

  jobs.process('destroyserveraction', function(job, done){
    Server.findByIdAndRemove(job.data.serverid, function(err) {
      if (err) {
        console.log(err);
        console.log("Unable to remove Server: " + job.data.serverid);
        done();
      } else {
        console.log("Removed Server: " + job.data.serverid);
        if (job.data.projectserviceid) {
          ProjectService.findById(job.data.projectserviceid, function(err, projectservice) {
            if (err) {
              console.log("Unable to find projectservice: " + job.data.projectserviceid);
            } else {
              for (var i=0; i < projectservice.serverids.length; i++) {
                console.log(i + ": " + projectservice.serverids[i]);
                if (projectservice.serverids[i].equals(job.data.serverid)) {
                  projectservice.serverids.splice(i, 1);
                  break;
                }
              }
              projectservice.save(function(err, projectservice) {
                if (err) {
                  console.log("Unable to remove server: " + job.data.serverid + " from projectservice: " + projectservice._id);
                }
                if (job.data.serverid) { 
                  var serveraction = new ServerAction();
                  serveraction.serverid = job.data.serverid;
                  serveraction.action = 'destroy';
                  serveraction.save(function(err, serveraction) {
                    if (err) {
                      console.log("Unable to create server action: destroy for: " + job.data.serverid);
                    } else  {
                      console.log("Destroy ServerAction: " + serveraction._id);
                    }
                    done();
                  });
                } else {
                  done();
                }
              });
            }
          });
        } else {
          done();
        }
      }
    });
  });

};
