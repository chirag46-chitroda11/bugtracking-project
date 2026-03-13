const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    role:{
        type:String,
        enum:["admin","project_manager","devloper","tester"],
        require:true
    },
    designation:{
        type:String

    },
    status:{
        type:String,
         default:"active",
        enum:["blocked","active","inactive","deleted"],
       

    }
},{timestamps:true});
module.exports = mongoose.model("user",userSchema)