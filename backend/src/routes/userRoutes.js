const express = require("express")
const router = express.Router()

const { registerUser, loginUser, getAllUsers,getUserById ,toggleUserStatus,deleteUser} = require("../controller/userController")

router.post("/register", registerUser)
router.post("/login", loginUser)



router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/toggle/:id", toggleUserStatus);
router.delete("/users/:id", deleteUser);



module.exports = router