import { useState } from "react";
import { createProject } from "../services/projectService";
import { useNavigate } from "react-router-dom";

const CreateProject = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    projectName: "",
    description: "",
  });
  const user = JSON.parse(localStorage.getItem("user"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.projectName || !form.description) {
         alert("All fields are required ❗");
    return;
  }

    try {
     await createProject({
        ...form,
     createdBy: user._id
    });
      alert("Project Created Successfully 🚀");

      navigate("/admin-dashboard"); // redirect back
    } catch (error) {
      alert("Error creating project ❌ :", error);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Create Project</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Project Name"
          value={form.projectName}
          onChange={(e) =>
            setForm({ ...form, projectName: e.target.value })
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

        <button type="submit">Create Project</button>
      </form>
    </div>
  );
};

export default CreateProject;