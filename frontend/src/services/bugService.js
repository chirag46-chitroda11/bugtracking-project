import API from "../api/axios";

// CREATE
export const createBug = async (bugData) => {
  try {
    const res = await API.post("/bug", bugData);
    return res.data;
  } catch (error) {
    console.log("Create Bug Error:", error);
    throw error;
  }
};

// GET ALL BUGS
export const getBugs = async () => {
  try {
    const res = await API.get("/bug");
    return res.data;
  } catch (error) {
    console.log("Get Bugs Error:", error);
    throw error;
  }
};

// ✅ ADMIN DASHBOARD
export const getAdminDashboard = async () => {
  try {
    const res = await API.get("/bug/admin/dashboard");
    return res.data;
  } catch (error) {
    console.log("Admin Dashboard Error:", error);
    throw error;
  }
};

// DELETE
export const deleteBug = async (id) => {
  return API.delete(`/bug/${id}`);
};

// UPDATE
export const updateBug = async (id, data) => {
  return API.put(`/bug/${id}`, data);
};