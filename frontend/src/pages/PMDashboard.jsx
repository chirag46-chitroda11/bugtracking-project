import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Bug as BugIcon, CheckCircle, FileText, Settings, Menu, LogOut, Users2, ClipboardList, Zap } from 'lucide-react';
import NotificationBell from "../components/NotificationBell";
import { useConfirm } from "../context/ConfirmContext";

import PMDashboardSummary from "./pm/PMDashboardSummary";
import PMProjects from "./pm/PMProjects";
import PMTasks from "./pm/PMTasks";
import PMBugs from "./pm/PMBugs";
import PMSprints from "./pm/PMSprints";
import PMWorkload from "./pm/PMWorkload";
import PMTeam from "./pm/PMTeam";
import PMUsers from "./pm/PMUsers";
import API from "../api/axios";

const PMDashboard = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [loggedInUser, setLoggedInUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState(() => {
    const saved = sessionStorage.getItem("pm_active_tab");
    if (saved) { sessionStorage.removeItem("pm_active_tab"); return saved; }
    return "dashboard";
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!loggedInUser || loggedInUser.role !== "project_manager") {
      navigate("/login");
    } else {
      const fetchUsers = async () => {
        try {
          const res = await API.get("/user/users");
          const pending = res.data.data?.filter(u => u.status === "pending").length || 0;
          setPendingCount(pending);
        } catch (err) { }
      };
      fetchUsers();
    }
  }, [loggedInUser, navigate, activeTab]);

  // Listen for tab-switch events from child components (e.g., PMTeam)
  useEffect(() => {
    const handler = (e) => setActiveTab(e.detail);
    window.addEventListener("pm_switch_tab", handler);
    return () => window.removeEventListener("pm_switch_tab", handler);
  }, []);

  const handleLogout = async () => {
    if (await confirm({ title: "Logout", message: "Are you sure you want to logout?" })) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "projects":
        return <PMProjects />;
      case "tasks":
        return <PMTasks />;
      case "bugs":
        return <PMBugs />;
      case "sprints":
        return <PMSprints />;
      case "workload":
        return <PMWorkload />;
      case "team":
        return <PMTeam />;
      case "users":
        return <PMUsers />;
      case "dashboard":
      default:
        return <PMDashboardSummary />;
    }
  };

  if (!loggedInUser) return null;

  return (
    <div className="admin-wrapper relative min-h-screen text-slate-800 flex overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .admin-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; background: #ccd6ff; }
        .bg-circle { position: absolute; border: 15px solid rgba(79, 70, 229, 0.05); border-radius: 50%; pointer-events: none; z-index: 0; }
        .c1 { width: 800px; height: 800px; top: -200px; right: -200px; animation: float 20s infinite; }
        .c2 { width: 500px; height: 500px; bottom: 0px; left: -100px; animation: float 15s infinite reverse; }
        @keyframes float { 50% { transform: translateY(-30px) scale(1.05); } }
        
        .sidebar { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(25px); border-right: 1px solid rgba(255,255,255,0.7); box-shadow: 10px 0 30px rgba(0,0,0,0.03); z-index: 40; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .main-content { z-index: 10; padding: 2rem; overflow-y: auto; height: 100vh; flex: 1; }
        
        .nav-link { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 14px; color: #64748b; font-weight: 700; font-size: 0.95rem; transition: 0.3s; cursor: pointer; border: 1px solid transparent; }
        .nav-link:hover { background: #f8fafc; color: #4f46e5; }
        .nav-link.active { background: #fff; color: #4f46e5; border-color: rgba(79,70,229,0.1); box-shadow: 0 4px 15px rgba(79,70,229,0.08); }
        
        .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        
        .btn-primary { background: #121212; color: #fff; padding: 0.6rem 1.2rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; transition: 0.3s; display: inline-flex; align-items: center; gap: 8px; border: none; cursor: pointer; white-space: nowrap;}
        .btn-primary:hover { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25); }
        .btn-secondary { background: #fff; color: #1e293b; border: 1px solid #e2e8f0; padding: 0.4rem 0.8rem; border-radius: 10px; font-weight: 700; transition: 0.2s; cursor: pointer; display: inline-flex; align-items: center;}
        .btn-secondary:hover { border-color: #4f46e5; color: #4f46e5; background: #f8fafc; }
        .btn-action { background: #fff; color: #1e293b; border: 1px solid #e2e8f0; padding: 0.4rem 0.8rem; border-radius: 10px; font-weight: 700; transition: 0.2s; cursor: pointer; display: inline-flex; align-items: center;}
        .btn-action:hover { border-color: #4f46e5; color: #4f46e5; background: #f8fafc; }
        .btn-action.danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
        
        .custom-select { padding: 0.4rem 0.8rem; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; outline: none; font-weight: 700; color: #334155; }
        .custom-input { padding: 0.4rem 0.8rem; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; outline: none; font-weight: 700; color: #334155; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>

      <div className="bg-circle c1"></div>
      <div className="bg-circle c2"></div>

      {/* SIDEBAR */}
      <div className={`sidebar fixed md:relative h-screen w-72 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:translate-x-0`}>

        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <BugIcon size={20} strokeWidth={3} />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Fixify<span className="text-indigo-600">.</span></span>
          </div>
          <button className="md:hidden p-2 text-slate-500 bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <div className="px-5 py-4 mb-4">
          <div className="nav-link bg-indigo-50/50 border-indigo-100/50 cursor-default flex items-center gap-3 p-3 rounded-2xl">
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
              {loggedInUser?.profilePicture ? <img src={loggedInUser.profilePicture} className="w-full h-full object-cover" alt="Profile" /> : <span className="font-bold text-indigo-600">{loggedInUser?.name?.charAt(0) || "P"}</span>}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{loggedInUser?.name || "Project Manager"}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500 truncate">{loggedInUser?.role?.replace('_', ' ') || "PROJECT MANAGER"}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 space-y-1 custom-scrollbar">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4 mb-2 mt-2">Main Navigation</p>
          <div className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Layers size={18} /> Dashboard</div>
          <div className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}><FileText size={18} /> My Projects</div>
          <div className={`nav-link ${activeTab === 'sprints' ? 'active' : ''}`} onClick={() => setActiveTab('sprints')}><Zap size={18} /> Sprints & Goals</div>
          <div className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}><ClipboardList size={18} /> Global Tasks</div>
          <div className={`nav-link ${activeTab === 'bugs' ? 'active' : ''}`} onClick={() => setActiveTab('bugs')}><BugIcon size={18} /> Bug Reports</div>
          <div className={`nav-link ${activeTab === 'workload' ? 'active' : ''}`} onClick={() => setActiveTab('workload')}><Layers size={18} /> Global Workload</div>
          <div className={`nav-link ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}><Users2 size={18} /> Project Teams</div>
          <div className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3"><Users2 size={18} /> User Management</div>
              {pendingCount > 0 && <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-md shadow-red-500/40">{pendingCount}</span>}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-200/60 mt-auto space-y-2">
          <div className="nav-link hover:text-indigo-600" onClick={() => navigate("/profile")}><Settings size={18} /> Account Settings</div>
          <div className="nav-link text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleLogout}><LogOut size={18} /> Secure Logout</div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content flex flex-col relative w-full md:w-auto">
        {/* MOBILE HEADER */}
        <div className="md:hidden mb-6 flex items-center justify-between gap-4 bg-white/70 p-4 rounded-2xl backdrop-blur-md shadow-sm border border-white">
          <div className="flex items-center gap-4">
            <button className="p-2 bg-slate-100 rounded-lg text-slate-600" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <h2 className="font-black text-slate-800 uppercase tracking-wider text-xl italic mt-1">Fixify.</h2>
          </div>
          <NotificationBell />
        </div>

        {/* DESKTOP TOP BAR */}
        <div className="hidden md:flex justify-between items-center mb-6 bg-white/40 p-4 rounded-2xl backdrop-blur-md border border-white/60 shadow-sm">
          <h2 className="text-lg font-bold text-slate-700">Project Manager Dashboard</h2>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="text-sm font-bold text-slate-500 bg-white/60 px-4 py-2 rounded-xl">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {renderContent()}
        </div>
      </div>

    </div>
  );
};

export default PMDashboard;
