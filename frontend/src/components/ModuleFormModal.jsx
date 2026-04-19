import { useState, useEffect } from "react";
import { X, Package, Calendar, Flag, Users, FileText, Layers, AlertCircle, Activity } from "lucide-react";
import { createModule, updateModule } from "../services/moduleService";
import { getProjects } from "../services/projectService";
import toast from "react-hot-toast";
import API from "../api/axios";

const ModuleFormModal = ({ isOpen, onClose, onSuccess, editModule = null }) => {
  const [form, setForm] = useState({
    moduleName: "",
    description: "",
    projectId: "",
    priority: "medium",
    status: "active",
    dueDate: "",
    assignedTo: "",
  });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (editModule) {
        setForm({
          moduleName: editModule.moduleName || "",
          description: editModule.description || "",
          projectId: editModule.projectId?._id || editModule.projectId || "",
          priority: editModule.priority || "medium",
          status: editModule.status || "active",
          dueDate: editModule.dueDate ? editModule.dueDate.split("T")[0] : "",
          assignedTo: editModule.assignedTo?._id || editModule.assignedTo || "",
        });
      } else {
        setForm({ moduleName: "", description: "", projectId: "", priority: "medium", status: "active", dueDate: "", assignedTo: "" });
      }
      setErrors({});
    }
  }, [isOpen, editModule]);

  const fetchData = async () => {
    try {
      const projRes = await getProjects();
      setProjects(projRes.data || []);
      const userRes = await API.get("/user/users");
      setUsers(userRes.data.data || []);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.moduleName.trim()) errs.moduleName = "Module name is required";
    if (!form.projectId) errs.projectId = "Please select a project";
    if (!form.description.trim()) errs.description = "Description is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editModule) {
        await updateModule(editModule._id, form);
        toast.success("Module updated successfully! ✨");
      } else {
        await createModule(form);
        toast.success("Module created successfully! 🚀");
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(editModule ? "Update failed ❌" : "Creation failed ❌");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="module-modal-overlay">
      <style>{`
        .module-modal-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: modalBgIn 0.3s ease;
        }
        @keyframes modalBgIn { from { opacity: 0; } to { opacity: 1; } }
        
        .module-modal {
          background: rgba(255,255,255,0.95); backdrop-filter: blur(25px);
          border-radius: 24px; border: 1px solid #fff;
          box-shadow: 0 30px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03);
          width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
          animation: modalSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .module-modal::-webkit-scrollbar { width: 5px; }
        .module-modal::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 24px 28px 16px; border-bottom: 1px solid #f1f5f9;
        }
        .modal-header-title { display: flex; align-items: center; gap: 12px; }
        .modal-header-title .icon-wrap {
          width: 44px; height: 44px; background: linear-gradient(135deg, #4f46e5, #6366f1);
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(79,70,229,0.25);
        }
        .modal-header-title h3 { font-weight: 800; font-size: 1.15rem; color: #1e293b; margin: 0; }
        .modal-header-title p { font-size: 0.8rem; color: #64748b; font-weight: 600; margin: 2px 0 0; }
        .modal-close {
          width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e2e8f0;
          background: #f8fafc; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.2s; color: #64748b;
        }
        .modal-close:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }
        
        .modal-body { padding: 24px 28px 28px; }
        
        .form-group { margin-bottom: 20px; }
        .form-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 8px;
        }
        .form-label .label-icon { color: #94a3b8; }
        
        .form-input, .form-select, .form-textarea {
          width: 100%; padding: 12px 14px; border-radius: 12px;
          border: 1.5px solid #e2e8f0; background: #f8fafc;
          font-family: inherit; font-size: 0.9rem; font-weight: 600;
          color: #334155; transition: all 0.3s; outline: none;
          box-sizing: border-box;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: #4f46e5; background: #fff;
          box-shadow: 0 0 0 4px rgba(79,70,229,0.08);
        }
        .form-input.error, .form-select.error, .form-textarea.error {
          border-color: #ef4444; box-shadow: 0 0 0 4px rgba(239,68,68,0.08);
        }
        .form-textarea { resize: none; height: 100px; }
        .form-select { cursor: pointer; }
        
        .error-text { font-size: 0.75rem; color: #ef4444; font-weight: 600; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
        
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
        
        .modal-footer {
          display: flex; gap: 12px; justify-content: flex-end;
          padding: 0 28px 24px;
        }
        .btn-cancel {
          padding: 12px 24px; border-radius: 12px; font-weight: 700;
          font-size: 0.9rem; border: 1.5px solid #e2e8f0; background: #fff;
          color: #64748b; cursor: pointer; transition: 0.3s;
        }
        .btn-cancel:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .btn-submit {
          padding: 12px 32px; border-radius: 12px; font-weight: 800;
          font-size: 0.9rem; border: none;
          background: linear-gradient(135deg, #121212, #1e293b);
          color: #fff; cursor: pointer; transition: 0.3s;
          display: flex; align-items: center; gap: 8px;
        }
        .btn-submit:hover { background: linear-gradient(135deg, #4f46e5, #6366f1); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79,70,229,0.25); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="module-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <div className="icon-wrap">
              <Package size={22} color="#fff" />
            </div>
            <div>
              <h3>{editModule ? "Edit Module" : "Create Module"}</h3>
              <p>{editModule ? "Update module details" : "Add a new module to your project"}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Module Name */}
            <div className="form-group">
              <label className="form-label"><Package size={14} className="label-icon" /> Module Name</label>
              <input
                type="text"
                className={`form-input ${errors.moduleName ? "error" : ""}`}
                placeholder="Enter module name..."
                value={form.moduleName}
                onChange={(e) => setForm({ ...form, moduleName: e.target.value })}
              />
              {errors.moduleName && <span className="error-text"><AlertCircle size={12} /> {errors.moduleName}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label"><FileText size={14} className="label-icon" /> Description</label>
              <textarea
                className={`form-textarea ${errors.description ? "error" : ""}`}
                placeholder="Describe the module functionality..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              {errors.description && <span className="error-text"><AlertCircle size={12} /> {errors.description}</span>}
            </div>

            {/* Project */}
            <div className="form-group">
              <label className="form-label"><Layers size={14} className="label-icon" /> Select Project</label>
              <select
                className={`form-select ${errors.projectId ? "error" : ""}`}
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              >
                <option value="">-- Select Linked Project --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.projectName}</option>
                ))}
              </select>
              {errors.projectId && <span className="error-text"><AlertCircle size={12} /> {errors.projectId}</span>}
            </div>

            <div className="form-row">
              {/* Priority */}
              <div className="form-group">
                <label className="form-label"><Flag size={14} className="label-icon" /> Priority</label>
                <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label"><Activity size={14} className="label-icon" /> Status</label>
                <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              {/* Due Date */}
              <div className="form-group">
                <label className="form-label"><Calendar size={14} className="label-icon" /> Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>

              {/* Assign Team Member */}
              <div className="form-group">
                <label className="form-label"><Users size={14} className="label-icon" /> Assign Member</label>
                <select className="form-select" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                  <option value="">-- Optional --</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role?.replace("_", " ")})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              <Package size={16} />
              {submitting ? "Processing..." : editModule ? "Update Module" : "Create Module"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleFormModal;
