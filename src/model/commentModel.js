const mongoose = require("mongoose");


const commentSchema = new mongoose.Schema({
    taskId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"task"
    },
    bugId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"bug"
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    commentText:String
},{timestamps:true});
module.exports = mongoose.model("comment",commentSchema);