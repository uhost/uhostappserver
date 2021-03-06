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

if (chefconfig.enable) {
  chef.config(chefoptions);
}

module.exports = {


  chefCreateRole: function(role, cb) {
	            if (chefconfig.enable) {
                      if (role) {
                        chef.createRole(role, function(err, result) {
                          if (cb) { cb(err, result); }
                        });
                      } else {
                        if (cb) { cb("no role to create", null); }
                      }
  		    } else {
		      cb(null, null);
		    }
                  },

  chefDeleteRole: function(rolename, cb) {
	            if (chefconfig.enable) {
                      if (rolename) {
                        chef.deleteRole(rolename, function(err, result) {
                          if (cb) { cb(err, result); }
                        });
                      } else {
                        if (cb) { cb("no role to delete", null); }
		      }
       		    } else {
		      cb(null, null);
		    }
                  },

  chefGetRole: function(rolename, cb) {
	         if (chefconfig.enable) {
                   if (rolename) {
                     chef.getRole(rolename, function(err, result) {
                       if (cb) { cb(err, result); }
                     });
                   } else {
                     if (cb) { cb("no role to get", null); }
                   }
		 } else {
	           cb(null, {});
		 }
               },

  chefUpdateRole: function(rolename, role, cb) {
	            if (chefconfig.enable) {
                      if (role) {
                        chef.editRole(rolename, role, function(err, result) {
                          if (cb) { cb(err, result); }
                        });
                      } else {
                        if (cb) { cb("no role to delete", null); }
                      }
       		    } else {
		      cb(null, null);
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
	            if (chefconfig.enable) {
                      if (user) {
                        chef.createDataBagItem('users', chefUser(user), function(err, result) {
                          if (cb) { cb(err, result); }
                        });
                      } else {
                        if (cb) { cb("no user to create", null); }
                      }
		    } else {
	              cb(null, null);
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

  chefRole: function(name, description, runlist, defaultattributes, overrideattributes, envrunlists) {
              var run_list = runlist || [];
              var default_attributes = defaultattributes || {};
              var override_attributes = overrideattributes || {};
              var env_run_lists = envrunlists || {};
              var role = {
                "name": name,
                "description": description,
                "run_list": run_list,
                "default_attributes": default_attributes,
                "override_attributes": override_attributes,
                "env_run_lists": env_run_lists,
                "chef_type": "role",
                "json_class": "Chef::Role"
              };

              return role;
            }

};

