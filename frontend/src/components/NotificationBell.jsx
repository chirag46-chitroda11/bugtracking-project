import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Bell, X, Check, CheckCheck, Bug, Layers, Users, Activity, FileText, AlertTriangle, Package, Clock, Zap, Target } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../services/notificationService";
import { getSocket } from "../services/socketService";

const SOCKET_URL = import.meta.env.PROD ? "https://fixify-backend-1wfo.onrender.com" : "http://localhost:5000";

const typeIcons = {
  bug_reported: <Bug size={16} style={{ color: "#ef4444" }} />,
  bug_assigned: <Bug size={16} style={{ color: "#f97316" }} />,
  bug_resolved: <Check size={16} style={{ color: "#10b981" }} />,
  status_changed: <Zap size={16} style={{ color: "#8b5cf6" }} />,
  project_created: <Layers size={16} style={{ color: "#6366f1" }} />,
  project_updated: <Layers size={16} style={{ color: "#4f46e5" }} />,
  module_created: <Package size={16} style={{ color: "#06b6d4" }} />,
  module_updated: <Package size={16} style={{ color: "#0891b2" }} />,
  task_overdue: <Clock size={16} style={{ color: "#f59e0b" }} />,
  task_created: <FileText size={16} style={{ color: "#3b82f6" }} />,
  task_assigned: <Target size={16} style={{ color: "#8b5cf6" }} />,
  task_updated: <FileText size={16} style={{ color: "#2563eb" }} />,
  sprint_created: <Activity size={16} style={{ color: "#06b6d4" }} />,
  sprint_started: <Activity size={16} style={{ color: "#10b981" }} />,
  sprint_completed: <Activity size={16} style={{ color: "#10b981" }} />,
  user_registered: <Users size={16} style={{ color: "#8b5cf6" }} />,
  high_severity_bug: <AlertTriangle size={16} style={{ color: "#dc2626" }} />,
  general: <Bell size={16} style={{ color: "#64748b" }} />,
};

const typeColorMap = {
  bug_reported: { bg: "#fef2f2", border: "#fecaca" },
  bug_assigned: { bg: "#fff7ed", border: "#fed7aa" },
  bug_resolved: { bg: "#ecfdf5", border: "#a7f3d0" },
  status_changed: { bg: "#f5f3ff", border: "#ddd6fe" },
  project_created: { bg: "#eef2ff", border: "#c7d2fe" },
  project_updated: { bg: "#eef2ff", border: "#c7d2fe" },
  module_created: { bg: "#ecfeff", border: "#a5f3fc" },
  module_updated: { bg: "#ecfeff", border: "#a5f3fc" },
  task_overdue: { bg: "#fffbeb", border: "#fde68a" },
  task_created: { bg: "#eff6ff", border: "#bfdbfe" },
  task_assigned: { bg: "#f5f3ff", border: "#ddd6fe" },
  task_updated: { bg: "#eff6ff", border: "#bfdbfe" },
  sprint_created: { bg: "#ecfeff", border: "#a5f3fc" },
  sprint_started: { bg: "#ecfdf5", border: "#a7f3d0" },
  sprint_completed: { bg: "#ecfdf5", border: "#a7f3d0" },
  user_registered: { bg: "#f5f3ff", border: "#ddd6fe" },
  high_severity_bug: { bg: "#fef2f2", border: "#fca5a5" },
  general: { bg: "#f8fafc", border: "#e2e8f0" },
};

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    const d = new Date(date);
    const ampm = d.getHours() >= 12 ? "PM" : "AM";
    const h = d.getHours() % 12 || 12;
    const m = d.getMinutes().toString().padStart(2, "0");
    return `Today ${h}:${m} ${ampm}`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ========== GLOBAL STYLES (injected once) ========== */
