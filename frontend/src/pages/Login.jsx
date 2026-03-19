import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import bugMascot from "../assets/vite.svg"; 

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      const response = await API.post("/user/login", { email, password });
      const userData = response.data.data;
      
      // Store user data in local storage
      localStorage.setItem("user", JSON.stringify(userData));
      
      setToastMsg(`Login successful! Welcome back, ${userData.name}.`);
      setShowToast(true);

      // --- ROLE BASED ROUTING LOGIC ---
      setTimeout(() => {
        const role = userData.role; // Assuming backend returns role: 'admin', 'developer', etc.
        
        switch (role) {
          case 'admin':
            navigate("/admin-dashboard");
            break;
          case 'developer':
            navigate("/developer-dashboard");
            break;
          case 'tester':
            navigate("/tester-dashboard");
            break;
          case 'project_manager':
            navigate("/pm-dashboard");
            break;
          default:
            navigate("/"); // Fallback to main dashboard
        }
      }, 1000);

    } catch (error) {
      const errMsg = error.response?.data?.message || "Invalid email or password";
      setToastMsg(errMsg);
      setShowToast(true);
    } finally {
      setLoading(false);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative; overflow: hidden; padding: 20px;
        }

        .floating-bug {
          position: absolute; font-size: 30px; opacity: 0.2;
          animation: floatBug 8s infinite ease-in-out;
          pointer-events: none;
        }

        @keyframes floatBug {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(30px, -50px) rotate(15deg); }
        }

        .login-card {
          position: relative; z-index: 10;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          border-radius: 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 40px 100px rgba(79, 70, 229, 0.1);
          width: 900px; max-width: 100%;
          display: flex; overflow: hidden;
          min-height: 550px;
        }

        .form-section { 
          flex: 1.2; padding: 60px; 
          display: flex; flex-direction: column; justify-content: center;
        }

        .visual-section { 
          flex: 1; 
          background: rgba(79, 70, 229, 0.05);
          display: flex; flex-direction: column; align-items: center; 
          justify-content: center; text-align: center; padding: 40px;
          border-left: 1px solid rgba(79, 70, 229, 0.05);
        }

        .brand-logo {
          width: 50px; height: 50px; background: #000;
          border-radius: 15px; display: flex; align-items: center;
          justify-content: center; margin-bottom: 20px;
        }

        .card-title { font-size: 32px; font-weight: 800; color: #1a1a1a; letter-spacing: -1px; }
        .card-title span { color: #4f46e5; }
        .card-subtitle { font-size: 15px; color: #64748b; margin: 10px 0 30px 0; }

        .input-field {
          width: 100%; padding: 18px 25px;
          background: white; border: 1px solid #e2e8f0; border-radius: 1.2rem;
          font-size: 15px; outline: none; transition: 0.3s;
          margin-bottom: 15px; color: #1a1a1a;
        }

        .input-field:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

        .btn-login {
          width: 100%; background: #000; color: #fff; padding: 18px;
          border: none; border-radius: 1.2rem; font-size: 16px; font-weight: 700;
          cursor: pointer; margin: 10px 0 25px 0; transition: 0.3s;
        }

        .btn-login:hover { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2); }
        .btn-login:disabled { background: #cbd5e1; transform: none; }

        .subtext { font-size: 14px; color: #64748b; text-align: center; }
        .link-text { color: #4f46e5; font-weight: 700; cursor: pointer; text-decoration: none; }

        .toast {
          position: fixed; top: 30px; right: 30px;
          background: white; color: #1a1a1a; padding: 16px 24px;
          border-radius: 1.2rem; border: 1px solid #e2e8f0;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          display: flex; align-items: center; gap: 12px;
          z-index: 1000; transform: translateX(150%);
          transition: 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          font-weight: 600;
        }
        .toast.show { transform: translateX(0); }
        .toast.error { border-left: 5px solid #ef4444; }
        .toast.success { border-left: 5px solid #10b981; }
      `}</style>

      <div className="login-page">
        <div className="floating-bug" style={{ top: '10%', left: '10%' }}>🪳</div>
        <div className="floating-bug" style={{ bottom: '15%', right: '15%', animationDelay: '2s' }}>🕷️</div>
        <div className="floating-bug" style={{ top: '20%', right: '20%', animationDelay: '4s' }}>🐝</div>

        <div className={`toast ${showToast ? 'show' : ''} ${toastMsg.includes('successful') ? 'success' : 'error'}`}>
          {toastMsg.includes('successful') ? '✅' : '❌'} {toastMsg}
        </div>

        <div className="login-card">
          <div className="form-section">
            <div className="brand-logo" onClick={() => navigate("/")} style={{cursor:'pointer'}}>
              <img src={bugMascot} className="w-6 h-6 invert" alt="logo" />
            </div>
            <h1 className="card-title">Welcome back<span>.</span></h1>
            <p className="card-subtitle">Please enter your details to sign in.</p>
            
            <form onSubmit={handleSubmit}>
              <input 
                type="email" className="input-field" placeholder="Email Address" 
                value={email} onChange={e => setEmail(e.target.value)} required 
              />
              <input 
                type="password" className="input-field" placeholder="Password" 
                value={password} onChange={e => setPassword(e.target.value)} required 
              />
              
              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? "Verifying Credentials..." : "Sign in to Dashboard"}
              </button>
            </form>

            <p className="subtext">
              Don't have an account? <span onClick={() => navigate("/register")} className="link-text">Create one for free</span>
            </p>
          </div>

          <div className="visual-section">
            <div className="mb-6 opacity-40">
               <img src={bugMascot} style={{width: '120px'}} alt="logo large" />
            </div>
            <h2 className="text-xl font-bold mb-4 text-slate-800">Secure Access Active</h2>
            <p className="text-sm text-slate-500 leading-relaxed px-6">
              "Quality is not an act, it is a habit."
              <br/><br/>
              Logging in will redirect you to your personalized engineering environment based on your role.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;