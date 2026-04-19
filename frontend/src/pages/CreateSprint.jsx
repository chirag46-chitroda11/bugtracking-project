import React, { useState, useEffect } from "react";
import { createSprint } from "../services/sprintService";
import API from "../api/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const CreateSprint = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultProjectId = searchParams.get('project') || "";

  const [form, setForm] = useState({
    sprintName: "",
    projectId: defaultProjectId,
    startDate: "",
    endDate: "",
    sprintGoal: "",
    capacityHours: 0,
    priorityFocus: "medium",
    status: "planned",
    notes: "",
    assignedDevelopers: [],
    assignedTesters: []
  });

  const [projects, setProjects] = useState([]);
  const [devs, setDevs] = useState([]);
  const [testers, setTesters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          API.get("/project"),
          API.get("/user/users")
        ]);
        setProjects(projRes.data.data || []);
        
        const allUsers = userRes.data.data || [];
        setDevs(allUsers.filter(u => u.role === "developer"));
        setTesters(allUsers.filter(u => u.role === "tester"));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sprintName || !form.projectId) {
      toast.error("Sprint Name and Project are mandatory.");
      return;
    }

    try {
      await createSprint(form);
      toast.success("Sprint configured successfully.");
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create Sprint");
    }
  };

  const handleMultiselect = (e, field) => {
    const options = e.target.options;
    const value = [];
    for (let i = 0; i < options.length; i++) {
       if (options[i].selected) value.push(options[i].value);
    }
    setForm({...form, [field]: value});
  };

  return (
    <div className="layout-wrapper relative min-h-screen flex items-center justify-center p-6 text-slate-800">
      <Toaster position="top-right"/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        .layout-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; background: #ccd6ff; overflow: hidden; }
        .bg-circle { position: absolute; border: 15px solid rgba(16, 185, 129, 0.05); border-radius: 50%; pointer-events: none; z-index: 0; }
        .c1 { width: 500px; height: 500px; top: -100px; right: -100px; animation: float 15s infinite; }
        .c2 { width: 300px; height: 300px; bottom: 50px; left: -50px; animation: float 10s infinite reverse; }
        @keyframes float { 50% { transform: translateY(-20px) scale(1.05); } }
        
        .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid #fff; box-shadow: 0 10px 40px rgba(0,0,0,0.05); padding: 40px; width: 100%; max-width: 800px; z-index: 10; position: relative; max-height: 90vh; overflow-y: auto; }
        
        .custom-input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-family: inherit; font-size: 0.95rem; font-weight: 600; color: #334155; margin-bottom: 20px; transition: 0.3s; outline: none; }
        .custom-input:focus { border-color: #10b981; background: #fff; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
        .custom-label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; display: block; margin-left: 4px; }
        
        .btn-primary { width: 100%; background: #121212; color: #fff; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 1rem; border: none; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .btn-primary:hover { background: #10b981; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25); }
      `}</style>
      
      <div className="bg-circle c1"></div>
      <div className="bg-circle c2"></div>

      <div className="glass-card custom-scrollbar">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-500 hover:text-emerald-500 transition font-bold text-xl">←</button>
          <div>
            <h2 className="text-2xl font-black text-emerald-950 tracking-tight">Sprint Configuration</h2>
            <p className="text-slate-500 font-semibold text-sm">Designate a new task iteration cycle.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
             <div>
               <label className="custom-label">Target Project *</label>
               <select className="custom-input" value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})}>
                 <option value="">Select Project</option>
                 {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
               </select>
             </div>
             <div>
               <label className="custom-label">Sprint Name *</label>
               <input type="text" className="custom-input" placeholder="e.g. Iteration 1 - Auth Base" value={form.sprintName} onChange={e => setForm({...form, sprintName: e.target.value})} />
             </div>
          </div>

          <div>
             <label className="custom-label">Sprint Goal</label>
             <input type="text" className="custom-input" placeholder="Primary objective of this sprint..." value={form.sprintGoal} onChange={e => setForm({...form, sprintGoal: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 border-t border-slate-100 pt-4">
             <div>
                <label className="custom-label">Capacity (Hours)</label>
                <input type="number" className="custom-input" value={form.capacityHours} onChange={e => setForm({...form, capacityHours: e.target.value})} />
             </div>
             <div>
                <label className="custom-label">Priority Focus</label>
                <select className="custom-input" value={form.priorityFocus} onChange={e => setForm({...form, priorityFocus: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
             </div>
             <div>
                <label className="custom-label">Sprint Status</label>
                <select className="custom-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="planned">Planned (Draft)</option>
                  <option value="active">Active (Started)</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
             <div>
                <label className="custom-label">Start Date</label>
                <input type="date" className="custom-input !mb-0" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
             </div>
             <div>
                <label className="custom-label">Target Date</label>
                <input type="date" className="custom-input !mb-0" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mt-6 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
             <div>
               <label className="custom-label">Assign Developers to Sprint</label>
               <select multiple className="custom-input h-24 custom-scrollbar text-sm" value={form.assignedDevelopers} onChange={e => handleMultiselect(e, 'assignedDevelopers')}>
                  {devs.map(d => <option key={d._id} value={d._id} className="p-1.5 border-b border-slate-100 font-bold">{d.name}</option>)}
               </select>
             </div>
             <div>
               <label className="custom-label">Assign Testers to Sprint</label>
               <select multiple className="custom-input h-24 custom-scrollbar text-sm" value={form.assignedTesters} onChange={e => handleMultiselect(e, 'assignedTesters')}>
                  {testers.map(t => <option key={t._id} value={t._id} className="p-1.5 border-b border-slate-100 font-bold">{t.name}</option>)}
               </select>
             </div>
          </div>

          <button type="submit" className="btn-primary mt-6">Confirm Sprint Configuration</button>
        </form>
      </div>
    </div>
  );
};

export default CreateSprint;
