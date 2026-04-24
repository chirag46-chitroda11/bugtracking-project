import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import bugMascot from "../assets/vite.svg";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", isError: false });

  const triggerToast = (msg, isError = false) => {
    setToast({ show: true, msg, isError });
    setTimeout(() => setToast({ show: false, msg: "", isError: false }), 3000);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return triggerToast("Passwords do not match!", true);
    }
    setLoading(true);
    try {
      await API.post("/user/register", formData);
      triggerToast("Welcome! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      triggerToast(err.response?.data?.message || "Registration failed!", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        .auth-wrapper { font-family: 'Plus Jakarta Sans'; background: #ccd6ff; min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; padding: 20px; }
        .circle { position: absolute; border: 15px solid rgba(79, 70, 229, 0.08); border-radius: 50%; animation: float 10s infinite ease-in-out; }
        .c1 { width: 300px; height: 300px; top: -100px; left: -100px; }
        .c2 { width: 150px; height: 150px; bottom: -50px; right: -50px; animation-delay: 3s; }
        .c3 { width: 220px; height: 220px; bottom: 100px; left: 100px; animation-delay: 6s; }
        @keyframes float { 50% { transform: translateY(-20px) scale(1.05); } }
        .toast-box { position: fixed; top: 20px; right: 20px; padding: 1rem 2rem; border-radius: 12px; color: #fff; font-weight: 700; z-index: 1000; transform: translateX(150%); transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .toast-box.show { transform: translateX(0); }
        .signup-card { width: 100%; max-width: 500px; background: rgba(255,255,255,0.7); backdrop-filter: blur(25px); border-radius: 40px; border: 1px solid #fff; overflow: hidden; z-index: 10; box-shadow: 0 30px 60px rgba(0,0,0,0.08); }
        .form-side { padding: 3.5rem; display: flex; flex-direction: column; justify-content: center; }
        .field { width: 100%; padding: 0.9rem 1.2rem; border-radius: 15px; border: 1px solid rgba(0,0,0,0.05); background: #fff; margin-bottom: 1rem; outline: none; transition: 0.3s; box-sizing: border-box; }
        .field:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }
        .btn-reg { width: 100%; padding: 1rem; background: #121212; color: #fff; border-radius: 15px; font-weight: 700; border: none; cursor: pointer; transition: 0.3s; }
        .btn-reg:hover:not(:disabled) { background: #4f46e5; transform: translateY(-2px); }
        @media (max-width: 800px) { .signup-card { max-width: 90%; } }
      `}</style>

      <div className="circle c1"></div><div className="circle c2"></div><div className="circle c3"></div>

      <div className={`toast-box ${toast.show ? 'show' : ''}`} style={{ background: toast.isError ? '#ff4757' : '#2ed573' }}>
        {toast.isError ? '❌ ' : '✅ '} {toast.msg}
      </div>

      <div className="signup-card">
        <div className="form-side">
          <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate("/")}>
            <img src={bugMascot} className="w-8 h-8 bg-black p-1.5 rounded-lg invert" alt="logo" />
            <span className="font-extrabold text-xl tracking-tighter uppercase">Fixify<span className="text-indigo-600">.</span></span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Join the elite.</h1>
          <p className="text-slate-400 text-sm mb-8 font-medium">Create your credentials to start debugging.</p>
          
          <form onSubmit={handleSubmit}>
            <input name="name" type="text" placeholder="Full Name" required className="field" onChange={handleChange} />
            <input name="email" type="email" placeholder="Email Address" required className="field" onChange={handleChange} />
            
            <div className="grid grid-cols-2 gap-3">
              <input name="password" type="password" placeholder="Password" required className="field" onChange={handleChange} />
              <input name="confirmPassword" type="password" placeholder="Confirm" required className="field" onChange={handleChange} />
            </div>

            {/* Role is automatically set to Tester on backend for public registration */}

            <button type="submit" className="btn-reg" disabled={loading}>
              {loading ? "Initializing..." : "Initialize Account"}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-slate-500 font-bold">
            Already a member? <span onClick={() => navigate("/login")} className="text-indigo-600 cursor-pointer hover:underline">Sign In</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;