const express = require("express")

const router = express.Router()

const{
    createProject,
    getAllProject,
    getProjectById,
    updateProject,
    deleteProject
} = require("../controller/projectController")
router.post("/",createProject)
// create projects 

router.get("/",getAllProject)
//get all projects 

router.get("/:id",getProjectById)
//get project by id 

router.put("/:id" , updateProject)
//update project 

router.delete("/:id", deleteProject)
//delete project 

module.exports = router