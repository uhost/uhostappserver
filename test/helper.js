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
             role: "helios",
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
                                      "GOOGLE_CLIENT_SECRET": "8N7c2ZiyaFe7q0zHallJ_mw9",
                                      "GOOGLE_CLIENT_ID": "546325233748-9lcb25v3droeh0qiklvg32b7o7i7ktgd.apps.googleusercontent.com",
                                      "AWS_ACCESS_KEY_ID": "AKIAJ4CHXWVH6R3OVAIQ",
                                      "AWS_SECRET_ACCESS_KEY": "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",
                                      "EMAIL_USE_AWS": 1,
                                      "DEFAULT_FROM_EMAIL": "mark@markcallen.com",
                                      "DEFAULT_FROM_NAME": "'Mark Allen'",
                                      "NODEJS_CLIENT_ID": "5af82678e7a321b0",
                                      "NODEJS_CLIENT_SECRET": "NPWPekmKabSv",
                                      "NODEJS_APP_NAME": "helios01",
                                      "NODEJS_AUTHORIZE_URL": "http://vord01.getuhost.org/dialog/authorize",
                                      "NODEJS_TOKEN_URL": "http://vord01.getuhost.org/oauth/token",
                                      "NODEJS_BASE_URL": "http://vord01.getuhost.org"
                                    }
                                  }}]
           },

  projectservice: {
                    name: "mochaprojectservice"
                  }
};
