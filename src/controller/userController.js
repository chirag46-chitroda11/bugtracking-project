
const User = require("../model/userModel")
const registerUser = async(req,res)=>{
    try{
        const {name,email,password,role} = req.body

        const user = await User.create({
            name,
            email,
            password,
            role
        })

        res.status(201).json({
            success:true,
            message:"User registered successfully",
            data:user
        })

    }catch(error){
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}

module.exports = { registerUser }
