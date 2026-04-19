import { useState, useEffect } from "react";
import { createModule } from "../services/moduleService";
import { getProjects } from "../services/projectService";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const CreateModule = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ moduleName: "", description: "", projectId: "" });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        setProjects(res.data || []);
      } catch (error) { toast.error("Failed to fetch projects"); }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.moduleName || !form.projectId || !form.description) {
      return toast.error("All fields are required!");
    }

    try {
      await createModule(form);
      toast.success("Module Created Successfully! 🚀");
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      toast.error("Module creation failed ❌");
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
        
        .btn-primary { width: 100%; background: #121212; color: #fff; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 1rem; border: none; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .btn-primary:hover { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25); }
      `}</style>
      
      <div className="bg-circle c1"></div>
      <div className="bg-circle c2"></div>

      <div className="glass-card">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 transition font-bold text-xl">←</button>
          <div>
            <h2 className="text-2xl font-black text-indigo-950 tracking-tight">Create Module</h2>
            <p className="text-slate-500 font-semibold text-sm">Assign a new module to a project.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="text" className="custom-input" placeholder="Module Name" value={form.moduleName} onChange={(e) => setForm({ ...form, moduleName: e.target.value })} />
          
          <select className="custom-input cursor-pointer" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
            <option value="">-- Select Linked Project --</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
          </select>

          <textarea className="custom-input h-28 resize-none" placeholder="Module functionality overview..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <button type="submit" className="btn-primary">Initialize Module</button>
        </form>
      </div>
    </div>
  );
};
export default CreateModule;
