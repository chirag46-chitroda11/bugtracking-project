import API from "../api/axios";

// Submit contact form (Public)
export const submitContactRequest = async (data) => {
  try {
    const res = await API.post("/contact/submit", data);
    return res.data;
  } catch (error) {
    console.error("Submit Contact Error:", error);
    throw error;
  }
};

// Get all requests (Admin)
export const getAllContactRequests = async () => {
  try {
    const res = await API.get("/contact/all");
    return res.data;
  } catch (error) {
    console.error("Get All Requests Error:", error);
    throw error;
  }
};

// Update status (Admin)
export const updateContactRequestStatus = async (id, status) => {
  try {
    const res = await API.patch(`/contact/status/${id}`, { status });
    return res.data;
  } catch (error) {
    console.error("Update Request Status Error:", error);
    throw error;
  }
};

// Delete request (Admin)
export const deleteContactRequest = async (id) => {
  try {
    const res = await API.delete(`/contact/${id}`);
    return res.data;
  } catch (error) {
    console.error("Delete Contact Request Error:", error);
    throw error;
  }
};
