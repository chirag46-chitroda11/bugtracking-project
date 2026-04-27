import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bugMascot from "../assets/vite.svg";

const LandingNavbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { label: "Home", href: "#hero" },
    { label: "Features", href: "#features" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "#footer" },
  ];

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav style={{
      position: "fixed", top: 0, width: "100%", zIndex: 100,
      padding: scrolled ? "12px 5%" : "20px 8%",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      transition: "0.4s", boxSizing: "border-box",
      background: scrolled ? "rgba(255,255,255,0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(0,0,0,0.04)" : "none",
      boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.04)" : "none"
    }}>
      {/* Logo */}
      <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <div style={{ width: 36, height: 36, background: "#0f172a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={bugMascot} style={{ width: 20, height: 20, filter: "invert(1)" }} alt="F" />
        </div>
        <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-1px", color: "#0f172a" }}>
          Fixify<span style={{ color: "#7c3aed" }}>.</span>
        </span>
      </div>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex" style={{ alignItems: "center", gap: 32 }}>
        {links.map((l) => (
          <button key={l.label} onClick={() => scrollTo(l.href)} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 600, color: "#475569",
            transition: "0.2s", padding: 0
          }}>{l.label}</button>
        ))}
      </div>

      {/* Auth Buttons */}
      <div className="hidden md:flex" style={{ alignItems: "center", gap: 10 }}>
        <button onClick={() => navigate("/login")} style={{
          padding: "9px 22px", borderRadius: 12, fontWeight: 700, fontSize: 13,
          background: "transparent", color: "#0f172a", border: "1px solid #e2e8f0",
          cursor: "pointer", transition: "0.3s"
        }}>Login</button>
        <button onClick={() => navigate("/register")} style={{
          padding: "9px 22px", borderRadius: 12, fontWeight: 700, fontSize: 13,
          background: "#0f172a", color: "#fff", border: "none",
          cursor: "pointer", transition: "0.3s",
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)"
        }}>Register</button>
      </div>

      {/* Mobile Hamburger */}
      <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{
        background: "none", border: "none", cursor: "pointer", padding: 4
      }}>
        <div style={{ width: 22, height: 2, background: "#0f172a", marginBottom: 5, borderRadius: 2, transition: "0.3s", transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
        <div style={{ width: 22, height: 2, background: "#0f172a", marginBottom: 5, borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: "0.3s" }} />
        <div style={{ width: 22, height: 2, background: "#0f172a", borderRadius: 2, transition: "0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)",
          padding: "20px 8%", boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          borderTop: "1px solid rgba(0,0,0,0.04)"
        }}>
          {links.map((l) => (
            <button key={l.label} onClick={() => scrollTo(l.href)} style={{
              display: "block", width: "100%", textAlign: "left",
              background: "none", border: "none", padding: "12px 0",
              fontSize: 15, fontWeight: 600, color: "#334155", cursor: "pointer",
              borderBottom: "1px solid #f1f5f9"
            }}>{l.label}</button>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => { setMenuOpen(false); navigate("/login"); }} style={{ flex: 1, padding: 12, borderRadius: 12, fontWeight: 700, fontSize: 14, background: "#f8fafc", color: "#0f172a", border: "1px solid #e2e8f0", cursor: "pointer" }}>Login</button>
            <button onClick={() => { setMenuOpen(false); navigate("/register"); }} style={{ flex: 1, padding: 12, borderRadius: 12, fontWeight: 700, fontSize: 14, background: "#0f172a", color: "#fff", border: "none", cursor: "pointer" }}>Register</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
