import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Shield, Users, Bell, BarChart3, Zap, ArrowRight, Star, ChevronDown, Bug } from "lucide-react";
import bugMascot from "../assets/vite.svg";

const Counter = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const features = [
  { icon: Bug, title: "Smart Bug Tracking", desc: "Report, assign, and resolve bugs with an intelligent workflow engine.", color: "#ef4444" },
  { icon: Shield, title: "Role-Based Access", desc: "Admin, PM, Developer & Tester roles with granular permissions.", color: "#4f46e5" },
  { icon: Users, title: "Approval Workflow", desc: "Tester registration with admin approval and instant email alerts.", color: "#7c3aed" },
  { icon: Bell, title: "Real-time Alerts", desc: "Socket-powered live notifications for every status change.", color: "#f59e0b" },
  { icon: BarChart3, title: "Reports & Analytics", desc: "Visual dashboards with charts, activity logs, and sprint tracking.", color: "#10b981" },
  { icon: Zap, title: "Lightning Fast", desc: "Optimized MERN stack architecture for blazing performance.", color: "#06b6d4" },
];

const stats = [
  { value: 10000, suffix: "+", label: "Bugs Managed" },
  { value: 500, suffix: "+", label: "Teams Worldwide" },
  { value: 99, suffix: ".9%", label: "System Uptime" },
  { value: 24, suffix: "/7", label: "Active Monitoring" },
];

const testimonials = [
  { name: "Priya Sharma", role: "QA Lead, TechCorp", text: "Fixify transformed our bug tracking. We reduced resolution time by 60% in just one month.", rating: 5 },
  { name: "Alex Johnson", role: "CTO, StartupX", text: "The approval workflow and real-time notifications keep our entire team in sync. Absolutely love it.", rating: 5 },
  { name: "Sarah Chen", role: "Dev Manager, CloudNine", text: "Best bug tracker we've used. Clean UI, powerful features, and the sprint integration is perfect.", rating: 5 },
];

