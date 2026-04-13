import API from "../api/axios";

// ✅ CREATE TASK
export const createTask = async (data) => {
  try {
    if (!data) {
      throw new Error("Task data is required");
    }

    if (!data.taskTitle || !data.description) {
      throw new Error("Title and Description are required");
    }

    const res = await API.post("/task", data);
    return res.data;

  } catch (error) {
    console.log("Create Task Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};


// ✅ GET ALL TASKS
export const getTasks = async () => {
  try {
    const res = await API.get("/task");
    return res.data;

  } catch (error) {
    console.log("Get Tasks Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};


// ✅ GET TASK BY ID
export const getTaskById = async (id) => {
  try {
    if (!id) {
      throw new Error("Task ID is required");
    }

    const res = await API.get(`/task/${id}`);
    return res.data;

  } catch (error) {
    console.log("Get Task Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};


// ✅ UPDATE TASK
export const updateTask = async (id, data) => {
  try {
    if (!id) {
      throw new Error("Task ID is required");
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error("Update data is required");
    }

    const res = await API.put(`/task/${id}`, data);
    return res.data;

  } catch (error) {
    console.log("Update Task Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};


// ✅ DELETE TASK
export const deleteTask = async (id) => {
  try {
    if (!id) {
      throw new Error("Task ID is required");
    }

    const res = await API.delete(`/task/${id}`);
    return res.data;

  } catch (error) {
    console.log("Delete Task Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};