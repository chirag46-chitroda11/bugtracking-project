import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bugMascot from "../assets/vite.svg"; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
        
        :root {
          --primary: #4f46e5;
          --bg-light: #f4f7ff;
          --bg-dark: #e0e7ff;
        }

        .main-container {
          margin: 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-dark) 100%);
          color: #1a1a1a;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        /* --- NAVIGATION --- */
        .nav-fixed {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 100;
          padding: ${scrolled ? '0.8rem 6%' : '1.5rem 8%'};
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: ${scrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent'};
          backdrop-filter: ${scrolled ? 'blur(20px)' : 'none'};
          border-bottom: ${scrolled ? '1px solid rgba(79, 70, 229, 0.1)' : 'none'};
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-sizing: border-box;
        }

        /* --- HERO & PICKUP LINE --- */
        .hero-layout {
          flex: 1;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          align-items: center;
          padding: 0 10%;
          padding-top: 100px;
          z-index: 10;
        }

        .headline {
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 800;
          line-height: 0.95;
          letter-spacing: -0.04em;
          margin-bottom: 2rem;
        }

        .accent-text {
          color: var(--primary);
          display: inline-block;
        }

        .pickup-box {
          background: white;
          padding: 0.8rem 1.2rem;
          border-radius: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(79, 70, 229, 0.08);
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 1);
        }

        /* --- BUG ANIMATIONS --- */
        .bug-container {
          position: relative;
          height: 450px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .bug-orb {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(79,70,229,0.15) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          position: relative;
          animation: pulse 4s infinite ease-in-out;
        }

        .mini-bug {
          position: absolute;
          font-size: 28px;
          filter: grayscale(0.5);
          opacity: 0.5;
          animation: moveBug 7s infinite linear;
        }

        @keyframes moveBug {
          0% { transform: translate(0,0) rotate(0deg); opacity: 0; }
          20% { opacity: 0.5; }
          50% { transform: translate(120px, -60px) rotate(90deg); }
          80% { opacity: 0.5; }
          100% { transform: translate(-40px, 120px) rotate(180deg); opacity: 0; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .btn-main {
          padding: 1.1rem 2.5rem;
          border-radius: 1.2rem;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
        }

        .btn-filled {
          background: #000;
          color: white;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }

        .btn-filled:hover {
          background: var(--primary);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(79, 70, 229, 0.3);
        }

        .btn-login-hero {
          background: white;
          color: #1a1a1a;
          margin-left: 15px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .btn-login-hero:hover {
          background: #f8fafc;
          border-color: var(--primary);
          color: var(--primary);
          transform: translateY(-2px);
        }

        .how-it-works-link {
          margin-top: 20px;
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: 0.3s;
          text-decoration: none;
          display: inline-block;
        }

        .how-it-works-link:hover {
          color: var(--primary);
          letter-spacing: 2.5px;
        }

        .particle {
          position: absolute;
          background: var(--primary);
          border-radius: 50%;
          opacity: 0.05;
          pointer-events: none;
        }
      `}</style>

      <div className="main-container">
        {/* --- NAVIGATION --- */}
        <nav className="nav-fixed">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <img src={bugMascot} className="w-6 h-6 invert" alt="logo" />
            </div>
            <span className="text-xl font-extrabold tracking-tighter uppercase">Fixify<span className="text-indigo-600">.</span></span>
          </div>

          <button 
            onClick={() => navigate("/register")} 
            className="bg-black text-white text-sm font-bold px-7 py-3 rounded-xl hover:bg-indigo-600 transition-all shadow-sm active:scale-95"
          >
            Sign up
          </button>
        </nav>

        {/* --- HERO SECTION --- */}
        <main className="hero-layout">
          <div className="relative">
            <div className="pickup-box">
              <span className="text-lg">⚡</span>
              <p className="text-sm font-bold text-slate-600">
                Optimized for React & Next.js teams.
              </p>
            </div>

            <h1 className="headline">
              Stop chasing <br/> 
              <span className="accent-text italic">shadows.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-lg mb-10 leading-relaxed">
              The issue tracker that actually helps you code. Automate bug reports, 
              assign tasks instantly, and keep your production clean.
              <br/>
              <strong>Fast. Fluid. Fearless.</strong>
            </p>

            <div className="flex items-center">
              <button onClick={() => navigate("/register")} className="btn-main btn-filled">
                Get Started
              </button>
              <button onClick={() => navigate("/login")} className="btn-main btn-login-hero">
                Log in
              </button>
            </div>
          </div>

          {/* --- VISUAL SECTION --- */}
          <div className="bug-container">
            <div className="bug-orb"></div>
            
            <div className="mini-bug" style={{top: '15%', left: '25%', animationDelay: '0s'}}>🪳</div>
            <div className="mini-bug" style={{top: '55%', right: '15%', animationDelay: '2s'}}>🕷️</div>
            <div className="mini-bug" style={{bottom: '15%', left: '35%', animationDelay: '4s'}}>🐝</div>
            
            <div className="absolute w-72 h-72 border border-indigo-500/10 rounded-full animate-[ping_3s_linear_infinite]"></div>
            
            <div className="absolute flex flex-col items-center">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl border border-indigo-50 mb-4">
                  <img src={bugMascot} className="w-9 h-9 opacity-80" alt="logo" />
               </div>
               <div className="font-mono text-[10px] text-indigo-500 font-bold uppercase tracking-[0.3em] bg-white/90 px-4 py-1.5 rounded-full border border-indigo-50">
                  Scanning Repo...
               </div>
               {/* How it works moved here as a stylish link */}
               <a href="#how-it-works" className="how-it-works-link">
                 How it works →
               </a>
            </div>
          </div>
        </main>

        <div className="particle" style={{width: '300px', height: '300px', top: '-100px', right: '-100px', background: 'rgba(79, 70, 229, 0.1)'}}></div>
        <div className="particle" style={{width: '400px', height: '400px', bottom: '-200px', left: '-100px', background: 'rgba(79, 70, 229, 0.05)'}}></div>
      </div>
    </>
  );
};

export default Dashboard;