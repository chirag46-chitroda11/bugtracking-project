import { useNavigate } from "react-router-dom";
import bugMascot from "../assets/vite.svg";
import { Globe, MessageCircle, Mail, ArrowUpRight } from "lucide-react";

const LandingFooter = () => {
  const navigate = useNavigate();
  const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer id="footer" style={{ background: "#0f172a", position: "relative", zIndex: 10, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        .footer-inner {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 70px 6% 40px;
        }
        .footer-link {
          display: block; background: none; border: none; color: #94a3b8;
          font-size: 14px; font-weight: 500; padding: 5px 0; cursor: pointer;
          transition: 0.2s; text-align: left; text-decoration: none;
          font-family: inherit;
        }
        .footer-link:hover { color: #e2e8f0; padding-left: 4px; }
        .footer-social {
          width: 40px; height: 40px; border-radius: 12px;
          background: rgba(255,255,255,0.06); display: flex;
          align-items: center; justify-content: center; cursor: pointer;
          transition: 0.3s; border: 1px solid rgba(255,255,255,0.06);
          text-decoration: none;
        }
        .footer-social:hover { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.3); transform: translateY(-2px); }
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 24px 6%;
          text-align: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer-contact-item {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 12px; color: #94a3b8; font-size: 13px;
          font-weight: 500; text-decoration: none; transition: 0.2s;
        }
        .footer-contact-item:hover { color: #e2e8f0; }
        .footer-contact-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(124,58,237,0.12); display: flex;
          align-items: center; justify-content: center; flex-shrink: 0;
        }
        @media (max-width: 900px) {
          .footer-inner { grid-template-columns: 1fr 1fr; gap: 32px; }
        }
        @media (max-width: 540px) {
          .footer-inner { grid-template-columns: 1fr; gap: 28px; padding: 50px 7% 32px; }
        }
      `}</style>

      <div className="footer-inner">
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, background: "#fff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={bugMascot} style={{ width: 20, height: 20 }} alt="logo" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-1px" }}>
              Fixify<span style={{ color: "#7c3aed" }}>.</span>
            </span>
          </div>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, fontWeight: 500, maxWidth: 300, marginBottom: 20 }}>
            Smart bug tracking for modern teams. Build better products, ship faster, debug smarter.
          </p>
          {/* Social icons */}
          <div style={{ display: "flex", gap: 10 }}>
            <a href="mailto:fixify46@gmail.com" className="footer-social" title="Email Us">
              <Mail size={16} color="#94a3b8" />
            </a>
            <a href="mailto:fixify46@gmail.com" className="footer-social" title="Send Message">
              <MessageCircle size={16} color="#94a3b8" />
            </a>
            <a href="/" className="footer-social" title="Website" onClick={(e) => { e.preventDefault(); scrollTo("#hero"); }}>
              <Globe size={16} color="#94a3b8" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "#64748b", marginBottom: 20 }}>Quick Links</h4>
          <button className="footer-link" onClick={() => scrollTo("#hero")}>Home</button>
          <button className="footer-link" onClick={() => scrollTo("#features")}>Features</button>
          <button className="footer-link" onClick={() => scrollTo("#reviews")}>Reviews</button>
          <button className="footer-link" onClick={() => scrollTo("#footer")}>Contact</button>
        </div>

        {/* Account */}
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "#64748b", marginBottom: 20 }}>Account</h4>
          <button className="footer-link" onClick={() => navigate("/login")}>Login</button>
          <button className="footer-link" onClick={() => navigate("/register")}>Register</button>
        </div>

        {/* Contact Info */}
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "#64748b", marginBottom: 20 }}>Get In Touch</h4>
          <a href="mailto:fixify46@gmail.com" className="footer-contact-item">
            <span className="footer-contact-icon">
              <Mail size={14} color="#7c3aed" />
            </span>
            fixify46@gmail.com
          </a>
          <a href="mailto:fixify46@gmail.com?subject=Hello%20Fixify" className="footer-contact-item">
            <span className="footer-contact-icon">
              <MessageCircle size={14} color="#7c3aed" />
            </span>
            Send us a message
            <ArrowUpRight size={12} style={{ opacity: 0.5 }} />
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p style={{ color: "#475569", fontSize: 13, fontWeight: 500, margin: 0 }}>
          © {new Date().getFullYear()} Fixify. Built with ❤️ by Chirag Chitroda
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
