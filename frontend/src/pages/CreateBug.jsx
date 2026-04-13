import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBug } from "../services/bugService";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import bugMascot from "../assets/vite.svg";

const CreateBug = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Tester" };
  const role = user?.role;
  const [form, setForm] = useState({ bugTitle: "", description: "", severity: "medium", reportBy: user.name, bugImage: "" });
  const [load, setLoad] = useState({ up: false, sub: false });
  const [prev, setPrev] = useState(null);

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
    } catch { toast.error("Upload Failed"); setPrev(null); }
    finally { setLoad({ ...load, up: false }); }
  };

  const handleSub = async (e) => {
    e.preventDefault();
    if (!form.bugImage) return toast.error("Upload evidence first");
    setLoad({ ...load, sub: true });
    try {
await createBug({ ...form, status: "OPEN", assignedDeveloper: null });
toast.success("Incident Logged!");
setTimeout(() => {
  if (role === "admin") {
    navigate("/admin-dashboard");
  } else if (role === "tester") {
    navigate("/tester-dashboard");
  } else if (role === "developer") {
    navigate("/developer-dashboard");
  } else {
    navigate("/"); // fallback
  }
}, 1500);
    } catch { toast.error("Sync Failed"); }
    finally { setLoad({ ...load, sub: false }); }
  };

  return (
    <div className="bug-pg font-fix">
      <Toaster position="top-right" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        .font-fix, .font-fix input, .font-fix textarea, .font-fix select, .font-fix button { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .bug-pg { background: #ccd6ff; min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; padding: 20px; }
        .ring { position: absolute; border: 15px solid rgba(255,255,255,0.1); border-radius: 50%; z-index: 1; }
        .card { background: rgba(255,255,255,0.7); backdrop-filter: blur(25px); padding: 35px; border-radius: 35px; border: 1px solid #fff; width: 420px; z-index: 10; box-shadow: 0 20px 40px rgba(0,0,0,0.05); text-align: center; }
        .fld { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); margin-bottom: 12px; outline: none; box-sizing: border-box; font-size: 14px; font-weight: 500; }
        .read-only { background: #f1f5f9; color: #64748b; font-weight: 700; cursor: not-allowed; }
        .up-box { border: 2px dashed #4f46e5; padding: 18px; border-radius: 15px; background: rgba(255,255,255,0.4); margin-bottom: 15px; position: relative; }
        .btn { width: 100%; padding: 15px; background: #121212; color: #fff; border-radius: 15px; font-weight: 800; border: none; cursor: pointer; transition: 0.3s; text-transform: uppercase; letter-spacing: 1px; }
        .btn:hover:not(:disabled) { background: #4f46e5; transform: translateY(-2.5px); }
      `}</style>

      <div className="ring" style={{width: 350, height: 350, top: -100, left: -100}}></div>

      <div className="card">
        <div className="flex justify-center mb-6 cursor-pointer" onClick={() => navigate("/tester-dashboard")}>
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center shadow-lg"><img src={bugMascot} className="w-5 h-5 invert" alt="L" /></div>
          <span className="ml-2 text-xl font-black uppercase tracking-tighter italic">Fixify<span className="text-indigo-600">.</span></span>
        </div>

        <div className="mb-8">
          <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full tracking-widest uppercase italic">Active_Session</span>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 mt-2 uppercase">Bug Hunter</h2>
        </div>

        <form onSubmit={handleSub}>
          <input name="reportBy" value={form.reportBy} readOnly className="fld read-only" />
          <input placeholder="Incident Title" required className="fld" onChange={e => setForm({...form, bugTitle: e.target.value})} />
          <textarea placeholder="Reproduction Steps..." required className="fld h-24 resize-none" onChange={e => setForm({...form, description: e.target.value})} />
          
          <select className="fld font-bold text-slate-600" onChange={e => setForm({...form, severity: e.target.value})}>
            <option value="low">Low Priority</option><option value="medium" selected>Medium Priority</option><option value="high">High Priority</option><option value="critical">Critical Impact</option>
          </select>

          <div className="up-box">
            {!prev ? (
              <label className="text-[11px] font-black text-indigo-600 cursor-pointer uppercase tracking-widest">
                📸 Attach Evidence <input type="file" className="hidden" onChange={handleUp} style={{display:'none'}} />
              </label>
            ) : (
              <div className="flex items-center gap-3 text-left">
                <img src={prev} className="w-12 h-12 rounded-lg object-cover border-2 border-white" alt="p" />
                <div className="flex flex-col">
                  <span className={`text-[9px] font-black ${load.up ? 'text-indigo-500 animate-pulse' : 'text-emerald-500'}`}>{load.up ? "UPLOADING..." : "SYNCED ✔️"}</span>
                  {!load.up && <button type="button" onClick={() => {setPrev(null); setForm({...form, bugImage:""})}} className="text-rose-500 text-[9px] font-bold uppercase text-left">Remove</button>}
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn" disabled={load.sub || load.up}>{load.sub ? "INITIALIZING..." : "Create Bug Ticket"}</button>
        </form>
      </div>
    </div>
  );
};

export default CreateBug;