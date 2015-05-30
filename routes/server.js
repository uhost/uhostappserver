
module.exports = function(params) {

  var app = params.app;
  var chef = params.chef;
  var User = params.models.user;
  var Server = params.models.server;
  var ServerAction = params.models.serveraction;

// Server

function LogServerAction(server, user, action, cb) {
  var serverAction = new ServerAction();
  serverAction.serverid = server.id;
  serverAction.instance = server.instance;
  serverAction.userid = user.id;
  serverAction.action = action;
  serverAction.save(function(err) {
    if (cb) { cb(err, serverAction); }
  });
}



app.get('/api/project/:projectid/servers', function (req, res, next) {
  var ObjectId = mongoose.Types.ObjectId;
  Server.find({projectid: req.params.projectid}, function (err, servers) {
    res.send(servers);
  });
});

function getServerInfo(servers, cb) {
  User.find({}, function (err, users) {
    if (err) {
      return cb(err, null);
    }
    ec2.DescribeInstances({}, function(err, result) {
      if (err) {
        return cb(err, null);
      } else {
        var results = new Array();
        for (var i=0; i < result.reservationSet.item.length; i++) {
          for (var j=0; j < servers.length; j++) {
            if (result.reservationSet.item[i].instancesSet.item.instanceId == servers[j].instance) {
              var rec = {};
              rec._id = servers[j]._id;
              rec.name = servers[j].name;
              rec.instance = servers[j].instance;
              rec.instance_type = servers[j].instance_type;
              rec.created = servers[j].created;
              rec.item = result.reservationSet.item[i];
              for (var k=0; k < users.length; k++) {
                if (users[k]._id.equals(servers[j].userid)) {
                  rec.user = users[k];
                }
              }
              results.push(rec);
              break;
            }
          }
        }
        if (cb) { cb(null, results); }
      }
    });
  });
}

function checkServerName(name) {
  var re = /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])$/;
  return re.test(name);
}

function chefRole(name) {
  var role = {
     "name": name,
     "description": "",
     "env_run_lists": {
     },
     "chef_type": "role",
     "run_list": [
     ],
     "default_attributes": {
     },
     "override_attributes": {
       "pbp": { 
       }
     },
     "json_class": "Chef::Role"
   };

  return role;
}

function gitService(model, git) {
  if (! model.services.git) {
    model.services.git = [];
  }
  model.services.git.push(git);
  return model;
}

function nodejsService(server, nodejs) {
  if (! server.services.nodejs) {
    server.services.nodejs = [];
  }
  for (var i=0; i < nodejs.length; i++ ) {
    server.services.nodejs.push(nodejs[i]);
  }
  return server;
}

// There is only 1 chef service per server
function chefService(model, chef) {
  model.services.chef = [];
  model.services.chef.push(chef);
  return model;
}

function wordpressService(model, wordpress) {
  model.services.wordpress = [];
  model.services.wordpress.push(wordpress);
  return model;
}

function jiraService(model, jira) {
  model.services.jira = [];
  model.services.jira.push(jira);
  return model;
}

