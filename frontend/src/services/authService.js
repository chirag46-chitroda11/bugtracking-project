import API from "../api/axios";

//for regiter new user 
export const registerUser = (data) => {
  return API.post("/user/register", data);
};


//for login the existing user 
export const loginUser = (data) => {
  return API.post("/user/login", data);
};