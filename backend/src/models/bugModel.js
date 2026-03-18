const mongoose =require("mongoose");
require("./taskModel");
const bugSchema = new mongoose.Schema({
    taskId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Task",
        required:false
    },
    bugTitle:{
        type:String
    },
    description:{
        type:String
    },
    reportBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    assignedDeveloper:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }, 
    severity:{
        type:String,
        enum:["low","medium","high","critical"],

    },
    status:{
        type:String,
        enum:["open","fixxed","retest","closed"],
        default:"open"
    }
},{timestamps:true});
module.exports=mongoose.model("bug",bugSchema);