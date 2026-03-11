const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const  moduleSchema = new Schema({
    modelName:{
        type:String,
        require:true
    },
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"project"
    },
    description:String,
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
},{timestamps:true});
module.exports = mongoose.model("Module",moduleSchema)
