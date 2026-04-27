import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, CheckCircle, XCircle, Bug as BugIcon, Clock, User } from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const TesterTaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [taskRes, commentsRes] = await Promise.all([
                    API.get(`/task/${id}`),
                    API.get(`/task/${id}/comments`)
                ]);
                setTask(taskRes.data.data);
                setComments(commentsRes.data.data || []);
            } catch (err) {
                toast.error("Failed to load task details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            await API.put(`/task/${id}`, { status: newStatus });
            setTask(prev => ({ ...prev, status: newStatus }));
            toast.success(`Task marked as "${newStatus}"`);
        } catch {
            toast.error("Failed to update status");
        }
    };

    const submitComment = async () => {
        if (!newComment.trim()) return;
        setIsPosting(true);
        try {
            const res = await API.post(`/task/${id}/comments`, { text: newComment });
            setComments(prev => [res.data.data, ...prev]);
            setNewComment("");
            toast.success("Comment posted");
        } catch (err) {
            toast.error("Failed to post comment. Please login again if the issue persists.");
        } finally {
            setIsPosting(false);
        }
    };

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

    const statusColors = {
        pending: "bg-slate-100 text-slate-600 border-slate-200",
        "in progress": "bg-amber-100 text-amber-700 border-amber-200",
        testing: "bg-purple-100 text-purple-700 border-purple-200",
        completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };

    const priorityColors = {
        high: "bg-red-100 text-red-700",
        medium: "bg-amber-100 text-amber-700",
        low: "bg-blue-100 text-blue-700",
    };

    return (
        <div className="min-h-screen bg-[#ccd6ff] p-4 md:p-8 text-slate-800 relative overflow-x-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                body, * { font-family: 'Plus Jakarta Sans', sans-serif; }
                .glass-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .bg-circle { position: absolute; border: 15px solid rgba(79, 70, 229, 0.05); border-radius: 50%; pointer-events: none; z-index: 0; }
                .c1 { width: 600px; height: 600px; top: -100px; right: -200px; animation: float 20s infinite; }
                .c2 { width: 400px; height: 400px; bottom: -50px; left: -100px; animation: float 15s infinite reverse; }
                @keyframes float { 50% { transform: translateY(-20px) scale(1.05); } }
            `}</style>

            <div className="bg-circle c1"></div>
            <div className="bg-circle c2"></div>

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 font-bold text-slate-600 hover:text-indigo-600 transition bg-white/50 px-4 py-2 rounded-xl border border-white backdrop-blur-sm w-fit"
                >
                    <ArrowLeft size={18} /> Back to Tasks
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: Task Core Details + Comments */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Task Header Card */}
                        <div className="glass-card p-6 md:p-8">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-1 rounded uppercase tracking-widest">
                                    ID: {task._id.slice(-6)}
                                </span>
                                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest border ${statusColors[task.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                    {task.status}
                                </span>
                                {task.priority && (
                                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${priorityColors[task.priority] || "bg-slate-100 text-slate-700"}`}>
                                        {task.priority} Priority
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                                {task.taskTitle}
                            </h1>

                            <p className="text-slate-600 font-medium leading-relaxed">
                                {task.description || "No description provided."}
                            </p>

                            {/* Dates */}
                            {(task.startDate || task.endDate) && (
                                <div className="flex gap-6 mt-6 pt-4 border-t border-slate-100">
                                    {task.startDate && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Start Date</p>
                                            <p className="text-sm font-bold text-slate-700">{new Date(task.startDate).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                    {task.endDate && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Due Date</p>
                                            <p className="text-sm font-bold text-slate-700">{new Date(task.endDate).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                    {task.timeSpent > 0 && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Time Logged</p>
                                            <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                                <Clock size={13} /> {(task.timeSpent / 3600).toFixed(1)}h
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Comments & Review Log */}
                        <div className="glass-card p-6 md:p-8">
                            <h2 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <MessageSquare size={18} className="text-indigo-500" /> Review Comments & Notes
                            </h2>

                            {/* Existing Comments */}
                            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {comments.length === 0 ? (
                                    <p className="text-slate-400 font-semibold italic text-sm text-center py-8">
                                        No comments yet. Be the first to add review notes.
                                    </p>
                                ) : comments.map((c) => (
                                    <div key={c._id} className="bg-white/60 p-4 rounded-xl border border-white flex gap-4">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-indigo-100 flex items-center justify-center font-black text-indigo-700 text-lg flex-shrink-0">
                                            {c.userId?.profilePicture
                                                ? <img src={c.userId.profilePicture} alt="user" className="w-full h-full object-cover" />
                                                : c.userId?.name?.charAt(0) || "U"
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-800">{c.userId?.name || "User"}</span>
                                                <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase font-black">
                                                    {c.userId?.role || "member"}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    {new Date(c.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap">{c.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* New Comment Input */}
                            <div className="flex flex-col gap-3">
                                <textarea
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) submitComment(); }}
                                    placeholder="Add testing notes, verification results, or failure details... (Ctrl+Enter to post)"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none resize-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition"
                                    rows={3}
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={submitComment}
                                        disabled={isPosting || !newComment.trim()}
                                        className={`font-bold px-6 py-2.5 rounded-xl text-sm transition ${
                                            isPosting || !newComment.trim()
                                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                        }`}
                                    >
                                        {isPosting ? "Posting..." : "Post Comment"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Meta Info + Actions */}
                    <div className="space-y-6">

                        {/* Developer Info */}
                        <div className="glass-card p-6">
                            <h2 className="font-black text-sm text-slate-800 mb-4 uppercase tracking-widest border-b border-slate-100 pb-2">
                                Assigned Developer
                            </h2>

                            {task.assignedDeveloper ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xl flex-shrink-0">
                                        {task.assignedDeveloper.profilePicture
                                            ? <img src={task.assignedDeveloper.profilePicture} alt="dev" className="w-full h-full object-cover" />
                                            : task.assignedDeveloper.name?.charAt(0) || "D"
                                        }
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-700">{task.assignedDeveloper.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.assignedDeveloper.role || "developer"}</p>
                                        {task.assignedDeveloper.email && (
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{task.assignedDeveloper.email}</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <User size={16} />
                                    <span className="text-sm font-bold italic">Unassigned</span>
                                </div>
                            )}

                            <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                                {task.projectId && (
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Project</p>
                                        <p className="text-sm font-bold text-slate-700">{task.projectId.projectName || "Unknown"}</p>
                                    </div>
                                )}
                                {task.moduleId && (
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Module</p>
                                        <p className="text-sm font-bold text-slate-700">{task.moduleId.moduleName || "General"}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Created</p>
                                    <p className="text-sm font-bold text-slate-700">{new Date(task.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions Panel */}
                        <div className="glass-card p-6">
                            <h2 className="font-black text-sm text-slate-800 mb-4 uppercase tracking-widest border-b border-slate-100 pb-2">
                                Testing Actions
                            </h2>

                            <div className="space-y-3">
                                {task.status !== "completed" && (
                                    <button
                                        onClick={() => handleStatusUpdate("completed")}
                                        className="w-full py-3 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white font-black rounded-xl text-sm transition border border-emerald-200 hover:border-emerald-500 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} /> Pass — Mark as Tested
                                    </button>
                                )}

                                {task.status !== "testing" && task.status !== "pending" && (
                                    <button
                                        onClick={() => handleStatusUpdate("testing")}
                                        className="w-full py-3 bg-purple-50 hover:bg-purple-500 text-purple-600 hover:text-white font-black rounded-xl text-sm transition border border-purple-200 hover:border-purple-500 flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} /> Fail — Send Back for Retest
                                    </button>
                                )}

                                <button
                                    onClick={() => navigate("/create-bug")}
                                    className="w-full py-3 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-black rounded-xl text-sm transition border border-red-200 hover:border-red-500 flex items-center justify-center gap-2"
                                >
                                    <BugIcon size={18} /> Report Bug Against This Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TesterTaskDetail;
