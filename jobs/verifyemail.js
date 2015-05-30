var utils = require('../utils');

module.exports = function(params) {
  var jobs = params.jobs;

  jobs.process('verifyemail', function(job, done){
    utils.verifyEmail(job.data.user, function(err, result) {
      if (err) {
        console.log(err);
      }
      done();
    });
  });

};
