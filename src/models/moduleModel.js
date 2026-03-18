const mongoose = require("mongoose");
const { applyTimestamps } = require("./userModel");

const moduleSchema = new mongoose.Schema({
    moduleName:{
        type:String,
        require:true
    },
    description:{
        type:String
    },
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"project"
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    status:{
        type:String,
        enum:["active","completed"],
        default:"active"
    }
},{timestamps:true});
module.exports = mongoose.model("Module",moduleSchema);