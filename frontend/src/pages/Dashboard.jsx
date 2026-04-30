import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Users, Bell, BarChart3, Zap, ArrowRight, Bug, Upload, Clock, UserCheck, Sparkles, Target, Rocket, Timer, Handshake, ShieldCheck, TrendingUp } from "lucide-react";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";
import ReviewSection from "../components/ReviewSection";

/* ── Fade-In Wrapper ── */
const FadeIn = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

/* ── Data ── */
const features = [
  { icon: Bug, title: "Bug Tracking", desc: "Report, assign, and resolve bugs with an intelligent workflow engine.", color: "#ef4444", bg: "#fef2f2" },
  { icon: Shield, title: "Role-Based Access", desc: "Admin, PM, Developer & Tester roles with granular permissions.", color: "#4f46e5", bg: "#eef2ff" },
  { icon: UserCheck, title: "Approval Workflow", desc: "Tester registration with admin approval and instant email alerts.", color: "#22c55e", bg: "#dcfce7" },
  { icon: Bell, title: "Email Notifications", desc: "Get notified on every status change, assignment, and approval.", color: "#f59e0b", bg: "#fef3c7" },
  { icon: Clock, title: "Activity Logs", desc: "Complete audit trail of every action across all your projects.", color: "#6366f1", bg: "#eef2ff" },
  { icon: BarChart3, title: "Reports & Analytics", desc: "Visual dashboards with charts, sprint tracking, and insights.", color: "#06b6d4", bg: "#ecfeff" },
  { icon: Upload, title: "Cloud Uploads", desc: "Attach screenshots, files, and documents to any bug report.", color: "#f43f5e", bg: "#fff1f2" },
  { icon: Zap, title: "Real-time Updates", desc: "Socket-powered live notifications for instant team collaboration.", color: "#4f46e5", bg: "#eef2ff" },
];

const steps = [
  { num: "01", title: "Register", desc: "Create your account in seconds. Choose your role and get started.", icon: Rocket, color: "#4f46e5" },
  { num: "02", title: "Get Approved", desc: "Admin reviews and approves your account. You'll be notified instantly.", icon: ShieldCheck, color: "#22c55e" },
  { num: "03", title: "Track & Deliver", desc: "Start tracking bugs, managing tasks, and shipping quality software.", icon: Target, color: "#f59e0b" },
];

const benefits = [
  { icon: Timer, title: "Saves Time", desc: "Reduce bug resolution time by up to 60% with streamlined workflows.", color: "#4f46e5" },
  { icon: Handshake, title: "Better Collaboration", desc: "Keep your entire team in sync with real-time updates and notifications.", color: "#22c55e" },
  { icon: Sparkles, title: "Cleaner Releases", desc: "Ship confident releases with comprehensive testing and approval flows.", color: "#f59e0b" },
  { icon: TrendingUp, title: "Faster Debugging", desc: "Identify and fix issues faster with detailed bug reports and activity logs.", color: "#ef4444" },
];

/* ── Bug emoji icons for orbit ── */
const bugEmojis = ["🐛", "🦗", "🐜", "🪲", "🦟", "🕷️"];

