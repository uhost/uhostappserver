var models = require('../models')();

var url = "http://localhost:8888";

module.exports = {
  url: url,
  models: models,

  stduser: {
             username: "mochatest",
             password: "testpw",
             firstname: "Mocha",
             lastname: "Test",
             verifiedEmail: true,
             email: "mochatest@markcallen.com"
           },

  adminuser: {
               username: "mochaadmin",
               password: "testpw",
               verifiedEmail: true,
               email: "mochaadmin@markcallen.com",
               isadmin: true
             },

  createUser: function(u, cb) {
                var user = new models.user(u);
                user.setPassword(u.password);
                user.save(function(err) {
                  if (cb) { cb(err, user); }
                });
              },

  deleteUser: function(u, cb) {
                models.user.findByIdAndRemove(u.id, function(err, user) {
                  if (cb) { cb(err, user); }
                });
              },

  project: {
          name: "mochaproject",
          fullname: "mochaproject.getuhost.org"
        },

  awsplatform: {
                 name: "mochaaws",
                 provider: "aws"
               },

  service: {
             name: "mochaservice",
             image: "ami-12345678",
             role: "mocharole",
             runlist: ["recipe[python::default]", "recipe[postgresql::server]", "recipe[helios::default]", "recipe[helios::upstart]", "recipe[helios::nginx]"],
             defaultattributes: [{helios: {
                                   hostname: "helios01.getuhost.org",
                                   google: [ 
                                     { user_id: "mark@markcallen.com", info_name: "Mark C Allen" }, {user_id: "csinger@interspect.com", info_name: "Andrew Csinger"} 
                                   ]}
                                 }],
             overrideattributes: [{helios: {
                                    env: {
                                      "URL_HOST": "http://helios01.getuhost.org/",
                                      "EMAIL_USE_AWS": 1,
                                      "DEFAULT_FROM_EMAIL": "mark@markcallen.com",
                                      "DEFAULT_FROM_NAME": "'Mark Allen'",
                                    }
                                  }}]
           },

  projectservice: {
                    name: "mochaprojectservice"
                  }
};
