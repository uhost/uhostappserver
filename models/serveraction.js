
module.exports = function(params) {

  var mongoose = params.mongoose;
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var ServerActionSchema = new Schema({
    serverid: {type: ObjectId, required: true},
    instance: {type: String},
    userid: {type: ObjectId},
    action: {type: String, required: true},
    created: {type: Date, default: Date.now}
  });

  mongoose.model('ServerAction', ServerActionSchema);
  var ServerAction = mongoose.model('ServerAction');

  return ServerAction;

};
