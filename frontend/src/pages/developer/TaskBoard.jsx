import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const TaskBoard = ({ onSelectTask }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Columns definition
  const columns = [
    { id: "pending", title: "Todo", color: "bg-slate-100", textColor: "text-slate-600" },
    { id: "in progress", title: "In Progress", color: "bg-blue-50", textColor: "text-blue-600" },
    { id: "testing", title: "Review", color: "bg-amber-50", textColor: "text-amber-600" },
    { id: "completed", title: "Done", color: "bg-emerald-50", textColor: "text-emerald-600" }
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    
    // optimistically update state
    const currentTask = tasks.find(t => t._id === taskId);
    if (currentTask && currentTask.status !== newStatus) {
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      try {
        await API.put(`/task/${taskId}`, { status: newStatus });
        toast.success("Task status updated!");
      } catch (error) {
        toast.error("Failed to update status");
        fetchTasks(); // rollback on error
      }
    }
  };

  if(loading) return <div className="text-center font-bold text-slate-500 py-10">Loading Task Board...</div>;

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl backdrop-blur-md border border-white/60 shadow-sm shrink-0">
          <h2 className="text-2xl font-black text-slate-800">Task Board</h2>
      </div>
      
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {columns.map(col => (
          <div 
            key={col.id} 
            className={`w-[320px] rounded-2xl border flex-shrink-0 flex flex-col backdrop-blur-md shadow-sm border-white/50 ${col.color}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className={`p-4 border-b border-white border-opacity-50 flex justify-between items-center`}>
              <h3 className={`font-black ${col.textColor} uppercase tracking-wider text-sm`}>{col.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-white ${col.textColor}`}>
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div 
                  key={task._id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  onClick={() => onSelectTask && onSelectTask(task)}
                  className="bg-white/80 p-4 rounded-xl shadow-sm border border-white hover:shadow-md cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-all group"
                >
                  <div className="text-[10px] uppercase font-black text-slate-400 mb-1 flex justify-between">
                    <span>{task.projectId?.projectName || "No Project"}</span>
                    <span>{task.priority === 'high' ? '🔴 HIGH' : task.priority === 'medium' ? '🟡 MED' : '🟢 LOW'}</span>
                  </div>
                  <h4 className="font-bold text-slate-700 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                    {task.taskTitle}
                  </h4>
                  <div className="text-[10px] bg-slate-50 text-slate-500 font-semibold p-1.5 rounded-lg border border-slate-100 mb-3 flex justify-between items-center">
                    <span>Assigned By: <strong className="text-slate-700">{task.assignBy?.name || "System"}</strong></span>
                    {task.assignBy?.role && <span className="bg-indigo-100 text-indigo-700 px-1 py-0.5 rounded text-[8px] uppercase font-black uppercase tracking-widest">{task.assignBy.role}</span>}
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>#{task._id.slice(-6).toUpperCase()}</span>
                    {task.timeSpent ? <span>{(task.timeSpent / 3600).toFixed(1)}h</span> : ''}
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="text-center p-6 border-2 border-dashed border-white/50 rounded-xl text-slate-400 font-bold text-sm">
                  Drop Tasks Here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;
