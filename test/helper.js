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

  proj: {
          name: "mochaproject",
          fullname: "mochaproject.getuhost.org"
        },

  awsplatform: {
                 name: "mochaaws",
                 provider: "aws"
               }
};
