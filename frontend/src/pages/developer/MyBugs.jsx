import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const MyBugs = () => {
    const [bugs, setBugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [currentBug, setCurrentBug] = useState(null);
    const [commentText, setCommentText] = useState("");

    useEffect(() => {
        const fetchBugs = async () => {
            try {
                const res = await API.get("/developer/bugs");
                setBugs(res.data.data);
            } catch (error) {
                console.error("Failed to fetch bugs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBugs();
    }, []);

    const handleStatusChange = async (bugId, newStatus) => {
        try {
            await API.put(`/bug/${bugId}`, { status: newStatus });
            setBugs(bugs.map(b => b._id === bugId ? { ...b, status: newStatus } : b));
            toast.success("Bug status updated!");
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleNeedInfo = (bug) => {
        setCurrentBug(bug);
        setShowCommentModal(true);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || !currentBug) return;
        try {
            await API.post(`/bug/${currentBug._id}/comments`, {
                comment: commentText,
                commenter: "Developer",
                authorRole: "developer"
            });
            setShowCommentModal(false);
            setCommentText("");
            toast.success("Comment added successfully. Tester will be notified.");
        } catch (err) {
            toast.error("Failed to add comment");
        }
    };

    if (loading) return <div className="text-center font-bold text-slate-500 py-10">Loading bugs...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">My Bugs</h2>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Bug Description</th>
                                <th className="p-4">Task</th>
                                <th className="p-4">Reported By</th>
                                <th className="p-4">Severity</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bugs.length === 0 ? (
                                <tr><td colSpan="7" className="p-6 text-center text-slate-400 font-bold">No bugs assigned.</td></tr>
                            ) : bugs.map(bug => (
                                <tr key={bug._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                                    <td className="p-4 text-xs font-bold text-slate-400">#{bug._id.slice(-6).toUpperCase()}</td>
                                    <td className="p-4 font-bold text-slate-800">{bug.bugTitle}</td>
                                    <td className="p-4 text-slate-600 font-semibold">{bug.taskId?.taskTitle || "N/A"}</td>
                                    <td className="p-4 text-slate-600 font-semibold">{bug.reportBy}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${bug.severity === 'critical' || bug.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {bug.severity || "LOW"}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${bug.status === 'resolved' || bug.status === 'closed' ? 'bg-emerald-100 text-emerald-700' : bug.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {bug.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {(bug.status === 'open' || bug.status === 'submitted' || bug.status === 'draft') && (
                                                    <button onClick={() => handleStatusChange(bug._id, 'in_progress')} className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black px-3 py-1.5 rounded transition">Start Work</button>
                                                )}
                                                {(bug.status === 'in_progress' || bug.status === 'reopened') && (
                                                    <button onClick={() => handleStatusChange(bug._id, 'retest')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded transition">Mark Fixed</button>
                                                )}
                                                {bug.status !== 'closed' && bug.status !== 'resolved' && (
                                                    <button onClick={() => handleNeedInfo(bug)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black px-3 py-1.5 rounded transition">Need Info</button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-500 font-semibold align-top">{new Date(bug.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Comment Modal */}
            {showCommentModal && currentBug && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="glass-card w-full max-w-md p-6 animate-fade-in bg-white/90">
                        <h3 className="text-xl font-black text-slate-800 mb-2">Need More Info</h3>
                        <p className="text-sm font-semibold text-slate-500 mb-4">Ask the tester for more details about bug <span className="text-indigo-600">#{currentBug._id.slice(-6).toUpperCase()}</span></p>

                        <form onSubmit={handleCommentSubmit} className="space-y-4">
                            <div>
                                <textarea
                                    required
                                    rows="4"
                                    className="custom-select w-full resize-none bg-white font-medium"
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    placeholder="What extra information do you need?"
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" className="btn-action flex-1 justify-center py-2 bg-slate-100" onClick={() => { setShowCommentModal(false); setCommentText(""); }}>Cancel</button>
                                <button type="submit" className="btn-primary flex-1 justify-center py-2">Post Comment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBugs;
