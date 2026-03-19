import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import bugMascot from "../assets/vite.svg"; 

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("developer");
  const [loading, setLoading] = useState(false);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setToastMsg("Passwords do not match!");
      setIsError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setLoading(true);
    try {
      await API.post("/user/register", { name, email, password, role });
      setToastMsg("Welcome to the team! Redirecting...");
      setIsError(false);
      setShowToast(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setToastMsg(error.response?.data?.message || "Registration failed!");
      setIsError(true);
      setShowToast(true);
    } finally {
      setLoading(false);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
        
        :root {
          --primary: #4f46e5;
          --bg-light: #f4f7ff;
          --bg-dark: #e0e7ff;
        }

        .auth-container {
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-dark) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        /* --- DASHBOARD STYLE BUG ANIMATIONS --- */
        .bug-visual-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .bug-orb {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(79,70,229,0.12) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          animation: orbPulse 8s infinite ease-in-out;
        }

        .mini-bug {
          position: absolute;
          font-size: 32px;
          filter: grayscale(0.4);
          opacity: 0.4;
          animation: moveBug 8s infinite linear;
        }

        @keyframes moveBug {
          0% { transform: translate(0,0) rotate(0deg); opacity: 0; }
          20% { opacity: 0.4; }
          50% { transform: translate(150px, -80px) rotate(90deg); }
          80% { opacity: 0.4; }
          100% { transform: translate(-60px, 150px) rotate(180deg); opacity: 0; }
        }

        @keyframes orbPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        }

        /* --- SIGNUP CARD --- */
        .signup-card {
          width: 100%;
          max-width: 900px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(25px);
          border-radius: 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 25px 50px -12px rgba(79, 70, 229, 0.12);
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          overflow: hidden;
          z-index: 10;
          animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .form-content { padding: 3.5rem; }
        .info-content { 
          background: rgba(79, 70, 229, 0.04); 
          padding: 3.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-left: 1px solid rgba(79, 70, 229, 0.08);
        }

        .logo-box {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 2rem;
          cursor: pointer;
        }

        .input-field {
          width: 100%;
          padding: 1rem 1.2rem;
          border-radius: 1.1rem;
          border: 1px solid rgba(0,0,0,0.06);
          background: white;
          font-family: inherit;
          font-size: 0.95rem;
          transition: all 0.3s;
          margin-bottom: 1.2rem;
        }

        .input-field:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08);
        }

        .role-label {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--primary);
          margin: 0 0 0.5rem 0.5rem;
          display: block;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-register {
          width: 100%;
          padding: 1.1rem;
          background: #000;
          color: white;
          border-radius: 1.1rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 1rem;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .btn-register:hover {
          background: var(--primary);
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(79, 70, 229, 0.25);
        }

        .security-badge {
          background: white;
          padding: 1.5rem;
          border-radius: 1.5rem;
          border: 1px solid rgba(79, 70, 229, 0.1);
          margin-top: 2.5rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }

        /* --- TOAST --- */
        .toast {
          position: fixed;
          top: 30px;
          right: 30px;
          padding: 1.2rem 2rem;
          border-radius: 1.2rem;
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1000;
          transform: translateX(200%);
          transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .toast.show { transform: translateX(0); }

        @media (max-width: 850px) {
          .signup-card { grid-template-columns: 1fr; }
          .info-content { display: none; }
        }
      `}</style>

      <div className="auth-container">
        {/* --- BACKGROUND BUG ANIMATION LAYER --- */}
        <div className="bug-visual-layer">
          <div className="bug-orb"></div>
          <div className="mini-bug" style={{top: '10%', left: '10%', animationDelay: '0s'}}>🪳</div>
          <div className="mini-bug" style={{top: '70%', left: '80%', animationDelay: '2s'}}>🕷️</div>
          <div className="mini-bug" style={{top: '40%', left: '20%', animationDelay: '4s'}}>🐝</div>
          <div className="mini-bug" style={{top: '80%', left: '15%', animationDelay: '1s'}}>🐞</div>
        </div>
        
        <div className={`toast ${showToast ? 'show' : ''}`} 
             style={{ background: isError ? '#ef4444' : '#10b981' }}>
          {isError ? '⚠️' : '🚀'} {toastMsg}
        </div>

        <div className="signup-card">
          <div className="form-content">
            <div className="logo-box" onClick={() => navigate("/")}>
              <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <img src={bugMascot} className="w-6 h-6 invert" alt="logo" />
              </div>
              <span className="font-extrabold tracking-tighter uppercase text-xl">Fixify<span className="text-indigo-600">.</span></span>
            </div>

            <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-slate-900">Join the Elite.</h1>
            <p className="text-slate-500 mb-8 text-sm font-medium">Ready to squash some bugs today?</p>

            <form onSubmit={handleSubmit}>
              <input type="text" className="input-field" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
              <input type="email" className="input-field" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
              
              <div className="grid grid-cols-2 gap-4">
                <input type="password" className="input-field" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <input type="password" className="input-field" placeholder="Confirm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              
              <label className="role-label">System Access Level</label>
              <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
                <option value="developer">Developer (Code Access)</option>
                <option value="tester">QA Engineer (Bug Hunter)</option>
                <option value="project_manager">Manager (Ops Control)</option>
                <option value="admin">Admin (System Root)</option>
              </select>

              <button type="submit" className="btn-register" disabled={loading}>
                {loading ? "Establishing Connection..." : "Initialize Account"}
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-slate-500 font-medium">
              Already have an account? <span onClick={() => navigate("/login")} className="text-indigo-600 font-bold cursor-pointer hover:underline underline-offset-4 transition-all">Sign In</span>
            </p>
          </div>

          <div className="info-content">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-extrabold text-indigo-950 mb-4">Command Center</h3>
                <p className="text-indigo-800/60 text-sm leading-relaxed">
                  Registering gives you instant access to our automated bug tracking engine and real-time collaboration tools.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white/50 p-3 rounded-xl border border-indigo-100/50">
                  <span className="text-xl">🛠️</span>
                  <span className="text-xs font-bold text-indigo-900">Custom Dev Workflow</span>
                </div>
                <div className="flex items-center gap-4 bg-white/50 p-3 rounded-xl border border-indigo-100/50">
                  <span className="text-xl">📈</span>
                  <span className="text-xs font-bold text-indigo-900">Advanced Analytics</span>
                </div>
              </div>

              <div className="security-badge">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Protocol: Secure</p>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Registration uses **End-to-End Encryption**. Your credentials are never stored in plain text.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;