import axios from "axios";

const baseURL = import.meta.env.PROD 
  ? "https://fixify-backend-1wfo.onrender.com" 
  : "http://localhost:5000";

const API = axios.create({
  baseURL,
  withCredentials: true // needed if your backend expects cookies/cors credentials
});

// Automatically add token to every request
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

export default API;



