import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import CalcLab from "./calc_lab";
import PhysicsLab from "./physics";
import CodingLab from "./coding";
import ChemPlacement from "./chem_placement";

// ── Colors & Fonts (matching shared_ui dark palette) ──
const C = {
  bg: "#141821", bgSurface: "#1c2030", bgHover: "#242a3d", bgDeep: "#10131a",
  text: "#d4d2cb", textMuted: "#8a8b93", textDim: "#5a5c66", textLight: "#3e4250",
  calculus: "#5b7a8a", calculusGlow: "rgba(91,122,138,0.3)",
  physics: "#6b7a5b", physicsGlow: "rgba(107,122,91,0.3)",
  chem: "#7a6b5b", chemGlow: "rgba(122,107,91,0.3)",
  code: "#7a5b7a", codeGlow: "rgba(122,91,122,0.3)",
  border: "#262c3e", gridLine: "rgba(46,52,72,0.25)", line: "#2e3448",
  accent: "#6a7fa8", accentWarm: "#8a7a6a",
  xp: "#8a7a5b", streak: "#c4845b",
  green: "#5a7a5a", red: "#7a5a5a", gold: "#a89a6a", locked: "#3a3c44",
};
const MONO = "'IBM Plex Mono','SF Mono','Menlo',monospace";
const SANS = "'IBM Plex Sans','Inter',system-ui,sans-serif";

// ── Subjects (keep existing storage keys) ──
const SUBJECTS = [
  { id: "calc", title: "Calculus I", desc: "32 lectures mapped to Professor Leonard", icon: "\u222B", lectures: 32, storageKey: "Telpo-calc-v1", color: C.calculus, glow: C.calculusGlow },
  { id: "physics", title: "Physics", desc: "15 units from mechanics to quantum", icon: "P", lectures: 48, storageKey: "Telpo-physics-v1", color: C.physics, glow: C.physicsGlow },
  { id: "chem", title: "Chem Placement", desc: "5 week plan to place into CHEM 1A", icon: "\u2697", lectures: 16, storageKey: "Telpo-chemplace-v1", color: C.chem, glow: C.chemGlow },
  { id: "cpp", title: "Arduino C++", desc: "Embedded systems and hardware programming", icon: "\u229E", lectures: 20, storageKey: "Telpo-cpp-v1", color: C.code, glow: C.codeGlow },
  { id: "rust", title: "Rust", desc: "Systems programming from zero", icon: "\u2699", lectures: 18, storageKey: "Telpo-rust-v1", color: C.code, glow: C.codeGlow },
];

// ── Progress helpers ──
function getProgress(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { mastered: 0, watched: 0 };
    const data = JSON.parse(raw);
    const vals = Object.values(data);
    return { mastered: vals.filter(v => v === "mastered").length, watched: vals.filter(v => v === "watched" || v === "mastered").length };
  } catch { return { mastered: 0, watched: 0 }; }
}

// ── Gamification state (persisted) ──
const GAME_KEY = "Telpo-game-v2";
function loadGame() {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { xp: 0, level: 1, streak: 0, lastStudyDate: null, sessions: {}, dailyDone: 0, dailyDate: null, conquered: [] };
}
function saveGame(g) {
  try { localStorage.setItem(GAME_KEY, JSON.stringify(g)); } catch {}
}

// ── Boss battle questions ──
const BOSS_Q = {
  calc: [
    { q: "d/dx [x\u00B3] = ?", opts: ["3x\u00B2", "x\u00B2", "3x", "x\u00B3/3"], ans: 0 },
    { q: "lim(x\u21920) sin(x)/x = ?", opts: ["1", "0", "\u221E", "DNE"], ans: 0 },
    { q: "\u222B 2x dx = ?", opts: ["x\u00B2 + C", "2x\u00B2 + C", "x\u00B2", "2x + C"], ans: 0 },
    { q: "Chain rule: d/dx [f(g(x))] = ?", opts: ["f'(g(x))\u00B7g'(x)", "f'(x)\u00B7g'(x)", "f(g'(x))", "f'(g(x))"], ans: 0 },
    { q: "FTC Part 1: d/dx \u222B\u2090\u02E3 f(t)dt = ?", opts: ["f(x)", "F(x)", "f'(x)", "F(a)"], ans: 0 },
  ],
  physics: [
    { q: "F = ma. If m=5kg, a=3m/s\u00B2, F = ?", opts: ["15N", "8N", "1.67N", "53N"], ans: 0 },
    { q: "KE = ?", opts: ["\u00BDmv\u00B2", "mgh", "Fd", "mv"], ans: 0 },
    { q: "An object in free fall accelerates at:", opts: ["9.8 m/s\u00B2", "10 m/s", "9.8 m/s", "0 m/s\u00B2"], ans: 0 },
    { q: "Conservation of momentum requires:", opts: ["No external forces", "No friction", "Equal masses", "Elastic collision"], ans: 0 },
  ],
  chem: [
    { q: "How many electrons in a neutral Carbon atom?", opts: ["6", "12", "4", "8"], ans: 0 },
    { q: "pH of a neutral solution at 25\u00B0C:", opts: ["7", "0", "14", "1"], ans: 0 },
    { q: "In PV = nRT, R is the:", opts: ["Gas constant", "Resistance", "Rate", "Radius"], ans: 0 },
  ],
};

