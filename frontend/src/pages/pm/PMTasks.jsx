import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { deleteTask } from "../../services/taskService";
import toast, { Toaster } from "react-hot-toast";
import { Edit2, Trash2, ExternalLink, Search } from "lucide-react";

const PMTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({ open: false, task: null });
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await API.get("/task");
      setTasks(res.data.data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Live filters
  const filteredTasks = tasks.filter(t => {
    const matchSearch = !search || t.taskTitle?.toLowerCase().includes(search.toLowerCase()) || t.projectId?.projectName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleDelete = async () => {
    if (!deleteModal.task) return;
    setDeleting(true);
    try {
      await deleteTask(deleteModal.task._id);
      toast.success(`Task "${deleteModal.task.taskTitle}" deleted`);
      setDeleteModal({ open: false, task: null });
      fetchTasks();
    } catch (err) {
      toast.error("Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  const statusColors = {
    completed: "bg-emerald-100 text-emerald-700",
    testing: "bg-purple-100 text-purple-700",
    "in progress": "bg-amber-100 text-amber-700",
    pending: "bg-slate-100 text-slate-700"
  };

  const priorityColors = {
    high: "text-red-500",
    critical: "text-red-600 font-black",
    medium: "text-amber-500",
    low: "text-slate-400"
  };

  if (loading) return <div className="text-center font-bold text-slate-500 p-8">Loading Tasks...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Toaster position="top-right" />

      {/* Delete Confirm Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-100">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-800 text-center mb-2">Delete Task?</h3>
            <p className="text-slate-500 text-center text-sm font-semibold mb-6">
              Are you sure you want to delete <span className="font-black text-slate-800">"{deleteModal.task?.taskTitle}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ open: false, task: null })} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-white transition disabled:opacity-60">
                {deleting ? "Deleting..." : "Delete Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
        <h2 className="text-2xl font-black text-slate-800">Global Task Board</h2>
        <button onClick={() => navigate("/create-task")} className="btn-primary !py-2 !px-5 text-sm">
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks or projects..."
            className="custom-input !mb-0 pl-9 w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="custom-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="testing">Testing</option>
          <option value="completed">Completed</option>
        </select>
        <select className="custom-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
          {filteredTasks.length} tasks
        </span>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">TASK</th>
                <th className="p-4">PROJECT</th>
                <th className="p-4">MODULE</th>
                <th className="p-4">ASSIGNED TO</th>
                <th className="p-4">STATUS</th>
                <th className="p-4">PRIORITY</th>
                <th className="p-4">EST. HRS</th>
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, idx) => (
                <tr key={task._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                  <td className="p-4 font-semibold text-slate-400 text-xs">T{idx + 1}</td>
                  <td className="p-4 font-bold text-slate-800 max-w-[200px]">
                    <p className="truncate">{task.taskTitle}</p>
                    {task.estimatedHours > 0 && (
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{task.estimatedHours}h estimated</p>
                    )}
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{task.projectId?.projectName || "Unknown"}</td>
                  <td className="p-4 text-slate-600 font-medium">{task.moduleId?.moduleName || "General"}</td>
                  <td className="p-4">
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {task.assignedDeveloper?.name?.charAt(0) || "U"}
                        </div>
                        <span className="font-bold text-slate-700 truncate max-w-[100px]">{task.assignedDeveloper?.name || "Unassigned"}</span>
                     </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[task.status] || statusColors.pending}`}>
                      {task.status || "pending"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-black text-xs uppercase ${priorityColors[task.priority] || "text-slate-500"}`}>
                      {task.priority || "medium"}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-500 text-sm">
                    {task.estimatedHours > 0 ? `${task.estimatedHours}h` : "—"}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => navigate(`/task-detail/${task._id}`)}
                        className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition border border-transparent hover:border-indigo-200"
                        title="Open Task"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        onClick={() => navigate(`/edit-task/${task._id}`)}
                        className="p-2 bg-slate-100 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-lg transition border border-transparent hover:border-amber-200"
                        title="Edit Task"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, task })}
                        className="p-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-lg transition border border-transparent hover:border-red-200"
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-10 text-center font-bold text-slate-400">
                    {tasks.length === 0 ? "No tasks created yet." : "No tasks match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PMTasks;
