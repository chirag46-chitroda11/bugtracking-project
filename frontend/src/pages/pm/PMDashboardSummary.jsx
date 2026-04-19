import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { Activity, Layers, CheckCircle, Bug as BugIcon, AlertCircle, Users, Clock } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import AnnouncementBanner from "../../components/AnnouncementBanner";
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Map action codes to human-readable labels and icons
const ACTION_META = {
  task_created:    { label: "Task Created",     color: "bg-emerald-100 text-emerald-600", icon: <CheckCircle size={16}/> },
  task_edited:     { label: "Task Edited",      color: "bg-blue-100 text-blue-600",       icon: <CheckCircle size={16}/> },
  task_reassigned: { label: "Task Reassigned",  color: "bg-indigo-100 text-indigo-600",   icon: <Users size={16}/> },
  task_deleted:    { label: "Task Deleted",     color: "bg-red-100 text-red-600",          icon: <CheckCircle size={16}/> },
  status_changed:  { label: "Status Changed",   color: "bg-amber-100 text-amber-600",     icon: <Activity size={16}/> },
  tester_assigned: { label: "Tester Assigned",  color: "bg-purple-100 text-purple-600",  icon: <Users size={16}/> },
  time_logged:     { label: "Time Logged",      color: "bg-blue-100 text-blue-600",       icon: <Clock size={16}/> },
  comment_added:   { label: "Comment Added",    color: "bg-slate-100 text-slate-600",     icon: <Activity size={16}/> },
  bug_edited:      { label: "Bug Edited",       color: "bg-orange-100 text-orange-600",   icon: <BugIcon size={16}/> },
  default:         { label: "Action",           color: "bg-slate-100 text-slate-600",     icon: <Activity size={16}/> }
};

