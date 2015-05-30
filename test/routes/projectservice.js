var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var superagent = require('superagent');
var fs = require('fs');

var helper = require('../helper');

var adminuser = helper.adminuser;
var stduser = helper.stduser;

//@TODO need to test that a user can not access services they do not own

describe('ProjectService API', function() {

  var agent = superagent.agent();

  before(function(done) {
    helper.createUser(adminuser, function(err, user) {
      adminuser.id = user.id;
      done();
    });
  });

  describe('ProjectService', function() {
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
    it('create a new project', function(done) {
      request(helper.url)
      .post('/api/project')
      .send({name: helper.project.name})
      .expect(200) //Status code
      .auth(stduser.username, stduser.password)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        // this is should.js syntax, very clear
        res.body.should.have.property('_id');
        helper.projectservice.projectid = res.body._id;

        done();
      });
    });
    it('create a new service', function(done) {
      request(helper.url)
      .post('/api/service')
      .send(helper.service)
      .expect(200) //Status code
      .auth(stduser.username, stduser.password)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        // this is should.js syntax, very clear
        res.body.should.have.property('_id');
        helper.projectservice.serviceid = res.body._id;

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
        helper.projectservice.platformid = res.body._id;

        done();
      });
    });
    it('create a new projectservice', function(done) {
      request(helper.url)
      .post('/api/project/' + helper.projectservice.projectid + '/service/' + helper.projectservice.serviceid)
      .send(helper.projectservice)
      .expect(200) //Status code
      .auth(stduser.username, stduser.password)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        // this is should.js syntax, very clear
        res.body.should.have.property('_id');
        helper.projectservice.id = res.body._id;

        done();
      });
    });
    it('list projectservices - httpauth', function(done) {
      request(helper.url)
      .get('/api/project/' + helper.projectservice.projectid + '/services')
      .expect(200)
      .auth(stduser.username, stduser.password)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.containDeep([{'serviceid': helper.projectservice.serviceid}]);
        res.body.should.containDeep([{'projectid': helper.projectservice.projectid}]);
        res.body.should.containDeep([{'platformid': helper.projectservice.platformid}]);
        res.body.should.containDeep([{'userid': stduser.id}]);
        done();
      });
    });
    it('list projectservice - httpauth', function(done) {
      request(helper.url)
      .get('/api/project/' + helper.projectservice.projectid + '/service/' + helper.projectservice.serviceid)
      .expect(200)
      .auth(stduser.username, stduser.password)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.containDeep({'serviceid': helper.projectservice.serviceid});
        res.body.should.containDeep({'projectid': helper.projectservice.projectid});
        res.body.should.containDeep({'platformid': helper.projectservice.platformid});
        res.body.should.containDeep({'userid': stduser.id});
        done();
      });
    });
    it('authorization required for projectservices', function(done) {
      request(helper.url)
      .get('/api/project/' + helper.projectservice.projectid + '/services')
      .expect(401)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.should.have.keys('err');
        done();
      });
    });
    it('delete a projectservice', function(done) {
      request(helper.url)
      .delete('/api/project/' + helper.projectservice.projectid + '/service/' + helper.projectservice.serviceid)
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
    it('delete a platform', function(done) {
      request(helper.url)
      .delete('/api/platform/' + helper.projectservice.platformid)
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
    it('delete a service', function(done) {
      request(helper.url)
      .delete('/api/service/' + helper.projectservice.serviceid)
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
    it('delete a project', function(done) {
      request(helper.url)
      .delete('/api/project/' + helper.projectservice.projectid)
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


