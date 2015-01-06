// boot requests (unauthenicated)

var utils = require('../utils');

module.exports = function(params) {

  var app = params.app;


function getFullname(instanceid, cb) {
  Server.find({instance: instanceid}, function(err, servers) {
    if (err) {
      return cb && cb(err, null);
    }
    if (servers.length > 0) {
      return cb && cb(null, servers[0].fullname);
    }
    Project.find({instance: instanceid}, function(err, projects) {
      if (err) {
        return cb && cb(err, null);
      }
      if (projects.length > 0) {
        return cb && cb(null, projects[0].fullname);
      }
      return cb && cb("Can't find Project or Server for instanceid", null)
    });
  });
}

app.get('/boot/client.rb/:ip', function(req, res, next) {
  ec2.DescribeInstances({"Filter": [{"Name": "private-ip-address", "Value": req.params.ip}]}, function(err, result) {
    if (err) {
      return next(err);
    }
    fmt.dump(result, 'Result');
    result = result.Body.DescribeInstancesResponse;
    if (result && result.reservationSet && result.reservationSet.item && result.reservationSet.item.instancesSet && result.reservationSet.item.instancesSet.item && result.reservationSet.item.instancesSet.item.instanceId) {
      getFullname(result.reservationSet.item.instancesSet.item.instanceId, function (err, fullname) {
        if (err) {
          return next(err);
        }
        var response = "log_level        :info\n" +
                 "log_location     STDOUT\n" +
                 "chef_server_url  \"https://chef.poweredbypurple.ca\"\n" +
                 "validation_client_name \"chef-validator\"\n" +
                 "node_name \"" + result.reservationSet.item.instancesSet.item.instanceId + "\"\n" +
                 "environment \"" + config.chef.environment + "\"\n";
        fmt.dump(response, 'response');
        res.send(response);
      });
    } else {
      return next("Cound not find instance for ip: " + req.params.ip);
    }
  });
});

app.get('/boot/first-boot.json/:ip', function(req, res, next) {
  ec2.DescribeInstances({"Filter": [{"Name": "private-ip-address", "Value": req.params.ip}]}, function(err, result) {
    if (err) {
      return next(err);
    }
    fmt.dump(result, 'Result');
    result = result.Body.DescribeInstancesResponse;
    if (result && result.reservationSet && result.reservationSet.item && result.reservationSet.item.instancesSet && result.reservationSet.item.instancesSet.item && result.reservationSet.item.instancesSet.item.instanceId) {
      getFullname(result.reservationSet.item.instancesSet.item.instanceId, function (err, fullname) {
        if (err) {
          return next(err);
        }
        var response = {};
        response["run_list"] = [];
        response["run_list"][0] = "role[" + utils.fullnameToRole(fullname) + "]";
        res.send(JSON.stringify(response));
      });
    }
  });
});



};