const PMDashboardSummary = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalTasks: 0,
    openBugs: 0,
    completedTasks: 0,
    delayedTasks: 0,
    activeTeam: 0
  });

  const [chartData, setChartData] = useState({
    bugSeverity: [],
    projectProgress: []
  });

  const [recentTasks, setRecentTasks] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projRes, taskRes, bugRes, activityRes] = await Promise.all([
          API.get("/project"),
          API.get("/task"),
          API.get("/bug"),
          API.get("/activity/recent?limit=20").catch(() => ({ data: { data: [] } }))
        ]);

        const projects = projRes.data.data || [];
        const tasks = taskRes.data.data || [];
        const bugs = bugRes.data.data || [];
        const activityLogs = activityRes.data.data || [];

        const now = new Date();
        const delayed = tasks.filter(t => t.status !== "completed" && t.endDate && new Date(t.endDate) < now).length;

        // Fix duplicate key — single activeProjects
        setStats({
          activeProjects: projects.length,
          totalTasks: tasks.length,
          openBugs: bugs.filter(b => ["open", "submitted", "in_progress", "retest", "reopened"].includes(b.status)).length,
          completedTasks: tasks.filter(t => t.status === "completed").length,
          delayedTasks: delayed,
          activeTeam: new Set([
            ...tasks.map(t => t.assignedDeveloper?._id),
            ...bugs.map(b => b.assignedDeveloper?._id)
          ].filter(Boolean)).size
        });

        // Bug Severity Distribution
        const severities = { low: 0, medium: 0, high: 0, critical: 0 };
        bugs.forEach(b => { if (severities[b.severity] !== undefined) severities[b.severity]++; });

        setChartData({
          bugSeverity: [
            { name: 'Low',      count: severities.low,      fill: '#3b82f6' },
            { name: 'Med',      count: severities.medium,   fill: '#f59e0b' },
            { name: 'High',     count: severities.high,     fill: '#ef4444' },
            { name: 'Critical', count: severities.critical, fill: '#7f1d1d' },
          ],
          projectProgress: projects.slice(0, 5).map(p => ({
            name: p.projectName.length > 10 ? p.projectName.substring(0, 10) + '…' : p.projectName,
            tasks: p.taskCount || 0,
            done: Math.round(((p.progress || 0) / 100) * (p.taskCount || 0))
          }))
        });

        // Recent tasks (latest 5)
        const sortedTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentTasks(sortedTasks.slice(0, 5));

        // Real activity feed from ActivityLog model
        setActivityFeed(activityLogs);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <AnnouncementBanner />
      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 !rounded-2xl border-l-4 border-l-indigo-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Projects</p>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-black text-slate-800">{stats.activeProjects}</h3>
            <Layers className="text-indigo-200" size={32} />
          </div>
        </div>
        <div className="glass-card p-5 !rounded-2xl border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Tasks</p>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-black text-slate-800">{stats.totalTasks}</h3>
            <CheckCircle className="text-emerald-200" size={32} />
          </div>
        </div>
        <div className="glass-card p-5 !rounded-2xl border-l-4 border-l-red-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Open Bugs</p>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-black text-slate-800">{stats.openBugs}</h3>
            <BugIcon className="text-red-200" size={32} />
          </div>
        </div>
        <div className="glass-card p-5 !rounded-2xl border-l-4 border-l-emerald-400">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Completed</p>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-black text-slate-800">{stats.completedTasks}</h3>
            <Activity className="text-emerald-200" size={32} />
          </div>
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 !rounded-2xl border-l-4 border-l-red-400">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            Delayed Tasks <AlertCircle size={10} className="text-red-400"/>
          </p>
          <h3 className="text-2xl font-black text-red-600">{stats.delayedTasks}</h3>
        </div>
        <div className="glass-card p-4 !rounded-2xl border-l-4 border-l-amber-400">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Members</p>
          <h3 className="text-2xl font-black text-amber-600">{stats.activeTeam}</h3>
        </div>

        {/* Bug Severity Mini Chart */}
        <div className="md:col-span-2 glass-card p-4 !rounded-2xl flex items-center shadow-inner">
          <div className="w-1/2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Bug Severity Pipeline</p>
            <div className="h-20 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.bugSeverity} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} contentStyle={{ borderRadius: '10px', fontSize: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={10}>
                    {chartData.bugSeverity.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="w-1/2 border-l border-white/60 pl-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Project Task Progress</p>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.projectProgress} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 7, fontWeight: 700 }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} contentStyle={{ borderRadius: '10px', fontSize: '10px', border: 'none' }} />
                  <Bar dataKey="tasks" fill="#6366f1" radius={[2, 2, 0, 0]} name="Total" />
                  <Bar dataKey="done" fill="#10b981" radius={[2, 2, 0, 0]} name="Done" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Tasks + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 glass-card p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/40">
            <h3 className="font-bold text-slate-800 text-lg">Recent Tasks</h3>
            <button onClick={() => navigate("/create-task")} className="btn-secondary text-xs !py-1.5 !px-3">+ New Task</button>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-bold">
                <tr>
                  <th className="p-4 uppercase text-[10px] tracking-widest border-b border-slate-100">Task</th>
                  <th className="p-4 uppercase text-[10px] tracking-widest border-b border-slate-100">Project</th>
                  <th className="p-4 uppercase text-[10px] tracking-widest border-b border-slate-100">Status</th>
                  <th className="p-4 uppercase text-[10px] tracking-widest border-b border-slate-100">Est. Hrs</th>
                  <th className="p-4 uppercase text-[10px] tracking-widest border-b border-slate-100">Priority</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map(t => (
                  <tr key={t._id} className="border-b border-slate-100/50 hover:bg-white/50 transition cursor-pointer" onClick={() => navigate(`/task-detail/${t._id}`)}>
                    <td className="p-4 font-bold text-slate-800 max-w-[160px]"><p className="truncate">{t.taskTitle}</p></td>
                    <td className="p-4 text-slate-600 font-medium">{t.projectId?.projectName || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : t.status === 'in progress' ? 'bg-amber-100 text-amber-700' : t.status === 'testing' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                        {t.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-bold text-xs">
                      {t.estimatedHours > 0 ? `${t.estimatedHours}h` : "—"}
                    </td>
                    <td className="p-4">
                      <span className={`font-bold text-xs ${t.priority === 'high' ? 'text-red-500' : 'text-amber-500'}`}>{t.priority || 'Medium'}</span>
                    </td>
                  </tr>
                ))}
                {recentTasks.length === 0 && (
                  <tr><td colSpan="5" className="p-6 text-center text-slate-400 font-semibold">No tasks yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed — Real data from ActivityLog */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="font-bold text-slate-800 text-lg mb-1 border-b border-slate-100 pb-4">Live Activity Feed</h3>
          <div className="space-y-5 overflow-y-auto pr-1 custom-scrollbar max-h-[420px] pt-4">
            {activityFeed.length === 0 ? (
              <div className="text-center py-8">
                <Activity size={32} className="text-slate-200 mx-auto mb-2"/>
                <p className="text-slate-400 italic font-semibold text-sm">No activity logged yet.</p>
                <p className="text-slate-300 text-xs mt-1">Actions will appear here in real time.</p>
              </div>
            ) : activityFeed.map((log, idx) => {
              const meta = ACTION_META[log.action] || ACTION_META.default;
              return (
                <div key={log._id || idx} className="flex items-start gap-3 relative">
                  {idx !== activityFeed.length - 1 && (
                    <div className="absolute top-9 left-[18px] bottom-[-20px] w-px bg-slate-100"></div>
                  )}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 items-baseline flex-wrap">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{meta.label}</p>
                      <p className="text-[9px] font-bold text-slate-300 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-800 leading-snug mt-0.5 truncate">{log.description}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {log.userId?.profilePicture
                        ? <img src={log.userId.profilePicture} className="w-4 h-4 rounded-full object-cover" alt=""/>
                        : <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[8px]">
                            {log.userId?.name?.charAt(0) || "?"}
                          </div>
                      }
                      <p className="text-xs text-slate-400 font-semibold truncate">
                        {log.userId?.name || "Unknown"} <span className="text-slate-300">·</span> {log.userId?.role?.replace("_", " ") || ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PMDashboardSummary;
