import React, { useState, useEffect, useCallback } from "react";
import API from "../../api/axios";
import { Activity, Bug, CheckCircle, AlertTriangle, MessageSquare, Edit3, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import AnnouncementBanner from "../../components/AnnouncementBanner";
import { SkeletonCard, SkeletonChart, SkeletonActivityFeed, SkeletonParticles } from "../../components/skeleton";

// ─── helpers ──────────────────────────────────────────────────────────────────
const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth()    === d2.getMonth()    &&
  d1.getDate()     === d2.getDate();

const dateGroup = (date) => {
  const d   = new Date(date);
  const now = new Date();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, now))       return "Today";
  if (isSameDay(d, yesterday)) return "Yesterday";
  return "Older";
};

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)  return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  if (h < 48)  return "Yesterday";
  return new Date(date).toLocaleDateString();
};

const ACTION_META = {
  created:       { icon: <Bug       size={14} />, color: "bg-red-100    text-red-600",    label: "Reported"    },
  edit:          { icon: <Edit3     size={14} />, color: "bg-indigo-100 text-indigo-600", label: "Edited"      },
  status_update: { icon: <RefreshCw size={14} />, color: "bg-amber-100  text-amber-600",  label: "Status"      },
  comment:       { icon: <MessageSquare size={14}/>,color:"bg-violet-100 text-violet-600", label: "Comment"     },
  closed:        { icon: <CheckCircle size={14}/>, color: "bg-emerald-100 text-emerald-600",label:"Closed"     },
  reopened:      { icon: <AlertTriangle size={14}/>,color:"bg-rose-100  text-rose-600",   label: "Reopened"    },
  default:       { icon: <Activity  size={14} />, color: "bg-slate-100  text-slate-500",  label: "Update"      },
};

const getActionMeta = (action) => ACTION_META[action] || ACTION_META.default;