/* ── Hero Visual — Orbiting Bug Icons ── */
const HeroVisual = () => (
  <div style={{ position: "relative", width: "100%", maxWidth: 480, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>
    {/* Outer circle */}
    <div style={{
      position: "absolute", width: "100%", height: "100%",
      border: "2px solid rgba(79,70,229,0.1)", borderRadius: "50%"
    }} />
    {/* Middle circle */}
    <div style={{
      position: "absolute", width: "65%", height: "65%",
      border: "2px solid rgba(79,70,229,0.08)", borderRadius: "50%"
    }} />
    {/* Inner circle */}
    <div style={{
      position: "absolute", width: "35%", height: "35%",
      border: "2px solid rgba(79,70,229,0.06)", borderRadius: "50%"
    }} />

    {/* Center card */}
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      style={{
        background: "#fff", borderRadius: 16, padding: "18px 24px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9",
        zIndex: 5, textAlign: "center"
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 4 }}>⚡</div>
      <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", letterSpacing: 3, textTransform: "uppercase" }}>Scanning...</div>
    </motion.div>

    {/* Orbiting bugs */}
    {bugEmojis.map((emoji, i) => {
      const angle = (360 / bugEmojis.length) * i;
      const radius = i % 2 === 0 ? 42 : 30; // alternating orbit radius (%)
      const duration = 18 + i * 3;
      return (
        <div key={i} style={{
          position: "absolute", width: "100%", height: "100%",
          animation: `orbit ${duration}s linear infinite`,
          animationDelay: `${-i * 3}s`,
          ["--orbit-r"]: `${radius}%`
        }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 26, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          }}>{emoji}</div>
        </div>
      );
    })}
  </div>
);

/* ══════════════════════════════════════ */
/*           MAIN LANDING PAGE           */
/* ══════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();

  // Hardware-Accelerated Smooth Scroll (Landing Page Only - No Libraries)
  const [windowHeight, setWindowHeight] = React.useState(0);
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    let currentY = 0;
    let targetY = 0;
    let rafId;

    const updateScroll = () => {
      targetY = window.scrollY;
      currentY += (targetY - currentY) * 0.08; // Adjust for smoothness

      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, -${currentY}px, 0)`;
      }

      rafId = requestAnimationFrame(updateScroll);
    };

    const handleResize = () => {
      if (contentRef.current) {
        setWindowHeight(contentRef.current.getBoundingClientRect().height);
      }
    };

    handleResize(); // Initial height

    rafId = requestAnimationFrame(updateScroll);
    window.addEventListener("resize", handleResize);

    // Observe changes in DOM for dynamic resizing
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (contentRef.current) resizeObserver.observe(contentRef.current);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div style={{ height: windowHeight }} /> {/* Fake body height for native scrollbar */}
      <div 
        ref={contentRef}
        style={{ 
          fontFamily: "'Plus Jakarta Sans', sans-serif", 
          background: "#ccd6ff", 
          position: "fixed", 
          top: 0, 
          left: 0, 
          width: "100%", 
          willChange: "transform",
          overflow: "hidden",
          display: "flex", 
          flexDirection: "column" 
        }}
      >
      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); }
          to { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); }
        }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px) scale(1.05); } }
        .landing-circle {
          position: absolute; border: 15px solid rgba(79, 70, 229, 0.08);
          border-radius: 50%; pointer-events: none; animation: float 12s infinite ease-in-out;
        }
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-grid > div:last-child { max-width: 360px; margin: 0 auto; }
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .benefits-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .hero-btns { justify-content: center !important; }
        }
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .benefits-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .hero-btns { flex-direction: column; align-items: center; }
          .hero-btns button { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* Background circles */}
      <div className="landing-circle" style={{ width: 500, height: 500, top: -150, left: -150 }} />
      <div className="landing-circle" style={{ width: 400, height: 400, bottom: 200, right: -100, animationDelay: "4s" }} />
      <div className="landing-circle" style={{ width: 300, height: 300, bottom: -80, left: "40%", animationDelay: "8s" }} />

      <LandingNavbar />

      <main style={{ flex: 1 }}>
        {/* ═══ HERO ═══ */}
        <section id="hero" style={{ padding: "140px 5% 80px", position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", alignItems: "center" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", alignItems: "center", gap: 60, width: "100%", maxWidth: 1200, margin: "0 auto" }}>
            <div>
              <FadeIn>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)",
                  padding: "8px 18px", borderRadius: 50, marginBottom: 28,
                  border: "1px solid rgba(255,255,255,0.8)"
                }}>
                  <span style={{ fontSize: 14 }}>⚡</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5 }}>"Your code has a secret... let's find it."</span>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.2rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 20, color: "#0f172a" }}>
                  Stop chasing<br /><span style={{ color: "#4f46e5", fontStyle: "italic" }}>shadows.</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p style={{ fontSize: 16, color: "#64748b", maxWidth: 400, marginBottom: 12, lineHeight: 1.7, fontWeight: 500 }}>
                  Fixify catches the bugs you missed, before your users do.
                </p>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 36 }}>Fast. Fluid. Fearless.</p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className="hero-btns" style={{ display: "flex", gap: 14 }}>
                  <button onClick={() => navigate("/register")} style={{
                    padding: "15px 32px", borderRadius: 50, fontWeight: 700, fontSize: 15,
                    cursor: "pointer", border: "none",
                    background: "#121212", color: "#fff",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)", transition: "0.3s",
                    display: "flex", alignItems: "center", gap: 8
                  }}>Start Debugging</button>
                  <button onClick={() => navigate("/login")} style={{
                    padding: "15px 32px", borderRadius: 50, fontWeight: 700, fontSize: 15,
                    cursor: "pointer", background: "#fff", color: "#0f172a",
                    border: "1px solid #e2e8f0", transition: "0.3s"
                  }}>Log in</button>
                </div>
              </FadeIn>
            </div>
            <HeroVisual />
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section id="features" style={{
          padding: "80px 5%", position: "relative", zIndex: 10,
          background: "rgba(255,255,255,0.35)", backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.6)"
        }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#4f46e5", textTransform: "uppercase", letterSpacing: 3, background: "rgba(79,70,229,0.08)", padding: "6px 18px", borderRadius: 50 }}>Features</span>
              <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, marginTop: 18, letterSpacing: "-1px", color: "#0f172a" }}>
                Everything you need to <span style={{ color: "#4f46e5" }}>squash bugs</span>
              </h2>
              <p style={{ fontSize: 15, color: "#64748b", maxWidth: 480, margin: "12px auto 0", fontWeight: 500 }}>Powerful tools designed for modern development teams</p>
            </div>
          </FadeIn>
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div style={{
                  background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.9)", borderRadius: 20,
                  padding: 28, height: "100%", display: "flex", flexDirection: "column",
                  transition: "0.3s", cursor: "default",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                }}>
                  <div style={{
                    width: 48, height: 48, background: f.bg, borderRadius: 14,
                    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18
                  }}>
                    <f.icon size={22} color={f.color} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, color: "#0f172a" }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, fontWeight: 500 }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section style={{ padding: "80px 5%", position: "relative", zIndex: 10 }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#22c55e", textTransform: "uppercase", letterSpacing: 3, background: "rgba(34,197,94,0.08)", padding: "6px 18px", borderRadius: 50 }}>How It Works</span>
              <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, marginTop: 18, letterSpacing: "-1px", color: "#0f172a" }}>
                Get started in <span style={{ color: "#22c55e" }}>3 simple steps</span>
              </h2>
            </div>
          </FadeIn>
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, maxWidth: 1000, margin: "0 auto" }}>
            {steps.map((s, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
                    background: `${s.color}12`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `2px solid ${s.color}20`
                  }}>
                    <s.icon size={26} color={s.color} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 900, color: s.color, letterSpacing: 2 }}>{s.num}</span>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "8px 0 10px" }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, fontWeight: 500, maxWidth: 280, margin: "0 auto" }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ═══ WHY CHOOSE FIXIFY ═══ */}
        <section style={{
          padding: "80px 5%", position: "relative", zIndex: 10,
          background: "rgba(255,255,255,0.35)", backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.6)"
        }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: 3, background: "rgba(245,158,11,0.08)", padding: "6px 18px", borderRadius: 50 }}>Why Fixify</span>
              <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, marginTop: 18, letterSpacing: "-1px", color: "#0f172a" }}>
                Built for teams that <span style={{ color: "#f59e0b" }}>care about quality</span>
              </h2>
            </div>
          </FadeIn>
          <div className="benefits-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
            {benefits.map((b, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{
                  background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.9)", borderRadius: 20,
                  padding: 28, display: "flex", gap: 16, alignItems: "flex-start",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${b.color}12`, display: "flex",
                    alignItems: "center", justifyContent: "center"
                  }}>
                    <b.icon size={20} color={b.color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>{b.title}</h3>
                    <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, fontWeight: 500 }}>{b.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ═══ REVIEWS ═══ */}
        <ReviewSection />

        {/* ═══ CTA BANNER ═══ */}
        <section style={{ padding: "60px 5%", position: "relative", zIndex: 10 }}>
          <FadeIn>
            <div style={{
              background: "#0f172a",
              borderRadius: 24, padding: "60px 40px", textAlign: "center",
              maxWidth: 800, margin: "0 auto", position: "relative", overflow: "hidden"
            }}>
              <div style={{
                position: "absolute", top: -50, right: -50, width: 200, height: 200,
                background: "radial-gradient(circle, rgba(79,70,229,0.3), transparent)",
                borderRadius: "50%", filter: "blur(50px)"
              }} />
              <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 900, color: "#fff", marginBottom: 14, letterSpacing: "-0.5px", position: "relative" }}>
                Ready to simplify bug tracking?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, marginBottom: 32, fontWeight: 500, maxWidth: 450, margin: "0 auto 32px", position: "relative" }}>
                Join hundreds of teams already using Fixify to ship better software, faster.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, position: "relative", flexWrap: "wrap" }}>
                <button onClick={() => navigate("/register")} style={{
                  padding: "15px 34px", borderRadius: 50, fontWeight: 700, fontSize: 15,
                  border: "none", cursor: "pointer", background: "#fff", color: "#0f172a",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.2)", transition: "0.3s",
                  display: "flex", alignItems: "center", gap: 8
                }}>Start Free <ArrowRight size={16} /></button>
                <button onClick={() => navigate("/login")} style={{
                  padding: "15px 34px", borderRadius: 50, fontWeight: 700, fontSize: 15,
                  cursor: "pointer", background: "rgba(255,255,255,0.1)", color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)", transition: "0.3s"
                }}>Log in</button>
              </div>
            </div>
          </FadeIn>
        </section>
      </main>

      <LandingFooter />

      </div>
    </>
  );
};

export default Dashboard;
