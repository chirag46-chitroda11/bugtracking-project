import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { deleteSprint } from "../../services/sprintService";
import toast from "react-hot-toast";
import { Trash2, Edit2, Calendar, Target, CheckCircle } from "lucide-react";

const PMSprints = () => {
  const navigate = useNavigate();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({ open: false, sprint: null });
  const [deleting, setDeleting] = useState(false);

  const fetchSprints = useCallback(async () => {
    try {
      const res = await API.get("/sprint");
      setSprints(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load sprints");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSprints(); }, [fetchSprints]);

  const filteredSprints = sprints.filter(s => {
    const matchSearch = !search || s.sprintName?.toLowerCase().includes(search.toLowerCase()) || s.projectId?.projectName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async () => {
    if (!deleteModal.sprint) return;
    setDeleting(true);
    try {
      await deleteSprint(deleteModal.sprint._id);
      toast.success(`Sprint "${deleteModal.sprint.sprintName}" deleted`);
      setDeleteModal({ open: false, sprint: null });
      fetchSprints();
    } catch (err) {
      toast.error("Failed to delete sprint");
    } finally {
      setDeleting(false);
    }
  };

  const statusColors = {
    planned: "bg-slate-100 text-slate-600",
    active: "bg-emerald-100 text-emerald-700",
    completed: "bg-blue-100 text-blue-700"
  };

  const borderColors = {
    planned: "border-t-slate-400",
    active: "border-t-emerald-500",
    completed: "border-t-blue-500"
  };

  if (loading) return <div className="text-center font-bold text-slate-500 p-8">Loading Sprints...</div>;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Delete Confirm Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-100">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-800 text-center mb-2">Delete Sprint?</h3>
            <p className="text-slate-500 text-center text-sm font-semibold mb-6">
              Deleting <span className="font-black text-slate-800">"{deleteModal.sprint?.sprintName}"</span> will remove it permanently. Tasks assigned to this sprint will not be deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ open: false, sprint: null })} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-white transition disabled:opacity-60">
                {deleting ? "Deleting..." : "Delete Sprint"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Sprint Management</h2>
          <p className="text-slate-500 font-semibold text-sm">Manage iteration cycles and sprint velocity across projects.</p>
        </div>
        <button onClick={() => navigate("/create-sprint")} className="btn-primary !py-2 !px-5 text-sm">
          + New Sprint
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search sprints or projects..."
          className="custom-input !mb-0 w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="custom-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
          {filteredSprints.length} sprints
        </span>
      </div>

      {/* Sprint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSprints.map((sprint) => {
          const totalTasks = sprint.tasks?.length || 0;
          const completedTasks = sprint.tasks?.filter(t => t.status === 'completed' || t.status === 'done')?.length || 0;
          const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
          const isActive = sprint.status === "active";
          const isCompleted = sprint.status === "completed";

          return (
            <div key={sprint._id} className={`glass-card p-6 border-t-4 ${borderColors[sprint.status] || "border-t-slate-400"} shadow-sm hover:shadow-md transition-all`}>
              {/* Top */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-slate-800 truncate">{sprint.sprintName}</h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5 truncate">
                    <span className="text-indigo-500">{sprint.projectId?.projectName || "No Project"}</span>
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ml-2 flex-shrink-0 ${statusColors[sprint.status] || statusColors.planned}`}>
                  {sprint.status || "Planned"}
                </span>
              </div>

              {/* Sprint Goal */}
              {sprint.sprintGoal && (
                <div className="flex items-start gap-2 mb-3 bg-indigo-50/50 rounded-lg p-2 border border-indigo-100/50">
                  <Target size={12} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-indigo-600 font-semibold line-clamp-2">{sprint.sprintGoal}</p>
                </div>
              )}

              {/* Dates */}
              {(sprint.startDate || sprint.endDate) && (
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400">
                  <Calendar size={12} />
                  <span>
                    {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : "?"}
                    {" → "}
                    {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "?"}
                  </span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                  <span>Sprint Progress</span>
                  <span className={progress >= 100 ? "text-emerald-500" : "text-slate-600"}>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isCompleted ? "bg-blue-500" : isActive ? "bg-emerald-500" : "bg-slate-400"}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100/60 mb-4">
                <div className="text-center">
                  <p className="text-sm font-black text-slate-800">{totalTasks}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-emerald-600">{completedTasks}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Done</p>
                </div>
                {sprint.capacityHours > 0 && (
                  <div className="text-center">
                    <p className="text-sm font-black text-indigo-600">{sprint.capacityHours}h</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Capacity</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/edit-sprint/${sprint._id}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-xs font-bold transition"
                >
                  <Edit2 size={12}/> Edit Sprint
                </button>
                <button
                  onClick={() => setDeleteModal({ open: true, sprint })}
                  className="p-2 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-500 rounded-lg transition"
                  title="Delete Sprint"
                >
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          );
        })}

        {filteredSprints.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-white/60 rounded-xl bg-white/20">
            <CheckCircle size={32} className="text-slate-300 mx-auto mb-3"/>
            <p className="text-slate-400 font-bold uppercase tracking-wider text-sm">
              {sprints.length === 0 ? "No Sprints Created Yet." : "No sprints match your filters."}
            </p>
            {sprints.length === 0 && (
              <button onClick={() => navigate("/create-sprint")} className="mt-4 btn-primary !w-auto !px-6 text-sm">Create First Sprint</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PMSprints;