// ════════════════════════════════════════════════════════════════════════════
const TesterSummary = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    myBugs: 0, openBugs: 0, tasksToTest: 0,
    resolvedBugs: 0, retestBugs: 0, reopenedBugs: 0
  });
  const [activityGroups, setActivityGroups] = useState({ Today: [], Yesterday: [], Older: [] });
  const [loading, setLoading] = useState(true);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const buildFeed = useCallback((myBugs, tasks) => {
    const items = [];

    myBugs.forEach(b => {
      const bugShortId = `#${b._id.slice(-6)}`;

      if (!b.activityLogs || b.activityLogs.length === 0) {
        // Fallback for legacy bugs with no activity logs
        items.push({
          action:   "created",
          bugId:    bugShortId,
          bugTitle: b.bugTitle,
          userName: typeof b.reportBy === "object" ? b.reportBy?.name : (b.reportBy || loggedInUser?.name),
          userRole: "tester",
          message:  `reported a ${b.severity || ""} severity bug`,
          date:     new Date(b.createdAt),
        });
      } else {
        b.activityLogs.forEach(log => {
          items.push({
            action:   log.action || "default",
            bugId:    bugShortId,
            bugTitle: b.bugTitle,
            bugDbId:  b._id,
            userName: log.userName || "System",
            userRole: log.userRole || "system",
            message:  log.message || "made an update",
            date:     new Date(log.date),
          });
        });
        // Also include comments from reviewComments as activity
        (b.reviewComments || []).forEach(c => {
          items.push({
            action:   "comment",
            bugId:    bugShortId,
            bugTitle: b.bugTitle,
            bugDbId:  b._id,
            userName: c.authorName || c.commenter || "User",
            userRole: c.authorRole || "tester",
            message:  `commented: "${c.comment?.slice(0, 60)}${c.comment?.length > 60 ? "..." : ""}"`,
            date:     new Date(c.date),
          });
        });
      }
    });

    // Merge task-related activity
    tasks.filter(t => t.status === "testing").forEach(t => {
      items.push({
        action:   "status_update",
        bugId:    "",
        bugTitle: t.taskTitle,
        bugDbId:  null,
        userName: "System",
        userRole: "system",
        message:  "Task flagged for Testing",
        date:     new Date(t.updatedAt || t.createdAt),
      });
    });

    // Sort descending
    items.sort((a, b) => b.date - a.date);

    // Group
    const groups = { Today: [], Yesterday: [], Older: [] };
    items.slice(0, 30).forEach(item => {
      const g = dateGroup(item.date);
      groups[g].push(item);
    });

    return groups;
  }, [loggedInUser]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Use tester-scoped endpoints — server filters by authenticated user
        const [taskRes, bugRes] = await Promise.all([
          API.get("/task/my-testing-tasks"),
          API.get("/bug/my-bugs")
        ]);
        const tasks  = taskRes.data.data || [];
        const myBugs = bugRes.data.data || [];

        setStats({
          myBugs:       myBugs.length,
          openBugs:     myBugs.filter(b => ["open","submitted","draft"].includes(b.status?.toLowerCase())).length,
          tasksToTest:  tasks.filter(t => t.status === "testing").length,
          resolvedBugs: myBugs.filter(b => b.status === "closed").length,
          retestBugs:   myBugs.filter(b => b.status === "retest").length,
          reopenedBugs: myBugs.filter(b => b.status === "reopened").length,
        });

        setActivityGroups(buildFeed(myBugs, tasks));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (loggedInUser) fetchDashboardData();
  }, [buildFeed]);

  if (loading) return (
    <div className="space-y-6 animate-fade-in" style={{ position: 'relative' }}>
      <SkeletonParticles count={6} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <SkeletonCard count={6} columns={6} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <SkeletonChart type="pie" height={280} />
          <SkeletonActivityFeed items={6} />
        </div>
      </div>
    </div>
  );

  const totalItems = Object.values(activityGroups).reduce((s, g) => s + g.length, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <AnnouncementBanner />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Bugs",      val: stats.myBugs,       color: "border-l-indigo-500" },
          { label: "Open / Draft",    val: stats.openBugs,     color: "border-l-amber-500"  },
          { label: "Tasks To Test",   val: stats.tasksToTest,  color: "border-l-cyan-500"   },
          { label: "Pending Retest",  val: stats.retestBugs,   color: "border-l-rose-500"   },
          { label: "Reopened",        val: stats.reopenedBugs, color: "border-l-orange-500" },
          { label: "Verified / Closed",val: stats.resolvedBugs,color: "border-l-emerald-500"},
        ].map(({ label, val, color }) => (
          <div key={label} className={`glass-card p-4 !rounded-2xl border-l-4 ${color}`}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
            <h3 className="text-2xl font-black text-slate-800">{val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">

        {/* ── Chart ── */}
        <div className="glass-card p-6 flex flex-col items-center">
          <h3 className="font-bold text-slate-800 mb-6 w-full text-left">Quality Assurance Ratios</h3>
          <div className="w-full" style={{ height: 280 }}>
            {stats.myBugs > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Reported",     value: stats.myBugs },
                      { name: "Open",         value: stats.openBugs },
                      { name: "Pending Test", value: stats.tasksToTest },
                      { name: "Verified",     value: stats.resolvedBugs },
                    ]}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={84}
                    paddingAngle={4} dataKey="value"
                    isAnimationActive={false}
                  >
                    {["#ef4444","#f59e0b","#a855f7","#10b981"].map((c, i) => (
                      <Cell key={i} fill={c} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                <Activity size={48} className="opacity-20 mb-2" />
                <p className="font-bold text-sm uppercase tracking-widest opacity-40">No Data</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4 text-[10px] font-bold text-slate-500 flex-wrap justify-center">
            {[["#ef4444","Reported"],["#f59e0b","Open"],["#a855f7","Tasks"],["#10b981","Resolved"]].map(([c,l]) => (
              <span key={l} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} /> {l}
              </span>
            ))}
          </div>
        </div>

        {/* ── Activity Feed (Grouped) ── */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-lg">QA Activity</h3>
            <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
              {totalItems} events
            </span>
          </div>

          <div className="overflow-y-auto flex-1 pr-1 space-y-6 max-h-[340px] custom-scrollbar">
            {totalItems === 0 ? (
              <p className="text-slate-400 italic font-semibold text-sm">No recent activity for your account.</p>
            ) : (
              ["Today", "Yesterday", "Older"].map(group => {
                const items = activityGroups[group];
                if (!items || items.length === 0) return null;
                return (
                  <div key={group}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 sticky top-0 bg-white/80 backdrop-blur-sm py-1">
                      {group}
                    </p>
                    <div className="space-y-3">
                      {items.map((item, idx) => {
                        const meta = getActionMeta(item.action);
                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-3 relative cursor-pointer hover:bg-slate-50/50 p-2 rounded-xl transition ${item.bugDbId ? "" : "cursor-default"}`}
                            onClick={() => item.bugDbId && navigate(`/bug-detail/${item.bugDbId}`)}
                          >
                            {/* Vertical connector */}
                            {idx < items.length - 1 && (
                              <div className="absolute left-[18px] top-[32px] bottom-[-12px] w-[1.5px] bg-slate-100 z-0" />
                            )}
                            {/* Icon */}
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-sm ${meta.color}`}>
                              {meta.icon}
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{meta.label}</span>
                                {item.bugId && (
                                  <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">
                                    {item.bugId}
                                  </span>
                                )}
                                <span className="ml-auto text-[9px] font-bold text-slate-400 whitespace-nowrap">
                                  {timeAgo(item.date)}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-slate-800 leading-snug mt-0.5">
                                <span className="text-indigo-600">{item.userName}</span>{" "}
                                <span className="text-[10px] text-slate-400 font-bold">({item.userRole})</span>{" "}
                                {item.message}
                              </p>
                              <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{item.bugTitle}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TesterSummary;