const faqs = [
  { q: "How does the approval workflow work?", a: "When a tester registers, their account is set to 'pending'. An admin or PM reviews and approves/rejects the request. The user receives an email notification with their status." },
  { q: "What roles are available?", a: "Fixify supports 4 roles: Admin (full access), Project Manager (project & sprint management), Developer (task & bug resolution), and Tester (bug reporting & retesting)." },
  { q: "Is Fixify free to use?", a: "Yes! Fixify is an open-source bug tracking system. Deploy it on your own infrastructure with full control over your data." },
  { q: "Can I integrate Fixify with other tools?", a: "Fixify provides a RESTful API that can be integrated with CI/CD pipelines, Slack, and other development tools." },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#f4f7ff", minHeight: "100vh", overflowX: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.8); border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.04); transition: 0.3s; }
        .glass-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(79,70,229,0.1); border-color: rgba(79,70,229,0.15); }
        .decor-ring { position: absolute; border: 15px solid rgba(79,70,229,0.03); border-radius: 50%; z-index: 0; pointer-events: none; }
        .orbit-ring { position: absolute; border: 1px solid rgba(79,70,229,0.1); border-radius: 50%; animation: rotate 15s linear infinite; }
        .bug-item { position: absolute; font-size: 2rem; filter: drop-shadow(0 0 10px rgba(0,0,0,0.1)); }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .faq-box { background: rgba(255,255,255,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.7); border-radius: 16px; margin-bottom: 10px; overflow: hidden; transition: 0.3s; cursor: pointer; }
        .faq-box:hover { border-color: rgba(79,70,229,0.2); }
      `}</style>

      {/* Background Rings */}
      <div className="decor-ring" style={{ width: 350, height: 350, top: -150, left: -150 }}></div>
      <div className="decor-ring" style={{ width: 200, height: 200, bottom: 50, right: -80 }}></div>
      <div className="decor-ring" style={{ width: 450, height: 450, bottom: -200, left: "10%", borderWidth: 8 }}></div>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, width: "100%", zIndex: 100,
        padding: scrolled ? "1rem 5%" : "2rem 8%",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        transition: "0.4s", boxSizing: "border-box",
        background: scrolled ? "rgba(255,255,255,0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
      }}>
        <div className="flex items-center gap-2 cursor-pointer font-extrabold text-2xl tracking-tighter" onClick={() => navigate("/")}>
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
            <img src={bugMascot} className="w-5 h-5 invert" alt="L" />
          </div>
          Fixify<span className="text-indigo-600">.</span>
        </div>
        <button onClick={() => navigate("/register")} style={{ background: "#000", color: "#fff", padding: "10px 24px", borderRadius: 12, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", transition: "0.3s", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}>Sign up</button>
      </nav>

      {/* ── HERO ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", alignItems: "center", padding: "140px 10% 60px", position: "relative", zIndex: 10, minHeight: "100vh" }}>
        <div>
          <FadeIn>
            <div className="bg-white px-4 py-2 rounded-xl inline-flex items-center gap-3 shadow-sm border border-white mb-8">
              <span className="text-indigo-500 animate-bounce">⚡</span>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider italic">"Your code has a secret... let's find it."</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 style={{ fontSize: "clamp(3.5rem, 8vw, 6rem)", fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.05em", marginBottom: "1.5rem", color: "#121212" }}>
              Stop chasing <br /><span style={{ color: "#4f46e5", fontStyle: "italic" }}>shadows.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg text-slate-500 max-w-md mb-10 leading-relaxed font-medium">
              Fixify catches the bugs you missed, before your users do.
              <span className="block mt-2 font-bold text-slate-800 tracking-tight">Fast. Fluid. Fearless.</span>
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex">
              <button onClick={() => navigate("/register")} style={{ padding: "1rem 2.5rem", borderRadius: "1rem", fontWeight: 700, cursor: "pointer", transition: "0.3s", border: "none", background: "#000", color: "#fff", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}>Start Debugging</button>
              <button onClick={() => navigate("/login")} style={{ padding: "1rem 2.5rem", borderRadius: "1rem", fontWeight: 700, cursor: "pointer", transition: "0.3s", background: "#fff", color: "#000", border: "1px solid #e2e8f0", marginLeft: "1rem" }}>Log in</button>
            </div>
          </FadeIn>
        </div>

        {/* Nuclear orbit animation */}
        <div style={{ position: "relative", height: 500, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="absolute w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="orbit-ring" style={{ width: 300, height: 300 }}>
            <div className="bug-item" style={{ top: 0, left: "50%", transform: "translateX(-50%)" }}>🪲</div>
            <div className="bug-item" style={{ bottom: 0, left: "50%", transform: "translateX(-50%)" }}>🕷️</div>
          </div>
          <div className="orbit-ring" style={{ width: 400, height: 400, animationDuration: "10s", animationDirection: "reverse" }}>
            <div className="bug-item" style={{ top: "50%", left: 0, transform: "translateY(-50%)" }}>🐝</div>
            <div className="bug-item" style={{ top: "50%", right: 0, transform: "translateY(-50%)" }}>🦟</div>
          </div>
          <div className="absolute flex flex-col items-center">
            <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-2xl flex items-center justify-center shadow-2xl border border-white">
              <img src={bugMascot} className="w-8 h-8 opacity-90" alt="core" />
            </div>
            <div className="mt-4 font-mono text-[10px] text-indigo-500 font-black tracking-[0.4em] bg-white/50 px-4 py-1 rounded-full">SCANNING...</div>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ padding: "80px 8%", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, maxWidth: 900, margin: "0 auto" }}>
          {stats.map((s, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="glass-card" style={{ textAlign: "center", padding: 28 }}>
                <div style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900, color: "#4f46e5" }}>
                  <Counter end={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginTop: 6 }}>{s.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div style={{ padding: "80px 8%", position: "relative", zIndex: 10, background: "rgba(255,255,255,0.3)", backdropFilter: "blur(10px)", borderTop: "1px solid rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#4f46e5", textTransform: "uppercase", letterSpacing: 3, background: "rgba(79,70,229,0.08)", padding: "6px 16px", borderRadius: 50 }}>Features</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900, marginTop: 18, letterSpacing: "-1px", color: "#0f172a" }}>
              Everything you need to <span style={{ color: "#4f46e5" }}>squash bugs</span>
            </h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
          {features.map((f, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ width: 46, height: 46, background: f.color + "18", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, color: "#0f172a" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={{ padding: "80px 8%", position: "relative", zIndex: 10 }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#4f46e5", textTransform: "uppercase", letterSpacing: 3, background: "rgba(79,70,229,0.08)", padding: "6px 16px", borderRadius: 50 }}>Testimonials</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900, marginTop: 18, letterSpacing: "-1px", color: "#0f172a" }}>
              Loved by teams <span style={{ color: "#4f46e5" }}>worldwide</span>
            </h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
          {testimonials.map((t, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={15} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.7, marginBottom: 18, fontWeight: 500 }}>"{t.text}"</p>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{t.role}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ padding: "80px 8%", position: "relative", zIndex: 10, background: "rgba(255,255,255,0.3)", backdropFilter: "blur(10px)", borderTop: "1px solid rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#4f46e5", textTransform: "uppercase", letterSpacing: 3, background: "rgba(79,70,229,0.08)", padding: "6px 16px", borderRadius: 50 }}>FAQ</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900, marginTop: 18, letterSpacing: "-1px", color: "#0f172a" }}>Got questions?</h2>
          </div>
        </FadeIn>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {faqs.map((f, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="faq-box" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ borderColor: openFaq === i ? "rgba(79,70,229,0.25)" : undefined }}>
                <div style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700, fontSize: 15 }}>
                  {f.q}
                  <ChevronDown size={18} style={{ transition: "0.3s", transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", color: "#94a3b8", flexShrink: 0 }} />
                </div>
                {openFaq === i && <div style={{ padding: "0 22px 18px", color: "#64748b", fontSize: 14, lineHeight: 1.7 }}>{f.a}</div>}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: "80px 8%", position: "relative", zIndex: 10, textAlign: "center" }}>
        <FadeIn>
          <div className="glass-card" style={{ padding: "55px 36px", maxWidth: 650, margin: "0 auto", borderColor: "rgba(79,70,229,0.1)" }}>
            <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 900, marginBottom: 14, letterSpacing: "-1px", color: "#0f172a" }}>Ready to squash some bugs?</h2>
            <p style={{ color: "#64748b", fontSize: 15, marginBottom: 30, maxWidth: 420, margin: "0 auto 30px", fontWeight: 500 }}>Join hundreds of teams already using Fixify to ship better software, faster.</p>
            <button onClick={() => navigate("/register")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 38px", borderRadius: 15, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", background: "#000", color: "#fff", boxShadow: "0 8px 20px rgba(0,0,0,0.1)", transition: "0.3s" }}>
              Start Free Today <ArrowRight size={18} />
            </button>
          </div>
        </FadeIn>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(15px)", borderTop: "1px solid rgba(255,255,255,0.6)", padding: "50px 8% 25px", textAlign: "center", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <img src={bugMascot} className="w-4 h-4 invert" alt="logo" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-1px", color: "#0f172a" }}>Fixify<span style={{ color: "#4f46e5" }}>.</span></span>
        </div>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 6, fontWeight: 500 }}>Smart Bug Tracking for Modern Development Teams</p>
        <p style={{ color: "#94a3b8", fontSize: 12 }}>© {new Date().getFullYear()} Fixify. Built with ❤️ by Chirag Chitroda</p>
      </div>

      {/* Decorative blur */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-200/30 rounded-full blur-[120px] -z-10"></div>
    </div>
  );
};

export default Dashboard;
