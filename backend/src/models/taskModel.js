const mongoose = require("mongoose");

require("./userModel");   // 🔥 ADD THIS

const taskSchema = new mongoose.Schema({
    taskTitle:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project"
    },
    moduleId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Module"
    },
    assignedDeveloper:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"   // 🔥 FIXED
    },
    assignBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"   // 🔥 FIXED
    },
    status:{
        type:String,
        enum:["pending","in progress","testing","completed"],
        default:"pending"
    },
    priority:{
        type:String,
        enum:["low","medium","high"]
    },
    startDate:Date,
    endDate:Date
},{timestamps:true});

module.exports = mongoose.model("Task",taskSchema);