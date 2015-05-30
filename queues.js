var fs = require('fs');
var kue = require('kue')
var queueserver = require('config').Queueserver;

var queue = kue.createQueue();

process.once( 'SIGTERM', function ( sig ) {
  queue.shutdown(function(err) {
    console.log( 'Kue is shut down.', err||'' );
    process.exit( 0 );
  }, 5000 );
});

module.exports = function(params) {
  params.jobs = kue.createQueue();
  fs.readdirSync(__dirname + '/jobs/').forEach(function(name) {
    if (name.slice(-3) == '.js') {
      var job = require('./jobs/' + name);
      var jobname = name.split('.')[0];
      console.log("Loading job: " + jobname);
      job(params);
    }
  });

  kue.app.listen(queueserver.port);
  console.log("started kue at: http://localhost:" + queueserver.port);

  return params.jobs;
};

