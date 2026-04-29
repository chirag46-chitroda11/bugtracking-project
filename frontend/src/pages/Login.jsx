import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import API from "../api/axios";
import bugMascot from "../assets/vite.svg";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", isError: false });

  // Forgot Password States
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const triggerToast = (msg, isError = false) => {
    setToast({ show: true, msg, isError });
    setTimeout(() => setToast({ show: false, msg: "", isError: false }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser(form);

      const user = response.data.data;
      const token = response.data.token;

      // Clear ALL previous user state before storing new user
      localStorage.clear();

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          token: token
        })
      );
      triggerToast(" 🎉 Access Granted!");

      const roleRoutes = {
        admin: "/admin-dashboard",
        developer: "/developer-dashboard",
        tester: "/tester-dashboard",
        project_manager: "/pm-dashboard",
      };

      setTimeout(() => {
        if (user.status === "pending") {
          navigate("/waiting");
        } else {
          navigate(roleRoutes[user.role] || "/dashboard");
        }
      }, 1000);
    } catch (err) {
      triggerToast(err.response?.data?.message || "Login failed!", true);
    } finally { setLoading(false); }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      triggerToast("Please enter your email", true);
      return;
    }
    setForgotLoading(true);
    try {
      const res = await API.post("/user/forgot-password", { email: forgotEmail });
      triggerToast(res.data.message || "Reset link sent!");
      setTimeout(() => setShowForgot(false), 2000);
    } catch (err) {
      triggerToast(err.response?.data?.message || "Something went wrong", true);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        .auth-wrapper { font-family: 'Plus Jakarta Sans'; background: #ccd6ff; min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; padding: 20px; }
        .circle { position: absolute; border: 15px solid rgba(79, 70, 229, 0.08); border-radius: 50%; animation: float 10s infinite; }
        @keyframes float { 50% { transform: translateY(-20px) scale(1.05); } }
        .toast-box { position: fixed; top: 20px; right: 20px; padding: 1rem 2rem; border-radius: 12px; color: #fff; font-weight: 700; z-index: 1000; transform: translateX(150%); transition: 0.4s; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        .toast-box.show { transform: translateX(0); }
        .auth-card { width: 100%; max-width: 450px; background: rgba(255,255,255,0.7); backdrop-filter: blur(25px); border-radius: 40px; border: 1px solid #fff; overflow: hidden; z-index: 10; box-shadow: 0 30px 60px rgba(0,0,0,0.08); }
        .form-side { padding: 3.5rem; display: flex; flex-direction: column; justify-content: center; }
        .field { width: 100%; padding: 0.9rem 1.2rem; border-radius: 15px; border: 1px solid rgba(0,0,0,0.05); background: #fff; margin-bottom: 1.2rem; outline: none; transition: 0.3s; font-family: inherit; font-size: 0.95rem; box-sizing: border-box; }
        .field:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }
        .btn-login { width: 100%; padding: 1rem; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; border-radius: 15px; font-weight: 700; border: none; cursor: pointer; transition: 0.3s; font-size: 0.95rem; box-shadow: 0 6px 20px rgba(79,70,229,0.25); }
        .btn-login:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(79,70,229,0.35); }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 800px) { .auth-card { max-width: 90%; } .form-side { padding: 2.5rem; } }
      `}</style>

      <div className="circle" style={{ width: 350, height: 350, top: -120, left: -120 }} />
      <div className="circle" style={{ width: 250, height: 250, bottom: -80, right: -80, animationDelay: '3s' }} />
      <div className={`toast-box ${toast.show ? 'show' : ''}`} style={{ background: toast.isError ? '#ff4757' : '#2ed573' }}>{toast.msg}</div>

      <div className="auth-card">
        <div className="form-side">
          <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
            <span className="font-extrabold text-lg tracking-tighter uppercase font-sans">FIXIFY<span className="text-indigo-600">.</span></span>
          </div>
          {!showForgot ? (
            <>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Welcome Back.</h1>
              <p className="text-slate-400 text-sm mb-8 font-medium">Enter credentials to access the console.</p>
              <form onSubmit={handleSubmit}>
                <input name="email" type="email" placeholder="Email Address" required className="field" onChange={e => setForm({ ...form, email: e.target.value })} />
                <div className="mb-6">
                  <input name="password" type="password" placeholder="Password" required className="field !mb-2" onChange={e => setForm({ ...form, password: e.target.value })} />
                  <p className="text-right text-xs font-bold">
                    <span onClick={() => setShowForgot(true)} className="text-indigo-600 cursor-pointer hover:underline">Forgot Password?</span>
                  </p>
                </div>
                <button type="submit" className="btn-login" disabled={loading}>{loading ? "Verifying..." : "Login to Console"}</button>
              </form>
              <p className="text-center mt-8 text-sm text-slate-500 font-bold">No account? <span onClick={() => navigate("/register")} className="text-indigo-600 cursor-pointer hover:underline">Register</span></p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Reset Password</h1>
              <p className="text-slate-400 text-sm mb-8 font-medium">Enter your email to receive a reset link.</p>
              <form onSubmit={handleForgotSubmit}>
                <input type="email" placeholder="Email Address" required className="field mb-6" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                <button type="submit" className="btn-login" disabled={forgotLoading}>{forgotLoading ? "Sending..." : "Send Reset Link"}</button>
              </form>
              <p className="text-center mt-8 text-sm text-slate-500 font-bold">Remembered? <span onClick={() => setShowForgot(false)} className="text-indigo-600 cursor-pointer hover:underline">Back to Login</span></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
