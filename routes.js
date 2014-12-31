var fs = require('fs');

module.exports = function(params) {

  fs.readdirSync(__dirname + '/routes/').forEach(function(name) {
//    if (name.slice(-3) == '.js') {
      var route = require('./routes/' + name);
      route(params);
//    }
  });
}
