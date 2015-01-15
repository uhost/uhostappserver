
module.exports = function(params) {

  var mongoose = params.mongoose;
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var ServiceSchema = new Schema({
    name: {type: String, required: true, unique: true},
    created: {type: Date, default: Date.now}
  });

  mongoose.model('Service', ServiceSchema);
  var Service = mongoose.model('Service');

  return Service;

};
