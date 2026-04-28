import { useState, useEffect } from "react";
import { updateTask, getTaskById } from "../services/taskService";
import { getProjects } from "../services/projectService";
import { getModules } from "../services/moduleService";
import API from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [devs, setDevs] = useState([]);
  const [testers, setTesters] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    taskTitle: "",
    description: "",
    projectId: "",
    moduleId: "",
    sprintId: "",
    assignedDeveloper: "",
    assignedTester: "",
    startDate: "",
    endDate: "",
    status: "pending",
    priority: "medium",
    estimatedHours: "",
    notes: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, modRes, userRes, taskRes, sprintRes] = await Promise.all([
           getProjects(),
           getModules(),
           API.get("/user/users"),
           getTaskById(id),
           API.get("/sprint")
        ]);
        
        setProjects(projRes.data || []);
        setModules(modRes.data || []);
        setSprints(sprintRes.data.data || []);
        
        const allUsers = userRes.data.data || [];
        setDevs(allUsers.filter(u => u.role === "developer"));
        setTesters(allUsers.filter(u => u.role === "tester"));

        // taskRes is already res.data from the service
        const taskData = taskRes?.data || taskRes;
        if (taskData) {
           const t = taskData;
           setForm({
               taskTitle: t.taskTitle || "",
               description: t.description || "",
               projectId: t.projectId?._id || t.projectId || "",
               moduleId: t.moduleId?._id || t.moduleId || "",
               sprintId: t.sprintId?._id || t.sprintId || "",
               assignedDeveloper: t.assignedDeveloper?._id || t.assignedDeveloper || "",
               assignedTester: t.assignedTester?._id || t.assignedTester || "",
               startDate: t.startDate ? t.startDate.split('T')[0] : "",
               endDate: t.endDate ? t.endDate.split('T')[0] : "",
               status: t.status || "pending",
               priority: t.priority || "medium",
               estimatedHours: t.estimatedHours !== undefined ? t.estimatedHours : "",
               notes: t.notes || ""
           });
        }
      } catch (error) {
        toast.error("Failed to load task data");
      } finally {
         setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const filteredModules = form.projectId
    ? modules.filter(m => (m.projectId?._id || m.projectId) === form.projectId)
    : modules;

  const filteredSprints = form.projectId
    ? sprints.filter(s => (s.projectId?._id || s.projectId) === form.projectId)
    : sprints;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.taskTitle || !form.projectId) {
      return toast.error("Title and Target Project are required!");
    }
    setSaving(true);
    try {
      await updateTask(id, {
        ...form,
        estimatedHours: form.estimatedHours !== "" ? parseFloat(form.estimatedHours) : 0
      });
      toast.success("Task updated successfully ✅");
      setTimeout(() => navigate(-1), 1500);
    } catch (error) { 
      toast.error(error?.message || error?.response?.data?.message || "Task update failed ❌"); 
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#ccd6ff]">
      <div className="animate-spin w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="layout-wrapper relative min-h-screen flex items-center justify-center p-6 text-slate-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        .layout-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; background: #ccd6ff; overflow-y: auto; }
        .bg-circle { position: absolute; border: 15px solid rgba(139, 92, 246, 0.05); border-radius: 50%; pointer-events: none; z-index: 0; }
        .c1 { width: 500px; height: 500px; top: -100px; right: -100px; animation: float 15s infinite; }
        .c2 { width: 300px; height: 300px; bottom: 50px; left: -50px; animation: float 10s infinite reverse; }
        @keyframes float { 50% { transform: translateY(-20px) scale(1.05); } }
        
        .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid #fff; box-shadow: 0 10px 40px rgba(0,0,0,0.05); padding: 40px; width: 100%; max-width: 700px; z-index: 10; position: relative; max-height: 92vh; overflow-y: auto;}
        
        .custom-input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-family: inherit; font-size: 0.95rem; font-weight: 600; color: #334155; margin-bottom: 20px; transition: 0.3s; outline: none; }
        .custom-input:focus { border-color: #8b5cf6; background: #fff; box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1); }
        .custom-label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; display: block; margin-left: 4px; }
        
        .btn-primary { width: 100%; background: #121212; color: #fff; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 1rem; border: none; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .btn-primary:hover { background: #8b5cf6; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(139, 92, 246, 0.25); }
      `}</style>
      
      <div className="bg-circle c1"></div>
      <div className="bg-circle c2"></div>

      <div className="glass-card custom-scrollbar">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-500 hover:text-violet-600 transition font-bold text-xl">←</button>
          <div>
            <h2 className="text-2xl font-black text-violet-950 tracking-tight">Edit Task</h2>
            <p className="text-slate-500 font-semibold text-sm">Update task assignments, status, and planning data.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
             <label className="custom-label">Task Title *</label>
             <input type="text" className="custom-input" placeholder="Task Title" value={form.taskTitle} onChange={(e) => setForm({ ...form, taskTitle: e.target.value })} />
          </div>
          <div>
             <label className="custom-label">Description & Guidelines</label>
             <textarea className="custom-input h-24 resize-none" placeholder="Task guidelines..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="custom-label">Target Project *</label>
                <select className="custom-input cursor-pointer" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value, moduleId: "", sprintId: "" })}>
                  <option value="">-- Select Project --</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                </select>
             </div>
             <div>
                <label className="custom-label">Feature Module</label>
                <select className="custom-input cursor-pointer" value={form.moduleId} onChange={(e) => setForm({ ...form, moduleId: e.target.value })}>
                  <option value="">-- Select Module --</option>
                  {filteredModules.map(m => <option key={m._id} value={m._id}>{m.moduleName}</option>)}
                </select>
             </div>
          </div>

          {/* Sprint Assignment */}
          <div>
            <label className="custom-label">Assign to Sprint</label>
            <select className="custom-input cursor-pointer" value={form.sprintId} onChange={(e) => setForm({ ...form, sprintId: e.target.value })}>
              <option value="">-- No Sprint --</option>
              {filteredSprints.map(s => <option key={s._id} value={s._id}>{s.sprintName}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl mb-4">
             <div>
                <label className="custom-label">Assign Developer</label>
                <select className="custom-input !mb-0 cursor-pointer" value={form.assignedDeveloper} onChange={(e) => setForm({ ...form, assignedDeveloper: e.target.value })}>
                  <option value="">-- Assign Developer --</option>
                  {devs.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
             </div>
             <div>
                <label className="custom-label">Assign Tester (QA)</label>
                <select className="custom-input !mb-0 cursor-pointer" value={form.assignedTester} onChange={(e) => setForm({ ...form, assignedTester: e.target.value })}>
                  <option value="">-- Assign Tester --</option>
                  {testers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
             <div>
                <label className="custom-label">Status</label>
                <select className="custom-input cursor-pointer" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="testing">Testing QA</option>
                  <option value="completed">Completed</option>
                </select>
             </div>
             <div>
                <label className="custom-label">Priority</label>
                <select className="custom-input cursor-pointer" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
             </div>
             <div>
                <label className="custom-label">Estimated Hours</label>
                <input type="number" min="0" step="0.5" className="custom-input" placeholder="e.g. 8" value={form.estimatedHours} onChange={e => setForm({...form, estimatedHours: e.target.value})} />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
             <div>
                <label className="custom-label">Start Date</label>
                <input type="date" className="custom-input" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
             </div>
             <div>
                <label className="custom-label">Due Date</label>
                <input type="date" className="custom-input" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
             </div>
          </div>

          <div>
            <label className="custom-label">Notes</label>
            <textarea className="custom-input h-16 resize-none" placeholder="Additional notes..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>

          <button type="submit" className="btn-primary mt-4" disabled={saving}>
            {saving ? "Updating Task..." : "Save Changes ✓"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default EditTask;
