import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { createModule, deleteModule } from "../../services/moduleService";
import { Activity, Edit, Users, Trash2, Package, PlusCircle, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from "react-hot-toast";

const PersonCard = ({ person, label, subLabel }) => {
  if (!person) return (
    <div className="flex items-center gap-2 text-slate-400 italic text-sm font-bold">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">?</div>
      Unassigned
    </div>
  );
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-lg flex-shrink-0">
        {person.profilePicture
          ? <img src={person.profilePicture} alt={person.name} className="w-full h-full object-cover" />
          : person.name?.charAt(0)}
      </div>
      <div>
        <p className="font-black text-slate-700 leading-tight">{person.name}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5">{subLabel || person.role}</p>
      </div>
    </div>
  );
};

const PMProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [modules, setModules] = useState([]);
  const [sprintMetrics, setSprintMetrics] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  const [showModuleForm, setShowModuleForm] = useState(false);
  const [modForm, setModForm] = useState({
     moduleName: "", description: "", status: "active", priority: "medium", deadlineDate: ""
  });
  
  const [deleteModal, setDeleteModal] = useState({ open: false, moduleId: null });

  const fetchProjectData = async () => {
    try {
      const [projRes, modRes, sprintRes] = await Promise.all([
         API.get(`/project/${id}`),
         API.get(`/module/project/${id}`),
         API.get(`/sprint`)
      ]);
      
      const projData = projRes.data?.data || projRes.data || null;
      setProject(projData);
      
      const modPayload = modRes.data?.data || modRes.data;
      setModules(Array.isArray(modPayload) ? modPayload : []);

      const sprintPayload = sprintRes.data?.data || sprintRes.data || [];
      const projectSprints = Array.isArray(sprintPayload) ? sprintPayload.filter(s => (s.projectId?._id || s.projectId) === id) : [];
      const activeSprint = projectSprints.find(s => s.status === 'active') || projectSprints[0];

      if (activeSprint) {
         const tasksInSprint = Array.isArray(activeSprint.tasks) ? activeSprint.tasks : [];
         const completedTasks = tasksInSprint.filter(t => t.status === 'completed').length;
         const plannedTasks = tasksInSprint.length;
         const delayedTasks = tasksInSprint.filter(t => t.status !== 'completed' && t.endDate && new Date(t.endDate) < new Date()).length;

         setSprintMetrics({
            sprintName: activeSprint.sprintName,
            status: activeSprint.status,
            planned: plannedTasks,
            completed: completedTasks,
            delayed: delayedTasks,
            capacity: activeSprint.capacityHours || 0,
         });
      } else {
         setSprintMetrics(null);
      }
    } catch (err) {
      console.error("Compilation Error:", err);
      setErrorState(true);
      toast.error("Failed to compile project matrices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleCreateModule = async (e) => {
     e.preventDefault();
     if(!modForm.moduleName) return toast.error("Module Name is required");
     try {
        await createModule({ ...modForm, projectId: id });
        toast.success("Module initialized within project");
        setShowModuleForm(false);
        setModForm({ moduleName: "", description: "", status: "active", priority: "medium", deadlineDate: "" });
        fetchProjectData();
     } catch (err) {
        toast.error("Failed to create module");
     }
  };
  
  const handleDeleteModule = async () => {
    if(!deleteModal.moduleId) return;
    try { 
      await deleteModule(deleteModal.moduleId); 
      fetchProjectData(); 
      toast.success("Module sequence deleted"); 
      setDeleteModal({ open: false, moduleId: null });
    } catch(e) { 
      toast.error("Removal failed"); 
    }
  };

  if (loading) return <div className="text-center font-bold text-slate-500 p-8">Compiling Project Resources...</div>;
  if (errorState || !project) return (
     <div className="flex items-center justify-center p-10 py-20 bg-[#ccd6ff]">
        <div className="bg-white p-10 rounded-2xl max-w-lg w-full text-center shadow-lg">
           <h2 className="text-2xl font-black text-rose-500 mb-2">Project Error</h2>
           <p className="text-slate-500 font-semibold mb-6">Unable to load project data.</p>
           <button onClick={() => window.location.reload()} className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-8 rounded-xl transition w-full">Retry</button>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#ccd6ff] p-4 md:p-8 text-slate-800 relative overflow-x-hidden">
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 } }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .glass-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        .cs::-webkit-scrollbar { width: 5px; }
        .cs::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .bg-circle { position: absolute; border: 15px solid rgba(79,70,229,0.05); border-radius:50%; pointer-events:none; z-index:0; }
        .c1 { width:600px; height:600px; top:-100px; right:-200px; animation:float 20s infinite; }
        .c2 { width:400px; height:400px; bottom:-50px; left:-100px; animation:float 15s infinite reverse; }
        @keyframes float { 50% { transform:translateY(-20px) scale(1.05); } }
        .field-box { background: rgba(255,255,255,0.5); border-radius: 14px; border: 1px solid rgba(255,255,255,0.8); padding: 16px; }
        .fl { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 6px; display:block; }
        .fv { font-size: 0.875rem; font-weight: 600; color: #334155; white-space: pre-wrap; }
        
        .custom-input { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 0.85rem; font-weight: 600; color: #334155; transition: 0.3s; outline: none; }
        .custom-input:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
      `}</style>

      <div className="bg-circle c1" /><div className="bg-circle c2" />

      {/* Delete Module Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-100">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-800 text-center mb-2">Delete Module?</h3>
            <p className="text-slate-500 text-center text-sm font-semibold mb-6">This action cannot be reversed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ open: false, moduleId: null })} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDeleteModule} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-white transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">

        {/* Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-bold text-slate-600 hover:text-indigo-600 transition bg-white/50 px-4 py-2 rounded-xl border border-white backdrop-blur-sm">
             <ArrowLeft size={18} /> Back
           </button>
           <div className="flex gap-2">
              <button onClick={() => navigate(`/create-sprint?project=${id}`)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition flex items-center gap-2">
                <Activity size={16}/> New Sprint
              </button>
              <button onClick={() => navigate(`/edit-project/${id}`)} className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 transition shadow-sm flex items-center gap-2">
                <Edit size={16}/> Edit Project
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* ════ LEFT COLUMN (Main Data) ════ */}
           <div className="lg:col-span-2 space-y-6">
              
              <div className="glass-card p-6 md:p-8">
                 <div className="flex flex-wrap gap-2 mb-4">
                    {project.projectCode && <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-1 rounded uppercase tracking-widest">{project.projectCode}</span>}
                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest border 
                       ${project.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                       {project.status || 'Active'}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest border 
                       ${project.priority === 'critical' || project.priority === 'high' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                       {project.priority || "Normal"} Priority
                    </span>
                 </div>
                 
                 <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                   {project.projectName}
                 </h1>
                 <p className="text-slate-600 font-medium leading-relaxed">{project.description || "No project description provided."}</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="field-box">
                      <span className="fl">Project Created By</span>
                      <PersonCard person={project.createdBy} label="" subLabel="Project Owner" />
                    </div>
                    
                    <div className="field-box">
                      <span className="fl">Date Constraints</span>
                      <div className="flex justify-between mt-2">
                         <div>
                            <p className="text-xs text-slate-400 font-bold mb-0.5">Start Date</p>
                            <p className="fv">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
                         </div>
                         <div className="h-8 w-px bg-slate-200 mx-4"></div>
                         <div>
                            <p className="text-xs text-rose-400 font-bold mb-0.5">Deadline</p>
                            <p className="fv text-rose-900">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not Set'}</p>
                         </div>
                      </div>
                    </div>
                 </div>
              </div>

              {/* MODULE MANAGER */}
              <div className="glass-card p-6 md:p-8">
                 <div className="flex justify-between items-center mb-6">
                    <span className="fl !mb-0 flex items-center gap-2 text-indigo-500">
                      <Package size={14} className="text-indigo-400" /> Core Modules
                    </span>
                    <button onClick={() => setShowModuleForm(true)} className="bg-indigo-50 hover:bg-indigo-500 hover:text-white text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1 shadow-sm">
                       <PlusCircle size={12}/> Initialize Module
                    </button>
                 </div>

                 {/* Module Form Overlay */}
                 {showModuleForm && (
                   <div className="mb-6 field-box !bg-indigo-50/50 !border-indigo-100 relative">
                     <button onClick={() => setShowModuleForm(false)} className="absolute top-4 right-4 text-slate-400 font-black hover:text-red-500">✕</button>
                     <span className="fl !text-indigo-600 !mb-4">Deploy New Module Segment</span>
                     
                     <form onSubmit={handleCreateModule} className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                           <input type="text" className="custom-input" placeholder="Module Name" value={modForm.moduleName} onChange={e => setModForm({...modForm, moduleName: e.target.value})} required />
                        </div>
                        <div className="col-span-2">
                           <input type="text" className="custom-input" placeholder="Technical Description" value={modForm.description} onChange={e => setModForm({...modForm, description: e.target.value})} />
                        </div>
                        <div>
                           <select className="custom-input" value={modForm.priority} onChange={e => setModForm({...modForm, priority: e.target.value})}>
                              <option value="low">Low Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="high">High Priority</option>
                           </select>
                        </div>
                        <div>
                           <input type="date" className="custom-input" value={modForm.deadlineDate} onChange={e => setModForm({...modForm, deadlineDate: e.target.value})} />
                        </div>
                        <div className="col-span-2 mt-2">
                           <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition shadow">DEPLOY MODULE</button>
                        </div>
                     </form>
                   </div>
                 )}

                 <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 cs">
                    {modules.length === 0 ? (
                       <div className="text-center py-8">
                          <Package size={24} className="text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Modules Found</p>
                       </div>
                    ) : modules.map(m => (
                       <div key={m._id} className="field-box !bg-white/40 hover:!bg-white transition flex justify-between items-center gap-4 group">
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-1 border-b border-transparent">
                               <p className="font-bold text-slate-800 text-sm">{m.moduleName}</p>
                               <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border
                                 ${m.priority === 'high' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                 {m.priority}
                               </span>
                             </div>
                             {m.description && <p className="text-xs text-slate-500 font-semibold line-clamp-1">{m.description}</p>}
                          </div>
                          
                          <div className="flex items-center gap-4 flex-shrink-0">
                             {m.deadlineDate && (
                               <div className="text-right">
                                 <p className="text-[9px] font-black text-rose-400 uppercase">Deadline</p>
                                 <p className="text-xs font-bold text-slate-700">{new Date(m.deadlineDate).toLocaleDateString()}</p>
                               </div>
                             )}
                             <button onClick={() => setDeleteModal({ open: true, moduleId: m._id })} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Remove Module">
                                <Trash2 size={16}/>
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

           </div>
           
           {/* ════ RIGHT COLUMN (Console & People) ════ */}
           <div className="space-y-6">

              {/* SPRINT METRICS CONSOLE */}
              <div className="glass-card p-6">
                 <span className="fl mb-4 flex items-center gap-2">
                   <Activity size={13} className="text-emerald-500" /> Active Sprint Console
                 </span>
                 
                 {sprintMetrics ? (
                    <div className="space-y-3">
                       <div className="field-box">
                          <span className="fl">Current Iteration</span>
                          <p className="fv text-indigo-900 truncate" title={sprintMetrics.sprintName}>{sprintMetrics.sprintName}</p>
                          <span className="text-[9px] inline-block mt-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase font-black tracking-widest border border-emerald-200">{sprintMetrics.status}</span>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                          <div className="field-box !p-4">
                             <span className="fl">Task Pipeline</span>
                             <p className="text-2xl font-black text-slate-800 leading-none">{sprintMetrics.completed} <span className="text-sm font-bold text-slate-400">/ {sprintMetrics.planned}</span></p>
                          </div>
                          <div className="field-box !p-4" style={{ background: sprintMetrics.delayed > 0 ? "rgba(254,242,242,0.5)" : undefined, borderColor: sprintMetrics.delayed > 0 ? "rgba(252,165,165,0.5)" : undefined }}>
                             <span className="fl" style={{ color: sprintMetrics.delayed > 0 ? "#ef4444" : undefined }}>Delayed</span>
                             <p className={`text-2xl font-black leading-none ${sprintMetrics.delayed > 0 ? "text-rose-600" : "text-slate-800"}`}>{sprintMetrics.delayed}</p>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="text-center py-6">
                       <p className="text-xs font-bold text-slate-400">No active sprint running.</p>
                       <button onClick={() => navigate(`/create-sprint?project=${id}`)} className="text-indigo-600 font-black text-xs uppercase tracking-widest mt-2 hover:underline">Start a Sprint →</button>
                    </div>
                 )}
              </div>

              {/* ASSIGNED WORKFORCE */}
              <div className="glass-card p-6">
                 <span className="fl mb-4 flex items-center gap-2">
                   <Users size={13} className="text-blue-500" /> Assigned Workforce
                 </span>

                 <div className="space-y-5">
                    <div>
                      <span className="fl !text-slate-400/80 mb-2">Developers ({project.developers?.length || 0})</span>
                      <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1 cs">
                         {project.developers?.length > 0 ? project.developers.map(dev => (
                           <div key={dev._id} className="field-box !py-2 !px-3">
                              <PersonCard person={dev} label="" subLabel="Engineer" />
                           </div>
                         )) : <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">None assigned</p>}
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-100 pt-5">
                      <span className="fl !text-slate-400/80 mb-2">QA Testers ({project.testers?.length || 0})</span>
                      <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1 cs">
                         {project.testers?.length > 0 ? project.testers.map(tester => (
                           <div key={tester._id} className="field-box !py-2 !px-3">
                              <PersonCard person={tester} label="" subLabel="QA Analyst" />
                           </div>
                         )) : <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">None assigned</p>}
                      </div>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
};

export default PMProjectDetail;
