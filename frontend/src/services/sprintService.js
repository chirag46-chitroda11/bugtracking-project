import API from "../api/axios";

// ================= CREATE =================
export const createSprint = async (data) => {
  try {
    const res = await API.post("/sprint", data);
    return res.data;
  } catch (error) {
    console.error("Create Sprint Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// ================= GET ALL =================
export const getSprints = async () => {
  try {
    const res = await API.get("/sprint");
    return res.data;
  } catch (error) {
    console.error("Get Sprints Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// ================= GET BY ID =================
export const getSprintById = async (id) => {
  try {
    const res = await API.get(`/sprint/${id}`);
    return res.data;
  } catch (error) {
    console.error("Get Sprint By ID Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// ================= UPDATE =================
export const updateSprint = async (id, data) => {
  try {
    const res = await API.put(`/sprint/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("Update Sprint Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// ================= DELETE =================
export const deleteSprint = async (id) => {
  try {
    const res = await API.delete(`/sprint/${id}`);
    return res.data;
  } catch (error) {
    console.error("Delete Sprint Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};
export const assignTaskToSprint = (data) =>
  API.post("/sprint/assign-task", data);