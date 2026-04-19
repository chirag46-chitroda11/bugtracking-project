import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBug } from "../services/bugService";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import API from "../api/axios";
import { useEffect } from "react";
const CreateBug = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Tester" };
  const role = user?.role;
  
  const queryParams = new URLSearchParams(window.location.search);
  const initialTask = queryParams.get("task") || "";

  const [form, setForm] = useState({ bugTitle: "", description: "", severity: "medium", priority: "medium", reportBy: user.name, bugImage: "", assignedDeveloper: "", stepsToReproduce: "", expectedResult: "", actualResult: "", environment: "", moduleId: "", taskId: initialTask });
  const [load, setLoad] = useState({ up: false, sub: false });
  const [prev, setPrev] = useState(null);
  const [devs, setDevs] = useState([]);
  const [modules, setModules] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchDeps = async () => {
      try {
        const [resDev, resMod, resTask] = await Promise.all([
          API.get("/user/users"),
          API.get("/module"),
          API.get("/task")
        ]);
        setDevs(resDev.data.data.filter(u => u.role === "developer"));
        setModules(resMod.data.data || resMod.data || []);
        setTasks(resTask.data.data || []);
      } catch (error) { toast.error("Failed to fetch dependencies"); }
    };
    fetchDeps();
  }, []);

  const handleUp = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPrev(URL.createObjectURL(file));
    setLoad({ ...load, up: true });
    
    const d = new FormData();
    d.append("file", file);
    d.append("upload_preset", "my_preset_123");

    try {
      const res = await axios.post(`https://api.cloudinary.com/v1_1/deez3ri1o/image/upload`, d);
      setForm({ ...form, bugImage: res.data.secure_url });
      toast.success("Evidence Secured");
    } catch { 
      toast.error("Upload Failed"); 
      setPrev(null); 
    } finally { 
      setLoad({ ...load, up: false }); 
    }
  };

  const handleSub = async (e) => {
    e.preventDefault();
    if (!form.bugImage) return toast.error("Upload evidence first");
    if (!form.assignedDeveloper) return toast.error("Assign to a developer first");
    
    setLoad({ ...load, sub: true });
    try {
      await createBug({ ...form, status: "OPEN", reportById: user._id || user.id });
      toast.success("Incident Logged!");
      setTimeout(() => {
        if (role === "admin") navigate("/admin-dashboard");
        else if (role === "tester") navigate("/tester-dashboard");
        else if (role === "developer") navigate("/developer-dashboard");
        else navigate("/");
      }, 1500);
    } catch { 
      toast.error("Sync Failed"); 
    } finally { 
      setLoad({ ...load, sub: false }); 
    }
  };

  return (
    <div className="layout-wrapper relative min-h-screen flex items-center justify-center p-6 text-slate-800">
      <Toaster position="top-right"/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        .layout-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; background: #ccd6ff; overflow: hidden; }
        .bg-circle { position: absolute; border: 15px solid rgba(79, 70, 229, 0.05); border-radius: 50%; pointer-events: none; z-index: 0; }
        .c1 { width: 500px; height: 500px; top: -100px; right: -100px; animation: float 15s infinite; }
        .c2 { width: 300px; height: 300px; bottom: 50px; left: -50px; animation: float 10s infinite reverse; }
        @keyframes float { 50% { transform: translateY(-20px) scale(1.05); } }
        
        .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid #fff; box-shadow: 0 10px 40px rgba(0,0,0,0.05); padding: 40px; width: 100%; max-width: 500px; z-index: 10; position: relative; }
        
        .custom-input { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-family: inherit; font-size: 0.95rem; font-weight: 600; color: #334155; margin-bottom: 20px; transition: 0.3s; outline: none; }
        .custom-input:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        .input-label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .read-only { background: #f1f5f9; color: #64748b; cursor: not-allowed; }
        
        .btn-primary { width: 100%; background: #121212; color: #fff; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 1rem; border: none; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .btn-primary:hover:not(:disabled) { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25); }
        .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
        
        .up-box { border: 2px dashed #6366f1; padding: 18px; border-radius: 12px; background: rgba(255,255,255,0.5); margin-bottom: 20px; text-align: center; }
      `}</style>
      
      <div className="bg-circle c1"></div>
      <div className="bg-circle c2"></div>

      <div className="glass-card">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 transition font-bold text-xl">←</button>
          <div>
            <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded uppercase tracking-wider">Bug Hunter</span>
            <h2 className="text-2xl font-black text-indigo-950 tracking-tight mt-1">Report Incident</h2>
          </div>
        </div>

        <form onSubmit={handleSub}>
          <div className="text-left">
            <label className="input-label">Reporter Name</label>
            <input className="custom-input read-only" value={form.reportBy} readOnly />
          </div>

          <input className="custom-input" placeholder="Incident Title" required value={form.bugTitle} onChange={e => setForm({...form, bugTitle: e.target.value})} />
          
          <textarea className="custom-input h-20 resize-none" placeholder="General Description..." required value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          
          <textarea className="custom-input h-20 resize-none" placeholder="Steps to Reproduce..." required value={form.stepsToReproduce} onChange={e => setForm({...form, stepsToReproduce: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
             <textarea className="custom-input h-20 resize-none" placeholder="Expected Result..." required value={form.expectedResult} onChange={e => setForm({...form, expectedResult: e.target.value})} />
             <textarea className="custom-input h-20 resize-none" placeholder="Actual Result..." required value={form.actualResult} onChange={e => setForm({...form, actualResult: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-left">
              <label className="input-label">Select Module</label>
              <select className="custom-input cursor-pointer" required value={form.moduleId} onChange={e => setForm({...form, moduleId: e.target.value})}>
                <option value="">Select Module..</option>
                {modules.map(m => <option key={m._id} value={m._id}>{m.moduleName}</option>)}
              </select>
            </div>
            <div className="text-left">
              <label className="input-label">Environment</label>
              <input className="custom-input" placeholder="e.g. Chrome 120, Windows 11" required value={form.environment} onChange={e => setForm({...form, environment: e.target.value})} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-left">
              <label className="input-label">Severity Level</label>
              <select className="custom-input cursor-pointer !mb-0" value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
                <option value="low">Low Impact</option>
                <option value="medium">Medium Impact</option>
                <option value="high">High Impact</option>
                <option value="critical">Critical Impact</option>
              </select>
            </div>
            
            <div className="text-left">
              <label className="input-label">Priority Level</label>
              <select className="custom-input cursor-pointer !mb-0" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            
            <div className="text-left mt-2 col-span-2 md:col-span-1">
              <label className="input-label">Linked Task (Optional)</label>
              <select className="custom-input cursor-pointer !mb-0" value={form.taskId} onChange={e => setForm({...form, taskId: e.target.value})}>
                <option value="">No Direct Task Linked</option>
                {tasks.map(t => <option key={t._id} value={t._id}>{t.taskTitle}</option>)}
              </select>
            </div>
            
            <div className="col-span-2 md:col-span-1 text-left mt-2">
              <label className="input-label">Assign To Developer (Optional)</label>
              <select className="custom-input cursor-pointer !mb-0" value={form.assignedDeveloper} onChange={e => setForm({...form, assignedDeveloper: e.target.value})}>
                <option value="">Leave Unassigned / PM Will Assign</option>
                {devs.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <br/>

          <div className="up-box">
            {!prev ? (
              <label className="text-xs font-black text-indigo-600 cursor-pointer uppercase tracking-widest flex items-center justify-center gap-2">
                📸 Attach Evidence 
                <input type="file" className="hidden" onChange={handleUp} />
              </label>
            ) : (
              <div className="flex items-center gap-4">
                <img src={prev} className="w-14 h-14 rounded-lg object-cover border-2 border-white shadow-sm" alt="preview" />
                <div className="flex flex-col text-left">
                  <span className={`text-xs font-black ${load.up ? 'text-indigo-500 animate-pulse' : 'text-emerald-500'}`}>{load.up ? "UPLOADING..." : "SYNCED ✔️"}</span>
                  {!load.up && <button type="button" onClick={() => {setPrev(null); setForm({...form, bugImage:""})}} className="text-rose-500 text-[10px] font-bold uppercase mt-1">Remove</button>}
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={load.sub || load.up}>
            {load.sub ? "INITIALIZING TICKET..." : "CREATE BUG TICKET"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBug;
