const mongoose = require("mongoose")
const taskhistorySchema =new mongoose.Schema({
    taskId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"task"
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    assignedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    status:{
        type:String,
        enum:["assigned","reassigned"]
    }
},{timestamps:true});
module.exports = mongoose.model("taskHistory",taskhistorySchema);
