var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var fs = require('fs');


describe('Account API', function() {
    var url = "http://localhost:8888";
    before(function(done) {
        done();
    });

    var compimageid;
    describe('Account', function() {
        /*
           it('upload a comparision image', function(done) {
           request(url)
           .post('/api/comp')
           .attach('FileInput', 'test/images/dog.jpeg')
           .expect('Content-Type', /json/)
           .expect(200) //Status code
           .end(function(err, res) {
           if (err) {
           throw err;
           }
        // this is should.js syntax, very clear
        res.body.should.have.property('_id');
        res.body.created.should.not.equal(null);
        compimageid = res.body._id;
        done();
        });
        });
         */
        it('list current users account', function(done) {
            request(url)
            .get('/api/account')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                res.body.should.containEql({'_id': compimageid});
                done();
            });
        });
        it('authorization required for account', function(done) {
            request(url)
            .get('/api/account')
            .expect(401)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                res.body.should.have.keys('err');
                done();
            });
    });
  });
});
