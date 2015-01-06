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


  var ProjectSchema = new Schema({
    userid: {type: ObjectId, required: true},
      name: {type: String, required: true, unique: true},
      fullname: {type: String, required: true, unique: true},
      /*
         services: {git: [GitServiceSchema],
         chef: [ChefServiceSchema],
         wordpress: [WordPressServiceSchema],
         jira: [JiraServiceSchema]
         },
       */
      instance: {type: String},
      instance_type: {type: String},
      created: {type: Date, default: Date.now}
  });

  mongoose.model('Project', ProjectSchema);
  var Project = mongoose.model('Project');

  var ProjectActionSchema = new Schema({
    projectid: {type: ObjectId, required: true},
      instance: {type: String},
      userid: {type: ObjectId},
      action: {type: String, required: true},
      created: {type: Date, default: Date.now}
  });

  mongoose.model('ProjectAction', ProjectActionSchema);
  var ProjectAction = mongoose.model('ProjectAction');

  var ServerSchema = new Schema({
    name: {type: String, required: true, unique: true},
      fullname: {type: String, required: true},
      projectid: {type: ObjectId, required: true},
      //services: { nodejs: [NodejsServiceSchema] },
      instance: {type: String},
      instance_type: {type: String},
      created: {type: Date, default: Date.now}
  });


};
