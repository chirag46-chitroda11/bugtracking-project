const express = require("express")

const router = express.Router()

const authMiddleware = require("../middleware/authMiddleware");

const {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTesterTasks
} = require("../controller/taskController")


router.post("/", authMiddleware, createTask)

router.get("/", getAllTasks)
//get all task 

// Tester-scoped: must come before /:id
router.get("/my-testing-tasks", authMiddleware, getTesterTasks)

router.get("/:id", getTaskById)
//get task by id 

router.put("/:id", authMiddleware, updateTask)
// update task

router.delete("/:id", authMiddleware, deleteTask)
//delete task 

const { getCommentsByTask, addCommentToTask } = require("../controller/taskController")
router.get("/:id/comments", getCommentsByTask)
router.post("/:id/comments", authMiddleware, addCommentToTask)

module.exports = router