import { useState, useEffect } from "react";
import { updateProject } from "../services/projectService";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    projectName: "",
    description: "",
  });

  // 🔥 OLD DATA LOAD
  useEffect(() => {
    const fetchProject = async () => {
      const res = await API.get(`/project/${id}`);
      setForm({
        projectName: res.data.data.projectName,
        description: res.data.data.description,
      });
    };

    fetchProject();
  }, [id]);

  // 🔥 UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProject(id, form);
      alert("Project Updated ✅");
      navigate("/admin-dashboard");
    } catch (error) {
      alert("Update failed ❌");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Edit Project</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={form.projectName}
          onChange={(e) =>
            setForm({ ...form, projectName: e.target.value })
          }
          placeholder="Project Name"
        />

        <br /><br />

        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          placeholder="Description"
        />

        <br /><br />

        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default EditProject;