const Task = require("../models/taskModel");
const Project = require("../models/projectModel");
const TimeLog = require("../models/timelogModel");
const Sprint = require("../models/sprintModel");
const Bug = require("../models/bugModel");

// Get overview stats
const getDashboardSummary = async (req, res) => {
    try {
        const developerId = req.user.id;

        // Get tasks for this developer
        const tasks = await Task.find({ assignedDeveloper: developerId });

        const totalAssigned = tasks.length;
        const inProgress = tasks.filter(t => t.status === "in progress" || t.status === "testing").length;
        const completed = tasks.filter(t => t.status === "completed").length;

        // Get log hours for this week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const logs = await TimeLog.find({
            developerId: developerId,
            logDate: { $gte: startOfWeek }
        });

        const hoursWorkedThisWeek = logs.reduce((acc, log) => acc + (log.hoursWorked || 0), 0);

        // Get bugs for this developer
        const bugs = await Bug.find({ assignedDeveloper: developerId });
        const openBugs = bugs.filter(b => b.status !== "closed").length;

        // Get completed this sprint (active sprints only)
        const activeSprints = await Sprint.find({ status: "active" }).populate("tasks");
        let completedThisSprint = 0;
        activeSprints.forEach(sprint => {
            sprint.tasks.forEach(t => {
                if (t.assignedDeveloper?.toString() === developerId && t.status === "completed") {
                    completedThisSprint++;
                }
            });
        });

        // Activity Feed (Real developer actions from ActivityLog + recent assignments as fallback)
        const ActivityLog = require("../models/activityLogModel");
        const recentActivities = await ActivityLog.find({ userId: developerId }).sort({ createdAt: -1 }).limit(15);
        const recentBugs = await Bug.find({ assignedDeveloper: developerId }).sort({ createdAt: -1 }).limit(5);
        const recentLogs = await TimeLog.find({ developerId }).sort({ createdAt: -1 }).limit(5);
        const recentTasks = await Task.find({ assignedDeveloper: developerId }).sort({ createdAt: -1 }).limit(5);

        const activityFeed = [
            ...recentActivities.map(a => ({
                type: a.action === 'status_changed' ? 'status' : a.action === 'time_logged' ? 'log' : a.action === 'tester_assigned' ? 'task' : 'task',
                title: a.title,
                date: a.createdAt,
                description: a.description,
                action: a.action,
                metadata: a.metadata
            })),
            ...recentTasks.map(t => ({ type: 'task', title: t.taskTitle, date: t.createdAt, description: "New task assigned" })),
            ...recentBugs.map(b => ({ type: 'bug', title: b.bugTitle, date: b.createdAt, description: "New bug assigned" })),
            ...recentLogs.map(l => ({ type: 'log', title: l.workDescription || 'Logged Time', date: l.createdAt, description: `Logged ${l.hoursWorked} hours` }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);

        // Chart Data: Weekly Task Completion
        const weeklyCompletion = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const nextDay = new Date(d);
            nextDay.setDate(nextDay.getDate() + 1);

            const dayLogs = await TimeLog.find({
                developerId,
                logDate: { $gte: d, $lt: nextDay }
            });
            const hours = dayLogs.reduce((acc, l) => acc + (l.hoursWorked || 0), 0);
            weeklyCompletion.push({ name: d.toLocaleDateString('en-US', { weekday: 'short' }), hours });
        }

        res.status(200).json({
            success: true,
            data: {
                totalAssigned,
                inProgress,
                completed,
                openBugs,
                hoursWorkedThisWeek,
                pendingRetests: bugs.filter(b => b.status === "retest").length,
                completedThisSprint,
                activityFeed,
                weeklyCompletion
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all developer tasks
const getDeveloperTasks = async (req, res) => {
    try {
        const developerId = req.user.id;
        const tasks = await Task.find({ assignedDeveloper: developerId })
            .populate("projectId", "projectName status")
            .populate("moduleId", "moduleName")
            .populate("assignBy", "name role");

        const Sprint = require("../models/sprintModel");
        const Bug = require("../models/bugModel");

        const tasksWithExtras = await Promise.all(tasks.map(async (t) => {
            const sprint = await Sprint.findOne({ tasks: t._id });
            const bug = await Bug.findOne({ taskId: t._id });
            return {
                ...t.toObject(),
                sprintName: sprint ? sprint.sprintName : "N/A",
                linkedBug: bug ? bug.bugTitle : null
            };
        }));

        res.status(200).json({ success: true, data: tasksWithExtras });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get projects developer is involved in
const getDeveloperProjects = async (req, res) => {
    try {
        const developerId = req.user.id;
        // Find tasks assigned to dev
        const tasks = await Task.find({ assignedDeveloper: developerId });
        const projectIds = [...new Set(tasks.map(t => t.projectId?.toString()).filter(Boolean))];

        const projects = await Project.find({ _id: { $in: projectIds } });

        res.status(200).json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get developer work logs
const getDeveloperWorklogs = async (req, res) => {
    try {
        const developerId = req.user.id;
        const logs = await TimeLog.find({ developerId }).populate("taskId", "taskTitle priority").sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get developer bugs
const getDeveloperBugs = async (req, res) => {
    try {
        const developerId = req.user.id;
        const bugs = await Bug.find({ assignedDeveloper: developerId }).populate("taskId", "taskTitle");

        res.status(200).json({ success: true, data: bugs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDeveloperProjectsHierarchy = async (req, res) => {
    try {
        const developerId = req.user.id;
        const tasks = await Task.find({ assignedDeveloper: developerId });
        const projectIds = [...new Set(tasks.map(t => t.projectId?.toString()).filter(Boolean))];

        const projects = await Project.find({ _id: { $in: projectIds } }).lean();

        // Build Hierarchy
        const Module = require("../models/moduleModel");

        const hierarchy = await Promise.all(projects.map(async (proj) => {
            const sprints = await Sprint.find({ projectId: proj._id }).lean();
            const modules = await Module.find({ projectId: proj._id }).lean();
            const projTasks = await Task.find({ projectId: proj._id, assignedDeveloper: developerId }).lean();

            // Map tasks to modules
            const modulesWithTasks = modules.map(m => {
                return {
                    ...m,
                    tasks: projTasks.filter(t => t.moduleId?.toString() === m._id.toString())
                }
            });

            // Map modules to sprints (simplistic approach: sprints have task references, we group tasks under sprint)
            const sprintsWithDetails = sprints.map(s => {
                const sprintTasks = projTasks.filter(t => s.tasks.some(st => st.toString() === t._id.toString()));

                // Which modules are active in this sprint? (Modules that own these tasks)
                const sprintModuleIds = [...new Set(sprintTasks.map(t => t.moduleId?.toString()).filter(Boolean))];
                const sprintModules = modulesWithTasks.filter(m => sprintModuleIds.includes(m._id.toString())).map(m => ({
                    ...m,
                    tasks: m.tasks.filter(t => sprintTasks.some(st => st._id.toString() === t._id.toString()))
                }));

                return {
                    ...s,
                    modules: sprintModules
                }
            });

            // Progress calculate
            const completed = projTasks.filter(t => t.status === "completed").length;
            const progress = projTasks.length > 0 ? Math.round((completed / projTasks.length) * 100) : 0;

            // Fetch Project Team Members
            const allProjTasks = await Task.find({ projectId: proj._id }).lean();
            const memberIds = [...new Set(allProjTasks.map(t => t.assignedDeveloper?.toString()).filter(Boolean))];
            if (proj.projectManager) memberIds.push(proj.projectManager.toString());

            const User = require("../models/userModel");
            const members = await User.find({ _id: { $in: memberIds } }, "name role profilePicture");

            return {
                ...proj,
                progress,
                members,
                sprints: sprintsWithDetails
            }
        }));

        res.status(200).json({ success: true, data: hierarchy });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboardSummary,
    getDeveloperTasks,
    getDeveloperProjects,
    getDeveloperWorklogs,
    getDeveloperBugs,
    getDeveloperProjectsHierarchy
};
