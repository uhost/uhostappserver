// Lives inside projectserver

module.exports = function(params) {

  var mongoose = params.mongoose;
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var ServerSchema = new Schema({
    name: {type: String, required: true},
    fullname: {type: String, required: true},
    instance: {type: String},
    created: {type: Date, default: Date.now}
  });

  mongoose.model('Server', ServerSchema);
  var Server = mongoose.model('Server');

  return Server;

};
