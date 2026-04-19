import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  ArrowLeft, MessageSquare, AlertTriangle, CheckCircle,
  Lock, Eye, Info, Clock, Edit3, Activity, PenLine
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const severityColors = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high:     "bg-orange-100 text-orange-700 border-orange-200",
  medium:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  low:      "bg-blue-100 text-blue-700 border-blue-200",
};

const statusMeta = {
  draft:       { label: "Draft",              cls: "bg-slate-100 text-slate-600 border-slate-200" },
  open:        { label: "Open",               cls: "bg-amber-100 text-amber-700 border-amber-200" },
  submitted:   { label: "Submitted",          cls: "bg-amber-100 text-amber-700 border-amber-200" },
  in_progress: { label: "In Progress",        cls: "bg-blue-100 text-blue-700 border-blue-200" },
  retest:      { label: "Ready for Retest",   cls: "bg-purple-100 text-purple-700 border-purple-200" },
  resolved:    { label: "Fixed / Resolved",   cls: "bg-purple-100 text-purple-700 border-purple-200" },
  reopened:    { label: "Reopened",           cls: "bg-rose-100 text-rose-700 border-rose-200" },
  closed:      { label: "Closed ✓",          cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

// Status rules
const isClosed         = (s) => ["closed"].includes(s?.toLowerCase());
const testerCanAct     = (s) => ["retest", "resolved", "reopened"].includes(s?.toLowerCase());
// Tester can request edit when bug is in a state they own
const testerCanEdit    = (s) => ["draft", "open", "retest", "reopened"].includes(s?.toLowerCase());

// ─── Dev Card ────────────────────────────────────────────────────────────────
const DevCard = ({ dev }) => {
  if (!dev) return (
    <div className="flex items-center gap-2 text-slate-400 italic text-sm font-bold">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">?</div>
      Unassigned
    </div>
  );
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xl flex-shrink-0">
        {dev.profilePicture
          ? <img src={dev.profilePicture} alt={dev.name} className="w-full h-full object-cover" />
          : dev.name?.charAt(0)}
      </div>
      <div>
        <p className="font-black text-slate-700">{dev.name}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dev.role}</p>
        {dev.email && <p className="text-[10px] text-slate-400 mt-0.5">{dev.email}</p>}
      </div>
    </div>
  );
};

// ─── Time helpers ─────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)  return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  if (h < 48)  return "Yesterday";
  return new Date(date).toLocaleDateString();
};

const actionIcon = (action) => {
  const map = {
    created:       "🐛",
    edit:          "✏️",
    status_update: "🔄",
    comment:       "💬",
  };
  return map[action] || "📌";
};

