import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const ROLE_LEVELS = { admin: 4, project_manager: 3, developer: 2, tester: 1 };

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [blocked, setBlocked] = useState(false);

  const loggedInUser = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get(`/user/users`);
        const user = res.data.data.find(u => u._id === id);
        if (user) {
          // Role hierarchy check — block if target has equal or higher role (and not self)
          const myLevel = ROLE_LEVELS[loggedInUser?.role] || 0;
          const targetLevel = ROLE_LEVELS[user.role] || 0;
          if (loggedInUser?._id !== id && targetLevel >= myLevel) {
            setBlocked(true);
            toast.error("You cannot edit a user with equal or higher role");
            return;
          }
          setForm(user);
        }
      } catch (err) { toast.error("Error loading user"); }
    };
    fetchUser();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (blocked) { toast.error("Permission denied"); return; }
    try {
      await API.put(`/user/users/profile/${id}`, form);
      toast.success("User updated ✅");
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Update failed";
      toast.error(msg);
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
        
        .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid #fff; box-shadow: 0 10px 40px rgba(0,0,0,0.05); padding: 40px; width: 100%; max-width: 500px; z-index: 10; position: relative; }
        
        .custom-input { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-family: inherit; font-size: 0.95rem; font-weight: 600; color: #334155; margin-bottom: 20px; transition: 0.3s; outline: none; box-sizing: border-box; }
        .custom-input:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        .input-label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        
        .btn-primary { width: 100%; background: #121212; color: #fff; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 1rem; border: none; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .btn-primary:hover { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25); }
        .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }
      `}</style>
      
      <div className="bg-circle c1"></div>
      <div className="bg-circle c2"></div>

      <div className="glass-card">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 transition font-bold text-xl">←</button>
          <div>
            <h2 className="text-2xl font-black text-indigo-950 tracking-tight">Edit User</h2>
            <p className="text-slate-500 font-semibold text-sm">Update profile & roles.</p>
          </div>
        </div>

        {blocked ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Access Denied</h3>
            <p className="text-slate-500 font-semibold text-sm mb-6">You cannot edit a user with equal or higher role than yours.</p>
            <button onClick={() => navigate(-1)} className="btn-primary" style={{ maxWidth: 200, margin: "0 auto", display: "block" }}>Go Back</button>
          </div>
        ) : (
          <form onSubmit={handleUpdate}>
            <input type="text" className="custom-input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input type="email" className="custom-input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            
            <div className="text-left">
              <label className="input-label">Role</label>
              <select className="custom-input cursor-pointer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="developer">Developer</option>
                <option value="tester">Tester</option>
                <option value="project_manager">Project Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" className="btn-primary">Save Changes</button>
          </form>
        )}
      </div>
    </div>
  );
};
export default EditUser;
