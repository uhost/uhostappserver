
module.exports = function(params) {

  var mongoose = params.mongoose;
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var ServiceSchema = new Schema({
    userid: {type: Object, required: true},
    name: {type: String, required: true},
    role: {type: String},
    runlist: {type: Array , "default" : []},
    defaultattributes: {type: Schema.Types.Mixed, "default" : {}},
    overrideattributes: {type: Schema.Types.Mixed, "default" : {}},
    created: {type: Date, default: Date.now}
  });

  mongoose.model('Service', ServiceSchema);
  var Service = mongoose.model('Service');

  return Service;

};