const STYLE_ID = "notif-bell-global-styles";
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .notif-bell-wrapper { position: relative; display: inline-flex; }
    .notif-bell-btn {
      position: relative; width: 42px; height: 42px; border-radius: 14px;
      background: rgba(255,255,255,0.7); backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.9); display: flex; align-items: center;
      justify-content: center; cursor: pointer; transition: all 0.3s;
      box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    }
    .notif-bell-btn:hover { background: #fff; transform: translateY(-1px); box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
    .notif-bell-btn .bell-icon { color: #64748b; transition: 0.3s; }
    .notif-bell-btn:hover .bell-icon { color: #4f46e5; }
    
    .notif-badge {
      position: absolute; top: -4px; right: -4px; min-width: 20px; height: 20px;
      background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;
      font-size: 11px; font-weight: 800; border-radius: 10px; display: flex;
      align-items: center; justify-content: center; padding: 0 5px;
      border: 2px solid #fff; animation: notifBadgePulse 2s infinite;
      box-shadow: 0 2px 8px rgba(239,68,68,0.4);
    }
    @keyframes notifBadgePulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    /* ===== PORTAL OVERLAY ===== */
    .notif-portal-overlay {
      position: fixed; inset: 0; z-index: 999998;
      background: rgba(15, 23, 42, 0.15);
      backdrop-filter: blur(2px);
      animation: notifOverlayIn 0.2s ease;
    }
    @keyframes notifOverlayIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* ===== PORTAL DROPDOWN ===== */
    .notif-portal-dropdown {
      position: fixed;
      width: 400px; max-height: 520px;
      background: #fff;
      border-radius: 20px;
      border: 1px solid rgba(226,232,240,0.8);
      box-shadow: 0 25px 70px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.08);
      z-index: 999999;
      overflow: hidden;
      animation: notifDropIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
    }
    @keyframes notifDropIn {
      from { opacity: 0; transform: translateY(-10px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .notif-dropdown-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 18px 20px; border-bottom: 1px solid #f1f5f9;
      flex-shrink: 0; background: #fff; border-radius: 20px 20px 0 0;
    }
    .notif-dropdown-header h4 {
      font-weight: 800; font-size: 0.95rem; color: #1e293b; margin: 0;
      letter-spacing: -0.01em;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    }
    .notif-mark-all {
      font-size: 0.75rem; font-weight: 700; color: #4f46e5; cursor: pointer;
      background: #eef2ff; border: none; padding: 6px 14px; border-radius: 8px;
      transition: 0.2s; display: flex; align-items: center; gap: 4px;
      font-family: inherit;
    }
    .notif-mark-all:hover { background: #4f46e5; color: #fff; }
    
    .notif-list {
      overflow-y: auto; flex: 1; padding: 8px;
      max-height: 440px;
    }
    .notif-list::-webkit-scrollbar { width: 5px; }
    .notif-list::-webkit-scrollbar-track { background: transparent; }
    .notif-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .notif-list::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    
    .notif-item {
      display: flex; gap: 12px; padding: 12px 14px; border-radius: 14px;
      transition: all 0.2s; cursor: pointer; position: relative;
      margin-bottom: 4px; border: 1px solid transparent;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    }
    .notif-item:hover { background: #f8fafc; }
    .notif-item.unread { background: #f0f4ff; border-color: rgba(79,70,229,0.08); }
    .notif-item.unread::before {
      content: ''; position: absolute; left: 6px; top: 50%; transform: translateY(-50%);
      width: 6px; height: 6px; border-radius: 50%; background: #4f46e5;
    }
    
    .notif-icon-wrap {
      width: 38px; height: 38px; border-radius: 12px; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
      border: 1px solid;
    }
    .notif-content { flex: 1; min-width: 0; overflow: hidden; }
    .notif-title {
      font-size: 0.82rem; font-weight: 700; color: #1e293b; margin: 0 0 3px;
      line-height: 1.35; overflow: hidden; text-overflow: ellipsis;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }
    .notif-message {
      font-size: 0.75rem; color: #64748b; font-weight: 500; margin: 0;
      overflow: hidden; text-overflow: ellipsis;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      line-height: 1.4;
    }
    .notif-time {
      font-size: 0.68rem; color: #94a3b8; font-weight: 600; margin-top: 4px; display: block;
    }
    
    .notif-actions {
      display: flex; flex-direction: column; gap: 4px; flex-shrink: 0;
      opacity: 0; transition: 0.2s;
    }
    .notif-item:hover .notif-actions { opacity: 1; }
    .notif-action-btn {
      width: 26px; height: 26px; border-radius: 8px; border: none;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: 0.2s; background: #f1f5f9; color: #64748b;
      font-family: inherit;
    }
    .notif-action-btn:hover { background: #e2e8f0; color: #1e293b; }
    .notif-action-btn.del:hover { background: #fef2f2; color: #ef4444; }

    .notif-empty {
      padding: 48px 20px; text-align: center; color: #94a3b8;
      font-weight: 600; font-size: 0.85rem;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    }

    @media (max-width: 500px) {
      .notif-portal-dropdown { 
        width: calc(100vw - 24px) !important; 
        left: 12px !important;
        right: 12px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

/* ========== COMPONENT ========== */
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Track user from localStorage — re-reads on every render to catch user switches
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });

  // Poll for user changes (handles login/logout/switch in same tab)
  useEffect(() => {
    const checkUser = () => {
      try {
        const current = JSON.parse(localStorage.getItem("user"));
        setUser(prev => {
          if (prev?._id !== current?._id) {
            return current;
          }
          return prev;
        });
      } catch { setUser(null); }
    };
    // Check on storage events (cross-tab) and on interval (same-tab switches)
    window.addEventListener("storage", checkUser);
    const interval = setInterval(checkUser, 1000);
    return () => {
      window.removeEventListener("storage", checkUser);
      clearInterval(interval);
    };
  }, []);

  // Inject global styles once
  useEffect(() => { injectStyles(); }, []);

  // Calculate dropdown position from bell button
  const updateDropdownPosition = useCallback(() => {
    if (!bellRef.current) return;
    const rect = bellRef.current.getBoundingClientRect();
    const dropdownWidth = Math.min(400, window.innerWidth - 24);
    
    // Position below the bell button
    let top = rect.bottom + 12;
    let right = window.innerWidth - rect.right;

    // Make sure it doesn't overflow right
    if (right < 12) right = 12;
    // Make sure dropdown doesn't go off left side
    const left = window.innerWidth - right - dropdownWidth;
    if (left < 12) {
      right = window.innerWidth - dropdownWidth - 12;
    }

    // If below viewport, show above
    if (top + 520 > window.innerHeight) {
      top = Math.max(12, rect.top - 520 - 12);
    }

    setDropdownStyle({ top: `${top}px`, right: `${right}px` });
  }, []);

  // Fetch notifications when user changes — ensures fresh data per user
  useEffect(() => {
    if (!user?._id) {
      setNotifications([]);
      return;
    }
    const fetchNotifs = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data || []);
      } catch (err) {
        console.log("Failed to load notifications:", err);
      }
    };
    fetchNotifs();
  }, [user?._id]);

  // Socket.io — subscribe natively using the singleton
  useEffect(() => {
    if (!user?._id) return;

    const socket = getSocket();

    if (user?.role) socket.emit("join_role", user.role);
    if (user?._id) socket.emit("join_user", user._id);

    const handleNewNotif = (notification) => {
      setNotifications((prev) => {
        if (prev.some(n => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });
    };

    socket.on("new_notification", handleNewNotif);

    return () => { 
      socket.off("new_notification", handleNewNotif); 
    };
  }, [user?._id, user?.role]);

  // Recalc position when opening or on resize/scroll
  useEffect(() => {
    if (open) {
      updateDropdownPosition();
      const handler = () => updateDropdownPosition();
      window.addEventListener("resize", handler);
      window.addEventListener("scroll", handler, true);
      return () => {
        window.removeEventListener("resize", handler);
        window.removeEventListener("scroll", handler, true);
      };
    }
  }, [open, updateDropdownPosition]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.log("Mark read failed:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.log("Mark all read failed:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.log("Delete failed:", err);
    }
  };

  /* ---- Dropdown content rendered via Portal ---- */
  const dropdownPortal = open
    ? createPortal(
        <>
          {/* Overlay - closes on click */}
          <div
            className="notif-portal-overlay"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown panel */}
          <div
            className="notif-portal-dropdown"
            style={dropdownStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notif-dropdown-header">
              <h4>
                Notifications{" "}
                {unreadCount > 0 && (
                  <span style={{ color: "#4f46e5", fontSize: "0.85rem" }}>({unreadCount})</span>
                )}
              </h4>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={handleMarkAllRead}>
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
                <button
                  className="notif-action-btn"
                  onClick={() => setOpen(false)}
                  title="Close"
                  style={{ opacity: 1 }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <Bell
                    size={36}
                    style={{ display: "block", margin: "0 auto 10px", color: "#cbd5e1" }}
                  />
                  <p style={{ margin: "0 0 4px", fontWeight: 800, color: "#64748b" }}>
                    No notifications
                  </p>
                  <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 500 }}>
                    You&apos;re all caught up! 🎉
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const colors = typeColorMap[n.type] || typeColorMap.general;
                  return (
                    <div
                      key={n._id}
                      className={`notif-item ${!n.isRead ? "unread" : ""}`}
                      onClick={() => !n.isRead && handleMarkRead(n._id)}
                    >
                      <div
                        className="notif-icon-wrap"
                        style={{
                          backgroundColor: colors.bg,
                          borderColor: colors.border,
                        }}
                      >
                        {typeIcons[n.type] || typeIcons.general}
                      </div>
                      <div className="notif-content">
                        <p className="notif-title">{n.title}</p>
                        <p className="notif-message">{n.message}</p>
                        <span className="notif-time">{timeAgo(n.createdAt)}</span>
                      </div>
                      <div className="notif-actions">
                        {!n.isRead && (
                          <button
                            className="notif-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkRead(n._id);
                            }}
                            title="Mark as read"
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <button
                          className="notif-action-btn del"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(n._id);
                          }}
                          title="Delete"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <>
      <div className="notif-bell-wrapper">
        <button
          ref={bellRef}
          className="notif-bell-btn"
          onClick={() => setOpen(!open)}
          title="Notifications"
        >
          <Bell size={20} className="bell-icon" />
          {unreadCount > 0 && (
            <span className="notif-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {dropdownPortal}
    </>
  );
};

export default NotificationBell;
