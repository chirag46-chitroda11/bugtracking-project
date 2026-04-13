import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      const res = await API.get(`/user/users`);
      const user = res.data.data.find(u => u._id === id);
      setForm(user);
    };
    fetchUser();
  }, [id]);

  const handleUpdate = async () => {
    await API.put(`/user/users/${id}`, form);
    alert("User updated ✅");
    navigate("/admin-dashboard");
  };

  return (
    <div>
      <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
      <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />

      <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
        <option value="developer">Developer</option>
        <option value="tester">Tester</option>
        <option value="project_manager">Project Manager</option>
      </select>

      <button onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default EditUser;