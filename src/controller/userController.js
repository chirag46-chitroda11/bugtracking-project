const User = require("../models/userModel")
const uploadToCloudinary = require("../utils/CloudinaryUtil")

const registerUser = async (req, res) => {
  try {

    const {name,email,password,role,designation} = req.body

    const existingUser = await User.findOne({email})

    if(existingUser){
      return res.status(400).json({
        message:"User already exists"
      })
    }

    let imageUrl = ""

    if (req.file) {
      const cloudinaryResponse = await uploadToCloudinary(req.file.path)
      imageUrl = cloudinaryResponse.secure_url
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      designation,
      imagePath:imageUrl
    })

    res.status(201).json({
      message:"User created successfully",
      data:user
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:"Error creating user",
      error:error.message
    })
  }
}
module.exports = {
  registerUser,
  // getAllUser,
  // getUserById,
  // updateUser,
  // deleteUser
};