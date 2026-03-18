const express = require("express")

const router = express.Router()

const{
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require("../controller/taskController")
router.post("/",createTask)

router.get("/",getAllTasks)
//get all task 

router.get("/:id", getTaskById)
//get task by id 

router.put("/:id",updateTask)
// update task

router.delete("/:id",deleteTask)
//delete task 

module.exports = router