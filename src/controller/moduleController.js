const Module = require("../models/moduleModel")

const createModule = async(req,res)=>{
    try{
         const {moduleName, projectId, description, createdBy} = req.body

         const module = await Module.create({
            moduleName,
            projectId,
            description,
            createdBy
         })
         res.status(200).json({
            success:true,
            message:"module created successfully ...",
            data:module    
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
// get all modules
const getAllModule = async(req,res)=>{
    try{
        const module = await Module.find()
        .populate("projectId")
        .populate("createdBy")

        res.status(200).json({
            success:true,
            message:"Module fatched successfully...",
            data:module
        })
    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// get module by id
const getModuleById =async(req,res)=>{
    try{
        const module = await Module.findById(req.params.id)
        res.status(200).json({
            success:true,
            data:module
        })

    }catch(error){
          res.status(500).json({
            success:false,
            message:error.message
        })

    }
}
// update module
const updateModule = async(req,res)=>{
    try{
        const module =await Module.findByIdAndUpdate(req.params.id,req.body,{new:true})
        res.status(200).json({
            success:true,
            message:"Module updated successfully...",
            data:module
        })


    }catch(error){
          res.status(500).json({
            success:false,
            message:error.message
        })

    }
}


// delete module
const deleteModule = async(req,res)=>{
    try{
        const module = await Module.findByIdAndDelete(req.params.id)
        res.status(200).json({
            success:true,
            message:"Module deleted successfully..."
        })
        
    }catch(error){
          res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

module.exports={
    createModule,
    getAllModule,
    getModuleById,
    updateModule,
    deleteModule
}