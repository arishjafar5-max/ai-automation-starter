import { useState, useEffect, useRef } from "react";

const API = process.env.REACT_APP_API_URL || "${API}";

// ── Design tokens (defined outside render per React guidelines) ─────────────────
const T = {
  // Colors — Teal SaaS palette
  primary:   "#0D9488",
  primary2:  "#0F766E",
  secondary: "#14B8A6",
  cta:       "#F97316",
  ctaHover:  "#EA6C0A",
  bg:        "#F0FDFA",
  surface:   "#FFFFFF",
  border:    "#CCFBF1",
  border2:   "#99F6E4",
  text:      "#134E4A",
  textMid:   "#115E59",
  textMute:  "#5EACA4",
  textLight: "#99D5D0",
  success:   "#059669",
  warn:      "#D97706",
  danger:    "#DC2626",
  dangerBg:  "#FEF2F2",
  dangerBdr: "#FECACA",

  // Spacing
  radius:    "10px",
  radiusLg:  "16px",
  radiusSm:  "6px",

  // Transitions (150-200ms per skill guideline)
  trans:     "all 0.18s ease",
};

// ── SVG Icons (no emojis per skill guideline) ──────────────────────────────────
const Icon = {
  bolt: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  checkCircle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  arrowRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  arrowLeft: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  tool: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  copy: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  clock: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  zap: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  alertCircle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  users: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  layers: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  trending: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
};

