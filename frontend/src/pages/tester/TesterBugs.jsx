import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { SkeletonTable, SkeletonParticles } from "../../components/skeleton";

// ─── Status helpers ─────────────────────────────────────────────────────────
const ACTIVE_STATUSES = ["draft", "open", "submitted", "in_progress", "retest", "resolved", "reopened"];
const CLOSED_STATUSES  = ["closed"];

const severityColor = (s) =>
  s === "critical" ? "bg-red-100 text-red-700" :
  s === "high"     ? "bg-orange-100 text-orange-700" :
  s === "medium"   ? "bg-yellow-100 text-yellow-700" :
                     "bg-blue-100 text-blue-700";

const priorityColor = (p) =>
  p === "high" ? "bg-rose-100 text-rose-700" :
  p === "low"  ? "bg-slate-100 text-slate-700" :
                 "bg-amber-100 text-amber-700";

const statusBadge = (s) => {
  const map = {
    open: "border-amber-200 text-amber-600 bg-amber-50",
    submitted: "border-amber-200 text-amber-600 bg-amber-50",
    in_progress: "border-blue-200 text-blue-600 bg-blue-50",
    retest: "border-purple-200 text-purple-600 bg-purple-50",
    resolved: "border-purple-200 text-purple-600 bg-purple-50",
    reopened: "border-rose-200 text-rose-600 bg-rose-50",
    closed: "border-emerald-200 text-emerald-600 bg-emerald-50",
    draft: "border-slate-200 text-slate-500 bg-slate-50",
  };
  return map[s?.toLowerCase()] || "border-slate-200 text-slate-600 bg-slate-50";
};

const canTesterAct = (status) =>
  ["retest", "resolved"].includes(status?.toLowerCase());

// ─── Dev Avatar ──────────────────────────────────────────────────────────────
const DevAvatar = ({ dev }) => {
  if (!dev) return <span className="font-bold text-slate-400 italic text-xs">Unassigned</span>;
  return (
    <div className="flex items-center gap-2" title={`${dev.email || ""} · ${dev.role || ""}`}>
      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
        {dev.profilePicture
          ? <img src={dev.profilePicture} alt={dev.name} className="w-full h-full object-cover" />
          : <span>{dev.name?.charAt(0) || "D"}</span>}
      </div>
      <span className="font-bold text-slate-700 text-xs">{dev.name}</span>
    </div>
  );
};

// ─── Resolution time helper ──────────────────────────────────────────────────
const resolutionTime = (createdAt, updatedAt) => {
  if (!createdAt || !updatedAt) return "—";
  const ms  = new Date(updatedAt) - new Date(createdAt);
  const hrs = Math.round(ms / 3600000);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
};

