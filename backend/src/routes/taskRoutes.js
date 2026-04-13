const express = require("express")

const router = express.Router()

const authMiddleware = require("../middleware/authMiddleware");

const{
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require("../controller/taskController")


router.post("/",authMiddleware,createTask)

router.get("/",getAllTasks)
//get all task 

router.get("/:id", getTaskById)
//get task by id 

router.put("/:id",updateTask)
// update task

router.delete("/:id",deleteTask)
//delete task 

module.exports = router