
module.exports = function(params) {

  var mongoose = params.mongoose;
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var ProjectServiceSchema = new Schema({
    projectid: {type: ObjectId, required: true},
    serverids: [ObjectId],
    created: {type: Date, default: Date.now}
  });

  mongoose.model('ProjectService', ProjectServiceSchema);
  var ProjectService = mongoose.model('ProjectService');

  return ProjectService;

};
