
module.exports = function(params) {

  var mongoose = params.mongoose;
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var ServerSchema = new Schema({
    name: {type: String, required: true, unique: true},
    fullname: {type: String, required: true},
    projectid: {type: ObjectId, required: true},
    platformid: {type: ObjectId, required: true},
    serviceid: {type: ObjectId, required: true},
    instance: {type: String},
    instance_type: {type: String},
    created: {type: Date, default: Date.now}
  });

  mongoose.model('Server', ServerSchema);
  var Server = mongoose.model('Server');

  return Server;

};
