import API from "../api/axios";
import { useEffect, useState } from "react";
import { getAdminDashboard } from "../services/bugService";
import { getProjects, deleteProject } from "../services/projectService";
import { useNavigate } from "react-router-dom";
import { getModulesByProject, getModules, deleteModule } from "../services/moduleService";
import { getTasks, deleteTask } from "../services/taskService";
import { getSprints, assignTaskToSprint, deleteSprint } from "../services/sprintService";
import { getAllReviews, approveReview, rejectReview, deleteReview as deleteReviewApi } from "../services/reviewService";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Layers, CheckCircle, Bug as BugIcon, Users, Settings, Activity, FileText, ChevronRight, Menu, LogOut, PlusCircle, Trash2, Edit, Search, Package, Filter, Calendar, Flag, AlertTriangle, X, Star, MessageSquare, ShieldCheck } from 'lucide-react';
import NotificationBell from "../components/NotificationBell";
import ModuleFormModal from "../components/ModuleFormModal";
import AnnouncementBanner from "../components/AnnouncementBanner";
import toast from "react-hot-toast";
import { useConfirm } from "../context/ConfirmContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [loggedInUser, setLoggedInUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = async () => {
    if (await confirm({ title: "Logout", message: "Are you sure you want to logout?" })) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSearchTerm("");
  }, [activeTab]);

  const [stats, setStats] = useState({});
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [modulesMap, setModulesMap] = useState({});
  const [tasksMap, setTasksMap] = useState({});
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [taskSprintMap, setTaskSprintMap] = useState({});

  // Manage Modules state
  const [allModules, setAllModules] = useState([]);
  const [moduleFilterProject, setModuleFilterProject] = useState("");
  const [moduleFilterStatus, setModuleFilterStatus] = useState("");
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingModuleId, setDeletingModuleId] = useState(null);

  // Review Moderation state
  const [allReviews, setAllReviews] = useState([]);

  const allTasks = Object.values(tasksMap).flat();

  const sprintStats = {
    total: sprints.length,
    planned: sprints.filter(s => s.status === "planned").length,
    active: sprints.filter(s => s.status === "active").length,
    completed: sprints.filter(s => s.status === "completed").length,
  };

  const statusCount = allTasks.reduce((acc, task) => {
    const status = task.status?.toLowerCase();
    if (!acc[status]) acc[status] = 0;
    acc[status]++;
    return acc;
  }, {});

  const handleDelete = async (id) => {
    if (!(await confirm({ title: "Delete Project", message: "Are you sure you want to delete this project?" }))) return;
    try {
      await deleteProject(id);
      setProjects(projects.filter(p => p._id !== id));
      toast.success("Project deleted");
    } catch (error) {
      toast.error("Delete failed ❌");
    }
  };

  const handleDeleteModule = async (id) => {
    if (!(await confirm({ title: "Delete Module", message: "Delete this module?" }))) return;
    try {
      await deleteModule(id);
      setModulesMap((prev) => {
        let updated = { ...prev };
        for (let key in updated) updated[key] = updated[key].filter(m => m._id !== id);
        return updated;
      });
      toast.success("Module deleted");
    } catch (error) {
      toast.error("Delete failed ❌");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!(await confirm({ title: "Delete Task", message: "Delete this task?" }))) return;
    try {
      await deleteTask(id);
      setTasksMap((prev) => {
        let updated = { ...prev };
        for (let key in updated) updated[key] = updated[key].filter(t => t._id !== id);
        return updated;
      });
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Delete failed ❌");
    }
  };

  // Delete module from Manage Modules page with premium modal
  const confirmDeleteModule = async (id) => {
    if (!(await confirm({ title: "Delete Module", message: "This action cannot be undone. The module and all associated data will be permanently removed." }))) return;
    try {
      await deleteModule(id);
      setAllModules(allModules.filter(m => m._id !== id));
      // Also update modulesMap
      setModulesMap((prev) => {
        let updated = { ...prev };
        for (let key in updated) updated[key] = updated[key].filter(m => m._id !== id);
        return updated;
      });
      toast.success("Module deleted successfully! 🗑️");
    } catch (error) {
      toast.error("Delete failed ❌");
    }
  };

  // Fetch all modules for Manage Modules page
  const fetchAllModules = async () => {
    try {
      const res = await getModules();
      setAllModules(res.data || []);
    } catch (err) {
      console.log("Failed to fetch modules:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          dataRes,
          projDataRes,
          taskDataRes,
          sprintDataRes,
          userRes,
          allModRes,
          reviewRes,
          activityRes
        ] = await Promise.all([
          getAdminDashboard().catch(() => ({ stats: {}, bugs: [] })),
          getProjects().catch(() => ({ data: [] })),
          getTasks().catch(() => ({ data: [] })),
          getSprints().catch(() => ({ data: [] })),
          API.get("/user/users").catch(() => ({ data: { data: [] } })),
          getModules().catch(() => ({ data: [] })),
          getAllReviews().catch(() => ({ data: { data: [] } })),
          API.get("/activity/recent?limit=25").catch(() => ({ data: { data: [] } }))
        ]);

        const data = dataRes;
        const projData = projDataRes;
        const taskData = taskDataRes;
        const sprintData = sprintDataRes;

        setStats(data.stats || {});
        setBugs(data.bugs || []);
        setProjects(projData.data || []);
        setSprints(sprintData.data || []);
        setUsers(userRes.data?.data || []);
        setAllModules(allModRes.data || []);
        setAllReviews(reviewRes.data?.data || []);
        setActivityFeed(activityRes.data?.data || []);

        let taskTemp = {};
        for (let task of (taskData.data || [])) {
          const projId = (task.projectId?._id || task.projectId || task.project?._id || task.project)?.toString();
          if (!projId) continue;
          if (!taskTemp[projId]) taskTemp[projId] = [];
          taskTemp[projId].push(task);
        }
        setTasksMap(taskTemp);

        let temp = {};
        for (let mod of (allModRes.data || [])) {
          const projId = (mod.projectId?._id || mod.projectId)?.toString();
          if (!projId) continue;
          if (!temp[projId]) temp[projId] = [];
          temp[projId].push(mod);
        }
        
        // Ensure every project at least has an empty array
        for (let proj of (projData.data || [])) {
          if (!temp[proj._id]) temp[proj._id] = [];
        }
        setModulesMap(temp);

      } catch (error) {
        console.error("Dashboard data load failed", error);
      }
    };
    fetchData();
  }, []);

  // CHARRTS DATA
  const bugSeverityData = [
    { name: 'Critical', value: bugs.filter(b => b.severity === "critical").length, color: '#ef4444' },
    { name: 'High', value: bugs.filter(b => b.severity === "high").length, color: '#f97316' },
    { name: 'Medium', value: bugs.filter(b => b.severity === "medium").length, color: '#eab308' },
    { name: 'Low', value: bugs.filter(b => b.severity === "low").length, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const taskColors = {
    completed: '#10b981', // green
    'in progress': '#f59e0b', // orange
    testing: '#3b82f6', // blue
    pending: '#64748b', // slate
    'bug found': '#ef4444' // red
  };

  const taskStatusData = Object.keys(statusCount).map(k => ({
    name: k.charAt(0).toUpperCase() + k.slice(1),
    Count: statusCount[k],
    color: taskColors[k.toLowerCase()] || '#4f46e5'
  }));

  // Priority badge helper
  const getPriorityBadge = (priority) => {
    const map = {
      critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
      high: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
      low: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    };
    const style = map[priority] || map.medium;
    return (
      <span className={`flex items-center gap-1.5 px-2.5 py-1 ${style.bg} ${style.text} rounded-lg text-[11px] font-bold uppercase`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
        {priority || "medium"}
      </span>
    );
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    const map = {
      active: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700' },
      on_hold: { bg: 'bg-amber-100', text: 'text-amber-700' },
      archived: { bg: 'bg-slate-100', text: 'text-slate-600' },
    };
    const style = map[status] || map.active;
    return (
      <span className={`px-2.5 py-1 ${style.bg} ${style.text} rounded-lg text-[11px] font-bold uppercase`}>
        {(status || "active").replace("_", " ")}
      </span>
    );
  };

  // Get task count for a module
  const getModuleTaskCount = (moduleId) => {
    let count = 0;
    for (let tasks of Object.values(tasksMap)) {
      count += tasks.filter(t => {
        const mId = t.moduleId?._id || t.moduleId;
        return mId?.toString() === moduleId?.toString();
      }).length;
    }
    return count;
  };

  // Filtered modules for Manage Modules page
  const filteredModules = allModules.filter(m => {
    const matchesSearch = m.moduleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.projectId?.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = !moduleFilterProject || (m.projectId?._id || m.projectId) === moduleFilterProject;
    const matchesStatus = !moduleFilterStatus || m.status === moduleFilterStatus;
    return matchesSearch && matchesProject && matchesStatus;
  });

  const renderContent = () => {
    switch (activeTab) {
      case "projects":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">Project Portfolio</h2>
              <button className="btn-primary" onClick={() => navigate("/create-project")}><PlusCircle size={18} /> New Project</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects
                .filter(proj => proj.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || (proj.description && proj.description.toLowerCase().includes(searchTerm.toLowerCase())))
                .map((proj) => (
                  <div key={proj._id} className="glass-card p-6 border-l-4 border-l-indigo-500 hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-slate-800">{proj.projectName}</h3>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase">{proj.status}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{proj.description}</p>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Progress</span>
                        <span className="text-indigo-600">{proj.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${proj.progress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                      <div className="text-xs text-slate-500 font-semibold space-y-1">
                        <div>Modules: <span className="text-slate-800 font-bold">{modulesMap[proj._id]?.length || 0}</span></div>
                        <div>Tasks: <span className="text-slate-800 font-bold">{tasksMap[proj._id]?.length || 0}</span></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/edit-project/${proj._id}`)} className="p-2 text-slate-500 hover:text-indigo-600 bg-slate-50 rounded-lg"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(proj._id)} className="p-2 text-slate-500 hover:text-red-600 bg-slate-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );

      case "bug_tracking":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">System Bugs</h2>
              <button className="btn-primary" onClick={() => navigate("/create-bug")}><PlusCircle size={18} /> Report Bug</button>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-4">Incident Title</th>
                      <th className="p-4">Severity</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Reporter</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bugs
                      .filter(bug => bug.bugTitle.toLowerCase().includes(searchTerm.toLowerCase()) || bug.status.toLowerCase().includes(searchTerm.toLowerCase()) || bug.severity.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((bug) => (
                        <tr key={bug._id} className="border-b border-slate-100 hover:bg-indigo-50/50 transition cursor-pointer" onClick={(e) => {
                          if (!e.target.closest('button')) {
                            navigate('/bug-detail/' + bug._id);
                          }
                        }}>
                          <td className="p-4 font-bold text-slate-800">{bug.bugTitle}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${bug.severity === 'critical' ? 'bg-red-100 text-red-700' : bug.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {bug.severity}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`flex items-center gap-2 font-semibold ${['open', 'submitted', 'draft'].includes(bug.status?.toLowerCase()) ? 'text-red-500' : bug.status === 'closed' || bug.status === 'resolved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                              <div className={`w-2 h-2 rounded-full ${['open', 'submitted', 'draft'].includes(bug.status?.toLowerCase()) ? 'bg-red-500' : bug.status === 'closed' || bug.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                              {bug.status}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 font-medium">{bug.reportBy}</td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => navigate(`/edit-bug/${bug._id}`)} className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-indigo-600 rounded text-xs font-bold">Edit</button>
                            <button onClick={async () => {
                              if (await confirm({ title: "Delete Bug", message: "Delete this bug? This action cannot be undone." })) {
                                await API.delete(`/bug/${bug._id}`);
                                setBugs(bugs.filter(b => b._id !== bug._id));
                              }
                            }} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-bold">Delete</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-8 animate-fade-in">
            {/* Pending Requests Section */}
            {users.filter(u => u.status === "pending").length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span> Pending Requests
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {users.filter(u => u.status === "pending").map(u => (
                    <div key={u._id} className="glass-card p-5 text-center flex flex-col items-center group border-amber-200">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-xl font-bold text-amber-600 mb-3 border-4 border-white shadow-sm overflow-hidden">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="font-bold text-slate-800 truncate w-full">{u.name}</h3>
                      <p className="text-xs text-slate-500 font-semibold mb-3 truncate w-full">{u.email}</p>
                      <p className="text-[10px] text-slate-400 font-bold mb-4">Reg: {new Date(u.createdAt).toLocaleDateString()}</p>
                      <div className="w-full flex gap-2 pt-4 mt-auto">
                        <button className="btn-action flex-1 justify-center py-1.5 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={async () => {
                          if (await confirm({ title: "Approve User", message: "Approve this tester request?" })) {
                            try {
                              await API.put(`/user/users/approve/${u._id}`);
                              setUsers(users.map(usr => usr._id === u._id ? { ...usr, status: "approved" } : usr));
                              toast.success("User Approved!");
                            } catch (e) { toast.error("Failed to approve"); }
                          }
                        }}>Approve</button>
                        <button className="btn-action danger flex-1 justify-center py-1.5 text-xs" onClick={async () => {
                          if (await confirm({ title: "Reject User", message: "Reject this tester request?" })) {
                            try {
                              await API.put(`/user/users/reject/${u._id}`);
                              setUsers(users.map(usr => usr._id === u._id ? { ...usr, status: "rejected" } : usr));
                              toast.success("User Rejected!");
                            } catch (e) { toast.error("Failed to reject"); }
                          }
                        }}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Users Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Users size={20} className="text-indigo-600" /> All Users
                </h3>
                <button className="btn-primary" onClick={() => navigate("/create-user")}><PlusCircle size={18} /> Invite User</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(() => {
                  const ROLE_LEVELS = { admin: 4, project_manager: 3, developer: 2, tester: 1 };
                  const myLevel = ROLE_LEVELS[loggedInUser?.role] || 0;
                  return users
                    .filter(u => u.status !== "pending")
                    .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.role.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(u => {
                      const targetLevel = ROLE_LEVELS[u.role] || 0;
                      const canModify = myLevel > targetLevel;
                      return (
                        <div key={u._id} className="glass-card p-5 text-center flex flex-col items-center group">
                          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600 mb-3 border-4 border-white shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                            {u.profilePicture ? <img src={u.profilePicture} alt={u.name} className="w-full h-full object-cover" /> : u.name.charAt(0).toUpperCase()}
                          </div>
                          <h3 className="font-bold text-slate-800 truncate w-full">{u.name}</h3>
                          <p className="text-xs text-slate-500 font-semibold mb-3 truncate w-full">{u.email}</p>
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase mb-4">{u.role.replace('_', ' ')}</span>
                          {canModify ? (
                            <div className="w-full flex gap-2 border-t border-slate-100 pt-4 mt-auto">
                              <button onClick={() => navigate(`/edit-user/${u._id}`)} className="btn-action flex-1 justify-center py-1.5 text-xs"><Edit size={14} className="mr-1" /> Edit</button>
                              <button className="btn-action danger flex-1 justify-center py-1.5 text-xs" onClick={async () => {
                                if (!(await confirm({ title: "Delete User", message: "Are you sure you want to remove this user from the system?" }))) return;
                                await API.delete(`/user/users/${u._id}`);
                                setUsers(users.filter(usr => usr._id !== u._id));
                              }}><Trash2 size={14} /></button>
                            </div>
                          ) : (
                            <div className="w-full border-t border-slate-100 pt-4 mt-auto">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-500 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                <ShieldCheck size={12} /> Higher Role
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    });
                })()}
              </div>
            </div>
          </div>
        );

      case "tasks_sprints":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button className="btn-primary flex-1" onClick={() => navigate("/create-task")}><PlusCircle size={18} /> New Task</button>
              <button className="btn-primary flex-1" style={{ background: '#334155' }} onClick={() => navigate("/sprint")}><PlusCircle size={18} /> New Sprint</button>
            </div>

            {/* Sprint Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="glass-card p-4 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sprints</p>
                <h3 className="text-2xl font-black text-slate-800">{sprints.length}</h3>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Planned</p>
                <h3 className="text-2xl font-black text-blue-600">{sprintStats.planned}</h3>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active</p>
                <h3 className="text-2xl font-black text-emerald-600">{sprintStats.active}</h3>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</p>
                <h3 className="text-2xl font-black text-indigo-600">{sprintStats.completed}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2"><Activity size={18} className="text-indigo-600" /> Sprints ({sprints.length})</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {sprints.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 font-semibold">No sprints created yet</div>
                  ) : sprints
                    .filter(s => s.sprintName.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(s => (
                      <div key={s._id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-200 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-slate-800">{s.sprintName}</h4>
                            <p className="text-xs text-slate-500 font-semibold mt-1">{s.projectId?.projectName || "No Project"}</p>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : s.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{s.status}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold mb-3">
                          <span>Tasks: <strong className="text-slate-700">{s.tasks?.length || 0}</strong></span>
                          {s.startDate && <span>Start: {new Date(s.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                          {s.endDate && <span>End: {new Date(s.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => navigate(`/edit-sprint/${s._id}`)} className="btn-action py-1.5 text-xs flex-1 justify-center"><Edit size={13} className="mr-1" /> Edit</button>
                          <button onClick={async () => {
                            if (!await confirm({ title: "Delete Sprint", message: "Are you sure you want to delete this sprint?" })) return;
                            try { await deleteSprint(s._id); setSprints(sprints.filter(sp => sp._id !== s._id)); toast.success("Sprint deleted"); } catch (e) { toast.error("Delete failed"); }
                          }} className="btn-action danger py-1.5 text-xs justify-center" style={{ minWidth: '36px' }}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2"><CheckCircle size={18} className="text-indigo-600" /> Task Assignments ({allTasks.length})</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {allTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 font-semibold">No tasks created yet</div>
                  ) : allTasks
                    .filter(t => t.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(t => (
                      <div key={t._id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-200 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === 'completed' ? 'bg-emerald-500' : t.status === 'in progress' ? 'bg-amber-500' : t.status === 'testing' ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                              <span className="truncate">{t.taskTitle}</span>
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{t.status || 'pending'}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.priority === 'high' ? 'bg-orange-100 text-orange-700' : t.priority === 'low' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.priority || 'medium'}</span>
                              {t.assignedDeveloper?.name && <span className="text-[10px] text-indigo-600 font-bold">👤 {t.assignedDeveloper.name}</span>}
                              {t.moduleId?.moduleName && <span className="text-[10px] text-cyan-600 font-bold">📦 {t.moduleId.moduleName}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Sprint Assignment Row */}
                        <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-100">
                          <select
                            className="custom-select py-1.5 px-3 text-xs flex-1 min-w-[140px]"
                            value={taskSprintMap[t._id] || ""}
                            onChange={e => setTaskSprintMap({ ...taskSprintMap, [t._id]: e.target.value })}
                            style={{ borderRadius: '10px', background: '#fff', border: '1px solid #e2e8f0' }}
                          >
                            <option value="">Assign to sprint...</option>
                            {sprints.map(s => <option key={s._id} value={s._id}>{s.sprintName}</option>)}
                          </select>
                          <button onClick={async () => {
                            if (!taskSprintMap[t._id]) return toast.error("Select a sprint first");
                            try {
                              await assignTaskToSprint({ sprintId: taskSprintMap[t._id], taskId: t._id });
                              toast.success("Task assigned to sprint! ✅");
                              setTaskSprintMap(prev => ({ ...prev, [t._id]: "" }));
                            } catch (e) { toast.error("Assignment failed"); }
                          }} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1" title="Assign to Sprint">
                            <PlusCircle size={13} /> Assign
                          </button>
                          <button onClick={() => navigate(`/task-detail/${t._id}`)} className="btn-action py-1.5 text-xs text-indigo-600 border-indigo-200" title="Review Task">Review</button>
                          <button onClick={() => navigate(`/edit-task/${t._id}`)} className="btn-action py-1.5 text-xs" title="Edit Task"><Edit size={13} /></button>
                          <button onClick={() => handleDeleteTask(t._id)} className="btn-action danger py-1.5 text-xs" title="Delete Task"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )

      case "manage_modules":
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <span className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
                    <Package size={20} className="text-white" />
                  </span>
                  Manage Modules
                </h2>
                <p className="text-sm text-slate-500 font-semibold mt-1 ml-[52px]">{filteredModules.length} modules across {projects.length} projects</p>
              </div>
              <button className="btn-primary" onClick={() => { setEditingModule(null); setShowModuleForm(true); }}>
                <PlusCircle size={18} /> Add Module
              </button>
            </div>

            {/* Filters Bar */}
            <div className="glass-card p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white outline-none transition-all font-semibold text-slate-700 placeholder-slate-400 text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      className="pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 text-sm outline-none cursor-pointer appearance-none"
                      value={moduleFilterProject}
                      onChange={(e) => setModuleFilterProject(e.target.value)}
                    >
                      <option value="">All Projects</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                    </select>
                  </div>
                  <select
                    className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 text-sm outline-none cursor-pointer"
                    value={moduleFilterStatus}
                    onChange={(e) => setModuleFilterStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Module Cards Grid */}
            {filteredModules.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Package size={48} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-500 mb-1">No Modules Found</h3>
                <p className="text-sm text-slate-400 font-medium">Try adjusting your filters or create a new module.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredModules.map((mod) => (
                  <div key={mod._id} className="module-card glass-card p-5 flex flex-col hover:-translate-y-1 transition-all duration-300 group">
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Package size={18} className="text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 truncate text-sm">{mod.moduleName}</h3>
                          <p className="text-[11px] text-indigo-500 font-bold truncate">
                            {mod.projectId?.projectName || "No Project"}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(mod.status)}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2 leading-relaxed">{mod.description}</p>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Priority</p>
                        <div className="mt-1 flex justify-center">{getPriorityBadge(mod.priority)}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tasks</p>
                        <p className="text-lg font-black text-slate-800 mt-0.5">{getModuleTaskCount(mod._id)}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                        <Calendar size={12} />
                        {mod.createdAt ? new Date(mod.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { setEditingModule(mod); setShowModuleForm(true); }}
                          className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit Module"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => confirmDeleteModule(mod._id)}
                          className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Module"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "overview":
      default:
        return (
          <div className="space-y-6 animate-fade-in">
            <AnnouncementBanner />
            {/* STATS STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-5 !rounded-2xl border-l-4 border-l-indigo-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Projects</p>
                <h3 className="text-3xl font-black text-slate-800">{projects.length}</h3>
              </div>
              <div className="glass-card p-5 !rounded-2xl border-l-4 border-l-amber-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Tasks</p>
                <h3 className="text-3xl font-black text-slate-800">{allTasks.length}</h3>
              </div>
              <div className="glass-card p-5 !rounded-2xl border-l-4 border-l-red-500 cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => setActiveTab('bug_tracking')}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Open Bugs</p>
                <h3 className="text-3xl font-black text-red-600">{bugs.filter(b => ["open", "submitted", "draft"].includes(b.status?.toLowerCase())).length}</h3>
              </div>
              <div className="glass-card p-5 !rounded-2xl border-l-4 border-l-emerald-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Sprints</p>
                <h3 className="text-3xl font-black text-slate-800">{sprintStats.active}</h3>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-4">Task Completion Matrix</h3>
                <div className="flex-1 w-full" style={{ height: '250px', minHeight: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <BarChart data={taskStatusData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                      <Bar dataKey="Count" radius={[6, 6, 0, 0]} barSize={40}>
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6 flex flex-col items-center">
                <h3 className="font-bold text-slate-800 mb-2 w-full text-left">Incident Severity Ratio</h3>
                <div className="flex-1 w-full flex items-center justify-center relative" style={{ height: '250px', minHeight: '250px' }}>
                  {bugSeverityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" debounce={100}>
                      <PieChart>
                        <Pie data={bugSeverityData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                          {bugSeverityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px", fontWeight: "bold" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-slate-400 font-bold">No buggy severity data</p>}
                </div>
              </div>
            </div>

            {/* ACTIVITY FEED */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Activity size={20} className="text-indigo-600" /> Live System Activity Feed</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {activityFeed.length === 0 ? <p className="text-slate-400 italic font-medium p-4 border-2 border-dashed border-slate-200 rounded-xl text-center">No recent activity detected.</p> : activityFeed.map((log) => (
                  <div key={log._id} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-500 flex-shrink-0 shadow-sm mt-1 group-hover:scale-105 transition">
                      {log.userId?.profilePicture ? (
                        <img src={log.userId.profilePicture} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-sm uppercase">{log.userId?.name?.charAt(0) || "U"}</span>
                      )}
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl border border-white shadow-sm hover:shadow-md transition-shadow flex-1 group relative">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800"><span className="text-indigo-600">{log.userId?.name || "System"}</span> {log.description}</span>
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase self-start mt-1">Entity: {log.entityType}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap bg-slate-50 p-1 rounded border border-slate-100 shrink-0">
                          {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "reviews":
        const pendingReviews = allReviews.filter(r => !r.isApproved).filter(r => r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || r.message?.toLowerCase().includes(searchTerm.toLowerCase()));
        const approvedReviews = allReviews.filter(r => r.isApproved).filter(r => r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || r.message?.toLowerCase().includes(searchTerm.toLowerCase()));
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-5 !rounded-2xl border-l-4 border-l-amber-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending</p>
                <h3 className="text-3xl font-black text-amber-600">{allReviews.filter(r => !r.isApproved).length}</h3>
              </div>
              <div className="glass-card p-5 !rounded-2xl border-l-4 border-l-emerald-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Approved</p>
                <h3 className="text-3xl font-black text-emerald-600">{allReviews.filter(r => r.isApproved).length}</h3>
              </div>
              <div className="glass-card p-5 !rounded-2xl border-l-4 border-l-indigo-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total</p>
                <h3 className="text-3xl font-black text-slate-800">{allReviews.length}</h3>
              </div>
              <div className="glass-card p-5 !rounded-2xl border-l-4 border-l-purple-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Avg Rating</p>
                <h3 className="text-3xl font-black text-purple-600">
                  {allReviews.filter(r => r.isApproved).length > 0 ? (allReviews.filter(r => r.isApproved).reduce((sum, r) => sum + r.rating, 0) / allReviews.filter(r => r.isApproved).length).toFixed(1) : "—"}
                </h3>
              </div>
            </div>

            {/* Pending Reviews */}
            {pendingReviews.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <h3 className="text-xl font-black text-slate-800">Pending Reviews ({pendingReviews.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingReviews.map((r) => (
                    <div key={r._id} className="glass-card p-5 border-l-4 border-l-amber-400">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-600">
                            {r.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{r.name}</h4>
                            <p className="text-[11px] text-slate-500 font-semibold">{r.role}{r.company ? `, ${r.company}` : ""}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < r.rating ? "#f59e0b" : "none"} color={i < r.rating ? "#f59e0b" : "#e2e8f0"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed italic">"{r.message}"</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(r.createdAt).toLocaleDateString()}</span>
                        <div className="flex gap-2">
                          <button className="btn-action py-1.5 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={async () => {
                            if (await confirm({ title: "Approve Review", message: "Approve this review? It will be visible on the landing page." })) {
                              try { await approveReview(r._id); setAllReviews(allReviews.map(rv => rv._id === r._id ? { ...rv, isApproved: true } : rv)); toast.success("Review approved! ✅"); } catch (e) { toast.error("Failed to approve"); }
                            }
                          }}>Approve</button>
                          <button className="btn-action py-1.5 text-xs text-red-500 border-red-200 hover:bg-red-50" onClick={async () => {
                            if (await confirm({ title: "Reject Review", message: "Reject this review?" })) {
                              try { await rejectReview(r._id); toast.success("Review rejected"); } catch (e) { toast.error("Failed"); }
                            }
                          }}>Reject</button>
                          <button className="btn-action danger py-1.5 text-xs" onClick={async () => {
                            if (await confirm({ title: "Delete Review", message: "Permanently delete this review?" })) {
                              try { await deleteReviewApi(r._id); setAllReviews(allReviews.filter(rv => rv._id !== r._id)); toast.success("Review deleted 🗑️"); } catch (e) { toast.error("Failed"); }
                            }
                          }}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Reviews */}
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                <CheckCircle size={18} className="text-emerald-500" />
                <h3 className="text-xl font-black text-slate-800">Approved Reviews ({approvedReviews.length})</h3>
              </div>
              {approvedReviews.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <MessageSquare size={36} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 font-semibold">No approved reviews yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {approvedReviews.map((r) => (
                    <div key={r._id} className="glass-card p-5 border-l-4 border-l-emerald-400">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-600">
                            {r.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{r.name}</h4>
                            <p className="text-[11px] text-slate-500 font-semibold">{r.role}{r.company ? `, ${r.company}` : ""}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < r.rating ? "#f59e0b" : "none"} color={i < r.rating ? "#f59e0b" : "#e2e8f0"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed italic">"{r.message}"</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(r.createdAt).toLocaleDateString()}</span>
                        <button className="btn-action danger py-1.5 text-xs" onClick={async () => {
                          if (await confirm({ title: "Delete Review", message: "Permanently delete this approved review?" })) {
                            try { await deleteReviewApi(r._id); setAllReviews(allReviews.filter(rv => rv._id !== r._id)); toast.success("Review deleted 🗑️"); } catch (e) { toast.error("Failed"); }
                          }
                        }}><Trash2 size={13} /> Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-wrapper relative min-h-screen text-slate-800 flex overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .admin-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; background: #ccd6ff; }
        .bg-circle { position: absolute; border: 15px solid rgba(79, 70, 229, 0.05); border-radius: 50%; pointer-events: none; z-index: 0; }
        .c1 { width: 800px; height: 800px; top: -200px; right: -200px; animation: float 20s infinite; }
        .c2 { width: 500px; height: 500px; bottom: 0px; left: -100px; animation: float 15s infinite reverse; }
        @keyframes float { 50% { transform: translateY(-30px) scale(1.05); } }
        
        .sidebar { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(25px); border-right: 1px solid rgba(255,255,255,0.7); box-shadow: 10px 0 30px rgba(0,0,0,0.03); z-index: 40; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .main-content { z-index: 10; padding: 2rem; overflow-y: auto; height: 100vh; flex: 1; }
        
        .nav-link { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 14px; color: #64748b; font-weight: 700; font-size: 0.95rem; transition: 0.3s; cursor: pointer; border: 1px solid transparent; }
        .nav-link:hover { background: #f8fafc; color: #4f46e5; }
        .nav-link.active { background: #fff; color: #4f46e5; border-color: rgba(79,70,229,0.1); box-shadow: 0 4px 15px rgba(79,70,229,0.08); }
        
        .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        
        .btn-primary { background: #121212; color: #fff; padding: 0.6rem 1.2rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; transition: 0.3s; display: inline-flex; align-items: center; gap: 8px; border: none; cursor: pointer; white-space: nowrap;}
        .btn-primary:hover { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25); }
        .btn-action { background: #fff; color: #1e293b; border: 1px solid #e2e8f0; padding: 0.4rem 0.8rem; border-radius: 10px; font-weight: 700; transition: 0.2s; cursor: pointer; display: inline-flex; align-items: center;}
        .btn-action:hover { border-color: #4f46e5; color: #4f46e5; background: #f8fafc; }
        .btn-action.danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
        
        .custom-select { padding: 0.4rem 0.8rem; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; outline: none; font-weight: 700; color: #334155; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }

        .module-card { position: relative; overflow: hidden; }
        .module-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #4f46e5, #06b6d4);
          opacity: 0; transition: opacity 0.3s;
        }
        .module-card:hover::before { opacity: 1; }

        .delete-modal-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; padding: 16px;
          animation: modalBgFade 0.2s ease;
        }
        @keyframes modalBgFade { from { opacity: 0; } to { opacity: 1; } }
        .delete-modal {
          background: #fff; border-radius: 20px; padding: 32px; width: 100%; max-width: 400px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.15);
          animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: center;
        }
        @keyframes modalPop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      <div className="bg-circle c1"></div>
      <div className="bg-circle c2"></div>

      {/* SIDEBAR */}
      <div className={`sidebar fixed md:relative h-screen w-72 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:translate-x-0`}>

        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <BugIcon size={20} strokeWidth={3} />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Fixify<span className="text-indigo-600">.</span></span>
          </div>
          <button className="md:hidden p-2 text-slate-500 bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <div className="px-5 py-4 mb-4">
          <div className="nav-link bg-indigo-50/50 border-indigo-100/50 cursor-default flex items-center gap-3 p-3 rounded-2xl">
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
              {loggedInUser?.profilePicture ? <img src={loggedInUser.profilePicture} className="w-full h-full object-cover" /> : <span className="font-bold text-indigo-600">{loggedInUser?.name?.charAt(0) || "A"}</span>}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{loggedInUser?.name || "Admin"}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500 truncate">{loggedInUser?.role?.replace('_', ' ') || "ADMINISTRATOR"}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 space-y-1 custom-scrollbar">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4 mb-2 mt-2">Main Menu</p>
          <div className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><Layers size={18} /> Dashboard Overview</div>
          <div className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}><FileText size={18} /> Projects Portfolio</div>
          <div className={`nav-link ${activeTab === 'manage_modules' ? 'active' : ''}`} onClick={() => setActiveTab('manage_modules')}><Package size={18} /> Manage Modules</div>
          <div className={`nav-link ${activeTab === 'tasks_sprints' ? 'active' : ''}`} onClick={() => setActiveTab('tasks_sprints')}><CheckCircle size={18} /> Tasks & Sprints</div>
          <div className={`nav-link ${activeTab === 'bug_tracking' ? 'active' : ''}`} onClick={() => setActiveTab('bug_tracking')}><BugIcon size={18} /> System Bugs</div>
          <div className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3"><Users size={18} /> User Management</div>
              {users.filter(u => u.status === 'pending').length > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-md shadow-red-500/40">{users.filter(u => u.status === 'pending').length}</span>
              )}
            </div>
          </div>
          <div className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3"><MessageSquare size={18} /> Reviews</div>
              {allReviews.filter(r => !r.isApproved).length > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-md shadow-amber-500/40">{allReviews.filter(r => !r.isApproved).length}</span>
              )}
            </div>
          </div>

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4 mb-2 mt-8">Quick Actions</p>
          <div className="nav-link hover:text-indigo-600" onClick={() => { setEditingModule(null); setShowModuleForm(true); }}><PlusCircle size={18} /> Add Module</div>
        </div>

        <div className="p-5 border-t border-slate-200/60 mt-auto space-y-2">
          <div className="nav-link hover:text-indigo-600" onClick={() => navigate("/profile")}><Settings size={18} /> Account Settings</div>
          <div className="nav-link text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleLogout}><LogOut size={18} /> Secure Logout</div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content flex flex-col relative w-full md:w-auto">

        {/* MOBILE HEADER */}
        <div className="md:hidden mb-6 flex items-center justify-between gap-4 bg-white/70 p-4 rounded-2xl backdrop-blur-md shadow-sm border border-white">
          <div className="flex items-center gap-4">
            <button className="p-2 bg-slate-100 rounded-lg text-slate-600" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <h2 className="font-black text-slate-800 uppercase tracking-wider text-xl italic mt-1">Fixify.</h2>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="relative w-32 sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/60 border-none outline-none font-semibold text-slate-700 text-xs" />
            </div>
          </div>
        </div>

        {/* DESKTOP TOP BAR */}
        <div className="hidden md:flex justify-between items-center mb-6 bg-white/40 p-4 rounded-2xl backdrop-blur-md border border-white/60 shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder={`Search in ${activeTab.replace('_', ' ')}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/60 border-none focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition-all font-semibold text-slate-700 placeholder-slate-400 text-sm" />
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="text-sm font-bold text-slate-500 bg-white/60 px-4 py-2 rounded-xl">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {renderContent()}
        </div>
      </div>

      {/* MODULE FORM MODAL */}
      <ModuleFormModal
        isOpen={showModuleForm}
        onClose={() => { setShowModuleForm(false); setEditingModule(null); }}
        onSuccess={fetchAllModules}
        editModule={editingModule}
      />


    </div>
  );
};

export default AdminDashboard;


