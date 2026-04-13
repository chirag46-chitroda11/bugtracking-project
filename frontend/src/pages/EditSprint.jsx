import { useEffect, useState } from "react";
import { getSprintById, updateSprint } from "../services/sprintService";
import { getProjects } from "../services/projectService";
import { useParams, useNavigate } from "react-router-dom";

const EditSprint = () => {
  const { id } = useParams();
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
    const fetchData = async () => {
      try {
        const sprintRes = await getSprintById(id);

        setForm({
          sprintName: sprintRes.data.sprintName || "",
          projectId: sprintRes.data.projectId?._id || "",
          startDate: sprintRes.data.startDate?.slice(0, 10) || "",
          endDate: sprintRes.data.endDate?.slice(0, 10) || "",
          status: sprintRes.data.status || "planned"
        });

        const projRes = await getProjects();
        setProjects(projRes.data || []);

      } catch (err) {
        console.error(err);
        alert("Error loading sprint");
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!form.sprintName || !form.projectId) {
      alert("Sprint name and project required");
      return;
    }

    const payload = {
      ...form,
      status: form.status.toLowerCase() // ✅ IMPORTANT FIX
    };

    console.log("UPDATE PAYLOAD 👉", payload);

    try {
      await updateSprint(id, payload);

      alert("Sprint updated ✅");
      navigate("/admin-dashboard");

    } catch (err) {
      console.error(err);
      alert(err.message || "Update failed");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>✏️ Edit Sprint</h2>

      <input
        name="sprintName"
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

      <button onClick={handleSubmit}>Update Sprint</button>
    </div>
  );
};

export default EditSprint;