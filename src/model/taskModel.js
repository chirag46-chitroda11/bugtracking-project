const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    taskTitle:{
        type:String,
        require:true
    },
    description:{
        type:string
    },
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"project"
    },
    moduleId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Module"
    },
    assignedDeveloper:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    assignBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
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