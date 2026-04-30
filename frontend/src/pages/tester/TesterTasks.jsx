import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useConfirm } from "../../context/ConfirmContext";
import { SkeletonTable, SkeletonParticles } from "../../components/skeleton";

const TesterTasks = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchTestingTasks = async () => {
      try {
        // Use tester-scoped endpoint — server filters by testing-relevant status
        const res = await API.get("/task/my-testing-tasks");
        const allTasks = res.data.data || [];
        setTasks(allTasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestingTasks();
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-fade-in" style={{ position: 'relative' }}>
      <SkeletonParticles count={5} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex justify-between items-center mb-6">
          <div className="skeleton-shimmer" style={{ height: 28, width: 200, borderRadius: 10 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="skeleton-shimmer" style={{ height: 36, width: 160, borderRadius: 8 }} />
            <div className="skeleton-shimmer" style={{ height: 36, width: 130, borderRadius: 8 }} />
          </div>
        </div>
        <SkeletonTable rows={5} columns={6} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800">Tasks Pipeline</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="custom-select w-48"
          />
          <select className="custom-select max-w-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="testing">Ready for Testing</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={() => navigate("/create-bug")} className="btn-primary bg-red-500 hover:bg-red-600 !py-2 !px-4">
            Report Bug against Task
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4 uppercase tracking-widest text-[10px]">Task Name</th>
                <th className="p-4 uppercase tracking-widest text-[10px]">Project</th>
                <th className="p-4 uppercase tracking-widest text-[10px]">Dev Assignee</th>
                <th className="p-4 uppercase tracking-widest text-[10px]">Status</th>
                <th className="p-4 uppercase tracking-widest text-[10px]">Priority</th>
                <th className="p-4 text-right uppercase tracking-widest text-[10px]">Test Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.filter(t => t.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) && (statusFilter === 'all' || t.status === statusFilter)).length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center font-bold text-slate-500 py-10">No tasks match your criteria.</td>
                </tr>
              ) : tasks.filter(t => t.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) && (statusFilter === 'all' || t.status === statusFilter)).map((task) => (
                <tr key={task._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">{task.taskTitle}</td>
                  <td className="p-4 text-slate-600 font-medium">{task.projectId?.projectName || "Unknown"}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs overflow-hidden">
                        {task.assignedDeveloper?.profilePicture ? <img src={task.assignedDeveloper.profilePicture} alt="dev" className="w-full h-full object-cover" /> : (task.assignedDeveloper?.name?.charAt(0) || "U")}
                      </div>
                      <span className="font-bold text-slate-700">{task.assignedDeveloper?.name || "Unassigned"}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${task.status === 'testing' ? 'bg-purple-100 text-purple-700 border border-purple-200' : task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {task.status || "open"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-bold text-xs ${task.priority === 'high' || task.priority === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>
                      {task.priority || "Medium"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => navigate(`/tester-task/${task._id}`)} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg text-xs transition border border-indigo-200">View Details</button>
                    <button onClick={async () => {
                      if (await confirm({ title: "Approve Task", message: "Are you sure you want to approve this task as fully tested and ready for completion?" })) {
                        await API.put(`/task/${task._id}`, { status: "completed" });
                        setTasks(tasks.map(t => t._id === task._id ? { ...t, status: "completed" } : t));
                      }
                    }} className="ml-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold rounded-lg text-xs transition border border-emerald-200">Pass</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TesterTasks;
