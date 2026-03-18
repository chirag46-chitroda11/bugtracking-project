const Bug =require("../models/bugModel")
// report bugs
const createBug = async(req,res)=>{
    try{
        const {taskId, bugTitle, description, reportBy, assignedDeveloper, severity}=req.body

        const bug =await Bug.create({
            // je upr const pachi Bug k je lhkyu hoy e pachi create pela levanu  
            taskId,
            bugTitle,
            description,
            reportBy,assignedDeveloper,
            severity
        })
        res.status(201).json({
            success:true,
            message:"bug reported successfully...",
            data:bug
        })
    }catch(error) {
        res.status(500).json({
            success:false,
            message:error.message
        })

    }
}
// get all bugs 
const getAllBugs = async(req,res)=>{
    try{
        const bugs =await Bug.find()
        .populate("taskId")
        .populate("reportBy")
        .populate("assignedDeveloper")

        res.status(201).json({
            success:true,
            message:"Bug fetched successfully ...",
             data:bugs 
            //  je const pachi nu hhoy e aya data ma levanu 
        })
    }catch(error){
          res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// get bug by id 
const getBugById = async(req,res)=>{
    try{
        const bug = await Bug.findById(req.params.id)
        res.status(200).json({
            success:true,
            data:bug
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        
        })
      
    }
}

// update bug status 
const updateBugStatus =async(req,res)=>{
    try{
        const bug = await Bug.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true})  // aa shu kam chhe ?

          res.status(200).json({
            success:true,
            message:"bugs Status Updated ...",
            data:bug
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


// delete bug 
const deleteBug = async(req,res)=>{
    try{
        const bug = await Bug.findByIdAndDelete(req.params.id)
         res.status(200).json({
            success:true,
            message:"Bug deleted successfully"
         })

    }catch(error){
          res.status(500).json({
            success:false,
            message:error.message
        })

    }
}
module.exports={
    createBug,
    getAllBugs,
    getBugById,
    updateBugStatus,
    deleteBug
}