const express = require("express")

const router = express.Router()

const {createBug,getAllBugs,getBugById,updateBugStatus,deleteBug } =require("../controller/bugController")
router.post("/",createBug) // for bug create

router.get("/",getAllBugs)// get all bugs 

router.get("/:id",getBugById)//get bug by id 

router.put("/:id/status",updateBugStatus)//for update bug status 

router.delete("/:id",deleteBug)

module.exports = router