// ════════════════════════════════════════════════════════════════════════════
const BugDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [bug,       setBug]       = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [newComment,setNewComment] = useState("");
  const [commenting,setCommenting] = useState(false);
  const [actioning, setActioning]  = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user")) || { name: "Tester", role: "tester" };
  const userRole = loggedInUser.role?.toLowerCase() || "tester";

  const fetchBug = async () => {
    try {
      const res = await API.get(`/bug/${id}`);
      setBug(res.data.data);
    } catch {
      toast.error("Failed to load bug details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBug(); }, [id]);

  // ── Status Actions (Close / Reopen) ───────────────────────────────────────
  const handleStatusUpdate = async (newStatus) => {
    if (actioning) return;
    setActioning(true);
    try {
      const res = await API.put(`/bug/${id}`, {
        status: newStatus,
        editorName: loggedInUser.name,
        editorRole: loggedInUser.role
      });
      setBug(res.data.data);
      toast.success(newStatus === "closed" ? "Bug closed ✓" : "Bug reopened — sent back to developer");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActioning(false);
    }
  };

  // ── Comment submit ──────────────────────────────────────────────────────────
  const submitComment = async () => {
    if (!newComment.trim()) return;
    setCommenting(true);
    try {
      const res = await API.post(`/bug/${id}/comments`, {
        comment:    newComment.trim(),
        commenter:  loggedInUser.name,
        authorId:   loggedInUser._id || loggedInUser.id,
        authorRole: loggedInUser.role,
        authorName: loggedInUser.name,
      });
      if (res.data.data) setBug(res.data.data);
      else setBug(prev => ({
        ...prev,
        reviewComments: [...(prev.reviewComments || []),
          { commenter: loggedInUser.name, authorName: loggedInUser.name,
            authorRole: loggedInUser.role, comment: newComment.trim(), date: new Date() }]
      }));
      setNewComment("");
      toast.success("Comment posted");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setCommenting(false);
    }
  };

  const handleReply = (author) => {
    setNewComment(`@${author} `);
    document.getElementById("comment-box")?.focus();
  };

  // ── guards ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#ccd6ff] flex items-center justify-center font-bold text-slate-500">
      Loading Details...
    </div>
  );
  if (!bug) return (
    <div className="min-h-screen bg-[#ccd6ff] flex items-center justify-center font-bold text-slate-500">
      Bug not found.
    </div>
  );

  const sl      = statusMeta[bug.status?.toLowerCase()] || statusMeta.open;
  const sc      = severityColors[bug.severity?.toLowerCase()] || severityColors.medium;
  const canAct  = testerCanAct(bug.status);
  const closed  = isClosed(bug.status);
  const canEdit = testerCanEdit(bug.status);

  // Role-filtered comments
  const visibleComments = [...(bug.reviewComments || [])].reverse().filter(c => {
    if (!c.authorId && !c.authorRole) return true; // legacy
    if (userRole === "admin" || userRole === "project_manager") return true;
    if (userRole === "developer") {
      const devId = bug.assignedDeveloper?._id || bug.assignedDeveloper;
      return String(devId) === String(loggedInUser._id || loggedInUser.id);
    }
    // tester sees all roles (their own + dev + admin/pm)
    return true;
  });

  return (
    <div className="min-h-screen bg-[#ccd6ff] p-4 md:p-8 text-slate-800 relative overflow-x-hidden">
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 } }} />
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

        {/* Workflow banners */}
        {closed && (
          <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-2xl font-bold text-sm">
            <CheckCircle size={18} /> Bug is <strong>Closed</strong> — verified and resolved. ✓
          </div>
        )}
        {canAct && !closed && (
          <div className="mb-4 flex items-center gap-3 bg-purple-50 border border-purple-200 text-purple-700 px-5 py-3 rounded-2xl font-bold text-sm">
            <Eye size={18} /> Developer responded — <strong>review the fix</strong> and Close or Reopen.
          </div>
        )}
        {!canAct && !closed && (
          <div className="mb-4 flex items-center gap-3 bg-slate-50 border border-slate-200 text-slate-500 px-5 py-3 rounded-2xl font-semibold text-sm">
            <Lock size={16} /> Bug is under development. QA actions unlock when developer marks it for retest.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ════ LEFT ════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header */}
            <div className="glass-card p-6 md:p-8">
              <div className="flex justify-between items-start mb-4 gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-1 rounded uppercase tracking-widest">
                    #{bug._id.slice(-6)}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest border ${sl.cls}`}>
                    {sl.label}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest border ${sc}`}>
                    {bug.severity} Severity
                  </span>
                </div>

                {/* ── EDIT BUG BUTTON — navigates to full EditBug form ── */}
                {canEdit && !closed && (
                  <button
                    onClick={() => navigate(`/edit-bug/${bug._id}`)}
                    className="flex items-center gap-1.5 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition shadow-sm flex-shrink-0"
                  >
                    <Edit3 size={14} /> Edit Bug
                  </button>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                {bug.bugTitle}
              </h1>
              <p className="text-slate-600 font-medium leading-relaxed">{bug.description}</p>
            </div>

            {/* Fields */}
            <div className="glass-card p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 field-box">
                <span className="fl">Steps to Reproduce</span>
                <p className="fv">{bug.stepsToReproduce || "Not provided."}</p>
              </div>

              <div className="field-box" style={{ background: "rgba(254,242,242,0.5)", borderColor: "rgba(254,202,202,0.5)" }}>
                <span className="fl" style={{ color: "#f87171" }}>Expected Result</span>
                <p className="fv text-rose-900">{bug.expectedResult || "Not provided."}</p>
              </div>

              <div className="field-box" style={{ background: "rgba(255,251,235,0.6)", borderColor: "rgba(253,230,138,0.5)" }}>
                <span className="fl" style={{ color: "#f59e0b" }}>Actual Result</span>
                <p className="fv text-amber-900">{bug.actualResult || "Not provided."}</p>
              </div>

              <div className="field-box">
                <span className="fl">Environment</span>
                <p className="fv">{bug.environment || "Not specified."}</p>
              </div>

              <div className="field-box">
                <span className="fl">Module / Area</span>
                <p className="fv">{bug.moduleId?.moduleName || "General"}</p>
              </div>

              <div className="field-box">
                <span className="fl">Priority</span>
                <p className="fv capitalize">{bug.priority || "medium"}</p>
              </div>

              <div className="field-box">
                <span className="fl">Reported By</span>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm flex-shrink-0">
                    {bug.reportById?.profilePicture
                      ? <img src={bug.reportById.profilePicture} alt={bug.reportById.name} className="w-full h-full object-cover" />
                      : (typeof bug.reportBy === "string" ? bug.reportBy?.charAt(0)?.toUpperCase() : bug.reportBy?.name?.charAt(0)?.toUpperCase() || "T")}
                  </div>
                  <div>
                    <p className="fv">{bug.reportById?.name || (typeof bug.reportBy === "object" ? bug.reportBy?.name : bug.reportBy) || "—"}</p>
                    {bug.reportById?.role && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bug.reportById.role}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence */}
            {bug.bugImage && (
              <div className="glass-card p-6">
                <span className="fl mb-3 flex items-center gap-2"><Info size={14} /> Evidence Attachment</span>
                <div className="rounded-2xl overflow-hidden border-4 border-white shadow inline-block max-w-full">
                  <img src={bug.bugImage} alt="Bug Evidence" className="max-h-[420px] object-cover w-full" />
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <MessageSquare size={18} className="text-indigo-500" />
                Comment Thread
                {bug.reviewComments?.length > 0 && (
                  <span className="ml-auto text-[10px] bg-indigo-100 text-indigo-600 font-black px-2 py-0.5 rounded-full">
                    {bug.reviewComments.length}
                  </span>
                )}
              </h2>

              <div className="space-y-4 mb-6 max-h-[380px] overflow-y-auto pr-2 cs">
                {visibleComments.length === 0 ? (
                  <p className="text-slate-400 font-semibold italic text-sm text-center py-8">No comments yet.</p>
                ) : visibleComments.map((c, idx) => (
                  <div key={idx} className="bg-white/60 p-4 rounded-xl border border-white flex gap-3 shadow-sm">
                    <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-black flex-shrink-0 border-2 border-white shadow text-sm
                      ${c.authorRole === "tester"          ? "bg-blue-100 text-blue-700" :
                        c.authorRole === "developer"        ? "bg-indigo-100 text-indigo-700" :
                        c.authorRole === "project_manager"  ? "bg-violet-100 text-violet-700" :
                        c.authorRole === "admin"            ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-700"}`}>
                      {c.authorId?.profilePicture
                        ? <img src={c.authorId.profilePicture} alt={c.authorId.name || c.authorName} className="w-full h-full object-cover" />
                        : (c.authorName || c.commenter || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm">{c.authorName || c.commenter}</span>
                        {c.authorRole && (
                          <span className="text-[9px] bg-slate-200 text-slate-500 font-black px-1.5 py-0.5 rounded uppercase">
                            {c.authorRole}
                          </span>
                        )}
                        <div className="ml-auto flex items-center gap-3">
                          <button
                            onClick={() => handleReply(c.authorName || c.commenter)}
                            className="text-[9px] font-black text-indigo-400 hover:text-indigo-600 uppercase tracking-widest transition hidden md:block"
                          >
                            Reply
                          </button>
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <Clock size={10} /> {timeAgo(c.date)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap">{c.comment}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment box */}
              <div className="flex flex-col gap-3">
                <textarea
                  id="comment-box"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) submitComment(); }}
                  placeholder="Add review feedback, testing notes... (Ctrl+Enter to post)"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition"
                  rows={2}
                />
                <div className="flex justify-end">
                  <button
                    onClick={submitComment}
                    disabled={commenting || !newComment.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-6 py-2 rounded-xl text-sm transition"
                  >
                    {commenting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ════ RIGHT ════ */}
          <div className="space-y-6">

            {/* Developer */}
            <div className="glass-card p-6">
              <span className="fl mb-4">Assigned Developer</span>
              <DevCard dev={bug.assignedDeveloper} />
            </div>

            {/* QA Actions */}
            <div className="glass-card p-6">
              <span className="fl mb-4">QA Actions Console</span>

              {closed ? (
                <div className="text-center py-4 text-emerald-600">
                  <CheckCircle size={36} className="mx-auto mb-2 opacity-70" />
                  <p className="font-black text-sm">Bug Closed</p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">No further action required.</p>
                </div>
              ) : canAct ? (
                <div className="space-y-3">
                  <button
                    onClick={() => handleStatusUpdate("closed")}
                    disabled={actioning}
                    className="w-full py-3 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white font-black rounded-xl text-sm transition border border-emerald-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <CheckCircle size={18} /> Verify &amp; Close Bug
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("reopened")}
                    disabled={actioning}
                    className="w-full py-3 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white font-black rounded-xl text-sm transition border border-rose-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <AlertTriangle size={18} /> Reopen — Fix Insufficient
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400">
                  <Lock size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="font-bold text-sm text-slate-500">Awaiting Developer Fix</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Actions unlock on retest request.</p>
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <div className="glass-card p-6">
              <span className="fl border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                <Activity size={13} className="text-indigo-400" /> Activity Timeline
              </span>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 cs">
                {(!bug.activityLogs || bug.activityLogs.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
                ) : [...bug.activityLogs].reverse().map((log, idx) => (
                  <div key={idx} className="flex gap-3 group relative pb-2">
                    {idx < bug.activityLogs.length - 1 && (
                      <div className="absolute left-[9px] top-[18px] bottom-0 w-[1.5px] bg-slate-100 z-0" />
                    )}
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 z-10 text-[10px]">
                      {actionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-600 leading-snug">
                        <span className="font-extrabold text-slate-800">{log.userName || "System"}</span>{" "}
                        <span className="text-[10px] text-slate-400">({log.userRole || "—"})</span>{" "}
                        {log.message}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                        {timeAgo(log.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bug Metadata */}
            <div className="glass-card p-6 space-y-3">
              <span className="fl mb-2">Bug Timeline</span>
              {[
                ["Created",      new Date(bug.createdAt).toLocaleString()],
                ["Last Updated", new Date(bug.updatedAt).toLocaleString()],
                ["Comments",     bug.reviewComments?.length || 0],
                ["Activity Logs",bug.activityLogs?.length || 0],
                ...(closed ? [[
                  "Resolution Time",
                  `${Math.round((new Date(bug.updatedAt) - new Date(bug.createdAt)) / 3600000)}h`
                ]] : [])
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-xs font-semibold text-slate-500 border-b border-slate-50 pb-2 last:border-0">
                  <span className="font-black text-slate-400">{label}</span>
                  <span className={label === "Resolution Time" ? "text-emerald-600 font-black" : ""}>{val}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BugDetails;
