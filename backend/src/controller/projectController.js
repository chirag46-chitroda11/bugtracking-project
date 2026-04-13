const Project =require("../models/projectModel")
const Module  = require("../models/moduleModel")
const Task  = require("../models/taskModel")


const createProject = async(req,res)=>{

    try{

        const {projectName, description, createdBy} = req.body;
        if (!projectName || !description) {
             return res.status(400).json({
            success: false,
            message: "All fields are required"
             });
            }

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
const getAllProject = async (req, res) => {
  try {
    const projects = await Project.find().populate({
      path: "createdBy",
      select: "name email"
    });

    const result = await Promise.all(
      projects.map(async (proj) => {

        const modules = await Module.countDocuments({
          projectId: proj._id
        });

        const tasks = await Task.countDocuments({
          projectId: proj._id
        });

        const completedTasks = await Task.countDocuments({
          projectId: proj._id,
          status: "done"
        });

        const progress =
          tasks === 0 ? 0 : Math.round((completedTasks / tasks) * 100);

        return {
          ...proj._doc,
          moduleCount: modules,
          taskCount: tasks,
          progress
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

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
