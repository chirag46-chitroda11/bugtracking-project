import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBugs, updateBug } from "../services/bugService";

const EditBug = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    bugTitle: "",
    description: "",
    severity: "",
    status: ""
  });

  useEffect(() => {
    const fetchBug = async () => {
      const res = await getBugs();
      const bug = res.data.find((b) => b._id === id);

      if (bug) {
        setForm(bug);
      }
    };

    fetchBug();
  }, [id]);

  const handleUpdate = async () => {
    await updateBug(id, form);
    alert("Bug updated ✅");
    navigate("/admin-dashboard");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit Bug</h2>

      <input
        value={form.bugTitle}
        onChange={(e) => setForm({ ...form, bugTitle: e.target.value })}
        placeholder="Title"
      />

      <br /><br />

      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <br /><br />

      <select
        value={form.severity}
        onChange={(e) => setForm({ ...form, severity: e.target.value })}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>

      <br /><br />

      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
      >
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="CLOSED">Closed</option>
      </select>

      <br /><br />

      <button onClick={handleUpdate}>Update Bug</button>
    </div>
  );
};

export default EditBug;