app.post('/api/project/:projectid/server', function (req, res, next) {
  var user = req.user;
  var server = new Server();
  if (req.body.name && req.body.name != "" && checkServerName(req.body.name)) {
    server.name = req.body.name;
  } else {
    return next(req.body.name + " is not a valid name.");
  }
  if (req.body.fullname && req.body.fullname != "") {
    server.fullname = req.body.fullname;
  } else {
    return next(req.body.fullname + " is not a valid fullname.");
  }
  server.projectid = req.params.projectid;
  if (! req.body.instance_type) {
    return next("Instance Type required.");
  }
  server.instance_type = req.body.instance_type;
  if (req.body.instance) {
    server.instance = req.body.instance;
  }
  server.save(function(err) {
    if(err) {
      if (11000 === err.code) {
        next("Duplicate server name: " + req.body.name);
       } else {
        next(err);
       }
     } else {
       var serverRole = chefRole(fullnameToRole(server.fullname));
       var appServerRole = null;
       var loadBalancerRole = null;
       for (var service in req.body.services) {
         switch (service) {
           case "nodejs":
             server = nodejsService(server, req.body.services.nodejs);
             appServerRole = chefRole(fullnameToRole(server.services.nodejs[0].domainname) + "-app_application_server");
             loadBalancerRole = chefRole(fullnameToRole(server.services.nodejs[0].domainname) + "-app_load_balancer");
             serverRole.run_list.push("role[" + fullnameToRole(server.services.nodejs[0].domainname) + "-app_application_server]");
             serverRole.run_list.push("role[" + fullnameToRole(server.services.nodejs[0].domainname) + "-app_load_balancer]");
             serverRole.run_list.push("role[pbp-nodejs-server]");
             break;
           default:
             console.log("Unknown service");
             break;
         }
       }
       if (server.services.nodejs.length > 0) {
         serverRole.default_attributes = {
           "servername": server.fullname,
           "pbp": {
             "domainname": server.services.nodejs[0].domainname,
             "environment_name": server.services.nodejs[0].environment_name,
             "git": {
               "repo": server.services.nodejs[0].repo,
               "deploybranch": server.services.nodejs[0].deploybranch
             },
             "appfilename": server.services.nodejs[0].appfilename,
             "port": server.services.nodejs[0].port,
             "server_role": fullnameToRole(server.services.nodejs[0].domainname) + "-app_application_server",
             "lb_role": fullnameToRole(server.services.nodejs[0].domainname) + "-app_load_balancer"
           }
         }; 
       }
       server.save(function(err) {
         if (err) {
           return next(err);
         }
         chef.chefCreateRole(appServerRole, function(err, result) {
           if (err) {
             return next(err);
           }
           chef.chefCreateRole(loadBalancerRole, function(err, result) {
             if (err) {
               return next(err);
             }
             chef.chefCreateRole(serverRole, function(err, result) {
               if (err) {
                 return next(err);
               }
               var params = {};
               params.ImageId = config.sourceami;
               params.InstanceType = req.body.instance_type;
               params.MinCount = 1;
               params.MaxCount = 1;
               params.KeyName = "markcallen.com";
               params.SecurityGroup = ["hostedchef"];
               params.BlockDeviceMapping = [];
               params.BlockDeviceMapping[0] = {DeviceName: "/dev/sda1", Ebs: {VolumeSize: 10, DeleteOnTermination: true} };
  
               ec2.RunInstances(params, function(err, result) {
                 if (err) {
                   next(err);
                 } else {
                   fmt.dump(result, 'Result');
                   result = result.Body.RunInstancesResponse;
                   if (result && result.instancesSet && result.instancesSet.item && result.instancesSet.item.instanceId) {
                     server.instance = result.instancesSet.item.instanceId;
                     server.save(function(err) {
                       if(err) {
                         next(err);
                       } else {
                         LogServerAction(server, user, "created", function(err, serverAction) {
                           if (err) {
                             console.log(err);
                           }
                           res.send(server);
                         });
                       }
                     });
                   } else {
                     next("Could not start server");
                   }
                 }
              });
            });
           });
         });
       });
    }
  });
});

app.put('/api/project/:projectid/server/:id', function (req, res, next) {
  return Server.findById(req.params.id, function (err, server) {
    // server.instance = req.body.instance; // not allowing the instance to be changed
    // server.instance_type = req.instance_type; // not sure how to change the instance type
    return server.save(function (err) {
      if (err) {
        if (11001 === err.code) {
          next("Duplicate server name: " + req.body.name);
        } else {
          next(err);
        }
      } else {
        return res.send(server);
      }
   });
  });
});

app.get('/api/project/:projectid/server/:id', function (req, res, next) {
  Server.findById(req.params.id, function (err, server) {
    if (err) {
      next(err);
    } else {
      return res.send(server);
    }
  });
});

app.get('/api/project/:projectid/server/:id/action/:action', function (req, res, next) {
  var user = req.user;
  Server.findById(req.params.id, function (err, server) {
    if (err) {
      next(err);
    } else if (server == null) {
      next("Can't find server for: " + req.params.id);
    } else {
      switch (req.params.action.toLowerCase()) {
      case 'status' :
        ec2.DescribeInstances({"InstanceId": [server.instance]}, function(err, result) {
          if (err) {
            return next(err);
          }
          if (! result && ! result.reservationSet && ! result.reservationSet.item) {
            fmt.dump(result, 'Result');
            return next("Did not get back what we expected.");
          }
          getWaitMessage(function(message) {
            result.reservationSet.item.instancesSet.item.waitmessage = message;
            res.send(JSON.stringify(result.reservationSet.item.instancesSet.item));
          });
        });
        break;
      case 'start' :
        ec2.StartInstances({"InstanceId": [server.instance]}, function(err, result) {
          if (err) {
            next(err);
          } else {
            LogServerAction(server, user, "started", function(err, serverAction) {
              if (err) {
                console.log(err);
              }
              res.send(JSON.stringify(result));
            });
          }
        });
        break;
      case 'stop' :
        ec2.StopInstances({"InstanceId": [server.instance]}, function(err, result) {
          if (err) {
            next(err);
          } else {
            LogServerAction(server, user, "stopped", function(err, serverAction) {
              if (err) {
                console.log(err);
              }
              cnameRoute53(server, function(err, data) {
                if (err) {
                  console.log(err);
                }
              });
              res.send(JSON.stringify(result));
            });
          }
        });
        break;
      case 'route53' :
        getRoute53(server.name, function(err, data) {
          if (err) {
            return next(err);
          }
          return res.send(data);
        });
        break;
      case 'updateroute53' :
        updateRoute53(server, function(err, data) {
          if (err) {
            return next(err);
          }
          return res.send(data);
        });
        break;
      case 'cnameroute53' :
        cnameRoute53(server, function(err, data) {
          if (err) {
            return next(err);
          }
          return res.send(data);
        });
        break;
      case 'deleteroute53' :
        deleteRoute53(server.name, function(err, data) {
          if (err) {
            return next(err);
          }
          return res.send(data);
        });
        break;
      default :
        res.send("No action for " + req.params.action);
        break;
      }
    }
  });
});