// ── Animated Number ────────────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const inc = value / (duration / 16);
    const t = setInterval(() => {
      start += inc;
      if (start >= value) { setDisplay(value); clearInterval(t); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [value]);
  return <span>{display}</span>;
}

// ── Pill Badge ─────────────────────────────────────────────────────────────────
function Pill({ children, color = T.primary, size = "md" }) {
  const pad = size === "sm" ? "2px 8px" : "3px 10px";
  const fs = size === "sm" ? 11 : 12;
  return (
    <span style={{
      background: color + "18", color,
      border: `1px solid ${color}30`,
      borderRadius: 20, padding: pad,
      fontSize: fs, fontWeight: 600,
      letterSpacing: "0.01em", whiteSpace: "nowrap",
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      {children}
    </span>
  );
}

// ── Step Progress ──────────────────────────────────────────────────────────────
function StepProgress({ current, total, labels }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: T.textMute, fontWeight: 500 }}>
          Step {current + 1} of {total}
        </span>
        <span style={{ fontSize: 13, color: T.primary, fontWeight: 600 }}>
          {labels[current]}
        </span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= current ? T.primary : T.border2,
            transition: T.trans,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Difficulty Badge ───────────────────────────────────────────────────────────
function DiffBadge({ difficulty }) {
  const map = { Easy: T.success, Medium: T.warn, Hard: T.danger };
  return <Pill color={map[difficulty] || T.primary}>{difficulty}</Pill>;
}

// ── Agent Card ─────────────────────────────────────────────────────────────────
function AgentCard({ task, index, onDeploy }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onDeploy(index)}
      onKeyDown={e => e.key === "Enter" && onDeploy(index)}
      style={{
        background: T.surface,
        border: `2px solid ${hovered ? T.primary : T.border}`,
        borderRadius: T.radiusLg,
        padding: "22px 24px",
        marginBottom: 12,
        cursor: "pointer",
        transition: T.trans,
        outline: "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: T.radius,
            background: T.bg,
            border: `2px solid ${T.border2}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.primary, fontWeight: 800, fontSize: 15, flexShrink: 0,
          }}>
            {index + 1}
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: T.text, letterSpacing: "-0.01em" }}>
            {task.name}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 12 }}>
          <DiffBadge difficulty={task.difficulty} />
          <Pill color={T.success}>
            {Icon.clock}&nbsp;~{task.hours_saved}h/wk
          </Pill>
        </div>
      </div>

      <p style={{ color: T.textMute, fontSize: 14, margin: "0 0 14px 50px", lineHeight: 1.65 }}>
        {task.reason}
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginLeft: 50 }}>
        <Pill color={T.primary} size="sm">
          {Icon.tool}&nbsp;{task.tool}
        </Pill>
        <button
          tabIndex={-1}
          onClick={e => { e.stopPropagation(); onDeploy(index); }}
          style={{
            background: hovered ? T.cta : "transparent",
            color: hovered ? "#fff" : T.cta,
            border: `2px solid ${T.cta}`,
            borderRadius: T.radiusSm,
            padding: "6px 16px",
            fontSize: 13, fontWeight: 700,
            cursor: "pointer",
            transition: T.trans,
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          Get plan {Icon.arrowRight}
        </button>
      </div>
    </div>
  );
}

// ── Analyzing View ─────────────────────────────────────────────────────────────
function AnalyzingView({ progress, status, error }) {
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "48px 32px" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: T.dangerBg, border: `2px solid ${T.dangerBdr}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.danger, margin: "0 auto 20px",
        }}>
          {Icon.alertCircle}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 8 }}>
          Could not connect
        </div>
        <div style={{
          background: T.dangerBg, border: `1px solid ${T.dangerBdr}`,
          borderRadius: T.radius, padding: "14px 20px",
          color: T.danger, fontSize: 14, lineHeight: 1.6,
          maxWidth: 420, margin: "0 auto",
          textAlign: "left",
        }}>
          <strong>Error:</strong> {error}
          <div style={{ marginTop: 10, color: "#991B1B", fontSize: 13 }}>
            Start the backend: <code style={{ background: "#fee2e2", padding: "1px 6px", borderRadius: 4 }}>
              cd backend && uvicorn main:app --reload
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "56px 32px" }}>
      {/* Flat spinner */}
      <div style={{ position: "relative", width: 64, height: 64, margin: "0 auto 28px" }}>
        <div style={{
          position: "absolute", inset: 0,
          border: `4px solid ${T.border2}`,
          borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          border: "4px solid transparent",
          borderTopColor: T.primary,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.primary,
        }}>
          {Icon.bolt}
        </div>
      </div>

      <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 6 }}>
        Analyzing your workflow
      </div>
      <div style={{ color: T.textMute, fontSize: 15, marginBottom: 28, minHeight: 22 }}>
        {status}
      </div>

      <div style={{ width: 300, margin: "0 auto 10px", height: 6, background: T.border, borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: progress >= 100 ? T.success : T.primary,
          borderRadius: 3,
          transition: progress >= 100 ? "width 0.4s ease, background 0.3s ease" : "width 0.9s ease",
        }} />
      </div>
      <div style={{ fontSize: 13, color: T.textLight, fontWeight: 500 }}>
        {progress >= 100 ? "Done — loading results..." : `${Math.floor(progress)}%`}
      </div>
    </div>
  );
}

