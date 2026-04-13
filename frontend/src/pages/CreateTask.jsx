import { useState, useEffect } from "react";
import { createTask } from "../services/taskService";
import { getProjects } from "../services/projectService";
import { getModules } from "../services/moduleService";
import { useNavigate } from "react-router-dom";

const CreateTask = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [priority, setPriority] = useState("medium");

  // ✅ FIXED STATE
  const [form, setForm] = useState({
    taskTitle: "",
    description: "",
    projectId: "",
    moduleId: "",
    status: "pending",
    priority: "medium",

  });

  // 🔥 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const projRes = await getProjects();
        setProjects(projRes.data || []);

        const modRes = await getModules();
        setModules(modRes.data || []);
      } catch (error) {
        console.log("Fetch Error:", error);
      }
    };

    fetchData();
  }, []);

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("FORM DATA:", form); // 🔍 DEBUG

      await createTask(form);
      alert("Task Created ✅");

      navigate("/admin-dashboard");
    } catch (error) {
      alert(error?.message || "Task creation failed ❌");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Create Task</h2>

      <form onSubmit={handleSubmit}>

        {/* ✅ TASK TITLE */}
        <input
          type="text"
          placeholder="Task Title"
          value={form.taskTitle || ""}
          onChange={(e) =>
            setForm({ ...form, taskTitle: e.target.value })
          }
        />

        <br /><br />

        {/* DESCRIPTION */}
        <textarea
          placeholder="Description"
          value={form.description || ""}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <br /><br />

        {/* PROJECT */}
        <select
          value={form.projectId || ""}
          onChange={(e) =>
            setForm({ ...form, projectId: e.target.value })
          }
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.projectName}
            </option>
          ))}
        </select>

        <br /><br />

        {/* MODULE */}
        <select
          value={form.moduleId || ""}
          onChange={(e) =>
            setForm({ ...form, moduleId: e.target.value })
          }
        >
          <option value="">Select Module</option>
          {modules.map((m) => (
            <option key={m._id} value={m._id}>
              {m.moduleName}
            </option>
          ))}
        </select>

        <br /><br />

        {/* STATUS */}
        <select
          value={form.status || "pending"}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value })
          }
        >
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="testing">Testing</option>
          <option value="completed">Completed</option>
        </select>

        <br /><br />

        <label>Priority:</label>
<select value={priority} onChange={(e) => setPriority(e.target.value)}>
  <option value="low">Low</option>
  <option value="medium">Medium</option>
  <option value="high">High</option>
</select> 

<br /><br />

        <button type="submit">Create Task</button>

      </form>
    </div>
  );
};

export default CreateTask;