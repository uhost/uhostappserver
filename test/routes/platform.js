var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var superagent = require('superagent');
var fs = require('fs');

var helper = require('../helper');

var adminuser = helper.adminuser;
var stduser = helper.stduser;

//@TODO need to test that a user can not access platforms they do not own

describe('Project API', function() {

  var agent = superagent.agent();

  before(function(done) {
    helper.createUser(adminuser, function(err, user) {
      adminuser.id = user.id;
      done();
    });
  });

  describe('Platform', function() {
    it('create a new account', function(done) {
      request(helper.url)
      .post('/api/account')
      .send(stduser)
      .expect(200) //Status code
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        // this is should.js syntax, very clear
        res.body.should.have.property('_id');
        stduser.id = res.body._id;

        done();
      });
    });
    it('create a new platform', function(done) {
      request(helper.url)
      .post('/api/platform')
      .send(helper.awsplatform)
      .expect(200) //Status code
      .auth(stduser.username, stduser.password)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        // this is should.js syntax, very clear
        res.body.should.have.property('_id');
        helper.awsplatform.id = res.body._id;

        done();
      });
    });
    it('list platforms - httpauth', function(done) {
      request(helper.url)
      .get('/api/platforms')
      .expect(200)
      .auth(stduser.username, stduser.password)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.containDeep([{'_id': helper.awsplatform.id}]);
        res.body.should.containDeep([{'userid': stduser.id}]);
        done();
      });
    });
    it('authorization required for platforms', function(done) {
      request(helper.url)
      .get('/api/platforms')
      .expect(401)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.have.keys('err');
        done();
      });
    });
    it('delete a platform', function(done) {
      request(helper.url)
      .delete('/api/platform/' + helper.awsplatform.id)
      .expect(200)
      .auth(stduser.username, stduser.password)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        //@TODO: look for something
        done();
      });
    });
    it('delete a user account', function(done) {
      request(helper.url)
      .delete('/admin/account/' + stduser.id)
      .expect(200)
      .auth(adminuser.username, adminuser.password)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        //@TODO: look for something
        done();
      });
    });
  });

  after(function(done) {
    helper.deleteUser(adminuser, function(err, user){      
      done();    
    });  
  });
});