// ── Section data for bubble maps ──
const SECTIONS = {
  calc: [
    { id: "precalc", label: "Precalc Review", short: "Precalc", lectures: "0.1\u20130.3", count: 3, topics: ["Functions", "Trig Review", "Graphing"], connections: ["limits"], prereqs: [] },
    { id: "limits", label: "Limits", short: "Limits", lectures: "1.1\u20131.6", count: 6, topics: ["Intuitive Limits", "Limit Laws", "Continuity", "Squeeze Thm", "Limits at \u221E"], connections: ["derivatives"], prereqs: ["precalc"] },
    { id: "derivatives", label: "Derivatives", short: "Deriv", lectures: "2.1\u20132.8", count: 8, topics: ["Definition", "Power Rule", "Product/Quotient", "Chain Rule", "Implicit", "Related Rates"], connections: ["applications", "integrals"], prereqs: ["limits"] },
    { id: "applications", label: "Applications", short: "Apps", lectures: "3.1\u20133.5", count: 5, topics: ["Max/Min", "MVT", "Curve Sketching", "Optimization", "L'H\u00F4pital"], connections: ["integrals"], prereqs: ["derivatives"] },
    { id: "integrals", label: "Integration", short: "Integ", lectures: "4.1\u20135.4", count: 10, topics: ["Antiderivatives", "Riemann Sums", "FTC", "Substitution", "Area Between Curves", "Volumes"], connections: [], prereqs: ["derivatives"] },
  ],
  physics: [
    { id: "ph_vectors", label: "Vectors", short: "Vectors", lectures: "Unit 1", count: 3, topics: ["Components", "Unit Vectors", "Dot/Cross"], connections: ["ph_1dkin"], prereqs: [] },
    { id: "ph_1dkin", label: "1D Kinematics", short: "1D Kin", lectures: "Unit 2", count: 4, topics: ["Position", "Velocity", "Acceleration", "Free Fall"], connections: ["ph_2dkin"], prereqs: ["ph_vectors"] },
    { id: "ph_2dkin", label: "2D Kinematics", short: "2D Kin", lectures: "Unit 3", count: 3, topics: ["Projectile Motion", "Relative Motion"], connections: ["ph_newton"], prereqs: ["ph_1dkin"] },
    { id: "ph_newton", label: "Newton's Laws", short: "Newton", lectures: "Unit 4", count: 4, topics: ["1st Law", "2nd Law", "3rd Law", "FBDs"], connections: ["ph_friction"], prereqs: ["ph_2dkin"] },
    { id: "ph_friction", label: "Friction & Drag", short: "Friction", lectures: "Unit 5", count: 3, topics: ["Static", "Kinetic", "Drag"], connections: ["ph_circular"], prereqs: ["ph_newton"] },
    { id: "ph_circular", label: "Circular Motion", short: "Circ", lectures: "Unit 6", count: 3, topics: ["Centripetal Accel", "Centripetal Force"], connections: ["ph_work"], prereqs: ["ph_friction"] },
    { id: "ph_work", label: "Work & Energy", short: "Work", lectures: "Unit 7", count: 4, topics: ["Work", "KE", "PE", "Work-Energy Thm"], connections: ["ph_conservation"], prereqs: ["ph_circular"] },
    { id: "ph_conservation", label: "Conservation", short: "Conserv", lectures: "Unit 8", count: 3, topics: ["Energy Conservation", "Power"], connections: ["ph_momentum"], prereqs: ["ph_work"] },
    { id: "ph_momentum", label: "Momentum", short: "Moment", lectures: "Unit 9", count: 3, topics: ["Impulse", "Conservation", "Collisions"], connections: ["ph_rotation"], prereqs: ["ph_conservation"] },
    { id: "ph_rotation", label: "Rotation", short: "Rot", lectures: "Unit 10", count: 4, topics: ["Angular Kin", "Torque", "Moment of Inertia"], connections: ["ph_angmom"], prereqs: ["ph_momentum"] },
    { id: "ph_angmom", label: "Angular Momentum", short: "Ang Mom", lectures: "Unit 11", count: 3, topics: ["Angular Mom", "Conservation"], connections: ["ph_gravity"], prereqs: ["ph_rotation"] },
    { id: "ph_gravity", label: "Gravitation", short: "Gravity", lectures: "Unit 12", count: 3, topics: ["Universal Grav", "Orbits", "Kepler"], connections: ["ph_osc"], prereqs: ["ph_angmom"] },
    { id: "ph_osc", label: "Oscillations", short: "Osc", lectures: "Unit 13", count: 3, topics: ["SHM", "Springs", "Pendulums"], connections: ["ph_waves"], prereqs: ["ph_gravity"] },
    { id: "ph_waves", label: "Waves & Sound", short: "Waves", lectures: "Unit 14", count: 4, topics: ["Wave Props", "Superposition", "Standing Waves"], connections: ["ph_nuclear"], prereqs: ["ph_osc"] },
    { id: "ph_nuclear", label: "Nuclear Physics", short: "Nuclear", lectures: "Unit 15", count: 3, topics: ["Decay", "Half-life", "Reactions"], connections: [], prereqs: ["ph_waves"] },
  ],
  chem: [
    { id: "ch_atomic", label: "Atomic Structure", short: "Atomic", lectures: "Module 1", count: 4, topics: ["Electron Config", "Quantum Numbers", "Periodic Trends"], connections: ["ch_bonding"], prereqs: [] },
    { id: "ch_bonding", label: "Chemical Bonding", short: "Bonding", lectures: "Module 2", count: 3, topics: ["Lewis Structures", "VSEPR", "Hybridization"], connections: ["ch_reactions"], prereqs: ["ch_atomic"] },
    { id: "ch_reactions", label: "Reactions & Stoich", short: "React", lectures: "Module 3", count: 4, topics: ["Balancing", "Moles", "Limiting Reagent"], connections: ["ch_solutions"], prereqs: ["ch_bonding"] },
    { id: "ch_solutions", label: "Solutions & Acids", short: "Solns", lectures: "Module 4", count: 3, topics: ["Molarity", "pH/pOH", "Acid-Base"], connections: ["ch_gas"], prereqs: ["ch_reactions"] },
    { id: "ch_gas", label: "Gas Laws", short: "Gas", lectures: "Module 5", count: 3, topics: ["Ideal Gas Law", "Dalton's Law", "KMT"], connections: [], prereqs: ["ch_solutions"] },
  ],
};

// ── Spaced repetition cards ──
const REVIEW_CARDS = {
  calc: [
    "State the power rule for derivatives.",
    "What does f'(a) = 0 mean geometrically?",
    "When do you use L'H\u00F4pital's Rule?",
    "State the Fundamental Theorem of Calculus Part 2.",
    "When is u-substitution useful?",
  ],
  physics: [
    "State Newton's Second Law.",
    "What is the work-energy theorem?",
    "When is momentum conserved?",
    "What determines the period of a pendulum?",
  ],
  chem: [
    "What determines an element's chemical properties?",
    "How do you find the limiting reagent?",
    "What is molarity?",
  ],
};

