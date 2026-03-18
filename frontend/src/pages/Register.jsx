import React, { useState, useEffect, useRef, useCallback } from "react"
import API from "../api/axios"

const EMOJIS = ["🐛","🐞","🦗","🐜","🦟","🐝","🦋","🪲","🦠","🪳","🐌","🦎"]

function useBugs() {
  const [bugs, setBugs] = useState([])
  const [caught, setCaught] = useState(0)
  const [toast, setToast] = useState(false)
  const frameRef = useRef()

  const spawnBug = useCallback(() => {
    setBugs(prev => {
      if (prev.length >= 13) return prev
      return [...prev, {
        id: Date.now() + Math.random(),
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        x: 5 + Math.random() * 88,
        y: 5 + Math.random() * 88,
        ang: Math.random() * 360,
        dir: Math.random() * 360,
        spd: 0.2 + Math.random() * 0.35,
        hov: false,
        dead: false,
      }]
    })
  }, [])

  const catchBug = useCallback((id) => {
    setBugs(prev => prev.map(b => b.id === id ? { ...b, dead: true } : b))
    setCaught(c => c + 1)
    setToast(true)
    setTimeout(() => setToast(false), 2000)
    setTimeout(() => {
      setBugs(prev => prev.filter(b => b.id !== id))
      spawnBug()
    }, 400)
  }, [spawnBug])

  const hoverBug = useCallback((id, on) => {
    setBugs(prev => prev.map(b => b.id === id ? { ...b, hov: on } : b))
  }, [])

  useEffect(() => {
    for (let i = 0; i < 12; i++) setTimeout(spawnBug, i * 180)
    const iv = setInterval(() => setBugs(b => { if (b.length < 12) spawnBug(); return b }), 5000)
    return () => { clearInterval(iv); cancelAnimationFrame(frameRef.current) }
  }, [spawnBug])

  useEffect(() => {
    let last = 0
    const crawl = (ts) => {
      frameRef.current = requestAnimationFrame(crawl)
      if (ts - last < 55) return
      last = ts
      setBugs(prev => prev.map(b => {
        if (b.dead || b.hov) return b
        let { x, y, dir, ang, spd } = b
        dir += (Math.random() - 0.5) * 16
        x += Math.cos(dir * Math.PI / 180) * spd * 0.09
        y += Math.sin(dir * Math.PI / 180) * spd * 0.09
        if (x < 3)  { x = 3;  dir = 180 - dir }
        if (x > 92) { x = 92; dir = 180 - dir }
        if (y < 3)  { y = 3;  dir = -dir }
        if (y > 92) { y = 92; dir = -dir }
        ang += (Math.random() - 0.5) * 2
        return { ...b, x, y, dir, ang }
      }))
    }
    frameRef.current = requestAnimationFrame(crawl)
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  return { bugs, caught, toast, catchBug, hoverBug }
}

const Register = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)
  const { bugs, caught, toast, catchBug, hoverBug } = useBugs()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      await API.post("/user/register", {
        name: "NewUser",
        email,
        password,
        role: "developer",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .rg-page {
          min-height: 100vh;
          background: #f0f7ff;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Nunito', sans-serif;
          position: relative; overflow: hidden; padding: 24px;
        }

        .blob {
          position: absolute; border-radius: 50%;
          filter: blur(60px); opacity: 0.55; pointer-events: none; z-index: 0;
        }

        .rg-card {
          position: relative; z-index: 2;
          background: #fff;
          border-radius: 24px;
          border: 1.5px solid #e2ecf8;
          box-shadow: 0 4px 40px rgba(80,120,200,0.10), 0 1px 6px rgba(0,0,0,0.04);
          width: 100%; max-width: 440px;
          padding: 40px 40px 32px;
          animation: popIn .5s cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes popIn {
          from { opacity:0; transform:scale(.96) translateY(18px) }
          to   { opacity:1; transform:scale(1) translateY(0) }
        }

        .brand { display:flex; align-items:center; gap:10px; margin-bottom:28px }
        .brand-logo {
          width:44px; height:44px; border-radius:14px;
          background: linear-gradient(135deg,#6366f1,#818cf8);
          display:flex; align-items:center; justify-content:center; font-size:22px;
          box-shadow: 0 4px 12px rgba(99,102,241,.3); flex-shrink:0;
        }
        .brand-name { font-size:20px; font-weight:900; color:#1e293b; letter-spacing:-.02em }
        .brand-tag  { font-size:11px; font-weight:700; color:#6366f1; font-family:'JetBrains Mono',monospace; letter-spacing:.06em }

        .caught-pill {
          display:inline-flex; align-items:center; gap:6px;
          background:#fef3c7; border:1.5px solid #fde68a;
          border-radius:30px; padding:5px 14px;
          font-size:12px; font-weight:700; color:#92400e;
          margin-bottom:22px;
        }

        .rg-title { font-size:28px; font-weight:900; color:#1e293b; margin-bottom:4px; letter-spacing:-.02em }
        .rg-sub   { font-size:13px; color:#94a3b8; margin-bottom:28px; font-family:'JetBrains Mono',monospace; font-weight:500 }

        .field { margin-bottom:16px }
        .field label {
          display:block; font-size:12px; font-weight:800; color:#475569;
          margin-bottom:7px; letter-spacing:.04em; text-transform:uppercase;
        }
        .fi { position:relative }
        .fi svg {
          position:absolute; left:14px; top:50%; transform:translateY(-50%);
          pointer-events:none; transition:color .2s; color:#cbd5e1;
        }
        .fi.focused svg { color:#6366f1 }
        .fi input {
          width:100%; padding:12px 14px 12px 42px;
          background:#f8fafc; border:2px solid #e2e8f0; border-radius:12px;
          font-size:14px; font-weight:600; color:#1e293b; outline:none;
          font-family:'Nunito',sans-serif;
          transition:border-color .2s, background .2s, box-shadow .2s;
        }
        .fi input::placeholder { color:#c8d3df; font-weight:500 }
        .fi.focused input {
          border-color:#6366f1; background:#fff;
          box-shadow:0 0 0 4px rgba(99,102,241,.1);
        }

        .divider { display:flex; align-items:center; gap:10px; margin:20px 0 }
        .dl { flex:1; height:1.5px; background:#f1f5f9 }
        .dt { font-size:11px; font-weight:700; color:#cbd5e1; font-family:'JetBrains Mono',monospace; letter-spacing:.08em; white-space:nowrap }

        .btn {
          width:100%; padding:14px; border:none; border-radius:14px;
          background:linear-gradient(135deg,#6366f1 0%,#818cf8 100%);
          color:#fff; font-family:'Nunito',sans-serif;
          font-size:15px; font-weight:800; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          box-shadow:0 4px 16px rgba(99,102,241,.35);
          transition:transform .15s, box-shadow .15s, opacity .15s;
          letter-spacing:.01em;
        }
        .btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(99,102,241,.4) }
        .btn:active:not(:disabled) { transform:scale(.98) }
        .btn:disabled { opacity:.5; cursor:not-allowed; transform:none }

        .login-row { text-align:center; font-size:12px; font-weight:700; color:#94a3b8; margin-top:18px }
        .login-row a { color:#6366f1; text-decoration:none }
        .login-row a:hover { text-decoration:underline }

        .spin {
          width:16px; height:16px;
          border:2.5px solid rgba(255,255,255,.35); border-top-color:#fff;
          border-radius:50%; animation:spin .7s linear infinite;
        }
        @keyframes spin { to { transform:rotate(360deg) } }

        /* floating bugs */
        .fbug {
          position:absolute; font-size:26px; cursor:pointer;
          pointer-events:all; user-select:none;
          transition:transform .3s cubic-bezier(.34,1.56,.64,1), filter .3s, opacity .3s;
          filter:drop-shadow(0 2px 6px rgba(0,0,0,.10));
          z-index:1;
        }
        .fbug:hover {
          filter:drop-shadow(0 4px 16px rgba(99,102,241,.5)) brightness(1.15);
          z-index:20;
        }
        .fbug.hovered { transform:scale(1.8) translateY(-8px) !important }
        .fbug.dead    { transform:scale(0) rotate(720deg) !important; opacity:0 !important; pointer-events:none }

        /* toast */
        .rg-toast {
          position:fixed; bottom:28px; left:50%;
          transform:translateX(-50%) translateY(70px);
          background:#fff; border:2px solid #fde68a; border-radius:16px;
          padding:10px 20px; font-size:13px; font-weight:800; color:#92400e;
          box-shadow:0 4px 20px rgba(0,0,0,.12);
          transition:transform .4s cubic-bezier(.34,1.56,.64,1), opacity .3s;
          opacity:0; z-index:999; pointer-events:none; white-space:nowrap;
        }
        .rg-toast.show { transform:translateX(-50%) translateY(0); opacity:1 }
      `}</style>

      <div className="rg-page">
        {/* soft blobs */}
        <div className="blob" style={{ width:320, height:320, background:"#c7d2fe", top:-80, left:-60 }} />
        <div className="blob" style={{ width:260, height:260, background:"#fde68a", bottom:-60, right:-40 }} />
        <div className="blob" style={{ width:180, height:180, background:"#bbf7d0", top:"40%", left:"10%" }} />

        {/* animated bugs */}
        {bugs.map(b => (
          <div
            key={b.id}
            className={`fbug${b.hov ? " hovered" : ""}${b.dead ? " dead" : ""}`}
            style={{
              left: b.x + "%",
              top:  b.y + "%",
              transform: b.hov
                ? `scale(1.8) translateY(-8px) rotate(${b.ang}deg)`
                : `rotate(${b.ang}deg)`,
            }}
            onMouseEnter={() => hoverBug(b.id, true)}
            onMouseLeave={() => hoverBug(b.id, false)}
            onClick={() => catchBug(b.id)}
          >
            {b.emoji}
          </div>
        ))}

        {/* card */}
        <div className="rg-card">
          <div className="brand">
            <div className="brand-logo">🐛</div>
            <div>
              <div className="brand-name">BugRadar</div>
              <div className="brand-tag">Bug Tracking System</div>
            </div>
          </div>

          <div className="caught-pill">
            <span>🐞</span> <span>{caught}</span> bugs squashed today!
          </div>

          <div className="rg-title">Create Account</div>
          <div className="rg-sub">// start tracking bugs</div>

          <div className="field">
            <label>Email Address</label>
            <div className={`fi${focused === "email" ? " focused" : ""}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                stroke="currentColor" strokeWidth="1.6">
                <rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/>
                <path d="M1.5 5l6.5 4.5L14.5 5"/>
              </svg>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className={`fi${focused === "password" ? " focused" : ""}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="7" width="10" height="7" rx="1.5"/>
                <path d="M5.5 7V5.5a2.5 2.5 0 015 0V7" strokeLinecap="round"/>
              </svg>
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>

          <div className="divider">
            <div className="dl"/>
            <span className="dt">DEVELOPER ACCOUNT</span>
            <div className="dl"/>
          </div>

          <button
            className="btn"
            onClick={handleSubmit}
            disabled={loading || !email || !password}
          >
            {loading ? (
              <div className="spin"/>
            ) : (
              <>
                Create Account
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 9h10M10 5l4 4-4 4" stroke="white" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>

          <div className="login-row">
            Already have an account? <a href="/login">Sign in →</a>
          </div>
        </div>

        {/* toast */}
        <div className={`rg-toast${toast ? " show" : ""}`}>
          🎉 Bug caught! Keep squashing!
        </div>
      </div>
    </>
  )
}

export default Register