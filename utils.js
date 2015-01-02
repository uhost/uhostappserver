var crypto = require('crypto');

exports.hash = function(passwd, salt) {
  return crypto.createHmac('sha256', salt).update(passwd).digest('hex');
};

exports.updateModel = function(body, model, callback) {
  for(var obj in body){
    if (body[obj] instanceof Array) {
      model[obj] = body[obj];
    } else if (body[obj] instanceof Object) {
      model[obj] = body[obj]._id;
    } else {
      model[obj] = body[obj];
    }
  }

  callback && callback(model);
}

exports.ArrayHasJsonEntry = function(arr, obj) {
  var key = Object.keys(obj)[0];
  var val = obj[key];
  for (var i=0; i < arr.length; i++) {
    if (arr[i][key] == val) {
      return true;
    }
  }
  return false;
}

exports.ArrayDeleteJsonEntry = function(arr, obj) {
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
}

exports.ArrayHasEntry = function(arr, val) {
  for (var i=0; i < arr.length; i++) {
    if (arr[i] == val) {
      return true;
    }
  }
  return false;
}

exports.ArrayDeleteEntry = function(arr, val) {
  for (var i=0; i < arr.length; i++) {
    if (arr[i] == val) {
      arr.splice(i, 1);
      return arr;
    }
  }
  return arr;
}

exports.checkEmail = function(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

