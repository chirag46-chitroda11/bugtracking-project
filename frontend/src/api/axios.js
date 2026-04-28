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
  
  // Only add token if it exists AND the request hasn't explicitly disabled Authorization
  if (user && user.token && req.headers.Authorization !== false) {
    req.headers.Authorization = `Bearer ${user.token}`;
  } else if (req.headers.Authorization === false) {
    // Clean up the false flag before sending
    delete req.headers.Authorization;
  }
  
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on true 401 Unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;



