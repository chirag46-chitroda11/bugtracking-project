import React, { useState, useEffect, useCallback } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Trash2, ExternalLink, Search, Bug as BugIcon } from "lucide-react";
import { useConfirm } from "../../context/ConfirmContext";

const PMBugs = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({ open: false, bug: null });
  const [deleting, setDeleting] = useState(false);

  const fetchBugs = useCallback(async () => {
    try {
      const res = await API.get("/bug");
      setBugs(res.data.data || []);
    } catch (err) {
      console.error("Error fetching bugs:", err);
      toast.error("Failed to load bugs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBugs(); }, [fetchBugs]);

  const filteredBugs = bugs.filter(b => {
    const matchSearch = !search ||
      b.bugTitle?.toLowerCase().includes(search.toLowerCase()) ||
      (typeof b.reportBy === "string" ? b.reportBy : b.reportBy?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === "all" || b.severity === severityFilter;
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });

  const handleDelete = async (bug) => {
    if (!(await confirm({ title: "Archive Bug", message: `Are you sure you want to archive "${bug.bugTitle}"? This will permanently remove it from the system.` }))) return;
    setDeleting(true);
    try {
      await API.delete(`/bug/${bug._id}`);
      toast.success(`Bug "${bug.bugTitle}" archived`);
      fetchBugs();
    } catch (err) {
      toast.error("Failed to archive bug");
    } finally {
      setDeleting(false);
    }
  };

  const severityColors = {
    critical: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-blue-100 text-blue-700"
  };

  const statusColors = {
    open: "border-red-200 text-red-600 bg-red-50",
    submitted: "border-amber-200 text-amber-600 bg-amber-50",
    in_progress: "border-blue-200 text-blue-600 bg-blue-50",
    retest: "border-purple-200 text-purple-600 bg-purple-50",
    resolved: "border-emerald-200 text-emerald-600 bg-emerald-50",
    closed: "border-slate-200 text-slate-500 bg-slate-50",
    reopened: "border-red-300 text-red-700 bg-red-50",
    draft: "border-slate-200 text-slate-400 bg-slate-50"
  };

  if (loading) return <div className="text-center font-bold text-slate-500 p-8">Loading Bug Reports...</div>;

  return (
    <div className="space-y-6 animate-fade-in">


      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-2 border-b border-slate-100 pb-4">
        <div>
           <h2 className="text-2xl font-black text-slate-800">Bug Reports</h2>
           <p className="text-sm font-semibold text-slate-500 mt-1">Cross-functional incident matrix</p>
        </div>
        <div className="flex gap-3">
           <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">{filteredBugs.length} records</span>
           <button onClick={() => navigate('/create-bug')} className="bg-red-50 hover:bg-red-500 hover:text-white text-red-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-red-100 transition flex items-center gap-2">
              <BugIcon size={16}/> New Bug
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search bugs or reporter..."
            className="custom-input !mb-0 pl-9 w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="custom-select" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="custom-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="submitted">Submitted</option>
          <option value="in_progress">In Progress</option>
          <option value="retest">Retest</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="reopened">Reopened</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">BUG</th>
                <th className="p-4">TASK</th>
                <th className="p-4">REPORTED BY</th>
                <th className="p-4">ASSIGNED TO</th>
                <th className="p-4">SEVERITY</th>
                <th className="p-4">STATUS</th>
                <th className="p-4">DATE</th>
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBugs.map((bug) => (
                <tr key={bug._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                  <td className="p-4">
                     <p className="font-bold text-slate-800 max-w-[200px] truncate">{bug.bugTitle}</p>
                     <p className="text-xs text-slate-400 font-medium truncate max-w-xs mt-0.5">{bug.stepsToReproduce}</p>
                  </td>
                  <td className="p-4 text-slate-600 font-bold">{bug.taskId?.taskTitle || "N/A"}</td>
                  <td className="p-4 font-semibold text-slate-700">
                    {typeof bug.reportBy === "object" ? bug.reportBy?.name : bug.reportBy || "User"}
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{bug.assignedDeveloper?.name || "Unassigned"}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${severityColors[bug.severity] || "bg-slate-100 text-slate-600"}`}>
                      {bug.severity || "N/A"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded border text-xs font-bold ${statusColors[bug.status] || statusColors.draft}`}>
                      {bug.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-semibold text-xs">
                    {new Date(bug.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => navigate(`/bug-detail/${bug._id}`)}
                        className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition border border-transparent hover:border-indigo-200"
                        title="View Bug"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(bug)}
                        className="p-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-lg transition border border-transparent hover:border-red-200"
                        title="Delete Bug"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBugs.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-10 text-center font-bold text-slate-400">
                    {bugs.length === 0 ? "No bugs reported yet." : "No bugs match your filters."}
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

export default PMBugs;
