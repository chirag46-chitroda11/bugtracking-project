import { useState, useEffect } from "react";
import { createProject } from "../services/projectService";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CreateProject = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    projectName: "",
    projectCode: "",
    description: "",
    clientName: "",
    priority: "medium",
    techStack: "",
    riskLevel: "low",
    projectManager: "",
    startDate: "",
    endDate: "",
    developers: [],
    testers: []
  });
  
  const [pms, setPms] = useState([]);
  const [devs, setDevs] = useState([]);
  const [testers, setTesters] = useState([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/user/users");
        const allUsers = res.data.data;
        setPms(allUsers.filter(u => u.role === "project_manager" || u.role === "admin"));
        setDevs(allUsers.filter(u => u.role === "developer"));
        setTesters(allUsers.filter(u => u.role === "tester"));
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);
  
  const user = JSON.parse(localStorage.getItem("user"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.projectName || !form.description || !form.projectManager || !form.projectCode) {
      toast.error("Required core fields missing!");
      return;
    }

    try {
      const payload = {
         ...form,
         techStack: form.techStack.split(",").map(s => s.trim()).filter(x => x),
         createdBy: user._id
      };
      
      await createProject(payload);
      toast.success("Project Created Successfully! 🚀");
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error creating project ❌");
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
    <div className="layout-wrapper relative min-h-screen p-6 md:p-10 text-slate-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        .layout-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; background: #ccd6ff; overflow-y: auto; overflow-x: hidden; }
        .bg-circle { position: absolute; border: 15px solid rgba(79, 70, 229, 0.05); border-radius: 50%; pointer-events: none; z-index: 0; }
        .c1 { width: 600px; height: 600px; top: -100px; right: -100px; animation: float 15s infinite; }
        .c2 { width: 400px; height: 400px; bottom: 50px; left: -50px; animation: float 10s infinite reverse; }
        @keyframes float { 50% { transform: translateY(-20px) scale(1.05); } }
        
        .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid #fff; box-shadow: 0 10px 40px rgba(0,0,0,0.05); padding: 40px; width: 100%; max-width: 900px; margin: 0 auto; z-index: 10; position: relative; }
        
        .custom-input { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-family: inherit; font-size: 0.95rem; font-weight: 600; color: #334155; margin-bottom: 20px; transition: 0.3s; outline: none; }
        .custom-input:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        .custom-label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; display: block; margin-left: 4px; }
        
        .btn-primary { width: 100%; background: #121212; color: #fff; padding: 16px; border-radius: 14px; font-weight: 800; font-size: 1.1rem; border: none; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .btn-primary:hover { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25); }
      `}</style>
      
      <div className="bg-circle c1"></div>
      <div className="bg-circle c2"></div>

      <div className="glass-card">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200/60">
          <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 transition font-black text-2xl hover:scale-105 active:scale-95">←</button>
          <div>
            <h2 className="text-3xl font-black text-indigo-950 tracking-tight">Project Initialization</h2>
            <p className="text-slate-500 font-semibold text-sm mt-1">Configure your new project and assign teams.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
             <div>
                <label className="custom-label">Project Name *</label>
                <input type="text" className="custom-input" placeholder="e.g. Phoenix Overhaul" value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} />
             </div>
             <div>
                <label className="custom-label">Project Code *</label>
                <input type="text" className="custom-input uppercase" placeholder="e.g. PHX" value={form.projectCode} onChange={(e) => setForm({ ...form, projectCode: e.target.value.toUpperCase() })} />
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
             <div className="md:col-span-2">
               <label className="custom-label">Description *</label>
               <textarea className="custom-input h-24 resize-none" placeholder="Detailed description of the project scope..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
             <div>
                <label className="custom-label">Client Name</label>
                <input type="text" className="custom-input" placeholder="Optional" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
             </div>
             <div>
                <label className="custom-label">Prioritization</label>
                <select className="custom-input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                   <option value="low">Low Priority</option>
                   <option value="medium">Medium Priority</option>
                   <option value="high">High Priority</option>
                   <option value="critical">Critical</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
             <div>
                <label className="custom-label">Designated Project Manager *</label>
                <select className="custom-input" value={form.projectManager} onChange={e => setForm({...form, projectManager: e.target.value})}>
                  <option value="">Select PM</option>
                  {pms.map(p => <option key={p._id} value={p._id}>{p.name} ({p.role})</option>)}
                </select>
             </div>
             <div>
                <label className="custom-label">Risk Profile</label>
                <select className="custom-input" value={form.riskLevel} onChange={e => setForm({...form, riskLevel: e.target.value})}>
                   <option value="low">Low Risk</option>
                   <option value="medium">Medium Risk</option>
                   <option value="high">High Risk</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
             <div>
                <label className="custom-label">Start Timeline</label>
                <input type="date" className="custom-input" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
             </div>
             <div>
                <label className="custom-label">Target Deadline</label>
                <input type="date" className="custom-input" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
             </div>
          </div>
          
          <div>
            <label className="custom-label">Tech Stack</label>
            <input type="text" className="custom-input" placeholder="e.g. React, Node.js, MongoDB (comma separated)" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-6">
             <div>
               <label className="custom-label flex items-center justify-between">Assign Developers 
                  <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{form.developers.length} Selected</span>
               </label>
               <select multiple className="custom-input h-32 custom-scrollbar shadow-inner" value={form.developers} onChange={e => handleMultiselect(e, 'developers')}>
                  {devs.map(d => <option key={d._id} value={d._id} className="p-2 border-b border-slate-100 font-bold">{d.name}</option>)}
               </select>
               <p className="text-[10px] text-slate-400 font-bold -mt-3 mb-4">* Hold CTRL to select multiple</p>
             </div>
             <div>
               <label className="custom-label flex items-center justify-between">Assign QA Testers
                  <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{form.testers.length} Selected</span>
               </label>
               <select multiple className="custom-input h-32 custom-scrollbar shadow-inner" value={form.testers} onChange={e => handleMultiselect(e, 'testers')}>
                  {testers.map(t => <option key={t._id} value={t._id} className="p-2 border-b border-slate-100 font-bold">{t.name}</option>)}
               </select>
               <p className="text-[10px] text-slate-400 font-bold -mt-3 mb-4">* Hold CTRL to select multiple</p>
             </div>
          </div>

          <button type="submit" className="btn-primary mt-8">Initialize Portfolio Project</button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
