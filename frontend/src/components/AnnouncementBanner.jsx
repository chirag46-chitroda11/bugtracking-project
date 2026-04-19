import React, { useState, useEffect } from "react";
import { Megaphone, X, PlusCircle, Trash2, Send } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useConfirm } from "../context/ConfirmContext";

const AnnouncementBanner = () => {
  const confirm = useConfirm();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");

  const [loggedInUser, setLoggedInUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const canAnnounce = loggedInUser?.role === "admin" || loggedInUser?.role === "pm";

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await API.get("/announcement?limit=5");
      setAnnouncements(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title || !message) return toast.error("Title and Message are required!");
    
    try {
      const res = await API.post("/announcement", { title, message, priority });
      setAnnouncements([res.data.data, ...announcements].slice(0, 5));
      setShowForm(false);
      setTitle("");
      setMessage("");
      setPriority("medium");
      toast.success("Announcement broadcasted successfully! 📢");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post announcement");
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirm({ title: "Delete Announcement", message: "Are you sure you want to delete this announcement globally for all system roles?" }))) return;
    try {
      await API.delete(`/announcement/${id}`);
      setAnnouncements(announcements.filter(a => a._id !== id));
      toast.success("Announcement deleted 🗑️");
    } catch (error) {
      toast.error("Failed to delete ❌");
    }
  };

  if (loading && announcements.length === 0) return null;

  // Don't render anything if there are no announcements and user cannot announce
  if (announcements.length === 0 && !canAnnounce) return null;

  return (
    <div className="glass-card mb-6 border-l-4 border-l-indigo-500 overflow-hidden relative group">
      <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-gradient-to-r from-indigo-50/50 to-transparent">
        
        <div className="flex-1 w-full min-w-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-100">
             <Megaphone className="text-indigo-600 drop-shadow-sm" size={24} />
          </div>
          
          <div className="flex-1 min-w-0 pr-4">
             {announcements.length > 0 ? (
               <div className="relative h-14 overflow-hidden">
                 <div className="animate-carousel">
                    {/* Double mapping for infinite smooth scroll effect if needed, but for now just showing the latest 1 statically, or a scrolling flex if multiple */}
                    {announcements.map((ann, idx) => (
                      <div key={ann._id} className="h-14 flex flex-col justify-center absolute w-full top-0 left-0 transition-opacity duration-500" style={{ opacity: idx === 0 ? 1 : 0, zIndex: idx === 0 ? 10 : 0 }}>
                         <div className="flex items-center gap-2 mb-1">
                           <h3 className="font-black text-slate-800 text-sm sm:text-base truncate">{ann.title}</h3>
                           <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${ann.priority === 'high' ? 'bg-red-100 text-red-600' : ann.priority === 'low' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                             {ann.priority}
                           </span>
                           <span className="text-xs text-slate-400 font-semibold hidden sm:inline-block">• {ann.authorName} ({ann.authorRole})</span>
                         </div>
                         <p className="text-xs sm:text-sm text-slate-600 font-medium truncate w-full pr-8">
                           {ann.message}
                         </p>
                      </div>
                    ))}
                 </div>
               </div>
             ) : (
                <div>
                   <h3 className="font-black text-slate-800">Team Announcements</h3>
                   <p className="text-sm text-slate-500 font-medium">No active announcements at the moment.</p>
                </div>
             )}
          </div>
        </div>

        <div className="flex-shrink-0 flex gap-2 w-full md:w-auto justify-end">
          {canAnnounce && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary !py-2 !px-4 text-sm !bg-indigo-600 hover:!bg-indigo-700 shadow-md shadow-indigo-200">
               {showForm ? <><X size={16}/> Close</> : <><PlusCircle size={16}/> New Announcement</>}
            </button>
          )}
          {canAnnounce && announcements.length > 0 && (
             <button onClick={() => handleDelete(announcements[0]._id)} className="btn-action danger !py-2 !px-3" title="Delete latest">
                <Trash2 size={16}/>
             </button>
          )}
        </div>
      </div>

      {showForm && canAnnounce && (
         <div className="p-5 border-t border-indigo-100 bg-white/60 backdrop-blur-md animate-fade-in">
            <form onSubmit={handlePost} className="space-y-4 max-w-3xl">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Headline</label>
                   <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-semibold text-slate-700 outline-none focus:border-indigo-500" placeholder="E.g., Server Maintenance Tonight"/>
                </div>
                <div className="sm:w-48">
                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Priority</label>
                   <select value={priority} onChange={e=>setPriority(e.target.value)} className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-semibold text-slate-700 outline-none focus:border-indigo-500">
                     <option value="low">Low Info</option>
                     <option value="medium">Medium</option>
                     <option value="high">Critical / High</option>
                   </select>
                </div>
              </div>
              <div>
                 <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Message</label>
                 <textarea value={message} onChange={e=>setMessage(e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-semibold text-slate-700 outline-none focus:border-indigo-500 min-h-[80px]" placeholder="Broadcast details to all dashboards..."></textarea>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary !gap-2"><Send size={16}/> Broadcast Now</button>
              </div>
            </form>
         </div>
      )}
    </div>
  );
};

export default AnnouncementBanner;
