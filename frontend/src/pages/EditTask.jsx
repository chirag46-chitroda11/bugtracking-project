import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTaskById, updateTask } from "../services/taskService";

const EditTask = () => {   // ✅ NAME IMPORTANT
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    taskTitle: "",
    description: "",
    status: "pending"
  });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await getTaskById(id);

        setForm({
          taskTitle: res.data.taskTitle || "",
          description: res.data.description || "",
          status: res.data.status || "pending"
        });

      } catch (error) {
        console.log(error);
      }
    };

    fetchTask();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateTask(id, form);
      alert("Task Updated ✅");
      navigate("/admin-dashboard");

    } catch (error) {
      alert("Update failed ❌");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Edit Task</h2>

      <form onSubmit={handleSubmit}>

        <input
          value={form.taskTitle}
          onChange={(e) =>
            setForm({ ...form, taskTitle: e.target.value })
          }
        />

        <br /><br />

        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <br /><br />

        <select
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value })
          }
        >
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="testing">Testing</option>
          <option value="completed">Completed</option>
        </select>

        <br /><br />

        <button type="submit">Update Task</button>

      </form>
    </div>
  );
};

export default EditTask;  