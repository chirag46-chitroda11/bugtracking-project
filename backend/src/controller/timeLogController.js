const { deleteMany } = require("../models/projectModel")
const TimeLog = require("../models/timelogModel")

const createTimeLog = async(req,res)=>{
    try{
      const {taskId, developerId, hoursWorked, workDate, description} = req.body

      const log = await TimeLog.create({
        taskId,
        developerId,
        hoursWorked,
        workDate,
        description
      })
      res.status(200).json({
        success:true,
        message:"timelog created successfully...",
        data:log
      })
    }catch(error){
         res.status(500).json({
            success:false,
            message:error.message
        })


    }
}

//get all time log 
const getAllTimeLog = async(req,res)=>{
    try{
        const logs = await TimeLog.find()
        .populate("taskId")
        .populate("developerId")

        res.status(200).json({
            success:true,
            message:"all time log get successfully ...",
            data:logs

        })

    }catch(error){
         res.status(500).json({
            success:false,
            message:error.message
        })

    }
}

//get timelog by id 
const getTimeLogById = async(req,res)=>{
    try{
        const logs = await TimeLog.findById(req.params.id)
        res.status(200).json({
            success:true,
            data:logs
        })


    }catch(error){
          res.status(500).json({
            success:false,
            message:error.message
        })      
    }
}

const updateTimeLog = async(req,res)=>{
    try{
        const log = await TimeLog.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        )
        res.status(200).json({
            success:true,
            message:"timelog updated successfully...",
            data:log
        })

    }catch(error){
          res.status(500).json({
            success:false,
            message:error.message
        }) 

    }
}

const deleteTimeLog = async(req,res)=>{
    try{
        const timeLog = await TimeLog.findByIdAndDelete(req.params.id)
        res.status(200).json({
            success:true,
            message:" timelog successfully deleted ..."
        })

    }catch(error){
          res.status(500).json({
            success:false,
            message:error.message
        }) 
    }
}

module.exports = {
    createTimeLog,
    getAllTimeLog,
    getTimeLogById,
    updateTimeLog,
    deleteTimeLog
}