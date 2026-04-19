import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { getSocket } from "../../services/socketService";
import { CheckCircle, Clock, Layers, Bug as BugIcon, Play, Square, RotateCcw, Activity, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AnnouncementBanner from "../../components/AnnouncementBanner";

const DashboardSummary = ({ navigate }) => {
  const [summary, setSummary] = useState({
    totalAssigned: 0,
    inProgress: 0,
    completed: 0,
    openBugs: 0,
    pendingRetests: 0,
    completedThisSprint: 0,
    weeklyCompletion: [],
    activityFeed: []
  });

  const [recentLogs, setRecentLogs] = useState([]);

  // Timer State
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await API.get("/developer/dashboard");
        if (isMounted) setSummary(res.data?.data || {});
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }

      try {
        const logsRes = await API.get("/developer/worklogs");
        if (isMounted) setRecentLogs(logsRes.data?.data?.slice(0, 5) || []);
      } catch (error) {
        console.error("Worklogs fetch error:", error);
      }
    };
    fetchData();

    let socket;
    const handleRefresh = () => fetchData();

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user._id) {
        socket = getSocket();
        socket.on("dashboard_refresh", handleRefresh);
      }
    } catch (err) { console.error("Socket err", err) }

    return () => {
      isMounted = false;
      if (socket) {
        socket.off("dashboard_refresh", handleRefresh);
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (s) => {
    const hrs = Math.floor(s / 3600).toString().padStart(2, "0");
    const mins = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <AnnouncementBanner />
      {/* 1. Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 !rounded-2xl border-l-4 border-l-indigo-500">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned</p>
          <h3 className="text-2xl font-black text-slate-800">{summary.totalAssigned}</h3>
        </div>
        <div className="glass-card p-4 !rounded-2xl border-l-4 border-l-amber-500">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">In Progress</p>
          <h3 className="text-2xl font-black text-slate-800">{summary.inProgress}</h3>
        </div>
        <div className="glass-card p-4 !rounded-2xl border-l-4 border-l-blue-500">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Retest</p>
          <h3 className="text-2xl font-black text-slate-800">{summary.pendingRetests}</h3>
        </div>
        <div className="glass-card p-4 !rounded-2xl border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Completed (Sprint)</p>
          <h3 className="text-2xl font-black text-slate-800">{summary.completedThisSprint}</h3>
        </div>
        <div className="glass-card p-4 !rounded-2xl border-l-4 border-l-red-500">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Open Bugs</p>
          <h3 className="text-2xl font-black text-slate-800">{summary.openBugs}</h3>
        </div>
      </div>


      {/* Activity and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">

        {/* Charts */}
        <div className="space-y-6">
          <div className="glass-card p-6 flex flex-col items-center justify-center">
            <h3 className="font-bold text-slate-800 mb-6 w-full text-left">Task Distribution</h3>
            <div className="w-full relative" style={{ height: '200px', minHeight: '200px' }}>
              {(!summary || (summary.totalAssigned === 0 && summary.inProgress === 0 && summary.completed === 0 && summary.openBugs === 0)) ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-semibold italic">No task data available for chart.</div>
              ) : (
                <div style={{ width: '100%', height: '100%' }}>
                  <ResponsiveContainer width="99%" height={200} debounce={100}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Assigned', value: summary.totalAssigned || 0 },
                          { name: 'In Progress', value: summary.inProgress || 0 },
                          { name: 'Completed', value: summary.completed || 0 },
                          { name: 'Open Bugs', value: summary.openBugs || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                        isAnimationActive={true}
                      >
                        <Cell key="cell-0" fill="#6366f1" />
                        <Cell key="cell-1" fill="#f59e0b" />
                        <Cell key="cell-2" fill="#10b981" />
                        <Cell key="cell-3" fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            {/* Chart Legend */}
            <div className="w-full grid grid-cols-2 gap-x-6 gap-y-2 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#6366f1' }}></span>
                <span className="text-xs font-bold text-slate-600">Assigned Tasks</span>
                <span className="ml-auto text-xs font-black text-slate-800">{summary.totalAssigned || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#f59e0b' }}></span>
                <span className="text-xs font-bold text-slate-600">In Progress</span>
                <span className="ml-auto text-xs font-black text-slate-800">{summary.inProgress || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#10b981' }}></span>
                <span className="text-xs font-bold text-slate-600">Completed</span>
                <span className="ml-auto text-xs font-black text-slate-800">{summary.completed || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#ef4444' }}></span>
                <span className="text-xs font-bold text-slate-600">Open Bugs</span>
                <span className="ml-auto text-xs font-black text-slate-800">{summary.openBugs || 0}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col items-center justify-center">
            <h3 className="font-bold text-slate-800 mb-6 w-full text-left">Weekly Logged Hours</h3>
            <div className="w-full relative" style={{ height: '200px', minHeight: '200px' }}>
              {(!summary.weeklyCompletion || summary.weeklyCompletion.length === 0 || summary.weeklyCompletion.every(d => d.hours === 0)) ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-semibold italic">No log data available for chart.</div>
              ) : (
                <div style={{ width: '100%', height: '100%' }}>
                  <ResponsiveContainer width="99%" height={200} debounce={100}>
                    <BarChart data={summary.weeklyCompletion}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-card p-6 flex flex-col h-[580px]">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 flex-shrink-0">
            <Activity size={18} /> Activity Feed
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
            {(!summary.activityFeed || summary.activityFeed.length === 0) ? (
              <p className="text-slate-400 italic font-semibold text-sm">No recent activity.</p>
            ) : (() => {
              const user = JSON.parse(localStorage.getItem("user")) || {};
              const now = new Date();

              // Group activities
              const groups = { "Just Now": [], "Today": [], "Yesterday": [], "Older": [] };

              summary.activityFeed.forEach(log => {
                const logDate = new Date(log.date);
                const diffMins = Math.floor((now - logDate) / 60000);
                const isToday = logDate.toDateString() === now.toDateString();
                const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === logDate.toDateString();
                now.setDate(now.getDate() + 1); // reset 'now'

                if (diffMins < 60 && isToday) groups["Just Now"].push(log);
                else if (isToday) groups["Today"].push(log);
                else if (isYesterday) groups["Yesterday"].push(log);
                else groups["Older"].push(log);
              });

              return Object.entries(groups).filter(([_, items]) => items.length > 0).map(([groupName, items]) => (
                <div key={groupName} className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    {groupName} <span className="h-[1px] flex-1 bg-slate-100"></span>
                  </h4>
                  {items.map((log, idx) => {
                    const isStatusChange = log.action === 'status_changed';
                    const isTimeLog = log.action === 'time_logged' || log.type === 'log';
                    const isBug = log.type === 'bug';
                    const isTesterAssign = log.action === 'tester_assigned';
                    const isComment = log.action === 'comment_added' || log.type === 'comment';
                    const isTaskEdit = log.action === 'task_edited' || log.action === 'bug_edited';

                    let bgColor = 'bg-emerald-100 text-emerald-600';
                    let Icon = CheckCircle;

                    if (isStatusChange) {
                      const newStatus = log.metadata?.newStatus;
                      if (newStatus === 'in progress') { bgColor = 'bg-amber-100 text-amber-600'; Icon = Play; }
                      else if (newStatus === 'testing' || newStatus === 'review') { bgColor = 'bg-indigo-100 text-indigo-600'; Icon = RotateCcw; }
                      else if (newStatus === 'completed') { bgColor = 'bg-emerald-100 text-emerald-600'; Icon = CheckCircle; }
                      else if (newStatus === 'pending') { bgColor = 'bg-slate-100 text-slate-600'; Icon = Clock; }
                      else { bgColor = 'bg-blue-100 text-blue-600'; Icon = Activity; }
                    } else if (isTimeLog) {
                      bgColor = 'bg-blue-100 text-blue-600'; Icon = Clock;
                    } else if (isBug) {
                      bgColor = 'bg-red-100 text-red-600'; Icon = BugIcon;
                    } else if (isTesterAssign) {
                      bgColor = 'bg-purple-100 text-purple-600'; Icon = Layers;
                    } else if (isComment) {
                      bgColor = 'bg-sky-100 text-sky-600'; Icon = MessageSquare;
                    } else if (isTaskEdit) {
                      bgColor = log.action === 'bug_edited' ? 'bg-red-100 text-red-600' : 'bg-pink-100 text-pink-600';
                      Icon = log.action === 'bug_edited' ? BugIcon : Square;
                    }

                    // Dynamic Time Ago
                    const diffMins = Math.floor((new Date() - new Date(log.date)) / 60000);
                    const timeAgo = diffMins < 1 ? 'Just now' : diffMins < 60 ? `${diffMins}m ago` : diffMins < 1440 ? `${Math.floor(diffMins / 60)}h ago` : new Date(log.date).toLocaleDateString();

                    return (
                      <div key={idx} className="p-3 bg-white border border-slate-100 rounded-2xl flex gap-4 hover:shadow-md transition-all group">
                        {/* Avatar */}
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-indigo-100 flex items-center justify-center font-black text-indigo-700 flex-shrink-0">
                            {user.profilePicture ? <img src={user.profilePicture} alt="user" className="w-full h-full object-cover" /> : user.name?.charAt(0) || "U"}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${bgColor} shadow-sm`}>
                            <Icon size={10} strokeWidth={3} />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-start mb-0.5">
                            <p className="text-xs text-slate-500 font-medium truncate pr-2">
                              <span className="font-bold text-slate-800">{user.name || "You"}</span> {log.description}
                            </p>
                            <span className="text-[10px] text-indigo-400 font-bold whitespace-nowrap bg-indigo-50 px-2 py-0.5 rounded-full">{timeAgo}</span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-[11px] text-slate-800">{log.title}</span>
                            {isStatusChange && log.metadata && (
                              <>
                                <span className="text-[10px] text-slate-300">|</span>
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${log.metadata.newStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                  log.metadata.newStatus === 'in progress' ? 'bg-amber-50 text-amber-600' :
                                    log.metadata.newStatus === 'testing' || log.metadata.newStatus === 'review' ? 'bg-indigo-50 text-indigo-600' :
                                      'bg-slate-100 text-slate-500'
                                  }`}>{log.metadata.newStatus}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
