var crypto = require('crypto');
var uuid = require('node-uuid');
var email = require('config').Email;
var server = require('config').Server;
var aws = require('config').AWS;

// Setup SMTP
//@TODO: need to change this to something that doesn't require AWS keys for testing
var nodemailer = require("nodemailer");
var ses = require('nodemailer-ses-transport');
var transport = nodemailer.createTransport(ses({
  accessKeyId: aws.awsAccessKey,
  secretAccessKey: aws.awsSecretKey
}));

function hash(passwd, salt) {
  return crypto.createHmac('sha256', salt).update(passwd).digest('hex');
}


module.exports = {

  hash: function(passwd, salt) {
    return hash(passwd, salt);
},

  updateModel: function(body, model, callback) {
  for(var obj in body){
    if (body[obj] instanceof Array) {
      model[obj] = body[obj];
    } else if (body[obj] instanceof Object) {
      model[obj] = body[obj]._id;
    } else {
      model[obj] = body[obj];
    }
  }

  if (callback) { callback(model); }
},

  ArrayHasJsonEntry: function(arr, obj) {
  var key = Object.keys(obj)[0];
  var val = obj[key];
  for (var i=0; i < arr.length; i++) {
    if (arr[i][key] == val) {
      return true;
    }
  }
  return false;
},

  ArrayDeleteJsonEntry: function(arr, obj) {
  var key = Object.keys(obj)[0];
  var val = obj[key];
  for (var i=0; i < arr.length; i++) {
    //console.log(arr[i][key] + ", " + val);
    if (arr[i][key] == val) {
      arr.splice(i, 1);
      return arr;
    }
  }
  return arr;
},

  ArrayHasEntry: function(arr, val) {
  for (var i=0; i < arr.length; i++) {
    if (arr[i] == val) {
      return true;
    }
  }
  return false;
},

  ArrayDeleteEntry: function(arr, val) {
  for (var i=0; i < arr.length; i++) {
    if (arr[i] == val) {
      arr.splice(i, 1);
      return arr;
    }
  }
  return arr;
},

checkEmail: function(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
},

verifyEmail: function(user, cb) {
  var buffer = new Array(32);
  uuid.v4(null, buffer, 0);
  user.verifySalt = uuid.unparse(buffer);
  return user.save(function (err) {
    if (err) {
      if (cb) { cb(err, null); }
    } else {
      var url = server.servername + "/#verify/" + user.email + "/" + hash(user.email, user.verifySalt);
      var textData = "Use this URL to verify your account: " + url;
      var htmlData = "Use this URL to verify your account: <a href=\"" + url + "\">" + url + "</a>";
      var message = {
        to: user.email,
        from: email.senderaddress,
        subject: 'Verify Account',
        text: textData,
        html: htmlData
      };
      transport.sendMail(message, function(err){
        cb(err, "Message Sent");
      });
    }
  });
},

fullnameToRole: function(name) {
  if (name) {
    name = name.replace(/\./g, '_');
  }

  return name;
}

};