// ── Ambient Sound Engine ──
function useAmbientSound() {
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState("rain");

  const stop = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    nodesRef.current = [];
    setPlaying(false);
  }, []);

  const start = useCallback((m) => {
    stop();
    const ctx = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();
    const nodes = [];
    const master = ctx.createGain();
    master.gain.value = 0.12;
    master.connect(ctx.destination);

    if (m === "whitenoise") {
      const bufSize = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 800;
      src.connect(lp); lp.connect(master); src.start();
      nodes.push(src);
    } else if (m === "drone") {
      [55, 82.5, 110, 165].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? "sine" : "triangle";
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = i === 0 ? 0.06 : 0.025;
        osc.connect(g); g.connect(master); osc.start();
        nodes.push(osc);
      });
    } else if (m === "rain") {
      const bufSize = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1200; bp.Q.value = 0.5;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3000;
      src.connect(bp); bp.connect(lp); lp.connect(master); src.start();
      nodes.push(src);
    } else if (m === "lofi") {
      [261.6, 329.6, 392, 523.2].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine"; osc.frequency.value = freq;
        const g = ctx.createGain(); g.gain.value = 0;
        const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 400;
        osc.connect(lp); lp.connect(g); g.connect(master); osc.start();
        const cycle = 4 + i * 1.5;
        const now = ctx.currentTime;
        for (let t = 0; t < 120; t += cycle) {
          g.gain.setValueAtTime(0, now + t);
          g.gain.linearRampToValueAtTime(0.04, now + t + cycle * 0.3);
          g.gain.linearRampToValueAtTime(0, now + t + cycle);
        }
        nodes.push(osc);
      });
    }
    nodesRef.current = nodes;
    setPlaying(true);
    setMode(m);
  }, [stop]);

  const toggle = useCallback((m) => {
    if (playing && mode === m) stop(); else start(m);
  }, [playing, mode, start, stop]);

  return { playing, mode, toggle, stop };
}

// ── Password Screen ──
function PasswordScreen({ onUnlock }) {
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);
  const [dots, setDots] = useState([false, false, false, false]);
  const ref = useRef(null);
  const PASSWORD = "0622";
  useEffect(() => { ref.current?.focus(); }, []);

  const handleKey = (digit) => {
    if (code.length >= 4) return;
    const next = code + digit;
    setCode(next);
    const nd = [false, false, false, false];
    for (let i = 0; i < next.length; i++) nd[i] = true;
    setDots(nd);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === PASSWORD) onUnlock();
        else { setShake(true); setTimeout(() => { setShake(false); setCode(""); setDots([false, false, false, false]); }, 500); }
      }, 200);
    }
  };
  const handleBack = () => {
    if (code.length > 0) {
      const next = code.slice(0, -1);
      setCode(next);
      const nd = [false, false, false, false];
      for (let i = 0; i < next.length; i++) nd[i] = true;
      setDots(nd);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key >= "0" && e.key <= "9") handleKey(e.key);
    if (e.key === "Backspace") handleBack();
  };
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "\u232B"];

  return (
    <div tabIndex={0} ref={ref} onKeyDown={handleKeyDown} style={{
      width: "100%", minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", fontFamily: SANS, outline: "none", position: "relative",
    }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <defs><pattern id="pg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke={C.gridLine} strokeWidth="0.5" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#pg)" />
      </svg>
      <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: 700, color: C.text, letterSpacing: "-0.03em" }}>Telpo</h1>
        <p style={{ margin: "0 0 40px", fontSize: "11px", color: C.textDim, fontFamily: MONO, letterSpacing: "0.1em", textTransform: "uppercase" }}>enter access code</p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "40px", animation: shake ? "shakeX 0.4s ease" : "none" }}>
          {dots.map((f, i) => <div key={i} style={{ width: "14px", height: "14px", borderRadius: "50%", border: `2px solid ${f ? C.accent : C.border}`, background: f ? C.accent : "transparent", boxShadow: f ? `0 0 12px ${C.accent}55` : "none", transition: "all 0.2s ease" }} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,64px)", gap: "12px", justifyContent: "center" }}>
          {keys.map((k, i) => k === "" ? <div key={i} /> : (
            <button key={k} onClick={() => k === "\u232B" ? handleBack() : handleKey(k)} style={{
              width: "64px", height: "64px", borderRadius: "50%", background: C.bgSurface, border: `1px solid ${C.border}`,
              color: C.text, fontSize: k === "\u232B" ? "18px" : "20px", fontFamily: MONO, fontWeight: 500, cursor: "pointer",
              transition: "all 0.15s ease", display: "flex", alignItems: "center", justifyContent: "center",
            }} onMouseEnter={e => { e.target.style.background = C.bgHover; }} onMouseLeave={e => { e.target.style.background = C.bgSurface; }}>{k}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Focus Timer ──
function FocusTimer({ onClose, onComplete, xpMultiplier }) {
  const [duration, setDuration] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, seconds]);

  useEffect(() => {
    if (seconds <= 0 && duration && running) {
      setRunning(false); setCompleted(true);
      clearInterval(intervalRef.current);
      onComplete(duration);
    }
  }, [seconds, duration, running]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = duration ? 1 - seconds / (duration * 60) : 0;
  const circ = 2 * Math.PI * 90;

  if (duration === null) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 100, background: `${C.bgDeep}f5`, backdropFilter: "blur(24px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SANS, animation: "fadeIn 0.4s ease" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 24, right: 28, background: "none", border: "none", color: C.textDim, fontSize: "14px", cursor: "pointer", fontFamily: MONO }}>ESC</button>
        <p style={{ fontSize: "10px", fontFamily: MONO, letterSpacing: "0.12em", color: C.textDim, textTransform: "uppercase", marginBottom: "12px" }}>commitment device</p>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: C.text, marginBottom: "8px" }}>Choose Your Session</h2>
        <p style={{ fontSize: "12px", color: C.textMuted, marginBottom: "32px", maxWidth: "300px", textAlign: "center", lineHeight: 1.6 }}>
          Leaving early resets your streak multiplier. Completing earns {xpMultiplier}x XP.
        </p>
        <div style={{ display: "flex", gap: "16px" }}>
          {[25, 50].map(d => (
            <button key={d} onClick={() => { setDuration(d); setSeconds(d * 60); setRunning(true); }} style={{
              width: "140px", padding: "24px 16px", borderRadius: "14px", background: C.bgSurface, border: `1px solid ${C.border}`, cursor: "pointer", textAlign: "center", transition: "all 0.2s ease",
            }} onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.accent}55`; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
              <div style={{ fontSize: "32px", fontWeight: 700, color: C.text, fontFamily: MONO }}>{d}</div>
              <div style={{ fontSize: "11px", color: C.textDim, fontFamily: MONO, marginTop: "4px" }}>MINUTES</div>
              <div style={{ fontSize: "10px", color: C.xp, marginTop: "8px" }}>+{d === 25 ? 50 : 120} XP</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: `${C.bgDeep}f5`, backdropFilter: "blur(24px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SANS, animation: "fadeIn 0.4s ease" }}>
      {!completed && <button onClick={onClose} style={{ position: "absolute", top: 24, right: 28, background: "none", border: "none", color: C.red, fontSize: "11px", cursor: "pointer", fontFamily: MONO, letterSpacing: "0.08em" }}>ABANDON</button>}
      <p style={{ fontSize: "10px", fontFamily: MONO, letterSpacing: "0.12em", color: C.textDim, textTransform: "uppercase", marginBottom: "32px" }}>
        {completed ? "session complete" : "focus mode // locked in"}
      </p>
      <svg width="200" height="200" style={{ marginBottom: "28px" }}>
        <circle cx="100" cy="100" r="90" fill="none" stroke={C.border} strokeWidth="3" />
        <circle cx="100" cy="100" r="90" fill="none" stroke={completed ? C.green : C.accent} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} transform="rotate(-90 100 100)" style={{ transition: "stroke-dashoffset 1s linear" }} />
        <text x="100" y={completed ? 95 : 92} textAnchor="middle" fill={C.text} fontSize={completed ? "24" : "36"} fontFamily={MONO} fontWeight="600">
          {completed ? "DONE" : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`}
        </text>
        {!completed && <text x="100" y="118" textAnchor="middle" fill={C.textDim} fontSize="10" fontFamily={MONO} letterSpacing="0.1em">{running ? "LOCKED IN" : "PAUSED"}</text>}
      </svg>
      {completed ? (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: C.xp, fontWeight: 600, marginBottom: "4px" }}>+{(duration === 25 ? 50 : 120) * xpMultiplier} XP earned</p>
          <button onClick={onClose} style={{ marginTop: "16px", padding: "10px 28px", borderRadius: "8px", border: `1px solid ${C.green}44`, background: `${C.green}22`, color: C.text, fontSize: "13px", fontFamily: SANS, fontWeight: 600, cursor: "pointer" }}>Continue Studying</button>
        </div>
      ) : (
        <button onClick={() => setRunning(!running)} style={{ padding: "10px 28px", borderRadius: "8px", border: `1px solid ${C.accent}44`, background: running ? C.bgSurface : `${C.accent}22`, color: C.text, fontSize: "13px", fontFamily: SANS, fontWeight: 600, cursor: "pointer" }}>
          {running ? "Pause" : "Resume"}
        </button>
      )}
    </div>
  );
}

