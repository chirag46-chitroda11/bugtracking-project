import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../context/ConfirmContext";

const Navbar = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = async () => {
    const isConfirmed = await confirm({ title: "Logout", message: "Are you sure you want to logout?" });
    if (!isConfirmed) return;

    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSwitchUser = async () => {
    const isConfirmed = await confirm({ title: "Switch User", message: "Switch user?" });
    if (!isConfirmed) return;

    localStorage.removeItem("user");
    navigate("/login");
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstLetter = user?.name?.charAt(0)?.toUpperCase();

  if (!user) return null;

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
      
      <div
        ref={dropdownRef}
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
              backdropFilter: "blur(20px)",
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(255,255,255,0.7)",
              borderRadius: "16px",
              padding: "15px",
              zIndex: 99999,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              fontFamily: "'Plus Jakarta Sans', sans-serif"
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