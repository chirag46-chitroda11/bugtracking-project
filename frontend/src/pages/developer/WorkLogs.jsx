import React, { useState, useEffect, useMemo } from "react";
import API from "../../api/axios";
import { PlusCircle, Search, Edit2, Trash2, Copy, FileText, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useConfirm } from "../../context/ConfirmContext";

const WorkLogs = () => {
    const confirm = useConfirm();
    const [logs, setLogs] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        _id: "",
        taskId: "",
        hoursWorked: "",
        workDescription: "",
        logDate: new Date().toISOString().split("T")[0]
    });

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [monthFilter, setMonthFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const user = JSON.parse(localStorage.getItem("user")) || {};

    useEffect(() => {
        fetchLogs();
        fetchTasks();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await API.get("/developer/worklogs");
            // Normalize legacy records inline immediately
            const normalizedLogs = res.data.data.map(log => ({
                ...log,
                logDate: log.logDate || log.createdAt || new Date().toISOString()
            }));
            setLogs(normalizedLogs);
        } catch (error) {
            console.error("Failed to fetch logs", error);
            toast.error("Failed to load logs");
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await API.get("/developer/tasks");
            setTasks(res.data.data);
        } catch (error) {
            console.error("Failed to fetch tasks for form", error);
        }
    };

    const handleOpenModal = (log = null, isDuplicate = false) => {
        if (log) {
            setFormData({
                _id: isDuplicate ? "" : log._id,
                taskId: log.taskId?._id || log.taskId,
                hoursWorked: log.hoursWorked,
                workDescription: log.workDescription || "",
                logDate: log.logDate ? new Date(log.logDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
            });
            setEditMode(!isDuplicate);
        } else {
            setFormData({ _id: "", taskId: "", hoursWorked: "", workDescription: "", logDate: new Date().toISOString().split("T")[0] });
            setEditMode(false);
        }
        setShowModal(true);
    };

    const handleLogWork = async (e) => {
        e.preventDefault();
        try {
            if (editMode && formData._id) {
                await API.put(`/timelog/${formData._id}`, { ...formData, developerId: user._id });
                toast.success("Worklog updated");
            } else {
                await API.post("/timelog", { ...formData, developerId: user._id });
                toast.success("Worklog created");
            }
            setShowModal(false);
            fetchLogs();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save log");
        }
    };

    const handleDelete = async (id) => {
        if (!(await confirm({ title: "Delete Worklog", message: "Are you sure you want to delete this worklog permanently? This action cannot be revoked." }))) return;
        try {
            await API.delete(`/timelog/${id}`);
            toast.success("Worklog deleted");
            // Automatically correct pagination if last item deleted
            if (paginatedLogs.length === 1 && currentPage > 1) {
                setCurrentPage(p => p - 1);
            }
            fetchLogs();
        } catch (error) {
            toast.error("Failed to delete worklog");
        }
    };

    // Derived states
    const filteredLogs = useMemo(() => {
        return logs
            .filter(l => {
                const searchStr = `${l.workDescription || ''} ${l.taskId?.taskTitle || ''}`.toLowerCase();
                return searchStr.includes(searchTerm.toLowerCase());
            })
            .filter(l => {
                if (monthFilter === "all") return true;
                return new Date(l.logDate).getMonth().toString() === monthFilter;
            });
    }, [logs, searchTerm, monthFilter]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Auto-reset page if filtering creates empty pages
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    if (loading) return <div className="text-center font-bold text-slate-500 py-10 animate-pulse">Loading worklogs...</div>;

    return (
        <div className="space-y-6 animate-fade-in relative min-h-screen pb-10">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-200 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">My Work Logs</h2>
                    <p className="text-slate-500 text-sm font-semibold mt-1 flex items-center gap-2">
                        <Clock size={14} className="text-indigo-500" /> Manage your trackable hours and task descriptions
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-slate-200 text-sm font-semibold text-slate-700 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-48 transition-all"
                        />
                    </div>
                    <select
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="bg-white border border-slate-200 text-sm font-semibold text-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
                    >
                        <option value="all">🗓 All Time</option>
                        <option value={new Date().getMonth().toString()}>This Month</option>
                        <option value={(new Date().getMonth() - 1 < 0 ? 11 : new Date().getMonth() - 1).toString()}>Last Month</option>
                    </select>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5" onClick={() => handleOpenModal(null)}>
                        <PlusCircle size={18} /> Log Work
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden shadow-sm !rounded-2xl border border-slate-100 bg-white/70">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 backdrop-blur-sm">
                            <tr>
                                <th className="p-4 pl-6 uppercase tracking-wider text-[11px]">Date</th>
                                <th className="p-4 uppercase tracking-wider text-[11px]">Task Reference</th>
                                <th className="p-4 uppercase tracking-wider text-[11px]">Time</th>
                                <th className="p-4 uppercase tracking-wider text-[11px] w-1/3">Description</th>
                                <th className="p-4 pr-6 uppercase tracking-wider text-[11px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Calendar size={40} className="mb-3 opacity-50" />
                                            <p className="font-bold text-base">No worklogs found</p>
                                            <p className="text-xs mt-1">Try adjusting your filters or create a new entry.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedLogs.map(log => {
                                const logDate = new Date(log.logDate);
                                const isToday = logDate.toDateString() === new Date().toDateString();
                                const isYesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toDateString() === logDate.toDateString();
                                
                                return (
                                    <tr key={log._id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="font-bold text-slate-800">{isToday ? "Today" : isYesterday ? "Yesterday" : logDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-indigo-900 max-w-[200px] truncate" title={log.taskId?.taskTitle || "N/A"}>{log.taskId?.taskTitle || "N/A"}</div>
                                            {log.taskId?.projectId && <div className="text-[10px] bg-slate-100 text-slate-500 inline-block px-1.5 py-0.5 rounded font-black mt-1">PROJECT</div>}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-black text-xs inline-flex items-center gap-1 shadow-sm">
                                                <Clock size={12}/> {log.hoursWorked} hrs
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-start gap-2 group-hover:text-slate-800 text-slate-600 transition-colors">
                                                <FileText size={16} className="text-slate-300 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs font-medium leading-relaxed max-w-[300px] break-words line-clamp-2" title={log.workDescription || "No Description"}>
                                                    {log.workDescription || <span className="italic text-slate-400">No Description Recorded</span>}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(log, false)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors tooltip" title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleOpenModal(log, true)} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors tooltip" title="Duplicate">
                                                    <Copy size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(log._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="bg-slate-50/80 p-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
                        </span>
                        <div className="flex items-center gap-1">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1 px-2 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition">
                                <ChevronLeft size={16} />
                            </button>
                            <div className="px-3 py-1 font-black text-xs text-slate-700 bg-white rounded-md shadow-sm border border-slate-200">
                                {currentPage} <span className="text-slate-400 font-medium">/ {totalPages}</span>
                            </div>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1 px-2 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-fade-in border border-slate-100">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                {editMode ? <Edit2 size={18} className="text-indigo-500" /> : <PlusCircle size={18} className="text-indigo-500" />}
                                {editMode ? "Edit Worklog" : "Log Daily Work"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 font-bold transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleLogWork} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Select Target Task</label>
                                <select required className="custom-select w-full bg-slate-50 border-slate-200 focus:bg-white text-sm" value={formData.taskId} onChange={e => setFormData({ ...formData, taskId: e.target.value })}>
                                    <option value="" disabled>-- Choose Assigned Task --</option>
                                    {tasks.map(t => <option key={t._id} value={t._id}>{t.taskTitle}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Hours Worked</label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="number" step="0.5" min="0.5" required className="custom-select w-full bg-slate-50 border-slate-200 pl-10 focus:bg-white text-sm" value={formData.hoursWorked} onChange={e => setFormData({ ...formData, hoursWorked: e.target.value })} placeholder="e.g. 4.5" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Log Date</label>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="date" required className="custom-select w-full bg-slate-50 border-slate-200 pl-10 focus:bg-white text-sm" value={formData.logDate} onChange={e => setFormData({ ...formData, logDate: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Work Description</label>
                                <textarea required rows="4" className="custom-select w-full resize-none bg-slate-50 border-slate-200 focus:bg-white text-sm leading-relaxed" value={formData.workDescription} onChange={e => setFormData({ ...formData, workDescription: e.target.value })} placeholder="Provide a detailed summary of what you accomplished..."></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" className="px-5 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors text-sm" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-lg shadow-sm transition-all hover:shadow text-sm">
                                    {editMode ? "Save Changes" : "Create Worklog"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkLogs;