// ── Boss Battle ──
function BossBattle({ subjectId, subjectTitle, color, onComplete, onClose }) {
  const questions = BOSS_Q[subjectId] || BOSS_Q.calc;
  const [cur, setCur] = useState(0);
  const [score, setScore] = useState(0);
  const [sel, setSel] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!finished && sel === null) {
      setTimeLeft(30);
      timerRef.current = setInterval(() => setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setSel(-1); setShowResult(true); return 0; }
        return t - 1;
      }), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [cur, finished]);

  const handleSelect = (i) => {
    if (sel !== null) return;
    clearInterval(timerRef.current);
    setSel(i);
    setShowResult(true);
    if (i === questions[cur].ans) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (cur + 1 >= questions.length) { setFinished(true); }
    else { setCur(c => c + 1); setSel(null); setShowResult(false); }
  };

  const passed = score >= Math.ceil(questions.length * 0.7);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: `${C.bgDeep}f5`, backdropFilter: "blur(24px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SANS, animation: "fadeIn 0.4s ease", padding: "24px" }}>
      {!finished ? (
        <div style={{ maxWidth: "460px", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <p style={{ fontSize: "10px", fontFamily: MONO, color: color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Boss Battle</p>
              <p style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>{subjectTitle}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "22px", fontWeight: 700, color: timeLeft <= 10 ? C.red : C.text, fontFamily: MONO }}>{timeLeft}s</div>
              <div style={{ fontSize: "10px", color: C.textDim, fontFamily: MONO }}>{cur + 1}/{questions.length}</div>
            </div>
          </div>
          <div style={{ height: "3px", borderRadius: "2px", background: C.bgHover, marginBottom: "24px" }}>
            <div style={{ width: `${(cur / questions.length) * 100}%`, height: "100%", borderRadius: "2px", background: color, transition: "width 0.4s ease" }} />
          </div>
          <p style={{ fontSize: "15px", color: C.text, lineHeight: 1.6, marginBottom: "24px" }}>{questions[cur].q}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {questions[cur].opts.map((opt, i) => {
              const isCorrect = i === questions[cur].ans;
              const isSel = sel === i;
              let bg = C.bgSurface, bdr = C.border, txt = C.textMuted;
              if (showResult && isCorrect) { bg = `${C.green}22`; bdr = `${C.green}55`; txt = C.text; }
              else if (showResult && isSel && !isCorrect) { bg = `${C.red}22`; bdr = `${C.red}55`; txt = C.text; }
              return (
                <button key={i} onClick={() => handleSelect(i)} style={{
                  padding: "14px 18px", borderRadius: "10px", background: bg, border: `1px solid ${bdr}`,
                  color: txt, fontSize: "13px", fontFamily: SANS, cursor: sel === null ? "pointer" : "default",
                  textAlign: "left", transition: "all 0.25s ease",
                }}>
                  <span style={{ fontFamily: MONO, marginRight: "10px", color: C.textDim, fontSize: "11px" }}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              );
            })}
          </div>
          {showResult && <button onClick={handleNext} style={{ marginTop: "20px", padding: "10px 24px", borderRadius: "8px", background: `${color}22`, border: `1px solid ${color}44`, color: C.text, fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>{cur + 1 >= questions.length ? "See Results" : "Next \u2192"}</button>}
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: passed ? `${C.green}22` : `${C.red}22`, border: `2px solid ${passed ? C.green : C.red}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: passed ? `0 0 30px ${C.green}33` : `0 0 30px ${C.red}33` }}>
            <span style={{ fontSize: "28px" }}>{passed ? "\u2713" : "\u2717"}</span>
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>{passed ? "Module Conquered" : "Not Yet"}</h2>
          <p style={{ fontSize: "13px", color: C.textMuted, marginBottom: "4px" }}>{score}/{questions.length} correct</p>
          <p style={{ fontSize: "11px", color: C.textDim, marginBottom: "24px" }}>{passed ? "+100 XP earned" : "Review and try again"}</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            {passed ? (
              <button onClick={() => { onComplete(subjectId); onClose(); }} style={{ padding: "10px 24px", borderRadius: "8px", background: `${C.green}22`, border: `1px solid ${C.green}44`, color: C.text, fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>Claim Reward</button>
            ) : (
              <>
                <button onClick={() => { setCur(0); setScore(0); setSel(null); setShowResult(false); setFinished(false); }} style={{ padding: "10px 24px", borderRadius: "8px", background: `${color}22`, border: `1px solid ${color}44`, color: C.text, fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>Retry</button>
                <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: "8px", background: C.bgSurface, border: `1px solid ${C.border}`, color: C.textMuted, fontSize: "13px", cursor: "pointer", fontFamily: SANS }}>Back</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Heat Map ──
function HeatMap({ sessions }) {
  const today = new Date();
  const days = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, count: sessions[key] || 0, day: d.getDay() });
  }
  const weeks = [];
  let week = new Array(7).fill(null);
  days.forEach((d, i) => {
    if (i === 0) { for (let j = 0; j < d.day; j++) week[j] = null; }
    week[d.day] = d;
    if (d.day === 6 || i === days.length - 1) { weeks.push(week); week = new Array(7).fill(null); }
  });

  return (
    <div style={{ overflowX: "auto", padding: "4px 0" }}>
      <div style={{ display: "flex", gap: "3px" }}>
        {weeks.map((w, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {w.map((d, di) => (
              <div key={di} title={d ? `${d.key}: ${d.count} sessions` : ""} style={{
                width: "10px", height: "10px", borderRadius: "2px",
                background: !d ? "transparent" : d.count === 0 ? C.bgHover : d.count === 1 ? `${C.green}55` : d.count >= 2 ? `${C.green}88` : C.green,
                border: d ? `1px solid ${d.count > 0 ? `${C.green}33` : C.border}` : "none",
              }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Review Queue (Spaced Repetition) ──
function ReviewQueue({ cards, onDismiss }) {
  const [cur, setCur] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (!cards.length) return null;
  const item = cards[cur];
  if (!item) return null;

  return (
    <div style={{ padding: "16px 20px", borderRadius: "12px", background: C.bgSurface, border: `1px solid ${C.accent}22`, marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontSize: "10px", fontFamily: MONO, color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>Daily Review // {cur + 1}/{cards.length}</div>
        <div style={{ fontSize: "10px", fontFamily: MONO, color: C.textDim }}>+10 XP each</div>
      </div>
      <div onClick={() => setFlipped(!flipped)} style={{
        padding: "20px", borderRadius: "10px", background: flipped ? `${C.accent}11` : C.bgHover,
        border: `1px solid ${flipped ? `${C.accent}22` : C.border}`, cursor: "pointer",
        minHeight: "60px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease",
      }}>
        <p style={{ fontSize: "13px", color: flipped ? C.textMuted : C.text, textAlign: "center", lineHeight: 1.6 }}>
          {flipped ? "Can you answer this from memory? Tap to flip back." : item}
        </p>
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        {["Got it \u2713", "Needs work \u2717"].map((label, idx) => (
          <button key={label} onClick={() => {
            if (cur + 1 >= cards.length) onDismiss();
            else { setCur(c => c + 1); setFlipped(false); }
          }} style={{
            flex: 1, padding: "8px", borderRadius: "8px",
            background: idx === 0 ? `${C.green}18` : `${C.red}18`,
            border: `1px solid ${idx === 0 ? `${C.green}33` : `${C.red}33`}`,
            color: idx === 0 ? C.green : C.red, fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: SANS,
          }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

// ── Bubble Map Navigation ──
function BubbleMap({ moduleKey, moduleLabel, color, glow, sections, onBack, onEnterModule }) {
  const [activeId, setActiveId] = useState(null);

  const positions = useMemo(() => {
    const pos = {};
    sections.forEach((s, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      pos[s.id] = { x: 0.18 + col * 0.30 + (i % 2 === 0 ? 0.03 : -0.03), y: 0.10 + row * 0.22, r: 30 + Math.min(s.count, 8) * 2 };
    });
    return pos;
  }, [sections]);

  const relatedIds = useMemo(() => {
    if (!activeId) return new Set();
    const s = new Set();
    const node = sections.find(n => n.id === activeId);
    if (node) {
      (node.connections || []).forEach(c => s.add(c));
      sections.forEach(n => { if (n.connections?.includes(activeId)) s.add(n.id); });
    }
    return s;
  }, [activeId, sections]);

  const W = 700, H = Math.ceil(sections.length / 3) * 160 + 80;
  const activeNode = sections.find(s => s.id === activeId);

  return (
    <div style={{ padding: "24px 20px", maxWidth: 800, margin: "0 auto" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: C.textDim, cursor: "pointer",
        fontFamily: MONO, fontSize: "11px", padding: "0 0 16px", display: "flex", alignItems: "center", gap: "6px",
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8 3L4 7l4 4" stroke={C.textDim} strokeWidth="1.5" strokeLinecap="round" /></svg>
        DASHBOARD
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}66` }} />
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: C.text }}>{moduleLabel}</h2>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 0 8px" }}>
        <p style={{ margin: 0, fontSize: "11px", fontFamily: MONO, color: C.textDim }}>
          {sections.length} SECTIONS // {sections.reduce((a, s) => a + s.count, 0)} LECTURES
        </p>
        <button onClick={onEnterModule} style={{
          marginLeft: "auto", padding: "6px 14px", borderRadius: "6px",
          background: `${color}18`, border: `1px solid ${color}33`,
          color: color, fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: MONO,
        }}>OPEN ALL LECTURES \u2192</button>
      </div>
      <p style={{ margin: "0 0 16px", fontSize: "11px", color: C.textDim }}>
        Tap a section to see topics. Lines show prerequisite flow.
      </p>

      {/* SVG Bubble Map */}
      <div style={{ width: "100%", overflowX: "auto", background: C.bgSurface, borderRadius: "12px", border: `1px solid ${C.border}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", minHeight: "280px" }}>
          {/* Edges */}
          {sections.map(s => (s.connections || []).map(tId => {
            const p1 = positions[s.id], p2 = positions[tId];
            if (!p1 || !p2) return null;
            const x1 = p1.x * W, y1 = p1.y * H, x2 = p2.x * W, y2 = p2.y * H;
            const active = activeId === s.id || activeId === tId;
            const mx = (x1 + x2) / 2;
            const d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
            return (
              <g key={`${s.id}-${tId}`}>
                <path d={d} fill="none" stroke={active ? color : C.line}
                  strokeWidth={active ? 2 : 1} opacity={active ? 0.7 : 0.25}
                  style={{ transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
                {active && (
                  <circle r="3" fill={color} opacity="0.7">
                    <animateMotion dur="2s" repeatCount="indefinite" path={d} />
                  </circle>
                )}
              </g>
            );
          }))}

          {/* Bubbles */}
          {sections.map(s => {
            const p = positions[s.id];
            if (!p) return null;
            const x = p.x * W, y = p.y * H, r = p.r;
            const isActive = activeId === s.id;
            const isRelated = relatedIds.has(s.id);
            const scale = isActive ? 1.15 : isRelated ? 1.05 : 1;

            return (
              <g key={s.id} onClick={() => setActiveId(prev => prev === s.id ? null : s.id)} style={{ cursor: "pointer" }}>
                {/* Glow */}
                {isActive && <circle cx={x} cy={y} r={r + 10} fill={glow} style={{ transition: "all 0.4s ease" }} />}
                {/* Pulse */}
                {isActive && <circle cx={x} cy={y} r={r + 16} fill="none" stroke={color} strokeWidth="0.5" opacity="0.2" style={{ animation: "pulseRing 2.5s ease-out infinite" }} />}
                {/* Main circle */}
                <circle cx={x} cy={y} r={r * scale}
                  fill={isActive ? `${color}22` : isRelated ? `${color}11` : C.bgSurface}
                  stroke={isActive ? color : isRelated ? `${color}55` : C.border}
                  strokeWidth={isActive ? 1.5 : 1}
                  style={{ transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)" }} />
                {/* Inner ring */}
                <circle cx={x} cy={y} r={r * scale - 5} fill="none" stroke={isActive ? color : C.border}
                  strokeWidth="0.4" strokeDasharray="3 3" opacity={isActive ? 0.4 : 0.15}
                  style={{ transition: "all 0.5s ease" }}>
                  {isActive && <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`360 ${x} ${y}`} dur="15s" repeatCount="indefinite" />}
                </circle>
                {/* Label */}
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                  fill={isActive ? C.text : isRelated ? C.textMuted : C.textDim}
                  fontSize="10" fontWeight={isActive ? "600" : "500"} fontFamily={SANS}
                  style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.3s ease" }}>
                  {s.short}
                </text>
                {/* Count badge */}
                <text x={x} y={y + r * scale + 14} textAnchor="middle" fill={C.textDim}
                  fontSize="9" fontFamily={MONO} style={{ pointerEvents: "none" }}>
                  {s.count}L
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail Card */}
      {activeNode && (
        <div style={{
          margin: "12px 0", padding: "20px", borderRadius: "12px",
          background: `${C.bgSurface}f0`, border: `1px solid ${color}33`,
          backdropFilter: "blur(12px)", animation: "panelIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: `0 0 30px ${glow}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }} />
            <span style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>{activeNode.label}</span>
            <span style={{ marginLeft: "auto", fontSize: "10px", fontFamily: MONO, color: C.textDim }}>{activeNode.lectures} // {activeNode.count} lectures</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "14px" }}>
            {activeNode.topics.map((t, i) => (
              <span key={t} style={{
                padding: "3px 9px", borderRadius: "5px", background: `${color}15`,
                border: `1px solid ${color}25`, color: C.textMuted, fontSize: "11px",
                animation: `tagIn 0.25s ease ${i * 0.03}s both`,
              }}>{t}</span>
            ))}
          </div>
          {activeNode.prereqs.length > 0 && (
            <p style={{ fontSize: "10px", fontFamily: MONO, color: C.textDim, margin: "0 0 10px" }}>
              PREREQS: {activeNode.prereqs.map(p => sections.find(s => s.id === p)?.short || p).join(", ")}
            </p>
          )}
          <button onClick={onEnterModule} style={{
            padding: "8px 20px", borderRadius: "8px", background: `${color}22`, border: `1px solid ${color}44`,
            color: C.text, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: SANS,
          }}>Open Lectures \u2192</button>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──
export default function Telpo() {
  const [unlocked, setUnlocked] = useState(false);
  const [page, setPage] = useState("home");
  const [refresh, setRefresh] = useState(0);
  const [showFocus, setShowFocus] = useState(false);
  const [bossBattle, setBossBattle] = useState(null);
  const [showReview, setShowReview] = useState(true);

  // Game state
  const [game, setGame] = useState(loadGame);
  const updateGame = (updates) => {
    setGame(prev => {
      const next = { ...prev, ...updates };
      saveGame(next);
      return next;
    });
  };

  // Check streak on load
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const g = { ...game };
    if (g.dailyDate !== today) { g.dailyDone = 0; g.dailyDate = today; }
    if (g.lastStudyDate) {
      const last = new Date(g.lastStudyDate);
      const diff = Math.floor((new Date(today) - last) / 86400000);
      if (diff > 1) g.streak = 0;
    }
    saveGame(g);
    setGame(g);
  }, []);

  const ambient = useAmbientSound();
  const soundModes = [
    { key: "rain", label: "Rain", icon: "\uD83C\uDF27" },
    { key: "drone", label: "Drone", icon: "\u25CE" },
    { key: "whitenoise", label: "White Noise", icon: "\u301C" },
    { key: "lofi", label: "Lo-fi", icon: "\u266B" },
  ];

  const xpForNext = game.level * 150;
  const xpMultiplier = game.streak >= 7 ? 3 : game.streak >= 3 ? 2 : 1;
  const dailyGoal = 3;

  const addXp = (amount) => {
    const newXp = game.xp + amount;
    if (newXp >= xpForNext) {
      updateGame({ xp: newXp - xpForNext, level: game.level + 1 });
    } else {
      updateGame({ xp: newXp });
    }
  };

  const handleFocusComplete = (duration) => {
    const earned = (duration === 25 ? 50 : 120) * xpMultiplier;
    const today = new Date().toISOString().slice(0, 10);
    const newSessions = { ...game.sessions, [today]: (game.sessions[today] || 0) + 1 };
    addXp(earned);
    updateGame({ sessions: newSessions, lastStudyDate: today, streak: game.streak + (game.lastStudyDate !== today ? 1 : 0) });
  };

  const handleBossComplete = (subjectId) => {
    const newConquered = [...new Set([...game.conquered, subjectId])];
    addXp(100);
    updateGame({ conquered: newConquered });
  };

  const reviewCards = useMemo(() => {
    let cards = [];
    game.conquered.forEach(id => {
      if (REVIEW_CARDS[id]) cards = cards.concat(REVIEW_CARDS[id]);
    });
    return cards.slice(0, 5);
  }, [game.conquered]);

  const goBack = () => { setPage("home"); setRefresh(r => r + 1); };

  // ── Render module pages (pass through to existing components) ──
  if (!unlocked) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes shakeX{0%,100%{transform:translateX(0)}20%{transform:translateX(-12px)}40%{transform:translateX(10px)}60%{transform:translateX(-8px)}80%{transform:translateX(6px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <PasswordScreen onUnlock={() => setUnlocked(true)} />
    </>
  );

  if (page === "calc") return <CalcLab onBack={goBack} />;
  if (page === "physics") return <PhysicsLab onBack={goBack} />;
  if (page === "chem") return <ChemPlacement onBack={goBack} />;
  if (page === "cpp") return <CodingLab subject="cpp" onBack={goBack} />;
  if (page === "rust") return <CodingLab subject="rust" onBack={goBack} />;

  // Bubble map views
  if (page === "map-calc") {
    const sub = SUBJECTS.find(s => s.id === "calc");
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: SANS, position: "relative" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
          *{box-sizing:border-box;}
          @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
          @keyframes pulseRing{0%{opacity:0.3}100%{opacity:0}}
          @keyframes panelIn{0%{opacity:0;transform:scale(0.92) translateY(6px)}100%{opacity:1;transform:scale(1) translateY(0)}}
          @keyframes tagIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        `}</style>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
          <defs><pattern id="dg2" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke={C.gridLine} strokeWidth="0.5" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dg2)" />
        </svg>
        <div style={{ position: "relative", zIndex: 1, animation: "fadeIn 0.5s ease" }}>
          <BubbleMap moduleKey="calc" moduleLabel={sub.title} color={sub.color} glow={sub.glow}
            sections={SECTIONS.calc} onBack={() => setPage("home")} onEnterModule={() => setPage("calc")} />
        </div>
      </div>
    );
  }
  if (page === "map-physics") {
    const sub = SUBJECTS.find(s => s.id === "physics");
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: SANS, position: "relative" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
          *{box-sizing:border-box;}
          @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
          @keyframes pulseRing{0%{opacity:0.3}100%{opacity:0}}
          @keyframes panelIn{0%{opacity:0;transform:scale(0.92) translateY(6px)}100%{opacity:1;transform:scale(1) translateY(0)}}
          @keyframes tagIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        `}</style>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
          <defs><pattern id="dg3" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke={C.gridLine} strokeWidth="0.5" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dg3)" />
        </svg>
        <div style={{ position: "relative", zIndex: 1, animation: "fadeIn 0.5s ease" }}>
          <BubbleMap moduleKey="physics" moduleLabel={sub.title} color={sub.color} glow={sub.glow}
            sections={SECTIONS.physics} onBack={() => setPage("home")} onEnterModule={() => setPage("physics")} />
        </div>
      </div>
    );
  }
  if (page === "map-chem") {
    const sub = SUBJECTS.find(s => s.id === "chem");
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: SANS, position: "relative" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
          *{box-sizing:border-box;}
          @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
          @keyframes pulseRing{0%{opacity:0.3}100%{opacity:0}}
          @keyframes panelIn{0%{opacity:0;transform:scale(0.92) translateY(6px)}100%{opacity:1;transform:scale(1) translateY(0)}}
          @keyframes tagIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        `}</style>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
          <defs><pattern id="dg4" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke={C.gridLine} strokeWidth="0.5" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dg4)" />
        </svg>
        <div style={{ position: "relative", zIndex: 1, animation: "fadeIn 0.5s ease" }}>
          <BubbleMap moduleKey="chem" moduleLabel={sub.title} color={sub.color} glow={sub.glow}
            sections={SECTIONS.chem} onBack={() => setPage("home")} onEnterModule={() => setPage("chem")} />
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  const totalAll = SUBJECTS.reduce((s, x) => s + x.lectures, 0);
  const masteredAll = SUBJECTS.reduce((s, x) => s + getProgress(x.storageKey).mastered, 0);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: SANS, position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gridPulse{0%,100%{opacity:0.3}50%{opacity:0.6}}
        @keyframes pulseRing{0%{opacity:0.3}100%{opacity:0}}
        @keyframes panelIn{0%{opacity:0;transform:scale(0.92) translateY(6px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes tagIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:${C.bgDeep}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
      `}</style>

      {/* Grid bg */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
        <defs><pattern id="dg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke={C.gridLine} strokeWidth="0.5" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#dg)" />
      </svg>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "0 20px", animation: "fadeIn 0.5s ease" }}>
        {/* Header */}
        <div style={{ paddingTop: 32, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: C.textDim, letterSpacing: 3, textTransform: "uppercase", margin: "0 0 4px", fontFamily: MONO }}>Telpo</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Study Dashboard</h1>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Ambient */}
            <div style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "8px", background: C.bgSurface, border: `1px solid ${C.border}` }}>
              {soundModes.map(m => (
                <button key={m.key} onClick={() => ambient.toggle(m.key)} title={m.label} style={{
                  width: "32px", height: "32px", borderRadius: "6px", border: "none",
                  background: ambient.playing && ambient.mode === m.key ? `${C.accent}22` : "transparent",
                  color: ambient.playing && ambient.mode === m.key ? C.accent : C.textDim,
                  fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>{m.icon}</button>
              ))}
            </div>
            <button onClick={() => setShowFocus(true)} style={{
              padding: "10px 18px", borderRadius: "8px", background: `${C.accent}18`, border: `1px solid ${C.accent}33`,
              color: C.accent, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: SANS,
            }}>Focus</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "Streak", value: game.streak, sub: `days (${xpMultiplier}x)`, color: C.streak, bar: game.streak, barMax: 7 },
            { label: `Level ${game.level}`, value: game.xp, sub: `/ ${xpForNext} XP`, color: C.xp, bar: game.xp, barMax: xpForNext },
            { label: "Daily Goal", value: game.dailyDone, sub: `/ ${dailyGoal} lectures`, color: game.dailyDone >= dailyGoal ? C.green : C.text, bar: game.dailyDone, barMax: dailyGoal },
            { label: "Mastered", value: masteredAll, sub: `/ ${totalAll} total`, color: C.gold, bar: masteredAll, barMax: totalAll },
          ].map((s, i) => (
            <div key={i} style={{ padding: "14px 16px", borderRadius: "10px", background: C.bgSurface, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "10px", fontFamily: MONO, color: C.textDim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: "26px", fontWeight: 700, color: s.color, fontFamily: MONO }}>{s.value}</span>
                <span style={{ fontSize: "10px", color: C.textDim }}>{s.sub}</span>
              </div>
              <div style={{ marginTop: "8px", height: "4px", borderRadius: "2px", background: C.bgHover }}>
                <div style={{ width: `${Math.min((s.bar / s.barMax) * 100, 100)}%`, height: "100%", borderRadius: "2px", background: s.color, transition: "width 0.5s ease", opacity: 0.7 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Heat Map */}
        <div style={{ marginBottom: "20px", padding: "16px", borderRadius: "10px", background: C.bgSurface, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "10px", fontFamily: MONO, color: C.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>90 Day Activity</span>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span style={{ fontSize: "9px", color: C.textDim, fontFamily: MONO }}>less</span>
              {[0, 1, 2, 3].map(i => <div key={i} style={{ width: "10px", height: "10px", borderRadius: "2px", background: i === 0 ? C.bgHover : i === 1 ? `${C.green}55` : i === 2 ? `${C.green}88` : C.green }} />)}
              <span style={{ fontSize: "9px", color: C.textDim, fontFamily: MONO }}>more</span>
            </div>
          </div>
          <HeatMap sessions={game.sessions} />
        </div>

        {/* Spaced Repetition */}
        {showReview && reviewCards.length > 0 && (
          <ReviewQueue cards={reviewCards} onDismiss={() => { setShowReview(false); addXp(reviewCards.length * 10); }} />
        )}

        {/* Module Cards */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "10px", fontFamily: MONO, color: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Modules</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {SUBJECTS.map(sub => {
              const prog = getProgress(sub.storageKey);
              const pct = sub.lectures > 0 ? (prog.mastered / sub.lectures) * 100 : 0;
              const isConquered = game.conquered.includes(sub.id);

              return (
                <div key={sub.id} style={{
                  display: "flex", alignItems: "center", gap: "16px", padding: "16px 18px",
                  background: C.bgSurface, borderRadius: "10px", border: `1px solid ${C.border}`,
                  cursor: "pointer", transition: "all 0.2s",
                }}
                  onClick={() => {
                    const hasMap = ["calc", "physics", "chem"].includes(sub.id);
                    setPage(hasMap ? `map-${sub.id}` : sub.id);
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${sub.color}44`; e.currentTarget.style.background = C.bgHover; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bgSurface; }}
                >
                  {/* Icon with progress ring */}
                  <div style={{ width: 44, height: 44, position: "relative", flexShrink: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", background: `${sub.color}18`, border: `1px solid ${sub.color}33`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: sub.color,
                    }}>{sub.icon}</div>
                    <svg style={{ position: "absolute", inset: "-2px" }} width="48" height="48">
                      <circle cx="24" cy="24" r="22" fill="none" stroke={`${sub.color}22`} strokeWidth="2" />
                      <circle cx="24" cy="24" r="22" fill="none" stroke={sub.color} strokeWidth="2" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 22}`} strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
                        transform="rotate(-90 24 24)" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{sub.title}</span>
                      {isConquered && <span style={{ fontSize: "9px", fontFamily: MONO, color: C.gold, background: `${C.gold}18`, padding: "2px 8px", borderRadius: "4px" }}>CONQUERED</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{sub.desc}</div>
                    <div style={{ fontSize: 10, color: C.textDim, fontFamily: MONO, marginTop: 4 }}>{prog.mastered}/{sub.lectures} mastered</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end", flexShrink: 0 }}>
                    {!isConquered && BOSS_Q[sub.id] && (
                      <button onClick={(e) => { e.stopPropagation(); setBossBattle({ id: sub.id, title: sub.title, color: sub.color }); }} style={{
                        padding: "5px 12px", borderRadius: "6px", background: `${C.gold}12`, border: `1px solid ${C.gold}33`,
                        color: C.gold, fontSize: "10px", fontWeight: 600, cursor: "pointer", fontFamily: MONO,
                      }}>BOSS \u2694</button>
                    )}
                    <span style={{ color: C.textLight, fontSize: 16 }}>&rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session tip */}
        <div style={{ marginTop: "16px", padding: "16px 20px", borderRadius: "10px", background: `${C.accent}08`, border: `1px solid ${C.accent}15`, marginBottom: "32px" }}>
          <div style={{ fontSize: "10px", fontFamily: MONO, color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Session Tip</div>
          <p style={{ margin: 0, fontSize: "12px", color: C.textMuted, lineHeight: 1.6 }}>
            {game.dailyDone < dailyGoal
              ? `Complete ${dailyGoal - game.dailyDone} more lecture${dailyGoal - game.dailyDone > 1 ? "s" : ""} to hit your daily goal. Focus sessions earn ${xpMultiplier}x XP.`
              : "Daily goal reached. Keep building your streak for higher XP multipliers."}
          </p>
        </div>

        {/* Status bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "32px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}`, animation: "gridPulse 2s ease infinite" }} />
          <span style={{ fontSize: "10px", color: C.textDim, fontFamily: MONO }}>
            TELPO v2.0 // {SUBJECTS.length} MODULES // {totalAll} LECTURES
          </span>
          {ambient.playing && <span style={{ fontSize: "10px", color: C.accent, fontFamily: MONO, marginLeft: "auto" }}>{"\u266B"} {ambient.mode.toUpperCase()}</span>}
        </div>
      </div>

      {/* Overlays */}
      {showFocus && <FocusTimer onClose={() => setShowFocus(false)} onComplete={handleFocusComplete} xpMultiplier={xpMultiplier} />}
      {bossBattle && <BossBattle subjectId={bossBattle.id} subjectTitle={bossBattle.title} color={bossBattle.color} onComplete={handleBossComplete} onClose={() => setBossBattle(null)} />}
    </div>
  );
}
