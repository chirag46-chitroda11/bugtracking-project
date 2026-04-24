import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import bugMascot from "../assets/vite.svg";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", isError: false });

  const triggerToast = (msg, isError = false) => {
    setToast({ show: true, msg, isError });
    setTimeout(() => setToast({ show: false, msg: "", isError: false }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      triggerToast("Passwords do not match", true);
      return;
    }
    if (password.length < 6) {
      triggerToast("Password must be at least 6 characters", true);
      return;
    }

    setLoading(true);
    try {
      const res = await API.put(`/user/reset-password/${token}`, { password });
      triggerToast(res.data.message || "Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      triggerToast(err.response?.data?.message || "Invalid or expired token", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        .auth-wrapper { font-family: 'Plus Jakarta Sans'; background: #ccd6ff; min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; padding: 20px; }
        .circle { position: absolute; border: 15px solid rgba(79, 70, 229, 0.08); border-radius: 50%; animation: float 10s infinite; }
        @keyframes float { 50% { transform: translateY(-20px) scale(1.05); } }
        .toast-box { position: fixed; top: 20px; right: 20px; padding: 1rem 2rem; border-radius: 12px; color: #fff; font-weight: 700; z-index: 1000; transform: translateX(150%); transition: 0.4s; }
        .toast-box.show { transform: translateX(0); }
        .auth-card { width: 100%; max-width: 450px; background: rgba(255,255,255,0.7); backdrop-filter: blur(25px); border-radius: 40px; border: 1px solid #fff; overflow: hidden; z-index: 10; box-shadow: 0 30px 60px rgba(0,0,0,0.08); }
        .form-side { padding: 3.5rem; display: flex; flex-direction: column; justify-content: center; }
        .field { width: 100%; padding: 0.9rem 1.2rem; border-radius: 15px; border: 1px solid rgba(0,0,0,0.05); background: #fff; margin-bottom: 1.2rem; outline: none; transition: 0.3s; }
        .btn-reg { width: 100%; padding: 1rem; background: #121212; color: #fff; border-radius: 15px; font-weight: 700; border: none; cursor: pointer; transition: 0.3s; }
        .btn-reg:hover:not(:disabled) { background: #4f46e5; transform: translateY(-2px); }
        @media (max-width: 800px) { .auth-card { max-width: 90%; } }
      `}</style>

      <div className="circle" style={{width: 300, height: 300, top: -100, left: -100}}></div>
      <div className={`toast-box ${toast.show ? 'show' : ''}`} style={{ background: toast.isError ? '#ff4757' : '#2ed573' }}>{toast.msg}</div>

      <div className="auth-card">
        <div className="form-side">
          <div className="flex items-center gap-2 mb-8">
            <img src={bugMascot} className="w-8 h-8 bg-black p-1.5 rounded-lg invert" alt="L" />
            <span className="font-extrabold text-xl tracking-tighter uppercase font-sans">Fixify<span className="text-indigo-600">.</span></span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">New Password</h1>
          <p className="text-slate-400 text-sm mb-8 font-medium">Create a strong new password for your account.</p>
          <form onSubmit={handleSubmit}>
            <input type="password" placeholder="New Password" required className="field mb-4" value={password} onChange={e => setPassword(e.target.value)} minLength={6} />
            <input type="password" placeholder="Confirm Password" required className="field mb-6" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={6} />
            <button type="submit" className="btn-reg" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</button>
          </form>
          <p className="text-center mt-8 text-sm text-slate-500 font-bold">Nevermind? <span onClick={() => navigate("/login")} className="text-indigo-600 cursor-pointer hover:underline">Back to Login</span></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