// ── Blueprint Guide ────────────────────────────────────────────────────────────
function BlueprintView({ guide, loading }) {
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: 14 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 5, height: 22, background: T.primary,
              borderRadius: 3, opacity: 0.3,
              animation: `barPulse 1s ease-in-out ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
        <div style={{ color: T.textMute, fontSize: 15 }}>Building your automation plan...</div>
      </div>
    );
  }

  if (!guide) return null;

  const lines = guide.split("\n");
  return (
    <div style={{ fontSize: 15, lineHeight: 1.8, color: T.textMid }}>
      {lines.map((line, i) => {
        if (line.startsWith("STEP ") || line.startsWith("WHAT YOU")) {
          return (
            <div key={i} style={{ marginTop: i > 0 ? 22 : 0, marginBottom: 8 }}>
              <span style={{
                display: "inline-block",
                background: T.primary,
                color: "#fff",
                borderRadius: T.radiusSm,
                padding: "3px 12px",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
              }}>
                {line}
              </span>
            </div>
          );
        }
        if (line.startsWith("TIME TO") || line.startsWith("ESTIMATED")) {
          return (
            <div key={i} style={{
              marginTop: 18,
              padding: "10px 14px",
              background: "#F0FDF4",
              border: `1px solid #BBF7D0`,
              borderRadius: T.radius,
              color: T.success, fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ color: T.success }}>{Icon.checkCircle}</span>
              {line}
            </div>
          );
        }
        if (line.startsWith("•") || line.startsWith("-")) {
          return (
            <div key={i} style={{ paddingLeft: 18, color: T.textMid, marginBottom: 4, position: "relative" }}>
              <span style={{ position: "absolute", left: 4, color: T.secondary }}>•</span>
              {line.replace(/^[•\-]\s*/, "").replace(/\*\*/g, "")}
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} style={{ height: 10 }} />;
        return (
          <div key={i} style={{ color: T.textMid, marginBottom: 4 }}>
            {line.replace(/\*\*/g, "").replace(/#{1,3} /g, "")}
          </div>
        );
      })}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, suffix, color }) {
  return (
    <div style={{
      background: T.surface,
      border: `2px solid ${T.border}`,
      borderRadius: T.radiusLg,
      padding: "22px 18px",
      textAlign: "center",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: T.radius,
        background: color + "15",
        display: "flex", alignItems: "center", justifyContent: "center",
        color, margin: "0 auto 12px",
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, color, letterSpacing: "-0.04em", lineHeight: 1 }}>
        <AnimatedNumber value={value} />{suffix}
      </div>
      <div style={{ fontSize: 12, color: T.textMute, marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]           = useState("form");
  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState({
    job_title: "", industry: "", tools_used: "", repeated_tasks: "",
    tech_comfort: 3, hours_wasted: 5,
  });

  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus,   setScanStatus]   = useState("Initializing...");
  const [scanError,    setScanError]    = useState(null);

  const [result,          setResult]          = useState(null);
  const [selectedAgent,   setSelectedAgent]   = useState(null);
  const [blueprint,       setBlueprint]       = useState(null);
  const [blueprintLoading,setBlueprintLoading]= useState(false);
  const [blueprintError,  setBlueprintError]  = useState(null);
  const [copied,          setCopied]          = useState(false);

  const topRef      = useRef(null);
  const scanTimer   = useRef(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const STATUSES = [
    "Parsing your workflow...",
    "Mapping tool integrations...",
    "Identifying automation opportunities...",
    "Ranking by time saved...",
    "Generating automation plans...",
  ];

  const startScan = () => {
    setScanProgress(0); setScanError(null); setScanStatus(STATUSES[0]);
    let prog = 0;
    scanTimer.current = setInterval(() => {
      prog = Math.min(prog + Math.random() * 3.5 + 1, 88);
      setScanProgress(prog);
      setScanStatus(STATUSES[Math.min(Math.floor(prog / 20), STATUSES.length - 1)]);
    }, 500);
  };

  const stopScan = (ok) => {
    clearInterval(scanTimer.current);
    if (ok) { setScanProgress(100); setScanStatus("Complete!"); }
  };

  const submit = async () => {
    setView("analyzing"); startScan();
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    try {
      const res  = await fetch(`${API}/interview`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tech_comfort: parseInt(form.tech_comfort), hours_wasted: parseInt(form.hours_wasted) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Server error ${res.status}`);
      stopScan(true);
      setResult(data);
      setTimeout(() => setView("results"), 600);
    } catch (e) {
      stopScan(false);
      setScanError(e.message || "Could not reach backend.");
    }
  };

  const deployAgent = async (idx) => {
    setSelectedAgent(idx); setBlueprint(null);
    setBlueprintError(null); setBlueprintLoading(true);
    setView("blueprint");
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    try {
      const res  = await fetch(`${API}/guide`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: result.user_id, task_index: idx, tasks: result.tasks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Server error ${res.status}`);
      setBlueprint(data.guide);
    } catch (e) {
      setBlueprintError(e.message || "Could not load plan. Is the backend running?");
    }
    setBlueprintLoading(false);
  };

  const totalSaved = result?.tasks?.reduce((a, t) => a + (t.hours_saved || 0), 0) || 0;

  // ── Shared styles ────────────────────────────────────────────────────────────
  const S = {
    input: {
      width: "100%", padding: "13px 16px",
      background: T.surface, border: `2px solid ${T.border}`,
      borderRadius: T.radius, color: T.text,
      fontSize: 15, outline: "none", boxSizing: "border-box",
      fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
      transition: T.trans,
    },
    label: {
      display: "block", fontSize: 13, fontWeight: 600,
      color: T.textMid, marginBottom: 8,
    },
    btnPrimary: {
      background: T.cta, color: "#fff",
      border: "2px solid transparent",
      padding: "14px 28px", borderRadius: T.radius,
      fontSize: 15, fontWeight: 700, cursor: "pointer",
      width: "100%", transition: T.trans,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
    },
    btnSecondary: {
      background: T.surface, color: T.textMid,
      border: `2px solid ${T.border2}`,
      padding: "12px 22px", borderRadius: T.radius,
      fontSize: 14, fontWeight: 600, cursor: "pointer",
      transition: T.trans,
      display: "flex", alignItems: "center", gap: 6,
      fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
    },
    card: {
      background: T.surface,
      border: `2px solid ${T.border}`,
      borderRadius: T.radiusLg, padding: "36px 40px",
    },
  };

  const STEP_LABELS = ["Your role", "Your tools", "Your tasks", "Final setup"];
  const TOOL_CHIPS  = ["Gmail", "Slack", "Google Sheets", "Notion", "Salesforce", "Zapier", "Airtable", "HubSpot", "Excel", "Outlook", "Jira", "Linear"];

  return (
    <div ref={topRef} style={{
      minHeight: "100vh",
      background: T.bg,
      fontFamily: "'Plus Jakarta Sans', Inter, -apple-system, sans-serif",
      color: T.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input:focus, textarea:focus {
          border-color: ${T.primary} !important;
          box-shadow: 0 0 0 3px ${T.primary}20 !important;
        }
        input[type=range] { accent-color: ${T.primary}; height: 4px; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border2}; border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes barPulse { 0%,100% { opacity: 0.3; transform: scaleY(0.55); } 50% { opacity: 1; transform: scaleY(1); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: translateX(0); } }
        .fade-up  { animation: fadeUp  0.4s ease forwards; }
        .slide-in { animation: slideIn 0.3s ease forwards; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .slide-in { animation: none; }
        }
      `}</style>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header style={{
        borderBottom: `2px solid ${T.border}`,
        padding: "0 32px",
        display: "flex", alignItems: "center", height: 60,
        background: T.surface,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: T.primary,
            borderRadius: T.radiusSm,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
          }}>
            {Icon.bolt}
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em", color: T.text }}>
            AutomateMe
          </span>
        </div>

        <div style={{ marginLeft: 16 }}>
          <Pill color={T.primary} size="sm">AI-powered</Pill>
        </div>

        {result && (
          <button
            style={{ ...S.btnSecondary, marginLeft: "auto", padding: "7px 16px", fontSize: 13, width: "auto" }}
            onClick={() => { setView("form"); setStep(0); setResult(null); setBlueprint(null); setSelectedAgent(null); setScanError(null); }}
          >
            {Icon.arrowLeft} Start over
          </button>
        )}
      </header>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "52px 24px 100px" }}>

        {/* FORM */}
        {view === "form" && (
          <div className="fade-up">

            {step === 0 && (
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: T.primary + "15", color: T.primary,
                  borderRadius: 20, padding: "6px 16px",
                  fontSize: 13, fontWeight: 700, marginBottom: 20,
                }}>
                  {Icon.zap} Automation discovery
                </div>
                <h1 style={{
                  fontSize: 48, fontWeight: 800, lineHeight: 1.08,
                  letterSpacing: "-0.04em", margin: "0 0 18px",
                  color: T.text,
                }}>
                  Stop doing it manually.<br />
                  <span style={{ color: T.primary }}>Let AI handle it.</span>
                </h1>
                <p style={{ color: T.textMute, fontSize: 17, lineHeight: 1.7, maxWidth: 440, margin: "0 auto 32px" }}>
                  Tell us what you do. We'll find what AI can automate and give you a step-by-step plan — no code required.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
                  {["5 min setup", "No code needed", "Real automations"].map(t => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: 7, color: T.textMute, fontSize: 14 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: T.success + "20", color: T.success,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{Icon.check}</span>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={S.card}>
              <StepProgress current={step} total={4} labels={STEP_LABELS} />

              {/* Step 0 — Role */}
              {step === 0 && (
                <div className="slide-in">
                  <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                    Tell us about your role
                  </h2>
                  <p style={{ color: T.textMute, fontSize: 15, margin: "0 0 28px", lineHeight: 1.6 }}>
                    We'll tailor automation suggestions to your specific job.
                  </p>
                  <div style={{ marginBottom: 18 }}>
                    <label htmlFor="job_title" style={S.label}>Job title</label>
                    <input id="job_title" style={S.input} value={form.job_title}
                      onChange={e => set("job_title", e.target.value)}
                      placeholder="e.g. Marketing Manager, HR Director, Sales Rep"
                      onKeyDown={e => e.key === "Enter" && form.job_title && form.industry && setStep(1)} />
                  </div>
                  <div style={{ marginBottom: 32 }}>
                    <label htmlFor="industry" style={S.label}>Industry</label>
                    <input id="industry" style={S.input} value={form.industry}
                      onChange={e => set("industry", e.target.value)}
                      placeholder="e.g. E-commerce, Healthcare, Finance, SaaS"
                      onKeyDown={e => e.key === "Enter" && form.job_title && form.industry && setStep(1)} />
                  </div>
                  <button
                    style={{ ...S.btnPrimary, opacity: !form.job_title || !form.industry ? 0.5 : 1 }}
                    disabled={!form.job_title || !form.industry}
                    onClick={() => setStep(1)}
                  >
                    Continue {Icon.arrowRight}
                  </button>
                </div>
              )}

              {/* Step 1 — Tools */}
              {step === 1 && (
                <div className="slide-in">
                  <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                    What tools do you use daily?
                  </h2>
                  <p style={{ color: T.textMute, fontSize: 15, margin: "0 0 22px", lineHeight: 1.6 }}>
                    We'll build automations using tools you already have.
                  </p>
                  <div style={{ marginBottom: 14 }}>
                    <label htmlFor="tools" style={S.label}>Your daily tools</label>
                    <input id="tools" style={S.input} value={form.tools_used}
                      onChange={e => set("tools_used", e.target.value)}
                      placeholder="e.g. Gmail, Slack, Google Sheets, Salesforce" />
                  </div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 32 }}>
                    {TOOL_CHIPS.map(t => {
                      const active = form.tools_used.includes(t);
                      return (
                        <button key={t} onClick={() => set("tools_used", form.tools_used ? `${form.tools_used}, ${t}` : t)}
                          style={{
                            background: active ? T.primary + "18" : T.bg,
                            border: `2px solid ${active ? T.primary : T.border2}`,
                            borderRadius: T.radiusSm,
                            padding: "6px 13px", color: active ? T.primary : T.textMute,
                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                            transition: T.trans,
                          }}>
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={{ ...S.btnSecondary, width: "38%" }} onClick={() => setStep(0)}>
                      {Icon.arrowLeft} Back
                    </button>
                    <button
                      style={{ ...S.btnPrimary, width: "62%", opacity: !form.tools_used ? 0.5 : 1 }}
                      disabled={!form.tools_used} onClick={() => setStep(2)}
                    >
                      Continue {Icon.arrowRight}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 — Tasks */}
              {step === 2 && (
                <div className="slide-in">
                  <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                    What do you repeat every week?
                  </h2>
                  <p style={{ color: T.textMute, fontSize: 15, margin: "0 0 22px", lineHeight: 1.6 }}>
                    Copy-paste workflows, manual reports, repetitive emails — your automation goldmine.
                  </p>
                  <div style={{ marginBottom: 32 }}>
                    <label htmlFor="tasks" style={S.label}>Your repetitive tasks</label>
                    <textarea id="tasks"
                      style={{ ...S.input, height: 110, resize: "vertical", lineHeight: 1.65 }}
                      value={form.repeated_tasks}
                      onChange={e => set("repeated_tasks", e.target.value)}
                      placeholder="e.g. Copy data from email into spreadsheet, send the same status update each Friday, answer the same 5 customer questions..."
                    />
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={{ ...S.btnSecondary, width: "38%" }} onClick={() => setStep(1)}>
                      {Icon.arrowLeft} Back
                    </button>
                    <button
                      style={{ ...S.btnPrimary, width: "62%", opacity: !form.repeated_tasks ? 0.5 : 1 }}
                      disabled={!form.repeated_tasks} onClick={() => setStep(3)}
                    >
                      Continue {Icon.arrowRight}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 — Params */}
              {step === 3 && (
                <div className="slide-in">
                  <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                    Almost there
                  </h2>
                  <p style={{ color: T.textMute, fontSize: 15, margin: "0 0 28px", lineHeight: 1.6 }}>
                    These help us recommend the right complexity of automation for you.
                  </p>
                  <div style={{ marginBottom: 26 }}>
                    <label style={S.label}>
                      Tech comfort —{" "}
                      <span style={{ color: T.primary }}>
                        {["", "Beginner", "Basic", "Intermediate", "Confident", "Expert"][form.tech_comfort]}
                      </span>
                    </label>
                    <input type="range" min="1" max="5" value={form.tech_comfort}
                      onChange={e => set("tech_comfort", e.target.value)}
                      style={{ width: "100%", marginBottom: 8 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textLight }}>
                      <span>Total beginner</span><span>Tech expert</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 36 }}>
                    <label style={S.label}>
                      Hours wasted per week —{" "}
                      <span style={{ color: T.primary }}>{form.hours_wasted}h</span>
                    </label>
                    <input type="range" min="1" max="20" value={form.hours_wasted}
                      onChange={e => set("hours_wasted", e.target.value)}
                      style={{ width: "100%", marginBottom: 8 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textLight }}>
                      <span>~1 hour</span><span>~20 hours</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={{ ...S.btnSecondary, width: "38%" }} onClick={() => setStep(2)}>
                      {Icon.arrowLeft} Back
                    </button>
                    <button style={{ ...S.btnPrimary, width: "62%" }} onClick={submit}>
                      {Icon.bolt} Find my automations
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANALYZING */}
        {view === "analyzing" && (
          <div className="fade-up" style={S.card}>
            <AnalyzingView progress={scanProgress} status={scanStatus} error={scanError} />
            {scanError && (
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button style={{ ...S.btnSecondary, width: "auto", margin: "0 auto" }}
                  onClick={() => { setView("form"); setScanError(null); setScanProgress(0); }}>
                  {Icon.arrowLeft} Back to form
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESULTS */}
        {view === "results" && result && (
          <div className="fade-up">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 36 }}>
              <StatCard icon={Icon.clock}    label="Hours saved/week"  value={totalSaved}      suffix="h" color={T.success} />
              <StatCard icon={Icon.layers}   label="Automations found" value={result.tasks?.length || 0} suffix="" color={T.primary} />
              <StatCard icon={Icon.trending} label="Hours saved/year"  value={totalSaved * 52} suffix="h" color={T.secondary} />
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 6px" }}>
              Your automation roadmap
            </h2>
            <p style={{ color: T.textMute, fontSize: 16, margin: "0 0 22px", lineHeight: 1.6 }}>
              Click any automation to get your personalized step-by-step plan.
            </p>

            {result.tasks?.map((task, i) => (
              <AgentCard key={i} task={task} index={i} onDeploy={deployAgent} />
            ))}
          </div>
        )}

        {/* BLUEPRINT */}
        {view === "blueprint" && result && (
          <div className="fade-up">
            <button style={{ ...S.btnSecondary, width: "auto", marginBottom: 24 }}
              onClick={() => { setView("results"); setBlueprint(null); setBlueprintError(null); }}>
              {Icon.arrowLeft} Back to all automations
            </button>

            {/* Agent header */}
            {result.tasks?.[selectedAgent] && (
              <div style={{
                background: T.primary + "08",
                border: `2px solid ${T.border2}`,
                borderRadius: T.radiusLg,
                padding: "22px 26px", marginBottom: 14,
              }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  <Pill color={T.success}>
                    {Icon.clock}&nbsp;~{result.tasks[selectedAgent].hours_saved}h saved/wk
                  </Pill>
                  <DiffBadge difficulty={result.tasks[selectedAgent].difficulty} />
                  <Pill color={T.primary}>
                    {Icon.tool}&nbsp;{result.tasks[selectedAgent].tool}
                  </Pill>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                  {result.tasks[selectedAgent].name}
                </h2>
                <p style={{ color: T.textMute, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  {result.tasks[selectedAgent].reason}
                </p>
              </div>
            )}

            {/* Blueprint card */}
            <div style={S.card}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 22, paddingBottom: 18,
                borderBottom: `2px solid ${T.border}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.success }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.primary, letterSpacing: "0.06em" }}>
                    AUTOMATION PLAN
                  </span>
                </div>
                {blueprint && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(blueprint); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    style={{
                      background: copied ? T.success + "15" : T.bg,
                      border: `2px solid ${copied ? T.success + "40" : T.border2}`,
                      color: copied ? T.success : T.textMute,
                      borderRadius: T.radiusSm,
                      padding: "5px 13px", fontSize: 12, fontWeight: 700,
                      cursor: "pointer", transition: T.trans,
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                    {copied ? <>{Icon.check} Copied!</> : <>{Icon.copy} Copy plan</>}
                  </button>
                )}
              </div>

              {blueprintError ? (
                <div style={{
                  background: T.dangerBg, border: `1px solid ${T.dangerBdr}`,
                  borderRadius: T.radius, padding: "14px 18px",
                  color: T.danger, fontSize: 14, lineHeight: 1.6,
                }}>
                  <strong>Error:</strong> {blueprintError}
                  <div style={{ marginTop: 8, fontSize: 13, color: "#991B1B" }}>
                    Start backend: <code style={{ background: "#fee2e2", padding: "1px 6px", borderRadius: 4 }}>
                      cd backend && uvicorn main:app --reload
                    </code>
                  </div>
                </div>
              ) : (
                <BlueprintView guide={blueprint} loading={blueprintLoading} />
              )}
            </div>

            {/* Other automations */}
            {!blueprintLoading && blueprint && result.tasks?.length > 1 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.textMute, letterSpacing: "0.06em", marginBottom: 12 }}>
                  OTHER AUTOMATIONS
                </div>
                {result.tasks.filter((_, i) => i !== selectedAgent).map(task => {
                  const realIdx = result.tasks.indexOf(task);
                  return (
                    <div key={realIdx} onClick={() => deployAgent(realIdx)}
                      style={{
                        background: T.surface, border: `2px solid ${T.border}`,
                        borderRadius: T.radius, padding: "14px 18px",
                        marginBottom: 8, cursor: "pointer", transition: T.trans,
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = T.primary}
                      onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 3 }}>{task.name}</div>
                        <div style={{ fontSize: 12, color: T.textMute }}>~{task.hours_saved}h/week · {task.tool}</div>
                      </div>
                      <span style={{ color: T.primary }}>{Icon.arrowRight}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
