const express = require("express")

const router = express.Router()

const{
    createTimeLog,
    getAllTimeLog,
    getTimeLogById,
    updateTimeLog,
    deleteTimeLog
} = require("../controller/timeLogController")
router.post("/", createTimeLog)

router.get("/",getAllTimeLog)

router.get("/:id",getTimeLogById)

router.put("/:id",updateTimeLog)

router.delete("/:id",deleteTimeLog)

module.exports = router