import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { Users, PlusCircle, Edit, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useConfirm } from "../../context/ConfirmContext";

const PMUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const confirm = useConfirm();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/user/users");
        setUsers(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  const handleApprove = async (id) => {
    if (await confirm({ title: "Approve User", message: "Approve this tester request?" })) {
      try {
        await API.put(`/user/users/approve/${id}`);
        setUsers(users.map(u => u._id === id ? { ...u, status: "approved" } : u));
        toast.success("User Approved!");
      } catch (err) {
        toast.error("Failed to approve user");
      }
    }
  };

  const handleReject = async (id) => {
    if (await confirm({ title: "Reject User", message: "Reject this tester request?" })) {
      try {
        await API.put(`/user/users/reject/${id}`);
        setUsers(users.map(u => u._id === id ? { ...u, status: "rejected" } : u));
        toast.success("User Rejected!");
      } catch (err) {
        toast.error("Failed to reject user");
      }
    }
  };

  const handleDelete = async (id) => {
    if (await confirm({ title: "Delete User", message: "Are you sure you want to remove this user from the system?" })) {
      try {
        await API.delete(`/user/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
        toast.success("User Deleted!");
      } catch (err) {
        toast.error("Failed to delete user");
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Users size={24} className="text-indigo-600" /> User Management
          </h2>
          <p className="text-slate-500 font-semibold text-sm">Manage user access and approve pending tester requests.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
           <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 focus:border-indigo-400 outline-none transition-all font-semibold text-slate-700 placeholder-slate-400 text-sm"/>
        </div>
      </div>

      {/* Pending Requests Section */}
      {users.filter(u => u.status === "pending").length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span> Pending Requests
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.filter(u => u.status === "pending").map(u => (
              <div key={u._id} className="glass-card p-5 text-center flex flex-col items-center group border border-amber-200">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-xl font-bold text-amber-600 mb-3 border-4 border-white shadow-sm overflow-hidden">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-slate-800 truncate w-full">{u.name}</h3>
                <p className="text-xs text-slate-500 font-semibold mb-3 truncate w-full">{u.email}</p>
                <p className="text-[10px] text-slate-400 font-bold mb-4">Reg: {new Date(u.createdAt).toLocaleDateString()}</p>
                <div className="w-full flex gap-2 pt-4 mt-auto">
                  <button className="btn-action flex-1 justify-center py-1.5 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleApprove(u._id)}>Approve</button>
                  <button className="btn-action danger flex-1 justify-center py-1.5 text-xs" onClick={() => handleReject(u._id)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Users Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Users size={20} className="text-indigo-600"/> All Users
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {users
            .filter(u => u.status !== "pending")
            .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.role.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(u => (
            <div key={u._id} className="glass-card p-5 text-center flex flex-col items-center group">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600 mb-3 border-4 border-white shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                {u.profilePicture ? <img src={u.profilePicture} alt={u.name} className="w-full h-full object-cover"/> : u.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-slate-800 truncate w-full">{u.name}</h3>
              <p className="text-xs text-slate-500 font-semibold mb-3 truncate w-full">{u.email}</p>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase mb-4">{u.role.replace('_',' ')}</span>
              <div className="w-full flex gap-2 border-t border-slate-100 pt-4 mt-auto">
                <button onClick={() => navigate(`/edit-user/${u._id}`)} className="btn-action flex-1 justify-center py-1.5 text-xs"><Edit size={14} className="mr-1"/> Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PMUsers;
