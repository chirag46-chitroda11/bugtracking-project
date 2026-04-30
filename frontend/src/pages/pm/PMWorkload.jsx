import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { AlertTriangle, Clock, CheckCircle, Bug as BugIcon, Users } from "lucide-react";
import { SkeletonCard, SkeletonUserGrid, SkeletonParticles } from "../../components/skeleton";

const PMWorkload = () => {
  const [workloads, setWorkloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const fetchWorkloads = async () => {
      try {
        const [usersRes, tasksRes, bugsRes] = await Promise.all([
          API.get("/user/users"),
          API.get("/task"),
          API.get("/bug")
        ]);

        const allUsers = (usersRes.data.data || []).filter(u => u.role === "developer" || u.role === "tester");
        const tasks = tasksRes.data.data || [];
        const bugs = bugsRes.data.data || [];
        const now = new Date();

        const calculatedWorkloads = allUsers.map(user => {
          const uid = user._id;

          const userTasks = tasks.filter(t =>
            (t.assignedDeveloper?._id || t.assignedDeveloper) === uid ||
            (t.assignedTester?._id || t.assignedTester) === uid
          );
          const userBugs = bugs.filter(b =>
            (b.assignedDeveloper?._id || b.assignedDeveloper) === uid ||
            b.qaTesterId === uid
          );

          const activeTasks = userTasks.filter(t => t.status !== "completed");
          const completedTasks = userTasks.filter(t => t.status === "completed");
          const delayedTasks = activeTasks.filter(t => t.endDate && new Date(t.endDate) < now);
          const openBugs = userBugs.filter(b => ["open", "submitted", "in_progress", "retest", "reopened"].includes(b.status));

          const totalLoggedHours = userTasks.reduce((sum, t) => sum + (t.timeSpent ? t.timeSpent / 3600 : 0), 0);
          const totalEstimatedHours = userTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

          const capacityLabel = activeTasks.length > 5
            ? "Overloaded"
            : activeTasks.length > 2
              ? "Optimal"
              : "Available";

          return {
            ...user,
            activeTasksCount: activeTasks.length,
            completedTasksCount: completedTasks.length,
            delayedTasksCount: delayedTasks.length,
            openBugsCount: openBugs.length,
            totalLoggedHours: totalLoggedHours.toFixed(1),
            totalEstimatedHours: totalEstimatedHours.toFixed(1),
            capacity: capacityLabel,
            efficiencyPct: totalEstimatedHours > 0
              ? Math.min(Math.round((totalLoggedHours / totalEstimatedHours) * 100), 150)
              : null
          };
        });

        // Sort
        const sorted = [...calculatedWorkloads].sort((a, b) => {
          if (sortBy === "overloaded") return (b.activeTasksCount - a.activeTasksCount);
          if (sortBy === "delayed") return (b.delayedTasksCount - a.delayedTasksCount);
          return a.name.localeCompare(b.name);
        });

        setWorkloads(sorted);
      } catch (err) {
        console.error("Error fetching workload:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkloads();
  }, [sortBy]);

  const riskCount = workloads.filter(w => w.capacity === "Overloaded" || w.delayedTasksCount > 0).length;

  if (loading) return (
    <div className="space-y-6 animate-fade-in" style={{ position: 'relative' }}>
      <SkeletonParticles count={6} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex justify-between items-center mb-6">
          <div className="skeleton-shimmer" style={{ height: 28, width: 260, borderRadius: 10 }} />
          <div className="skeleton-shimmer" style={{ height: 36, width: 140, borderRadius: 8 }} />
        </div>
        <SkeletonCard count={4} columns={4} />
        <div style={{ marginTop: 24 }}>
          <SkeletonUserGrid count={6} columns={3} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Team Workload Dashboard</h2>
          <p className="text-slate-500 font-semibold text-sm">Real-time capacity and risk visibility across all team members.</p>
        </div>
        <div className="flex items-center gap-3">
          {riskCount > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-xs font-black text-red-600">{riskCount} at risk</span>
            </div>
          )}
          <select
            className="custom-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="name">Sort: Name</option>
            <option value="overloaded">Sort: Busiest First</option>
            <option value="delayed">Sort: Most Delayed</option>
          </select>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 !rounded-xl border-l-4 border-l-indigo-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Members</p>
          <p className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Users size={18} className="text-indigo-400" /> {workloads.length}
          </p>
        </div>
        <div className="glass-card p-4 !rounded-xl border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available</p>
          <p className="text-2xl font-black text-emerald-600">{workloads.filter(w => w.capacity === "Available").length}</p>
        </div>
        <div className="glass-card p-4 !rounded-xl border-l-4 border-l-amber-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Optimal Load</p>
          <p className="text-2xl font-black text-amber-600">{workloads.filter(w => w.capacity === "Optimal").length}</p>
        </div>
        <div className="glass-card p-4 !rounded-xl border-l-4 border-l-red-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Overloaded</p>
          <p className="text-2xl font-black text-red-600">{workloads.filter(w => w.capacity === "Overloaded").length}</p>
        </div>
      </div>

      {/* Workload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workloads.map((wl) => {
          const isOverloaded = wl.capacity === "Overloaded";
          const isAvailable = wl.capacity === "Available";

          return (
            <div
              key={wl._id}
              className={`glass-card p-6 border-t-4 transition-all shadow-sm hover:shadow-md ${
                isOverloaded ? "border-t-red-500 bg-red-50/10" : isAvailable ? "border-t-emerald-500" : "border-t-amber-500"
              }`}
            >
              {/* User Header */}
              <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-100/80">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-indigo-100 flex items-center justify-center font-black text-lg text-indigo-700 flex-shrink-0">
                  {wl.profilePicture
                    ? <img src={wl.profilePicture} alt="P" className="w-full h-full object-cover"/>
                    : wl.name?.charAt(0).toUpperCase()
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 leading-tight truncate">{wl.name}</h3>
                  <div className="flex gap-2 items-center mt-1 flex-wrap">
                    <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest">
                      {wl.role?.replace("_", " ")}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                      isOverloaded ? "bg-red-100 text-red-700" : isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {wl.capacity}
                    </span>
                  </div>
                </div>
                {wl.delayedTasksCount > 0 && (
                  <AlertTriangle size={16} className="text-red-400 flex-shrink-0" title="Has delayed tasks" />
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1 mb-1">
                    <CheckCircle size={11} className="text-slate-400" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Tasks</p>
                  </div>
                  <p className="text-2xl font-black text-slate-700">{wl.activeTasksCount}</p>
                  <p className="text-[9px] text-slate-400 font-semibold">{wl.completedTasksCount} completed</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1 mb-1">
                    <BugIcon size={11} className="text-slate-400" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Open Bugs</p>
                  </div>
                  <p className={`text-2xl font-black ${wl.openBugsCount > 0 ? "text-orange-500" : "text-slate-300"}`}>{wl.openBugsCount}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle size={11} className="text-slate-400" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Delayed</p>
                  </div>
                  <p className={`text-2xl font-black ${wl.delayedTasksCount > 0 ? "text-red-500" : "text-slate-300"}`}>
                    {wl.delayedTasksCount}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock size={11} className="text-slate-400" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hours Logged</p>
                  </div>
                  <p className="text-2xl font-black text-blue-600">{wl.totalLoggedHours}h</p>
                </div>
              </div>

              {/* Estimated vs Logged Bar */}
              {parseFloat(wl.totalEstimatedHours) > 0 && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2">
                    <span>Estimated: <span className="text-slate-700">{wl.totalEstimatedHours}h</span></span>
                    <span>Logged: <span className="text-blue-600">{wl.totalLoggedHours}h</span></span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        wl.efficiencyPct > 100 ? "bg-red-400" : "bg-blue-400"
                      }`}
                      style={{ width: `${Math.min(wl.efficiencyPct || 0, 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-right font-black text-slate-400 mt-1">
                    {wl.efficiencyPct !== null ? `${wl.efficiencyPct}% utilised` : "N/A"}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {workloads.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-white/60 rounded-xl bg-white/20">
            <Users size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-bold uppercase tracking-wider text-sm">No team members found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PMWorkload;
