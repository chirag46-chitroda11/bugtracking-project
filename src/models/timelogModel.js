const mongoose = require("mongoose");
const timeLogSchema = new mongoose.Schema({
    taskId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"task"
    },
    developerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"task"
    },
    hoursWorked:Number,
    workDescription:String,
    logDate:Date
},{
    timestamps:true
});
module.exports=mongoose.model("timelog",timeLogSchema);