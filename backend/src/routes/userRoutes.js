const express = require("express")
const router = express.Router()

const upload = require("../middleware/uploadMiddleware")

const {
  registerUser,
  getAllUser,
  getUserById,
  updateUser,
  deleteUser
} = require("../controller/userController")

router.post("/register",
  upload.single("image"),
  registerUser
)

// router.get("/", getAllUser)

// router.get("/:id", getUserById)

// router.put("/:id", updateUser)

// router.delete("/:id", deleteUser)

module.exports = router




