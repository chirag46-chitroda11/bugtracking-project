const Bug = require("../models/bugModel");
// report bugs
const createBug = async (req, res) => {
    try {
        // 🔥 bugImage ko yahan destruct kiya req.body se
        const { taskId, bugTitle, description, reportBy, assignedDeveloper, severity, bugImage } = req.body

        const bug = await Bug.create({
            taskId: taskId || null,
            bugTitle,
            description,
            bugImage, // 🔥 YEH LINE ADD KI - Taaki URL database mein jaye
            reportBy,
            assignedDeveloper,
            severity,
            status: "draft" 
        })

        res.status(201).json({
            success: true,
            message: "bug reported successfully...",
            data: bug
        })

    } catch (error) {
        console.log("CREATE BUG ERROR:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// BAAKI SARE FUNCTIONS (getAllBugs, getAdminDashboard, etc.) 
// WAISE HI RAHENGE, UNME KOI CHANGE NAHI KIYA.


// get all bugs 
const getAllBugs = async(req,res)=>{
    try{
        const bugs = await Bug.find()
        .populate("taskId")   // 🔥 only this works (ObjectId)
        // .populate("reportBy") ❌ removed (now string)
        // .populate("assignedDeveloper") ❌ removed

        res.status(200).json({
            success:true,
            message:"Bug fetched successfully ...",
            data:bugs 
            //  je const pachi nu hhoy e aya data ma levanu 
        })

    }catch(error){
        console.log("Populate ERROR:", error);

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
        .populate("taskId")

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
        const bug = await Bug.findByIdAndUpdate(
            req.params.id,
            {status:req.body.status},
            {new:true}  // aa shu kam chhe ? → updated data return kare chhe 🔥
        )

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
const updateBug = async (req, res) => {
  try {
    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: bug
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
// ADMIN DASHBOARD DATA
const getAdminDashboard = async (req, res) => {
  try {
    const bugs = await Bug.find();

    const stats = {
    total: bugs.length,
    draft: bugs.filter(b => b.status === "draft").length,
    submitted: bugs.filter(b => b.status === "submitted" || b.status === "open").length,
    closed: bugs.filter(b => b.status === "closed").length,
    };

    res.json({ stats, bugs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const assignBugToDeveloper = async (req, res) => {
  try {
    const { bugId, developerId } = req.body;

    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    bug.assignedDeveloper = developerId;
    bug.status = "fixxed";

    await bug.save();

    res.json({ message: "Bug Assigned Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getManagerBugs = async (req, res) => {
  try {
    const bugs = await Bug.find({
      status: "submitted" // 🔥 ONLY submitted bugs
    }).populate("taskId");

    res.status(200).json({
      success: true,
      message: "Manager bugs fetched",
      data: bugs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
module.exports = {
  createBug,
  getAllBugs,
  getBugById,
  updateBugStatus,
  deleteBug,
  updateBug,
  getAdminDashboard,       
  assignBugToDeveloper,
  getManagerBugs   
};