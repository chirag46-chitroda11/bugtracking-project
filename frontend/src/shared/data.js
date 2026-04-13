// ─── SHARED DATA STORE ────────────────────────────────────────────────────────
// shared/data.js  –  import this into every dashboard

export const INITIAL_DB = {
  users: [
    { id:"u1", name:"Admin User",  email:"admin@bugflow.io",  role:"admin",     av:"A", color:"#ef4444" },
    { id:"u2", name:"Sarah PM",    email:"sarah@bugflow.io",  role:"pm",        av:"S", color:"#8b5cf6" },
    { id:"u3", name:"Alex Dev",    email:"alex@bugflow.io",   role:"developer", av:"A", color:"#6c63ff" },
    { id:"u4", name:"Jordan Dev",  email:"jordan@bugflow.io", role:"developer", av:"J", color:"#3b82f6" },
    { id:"u5", name:"Maya Tester", email:"maya@bugflow.io",   role:"tester",    av:"M", color:"#22c55e" },
    { id:"u6", name:"Raj Tester",  email:"raj@bugflow.io",    role:"tester",    av:"R", color:"#f59e0b" },
  ],
  projects: [
    { id:"p1", name:"E-Commerce Platform",   desc:"Full stack online store with payment integration",       status:"active",   deadline:"2025-06-30", pm:"u2", team:["u3","u4","u5"] },
    { id:"p2", name:"HR Management System",  desc:"Internal HR portal for employee management and payroll", status:"active",   deadline:"2025-08-15", pm:"u2", team:["u3","u6"] },
    { id:"p3", name:"Mobile Banking App",    desc:"Cross-platform mobile app for digital banking services", status:"planning", deadline:"2025-12-01", pm:"u2", team:["u4","u5"] },
  ],
  modules: [
    { id:"m1", pid:"p1", name:"User Authentication", desc:"Login, register, OAuth, sessions" },
    { id:"m2", pid:"p1", name:"Product Catalog",     desc:"Listings, search, categories" },
    { id:"m3", pid:"p1", name:"Checkout & Payments", desc:"Cart, orders, Stripe integration" },
    { id:"m4", pid:"p2", name:"Employee Profiles",   desc:"CRUD, documents, records" },
    { id:"m5", pid:"p2", name:"Payroll Engine",      desc:"Salary calc, disbursement" },
    { id:"m6", pid:"p3", name:"Core Banking",        desc:"Accounts, transfers, statements" },
  ],
  tasks: [
    { id:"t1", name:"Implement JWT Authentication",  desc:"Set up JWT-based auth with refresh tokens. Include login, logout, token rotation, and middleware guard.", pid:"p1", mid:"m1", assignee:"u3", status:"Testing",     priority:"High",     due:"2025-02-01", timeSpent:14.5, bugCount:2, reassign:1 },
    { id:"t2", name:"Build Product Search API",      desc:"Elasticsearch-powered search with filters, sorting, and pagination. Must support full-text and faceted search.", pid:"p1", mid:"m2", assignee:"u4", status:"In Progress", priority:"Medium",   due:"2025-02-15", timeSpent:8,    bugCount:0, reassign:0 },
    { id:"t3", name:"Stripe Payment Integration",    desc:"Integrate Stripe checkout, webhooks for confirmation, refund handling and subscription billing.", pid:"p1", mid:"m3", assignee:"u3", status:"Bug Fix",     priority:"Critical", due:"2025-01-28", timeSpent:22,   bugCount:3, reassign:2 },
    { id:"t4", name:"Employee Onboarding Flow",      desc:"Multi-step form: personal info, document upload, benefits selection.", pid:"p2", mid:"m4", assignee:"u3", status:"Open",        priority:"Medium",   due:"2025-03-01", timeSpent:0,    bugCount:0, reassign:0 },
    { id:"t5", name:"Salary Calculation Module",     desc:"Payroll engine: gross to net with deductions, taxes and allowances.", pid:"p2", mid:"m5", assignee:"u4", status:"Completed",   priority:"High",     due:"2025-01-25", timeSpent:31,   bugCount:1, reassign:1 },
    { id:"t6", name:"Password Reset Flow",           desc:"Email-based password reset with OTP, rate limiting, secure token handling.", pid:"p1", mid:"m1", assignee:"u4", status:"Completed",   priority:"Low",      due:"2025-01-20", timeSpent:6,    bugCount:0, reassign:0 },
    { id:"t7", name:"Account Balance API",           desc:"Real-time account balance fetch with currency support and audit logging.", pid:"p3", mid:"m6", assignee:"u4", status:"Open",        priority:"High",     due:"2025-03-15", timeSpent:0,    bugCount:0, reassign:0 },
  ],
  bugs: [
    { id:"b1", tid:"t1", title:"Token not invalidated on logout",   desc:"After calling /logout, the old JWT is still valid until expiry. Should blacklist on Redis.", sev:"High",     reporter:"u5", assignee:"u3", status:"Open",   date:"2025-01-20" },
    { id:"b2", tid:"t1", title:"Refresh token race condition",       desc:"Concurrent requests with expiring token cause duplicate refresh and one fails with 401.", sev:"Medium",   reporter:"u5", assignee:"u3", status:"Open",   date:"2025-01-21" },
    { id:"b3", tid:"t3", title:"Webhook duplicate processing",       desc:"Stripe webhook fires twice for some events, causing double-charge. Add idempotency key.", sev:"Critical", reporter:"u5", assignee:"u3", status:"Open",   date:"2025-01-22" },
    { id:"b4", tid:"t3", title:"Refund not reflected in dashboard",  desc:'After refund via Stripe, the order status remains "paid" in DB.',                          sev:"High",     reporter:"u6", assignee:"u3", status:"Open",   date:"2025-01-23" },
    { id:"b5", tid:"t5", title:"Tax calculation off by 0.01",        desc:"Floating point issue in salary computation. Needs Decimal library.",                        sev:"Medium",   reporter:"u6", assignee:"u4", status:"Closed", date:"2025-01-15" },
  ],
  comments: [
    { id:"c1", tid:"t1", author:"u5", text:"Test run complete. Found 2 issues — see bug reports B001 & B002. Reassigning for fixes.", isBug:false, date:"2025-01-20 14:30" },
    { id:"c2", tid:"t1", author:"u3", text:"Working on the token blacklist using Redis with TTL matching JWT expiry.", isBug:false, date:"2025-01-20 16:00" },
    { id:"c3", tid:"t3", author:"u5", text:"Critical: Stripe webhooks firing duplicate events. Payment doubled for test card. Blocking release.", isBug:true, date:"2025-01-22 11:00" },
    { id:"c4", tid:"t3", author:"u3", text:"Confirmed the issue. Adding idempotency key to webhook handler. ETA: 2 days.", isBug:false, date:"2025-01-22 13:30" },
    { id:"c5", tid:"t5", author:"u6", text:"Tax bracket computation has floating point error. Using toFixed(2) workaround.", isBug:true, date:"2025-01-15 09:00" },
    { id:"c6", tid:"t5", author:"u4", text:"Fixed by switching to BigDecimal arithmetic. All test cases pass now.", isBug:false, date:"2025-01-16 11:00" },
  ],
  activity: [
    { text:"Maya Tester reported a critical bug in Stripe Payment Integration", time:"2 hours ago" },
    { text:"Alex Dev submitted JWT Authentication task for testing",             time:"4 hours ago" },
    { text:"Jordan Dev completed Salary Calculation Module",                     time:"Yesterday" },
    { text:"Sarah PM created new project: Mobile Banking App",                   time:"2 days ago" },
    { text:"Raj Tester closed bug #B005 in Payroll Engine",                      time:"3 days ago" },
    { text:"Alex Dev reassigned task T003 after bug fixes",                      time:"4 days ago" },
  ],
};

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
export const byId = (arr, id) => arr.find(x => x.id === id);

