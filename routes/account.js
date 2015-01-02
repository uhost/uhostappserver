var utils = require('../utils');

module.exports = function(params) {

  var app = params.app;
  var passport = params.passport;
  var User = params.models.user;

app.post('/api/account', function (req, res, next) {
    var user = new User();
    //@TODO move this to the user model
    if (req.body.password == null || req.body.password.length == 0) {
      return next("no password supplied");
    }
    user.setPassword(req.body.password);

    utils.updateModel(req.body, user, function(user) {
      if (! user.checkEmail()) {
        return next(user.email + " is not a valid email address.");
      }
      user.save(function(err) {
        if(err) { 
          if (11000 === err.code) {
            next("Email " + req.body.email + " already taken");
          } else {
            next(err); 
          } 
        } else { 
          chefCreateUser(user, function(err, result) {
            if (err) {
              //todo: rollback user on error
              return next(err);
            }
            verifyEmail(user, function(err, result) {
              if (err) {
                console.log(err);
              } 
              next();
            });
          });
        }
      });
    });
}, passport.authenticate('local', { successRedirect: '/#validlogin',
                                   failureRedirect: '/#invalidlogin',
                                   failureFlash: false }) );

app.get('/api/account', function (req, res) {
  res.send(sanitizeUser(req.user));
});

app.get('/api/account/:id', function (req, res) {
  res.send(req.user.sanitizeUser());
});

app.put('/api/account/:id', function (req, res, next){
  User.findById(req.params.id, function (err, user) {
    if (req.body.username) {
      return next("Can't change username.");
    }
    if (req.body.password) {
      return next("Can't change password via account using /api/changePassword.");
    }
    if (req.body.email && !checkEmail(req.body.email)) {
      return next(req.body.email + " is not a valid email address.");
    }
    if (user.email != req.body.email) {
      user.verifiedEmail = false;
    }
    utils.updateModel(req.body, user, function(user) {
      user.save(function (err) {
        if (err) {
          if (11001 === err.code) {
            return next("Email " + req.body.email + " already used");
          } 
          return next(err); 
        } else {
          chefUpdateUser(user, function(err, result) {
            if (err) {
              return next(err);
            }
            return res.send(user.sanitizeUser());
          });
        }
      });
    });
  });
}); 

// @TODO move to the auth api
app.post('/api/changePassword', function (req, res, next){
    var user = req.user;
    if (user.isPasswordValid(req.body.oldPassword)) {
      user.setPassword(req.body.newPassword);
      return user.save(function (err) {
        if (err) {
          next(err); 
        } else {
          return res.send(user.sanitizeUser());
        }
      });
    } else {
      next("Invalid Old Password");
    }
}); 


app.get('/api/sendVerifyEmail', function (req, res, next) {
  var user = req.user;
  verifyEmail(user, function(err, result) {
    if (err) {
      next(err);
    } else {
      console.log(result);
      var output = { };
      output.SendEmailResult = result.SendEmailResult;
      output.email = req.user.email;
      return res.send(output);
    }
  });
});

app.post('/api/verifyEmail', function (req, res, next) {
  var user = req.user;
  if(req.body.hash === hash(req.body.email, user.verifySalt)) {
    user.verifiedEmail = true;
    user.verifySalt = "";
    return user.save(function (err) {
      if (err) {
        next(err);
      } else {
        return res.send('Account verified');
      }
    });
  } else {
    next("Can not verify email.");
  }
});

}

