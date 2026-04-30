import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { SkeletonCard, SkeletonParticles } from "../../components/skeleton";

const MyProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await API.get("/developer/projects-hierarchy");
                setProjects(res.data.data);
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    if (loading) return (
        <div className="space-y-6 animate-fade-in pb-10" style={{ position: 'relative' }}>
            <SkeletonParticles count={5} />
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="flex justify-between items-center mb-6">
                    <div className="skeleton-shimmer" style={{ height: 32, width: 200, borderRadius: 10 }} />
                </div>
                <SkeletonCard count={3} columns={1} />
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">My Projects</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {projects.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-slate-400 font-bold glass-card">No active projects assigned.</div>
                ) : projects.map(proj => (
                    <div key={proj._id} className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border-l-4 border-l-indigo-600 border border-white shadow-sm hover:shadow-md transition">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{proj.projectName}</h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${proj.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                        {proj.status}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 border-r border-slate-200 pr-3">
                                        Deadline: {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                    {proj.members && proj.members.length > 0 && (
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {proj.members.map((m, idx) => (
                                                <div key={idx} title={`${m.name} (${m.role})`} className="w-6 h-6 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-700 shadow-sm">
                                                    {m.profilePicture ? <img src={m.profilePicture} alt={m.name} className="w-full h-full rounded-full object-cover"/> : m.name.charAt(0)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 flex items-center gap-3">
                                <span className="text-sm font-bold text-slate-600">Progress</span>
                                <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${proj.progress || 0}%` }}></div>
                                </div>
                                <span className="text-sm font-black text-emerald-600">{proj.progress || 0}%</span>
                            </div>
                        </div>

                        {/* Hierarchy: Sprints -> Modules -> Tasks */}
                        <div className="space-y-4">
                            {(!proj.sprints || proj.sprints.length === 0) ? (
                                <p className="text-sm text-slate-400 font-bold italic">No sprints found for this project.</p>
                            ) : proj.sprints.map(sprint => (
                                <div key={sprint._id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-black text-slate-700 uppercase tracking-widest text-sm flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div> 
                                            {sprint.sprintName}
                                        </h4>
                                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${sprint.status === 'active' ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                            {sprint.status}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-3 pl-4 border-l-2 border-indigo-100 ml-1 mt-3">
                                        {(!sprint.modules || sprint.modules.length === 0) ? (
                                            <p className="text-xs text-slate-400 font-bold italic">No modules in this sprint.</p>
                                        ) : sprint.modules.map(module => (
                                            <div key={module._id} className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm">
                                                <h5 className="font-bold text-slate-800 text-sm mb-2">Module: {module.moduleName}</h5>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {(!module.tasks || module.tasks.length === 0) ? (
                                                        <p className="text-xs text-slate-400">No tasks assigned to you here.</p>
                                                    ) : module.tasks.map(task => (
                                                        <div key={task._id} className="bg-slate-50 p-3 rounded border border-slate-100 flex flex-col justify-between">
                                                            <div className="mb-2">
                                                                <span className="text-[10px] font-black text-slate-400">#{task._id.slice(-5).toUpperCase()}</span>
                                                                <p className="font-bold text-slate-700 text-sm leading-tight mt-1">{task.taskTitle}</p>
                                                            </div>
                                                            <div className="flex justify-between items-end mt-2">
                                                                <span className={`text-[10px] px-2 py-1 rounded font-black tracking-wider uppercase ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : task.status === 'testing' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                    {task.status}
                                                                </span>
                                                                <span className="text-xs font-bold text-slate-400">{task.timeSpent ? (task.timeSpent/3600).toFixed(1)+'h' : '0h'}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyProjects;
