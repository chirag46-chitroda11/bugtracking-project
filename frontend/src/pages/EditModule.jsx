import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getModules, updateModule } from "../services/moduleService";

const EditModule = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    moduleName: "",
    description: ""
  });

  // 🔥 FETCH MODULE DATA
  useEffect(() => {
    const fetchModule = async () => {
      try {
        const res = await getModules();
        const module = res.data.find(m => m._id === id);

        if (module) {
          setForm({
            moduleName: module.moduleName,
            description: module.description
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchModule();
  }, [id]);

  // 🔥 UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.moduleName || !form.description) {
      alert("All fields required");
      return;
    }

    try {
      await updateModule(id, form);
      alert("Module updated ✅");
      navigate("/admin-dashboard");
    } catch (error) {
      alert("Update failed ❌");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Edit Module</h2>

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

        <button type="submit">Update Module</button>
      </form>
    </div>
  );
};

export default EditModule;