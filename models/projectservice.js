
module.exports = function(params) {

  var mongoose = params.mongoose;
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var ProjectServiceSchema = new Schema({
    userid: {type: ObjectId, required: true},
    projectid: {type: ObjectId, required: true},
    serviceid: {type: ObjectId, required: true},
    platformid: {type: ObjectId, required: true},
    serverids: [ObjectId],
    name: {type: String, required: true},
    created: {type: Date, default: Date.now}
  });

  mongoose.model('ProjectService', ProjectServiceSchema);
  var ProjectService = mongoose.model('ProjectService');

  return ProjectService;

};
