import { createCookieSessionStorage } from "react-router-dom";
import API from "../api/axios";

export const createProject = async (projectData) => {
  try {
    const res = await API.post("/project", projectData);
    return res.data;
  } catch (error) {
    console.log("Create Project Error:", error);
    throw error;
  }
};



export const getProjects = async () => {
  try {
    const res = await API.get("/project"); // ✅ correct endpoint
    return res.data;
  } catch (error) {
    console.log("Get Projects Error:", error);
    throw error;
  }
};

export const deleteProject = async (id) => {
  try {
    const res = await API.delete(`/project/${id}`);
    return res.data;
  } catch (error) {
    console.log("Delete Project Error:", error);
    throw error;
  }
};

export const updateProject = async (id, data) => {
  try {
    const res = await API.put(`/project/${id}`, data);
    return res.data;
  } catch (error) {
    console.log("Update Project Error:", error);
    throw error;
  }
};

