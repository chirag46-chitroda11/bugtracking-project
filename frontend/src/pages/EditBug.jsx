import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { updateBug } from "../services/bugService";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const EditBug = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ 
      bugTitle: "", 
      description: "", 
      severity: "medium", 
      priority: "medium",
      status: "open",
      stepsToReproduce: "", 
      expectedResult: "", 
      actualResult: "", 
      environment: "", 
      moduleId: "",
      taskId: "",
      assignedDeveloper: "",
      bugImage: "" 
  });
  
  const [load, setLoad] = useState({ fetch: true, up: false, sub: false });
  const [prev, setPrev] = useState(null);
  const [devs, setDevs] = useState([]);
  const [modules, setModules] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchDepsAndBug = async () => {
      try {
        const [resDev, resMod, resBug, resTask] = await Promise.all([
          API.get("/user/users"),
          API.get("/module"),
          API.get(`/bug/${id}`),
          API.get("/task")
        ]);
        
        setDevs(resDev.data.data.filter(u => u.role === "developer"));
        setModules(resMod.data.data || resMod.data || []);
        setTasks(resTask.data.data || []);
        
        const b = resBug.data.data;
        if (b) {
            setForm({
               bugTitle: b.bugTitle || "",
               description: b.description || "",
               severity: b.severity || "medium",
               priority: b.priority || "medium",
               status: b.status || "open",
               stepsToReproduce: b.stepsToReproduce || "",
               expectedResult: b.expectedResult || "",
               actualResult: b.actualResult || "",
               environment: b.environment || "",
               moduleId: b.moduleId?._id || b.moduleId || "",
               taskId: b.taskId?._id || b.taskId || "",
               assignedDeveloper: b.assignedDeveloper?._id || b.assignedDeveloper || "",
               bugImage: b.bugImage || ""
            });
            if (b.bugImage) setPrev(b.bugImage);
        }
      } catch (err) { 
        toast.error("Error loading bug data"); 
      } finally {
        setLoad(prev => ({ ...prev, fetch: false }));
      }
    };
    fetchDepsAndBug();
  }, [id]);

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
      setPrev(res.data.secure_url);
      toast.success("Evidence Updated");
    } catch { 
      toast.error("Upload Failed"); 
      setPrev(form.bugImage); 
    } finally { 
      setLoad({ ...load, up: false }); 
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoad({ ...load, sub: true });
    const user = JSON.parse(localStorage.getItem("user")) || { name: "Tester", role: "tester" };
    try {
      await updateBug(id, {
        ...form,
        editorName: user.name,
        editorRole: user.role
      });
      toast.success("Incident Updated ✅");
      // Navigate to detail page so tester sees fresh activity log
      setTimeout(() => navigate(`/bug-detail/${id}`), 1200);
    } catch (err) {
      toast.error("Update failed ❌");
    } finally {
      setLoad({ ...load, sub: false });
    }
  };

  if (load.fetch) return <div className="min-h-screen flex items-center justify-center bg-[#ccd6ff] font-bold text-slate-500">Loading Incident Details...</div>;

  return (
    <div className="layout-wrapper relative min-h-screen flex items-center justify-center py-10 px-4 text-slate-800">
      <Toaster position="top-right"/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        .layout-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; background: #ccd6ff; overflow-x: hidden; }
        .bg-circle { position: absolute; border: 15px solid rgba(79, 70, 229, 0.05); border-radius: 50%; pointer-events: none; z-index: 0; }
        .c1 { width: 600px; height: 600px; top: -100px; right: -200px; animation: float 20s infinite; }
        .c2 { width: 400px; height: 400px; bottom: 0px; left: -100px; animation: float 15s infinite reverse; }
        @keyframes float { 50% { transform: translateY(-20px) scale(1.05); } }
        
        .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid #fff; box-shadow: 0 10px 40px rgba(0,0,0,0.05); padding: 40px; width: 100%; max-width: 600px; z-index: 10; position: relative; }
        
        .custom-input { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-family: inherit; font-size: 0.95rem; font-weight: 600; color: #334155; margin-bottom: 20px; transition: 0.3s; outline: none; }
        .custom-input:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        .input-label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        
        .btn-primary { width: 100%; background: #121212; color: #fff; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 1rem; border: none; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .btn-primary:hover:not(:disabled) { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25); }
        .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
        
        .up-box { border: 2px dashed #6366f1; padding: 18px; border-radius: 12px; background: rgba(255,255,255,0.5); margin-bottom: 20px; text-align: center; }
      `}</style>
      
      <div className="bg-circle c1"></div>
      <div className="bg-circle c2"></div>

      <div className="glass-card">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 transition font-bold text-xl flex-shrink-0">←</button>
          <div>
            <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-0.5 rounded uppercase tracking-wider">ID: {id.slice(-6)}</span>
            <h2 className="text-2xl font-black text-indigo-950 tracking-tight mt-1">Modify Incident Data</h2>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          <input className="custom-input" placeholder="Incident Title" required value={form.bugTitle} onChange={e => setForm({...form, bugTitle: e.target.value})} />
          
          <textarea className="custom-input h-20 resize-none" placeholder="General Description..." required value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          
          <textarea className="custom-input h-20 resize-none" placeholder="Steps to Reproduce..." required value={form.stepsToReproduce} onChange={e => setForm({...form, stepsToReproduce: e.target.value})} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="input-label">Expected Result</label>
                <textarea className="custom-input h-20 resize-none !mb-0" placeholder="Expected Result..." required value={form.expectedResult} onChange={e => setForm({...form, expectedResult: e.target.value})} />
             </div>
             <div>
                <label className="input-label">Actual Result</label>
                <textarea className="custom-input h-20 resize-none !mb-0" placeholder="Actual Result..." required value={form.actualResult} onChange={e => setForm({...form, actualResult: e.target.value})} />
             </div>
          </div>
          <br/>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-left">
              <label className="input-label">Module</label>
              <select className="custom-input cursor-pointer" required value={form.moduleId} onChange={e => setForm({...form, moduleId: e.target.value})}>
                <option value="">Select Module..</option>
                {modules.map(m => <option key={m._id} value={m._id}>{m.moduleName}</option>)}
              </select>
            </div>
            <div className="text-left">
              <label className="input-label">Environment</label>
              <input className="custom-input" placeholder="e.g. Chrome 120" required value={form.environment} onChange={e => setForm({...form, environment: e.target.value})} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="text-left">
                <label className="input-label">Current Status</label>
                <select className="custom-input cursor-pointer !mb-0" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                   <option value="open">Open</option>
                   <option value="in_progress">In Progress</option>
                   <option value="retest">Retest</option>
                   <option value="resolved">Resolved</option>
                   <option value="closed">Closed</option>
                   <option value="reopened">Reopened</option>
                </select>
             </div>
             
             <div className="text-left">
                <label className="input-label">Assign To</label>
                <select className="custom-input cursor-pointer !mb-0" value={form.assignedDeveloper} onChange={e => setForm({...form, assignedDeveloper: e.target.value})}>
                   <option value="">Leave Unassigned</option>
                   {devs.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
             </div>
          </div>
          
          <div className="text-left mb-6">
             <label className="input-label">Linked Task (Optional)</label>
             <select className="custom-input cursor-pointer !mb-0" value={form.taskId} onChange={e => setForm({...form, taskId: e.target.value})}>
                <option value="">No Direct Task Linked</option>
                {tasks.map(t => <option key={t._id} value={t._id}>{t.taskTitle}</option>)}
             </select>
          </div>

          <div className="up-box">
             <div className="flex items-center gap-4 justify-center">
                {prev && <img src={prev} className="w-14 h-14 rounded-lg object-cover border-2 border-white shadow-sm" alt="preview" />}
                <label className="text-xs font-black text-indigo-600 cursor-pointer uppercase tracking-widest flex items-center justify-center gap-2">
                   {prev ? "📸 UPDATE EVIDENCE" : "📸 ATTACH EVIDENCE"}
                   <input type="file" className="hidden" onChange={handleUp} disabled={load.up}/>
                </label>
                {load.up && <span className="text-xs font-black text-indigo-500 animate-pulse">UPLOADING...</span>}
             </div>
          </div>

          <button type="submit" className="btn-primary" disabled={load.sub || load.up}>
            {load.sub ? "UPDATING INCIDENT..." : "SAVE CHANGES"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBug;
