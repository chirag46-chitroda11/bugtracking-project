const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["admin","project_manager","developer","tester"],
        required:true
    },
    designation:{
        type:String
    },
    // imagePath:{
    //     type:String
    // },
    status:{
        type:String,
        default:"active",
        enum:["blocked","active","inactive","deleted"]
    }
},{timestamps:true});

module.exports = mongoose.model("User",userSchema)