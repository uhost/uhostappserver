/*jshint expr: true*/

var should = require('should'); 
var assert = require('assert');
var helper = require('../helper');

var stduser = helper.stduser;
var adminuser = helper.adminuser;

var chef = require('../../chef');

describe("Chef Users", function(){  
  it("create user", function(done){    
    chef.chefCreateUser(stduser, function(err, user){      
      if (err) {
        return done(err);
      }
      user.id.should.equal(stduser.username);

      done();    
    });  
  });

  it("get user", function(done){    
    chef.chefGetUser(stduser.username, function(err, user){      
      if (err) {
        return done(err);
      }
      user.id.should.equal(stduser.username);
      done();    
    });  
  });

  it("delete user", function(done){    
    chef.chefDeleteUser(stduser, function(err, user){      
      if (err) {
        return done(err);
      }
      done();    
    });  
  });
});

