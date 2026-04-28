import React from "react";
import { useNavigate } from "react-router-dom";

const WaitingPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="auth-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        .auth-wrapper { font-family: 'Plus Jakarta Sans'; background: #ccd6ff; min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; padding: 20px; }
        .circle { position: absolute; border: 15px solid rgba(79, 70, 229, 0.08); border-radius: 50%; animation: float 10s infinite; }
        @keyframes float { 50% { transform: translateY(-20px) scale(1.05); } }
        .waiting-card { width: 100%; max-width: 420px; background: rgba(255,255,255,0.7); backdrop-filter: blur(25px); border-radius: 40px; border: 1px solid #fff; overflow: hidden; z-index: 10; box-shadow: 0 30px 60px rgba(0,0,0,0.08); text-align: center; padding: 3.5rem; }
        .btn-logout { width: 100%; padding: 1rem; background: #121212; color: #fff; border-radius: 15px; font-weight: 700; border: none; cursor: pointer; transition: 0.3s; margin-top: 24px; font-size: 0.95rem; }
        .btn-logout:hover { background: #4f46e5; transform: translateY(-2px); }
      `}</style>

      <div className="circle" style={{width: 300, height: 300, top: -100, left: -100}}></div>
      <div className="circle" style={{width: 200, height: 200, bottom: -50, right: -50, animationDelay: '3s'}}></div>

      <div className="waiting-card">
        <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>⏳</div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Request Pending</h1>
        <p className="text-slate-400 text-sm font-medium leading-relaxed">
          Waiting for admin approval. After approval you can access the Tester Dashboard.
        </p>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </div>
  );
};

export default WaitingPage;
