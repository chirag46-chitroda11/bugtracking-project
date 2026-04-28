import React, { useState, useEffect } from "react";
import { getSprintById, updateSprint } from "../services/sprintService";
import API from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const EditSprint = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    sprintName: "",
    projectId: "",
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

        // getSprintById returns res.data from service, so sprintRes = { success, data: sprint }
        const sprintRes = await getSprintById(id);
        const s = sprintRes?.data;

        if (s) {
          setForm({
            sprintName: s.sprintName || "",
            projectId: s.projectId?._id || s.projectId || "",
            startDate: s.startDate ? s.startDate.split('T')[0] : "",
            endDate: s.endDate ? s.endDate.split('T')[0] : "",
            sprintGoal: s.sprintGoal || "",
            capacityHours: s.capacityHours || 0,
            priorityFocus: s.priorityFocus || "medium",
            status: s.status || "planned",
            notes: s.notes || "",
            assignedDevelopers: s.assignedDevelopers ? s.assignedDevelopers.map(d => d._id || d) : [],
            assignedTesters: s.assignedTesters ? s.assignedTesters.map(t => t._id || t) : []
          });
        } else {
          toast.error("Sprint data not found");
        }
      } catch (error) {
        console.error("EditSprint load error:", error);
        toast.error("Could not load sprint — " + (error?.message || "check connection"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sprintName || !form.projectId) {
      toast.error("Sprint Name and Project are mandatory.");
      return;
    }

    setSaving(true);
    try {
      await updateSprint(id, form);
      toast.success("Sprint metrics updated successfully.");
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      toast.error(error?.message || error?.response?.data?.message || "Failed to update Sprint");
    } finally {
      setSaving(false);
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

  if(loading) return null;

  return (
    <div className="layout-wrapper relative min-h-screen flex items-center justify-center p-6 text-slate-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        .layout-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; background: #ccd6ff; overflow: hidden; }
        .bg-circle { position: absolute; border: 15px solid rgba(14, 165, 233, 0.05); border-radius: 50%; pointer-events: none; z-index: 0; }
        .c1 { width: 500px; height: 500px; top: -100px; right: -100px; animation: float 15s infinite; }
        .c2 { width: 300px; height: 300px; bottom: 50px; left: -50px; animation: float 10s infinite reverse; }
        @keyframes float { 50% { transform: translateY(-20px) scale(1.05); } }
        
        .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid #fff; box-shadow: 0 10px 40px rgba(0,0,0,0.05); padding: 40px; width: 100%; max-width: 800px; z-index: 10; position: relative; max-height: 90vh; overflow-y: auto; }
        
        .custom-input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-family: inherit; font-size: 0.95rem; font-weight: 600; color: #334155; margin-bottom: 20px; transition: 0.3s; outline: none; }
        .custom-input:focus { border-color: #0ea5e9; background: #fff; box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1); }
        .custom-label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; display: block; margin-left: 4px; }
        
        .btn-primary { width: 100%; background: #121212; color: #fff; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 1rem; border: none; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .btn-primary:hover { background: #0ea5e9; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(14, 165, 233, 0.25); }
      `}</style>
      
      <div className="bg-circle c1"></div>
      <div className="bg-circle c2"></div>

      <div className="glass-card custom-scrollbar">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-500 hover:text-sky-500 transition font-bold text-xl">←</button>
          <div>
            <h2 className="text-2xl font-black text-sky-950 tracking-tight">Modify Sprint Strategy</h2>
            <p className="text-slate-500 font-semibold text-sm">Fine-tune existing iteration constraints.</p>
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
                  <option value="completed">Completed</option>
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
               <select multiple className="custom-input h-24 custom-scrollbar text-sm shadow-inner" value={form.assignedDevelopers} onChange={e => handleMultiselect(e, 'assignedDevelopers')}>
                  {devs.map(d => <option key={d._id} value={d._id} className="p-1.5 border-b border-slate-100 font-bold">{d.name}</option>)}
               </select>
             </div>
             <div>
               <label className="custom-label">Assign Testers to Sprint</label>
               <select multiple className="custom-input h-24 custom-scrollbar text-sm shadow-inner" value={form.assignedTesters} onChange={e => handleMultiselect(e, 'assignedTesters')}>
                  {testers.map(t => <option key={t._id} value={t._id} className="p-1.5 border-b border-slate-100 font-bold">{t.name}</option>)}
               </select>
             </div>
          </div>

          <button type="submit" className="btn-primary mt-6" disabled={saving}>
            {saving ? "Updating Sprint..." : "Apply Sprint Matrix Edits"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditSprint;
