const Task = require("../models/taskModel")

// create task
const createTask = async(req,res)=>{

    try{

        const {taskName, description, projectId, moduleId, assignedDeveloper, status} = req.body

        const task = await Task.create({
            taskName,
            description,
            projectId,
            moduleId,
            assignedDeveloper,
            status
        })

        res.status(201).json({
            success:true,
            message:"Task created successfully",
            data:task
        })

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        })

    }

}


// get all tasks
const getAllTasks = async(req,res)=>{

    try{

        const tasks = await Task.find()
        .populate("projectId")
        .populate("moduleId")
        .populate("assignedDeveloper")

        res.status(200).json({
            success:true,
            message:"Tasks fetched successfully",
            data:tasks
        })

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        })

    }

}


// get task by id
const getTaskById = async(req,res)=>{

    try{

        const task = await Task.findById(req.params.id)

        res.status(200).json({
            success:true,
            data:task
        })

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        })

    }

}


// update task
const updateTask = async(req,res)=>{

    try{

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        )

        res.status(200).json({
            success:true,
            message:"Task updated successfully",
            data:task
        })

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        })

    }

}


// delete task
const deleteTask = async(req,res)=>{

    try{

        await Task.findByIdAndDelete(req.params.id)

        res.status(200).json({
            success:true,
            message:"Task deleted successfully"
        })

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        })

    }

}

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
}