app.delete('/api/project/:projectid/server/:id', function (req, res, next) {
  var user = req.user;
  Server.findById(req.params.id, function (err, server) {
    if (err) {
      next(err);
    } else {
      deleteRoute53(server.name, function(err, data) {
        ec2.TerminateInstances({"InstanceId": [server.instance]}, function(err, result) {
          if (err) {
            console.log(err);
          } 
          server.remove(function (err) {
            if (err) {
              next(err);
            } else {
              LogServerAction(server, user, "terminated", function(err, serverAction) {
                if (err) {
                  console.log(err);
                }
                res.send(JSON.stringify(result));
              });
            }
          });
        });
      });
    }
  });
});

// DNS

function getRoute53(servername, cb) {
  var params = {
    HostedZoneId : config.route53.zoneid,
    Type: 'A',
    Name: servername.toLowerCase() + '.' + config.route53.domainname 
  }
  r53.ListResourceRecordSets(params, function(err, data) {
    var result = { };
    if (! err) {
      for(var rec in data.Body.ListResourceRecordSetsResponse.ResourceRecordSets.ResourceRecordSet) {
        if (data.Body.ListResourceRecordSetsResponse.ResourceRecordSets.ResourceRecordSet[rec].Name == servername.toLowerCase() + '.' + config.route53.domainname + '.') {
          result = data.Body.ListResourceRecordSetsResponse.ResourceRecordSets.ResourceRecordSet[rec];
          break;
        }
      }
    }
    cb && cb(err, result);
  });
}

function updateRoute53(server, cb) {
 getRoute53(server.name, function(err, r53data) {
   if (err) {
     return cb && cb(err, null);
   }
   var resourceRecords = new Array();
   var changes = new Array();
   if (r53data.ResourceRecords) {
     resourceRecords.push(r53data.ResourceRecords.ResourceRecord.Value);
     changes.push({
            Action          : 'DELETE',
            Name            : r53data.Name,
            Type            : r53data.Type,
            Ttl             : r53data.TTL,
            ResourceRecords : resourceRecords
     });
   }
   ec2.DescribeInstances({"InstanceId": [server.instance]}, function(err, result) {
     if (err) {
       return cb && cb(err, null);
      }
      console.log(result);
      resourceRecords = new Array();
      resourceRecords.push(result.reservationSet.item.instancesSet.item.ipAddress);
      changes.push({
            Action          : 'CREATE',
            Name            : server.name.toLowerCase() + '.' + config.route53.domainname + '.',
            Type            : 'A',
            Ttl             : '60',
            ResourceRecords : resourceRecords
      });
      var params = {
         HostedZoneId : config.route53.zoneid,
         Comment: 'Updating ' + server.name.toLowerCase() + '.' + config.route53.domainname,
         Changes: changes
      }
      r53.ChangeResourceRecordSets(params, function(err, data) {
        cb && cb(err, data);
      });
    });
  });
}

function cnameRoute53(server, cb) {
 getRoute53(server.name, function(err, r53data) {
   if (err) {
     return cb && cb(err, null);
   }
   var resourceRecords = new Array();
   if (r53data.ResourceRecords) {
     resourceRecords.push(r53data.ResourceRecords.ResourceRecord.Value);
     var changes = new Array();
     changes.push({
            Action          : 'DELETE',
            Name            : r53data.Name,
            Type            : r53data.Type,
            Ttl             : r53data.TTL,
            ResourceRecords : resourceRecords
     });
   }
   resourceRecords = new Array();
   resourceRecords.push(config.route53.cname);
   changes.push({
            Action          : 'CREATE',
            Name            : server.name.toLowerCase() + '.' + config.route53.domainname + '.',
            Type            : 'CNAME',
            Ttl             : '60',
            ResourceRecords : resourceRecords
   });
   var params = {
      HostedZoneId : config.route53.zoneid,
      Comment: 'Deleting ' + server.name.toLowerCase() + '.' + config.route53.domainname,
      Changes: changes
   }
   r53.ChangeResourceRecordSets(params, function(err, data) {
     cb && cb(err, data);
   });
  });
}

function deleteRoute53(servername, cb) {
 getRoute53(servername, function(err, r53data) {
   if (err) {
     return cb && cb(err, null);
   }
   var resourceRecords = new Array();
   if (r53data.ResourceRecords) {
     resourceRecords.push(r53data.ResourceRecords.ResourceRecord.Value);
     var changes = new Array();
     changes.push({
            Action          : 'DELETE',
            Name            : r53data.Name,
            Type            : r53data.Type,
            Ttl             : r53data.TTL,
            ResourceRecords : resourceRecords
     });
   }
   var params = {
      HostedZoneId : config.route53.zoneid,
      Comment: 'Deleting ' + servername.toLowerCase() + '.' + config.route53.domainname,
      Changes: changes
   }
   r53.ChangeResourceRecordSets(params, function(err, data) {
     cb && cb(err, data);
   });
  });
}

}

