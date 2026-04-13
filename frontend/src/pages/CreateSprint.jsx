import { useEffect, useState } from "react";
import { createSprint } from "../services/sprintService";
import { getProjects } from "../services/projectService";
import { useNavigate } from "react-router-dom";

const CreateSprint = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);

  const [form, setForm] = useState({
    sprintName: "",
    projectId: "",
    startDate: "",
    endDate: "",
    status: "planned"
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        setProjects(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!form.sprintName || !form.projectId) {
      alert("Sprint name and project are required");
      return;
    }

    const payload = {
      ...form,
      status: form.status.toLowerCase() // ✅ IMPORTANT FIX
    };

    console.log("CREATE PAYLOAD 👉", payload);

    try {
      await createSprint(payload);

      alert("Sprint created ✅");
      navigate("/admin-dashboard");

    } catch (err) {
      console.error(err);
      alert(err.message || "Error creating sprint");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>🚀 Create Sprint</h2>

      <input
        name="sprintName"
        placeholder="Sprint Name"
        value={form.sprintName}
        onChange={handleChange}
      />

      <select name="projectId" value={form.projectId} onChange={handleChange}>
        <option value="">Select Project</option>
        {projects.map((p) => (
          <option key={p._id} value={p._id}>
            {p.projectName}
          </option>
        ))}
      </select>

      <input
        type="date"
        name="startDate"
        value={form.startDate}
        onChange={handleChange}
      />

      <input
        type="date"
        name="endDate"
        value={form.endDate}
        onChange={handleChange}
      />

      {/* ✅ STATUS */}
      <select name="status" value={form.status} onChange={handleChange}>
        <option value="planned">Planned</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>

      <button onClick={handleSubmit}>Create Sprint</button>
    </div>
  );
};

export default CreateSprint;