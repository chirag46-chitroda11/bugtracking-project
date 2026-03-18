const express = require("express")

const router = express.Router()

const{
    createModule,
    getAllModule,
     getModuleById,
    updateModule,
    deleteModule
} =require("../controller/moduleController")
router.post("/",createModule)


// get all modules
router.get("/", getAllModule)

// get module by id
router.get("/:id", getModuleById)

router.put("/:id", updateModule)//update module 

router.delete("/:id", deleteModule)//delete module

module.exports = router