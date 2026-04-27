import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import {
  ArrowLeft, MessageSquare, Clock, Play, Square, Activity,
  Send, CheckCircle, AlertTriangle, User, Bug as BugIcon, Plus
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusMeta = {
  pending:       { label: "Todo",           cls: "bg-slate-100 text-slate-600 border-slate-200" },
  "in progress": { label: "In Progress",   cls: "bg-amber-100 text-amber-700 border-amber-200" },
  review:        { label: "Code Review",   cls: "bg-blue-100 text-blue-700 border-blue-200" },
  testing:       { label: "Ready for QA",  cls: "bg-purple-100 text-purple-700 border-purple-200" },
  completed:     { label: "Completed ✓",   cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const priorityColors = {
  high:   "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low:    "bg-blue-100 text-blue-700 border-blue-200",
};

const timeAgo = (date) => {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  if (h < 48) return "Yesterday";
  return new Date(date).toLocaleDateString();
};

const actionIcon = (action) => {
  const map = {
    status_changed: "🔄",
    time_logged:    "⏱️",
    time_deleted:   "🗑️",
    tester_assigned:"👤",
    comment_added:  "💬",
    task_edited:    "✏️",
  };
  return map[action] || "📌";
};

// ─── Person Card ─────────────────────────────────────────────────────────────
const PersonCard = ({ person, label }) => {
  if (!person) return (
    <div className="flex items-center gap-2 text-slate-400 italic text-sm font-bold">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">?</div>
      Unassigned
    </div>
  );
  return (
    <div>
      <span className="fl mb-3">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xl flex-shrink-0">
          {person.profilePicture
            ? <img src={person.profilePicture} alt={person.name} className="w-full h-full object-cover" />
            : person.name?.charAt(0)}
        </div>
        <div>
          <p className="font-black text-slate-700">{person.name}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{person.role}</p>
          {person.email && <p className="text-[10px] text-slate-400 mt-0.5">{person.email}</p>}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [worklogs, setWorklogs] = useState([]);
  const [linkedBugs, setLinkedBugs] = useState([]);
  const [totalLoggedHours, setTotalLoggedHours] = useState(0);
  const [testers, setTesters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      const taskRes = await API.get(`/task/${id}`);
      setTask(taskRes.data.data);
      setActivityLogs(taskRes.data.activityLogs || []);
      setWorklogs(taskRes.data.worklogs || []);
      setTotalLoggedHours(taskRes.data.totalLoggedHours || 0);

      const [commentsRes, userRes, bugsRes] = await Promise.all([
         API.get(`/task/${id}/comments`),
         API.get(`/user/users`),
         API.get(`/bug`)
      ]);
      
      setComments(commentsRes.data.data || []);
      setTesters(userRes.data.data.filter(u => u.role === "tester" || u.role === "admin"));
      
      const allBugs = bugsRes.data.data || bugsRes.data || [];
      setLinkedBugs(allBugs.filter(b => b.taskId === id || b.taskId?._id === id));
    } catch (err) {
      console.error("Failed to fetch task details", err);
      toast.error("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let interval;
    if (running) interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (s) => {
    const hrs = Math.floor(s / 3600).toString().padStart(2, "0");
    const mins = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const handleTimerToggle = async () => {
    if (running) {
      try {
        const newTimeSpent = (task.timeSpent || 0) + seconds;
        await API.put(`/task/${id}`, { timeSpent: newTimeSpent });
        await API.post("/timelog", {
          taskId: id, developerId: loggedInUser._id,
          hoursWorked: +(seconds / 3600).toFixed(2),
          logDate: new Date().toISOString(),
          workDescription: `Tracked session — ${formatTime(seconds)}`
        });
        toast.success(`${formatTime(seconds)} logged successfully`);
        setTask(prev => ({ ...prev, timeSpent: newTimeSpent }));
        setRunning(false);
        setSeconds(0);
        fetchAll();
      } catch { toast.error("Failed to save time"); }
    } else {
      setRunning(true);
    }
  };

  // ── Status Update ──────────────────────────────────────────────────────────
  const handleStatusUpdate = async (newStatus) => {
    if (statusUpdating) return;
    setStatusUpdating(true);
    try {
      if (newStatus === "in progress" && task.status === "testing") {
        // Auto-increment retest count when sent back from testing
        await API.put(`/task/${id}`, { status: newStatus, retestCount: (task.retestCount || 0) + 1 });
        setTask(prev => ({ ...prev, status: newStatus, retestCount: (prev.retestCount || 0) + 1 }));
      } else {
        await API.put(`/task/${id}`, { status: newStatus });
        setTask(prev => ({ ...prev, status: newStatus }));
      }
      toast.success(`Status → ${statusMeta[newStatus]?.label || newStatus}`);
      fetchAll();
    } catch { toast.error("Failed to update status"); }
    finally { setStatusUpdating(false); }
  };

  const handleEscalateToPM = async () => {
    if (statusUpdating) return;
    setStatusUpdating(true);
    try {
      await API.put(`/task/${id}`, { escalatedToPm: true, escalationReason: "Repeated QA Failure" });
      setTask(prev => ({ ...prev, escalatedToPm: true, escalationReason: "Repeated QA Failure" }));
      toast.success("Task escalated to Project Manager.");
      fetchAll();
    } catch { toast.error("Failed to escalate"); }
    finally { setStatusUpdating(false); }
  };

  // ── QA Tester Assign ───────────────────────────────────────────────────────
  const handleAssignTester = async (testerId) => {
    try {
      await API.put(`/task/${id}`, { assignedTester: testerId });
      setTask(prev => ({ ...prev, assignedTester: testers.find(t => t._id === testerId) || testerId }));
      toast.success("Tester assigned");
      fetchAll();
    } catch { toast.error("Failed to assign tester"); }
  };

  // ── Comment ────────────────────────────────────────────────────────────────
  const submitComment = async () => {
    if (!newComment.trim()) return;
    setIsPosting(true);
    try {
      const res = await API.post(`/task/${id}/comments`, { text: newComment });
      setComments([res.data.data, ...comments]);
      setNewComment("");
      toast.success("Comment posted");
    } catch { toast.error("Failed to post comment"); }
    finally { setIsPosting(false); }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#ccd6ff] flex items-center justify-center font-bold text-slate-500">
      Loading Task Details...
    </div>
  );
  if (!task) return (
    <div className="min-h-screen bg-[#ccd6ff] flex items-center justify-center font-bold text-slate-500">
      Task not found.
    </div>
  );

  const sl = statusMeta[task.status?.toLowerCase()] || statusMeta.pending;
  const pc = priorityColors[task.priority?.toLowerCase()] || priorityColors.medium;
  const isCompleted = task.status === "completed";
  const isTesting = task.status === "testing";
  const estimated = task.estimatedHours || 0;
  const logged = totalLoggedHours;
  const remaining = Math.max(0, estimated - logged);

  return (
    <div className="min-h-screen bg-[#ccd6ff] p-4 md:p-8 text-slate-800 relative overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .glass-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        .cs::-webkit-scrollbar { width: 5px; }
        .cs::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .bg-circle { position: absolute; border: 15px solid rgba(79,70,229,0.05); border-radius:50%; pointer-events:none; z-index:0; }
        .c1 { width:600px; height:600px; top:-100px; right:-200px; animation:float 20s infinite; }
        .c2 { width:400px; height:400px; bottom:-50px; left:-100px; animation:float 15s infinite reverse; }
        @keyframes float { 50% { transform:translateY(-20px) scale(1.05); } }
        .field-box { background: rgba(255,255,255,0.5); border-radius: 14px; border: 1px solid rgba(255,255,255,0.8); padding: 16px; }
        .fl { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 6px; display:block; }
        .fv { font-size: 0.875rem; font-weight: 600; color: #334155; white-space: pre-wrap; }
      `}</style>

      <div className="bg-circle c1" /><div className="bg-circle c2" />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 font-bold text-slate-600 hover:text-indigo-600 transition bg-white/50 px-4 py-2 rounded-xl border border-white backdrop-blur-sm w-fit"
        >
          <ArrowLeft size={18} /> Back
        </button>

        {/* Status Banner */}
        {isCompleted && (
          <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-2xl font-bold text-sm">
            <CheckCircle size={18} /> Task is <strong>Completed</strong> — all work has been delivered. ✓
          </div>
        )}
        {isTesting && (
          <div className="mb-4 flex items-center gap-3 bg-purple-50 border border-purple-200 text-purple-700 px-5 py-3 rounded-2xl font-bold text-sm">
            <AlertTriangle size={18} /> Task sent for <strong>QA Testing</strong> — awaiting tester review.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ════ LEFT (2 cols) ════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header Card */}
            <div className="glass-card p-6 md:p-8">
              <div className="flex justify-between items-start mb-4 gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-1 rounded uppercase tracking-widest">
                    #{task._id.slice(-6)}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest border ${sl.cls}`}>
                    {sl.label}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest border ${pc}`}>
                    {task.priority || "medium"} Priority
                  </span>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                {task.taskTitle}
              </h1>
              <p className="text-slate-600 font-medium leading-relaxed">{task.description || "No description provided."}</p>
            </div>

            {/* Detail Fields */}
            <div className="glass-card p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4">

              {task.acceptanceCriteria && (
                <div className="md:col-span-2 field-box" style={{ background: "rgba(238,242,255,0.6)", borderColor: "rgba(199,210,254,0.5)" }}>
                  <span className="fl" style={{ color: "#6366f1" }}>Acceptance Criteria</span>
                  <p className="fv text-indigo-900">{task.acceptanceCriteria}</p>
                </div>
              )}

              <div className="field-box">
                <span className="fl">Project</span>
                <p className="fv">{task.projectId?.projectName || "—"}</p>
              </div>

              <div className="field-box">
                <span className="fl">Module</span>
                <p className="fv">{task.moduleId?.moduleName || "General"}</p>
              </div>

              <div className="field-box">
                <span className="fl">Assigned By</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow bg-amber-100 flex items-center justify-center text-amber-700 font-black text-xs flex-shrink-0">
                    {task.assignBy?.profilePicture
                      ? <img src={task.assignBy.profilePicture} alt="" className="w-full h-full object-cover" />
                      : task.assignBy?.name?.charAt(0) || "M"}
                  </div>
                  <div>
                    <p className="fv">{task.assignBy?.name || "—"}</p>
                    {task.assignBy?.role && (
                      <p className="text-[10px] font-bold mt-0.5 px-1.5 py-0.5 rounded uppercase tracking-widest w-fit bg-amber-100 text-amber-700">{task.assignBy.role}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="field-box">
                <span className="fl">Project Created By</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xs flex-shrink-0">
                    {task.projectId?.createdBy?.name?.charAt(0) || "A"}
                  </div>
                  <div>
                    <p className="fv">{task.projectId?.createdBy?.name || "—"}</p>
                  </div>
                </div>
              </div>

              {((task.retestCount || 0) > 0) && (
                 <div className="field-box md:col-span-2" style={{ background: "rgba(254,226,226,0.6)", borderColor: "rgba(252,165,165,0.5)" }}>
                   <span className="fl" style={{ color: "#ef4444" }}>Quality Metrics</span>
                   <p className="fv text-red-900 font-bold">Retest Count: <span className="bg-white px-2 py-0.5 rounded shadow-sm ml-2">{task.retestCount}</span></p>
                   {task.escalatedToPm && <p className="text-xs font-bold text-red-600 uppercase mt-2 tracking-wider">Escalated to PM ({task.escalationReason})</p>}
                 </div>
              )}

              <div className="field-box" style={{ background: "rgba(240,253,244,0.5)", borderColor: "rgba(187,247,208,0.5)" }}>
                <span className="fl" style={{ color: "#22c55e" }}>Estimated Hours</span>
                <p className="fv text-emerald-900">{estimated > 0 ? `${estimated}h` : "Not set"}</p>
              </div>

              <div className="field-box" style={{ background: "rgba(239,246,255,0.5)", borderColor: "rgba(191,219,254,0.5)" }}>
                <span className="fl" style={{ color: "#3b82f6" }}>Logged Hours</span>
                <p className="fv text-blue-900">{logged > 0 ? `${logged.toFixed(2)}h` : "0h"}</p>
              </div>

              {task.startDate && (
                <div className="field-box">
                  <span className="fl">Start Date</span>
                  <p className="fv">{new Date(task.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              )}

              {task.endDate && (
                <div className="field-box" style={{ background: remaining <= 0 && estimated > 0 ? "rgba(254,242,242,0.5)" : undefined }}>
                  <span className="fl">Deadline</span>
                  <p className="fv">{new Date(task.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              )}
            </div>

            {/* Comments Thread */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <MessageSquare size={18} className="text-indigo-500" />
                Comment Thread
                {comments.length > 0 && (
                  <span className="ml-auto text-[10px] bg-indigo-100 text-indigo-600 font-black px-2 py-0.5 rounded-full">
                    {comments.length}
                  </span>
                )}
              </h2>

              <div className="space-y-4 mb-6 max-h-[380px] overflow-y-auto pr-2 cs">
                {comments.length === 0 ? (
                  <p className="text-slate-400 font-semibold italic text-sm text-center py-8">No comments yet. Start the discussion.</p>
                ) : comments.map((c) => (
                  <div key={c._id} className="bg-white/60 p-4 rounded-xl border border-white flex gap-3 shadow-sm">
                    <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-black flex-shrink-0 border-2 border-white shadow text-sm
                      ${c.userId?.role === "tester"          ? "bg-blue-100 text-blue-700" :
                        c.userId?.role === "developer"        ? "bg-indigo-100 text-indigo-700" :
                        c.userId?.role === "project_manager"  ? "bg-violet-100 text-violet-700" :
                        c.userId?.role === "admin"            ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-700"}`}>
                      {c.userId?.profilePicture
                        ? <img src={c.userId.profilePicture} alt="" className="w-full h-full object-cover" />
                        : (c.userId?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm">{c.userId?.name || "User"}</span>
                        {c.userId?.role && (
                          <span className="text-[9px] bg-slate-200 text-slate-500 font-black px-1.5 py-0.5 rounded uppercase">
                            {c.userId.role}
                          </span>
                        )}
                        <span className="ml-auto text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <Clock size={10} /> {timeAgo(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment input */}
              <div className="flex flex-col gap-3">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) submitComment(); }}
                  placeholder="Add a comment... (Ctrl+Enter to post)"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition"
                  rows={2}
                />
                <div className="flex justify-end">
                  <button
                    onClick={submitComment}
                    disabled={isPosting || !newComment.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-6 py-2 rounded-xl text-sm transition"
                  >
                    {isPosting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ════ RIGHT (1 col) ════ */}
          <div className="space-y-6">

            {/* Assigned Developer */}
            <div className="glass-card p-6">
              <PersonCard person={task.assignedDeveloper} label="Assigned Developer" />
            </div>

            {/* Status Actions Console */}
            <div className="glass-card p-6">
              <span className="fl mb-4">Task Actions Console</span>

              {isCompleted ? (
                <div className="text-center py-4 text-emerald-600">
                  <CheckCircle size={36} className="mx-auto mb-2 opacity-70" />
                  <p className="font-black text-sm">Task Completed</p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">All work has been delivered.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {task.status === "pending" && (
                    <button onClick={() => handleStatusUpdate("in progress")} disabled={statusUpdating}
                      className="w-full py-3 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white font-black rounded-xl text-sm transition border border-amber-200 flex items-center justify-center gap-2 disabled:opacity-60">
                      <Play size={16} /> Start Task
                    </button>
                  )}
                  {task.status === "in progress" && (
                    <>
                      <button onClick={() => handleStatusUpdate("testing")} disabled={statusUpdating}
                        className="w-full py-3 bg-purple-50 hover:bg-purple-500 text-purple-600 hover:text-white font-black rounded-xl text-sm transition border border-purple-200 flex items-center justify-center gap-2 disabled:opacity-60">
                        <CheckCircle size={16} /> Mark Ready for QA
                      </button>
                      <button onClick={() => handleStatusUpdate("completed")} disabled={statusUpdating}
                        className="w-full py-3 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white font-black rounded-xl text-sm transition border border-emerald-200 flex items-center justify-center gap-2 disabled:opacity-60">
                        <CheckCircle size={16} /> Mark Completed
                      </button>
                    </>
                  )}
                  {task.status === "testing" && (
                    <button onClick={() => handleStatusUpdate("in progress")} disabled={statusUpdating}
                      className="w-full py-3 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white font-black rounded-xl text-sm transition border border-amber-200 flex items-center justify-center gap-2 disabled:opacity-60">
                      <AlertTriangle size={16} /> Move Back to In Progress
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* QA Escalation Panel (if retestCount > 1) */}
            {!isCompleted && task.retestCount > 1 && !task.escalatedToPm && (
              <div className="glass-card p-6 border !border-red-200 bg-red-50/30">
                <span className="fl mb-3 text-red-500">Repeated QA Failure Detected</span>
                <p className="text-xs text-slate-600 font-semibold mb-4 leading-relaxed">
                  This task has failed QA checks {task.retestCount} times. You can escalate it to the Project Manager for clarification or review.
                </p>
                <div className="space-y-2.5">
                  <button onClick={handleEscalateToPM} disabled={statusUpdating}
                    className="w-full py-2 bg-white hover:bg-red-500 text-red-600 hover:text-white font-black rounded-xl text-sm transition border border-red-200 shadow-sm disabled:opacity-60">
                    Submit to PM
                  </button>
                  <button onClick={() => toast("Clarification Requested")} className="w-full py-2 bg-white hover:bg-slate-100 text-slate-600 font-black rounded-xl text-sm transition border border-slate-200 shadow-sm">
                    Request Clarification
                  </button>
                </div>
              </div>
            )}

            {/* QA Tester Assignment (when testing) */}
            {isTesting && (
              <div className="glass-card p-6">
                <span className="fl mb-3">Assign QA Tester</span>
                {task.assignedTester?.name ? (
                  <PersonCard person={task.assignedTester} label="Currently Assigned" />
                ) : (
                  <select
                    value=""
                    onChange={(e) => handleAssignTester(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-slate-700 text-sm outline-none"
                  >
                    <option value="" disabled>-- Select Tester --</option>
                    {testers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.role})</option>)}
                  </select>
                )}
              </div>
            )}

            {/* Time Tracker */}
            {!isCompleted && (
              <div className="glass-card p-6">
                <span className="fl mb-3 flex items-center gap-2">
                  <Clock size={13} className="text-indigo-400" /> Time Tracker
                </span>

                <div className="text-center mb-4">
                  <div className="text-3xl font-black text-slate-800 tracking-tight tabular-nums mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>
                    {formatTime(seconds)}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {running ? "Session Active" : "Ready"}
                  </p>
                </div>

                <button
                  onClick={handleTimerToggle}
                  className={`w-full py-3 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition border disabled:opacity-60 ${
                    running
                      ? "bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white border-amber-200"
                      : "bg-indigo-50 hover:bg-indigo-500 text-indigo-600 hover:text-white border-indigo-200"
                  }`}
                >
                  {running ? <><Square size={15} /> Stop &amp; Log Time</> : <><Play size={15} /> Start Timer</>}
                </button>

                {/* Hours Summary */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  {[
                    ["Estimated", estimated > 0 ? `${estimated}h` : "—"],
                    ["Logged", `${logged.toFixed(2)}h`],
                    ["Remaining", estimated > 0 ? `${remaining.toFixed(2)}h` : "—"],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-xs font-semibold text-slate-500">
                      <span className="font-black text-slate-400">{label}</span>
                      <span>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            <div className="glass-card p-6">
              <span className="fl border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                <Activity size={13} className="text-indigo-400" /> Activity Timeline
              </span>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 cs">
                {activityLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
                ) : activityLogs.map((log, idx) => (
                  <div key={log._id || idx} className="flex gap-3 group relative pb-2">
                    {idx < activityLogs.length - 1 && (
                      <div className="absolute left-[9px] top-[18px] bottom-0 w-[1.5px] bg-slate-100 z-0" />
                    )}
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 z-10 text-[10px]">
                      {actionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-600 leading-snug">
                        <span className="font-extrabold text-slate-800">{log.userId?.name || "System"}</span>{" "}
                        <span className="text-[10px] text-slate-400">({log.userId?.role || "—"})</span>{" "}
                        {log.description}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                        {timeAgo(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Metadata */}
            <div className="glass-card p-6 space-y-3">
              <span className="fl mb-2">Task Timeline</span>
              {[
                ["Created", new Date(task.createdAt).toLocaleString()],
                ["Last Updated", new Date(task.updatedAt).toLocaleString()],
                ["Comments", comments.length],
                ["Activity Logs", activityLogs.length],
                ["Worklogs", worklogs.length],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-xs font-semibold text-slate-500 border-b border-slate-50 pb-2 last:border-0">
                  <span className="font-black text-slate-400">{label}</span>
                  <span>{val}</span>
                </div>
              ))}
            </div>

            {/* Linked Bugs Panel */}
            <div className="glass-card p-6">
               <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                 <span className="fl !mb-0 flex items-center gap-2">
                   <BugIcon size={14} className="text-red-400" /> Linked Bugs
                 </span>
                 <button onClick={() => navigate(`/create-bug?task=${id}`)} className="bg-red-50 hover:bg-red-500 hover:text-white text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1 shadow-sm border border-red-100">
                    <Plus size={12}/> Report Bug
                 </button>
               </div>
               
               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 cs">
                 {linkedBugs.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                       <CheckCircle size={24} className="text-emerald-400 mx-auto mb-2 opacity-50" />
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Bugs Reported</p>
                    </div>
                 ) : linkedBugs.map(b => (
                    <div key={b._id} onClick={() => navigate(`/bug-detail/${b._id}`)} className="group cursor-pointer bg-white border border-slate-100 hover:border-red-200 hover:shadow-md p-3 rounded-xl transition">
                       <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-slate-800 text-sm group-hover:text-red-600 transition truncate pr-2 flex-1">{b.bugTitle}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase flex-shrink-0 border 
                            ${b.status === 'resolved' || b.status === 'closed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                              b.status === 'in_progress' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                              'bg-red-50 text-red-600 border-red-100'}`}>
                             {b.status}
                          </span>
                       </div>
                       <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{b._id.slice(-5)}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${b.priority === 'high' || b.priority === 'critical' ? 'text-red-500' : 'text-slate-500'}`}>{b.priority} Priority</span>
                       </div>
                    </div>
                 ))}
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
