var LocalStrategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;

// Authentication

module.exports = function(params) {

var app = params.app;
var User = params.models.user;
var passport = params.passport;

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  User.findOne({username: username}, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { 
        return done(err); 
      }
      if (!user) {
        console.log("Unknown user: " + user);
        return done(null, false, { message: 'Unknown user' });
      }
      if (! user.isPasswordValid(password)) {
        console.log("Invalid password: " + password);
        return done(null, false, { message: 'Invalid password' });
      }
      return done(null, user);
    });
  }
));

passport.use(new BasicStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { 
        return done(err); 
      }
      if (!user) { 
        console.log("Unknown user: " + user);
        return done(null, false, { message: 'Unknown user' });
      }
      if (! user.isPasswordValid(password)) {
        console.log("Invalid password: " + password);
        return done(null, false, { message: 'Invalid password' });
      }
      return done(null, user);
    });
  }
));

app.all('/auth/*', function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

app.post('/auth/login', function(req, res, next) {
  var successUrl = (req.body.successUrl != null ? req.body.successUrl : '/#validlogin');
  var failureUrl = (req.body.failureUrl != null ? req.body.failureUrl : '/#invalidlogin');
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) { return res.redirect(failureUrl) }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect(successUrl);
     });
  })(req, res, next);
});

app.get('/auth/logout', function(req, res){
  req.logOut();
  res.redirect('/');
});

app.post('/auth/forgottenPassword', function (req, res, next){
  User.find({username: req.body.username}, function(err, user) {
    if (err) {
      next(err);
    } else if (user == null || user.length != 1 || user[0].username != req.body.username ) {
      next("Can not find user for: " + req.body.username);
    } else {
      var buffer = new Array(32);
      uuid.v4(null, buffer, 0);
      user[0].recoverSalt = uuid.unparse(buffer);
      return user[0].save(function (err) {
        if (err) {
          next(err); 
        } else {
          var url = config.servername + "/#recover/" + user[0].username + "/" + hash(user[0].username, user[0].recoverSalt);
          var textData = "Use this URL to recover your account: " + url;
          var htmlData = "Use this URL to recover your account: <a href=\"" + url + "\">" + url + "</a>";
          var message = {
            to: user[0].email,
            from: config.senderaddress,
            subject: 'Forgotten Password',
            text: textData,
            html: htmlData
          };
          transport.sendMail(message, function(err){
            if (err) {
              return next(err);
            } else 
            return res.send("Message sent");
          });
        }
      });
    }
  });
});

app.post('/auth/recoverAccount', function (req, res, next){
  User.find({username: req.body.username}, function(err, user) {
    if (err) {
      next(err);
    } else if (user == null || user.length != 1 || user[0].username != req.body.username ) {
      next("Can not find user for: " + req.body.username);
    } else {
      if(req.body.hash === hash(req.body.username, user[0].recoverSalt)) {
        user[0].setPassword(req.body.password);
        user[0].recoverSalt = "";
        return user[0].save(function (err) {
          if (err) {
            next(err); 
          } else {
            next();
          }
        });
      } else {
        next("Can not verify account.");
      }
    }
  });
}, passport.authenticate('local', { successRedirect: '/#validlogin',
                                   failureRedirect: '/#invalidlogin',
                                   failureFlash: false }) );


}
