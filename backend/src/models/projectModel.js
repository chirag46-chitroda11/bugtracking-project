const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
    projectName:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    projectManager:{
        type:mongoose.Schema.Types.ObjectId,
        // foreignKey concepts
        ref:"User"  
    },
     projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"project"},

     createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    startDate:Date,
    endDate:Date,
    status:{
        type:String,
        enum:["Active","completed"],
        default:"Active"
    }

},{timestamps:true});
module.exports = mongoose.model("Project",projectSchema)