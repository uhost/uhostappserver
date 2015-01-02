var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var fs = require('fs');

describe('Admin API', function() {
    var url = "http://localhost:8888";
    before(function(done) {
        done();
    });

    var compimageid;
    describe('Account', function() {
        it('list all accounts', function(done) {
            request(url)
            .get('/admin/accounts')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                res.body.should.containDeep([{'_id': compimageid}]);
                done();
            });
        });
        it('list a users account', function(done) {
            request(url)
            .get('/admin/account/' + useraccount)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                res.body.should.containEql({'_id': compimageid});
                done();
            });
        });
    });

});
