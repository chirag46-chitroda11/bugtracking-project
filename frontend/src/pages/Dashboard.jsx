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
    <div className="main-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        :root { --primary: #4f46e5; --bg: #f4f7ff; }
        .main-container { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); min-height: 100vh; overflow: hidden; position: relative; }
        
        /* New Background Rings Decoration */
        .decor-ring { position: absolute; border: 15px solid rgba(79, 70, 229, 0.03); border-radius: 50%; z-index: 1; pointer-events: none; }
        .decor-c1 { width: 350px; height: 350px; top: -150px; left: -150px; }
        .decor-c2 { width: 200px; height: 200px; bottom: 50px; right: -80px; }
        .decor-c3 { width: 450px; height: 450px; bottom: -200px; left: 10%; border-width: 8px; }

        /* Navbar */
        .nav { position: fixed; top: 0; width: 100%; z-index: 100; padding: ${scrolled ? '1rem 5%' : '2rem 8%'}; display: flex; justify-content: space-between; align-items: center; transition: 0.4s; background: ${scrolled ? 'rgba(255,255,255,0.8)' : 'transparent'}; backdrop-filter: ${scrolled ? 'blur(10px)' : 'none'}; box-sizing: border-box; }
        
        /* Layout */
        .hero { display: grid; grid-template-columns: 1.2fr 0.8fr; align-items: center; padding: 120px 10% 0; z-index: 10; position: relative; }
        .headline { font-size: clamp(3.5rem, 8vw, 6rem); font-weight: 800; line-height: 0.9; letter-spacing: -0.05em; margin-bottom: 1.5rem; color: #121212; }
        .accent { color: var(--primary); font-style: italic; }

        /* Nuclear Rotation Animation */
        .nuclear-box { position: relative; height: 500px; display: flex; justify-content: center; align-items: center; }
        .orbit-ring { position: absolute; border: 1px solid rgba(79, 70, 229, 0.1); border-radius: 50%; animation: rotate 15s linear infinite; }
        .bug-item { position: absolute; font-size: 2rem; filter: drop-shadow(0 0 10px rgba(0,0,0,0.1)); }
        
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.2); opacity: 0.6; } }

        .btn { padding: 1rem 2.5rem; border-radius: 1rem; font-weight: 700; cursor: pointer; transition: 0.3s; border: none; }
        .btn-black { background: #000; color: #fff; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .btn-black:hover { background: var(--primary); transform: translateY(-3px); }
        .btn-white { background: #fff; color: #000; border: 1px solid #e2e8f0; margin-left: 1rem; }
        .btn-white:hover { border-color: var(--primary); color: var(--primary); }
      `}</style>

      {/* --- BACKGROUND RINGS DECORATION --- */}
      <div className="decor-ring decor-c1"></div>
      <div className="decor-ring decor-c2"></div>
      <div className="decor-ring decor-c3"></div>

      <nav className="nav">
        <div className="flex items-center gap-2 cursor-pointer font-extrabold text-2xl tracking-tighter" onClick={() => navigate("/")}>
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
            <img src={bugMascot} className="w-5 h-5 invert" alt="L" />
          </div>
          Fixify<span className="text-indigo-600">.</span>
        </div>
        <button onClick={() => navigate("/register")} className="btn-black py-2.5 px-6 rounded-xl text-sm">Sign up</button>
      </nav>

      <main className="hero">
        <div>
          <div className="bg-white px-4 py-2 rounded-xl inline-flex items-center gap-3 shadow-sm border border-white mb-8 relative z-20">
            <span className="text-indigo-500 animate-bounce">⚡</span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider italic">"Your code has a secret... let's find it."</p>
          </div>
          <h1 className="headline relative z-20">Stop chasing <br/> <span className="accent">shadows.</span></h1>
          <p className="text-lg text-slate-500 max-w-md mb-10 leading-relaxed font-medium relative z-20">
            Fixify catches the bugs you missed, before your users do.  
            <span className="block mt-2 font-bold text-slate-800 tracking-tight">Fast. Fluid. Fearless.</span>
          </p>
          <div className="flex relative z-20">
            <button onClick={() => navigate("/register")} className="btn btn-black">Start Debugging</button>
            <button onClick={() => navigate("/login")} className="btn btn-white">Log in</button>
          </div>
        </div>

        <div className="nuclear-box relative z-20">
          {/* Pulsing Core */}
          <div className="absolute w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
          
          {/* Orbiting Ring 1 */}
          <div className="orbit-ring w-[300px] h-[300px]">
            <div className="bug-item top-0 left-1/2 -translate-x-1/2">🪲</div>
            <div className="bug-item bottom-0 left-1/2 -translate-x-1/2">🕷️</div>
          </div>

          {/* Orbiting Ring 2 (Faster & Reverse) */}
          <div className="orbit-ring w-[400px] h-[400px]" style={{ animationDuration: '10s', animationDirection: 'reverse' }}>
            <div className="bug-item top-1/2 left-0 -translate-y-1/2">🐝</div>
            <div className="bug-item top-1/2 right-0 -translate-y-1/2">🦟</div>
          </div>

          {/* Center Mascot */}
          <div className="absolute flex flex-col items-center">
            <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-2xl flex items-center justify-center shadow-2xl border border-white">
              <img src={bugMascot} className="w-8 h-8 opacity-90" alt="core" />
            </div>
            <div className="mt-4 font-mono text-[10px] text-indigo-500 font-black tracking-[0.4em] bg-white/50 px-4 py-1 rounded-full">
              SCANNING...
            </div>
          </div>
        </div>
      </main>

      {/* Existing Decorative Blur */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-200/30 rounded-full blur-[120px] -z-10"></div>
    </div>
  );
};

export default Dashboard;
