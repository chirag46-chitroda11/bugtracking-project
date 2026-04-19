import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

const PMProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get("/project");
        setProjects(res.data.data || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="text-center font-bold text-slate-500 p-8">Loading Projects...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800">Projects Portfolio</h2>
        <div className="flex gap-4">
           <input type="text" placeholder="Search projects..." className="custom-input w-64 bg-white" />
           <button onClick={() => navigate("/create-project")} className="btn-primary !py-2 !px-4">
             + New Project
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div key={proj._id} className="glass-card p-6 border-t-4 border-t-indigo-500 shadow-sm hover:shadow-lg transition-all cursor-pointer relative" onClick={() => navigate(`/pm/project/${proj._id}`)}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-black text-slate-800">{proj.projectName}</h3>
              <span className={`px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest`}>
                {proj.status || "active"}
              </span>
            </div>
            
            <p className="text-sm text-slate-500 font-semibold mb-2 line-clamp-2 min-h-[40px]">{proj.description}</p>
            <div className="flex gap-2 mb-6 text-[10px] font-black tracking-wider uppercase">
               {proj.priority && <span className={`px-2 py-0.5 rounded ${proj.priority==='high'||proj.priority==='critical'?'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{proj.priority}</span>}
               {proj.projectCode && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{proj.projectCode}</span>}
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>{proj.progress || 0}% complete</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{width: `${proj.progress || 0}%`}}></div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100/60">
              <div className="text-center">
                 <p className="text-xl font-black text-slate-800">{proj.taskCount || 0}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tasks</p>
              </div>
              <div className="text-center">
                 <p className="text-xl font-black text-slate-800">{proj.moduleCount || 0}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modules</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PMProjects;
