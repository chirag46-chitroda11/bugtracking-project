const express = require("express")

const router = express.Router()

const {
    createProject,
    getAllProject,
    getProjectById,
    updateProject,
    deleteProject
} = require("../controller/projectController")
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createProject)
// create projects 

router.get("/", getAllProject)
//get all projects 

router.get("/:id", getProjectById)
//get project by id 

router.put("/:id", authMiddleware, updateProject)
//update project 

router.delete("/:id", authMiddleware, deleteProject)
//delete project 

module.exports = router