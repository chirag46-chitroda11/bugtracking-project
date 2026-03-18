const Project =require("../models/projectModel")

const createProject = async(req,res)=>{

    try{

        const {projectName, description, createdBy} = req.body

        const project = await Project.create({
            projectName,
            description,
            createdBy
        })

        res.status(201).json({
            success:true,
            message:"Project created successfully",
            data:project
        })

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        })

    }

}

// get all projects
const getAllProject = async(req,res)=>{
    try{
          const projects = await Project.find()
        .populate("createdBy")

        res.status(200).json({
            success:true,
            message:"Projects fetched successfully",
            data:projects
        })

    }catch(error){
          res.status(500).json({
            success:false,
            message:error.message
        })

    }
}

// get project by id

const getProjectById = async(req,res)=>{
    try{
        const project = await Project.findById(req.params.id)
        res.status(200).json({
            success:true,
            data:project
        })
        
    }catch(error){
         res.status(500).json({
            success:false,
            message:error.message
        })

    }
}

// update project
const updateProject = async(req,res)=>{

    try{

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        )

        res.status(200).json({
            success:true,
            message:"Project updated successfully",
            data:project
        })

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        })

    }

}

// delete project
const deleteProject = async(req,res)=>{

    try{

        await Project.findByIdAndDelete(req.params.id)

        res.status(200).json({
            success:true,
            message:"Project deleted successfully"
        })

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        })

    }

}

module.exports = {
    createProject,
    getAllProject,
    getProjectById,
    updateProject,
    deleteProject
}
