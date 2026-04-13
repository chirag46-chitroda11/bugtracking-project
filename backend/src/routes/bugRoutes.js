const express = require("express")

const router = express.Router()

const {createBug,getAllBugs,getBugById,updateBugStatus,deleteBug, updateBug, getAdminDashboard, getManagerBugs } =require("../controller/bugController")
// const { assignBugToDeveloper } = require("../controller/bugController");

router.post("/",createBug) // for bug create

router.get("/",getAllBugs)// get all bugs 

router.get("/:id",getBugById)//get bug by id 

router.put("/:id/status",updateBugStatus)//for update bug status 

router.put("/:id", updateBug);

router.delete("/:id",deleteBug)

router.get("/admin/dashboard",getAdminDashboard);

router.get("/manager/bugs", getManagerBugs);

module.exports = router