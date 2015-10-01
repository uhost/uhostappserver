var utils = require('../utils');
var chefconfig = require('config').Chef;
var fs = require('fs');
var awsconfig = require('config').AWS;
var dnsconfig = require('config').DNS;

module.exports = function(params) {
  var jobs = params.jobs;
  var AWS = params.AWS;
  var ec2 = new AWS.EC2(); 
  var ProjectService = params.models.projectservice;

  var validationpem = (chefconfig.enable ? fs.readFileSync(__dirname + "/../" + chefconfig.validationpem).toString().split('\n') : "");

  jobs.process('createservice', function(job, done){
    //console.log(job.data.projectservice);
    /*
    ec2.describeVpcs({}, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     console.log(data);           // successful response
    });
    */

    var nodename = job.data.projectservice.name + "-" + job.data.projectservice.serverids.length+1;

    var imageId = (job.data.projectservice.serviceid.image ? job.data.projectservice.serviceid.image : awsconfig.ec2.ImageId);

    var instanceType = (job.data.projectservice.instancesize ? job.data.projectservice.instancesize : awsconfig.ec2.InstanceType);

    var ec2params = {
      ImageId: imageId,
      InstanceType: instanceType,
      MinCount: 1, 
      MaxCount: 1,
      NetworkInterfaces: [{
        DeviceIndex: 0,
	AssociatePublicIpAddress: true,
	SubnetId: awsconfig.ec2.SubnetId,
	Groups: awsconfig.ec2.SecurityGroupIds,
      }],
      KeyName: awsconfig.ec2.KeyName
    };


    var userdata = [];
    if (job.data.projectservice.serviceid.operatingsystem == "windows") {
      var runlist = ['"role[uhost-windows]"', '"role[' + job.data.projectservice.serviceid.role + ']"'];
      userdata.push('<powershell>');
      userdata.push('write-output "Running User Data Script"');
      userdata.push('write-host "(host) Running User Data Script"');
      userdata.push('$chef_download_url = "https://opscode-omnibus-packages.s3.amazonaws.com/windows/2008r2/x86_64/chef-client-12.3.0-1.msi"');
      userdata.push('Write-Host "Downloading $chef_download_url"');
      userdata.push('(New-Object System.Net.WebClient).DownloadFile($chef_download_url, "C:\\Windows\\Temp\\chef-client-12.3.0-1.msi")');
      userdata.push('cmd /c msiexec /qn /i C:\\Windows\\Temp\\chef-client-12.3.0-1.msi  ADDLOCAL="ChefClientFeature"');
      userdata.push('');
      userdata.push('$validationpem = @"');
      validationpem.forEach(function(line) {
        userdata.push(line);
      });
      userdata.push('"@');
      userdata.push('$validationpem | Out-File C:\\chef\\validation.pem -encoding "ascii"');
      userdata.push('');
      userdata.push('$clientrb = @"');
      userdata.push('log_level        :info');
      userdata.push('log_location     STDOUT');
      userdata.push('chef_server_url  "' + chefconfig.chef_server_url + '"');
      userdata.push('validation_client_name "' + chefconfig.validation_client_name + '"');
      userdata.push('node_name "' + nodename + '"');
      userdata.push('ssl_verify_mode :verify_none');
      userdata.push('"@');
      userdata.push('$clientrb | Out-File C:\\chef\\client.rb -encoding "ascii"');
      userdata.push('');
      userdata.push('$firstbootjson = @"');
      userdata.push('{');
      userdata.push('  "servername": "' + nodename + "." + dnsconfig.domainname + '",');
      userdata.push('  "run_list": [' + runlist + ']');
      userdata.push('}');
      userdata.push('"@');
      userdata.push('$firstbootjson | Out-File C:\\chef\\first-boot.json -encoding "ascii"');
      userdata.push('');
      userdata.push('cmd /c c:\\opscode\\chef\\bin\\chef-client -j C:\\chef\\first-boot.json -L c:\\chef\\first-boot.log');
      userdata.push('</powershell>');
    } else {
      var runlist = ['"role[uhost]"', '"role[' + job.data.projectservice.serviceid.role + ']"'];
      userdata.push('#!/bin/bash');
      userdata.push('');
      userdata.push('set -x');
      userdata.push('');
      userdata.push('wget -P /tmp https://www.chef.io/chef/install.sh');
      userdata.push('bash /tmp/install.sh -v 12.3.0-1');
      userdata.push('mkdir -p /etc/chef');
      userdata.push('cat << EOF | sudo tee /etc/chef/validation.pem > /dev/null');
      validationpem.forEach(function(line) {
        userdata.push(line);
      });
      userdata.push('EOF');
      userdata.push('');
      userdata.push('cat << EOF | sudo tee /etc/chef/client.rb > /dev/null');
      userdata.push('log_level        :info');
      userdata.push('log_location     STDOUT');
      userdata.push('chef_server_url  "' + chefconfig.chef_server_url + '"');
      userdata.push('validation_client_name "' + chefconfig.validation_client_name + '"');
      userdata.push('node_name "' + nodename + '"');
      userdata.push('ssl_verify_mode :verify_none');
      userdata.push('EOF');
      userdata.push('');
      userdata.push('cat << EOF | sudo tee /etc/chef/first-boot.json > /dev/null');
      userdata.push('{');
      userdata.push('  "servername": "' + nodename + "." + dnsconfig.domainname + '",');
      userdata.push('  "run_list": [' + runlist + ']');
      userdata.push('}');
      userdata.push('EOF');
      userdata.push('');
      userdata.push('mkdir -p /etc/chef/ohai/hints');
      userdata.push('touch /etc/chef/ohai/hints/ec2.json');
      userdata.push('');
      userdata.push('sudo chef-client -j /etc/chef/first-boot.json');
    }

    console.log(userdata.join('\n')); 

    ec2params.UserData = new Buffer(userdata.join('\n')).toString('base64');

    //console.log(ec2params)
    ec2.runInstances(ec2params, function(err, data) {
      if (err) { 
        console.log("Could not create instance", err);
        done();
      } else {
        var instanceId = data.Instances[0].InstanceId;
        console.log("Created instance", instanceId);
        //console.log(data.Instances[0]);
  
        // Add tags to the instance
        ec2params = {Resources: [instanceId], Tags: [
          {Key: 'Name', Value: nodename}
        ]};
        ec2.createTags(ec2params, function(err) {
        console.log("Tagging instance", err ? "failure" : "success");
  
          var createserveractionjob = jobs.create('createserveraction', { projectservice: job.data.projectservice, instance: instanceId, nodename: nodename }).save( function(err) {
            if (err) {
              console.log(err);
            }
            console.log(createserveractionjob.type + ": " + createserveractionjob.id);
            done();
          });     
        });
      }
    });
  });

};
