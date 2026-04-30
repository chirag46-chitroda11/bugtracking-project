import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { Users, Code, ShieldCheck, Activity, Briefcase, FileText } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { SkeletonCard, SkeletonParticles } from "../../components/skeleton";

const PMTeam = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
           API.get("/project"),
           API.get("/task")
        ]);
        
        let allProjs = projRes.data.data || [];
        setProjects(allProjs);
        setTasks(tasksRes.data.data || []);
      } catch (err) {
        console.error("Team data compile error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-fade-in" style={{ position: 'relative' }}>
      <SkeletonParticles count={5} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex justify-between items-center mb-6">
          <div className="skeleton-shimmer" style={{ height: 28, width: 260, borderRadius: 10 }} />
        </div>
        <SkeletonCard count={3} columns={1} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Users size={24} className="text-indigo-600"/> Specific Project Teams</h2>
          <p className="text-slate-500 font-semibold text-sm">Visualize isolated resource workloads strictly inside project scopes.</p>
        </div>
      </div>

      <div className="space-y-8">
        {projects.length === 0 && <div className="text-slate-400 italic font-bold">No registered projects found.</div>}
        
        {projects.map(proj => {
          
          // Tasks linked specifically to THIS project
          const projTasks = tasks.filter(t => (t.projectId?._id || t.projectId) === proj._id);
          
          const createdByName = proj.createdBy?.name || "System Base";

          // Helper to get stats for a user IN THIS project
          const getUserStats = (userId, type) => {
             const userTasks = projTasks.filter(t => type === 'dev' ? (t.assignedDeveloper?._id || t.assignedDeveloper) === userId : (t.assignedTester?._id || t.assignedTester) === userId);
             const active = userTasks.filter(t => t.status !== 'completed').length;
             const completed = userTasks.filter(t => t.status === 'completed').length;
             const totalHours = userTasks.reduce((acc, t) => acc + (t.timeSpent ? t.timeSpent / 3600 : 0), 0).toFixed(1);
             return { active, completed, totalHours, count: userTasks.length };
          };

          return (
            <div key={proj._id} className="glass-card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-slate-800 relative">
               
               {/* Project Header */}
               <div className="bg-indigo-50/50 p-6 border-b border-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-black text-indigo-950 flex items-center gap-2 mb-1"><Briefcase size={20} className="text-indigo-500"/> {proj.projectName}</h3>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-7">PM Administrator: <span className="text-indigo-600">{createdByName}</span></p>
                  </div>
                  <div>
                    <button onClick={() => navigate(`/create-task`)} className="bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all">Assign Scopes</button>
                  </div>
               </div>

               {/* Grid for Devs & Testers */}
               <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                  
                  {/* Developers Side */}
                  <div className="p-6">
                     <h4 className="flex items-center gap-2 font-black text-slate-700 mb-4 border-b border-slate-100 pb-2"><Code size={16} className="text-slate-400"/> Development Matrix <span className="ml-auto bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] uppercase">{proj.developers?.length || 0} Members</span></h4>
                     
                     <div className="space-y-4">
                        {(!proj.developers || proj.developers.length === 0) && <p className="text-xs font-bold text-slate-400 italic">No developers currently designated.</p>}
                        
                        {proj.developers?.map(dev => {
                           const stats = getUserStats(dev._id, 'dev');
                           return (
                             <div key={dev._id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 hover:border-indigo-200 transition-all">
                                <div className="flex justify-between items-center mb-3">
                                   <div className="flex items-center gap-2">
                                     <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-black text-xs">{dev.name.charAt(0)}</div>
                                     <div>
                                       <p className="font-bold text-sm text-slate-800 leading-tight">{dev.name}</p>
                                       <p className="text-[9px] font-black uppercase text-indigo-500 tracking-wider">Software Dev</p>
                                     </div>
                                   </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                   <div className="bg-white border border-slate-100 rounded-lg p-2 text-center">
                                      <p className="text-lg font-black text-blue-500 leading-none">{stats.active}</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Pending Tsk</p>
                                   </div>
                                   <div className="bg-white border border-slate-100 rounded-lg p-2 text-center">
                                      <p className="text-lg font-black text-emerald-500 leading-none">{stats.completed}</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Finished</p>
                                   </div>
                                   <div className="bg-white border border-slate-100 rounded-lg p-2 text-center">
                                      <p className="text-lg font-black text-indigo-500 leading-none">{stats.totalHours}h</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Worklog</p>
                                   </div>
                                </div>
                             </div>
                           )
                        })}
                     </div>
                  </div>

                  {/* Testers Side */}
                  <div className="p-6">
                     <h4 className="flex items-center gap-2 font-black text-slate-700 mb-4 border-b border-slate-100 pb-2"><ShieldCheck size={16} className="text-slate-400"/> QA Test Force <span className="ml-auto bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] uppercase">{proj.testers?.length || 0} Members</span></h4>
                     
                     <div className="space-y-4">
                        {(!proj.testers || proj.testers.length === 0) && <p className="text-xs font-bold text-slate-400 italic">No testing units currently deployed.</p>}
                        
                        {proj.testers?.map(t => {
                           const stats = getUserStats(t._id, 'test');
                           return (
                             <div key={t._id} className="bg-emerald-50/30 border border-emerald-50 rounded-xl p-4 hover:border-emerald-200 transition-all">
                                <div className="flex justify-between items-center mb-3">
                                   <div className="flex items-center gap-2">
                                     <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">{t.name.charAt(0)}</div>
                                     <div>
                                       <p className="font-bold text-sm text-slate-800 leading-tight">{t.name}</p>
                                       <p className="text-[9px] font-black uppercase text-emerald-500 tracking-wider">QA Analyst</p>
                                     </div>
                                   </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                   <div className="bg-white border border-slate-100 rounded-lg p-2 text-center">
                                      <p className="text-lg font-black text-amber-500 leading-none">{stats.active}</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Pending QA</p>
                                   </div>
                                   <div className="bg-white border border-slate-100 rounded-lg p-2 text-center">
                                      <p className="text-lg font-black text-emerald-500 leading-none">{stats.completed}</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Verified</p>
                                   </div>
                                   <div className="bg-white border border-slate-100 rounded-lg p-2 text-center">
                                      <p className="text-lg font-black text-emerald-600 leading-none">{stats.totalHours}h</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Time Spent</p>
                                   </div>
                                </div>
                             </div>
                           )
                        })}
                     </div>
                  </div>

               </div>
               
               <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Activity size={10}/> Total Assigned Tasks: {projTasks.length}</p>
                 <button
                   onClick={() => {
                     sessionStorage.setItem("pm_active_tab", "tasks");
                     window.dispatchEvent(new CustomEvent("pm_switch_tab", { detail: "tasks" }));
                   }}
                   className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                 >
                   Open Task Board →
                 </button>
               </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default PMTeam;
