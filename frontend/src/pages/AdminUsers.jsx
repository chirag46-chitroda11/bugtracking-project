import { useEffect, useState } from "react";
import API from "../api/axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/users");
      setUsers(res.data.data || []);
    } catch (err) {
      setError("Unable to load users. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlock = async (id) => {
    await API.put(`/users/toggle/${id}`);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    await API.delete(`/users/${id}`);
    fetchUsers();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>👥 Users</h2>

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && users.length === 0 && <p>No users found.</p>}

      {users.map((user) => (
        <div key={user._id} style={{
          background: "#fff",
          padding: "15px",
          marginBottom: "10px",
          borderRadius: "10px"
        }}>
          <h3>{user.name}</h3>

          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <p>Status: {user.status}</p>
          <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>

          <button onClick={() => handleBlock(user._id)}>
            {user.status === "blocked" ? "Unblock" : "Block"}
          </button>

          <button onClick={() => handleDelete(user._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminUsers;