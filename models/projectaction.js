var sizeMap = {"tiny": "t1.micro",
  "small": "m1.small",
  "medium": "m1.medium",
  "large": "m1.large",
  "xlarge": "m1.xlarge"
};

module.exports = function(params) {

  var mongoose = params.mongoose;
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;


  var ProjectActionSchema = new Schema({
    projectid: {type: ObjectId, required: true},
      instance: {type: String},
      userid: {type: ObjectId},
      action: {type: String, required: true},
      created: {type: Date, default: Date.now}
  });

  mongoose.model('ProjectAction', ProjectActionSchema);
  var ProjectAction = mongoose.model('ProjectAction');

  return ProjectAction;
};
