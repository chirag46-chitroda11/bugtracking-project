import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const MyTasks = ({ onSelectTask }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await API.get("/developer/tasks");
                setTasks(res.data.data);
            } catch (error) {
                console.error("Failed to fetch tasks", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await API.put(`/task/${taskId}`, { status: newStatus });
            setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
            toast.success("Task status updated!");
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div className="text-center font-bold text-slate-500 py-10">Loading tasks...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">My Assignments</h2>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="custom-select w-64"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="custom-select"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="testing">Testing</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Task Title</th>
                                <th className="p-3">Project</th>
                                <th className="p-3">Sprint & Module</th>
                                <th className="p-3">Priority</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Due / Est</th>
                                <th className="p-3">Assigned By</th>
                                <th className="p-3">Linked Bug</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.filter(t => t.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) && (statusFilter === 'all' || t.status === statusFilter)).length === 0 ? (
                                <tr><td colSpan="9" className="p-6 text-center text-slate-400 font-bold">No tasks found.</td></tr>
                            ) : tasks.filter(t => t.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) && (statusFilter === 'all' || t.status === statusFilter)).map(task => (
                                <tr key={task._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition cursor-pointer" onClick={() => onSelectTask(task)}>
                                    <td className="p-3 text-[10px] font-black text-slate-400">#{task._id.slice(-6).toUpperCase()}</td>
                                    <td className="p-3 font-bold text-slate-800 text-xs">{task.taskTitle}</td>
                                    <td className="p-3 text-slate-600 font-semibold text-xs">{task.projectId?.projectName || "N/A"}</td>
                                    <td className="p-3 text-slate-600 font-semibold text-xs">
                                        <div className="flex flex-col">
                                            <span className="text-indigo-600 font-black text-[10px] uppercase">{task.sprintName}</span>
                                            <span>{task.moduleId?.moduleName || "N/A"}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${task.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {task.priority || "LOW"}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase ${task.status === 'testing' ? 'bg-indigo-100 text-indigo-700' : task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : ''}`}>{task.status}</span>
                                    </td>
                                    <td className="p-3 text-slate-500 font-semibold text-xs">
                                        <div className="flex flex-col">
                                            <span>{task.endDate ? new Date(task.endDate).toLocaleDateString() : 'No Due'}</span>
                                            <span className="text-[10px] font-bold text-slate-400">{task.estimatedHours || 0}h Est.</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-slate-600 font-bold text-xs">
                                        <div className="flex flex-col">
                                            <span>{task.assignBy?.name || "System"}</span>
                                            {task.assignBy?.role && <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{task.assignBy.role}</span>}
                                        </div>
                                    </td>
                                    <td className="p-3 text-slate-500 font-semibold text-xs border-l border-slate-100">
                                        {task.linkedBug ? <span className="text-red-500 font-bold text-[10px]">BUG: {task.linkedBug}</span> : <span className="text-slate-300 italic text-[10px]">None</span>}
                                    </td>
                                    <td className="p-3 text-right">
                                        <button className="px-3 py-1.5 bg-white border border-indigo-100 shadow-sm hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-xl text-xs font-bold transition">
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyTasks;
