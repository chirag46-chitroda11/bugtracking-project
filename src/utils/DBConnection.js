const mongoose = require("mongoose");
require("dotenv").config()

const DBConnection = ( )=>{
    mongoose.connect(process.env.MONGO_URL).then(()=>{
        console.log(" Database Connected")
    }).catch((err)=>{
        console.log(err)
    })
}
module.exports = DBConnection