export const calcScore = (uid, db) => {
  const tasks = db.tasks.filter(t => t.assignee === uid);
  const done  = tasks.filter(t => t.status === "Completed");
  const bugs  = db.bugs.filter(b => b.assignee === uid).length;
  const reasn = tasks.reduce((a, t) => a + t.reassign, 0);
  const avg   = done.length ? done.reduce((a, t) => a + t.timeSpent, 0) / done.length : 0;
  let s = 100;
  s -= bugs * 8; s -= reasn * 5; s -= Math.max(0, avg - 10) * 0.5; s += done.length * 4;
  return Math.max(0, Math.min(100, Math.round(s)));
};

// ─── SHARED BADGE STYLES (consistent across ALL dashboards) ──────────────────
export const STATUS_CLS = {
  "Open":        "bg-blue-100 text-blue-700 border border-blue-200",
  "In Progress": "bg-indigo-100 text-indigo-700 border border-indigo-200",
  "Testing":     "bg-amber-100 text-amber-700 border border-amber-200",
  "Bug Fix":     "bg-red-100 text-red-700 border border-red-200",
  "Completed":   "bg-green-100 text-green-700 border border-green-200",
};
export const PRI_CLS = {
  "Critical": "bg-red-100 text-red-700 border border-red-200",
  "High":     "bg-orange-100 text-orange-700 border border-orange-200",
  "Medium":   "bg-indigo-100 text-indigo-700 border border-indigo-200",
  "Low":      "bg-sky-100 text-sky-700 border border-sky-200",
};
export const ROLE_CLS = {
  "admin":     "bg-red-100 text-red-700 border border-red-200",
  "pm":        "bg-amber-100 text-amber-700 border border-amber-200",
  "developer": "bg-indigo-100 text-indigo-700 border border-indigo-200",
  "tester":    "bg-green-100 text-green-700 border border-green-200",
};
export const SEV_CLS = {
  "Critical": "bg-red-100 text-red-700 border border-red-200",
  "High":     "bg-orange-100 text-orange-700 border border-orange-200",
  "Medium":   "bg-amber-100 text-amber-700 border border-amber-200",
  "Low":      "bg-sky-100 text-sky-700 border border-sky-200",
};
