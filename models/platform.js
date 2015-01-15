
module.exports = function(params) {

  var mongoose = params.mongoose;
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var PlatformSchema = new Schema({
    userid: {type: ObjectId, required: true},
    name: {type: String, required: true},
    provider: {type: String, required: true},
    params: [],
    created: {type: Date, default: Date.now}
  });

  mongoose.model('Platform', PlatformSchema);
  var Platform = mongoose.model('Platform');

  return Platform;

};
