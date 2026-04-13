import API from "../api/axios";

export const createModule = async (data) => {
  try {
    const res = await API.post("/module", data);
    return res.data;
  } catch (error) {
    console.log("Create Module Error:", error);
    throw error;
  }
};

export const getModules = async () => {
  const res = await API.get("/module");
  return res.data;
};

export const getModulesByProject = async (projectId) => {
  const res = await API.get(`/module/project/${projectId}`);
  return res.data;
};



// ✅ DELETE MODULE
export const deleteModule = async (id) => {
  try {
    if (!id) {
      throw new Error("Module ID is required");
    }

    const res = await API.delete(`/module/${id}`);
    return res.data;

  } catch (error) {
    console.log("Delete Module Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// ✅ UPDATE MODULE
export const updateModule = async (id, data) => {
  try {
    if (!id) {
      throw new Error("Module ID is required");
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error("Update data is required");
    }

    const res = await API.put(`/module/${id}`, data);
    return res.data;

  } catch (error) {
    console.log("Update Module Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};