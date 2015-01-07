var utils = require('../utils');

module.exports = function(params) {

  var app = params.app;

// Project

function LogProjectAction(project, user, action, cb) {
  var projectAction = new ProjectAction();
  projectAction.projectid = project.id;
  projectAction.instance = project.instance;
  projectAction.userid = user.id;
  projectAction.action = action;
  projectAction.save(function(err) {
    cb(err, projectAction);
  });
}

app.get('/api/projects', function (req, res, next) {
  var ObjectId = mongoose.Types.ObjectId;
  Project.find({userid: new ObjectId(req.user.id)}, function (err, projects) {
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
            cb && cb(err, project);
          } else {
            fmt.dump(result, 'Result');
            result = result.Body.RunInstancesResponse;
            if (result && result.instancesSet && result.instancesSet.item && result.instancesSet.item.instanceId) {
              project.instance = result.instancesSet.item.instanceId;
              project.save(function(err) {
                if(err) {
                  cb && cb(err, project);
                } else {
                  LogProjectAction(project, user, "created", function(err, projectAction) {
                    if (err) {
                      console.log(err);
                    }
                    cb && cb(null, project);
                  });
                }
              });
            } else {
              next("Could not start server");
            }
          }
       });
   } else {
     cb && cb("Already instance for project: " + project.name, project);
   }
}

app.post('/api/project', function (req, res, next) {
  var user = req.user;
  var project = new Project();
  if (req.body.name && req.body.name != "") {
    project.name = req.body.name;
  } else {
    return next(req.body.name + " is not a valid name.");
  }
  if (! req.body.fullname) {
    project.fullname = req.body.name + '.' + config.route53.domainname;
  } else {
    project.fullname = req.body.fullname;
  }
  if (! utils.checkDnsName(project.fullname)) {
    return next(project.fullname + " is not a valid dns name");
  }
  project.userid = user.id;
  var serverRole = chefRole(fullnameToRole(project.fullname));

  serverRole.default_attributes = {
    "pbp": {
    },
    "servername": project.fullname
  };

  if (req.body.size) {
    if (sizeMap[req.body.size]) {
      project.instance_type = sizeMap[req.body.size];
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
    chefCreateRole(serverRole, function(err, result) {
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
    chefDeleteRole(fullnameToRole(project.fullname), function(err, result) {
      if (err) {
        console.log(err);
      }
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
              project.remove(function(err, result) {
                if (err) {
                  return next(err);
                }
                LogProjectAction(project, user, "terminated", function(err, projectAction) {
                  if (err) {
                    console.log(err);
                  }
                  return res.send("Done");
                });
              });
            });
          });
        });
      });
    });
  });
});

app.get('/api/project/:id/services', function (req, res, next) {
  Project.findById(req.params.id, function (err, project) {
    if (err) {
      return next(err);
    }
    return res.send(project.services);
  });
});

app.post('/api/project/:id/service/:service', function (req, res, next) {
  if (! req.body[req.params.service]) {
    return next("Can't find " + req.params.service + " in input.");
  }
  Project.findById(req.params.id, function (err, project) {
    if (err) {
      return next(err);
    }
    if (! project) {
      return next("Can't find project for: " + req.params.id);
    }
    var projectRolename = fullnameToRole(project.fullname);
    chefGetRole(projectRolename, function(err, projectRole) {
      if (err) {
        return next(err);
      }
      project = addService(project, projectRole, req.params.service, req.body[req.params.service]);
      chefUpdateRole(projectRolename, projectRole, function(err, results) {
        if (err) {
          return next(err);
        }
        if (! project.instance) {
          createProjectServer(project, req.user, function(err, project) {
            if (err) {
              return next(err);
            }
            return res.send(project.services);
          });
        } else {
          //TODO: run chef-client on the project server to add the new service
          return res.send(project.services);
        }
      });
    });
  });
});

}
