 const user = JSON.parse(localStorage.getItem("user"));
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    const confirm = window.confirm("Are you sure you want to logout?");
    if (!confirm) return;

    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSwitchUser = () => {
    const confirm = window.confirm("Switch user?");
    if (!confirm) return;

    localStorage.removeItem("user");
    navigate("/login");
  };

  const firstLetter = user?.name?.charAt(0)?.toUpperCase();

  if (!user) return null; // 🛑 important

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
      
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          position: "relative"
        }}
      >
        {/* LETTER */}
        <div
          style={{
            width: "35px",
            height: "35px",
            borderRadius: "50%",
            background: "#4CAF50",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold"
          }}
        >
          {firstLetter}
        </div>

        {/* NAME */}
        <div>{user.name}</div>

        {/* DROPDOWN */}
        {open && (
          <div
            style={{
              position: "absolute",
              top: "50px",
              right: "0",
              width: "200px",
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px"
            }}
          >
            <div>{user.email}</div>

            <hr />

            <div onClick={handleSwitchUser} style={{ cursor: "pointer" }}>
              Switch User
            </div>

            <div
              onClick={handleLogout}
              style={{ color: "red", cursor: "pointer", marginTop: "10px" }}
            >
              Logout
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Navbar;