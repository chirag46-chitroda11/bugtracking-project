import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const CreateUser = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "developer", country: "", state: "", city: "", designation: "", profilePicture: "" });

  const userContext = JSON.parse(localStorage.getItem("user")) || {};
  const currentRole = userContext.role || "tester";

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("All info required!");

    try {
      await API.post("/user/register", form);
      if (currentRole === "project_manager") {
         toast.success("User Added! Sent to Admin for approval. ⏳");
      } else {
         toast.success("User Added! Access Granted. 🎉");
      }
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="layout-wrapper relative min-h-screen flex items-center justify-center p-6 text-slate-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        .layout-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; background: #ccd6ff; overflow: hidden; }
        .bg-circle { position: absolute; border: 15px solid rgba(79, 70, 229, 0.05); border-radius: 50%; pointer-events: none; z-index: 0; }
        .c1 { width: 500px; height: 500px; top: -100px; right: -100px; animation: float 15s infinite; }
        .c2 { width: 300px; height: 300px; bottom: 50px; left: -50px; animation: float 10s infinite reverse; }
        @keyframes float { 50% { transform: translateY(-20px) scale(1.05); } }
        
        .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid #fff; box-shadow: 0 10px 40px rgba(0,0,0,0.05); padding: 40px; width: 100%; max-width: 600px; z-index: 10; position: relative; }
        
        .custom-input { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-family: inherit; font-size: 0.95rem; font-weight: 600; color: #334155; margin-bottom: 20px; transition: 0.3s; outline: none; }
        .custom-input:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        .input-label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        
        .btn-primary { width: 100%; background: #121212; color: #fff; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 1rem; border: none; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .btn-primary:hover { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25); }
      `}</style>
      
      <div className="bg-circle c1"></div>
      <div className="bg-circle c2"></div>

      <div className="glass-card">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 transition font-bold text-xl">←</button>
          <div>
            <h2 className="text-2xl font-black text-indigo-950 tracking-tight">Create User</h2>
            <p className="text-slate-500 font-semibold text-sm">Issue credentials for new employees.</p>
          </div>
        </div>

        <form onSubmit={handleCreate}>
          <input type="text" className="custom-input" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="email" className="custom-input" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" className="custom-input" placeholder="Assign Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          
          <div className="grid grid-cols-2 gap-4 mb-5">
             <input type="text" className="custom-input !mb-0" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
             <input type="text" className="custom-input !mb-0" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
             <input type="text" className="custom-input !mb-0" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
             <input type="text" className="custom-input !mb-0" placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </div>
          <input type="text" className="custom-input" placeholder="Profile Picture URL" value={form.profilePicture} onChange={(e) => setForm({ ...form, profilePicture: e.target.value })} />
          
          <div className="text-left">
            <label className="input-label">Authorization Role</label>
            <select className="custom-input cursor-pointer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="developer">Developer</option>
              <option value="tester">Tester</option>
              {currentRole === "admin" && <option value="project_manager">Project Manager</option>}
            </select>
          </div>

          <button type="submit" className="btn-primary">Generate User</button>
        </form>
      </div>
    </div>
  );
};
export default CreateUser;
