import API from "../api/axios";

// Get logged-in user info from localStorage
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const getNotifications = async () => {
  const user = getUser();
  const params = {};
  if (user?.role) params.role = user.role;
  if (user?._id) params.userId = user._id;
  
  const res = await API.get("/notification", { params });
  return res.data;
};

export const markAsRead = async (id) => {
  const user = getUser();
  const res = await API.patch(`/notification/read/${id}`, null, {
    params: { userId: user?._id }
  });
  return res.data;
};

export const markAllAsRead = async () => {
  const user = getUser();
  const params = {};
  if (user?.role) params.role = user.role;
  if (user?._id) params.userId = user._id;
  
  const res = await API.patch("/notification/read-all", null, { params });
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await API.delete(`/notification/${id}`);
  return res.data;
};
