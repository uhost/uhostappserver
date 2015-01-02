

module.exports = function(params) {

  var app = params.app;

app.all('/admin/*', function(req, res, next){
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.isAuthenticated() && req.user && req.user.isadmin) {
    return next();
  } else {
    res.status(401).send({err: 'Need to login'});
  }
});

// @TODO need to move somewhere
function verifyEmail(user, cb) {
  var buffer = new Array(32);
  uuid.v4(null, buffer, 0);
  user.verifySalt = uuid.unparse(buffer);
  return user.save(function (err) {
    if (err) {
      next(err);
    } else {
      var url = config.servername + "/#verify/" + user.email + "/" + hash(user.email, user.verifySalt);
      var textData = "Use this URL to verify your account: " + url;
      var htmlData = "Use this URL to verify your account: <a href=\"" + url + "\">" + url + "</a>";
      var message = {
        to: user.email,
        from: config.senderaddress,
        subject: 'Verify Account',
        text: textData,
        html: htmlData
      };
      transport.sendMail(message, function(err){
        cb(err, "Message Sent");
      });
    }
  });
}

app.get('/admin/accounts', function (req, res, next) {
  User.find({}, [], { sort: [['created', -1]]}, function(err, accounts) {
    if (err) {
      return next(err);
    }
    var results = new Array();
    for (var i=0; i < accounts.length; i++) {
      results.push(accounts[i].sanitizeUser());
    }
    res.send(results);
  });
});

app.get('/admin/account', function (req, res) {
  res.send(req.user.sanitizeUser());
});

app.get('/admin/account/:id', function (req, res, next) {
  User.findById(req.params.id, function (err, user) {
    if (err) {
      return next(err);
    }
    res.send(user.sanitizeUser());
  });
});

}
