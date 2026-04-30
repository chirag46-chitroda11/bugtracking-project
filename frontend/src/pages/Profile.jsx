import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useConfirm } from "../context/ConfirmContext";
import { SkeletonForm, SkeletonParticles } from "../components/skeleton";

const Profile = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    state: "",
    city: "",
    state: "",
    city: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profilePicture: ""
  });

  const [toast, setToast] = useState({ show: false, msg: "", isError: false });

  const triggerToast = (msg, isError = false) => {
    setToast({ show: true, msg, isError });
    setTimeout(() => setToast({ show: false, msg: "", isError: false }), 3000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser._id) {
          navigate("/login");
          return;
        }

        const res = await API.get(`/user/users/${storedUser._id}`);
        const userData = res.data.data;
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          country: userData.country || "",
          state: userData.state || "",
          city: userData.city || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          profilePicture: userData.profilePicture || ""
        });
      } catch (err) {
        triggerToast("Failed to load profile data", true);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerToast("Image size must be less than 2MB", true);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        profilePicture: formData.profilePicture,
      };

      const res = await API.put(`/user/users/profile/${user._id}`, payload);

      // Update local storage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({ ...storedUser, ...res.data.data }));

      setUser(res.data.data);
      triggerToast("Profile updated successfully! 🎉");
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to update profile", true);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      triggerToast("Please fill in all password fields", true);
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      triggerToast("New passwords do not match!", true);
      return;
    }
    if (formData.newPassword.length < 6) {
      triggerToast("New password must be at least 6 characters", true);
      return;
    }
    try {
      await API.put("/user/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      triggerToast("Password changed successfully! 🔐");
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to change password", true);
    }
  };

  const handleDeleteAccount = async () => {
    if (!(await confirm({ title: "Delete Account", message: "Are you SURE you want to delete your account? This action cannot be undone and you will lose all access immediately." }))) return;

    try {
      await API.delete(`/user/users/${user._id}`);
      localStorage.removeItem("user");
      triggerToast("Account deleted successfully");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      triggerToast("Failed to delete account", true);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#ccd6ff] p-6 md:p-10" style={{ position: 'relative' }}>
      <SkeletonParticles count={6} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
        <SkeletonForm fields={6} />
      </div>
    </div>
  );

  return (
    <div className="profile-wrapper relative overflow-x-hidden p-6 md:p-10 min-h-screen text-slate-800 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .profile-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; background: #ccd6ff; }
        .bg-circle { position: absolute; border: 15px solid rgba(79, 70, 229, 0.05); border-radius: 50%; pointer-events: none; z-index: 0; }
        .c1 { width: 600px; height: 600px; top: -150px; right: -150px; animation: float 15s infinite; }
        .c2 { width: 400px; height: 400px; bottom: 100px; left: -100px; animation: float 10s infinite reverse; }
        @keyframes float { 50% { transform: translateY(-30px) scale(1.05); } }
        
        .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05); border-radius: 28px; z-index: 10; position: relative; }
        .glass-card { background: rgba(255, 255, 255, 0.9); border-radius: 20px; border: 1px solid #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        
        .btn-primary { background: #121212; color: #fff; padding: 0.7rem 1.4rem; border-radius: 14px; font-weight: 700; font-size: 0.95rem; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
        .btn-primary:hover { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25); }
        .btn-secondary { background: #fff; color: #1e293b; border: 1px solid #e2e8f0; padding: 0.7rem 1.4rem; border-radius: 14px; font-weight: 700; font-size: 0.95rem; transition: 0.2s; cursor: pointer; }
        .btn-secondary:hover { border-color: #4f46e5; color: #4f46e5; background: #f8fafc; }
        .btn-danger { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 0.7rem 1.4rem; border-radius: 14px; font-weight: 700; font-size: 0.95rem; transition: 0.2s; cursor: pointer; }
        .btn-danger:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
        
        .custom-input { width: 100%; padding: 0.8rem 1.2rem; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-family: inherit; font-size: 0.95rem; color: #334155; transition: 0.3s; outline: none; }
        .custom-input:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        .input-label { display: block; font-size: 0.85rem; font-weight: 700; color: #64748b; margin-bottom: 0.5rem; }
        
        .toast-box { position: fixed; top: 20px; right: 20px; padding: 1rem 2rem; border-radius: 12px; color: #fff; font-weight: 700; z-index: 1000; transform: translateX(150%); transition: 0.4s; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
        .toast-box.show { transform: translateX(0); }
      `}</style>

      <div className="bg-circle c1"></div>
      <div className="bg-circle c2"></div>

      <div className={`toast-box ${toast.show ? 'show' : ''}`} style={{ background: toast.isError ? '#ef4444' : '#10b981' }}>
        {toast.msg}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">

        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:shadow-md transition">
            ←
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-950 tracking-tight">Account Settings</h1>
            <p className="text-slate-500 font-semibold mt-1">Manage your professional profile and preferences</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* PROFILE HEADER CARD */}
          <div className="glass-panel p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-indigo-50 flex items-center justify-center">
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-bold text-indigo-200">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-indigo-700 transition transform hover:scale-110">
                <span className="text-xl">📷</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-black text-slate-800">{user.name}</h2>
              <div className="mt-2 inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-sm font-bold tracking-wide capitalize">
                {user.role.replace('_', ' ')}
              </div>
              <p className="text-slate-500 font-medium mt-3">Upload a new avatar. Larger images will be resized automatically. Maximum upload size is 2MB.</p>
            </div>
          </div>

          {/* BASIC INFORMATION CARD */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="input-label">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="custom-input" placeholder="Your full name" />
              </div>

              <div>
                <label className="input-label">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="custom-input" placeholder="your.email@example.com" />
              </div>

              <div>
                <label className="input-label">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="custom-input" placeholder="e.g. United States" />
              </div>

              <div>
                <label className="input-label">State/Province</label>
                <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="custom-input" placeholder="e.g. California" />
              </div>

              <div>
                <label className="input-label">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="custom-input" placeholder="e.g. New York" />
              </div>
            </div>

            {/* ACCOUNT ACTIONS CARD FOR PROFILE */}
            <div className="flex justify-end gap-3 mt-8">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Profile Changes
              </button>
            </div>
          </div>
        </form>

        {/* SECURITY CARD (SEPARATE FORM) */}
        <form onSubmit={handlePasswordSubmit} className="mt-6">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="input-label">Current Password</label>
                <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} className="custom-input" placeholder="Current password" />
              </div>
              <div>
                <label className="input-label">New Password</label>
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} className="custom-input" placeholder="New password" />
              </div>
              <div>
                <label className="input-label">Confirm New Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="custom-input" placeholder="Confirm new password" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary">Update Password</button>
            </div>
          </div>
        </form>

        {/* DANGER ZONE CARD */}
        <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Danger Zone</h3>
            <p className="text-sm text-slate-500">Permanently delete your account and all related data.</p>
          </div>
          <button type="button" onClick={handleDeleteAccount} className="btn-danger w-full md:w-auto">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
