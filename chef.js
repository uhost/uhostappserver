var ChefApi = require("chef-api");
var chef = new ChefApi();
var path = require('path');

var chefoptions = {
  user_name: "uhostadmin",
  key_path: path.resolve(__dirname, 'chef/.chef/uhost.pem'),
  url: "http://127.0.0.1:8889",
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
                      if (cb) { cb(null, "no role to create"); }
                    }
                  },

  chefDeleteRole: function(rolename, cb) {
                    if (rolename) {
                      chef.deleteRole(rolename, function(err, result) {
                        if (cb) { cb(err, result); }
                      });
                    } else {
                      if (cb) { cb(null, "no role to delete"); }
                    }
                  },

  chefGetRole: function(rolename, cb) {
                 if (rolename) {
                   chef.getRole(rolename, function(err, result) {
                     if (cb) { cb(err, result); }
                   });
                 } else {
                   if (cb) { cb(null, "no role to get"); }
                 }
               },

  chefUpdateRole: function(rolename, role, cb) {
                    if (role) {
                      chef.editRole(rolename, role, function(err, result) {
                        if (cb) { cb(err, result); }
                      });
                    } else {
                      if (cb) { cb(null, "no role to delete"); }
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
                      if (cb) { cb(null, "no user to create"); }
                    }
                  },

  chefUpdateUser: function(user, cb) {
                    if (user) {
                      chef.editDataBagItem('users', user.username, chefUser(user), function(err, result) {
                        if (cb) { cb(err, result); }
                      });
                    } else {
                      if (cb) { cb(null, "no user to update"); }
                    }
                  },

  chefDeleteUser: function(user, cb) {
                    if (user) {
                      chef.deleteDataBagItem('users', user.username, function(err, result) {
                        if (cb) { cb(err, result); }
                      });
                    } else {
                      if (cb) { cb(null, "no user to delete"); }
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

