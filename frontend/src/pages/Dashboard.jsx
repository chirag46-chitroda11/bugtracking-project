import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Users, Bell, BarChart3, Zap, ArrowRight, Bug, Upload, Clock, UserCheck, Sparkles, Target, Rocket, Timer, Handshake, ShieldCheck, TrendingUp } from "lucide-react";
import bugMascot from "../assets/vite.svg";
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
  { icon: Shield, title: "Role-Based Access", desc: "Admin, PM, Developer & Tester roles with granular permissions.", color: "#0ea5e9", bg: "#f5f3ff" },
  { icon: UserCheck, title: "Approval Workflow", desc: "Tester registration with admin approval and instant email alerts.", color: "#10b981", bg: "#ecfdf5" },
  { icon: Bell, title: "Email Notifications", desc: "Get notified on every status change, assignment, and approval.", color: "#f59e0b", bg: "#fffbeb" },
  { icon: Clock, title: "Activity Logs", desc: "Complete audit trail of every action across all your projects.", color: "#38bdf8", bg: "#eef2ff" },
  { icon: BarChart3, title: "Reports & Analytics", desc: "Visual dashboards with charts, sprint tracking, and insights.", color: "#06b6d4", bg: "#ecfeff" },
  { icon: Upload, title: "Cloud Uploads", desc: "Attach screenshots, files, and documents to any bug report.", color: "#f43f5e", bg: "#fff1f2" },
  { icon: Zap, title: "Real-time Updates", desc: "Socket-powered live notifications for instant team collaboration.", color: "#8b5cf6", bg: "#faf5ff" },
];

const steps = [
  { num: "01", title: "Register", desc: "Create your account in seconds. Choose your role and get started.", icon: Rocket, color: "#0ea5e9" },
  { num: "02", title: "Get Approved", desc: "Admin reviews and approves your account. You'll be notified instantly.", icon: ShieldCheck, color: "#10b981" },
  { num: "03", title: "Track & Deliver", desc: "Start tracking bugs, managing tasks, and shipping quality software.", icon: Target, color: "#f59e0b" },
];

const benefits = [
  { icon: Timer, title: "Saves Time", desc: "Reduce bug resolution time by up to 60% with streamlined workflows.", color: "#0ea5e9" },
  { icon: Handshake, title: "Better Collaboration", desc: "Keep your entire team in sync with real-time updates and notifications.", color: "#10b981" },
  { icon: Sparkles, title: "Cleaner Releases", desc: "Ship confident releases with comprehensive testing and approval flows.", color: "#f59e0b" },
  { icon: TrendingUp, title: "Faster Debugging", desc: "Identify and fix issues faster with detailed bug reports and activity logs.", color: "#ef4444" },
];

