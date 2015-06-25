var utils = require('../utils');
var aws = require('config').AWS;

module.exports = function(params) {

  var app = params.app;
  var Project = params.models.project;
  var ProjectService = params.models.projectservice;
  var chef = params.chef;
  var jobs = params.jobs;

  // Project

  app.get('/api/projects', function (req, res, next) {
    Project.find({userid: req.user.id}, function (err, projects) {
      res.send(projects);
    });
  });

  function addService(project, serverRole, name, service) {
    if (! serverRole.override_attributes.pbp) {
      serverRole.override_attributes.pbp = { };
    }
    switch (name) {
      case "git":
        project = gitService(project, service);
        serverRole.run_list.push("role[pbp-git]");
        if (! serverRole.override_attributes.pbp.git) {
          serverRole.override_attributes.pbp.git = [];
        }
        serverRole.override_attributes.pbp.git.push({"name": service.name, "users": service.users});
        break;
      case "chef":
        project = chefService(project, service);
        serverRole.run_list.push("role[pbp-chef]");
        serverRole.override_attributes.pbp.chef = {"domainname": service.domainname};
        break;
      case "wordpress":
        project = wordpressService(project, service);
        serverRole.run_list.push("role[pbp-wp]");
        serverRole.override_attributes.pbp.wp = {"domainname": service.domainname};
        break;
      case "jira":
        project = jiraService(project, service);
        serverRole.run_list.push("role[pbp-jira]");
        serverRole.override_attributes.pbp.jira = {"domainname": service.domainname};
        break;
      default:
        console.log("Unknown service: " + name);
        break;
    }
    return project;
  }

  function createProjectServer(project, user, cb) {
    if (! project.instance) {
      var params = {};
      params.ImageId = config.sourceami;
      params.InstanceType = project.instance_type;
      params.MinCount = 1;
      params.MaxCount = 1;
      params.KeyName = "markcallen.com";
      params.SecurityGroup = ["hostedchef"];
      params.BlockDeviceMapping = [];
      params.BlockDeviceMapping[0] = {DeviceName: "/dev/sda1", Ebs: {VolumeSize: 20, DeleteOnTermination: true} };

      ec2.RunInstances(params, function(err, result) {
        if (err) {
          fmt.dump(err, 'Err');
          if (cb) { cb(err, project); }
        } else {
          fmt.dump(result, 'Result');
          result = result.Body.RunInstancesResponse;
          if (result && result.instancesSet && result.instancesSet.item && result.instancesSet.item.instanceId) {
            project.instance = result.instancesSet.item.instanceId;
            project.save(function(err) {
              if(err) {
                if (cb) { cb(err, project); }
              } else {
                if (cb) { cb(null, project); }
              }
            });
          } else {
            if (cb) { cb("Could not start server", null); }
          }
        }
      });
    } else {
      if (cb) { cb("Already instance for project: " + project.name, project); }
    }
  }

  app.post('/api/project', function (req, res, next) {
    var user = req.user;
    var project = new Project();
    if (req.body.name && req.body.name !== "") {
      project.name = req.body.name;
    } else {
      return next(req.body.name + " is not a valid name.");
    }
    if (! req.body.fullname) {
      project.fullname = req.body.name + '.' + aws.route53.domainname;
    } else {
      //TODO: add test
      project.fullname = req.body.fullname;
    }
    if (! utils.checkDnsName(project.fullname)) {
      //TODO: add test
      return next(project.fullname + " is not a valid dns name");
    }
    project.userid = user.id;
    var serverRole = chef.chefRole(utils.fullnameToRole(project.fullname));

    serverRole.default_attributes = {
      "pbp": {
      },
      "servername": project.fullname
    };

    if (req.body.size) {
      if (utils.sizeMap[req.body.size]) {
        project.instance_type = utils.sizeMap[req.body.size];
      } else {
        return next("Size: " + req.body.size + " is invalid");
      }
    }

    if (req.body.services) {
      if (! project.instance_type) {
        return next("instance_type required.");
      }

      for (var service in req.body.services) {
        project = addService(project, serverRole, service, req.body.services[service]);
      }
    }

    project.save(function(err) {
      if(err) {
        if (11000 === err.code) {
          return next("Duplicate project name: " + req.body.name);
        } else {
          return next(err);
        }
      }
      res.send(project);
/*
      chef.chefCreateRole(serverRole, function(err, result) {
        if (err) {
          return next(err);
        }

        if (req.body.services) {
          createProjectServer(project, user, function(err, project) {
            if (err) {
              return next(err);
            }
            res.send(project);
          });
        } else {
          res.send(project);
        }
      });
*/
    });
  });

  app.get('/api/project/:id', function (req, res, next) {
    var user = req.user;
    Project.findById(req.params.id, function (err, project) {
      if (err) {
        return next(err);
      }
      return res.send(project);
    });
  });

  app.put('/api/project/:id', function (req, res, next) {
    Project.findById(req.params.id, function (err, project) {
      if (err) {
        return next(err);
      }
      if (! project) {
        return next("Can't find project for: " + req.params.id);
      }
      if (req.body.fullname) {
        project.fullname = req.body.fullname;
      }
      if (! utils.checkDnsName(project.fullname)) {
        return next(project.fullname + " is not a valid dns name");
      }
      project.save(function(err) {
        if(err) {
          if (11000 === err.code) {
            return next("Duplicate project name: " + req.body.name);
          } else {
            return next(err);
          }
        } 
        res.send(project);
      });
    });
  });

  app.delete('/api/project/:id', function (req, res, next) {
    var user = req.user;
    Project.findById(req.params.id, function (err, project) {
      if (err) {
        return next(err);
      }  
      if (! project) {
        return next("Can't find project for: " + req.params.id);
      }
      if (project.instance) {
        ec2.TerminateInstances({"InstanceId": [project.instance]}, function(err, result) {
          if (err) {
            console.log(err);
          }
        });
      } 
      chef.chefDeleteRole(utils.fullnameToRole(project.fullname), function(err, result) {
        if (err) {
          console.log(err);
        }
        //TODO: need to deal with route53/dns differently
        /*
        deleteRoute53(project.name, function(err) {
          if (err) {
            fmt.dump(err, project.name);
          }
          deleteRoute53("wordpress."+project.name, function(err) {
            if (err) {
              fmt.dump(err, "wordpress."+project.name);
            }
            deleteRoute53("chef."+project.name, function(err) {
              if (err) {
                fmt.dump(err, "chef."+project.name);
              }
              deleteRoute53("jira."+project.name, function(err) {
                if (err) {
                  fmt.dump(err, "jira."+project.name);
                }
        */
                project.remove(function(err, result) {
                  if (err) {
                    return next(err);
                  }
                  return res.send("Done");
                });
                /*
              });
            });
          });
        });
        */
      });
    });
  });

  app.get('/api/project/:id/services', function (req, res, next) {
    ProjectService.find({projectid: req.params.id}, function (err, projectservices) {
      if (err) {
        return next(err);
      }
      return res.send(projectservices);
    });
  });

  app.get('/api/project/:id/service/:serviceid', function (req, res, next) {
    ProjectService.findOne({$or: [{projectid: req.params.projectid}, {serviceid: req.params.serviceid}]}, function (err, projectservices) {
      if (err) {
        return next(err);
      }
      return res.send(projectservices);
    });
  });

  app.post('/api/project/:id/service/:serviceid', function (req, res, next) {
    Project.findById(req.params.id, function (err, project) {
      if (err) {
        return next(err);
      }
      if (! project) {
        return next("Can't find project for: " + req.params.id);
      }
      var projectservice = new ProjectService();
      projectservice.userid = req.user.id;
      projectservice.projectid = req.params.id;
      projectservice.serviceid = req.params.serviceid;
      utils.updateModel(req.body, projectservice, function(projectservice) {
        projectservice.save(function(err) {
          if (err) {
            return next(err);
          }
          return res.send(projectservice);
        });
      });
    });
  });

  app.put('/api/project/:id/service/:serviceid', function (req, res, next) {
    ProjectService.findOne({$or: [{projectid: req.params.projectid}, {serviceid: req.params.serviceid}]}, function (err, projectservice) {
      if (err) {
        return next(err);
      }
      if (! projectservice) {
        return next("Can't find projectservice for: " + req.params.serviceid);
      }
      utils.updateModel(req.body, projectservice, function(projectservice) {
        projectservice.save(function(err) {
          if(err) {
            return next(err);
          } 
          res.send(projectservice);
        });
      });
    });
  });

  app.delete('/api/project/:id/service/:serviceid', function (req, res, next) {
    var user = req.user;
    ProjectService.findOne({$or: [{projectid: req.params.projectid}, {serviceid: req.params.serviceid}]}, function (err, projectservice) {
      if (err) {
        return next(err);
      }  
      if (! projectservice) {
        return next("Can't find projectservice for: " + req.params.serviceid);
      }
      projectservice.remove(function(err) {
        if (err) {
          return next(err);
        }
        return res.send("Done");
      });
    });
  });

  app.get('/api/project/:id/service/:serviceid/create', function (req, res, next) {
    var user = req.user;
    ProjectService.findOne({$or: [{projectid: req.params.projectid}, {serviceid: req.params.serviceid}]}, function (err, projectservice) {
      if (err) {
        return next(err);
      }
      if (! projectservice) {
        return next("Can't find projectservice for: " + req.params.serviceid);
      }
      var job = jobs.create('createservice', { projectservice: projectservice }).save( function(err) {
        if (err) {
          return next(err);
        }
        res.send(job);
      });

    });
  });

  app.get('/api/project/:id/service/:serviceid/status', function (req, res, next) {
    var user = req.user;
    ProjectService.findOne({$or: [{projectid: req.params.projectid}, {serviceid: req.params.serviceid}]}, function (err, projectservice) {
      if (err) {
        return next(err);
      }
      if (! projectservice) {
        return next("Can't find projectservice for: " + req.params.serviceid);
      }
      var job = jobs.create('servicestatus', { projectservice: projectservice }).save( function(err) {
        if (err) {
          return next(err);
        }
      });
      job.on('complete', function(result){
        return res.send(result);
      });
      job.on('failed', function(result){
        return next(result);
      });

    });
  });

  app.get('/api/project/:id/service/:serviceid/destroy', function (req, res, next) {
    var user = req.user;
    ProjectService.findOne({$or: [{projectid: req.params.projectid}, {serviceid: req.params.serviceid}]}, function (err, projectservice) {
      if (err) {
        return next(err);
      }
      if (! projectservice) {
        return next("Can't find projectservice for: " + req.params.serviceid);
      }
      var job = jobs.create('destroyservice', { projectservice: projectservice }).save( function(err) {
        if (err) {
          return next(err);
        }
        res.send(job);
      });

    });
  });


};
