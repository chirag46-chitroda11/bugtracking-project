import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBugs } from "../services/bugService";

const TesterDashboard = () => {
  const navigate = useNavigate();

  // ✅ Auth & User Context
  const user = JSON.parse(localStorage.getItem("user"));
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // UI State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bugs, setBugs] = useState([]);
  const [selectedBug, setSelectedBug] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  
  // New Bug Form State
  const [newBug, setNewBug] = useState({ 
    bugTitle: "", 
    severity: "Medium", 
    description: "",
    module: "" 
  });

  // 🧪 Tasks for Testing
  const [tasks] = useState([
    { id: 1, title: "JWT Authentication", status: "Testing", priority: "High", project: "E-Commerce" },
    { id: 2, title: "Stripe Webhook Fix", status: "Testing", priority: "Critical", project: "E-Commerce" },
  ]);

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      const res = await getBugs();
      setBugs(res.data?.data || res.data || []);
    } catch {
      setBugs([
        { _id: "1", bugTitle: "Token not expiring", severity: "High", status: "draft", reportBy: user?.name || "Tester", createdAt: new Date() },
      ]);
    }
  };

  // ✅ Handlers
  const handleCreateBug = () => {
    if (!newBug.bugTitle) return alert("Please enter a bug title");
    
    const bugToAdd = {
      _id: Date.now().toString(),
      ...newBug,
      status: "draft",
      reportBy: user.name,
      createdAt: new Date()
    };

    setBugs([bugToAdd, ...bugs]);
    setShowBugModal(false);
    setNewBug({ bugTitle: "", severity: "Medium", description: "", module: "" });
  };

  const toggleSubmit = async (id, status) => {
    if (status === "submitted") return;
    if (!window.confirm("Submit this report to the manager?")) return;
    setBugs(bugs.map(b => b._id === id ? { ...b, status: "submitted" } : b));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div style={styles.appContainer}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>BF <span>Tester Hub</span></div>
        <div style={styles.navGroup}>
          <NavItem active={activeTab === "dashboard"} icon="📊" label="Dashboard" onClick={() => setActiveTab("dashboard")} />
          <NavItem active={activeTab === "tasks"} icon="🧪" label="Tasks to Test" onClick={() => setActiveTab("tasks")} badge={tasks.length} />
          <NavItem active={activeTab === "bugs"} icon="🐛" label="Bug Reports" onClick={() => setActiveTab("bugs")} badge={bugs.length} badgeColor="#ff4747" />
        </div>
        <div style={styles.sidebarFooter}>
          <div style={styles.userBadge}>
            <div style={styles.avatar}>{user.name.charAt(0)}</div>
            <div style={{ textAlign: "left" }}>
              <div style={styles.userName}>{user.name}</div>
              <div style={{ fontSize: "11px", color: "#888" }}>{user.role || "Tester"}</div>
            </div>
          </div>
          <button style={styles.btnSignOut} onClick={() => setShowLogout(true)}>Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.mainArea}>
        <header style={styles.header}>
          <h1 style={{ fontSize: "28px", fontWeight: 800 }}>{activeTab.toUpperCase()}</h1>
          {activeTab === "bugs" && (
            <button style={styles.btnPrimary} onClick={() => setShowBugModal(true)}>+ Report Bug</button>
          )}
        </header>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div style={styles.dashboardLayout}>
            <div style={styles.statsRow}>
              <StatCard title="Total Tasks" value={tasks.length} color="#007bff" />
              <StatCard title="Bugs Found" value={bugs.length} color="#ff4747" />
              <StatCard title="Drafts" value={bugs.filter(b => b.status === "draft").length} color="#ffc107" />
            </div>
            <div style={styles.whiteCard}>
              <h3 style={styles.cardHeader}>Recent Activity</h3>
              <div style={{ padding: "20px", color: "#666" }}>
                Welcome back, {user.name}. Check your assigned tasks for validation.
              </div>
            </div>
          </div>
        )}

        {/* BUG LISTING */}
        {activeTab === "bugs" && (
          <div style={styles.bugGrid}>
            {bugs.length === 0 ? <p style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px'}}>No bugs reported yet.</p> : 
              bugs.map((bug) => (
                <div key={bug._id} style={styles.bugCard} onClick={() => setSelectedBug(bug)}>
                  <div style={styles.bugCardHeader}>
                    <span style={bug.status === "draft" ? styles.badgeDraft : styles.badgeSubmitted}>{bug.status}</span>
                    <span style={{ fontSize: "11px", color: "#999" }}>#{bug._id.slice(-5)}</span>
                  </div>
                  <h3 style={{ margin: "10px 0", fontWeight: 800 }}>{bug.bugTitle}</h3>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    <p>Severity: <b>{bug.severity}</b></p>
                  </div>
                  <button 
                    style={bug.status === "draft" ? styles.btnSubmitBug : styles.btnDisabled}
                    disabled={bug.status !== "draft"}
                    onClick={(e) => { e.stopPropagation(); toggleSubmit(bug._id, bug.status); }}
                  >
                    {bug.status === "draft" ? "Submit to Manager" : "Submitted"}
                  </button>
                </div>
              ))
            }
          </div>
        )}
      </main>

      {/* ✅ REPORT BUG MODAL (In-Page Overlay) */}
      {showBugModal && (
        <div style={styles.overlay} onClick={() => setShowBugModal(false)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontWeight: 800, marginBottom: "20px" }}>Report New Bug</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Bug Title</label>
              <input 
                style={styles.input} 
                placeholder="e.g. Login button not responding"
                value={newBug.bugTitle}
                onChange={e => setNewBug({...newBug, bugTitle: e.target.value})}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Severity</label>
              <select 
                style={styles.input}
                value={newBug.severity}
                onChange={e => setNewBug({...newBug, severity: e.target.value})}
              >
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea 
                style={{...styles.input, height: '80px', resize: 'none'}} 
                placeholder="Steps to reproduce the issue..."
                value={newBug.description}
                onChange={e => setNewBug({...newBug, description: e.target.value})}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button style={{...styles.btnPrimary, width: '100%'}} onClick={handleCreateBug}>Create Draft</button>
              <button style={{...styles.btnCancel, marginTop: 0}} onClick={() => setShowBugModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION */}
      {showLogout && (
        <div style={styles.overlay}>
          <div style={styles.modalBox}>
            <h3 style={{ fontWeight: 800 }}>Confirm Logout</h3>
            <p style={{ margin: "10px 0", color: "#666" }}>Are you sure you want to sign out?</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button style={styles.btnDanger} onClick={handleLogout}>Logout</button>
              <button style={styles.btnCancel} onClick={() => setShowLogout(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ... (Sub-components NavItem and StatCard, and styles remain consistent with the high-quality UI previously established)

const NavItem = ({ active, icon, label, onClick, badge, badgeColor }) => (
  <div style={active ? styles.navActive : styles.navItem} onClick={onClick}>
    <span style={{ marginRight: "12px" }}>{icon}</span> {label}
    {badge !== undefined && <span style={{ ...styles.navBadge, backgroundColor: badgeColor || "#d4ff00" }}>{badge}</span>}
  </div>
);

const StatCard = ({ title, value, color }) => (
  <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
    <h3 style={{ fontSize: "24px", margin: "0 0 5px 0" }}>{value}</h3>
    <p style={{ fontSize: "12px", color: "#888", fontWeight: 700, textTransform: "uppercase" }}>{title}</p>
  </div>
);

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
  avatar: { width: "35px", height: "35px", borderRadius: "50%", background: "#6366f1", color: "#fff", display: "flex", alignItems: "center", justifyCenter: "center", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px" },
  userName: { fontWeight: 700, fontSize: "14px" },
  btnSignOut: { width: "100%", padding: "10px", border: "1px solid #ff4747", color: "#ff4747", background: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
  mainArea: { flex: 1, padding: "40px", overflowY: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
  dashboardLayout: { display: "flex", flexDirection: "column", gap: "30px" },
  statsRow: { display: "flex", gap: "20px" },
  statCard: { flex: 1, background: "#fff", padding: "25px", borderRadius: "15px", border: "1px solid #eee" },
  whiteCard: { background: "#fff", borderRadius: "15px", border: "1px solid #eee", overflow: "hidden" },
  cardHeader: { padding: "20px", fontWeight: 800, borderBottom: "1px solid #f5f5f5" },
  bugGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" },
  bugCard: { background: "#fff", padding: "20px", borderRadius: "15px", border: "1px solid #eee", cursor: "pointer" },
  bugCardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  badgeDraft: { background: "#fff3cd", color: "#856404", padding: "4px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: 700 },
  badgeSubmitted: { background: "#d1e7dd", color: "#0f5132", padding: "4px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: 700 },
  btnSubmitBug: { marginTop: "15px", width: "100%", padding: "10px", background: "#28a745", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
  btnDisabled: { marginTop: "15px", width: "100%", padding: "10px", background: "#ccc", color: "#666", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "not-allowed" },
  btnPrimary: { background: "#6366f1", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
  btnDanger: { background: "#ff4747", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
  btnCancel: { background: "#eee", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
  modalBox: { backgroundColor: "#fff", padding: "30px", borderRadius: "20px", width: "400px" },
  formGroup: { marginBottom: "15px", textAlign: "left" },
  label: { display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "5px", color: "#666" },
  input: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" },
  table: { width: "100%", borderCollapse: "collapse" },
  thRow: { textAlign: "left", background: "#fafafa", color: "#aaa", fontSize: "12px", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #f8f8f8" },
};

export default TesterDashboard;