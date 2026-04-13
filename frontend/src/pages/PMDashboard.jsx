import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PMDashboard = () => {
  const navigate = useNavigate();

  // ✅ Auth Safety Check
  const user = JSON.parse(localStorage.getItem("user"));
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // UI State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);

  // Data State
  const [projects, setProjects] = useState([
    { id: 1, name: "E-Commerce Platform", desc: "Full stack online store with payment integration", progress: 65, tasks: 12, bugs: 4, status: "Active" },
    { id: 2, name: "HR Management System", desc: "Internal portal for payroll and employee tracking", progress: 30, tasks: 8, bugs: 2, status: "Planning" },
  ]);

  const [tasks] = useState([
    { id: "T1", title: "JWT Auth Blacklist", status: "In Progress", priority: "High", assignedTo: "Alex Dev", project: "E-Commerce" },
    { id: "T2", title: "Stripe Webhook Fix", status: "Testing", priority: "Critical", assignedTo: "Jordan Dev", project: "E-Commerce" },
  ]);

  const [newProject, setNewProject] = useState({ name: "", desc: "" });

  // ✅ Logout Logic
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ✅ Project Creation Logic
  const handleAddProject = () => {
    if (!newProject.name) return;
    setProjects([
      ...projects,
      { id: Date.now(), ...newProject, progress: 0, tasks: 0, bugs: 0, status: "Active" },
    ]);
    setShowProjectModal(false);
    setNewProject({ name: "", desc: "" });
  };

  if (!user) return null;

  return (
    <div style={styles.appContainer}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>BF <span>BugFlow PM</span></div>
        <div style={styles.navGroup}>
          <NavItem active={activeTab === "dashboard"} icon="📊" label="Dashboard" onClick={() => setActiveTab("dashboard")} />
          <NavItem active={activeTab === "projects"} icon="📁" label="Projects" onClick={() => setActiveTab("projects")} badge={projects.length} />
          <NavItem active={activeTab === "tasks"} icon="✅" label="Global Tasks" onClick={() => setActiveTab("tasks")} />
          <NavItem active={activeTab === "bugs"} icon="🐛" label="Bug Reports" onClick={() => setActiveTab("bugs")} />
          <NavItem active={activeTab === "team"} icon="👥" label="Team" onClick={() => setActiveTab("team")} />
        </div>
        <div style={styles.sidebarFooter}>
          <div style={styles.userBadge}>
            <div style={styles.avatar}>PM</div>
            <span style={styles.userName}>{user.name}</span>
          </div>
          <button style={styles.btnSignOut} onClick={() => setShowLogoutWarning(true)}>Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.mainArea}>
        <header style={styles.header}>
          <h1 style={{ fontSize: "28px", fontWeight: 800 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <p style={{ color: "#888" }}>Project Manager Overview</p>
        </header>

        {/* DASHBOARD VIEW */}
        {activeTab === "dashboard" && (
          <div style={styles.dashboardLayout}>
            <div style={styles.statsRow}>
              <StatCard title="Active Projects" value={projects.length} color="#007bff" />
              <StatCard title="Total Tasks" value={tasks.length} color="#28a745" />
              <StatCard title="Open Bugs" value="6" color="#ff4747" />
            </div>

            <div style={styles.whiteCard}>
              <h3 style={styles.cardHeader}>Recent Project Updates</h3>
              <div style={{ padding: "20px" }}>
                {projects.map(p => (
                  <div key={p.id} style={styles.projectStrip}>
                    <span><b>{p.name}</b> is at {p.progress}% completion</span>
                    <span style={styles.badge}>{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROJECTS VIEW */}
        {activeTab === "projects" && (
          <div style={styles.projectGridContainer}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
              <button style={styles.btnPrimary} onClick={() => setShowProjectModal(true)}>+ New Project</button>
            </div>
            <div style={styles.projectGrid}>
              {projects.map(p => (
                <div key={p.id} style={styles.projectCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <h3 style={{ margin: 0 }}>{p.name}</h3>
                    <span style={styles.badge}>{p.status}</span>
                  </div>
                  <p style={{ fontSize: "14px", color: "#666", minHeight: "40px" }}>{p.desc}</p>
                  <div style={styles.progressBarBg}>
                    <div style={{ ...styles.progressBarFill, width: `${p.progress}%` }}></div>
                  </div>
                  <div style={styles.projectMeta}>
                    <span>Tasks: <b>{p.tasks}</b></span>
                    <span>Bugs: <b>{p.bugs}</b></span>
                    <span><b>{p.progress}%</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TASKS VIEW */}
        {activeTab === "tasks" && (
          <div style={styles.whiteCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}><th>Task</th><th>Project</th><th>Assigned To</th><th>Status</th><th>Priority</th></tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id} style={styles.tr}>
                    <td style={{ fontWeight: 700 }}>{t.title}</td>
                    <td style={{ color: "#666" }}>{t.project}</td>
                    <td>{t.assignedTo}</td>
                    <td><span style={styles.badge}>{t.status}</span></td>
                    <td style={{ color: t.priority === "Critical" ? "#ff4747" : "#333", fontWeight: 700 }}>{t.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODALS */}
      {showProjectModal && (
        <div style={styles.overlay}>
          <div style={styles.modalBox}>
            <h3 style={{ marginBottom: "20px" }}>Initialize New Project</h3>
            <input 
                style={styles.input} 
                placeholder="Project Name" 
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
            />
            <textarea 
                style={{...styles.input, height: "100px", resize: "none"}} 
                placeholder="Description" 
                value={newProject.desc}
                onChange={(e) => setNewProject({...newProject, desc: e.target.value})}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button style={styles.btnPrimary} onClick={handleAddProject}>Create Project</button>
              <button style={styles.btnCancel} onClick={() => setShowProjectModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showLogoutWarning && (
        <div style={styles.overlay}>
          <div style={styles.modalBox}>
            <h3 style={{ marginBottom: "15px" }}>Sign Out</h3>
            <p style={{ color: "#666", marginBottom: "25px" }}>Confirm sign out of the PM Dashboard?</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button style={styles.btnDanger} onClick={handleLogout}>Confirm Logout</button>
              <button style={styles.btnCancel} onClick={() => setShowLogoutWarning(false)}>Go Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// UI HELPERS
const NavItem = ({ active, icon, label, onClick, badge }) => (
  <div style={active ? styles.navActive : styles.navItem} onClick={onClick}>
    <span style={{ marginRight: "12px" }}>{icon}</span> {label}
    {badge !== undefined && <span style={styles.navBadge}>{badge}</span>}
  </div>
);

const StatCard = ({ title, value, color }) => (
  <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
    <h3 style={{ fontSize: "24px", margin: "0 0 5px 0" }}>{value}</h3>
    <p style={{ fontSize: "12px", color: "#888", fontWeight: 700, textTransform: "uppercase" }}>{title}</p>
  </div>
);

// FIXIFY THEME STYLES
const styles = {
  appContainer: { display: "flex", height: "100vh", backgroundColor: "#f8f9fa", fontFamily: "'Syne', sans-serif" },
  sidebar: { width: "260px", backgroundColor: "#fff", borderRight: "1px solid #eee", display: "flex", flexDirection: "column" },
  logo: { padding: "30px", fontSize: "22px", fontWeight: 800 },
  navGroup: { padding: "20px 0", flex: 1 },
  navItem: { padding: "15px 30px", cursor: "pointer", color: "#888", fontWeight: 600, display: "flex", alignItems: "center" },
  navActive: { padding: "15px 30px", cursor: "pointer", color: "#000", fontWeight: 700, backgroundColor: "#f0f2f5", borderRight: "4px solid #d4ff00" },
  navBadge: { marginLeft: "auto", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", backgroundColor: "#d4ff00", color: "#000", fontWeight: 700 },
  sidebarFooter: { padding: "20px", borderTop: "1px solid #f5f5f5" },
  userBadge: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" },
  avatar: { width: "35px", height: "35px", borderRadius: "50%", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px" },
  userName: { fontWeight: 700, fontSize: "14px" },
  btnSignOut: { width: "100%", padding: "10px", border: "1px solid #ff4747", color: "#ff4747", background: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
  mainArea: { flex: 1, padding: "40px", overflowY: "auto" },
  header: { marginBottom: "40px" },
  dashboardLayout: { display: "flex", flexDirection: "column", gap: "30px" },
  statsRow: { display: "flex", gap: "20px" },
  statCard: { flex: 1, background: "#fff", padding: "25px", borderRadius: "15px", border: "1px solid #eee" },
  whiteCard: { background: "#fff", borderRadius: "15px", border: "1px solid #eee", overflow: "hidden" },
  cardHeader: { padding: "20px", fontWeight: 800, borderBottom: "1px solid #f5f5f5", display: "block" },
  projectStrip: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f9f9f9" },
  projectGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" },
  projectCard: { background: "#fff", padding: "20px", borderRadius: "15px", border: "1px solid #eee" },
  progressBarBg: { height: "8px", background: "#f0f0f0", borderRadius: "10px", margin: "15px 0", overflow: "hidden" },
  progressBarFill: { height: "100%", background: "#d4ff00" },
  projectMeta: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#666" },
  badge: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, background: "#e7f3ff", color: "#007bff" },
  table: { width: "100%", borderCollapse: "collapse" },
  thRow: { textAlign: "left", background: "#fafafa", color: "#aaa", fontSize: "12px", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #f8f8f8" },
  input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "10px", fontFamily: "inherit" },
  btnPrimary: { background: "#000", color: "#fff", border: "none", padding: "12px 25px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
  btnDanger: { background: "#ff4747", color: "#fff", border: "none", padding: "12px 25px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
  btnCancel: { background: "#eee", border: "none", padding: "12px 25px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
  modalBox: { backgroundColor: "#fff", padding: "40px", borderRadius: "20px", width: "450px" },
};

export default PMDashboard;