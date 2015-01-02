var connectroles = require('connect-roles');

module.exports = function() {

connectroles.use(function (req, action) {
  if (! req.isAuthenticated()) return action === 'anonymous';

  // Check to see if the user has the requested action as a role
  if (action instanceof Array) {
    if (req.user.roles) {
      for (var i in action) {
        for (var j in req.user.roles) {
          if (action[i] == req.user.roles[j]) {
            return true;
          }
        }
      }
    }
  }
});

//optionally controll the access denied page displayed
connectroles.setFailureHandler(function (req, res, action){
  var accept = req.headers.accept || '';
  res.status(403);
  if (~accept.indexOf('html')) {
    res.render('access-denied', {action: action});
  } else {
    res.send('Access Denied - You do not have permission to: ' + action);
  }
});

return connectroles;

}
