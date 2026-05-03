import { useState, useEffect } from "react";
import CalcLab from "./calc_lab";
import PhysicsLab from "./physics";
import CodingLab from "./coding";

const C = {
  bg: "#ffffff", panel: "#f8f9fb", border: "#e8eaef",
  blue: "#4da3ff", blueDim: "rgba(77,163,255,0.06)",
  silver: "#9ca3af", silverLight: "#c9cdd4",
  text: "#1a1a2e", textMid: "#5a5f72", textDim: "#9298a8", textLight: "#b4b9c6",
  green: "#34d399", greenDim: "rgba(52,211,153,0.08)",
  gold: "#fbbf24", goldDim: "rgba(251,191,36,0.06)",
};
const F = { sans: "'Inter','SF Pro Display',system-ui,sans-serif", mono: "'SF Mono','Menlo',monospace" };

const SUBJECTS = [
  { id: "calc", title: "Calculus 1", desc: "32 lectures mapped to Professor Leonard", icon: "∫", lectures: 32, storageKey: "telpo-calc-v1" },
  { id: "physics", title: "Physics", desc: "15 units from mechanics to quantum", icon: "⚡", lectures: 48, storageKey: "telpo-physics-v1" },
  { id: "cpp", title: "Arduino C++", desc: "Embedded systems and hardware programming", icon: "⊞", lectures: 20, storageKey: "telpo-cpp-v1" },
  { id: "rust", title: "Rust", desc: "Systems programming from zero", icon: "⚙", lectures: 18, storageKey: "telpo-rust-v1" },
];

function getProgress(key, total) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { mastered: 0, watched: 0 };
    const data = JSON.parse(raw);
    const vals = Object.values(data);
    return { mastered: vals.filter(v => v === "mastered").length, watched: vals.filter(v => v === "watched" || v === "mastered").length };
  } catch { return { mastered: 0, watched: 0 }; }
}

function resetProgress(key) {
  try { localStorage.removeItem(key); } catch {}
}

export default function App() {
  const [page, setPage] = useState("home");
  const [refresh, setRefresh] = useState(0);

  if (page === "calc") return <CalcLab onBack={() => { setPage("home"); setRefresh(r => r + 1); }} />;
  if (page === "physics") return <PhysicsLab onBack={() => { setPage("home"); setRefresh(r => r + 1); }} />;
  if (page === "cpp") return <CodingLab subject="cpp" onBack={() => { setPage("home"); setRefresh(r => r + 1); }} />;
  if (page === "rust") return <CodingLab subject="rust" onBack={() => { setPage("home"); setRefresh(r => r + 1); }} />;

  const totalAll = SUBJECTS.reduce((s, x) => s + x.lectures, 0);
  const masteredAll = SUBJECTS.reduce((s, x) => s + getProgress(x.storageKey, x.lectures).mastered, 0);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F.sans }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ paddingTop: 48, marginBottom: 40 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: C.silver, letterSpacing: 3, textTransform: "uppercase", margin: "0 0 6px" }}>telpo</p>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: C.text, margin: "0 0 8px" }}>Your Lab</h1>
          <p style={{ fontSize: 13, color: C.textDim, margin: "0 0 20px" }}>Calculus, physics, C++, Rust. Watch, interact, practice, master.</p>

          {/* Global progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${totalAll > 0 ? (masteredAll / totalAll) * 100 : 0}%`, background: C.blue, borderRadius: 2, transition: "width 0.4s" }} />
            </div>
            <span style={{ fontFamily: F.mono, fontSize: 10, color: C.textDim }}>{masteredAll}/{totalAll} mastered</span>
          </div>
        </div>

        {/* Subject cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 48 }}>
          {SUBJECTS.map(sub => {
            const prog = getProgress(sub.storageKey, sub.lectures);
            const pct = sub.lectures > 0 ? (prog.mastered / sub.lectures) * 100 : 0;
            return (
              <div
                key={sub.id}
                onClick={() => setPage(sub.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
                  background: C.panel, borderRadius: 8, border: `1px solid ${C.border}`,
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.blueDim; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.panel; }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, background: C.blueDim, color: C.blue, flexShrink: 0,
                }}>{sub.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 550, color: C.text }}>{sub.title}</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{sub.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <div style={{ flex: 1, maxWidth: 160, height: 2, background: C.border, borderRadius: 1, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: C.green, borderRadius: 1, transition: "width 0.4s" }} />
                    </div>
                    <span style={{ fontFamily: F.mono, fontSize: 9, color: C.textDim }}>{prog.mastered}/{sub.lectures}</span>
                  </div>
                </div>
                <span style={{ color: C.textLight, fontSize: 16 }}>→</span>
              </div>
            );
          })}
        </div>

        {/* Reset section */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginBottom: 48 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: C.textDim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Reset progress</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SUBJECTS.map(sub => (
              <button key={sub.id} onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Reset all ${sub.title} progress?`)) { resetProgress(sub.storageKey); setRefresh(r => r + 1); }
              }} style={{
                background: "transparent", border: `1px solid ${C.border}`, borderRadius: 3,
                padding: "4px 10px", fontFamily: F.sans, fontSize: 10, color: C.textDim, cursor: "pointer",
              }}>{sub.title}</button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 9, color: C.textLight, letterSpacing: 1.5, paddingBottom: 32 }}>TELPO v1.0</p>
      </div>
    </div>
  );
}