// ════════════════════════════════════════════════════════════════════════════
const TesterBugs = () => {
  const navigate = useNavigate();

  const [allMyBugs, setAllMyBugs] = useState([]);
  const [loading, setLoading]     = useState(true);

  // Active bugs filters
  const [search,         setSearch]         = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter,   setStatusFilter]   = useState("all");

  // Closed history filters
  const [closedSearch,   setClosedSearch]   = useState("");
  const [closedSev,      setClosedSev]      = useState("all");
  const [closedDev,      setClosedDev]      = useState("all");

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        // Use tester-scoped endpoint — server filters by authenticated user
        const res = await API.get("/bug/my-bugs");
        setAllMyBugs(res.data.data || []);
      } catch (err) {
        console.error("Error fetching bugs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBugs();
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-fade-in" style={{ position: 'relative' }}>
      <SkeletonParticles count={5} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex justify-between items-center mb-6">
          <div className="skeleton-shimmer" style={{ height: 28, width: 200, borderRadius: 10 }} />
          <div className="skeleton-shimmer" style={{ height: 40, width: 140, borderRadius: 12 }} />
        </div>
        <SkeletonTable rows={5} columns={7} />
        <div style={{ marginTop: 32 }}>
          <div className="skeleton-shimmer" style={{ height: 22, width: 180, borderRadius: 8, marginBottom: 16 }} />
          <SkeletonTable rows={4} columns={9} />
        </div>
      </div>
    </div>
  );

  // ── Split into Active / Closed ────────────────────────────────────────────
  const activeBugs = allMyBugs.filter(b => ACTIVE_STATUSES.includes(b.status?.toLowerCase()));
  const closedBugs = allMyBugs.filter(b => CLOSED_STATUSES.includes(b.status?.toLowerCase()));

  // ── Active filter chain ───────────────────────────────────────────────────
  const filteredActive = activeBugs.filter(b => {
    const matchSearch   = !search || b.bugTitle?.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === "all" || b.severity === severityFilter;
    const matchStatus   = statusFilter   === "all" || b.status?.toLowerCase() === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });

  // ── Closed filter chain ───────────────────────────────────────────────────
  const uniqueDevs = [...new Map(
    closedBugs.filter(b => b.assignedDeveloper).map(b => [b.assignedDeveloper._id, b.assignedDeveloper])
  ).values()];

  const filteredClosed = closedBugs.filter(b => {
    const matchSearch = !closedSearch || b.bugTitle?.toLowerCase().includes(closedSearch.toLowerCase());
    const matchSev    = closedSev === "all" || b.severity === closedSev;
    const matchDev    = closedDev === "all" || b.assignedDeveloper?._id === closedDev;
    return matchSearch && matchSev && matchDev;
  });

  return (
    <div className="space-y-10 animate-fade-in pb-10">

      {/* ══════ SECTION 1: ACTIVE BUG REPORTS ══════ */}
      <div>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800">My Bug Reports</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Active Issues · {activeBugs.length} total
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search bugs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="custom-select w-44"
            />
            <select className="custom-select" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select className="custom-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="retest">Retest</option>
              <option value="resolved">Resolved</option>
              <option value="reopened">Reopened</option>
            </select>
            <button onClick={() => navigate("/create-bug")} className="btn-primary !py-2 !px-4">
              + Report Bug
            </button>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4 text-[10px] uppercase tracking-widest">Bug Incident</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest">Assigned Developer</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest">Severity</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest">Priority</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest">Created</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredActive.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-10 text-center font-bold text-slate-400 italic">
                      No active bugs match your criteria.
                    </td>
                  </tr>
                ) : filteredActive.map(bug => (
                  <tr key={bug._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                    <td className="p-4 max-w-[220px]">
                      <p className="font-bold text-slate-800 leading-tight">{bug.bugTitle}</p>
                      <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{bug.stepsToReproduce}</p>
                    </td>
                    <td className="p-4"><DevAvatar dev={bug.assignedDeveloper} /></td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${severityColor(bug.severity)}`}>
                        {bug.severity || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${priorityColor(bug.priority)}`}>
                        {bug.priority || "medium"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded border text-xs font-bold ${statusBadge(bug.status)}`}>
                        {bug.status || "open"}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-400">
                      {new Date(bug.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {/* Only action is View Details — all workflow inside the detail page */}
                      <button
                        onClick={() => navigate(`/bug-detail/${bug._id}`)}
                        className="px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg text-xs transition border border-indigo-200"
                      >
                        {canTesterAct(bug.status) ? "🔍 Review & Act" : "View Details"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ══════ SECTION 2: CLOSED BUG HISTORY ══════ */}
      <div>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-700 flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-400 rounded-full inline-block"></span>
              Closed Bug History
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Verified &amp; Resolved · {closedBugs.length} total
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search closed..."
              value={closedSearch}
              onChange={e => setClosedSearch(e.target.value)}
              className="custom-select w-40"
            />
            <select className="custom-select" value={closedSev} onChange={e => setClosedSev(e.target.value)}>
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            {uniqueDevs.length > 0 && (
              <select className="custom-select" value={closedDev} onChange={e => setClosedDev(e.target.value)}>
                <option value="all">All Developers</option>
                {uniqueDevs.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="glass-card overflow-hidden border-l-4 border-l-emerald-400">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-emerald-50/60 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4 text-[10px] uppercase tracking-widest">Bug</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest">Module</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest">Developer</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest">Severity</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest">Priority</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest">Created</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest">Resolution</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest">Comments</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {filteredClosed.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-10 text-center font-bold text-slate-400 italic">
                      {closedBugs.length === 0
                        ? "No closed bugs yet — closed bugs will appear here after you verify a fix."
                        : "No closed bugs match your filters."}
                    </td>
                  </tr>
                ) : filteredClosed.map(bug => (
                  <tr key={bug._id} className="border-b border-slate-100 hover:bg-emerald-50/30 transition">
                    <td className="p-4 max-w-[180px]">
                      <p className="font-bold text-slate-700 text-xs leading-tight">{bug.bugTitle}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">#{bug._id.slice(-6)}</p>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-500">{bug.moduleId?.moduleName || "General"}</td>
                    <td className="p-4"><DevAvatar dev={bug.assignedDeveloper} /></td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${severityColor(bug.severity)}`}>
                        {bug.severity || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${priorityColor(bug.priority)}`}>
                        {bug.priority || "medium"}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-400">
                      {new Date(bug.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-xs font-bold text-emerald-600">
                      {resolutionTime(bug.createdAt, bug.updatedAt)}
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-500 text-center">
                      {bug.reviewComments?.length || 0}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => navigate(`/bug-detail/${bug._id}`)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition border border-emerald-200"
                      >
                        History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TesterBugs;