/* ── Dashboard Mockup Component ── */
const DashboardMockup = () => (
  <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
    style={{ position: "relative", width: "100%", maxWidth: 520 }}>
    {/* Main Card */}
    <div style={{
      background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
      borderRadius: 20, padding: 20, border: "1px solid rgba(255,255,255,0.9)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.06)"
    }}>
      {/* Mini chart bars */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60, marginBottom: 16, padding: "0 8px" }}>
        {[40, 65, 45, 80, 55, 72, 90, 60, 85, 50, 70, 88].map((h, i) => (
          <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }}
            viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
            style={{ flex: 1, background: `linear-gradient(180deg, ${i % 3 === 0 ? '#0ea5e9' : i % 3 === 1 ? '#10b981' : '#38bdf8'}, transparent)`, borderRadius: 4, opacity: 0.7 }} />
        ))}
      </div>
      {/* Mini cards row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Open Bugs</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#ef4444", marginTop: 2 }}>12</div>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Resolved</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981", marginTop: 2 }}>48</div>
        </div>
      </div>
    </div>
    {/* Floating notification card */}
    <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      style={{
        position: "absolute", top: -20, right: -20,
        background: "#fff", borderRadius: 14, padding: "10px 16px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700
      }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
      <span style={{ color: "#334155" }}>Bug Approved ✓</span>
    </motion.div>
    {/* Floating task card */}
    <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
      style={{
        position: "absolute", bottom: 20, left: -30,
        background: "#fff", borderRadius: 14, padding: "10px 16px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9",
        fontSize: 12, fontWeight: 700
      }}>
      <div style={{ color: "#0ea5e9", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>Sprint #4</div>
      <div style={{ color: "#334155", marginTop: 2 }}>3 tasks in progress</div>
    </motion.div>
    {/* Gradient glow */}
    <div style={{
      position: "absolute", top: "30%", left: "20%", width: 200, height: 200,
      background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
      borderRadius: "50%", zIndex: -1, filter: "blur(40px)"
    }} />
  </motion.div>
);

/* ══════════════════════════════════════ */
/*          MAIN DASHBOARD PAGE          */
/* ══════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#ccd6ff", minHeight: "100vh", overflowX: "clip", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .landing-glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.8); border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.04); transition: all 0.3s ease; }
        .landing-glass:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(124,58,237,0.08); border-color: rgba(124,58,237,0.12); }
        .decor-blob { position: absolute; border-radius: 50%; z-index: 0; pointer-events: none; filter: blur(80px); }
        @media (max-width: 1024px) { 
.landing-section { padding: 80px 5% !important; }

          .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-grid > div:last-child { display: none; }
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .hero-btns { justify-content: center; }
        }
        @media (max-width: 768px) { 
.hero-grid { margin-top: 40px; } h1 { font-size: 2.2rem !important; } p { font-size: 14px !important; }

          .features-grid { grid-template-columns: 1fr !important; }
          .benefits-grid { grid-template-columns: 1fr !important; }
          .landing-section { padding-left: 6% !important; padding-right: 6% !important; }
        }
        @media (max-width: 480px) {
          .hero-btns { flex-direction: column; align-items: center; }
          .hero-btns button { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* Background blobs */}
      <div className="decor-blob" style={{ width: 400, height: 400, top: -100, right: -100, background: "rgba(124,58,237,0.06)" }} />
      <div className="decor-blob" style={{ width: 350, height: 350, bottom: 200, left: -100, background: "rgba(16,185,129,0.05)" }} />
      <div className="decor-blob" style={{ width: 300, height: 300, top: "50%", right: "10%", background: "rgba(99,102,241,0.05)" }} />

      <style>{`@keyframes pulseRing { 0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; } 50% { opacity: 1; } 100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; } }`}</style>
      <LandingNavbar />

      {/* Animated Glow Rings */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 800, height: 800, border: "2px solid rgba(14,165,233,0.1)", borderRadius: "50%", zIndex: 0, animation: "pulseRing 4s infinite" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, border: "2px solid rgba(14,165,233,0.2)", borderRadius: "50%", zIndex: 0, animation: "pulseRing 4s infinite 1s" }} />


      {/* ═══ HERO ═══ */}
      <section id="hero" style={{ padding: "100px 5% 60px", position: "relative", zIndex: 10, minHeight: "90vh", display: "flex", alignItems: "center" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", alignItems: "center", gap: 60, width: "100%", maxWidth: 1300, margin: "0 auto" }}>
          <div>
            <FadeIn>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)",
                padding: "8px 18px", borderRadius: 50, marginBottom: 28,
                border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)"
              }}>
                <Sparkles size={14} color="#0ea5e9" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5 }}>Smart Bug Tracking Platform</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.2rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 20, color: "#0f172a" }}>
                Track Bugs Faster.<br /><span style={{ color: "#0ea5e9" }}>Build Better Products.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p style={{ fontSize: 17, color: "#64748b", maxWidth: 480, marginBottom: 36, lineHeight: 1.7, fontWeight: 500 }}>
                Collaborate smarter with Fixify. The modern bug tracking platform trusted by development teams to ship quality software on time.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="hero-btns" style={{ display: "flex", gap: 14 }}>
                <button onClick={() => navigate("/register")} style={{
                  padding: "15px 32px", borderRadius: 14, fontWeight: 700, fontSize: 15,
                  cursor: "pointer", border: "none", background: "#0ea5e9", color: "#fff",
                  boxShadow: "0 8px 25px rgba(15,23,42,0.18)", transition: "0.3s",
                  display: "flex", alignItems: "center", gap: 8
                }}>Get Started <ArrowRight size={16} /></button>
                <button onClick={() => navigate("/login")} style={{
                  padding: "15px 32px", borderRadius: 14, fontWeight: 700, fontSize: 15,
                  cursor: "pointer", background: "rgba(255,255,255,0.8)", color: "#0f172a",
                  border: "1px solid #e2e8f0", transition: "0.3s", backdropFilter: "blur(10px)"
                }}>Live Demo</button>
              </div>
            </FadeIn>
          </div>
          <DashboardMockup />
        </div>
      </section>


      {/* ═══ FEATURES ═══ */}
      <section id="features" style={{
        padding: "80px 5%", position: "relative", zIndex: 10,
        background: "rgba(255,255,255,0.4)", backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(255,255,255,0.5)"
      }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: 3, background: "rgba(124,58,237,0.08)", padding: "6px 18px", borderRadius: 50 }}>Features</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, marginTop: 18, letterSpacing: "-1px", color: "#0f172a" }}>
              Everything you need to <span style={{ color: "#0ea5e9" }}>squash bugs</span>
            </h2>
            <p style={{ fontSize: 15, color: "#64748b", maxWidth: 480, margin: "12px auto 0", fontWeight: 500 }}>Powerful tools designed for modern development teams</p>
          </div>
        </FadeIn>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
          {features.map((f, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div className="landing-glass" style={{ padding: 28 }}>
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
            <span style={{ fontSize: 12, fontWeight: 800, color: "#10b981", textTransform: "uppercase", letterSpacing: 3, background: "rgba(16,185,129,0.08)", padding: "6px 18px", borderRadius: 50 }}>How It Works</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, marginTop: 18, letterSpacing: "-1px", color: "#0f172a" }}>
              Get started in <span style={{ color: "#10b981" }}>3 simple steps</span>
            </h2>
          </div>
        </FadeIn>
        <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, maxWidth: 1000, margin: "0 auto" }}>
          {steps.map((s, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div style={{ textAlign: "center", position: "relative" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
                  background: `linear-gradient(135deg, ${s.color}18, ${s.color}08)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `2px solid ${s.color}20`
                }}>
                  <s.icon size={26} color={s.color} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 900, color: s.color, letterSpacing: 2 }}>{s.num}</span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "8px 0 10px" }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, fontWeight: 500, maxWidth: 280, margin: "0 auto" }}>{s.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block" style={{ position: "absolute", top: 32, right: -40, color: "#e2e8f0" }}>
                    <ArrowRight size={24} />
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ WHY CHOOSE FIXIFY ═══ */}
      <section style={{
        padding: "80px 5%", position: "relative", zIndex: 10,
        background: "rgba(255,255,255,0.4)", backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(255,255,255,0.5)"
      }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: 3, background: "rgba(245,158,11,0.08)", padding: "6px 18px", borderRadius: 50 }}>Why Fixify</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, marginTop: 18, letterSpacing: "-1px", color: "#0f172a" }}>
              Built for teams that <span style={{ color: "#f59e0b" }}>care about quality</span>
            </h2>
          </div>
        </FadeIn>
        <div className="benefits-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
          {benefits.map((b, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="landing-glass" style={{ padding: 28, display: "flex", gap: 16, alignItems: "flex-start" }}>
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

      {/* ═══ REVIEWS (Dynamic) ═══ */}
      <ReviewSection />

      {/* ═══ CTA BANNER ═══ */}
      <section style={{ padding: "60px 5%", position: "relative", zIndex: 10 }}>
        <FadeIn>
          <div style={{
            background: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%)",
            borderRadius: 24, padding: "60px 40px", textAlign: "center",
            maxWidth: 800, margin: "0 auto", position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: -50, right: -50, width: 200, height: 200,
              background: "radial-gradient(circle, rgba(124,58,237,0.3), transparent)",
              borderRadius: "50%", filter: "blur(50px)"
            }} />
            <div style={{
              position: "absolute", bottom: -30, left: -30, width: 150, height: 150,
              background: "radial-gradient(circle, rgba(16,185,129,0.2), transparent)",
              borderRadius: "50%", filter: "blur(40px)"
            }} />
            <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 900, color: "#fff", marginBottom: 14, letterSpacing: "-0.5px", position: "relative" }}>
              Ready to simplify bug tracking?
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 16, marginBottom: 32, fontWeight: 500, maxWidth: 450, margin: "0 auto 32px", position: "relative" }}>
              Join hundreds of teams already using Fixify to ship better software, faster.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, position: "relative", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/register")} style={{
                padding: "15px 34px", borderRadius: 14, fontWeight: 700, fontSize: 15,
                border: "none", cursor: "pointer", background: "#0ea5e9", color: "#fff",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)", transition: "0.3s",
                display: "flex", alignItems: "center", gap: 8
              }}>Start Free <ArrowRight size={16} /></button>
              <button onClick={() => navigate("/login")} style={{
                padding: "15px 34px", borderRadius: 14, fontWeight: 700, fontSize: 15,
                cursor: "pointer", background: "rgba(255,255,255,0.1)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.15)", transition: "0.3s",
                backdropFilter: "blur(10px)"
              }}>Request Demo</button>
            </div>
          </div>
        </FadeIn>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Dashboard;
