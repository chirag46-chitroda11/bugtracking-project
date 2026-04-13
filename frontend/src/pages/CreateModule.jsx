import { useState, useEffect } from "react";
import { createModule } from "../services/moduleService";
import { getProjects } from "../services/projectService";
import { useNavigate } from "react-router-dom";

const CreateModule = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    moduleName: "",
    description: "",
    projectId: ""
  });

  // 🔥 GET PROJECTS FOR DROPDOWN
  useEffect(() => {
    const fetchProjects = async () => {
      const res = await getProjects();
      setProjects(res.data);
    };

    fetchProjects();
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.moduleName || !form.description || !form.projectId) {
      alert("All fields required");
      return;
    }

    try {
      await createModule({
        ...form,
        createdBy: user._id
      });

      alert("Module Created ✅");
      navigate("/admin-dashboard");

    } catch (error) {
      alert("Error creating module ❌");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Create Module</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Module Name"
          value={form.moduleName}
          onChange={(e) =>
            setForm({ ...form, moduleName: e.target.value })
          }
        />

        <br /><br />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <br /><br />

        {/* 🔥 PROJECT DROPDOWN */}
        <select
          value={form.projectId}
          onChange={(e) =>
            setForm({ ...form, projectId: e.target.value })
          }
        >
          <option value="">Select Project</option>

          {projects.map((proj) => (
            <option key={proj._id} value={proj._id}>
              {proj.projectName}
            </option>
          ))}
        </select>

        <br /><br />

        <button type="submit">Create Module</button>

      </form>
    </div>
  );
};

export default CreateModule;