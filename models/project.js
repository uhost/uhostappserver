
module.exports = function(params) {

  var mongoose = params.mongoose;
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;


  var ProjectSchema = new Schema({
    userid: {type: ObjectId, required: true},
      name: {type: String, required: true, unique: true},
      fullname: {type: String, required: true, unique: true},
      created: {type: Date, default: Date.now}
  });

  mongoose.model('Project', ProjectSchema);
  var Project = mongoose.model('Project');

  return Project;
};
