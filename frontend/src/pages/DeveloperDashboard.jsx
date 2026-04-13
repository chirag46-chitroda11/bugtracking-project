import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DeveloperDashboard = () => {
  const navigate = useNavigate();

  // ✅ Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Safety check (prevents white screen)
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  // ✅ Tasks & Bugs Data
  const [tasks] = useState([
    { id: 1, title: "JWT Auth Blacklist", status: "In Progress", priority: "High", project: "E-Commerce" },
    { id: 2, title: "Stripe Webhook Fix", status: "Testing", priority: "Critical", project: "E-Commerce" },
  ]);

  const [bugs] = useState([
    { id: "B1", title: "Token not invalidated", severity: "High", status: "Open" },
    { id: "B2", title: "Double Charge Issue", severity: "Critical", status: "Open" },
  ]);

  // ⏱ Timer Logic
  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (s) => {
    const hrs = Math.floor(s / 3600).toString().padStart(2, "0");
    const mins = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return <div style={styles.loading}>Redirecting...</div>;

  return (
    <div style={styles.appContainer}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>BF <span>BugFlow</span></div>
        <div style={styles.navGroup}>
          <NavItem active={activeTab === "dashboard"} icon="📊" label="Dashboard" onClick={() => setActiveTab("dashboard")} />
          <NavItem active={activeTab === "tasks"} icon="✅" label="My Tasks" onClick={() => setActiveTab("tasks")} badge={tasks.length} />
          <NavItem active={activeTab === "bugs"} icon="🐛" label="My Bugs" onClick={() => setActiveTab("bugs")} badge={bugs.length} badgeColor="#ff4747" />
        </div>
        <div style={styles.sidebarFooter}>
          <div style={styles.userBadge}>
            <div style={styles.avatar}>{user?.name?.charAt(0) || "D"}</div>
            <span style={styles.userName}>{user?.name || "Developer"}</span>
          </div>
          <button style={styles.btnSignOut} onClick={() => setShowLogoutWarning(true)}>Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.mainArea}>
        <header style={styles.header}>
          <h1 style={{ fontSize: "28px", fontWeight: 800 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <p style={{ color: "#888" }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </header>

        {/* DASHBOARD VIEW */}
        {activeTab === "dashboard" && (
          <div style={styles.dashboardLayout}>
            <div style={styles.statsRow}>
              <StatCard title="Active Tasks" value={tasks.length} color="#007bff" />
              <StatCard title="Open Bugs" value={bugs.length} color="#ff4747" />
              <StatCard title="Hours Logged" value={(seconds / 3600).toFixed(1) + "h"} color="#28a745" />
            </div>

            <div style={styles.timerCard}>
              <h3 style={styles.cardTitle}>Focus Timer</h3>
              {!selectedTask ? (
                <div style={styles.warningBox}>⚠️ Select a task from the "My Tasks" tab to start tracking time</div>
              ) : (
                <p style={{ color: "#666", fontSize: "14px" }}>Tracking: <b>{selectedTask.title}</b></p>
              )}
              <div style={styles.timerDisplay}>{formatTime(seconds)}</div>
              <div style={styles.timerControls}>
                <button 
                  style={running ? styles.btnPause : styles.btnStart} 
                  onClick={() => setRunning(!running)}
                  disabled={!selectedTask}
                >
                  {running ? "Pause Session" : "Start Session"}
                </button>
                <button style={styles.btnReset} onClick={() => { setSeconds(0); setRunning(false); }}>Reset</button>
              </div>
            </div>
          </div>
        )}

        {/* TASKS VIEW */}
        {activeTab === "tasks" && (
          <div style={styles.whiteCard}>
            <h3 style={styles.cardTitle}>Your Assignments</h3>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Action</th></tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id} style={{...styles.tr, backgroundColor: selectedTask?.id === t.id ? "#f0f7ff" : "transparent"}}>
                    <td style={{fontWeight: 700}}>{t.title}</td>
                    <td>{t.project}</td>
                    <td><span style={styles.badge}>{t.status}</span></td>
                    <td style={{color: t.priority === "Critical" ? "#ff4747" : "#333", fontWeight: 700}}>{t.priority}</td>
                    <td>
                      <button style={styles.btnSelect} onClick={() => { setSelectedTask(t); setActiveTab("dashboard"); }}>Select for Timer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BUGS VIEW */}
        {activeTab === "bugs" && (
          <div style={styles.whiteCard}>
            <h3 style={styles.cardTitle}>Assigned Bugs</h3>
            {bugs.length === 0 ? <p style={{padding: "20px"}}>No Bugs 🎉</p> : (
              <table style={styles.table}>
                <thead><tr style={styles.thRow}><th>Bug ID</th><th>Issue</th><th>Severity</th><th>Status</th></tr></thead>
                <tbody>
                  {bugs.map(b => (
                    <tr key={b.id} style={styles.tr}>
                      <td style={{fontFamily: "Space Mono"}}>{b.id}</td>
                      <td style={{fontWeight: 600}}>{b.title}</td>
                      <td><span style={{color: b.severity === "Critical" ? "red" : "orange", fontWeight: 800}}>{b.severity}</span></td>
                      <td><span style={{...styles.badge, background: "#fff3cd", color: "#856404"}}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* LOGOUT MODAL */}
      {showLogoutWarning && (
        <div style={styles.overlay}>
          <div style={styles.modalBox}>
            <h3 style={{marginBottom: "15px"}}>Sign Out</h3>
            <p style={{color: "#666", marginBottom: "25px"}}>Are you sure you want to log out? Any active timer progress will be lost.</p>
            <div style={{display: "flex", gap: "10px", justifyContent: "center"}}>
              <button style={styles.btnConfirmLogout} onClick={handleLogout}>Logout</button>
              <button style={styles.btnCancel} onClick={() => setShowLogoutWarning(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// UI HELPER COMPONENTS
const NavItem = ({ active, icon, label, onClick, badge, badgeColor }) => (
  <div style={active ? styles.navActive : styles.navItem} onClick={onClick}>
    <span style={{marginRight: "12px"}}>{icon}</span> {label}
    {badge !== undefined && <span style={{...styles.navBadge, backgroundColor: badgeColor || "#d4ff00"}}>{badge}</span>}
  </div>
);

const StatCard = ({ title, value, color }) => (
  <div style={{...styles.statCard, borderTop: `4px solid ${color}`}}>
    <h3 style={{fontSize: "24px", margin: "0 0 5px 0"}}>{value}</h3>
    <p style={{fontSize: "12px", color: "#888", fontWeight: 700, textTransform: "uppercase"}}>{title}</p>
  </div>
);

// CSS OBJECT
const styles = {
  appContainer: { display: "flex", height: "100vh", backgroundColor: "#f8f9fa", fontFamily: "'Syne', sans-serif" },
  sidebar: { width: "260px", backgroundColor: "#fff", borderRight: "1px solid #eee", display: "flex", flexDirection: "column" },
  logo: { padding: "30px", fontSize: "22px", fontWeight: 800, letterSpacing: "-1px" },
  navGroup: { padding: "20px 0", flex: 1 },
  navItem: { padding: "15px 30px", cursor: "pointer", color: "#888", fontWeight: 600, display: "flex", alignItems: "center", transition: "0.2s" },
  navActive: { padding: "15px 30px", cursor: "pointer", color: "#000", fontWeight: 700, backgroundColor: "#f0f2f5", borderRight: "4px solid #d4ff00" },
  navBadge: { marginLeft: "auto", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, color: "#000" },
  sidebarFooter: { padding: "20px", borderTop: "1px solid #f5f5f5" },
  userBadge: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" },
  avatar: { width: "35px", height: "35px", borderRadius: "50%", background: "#d4ff00", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 },
  userName: { fontWeight: 700, fontSize: "14px" },
  btnSignOut: { width: "100%", padding: "10px", border: "1px solid #ff4747", color: "#ff4747", background: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
  mainArea: { flex: 1, padding: "40px", overflowY: "auto" },
  header: { marginBottom: "40px" },
  dashboardLayout: { display: "flex", flexDirection: "column", gap: "30px" },
  statsRow: { display: "flex", gap: "20px" },
  statCard: { flex: 1, background: "#fff", padding: "25px", borderRadius: "15px", border: "1px solid #eee" },
  timerCard: { background: "#fff", borderRadius: "20px", padding: "50px", textAlign: "center", border: "1px solid #eee" },
  timerDisplay: { fontSize: "64px", fontWeight: 800, margin: "30px 0", fontFamily: "'Space Mono', monospace" },
  timerControls: { display: "flex", gap: "15px", justifyContent: "center" },
  btnStart: { backgroundColor: "#28a745", color: "#fff", border: "none", padding: "15px 30px", borderRadius: "10px", fontWeight: 700, cursor: "pointer" },
  btnPause: { backgroundColor: "#ffc107", color: "#000", border: "none", padding: "15px 30px", borderRadius: "10px", fontWeight: 700, cursor: "pointer" },
  btnReset: { backgroundColor: "#f0f2f5", color: "#666", border: "none", padding: "15px 30px", borderRadius: "10px", fontWeight: 700, cursor: "pointer" },
  whiteCard: { background: "#fff", borderRadius: "15px", border: "1px solid #eee", overflow: "hidden" },
  cardTitle: { padding: "20px", fontWeight: 800, borderBottom: "1px solid #f5f5f5" },
  table: { width: "100%", borderCollapse: "collapse" },
  thRow: { textAlign: "left", background: "#fafafa", color: "#aaa", fontSize: "12px", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #f8f8f8", cursor: "pointer" },
  badge: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, background: "#e7f3ff", color: "#007bff" },
  btnSelect: { padding: "6px 12px", background: "#000", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
  warningBox: { background: "#fff3cd", color: "#856404", padding: "15px", borderRadius: "10px", margin: "20px 0", fontSize: "14px" },
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
  modalBox: { backgroundColor: "#fff", padding: "40px", borderRadius: "20px", width: "400px", textAlign: "center" },
  btnConfirmLogout: { backgroundColor: "#ff4747", color: "#fff", border: "none", padding: "12px 25px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
  btnCancel: { background: "#eee", border: "none", padding: "12px 25px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
  loading: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: 800 }
};

export default DeveloperDashboard;