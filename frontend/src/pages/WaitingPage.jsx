import React from "react";
import { useNavigate } from "react-router-dom";

const WaitingPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="waiting-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        .waiting-wrapper { 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          background: #ccd6ff; 
          min-height: 100vh; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          position: relative; 
          overflow: hidden; 
          padding: 20px; 
        }
        .circle { 
          position: absolute; 
          border: 15px solid rgba(79, 70, 229, 0.08); 
          border-radius: 50%; 
          animation: float 10s infinite; 
        }
        @keyframes float { 50% { transform: translateY(-20px) scale(1.05); } }
        
        .waiting-card { 
          width: 100%; 
          max-width: 450px; 
          background: rgba(255,255,255,0.7); 
          backdrop-filter: blur(25px); 
          border-radius: 40px; 
          border: 1px solid #fff; 
          overflow: hidden; 
          z-index: 10; 
          box-shadow: 0 30px 60px rgba(0,0,0,0.08); 
          padding: 3.5rem; 
          text-align: center;
        }
        .emoji-timer {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: pulse 2s infinite ease-in-out;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .btn-logout { 
          width: 100%; 
          padding: 1rem; 
          background: #121212; 
          color: #fff; 
          border-radius: 15px; 
          font-weight: 700; 
          border: none; 
          cursor: pointer; 
          transition: 0.3s; 
          margin-top: 2rem;
        }
        .btn-logout:hover { 
          background: #ef4444; 
          transform: translateY(-2px); 
          box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2);
        }
      `}</style>

      <div className="circle" style={{width: 300, height: 300, top: -100, left: -100}}></div>
      <div className="circle" style={{width: 200, height: 200, bottom: -50, right: -50, animationDelay: '2s'}}></div>

      <div className="waiting-card">
        <div className="emoji-timer">⏳</div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-4">Request Pending</h1>
        <p className="text-slate-600 font-medium leading-relaxed">
          Waiting for admin approval. After approval you can access the Tester Dashboard.
        </p>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
};

export default WaitingPage;
