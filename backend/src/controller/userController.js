const User = require("../models/userModel")
const uploadToCloudinary = require("../utils/CloudinaryUtil")

// ================= REGISTER USER =================
const registerUser = async (req, res) => {
  console.log(req.body)
  try {
    console.log("BODY:", req.body) // 🔥 debug

    const { name, email, password, role, designation } = req.body

    // check required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All required fields missing"
      })
    }

    // check existing user
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      })
    }

    let imageUrl = ""

    // optional image upload
    if (req.file) {
      const cloudinaryResponse = await uploadToCloudinary(req.file.path)
      imageUrl = cloudinaryResponse.secure_url
    }

    // create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      designation,
      // imagePath: imageUrl
    })

    res.status(201).json({
      message: "User created successfully",
      data: user
    })

  } catch (error) {
    console.log("REGISTER ERROR:", error)

    res.status(500).json({
      message: "Error creating user",
      error: error.message
    })
  }
}


// ================= LOGIN USER =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // check fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      })
    }

    // check user exist
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      })
    }

    // check password
    if (user.password !== password) {
      return res.status(400).json({
        message: "Invalid password"
      })
    }

    // success
    res.status(200).json({
      message: "Login success",
      data: user
    })

  } catch (err) {
    console.log("LOGIN ERROR:", err)

    res.status(500).json({
      message: "Error in login",
      error: err.message
    })
  }
}


// ================= EXPORT =================
module.exports = {
  registerUser,
  loginUser
}