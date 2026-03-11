const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
    projectName:{
        type:String,
        require:true
    },
    description:{
        type:String
    },
    projectManager:{
        type:mongoose.Schema.Types.ObjectId,
        // foreignKey concepts
        ref:"User"  
    },
    startDate:Date,
    endDate:Date,
    stutus:{
        type:String,
        enum:["Active","completed"],
        default:"Active"
    }

},{timestamps:true});
module.exports = mongoose.model("project",projectSchema)