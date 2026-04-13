import { useEffect, useState } from "react";
import API from "../api/axios";
const CreateUser = () => {



  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "developer"
  });

  // 🔥 FETCH USERS
  const fetchUsers = async () => {
    const res = await API.get("/user/users");
    setUsers(res.data.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔥 CREATE USER (use register API)
  const handleCreate = async () => {
    await API.post("/user/register", form); // ✅ IMPORTANT

    setForm({
      name: "",
      email: "",
      password: "",
      role: "developer"
    });

    fetchUsers();
  };

  // 🔥 BLOCK USER
  const handleToggle = async (id) => {
    await API.put(`/user/users/toggle/${id}`);
    fetchUsers();
  };

  // 🔥 DELETE USER
  const handleDelete = async (id) => {

    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;
    await API.delete(`/user/users/${id}`);
fetchUsers();
    fetchUsers();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>👤 User Management</h2>

      {/* ================= CREATE USER ================= */}
      <div style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "20px"
      }}>
        

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="developer">Developer</option>
          <option value="tester">Tester</option>
          <option value="project_manager">Project Manager</option>
        </select>

        <button onClick={handleCreate}>Add User</button>
      </div>

  
    </div>
  );
};

export default CreateUser;