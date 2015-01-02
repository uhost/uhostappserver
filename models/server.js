
module.exports = function(params) {

  var mongoose = params.mongoose;
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

var ServerSchema = new Schema({
  name: {type: String, required: true, unique: true},
  fullname: {type: String, required: true},
  projectid: {type: ObjectId, required: true},
  //services: { nodejs: [NodejsServiceSchema] },
  instance: {type: String},
  instance_type: {type: String},
  created: {type: Date, default: Date.now}
});

mongoose.model('Server', ServerSchema);
var Server = mongoose.model('Server');

var ServerActionSchema = new Schema({
  serverid: {type: ObjectId, required: true},
  instance: {type: String},
  userid: {type: ObjectId},
  action: {type: String, required: true},
  created: {type: Date, default: Date.now}
});

mongoose.model('ServerAction', ServerActionSchema);
var ServerAction = mongoose.model('ServerAction');

}
