var ChefApi = require("chef-api");
var chef = new ChefApi();
var path = require('path');
var chefconfig = require('config').Chef;

var chefoptions = {
  user_name: "uhostadmin",
  key_path: path.resolve(__dirname, chefconfig.validationpem),
  url: chefconfig.chef_server_url,
  ca: null
};

function chefUser(user) {
  var chefuser = {};
  chefuser.id = user.username;
  chefuser.ssh_keys = user.pubkey;
  chefuser.comment = user.firstname + " " + user.lastname + " (" + user.email + ")";

  return chefuser;
}

chef.config(chefoptions);

module.exports = {


  chefCreateRole: function(role, cb) {
                    if (role) {
                      chef.createRole(role, function(err, result) {
                        if (cb) { cb(err, result); }
                      });
                    } else {
                      if (cb) { cb("no role to create", null); }
                    }
                  },

  chefDeleteRole: function(rolename, cb) {
                    if (rolename) {
                      chef.deleteRole(rolename, function(err, result) {
                        if (cb) { cb(err, result); }
                      });
                    } else {
                      if (cb) { cb("no role to delete", null); }
                    }
                  },

  chefGetRole: function(rolename, cb) {
                 if (rolename) {
                   chef.getRole(rolename, function(err, result) {
                     if (cb) { cb(err, result); }
                   });
                 } else {
                   if (cb) { cb("no role to get", null); }
                 }
               },

  chefUpdateRole: function(rolename, role, cb) {
                    if (role) {
                      chef.editRole(rolename, role, function(err, result) {
                        if (cb) { cb(err, result); }
                      });
                    } else {
                      if (cb) { cb("no role to delete", null); }
                    }
                  },

  chefDeleteNode: function(nodename, cb) {
                    if (nodename) {
                      chef.deleteNode(nodename, function(err, result) {
                        if (err) { 
                          if (cb) { return cb(err, result); }
                        } else {
                          chef.deleteClient(nodename, function(err, result) {
                            if (cb) { return cb(err, result); }
                          });
                        }
                      });
                    } else {
                      if (cb) { cb("no node to delete", null); }
                    }
                  },



  chefUser: function(user) {
              return chefUser(user);
            },

  chefCreateUser: function(user, cb) {
                    if (user) {
                      chef.createDataBagItem('users', chefUser(user), function(err, result) {
                        if (cb) { cb(err, result); }
                      });
                    } else {
                      if (cb) { cb("no user to create", null); }
                    }
                  },

  chefUpdateUser: function(user, cb) {
                    if (user) {
                      chef.editDataBagItem('users', user.username, chefUser(user), function(err, result) {
                        if (cb) { cb(err, result); }
                      });
                    } else {
                      if (cb) { cb( "no user to update", null); }
                    }
                  },

  chefGetUser: function(username, cb) {
                 if (username) {
                   chef.getDataBagItem('users', username, function(err, result) {
                     if (cb) { cb(err, result); }
                   });
                 } else {
                   if (cb) { cb("no username to get", null); }
                 }
               },

  chefDeleteUser: function(user, cb) {
                    if (user) {
                      chef.deleteDataBagItem('users', user.username, function(err, result) {
                        if (cb) { cb(err, result); }
                      });
                    } else {
                      if (cb) { cb("no user to delete", null); }
                    }
                  },

  chefRole: function(name) {
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

};

