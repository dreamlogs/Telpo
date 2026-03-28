import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import CalcLab from "./calc_lab";
import PhysicsLab from "./physics";
import CodingLab from "./coding";
import ChemPlacement from "./chem_placement";

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

const SUBJECTS = [
  { id: "calc", title: "Calculus I", desc: "32 lectures, Professor Leonard", lectures: 32, storageKey: "telpo-calc-v1", color: C.calculus, glow: C.calculusGlow },
  { id: "physics", title: "Physics", desc: "15 units, mechanics to nuclear", lectures: 48, storageKey: "telpo-physics-v1", color: C.physics, glow: C.physicsGlow },
  { id: "chem", title: "Chem Placement", desc: "5 week plan for CHEM 1A", lectures: 16, storageKey: "telpo-chemplace-v1", color: C.chem, glow: C.chemGlow },
  { id: "cpp", title: "Arduino C++", desc: "Embedded systems programming", lectures: 20, storageKey: "telpo-cpp-v1", color: C.code, glow: C.codeGlow },
  { id: "rust", title: "Rust", desc: "Systems programming from zero", lectures: 18, storageKey: "telpo-rust-v1", color: C.code, glow: C.codeGlow },
];

const SECTIONS = {
  calc: [
    { id: "precalc", label: "Precalc Review", short: "Precalc", lectureIds: ["0.1","0.2","0.3","0.4"], connections: ["limits"], desc: "Functions, trig, graphing foundations" },
    { id: "limits", label: "Limits & Continuity", short: "Limits", lectureIds: ["1.1","1.2","1.4","1.5"], connections: ["derivatives"], desc: "Evaluating limits, continuity, squeeze theorem" },
    { id: "derivatives", label: "Differentiation", short: "Deriv", lectureIds: ["2.1","2.2","2.3","2.4","2.5","2.6","2.7","2.8"], connections: ["applications","integrals"], desc: "Power, product, quotient, chain rules, implicit, related rates" },
    { id: "applications", label: "Applications", short: "Apps", lectureIds: ["3.1","3.2","3.3","3.4","3.5","3.6","3.7"], connections: ["integrals"], desc: "Max/min, MVT, curve sketching, optimization" },
    { id: "integrals", label: "Integration", short: "Integ", lectureIds: ["4.1","4.2","4.3","4.4","4.5","5.1","5.2","5.3","5.4"], connections: [], desc: "Antiderivatives, FTC, area, volume, arc length" },
  ],
  physics: [
    { id: "ph_vectors", label: "Vectors & 1D Motion", short: "Vectors", lectureIds: [], connections: ["ph_forces"], desc: "Components, kinematics, free fall" },
    { id: "ph_forces", label: "Forces & Laws", short: "Forces", lectureIds: [], connections: ["ph_energy"], desc: "Newton's laws, friction, circular motion" },
    { id: "ph_energy", label: "Energy & Momentum", short: "Energy", lectureIds: [], connections: ["ph_rotation"], desc: "Work, KE/PE, conservation, collisions" },
    { id: "ph_rotation", label: "Rotation & Gravity", short: "Rotation", lectureIds: [], connections: ["ph_waves"], desc: "Torque, angular momentum, gravitation" },
    { id: "ph_waves", label: "Waves & Modern", short: "Waves", lectureIds: [], connections: [], desc: "SHM, waves, sound, nuclear" },
  ],
  chem: [
    { id: "ch_atomic", label: "Atomic Structure", short: "Atomic", lectureIds: [], connections: ["ch_bonding"], desc: "Electron config, quantum numbers, trends" },
    { id: "ch_bonding", label: "Chemical Bonding", short: "Bonding", lectureIds: [], connections: ["ch_reactions"], desc: "Lewis structures, VSEPR, hybridization" },
    { id: "ch_reactions", label: "Reactions & Stoich", short: "Reactions", lectureIds: [], connections: ["ch_solutions"], desc: "Balancing, moles, limiting reagent" },
    { id: "ch_solutions", label: "Solutions & Acids", short: "Solutions", lectureIds: [], connections: ["ch_gas"], desc: "Molarity, pH, acid-base" },
    { id: "ch_gas", label: "Gas Laws", short: "Gas", lectureIds: [], connections: [], desc: "Ideal gas, Dalton's, KMT" },
  ],
};

// Calc lecture data for inline display
const CALC_LECTURES = {
  "0.1": { title: "Lines, Angle of Inclination, Distance Formula", duration: "48:58" },
  "0.2": { title: "Introduction to Functions", duration: "1:37:06" },
  "0.3": { title: "Trigonometry and Graphing Trig Functions", duration: "1:20:15" },
  "0.4": { title: "Combining and Composition of Functions", duration: "15:53" },
  "1.1": { title: "An Introduction to Limits", duration: "1:27:26" },
  "1.2": { title: "Properties of Limits", duration: "3:00:15" },
  "1.4": { title: "Continuity of Functions", duration: "1:26:51" },
  "1.5": { title: "Slope of a Curve, Velocity, Rates of Change", duration: "1:50:43" },
  "2.1": { title: "Introduction to the Derivative", duration: "1:16:01" },
  "2.2": { title: "Techniques of Differentiation", duration: "1:12:31" },
  "2.3": { title: "Product and Quotient Rules", duration: "1:02:22" },
  "2.4": { title: "Applications of the Derivative", duration: "40:39" },
  "2.5": { title: "Derivatives of Trig Functions", duration: "48:43" },
  "2.6": { title: "The Chain Rule", duration: "1:34:01" },
  "2.7": { title: "Implicit Differentiation", duration: "1:08:11" },
  "2.8": { title: "Related Rates", duration: "53:52" },
  "3.1": { title: "Increasing/Decreasing and Concavity", duration: "1:34:07" },
  "3.2": { title: "Rolle's and Mean Value Theorem", duration: "6:36" },
  "3.3": { title: "First Derivative Test", duration: "26:10" },
  "3.4": { title: "Second Derivative Test", duration: "36:50" },
  "3.5": { title: "Limits at Infinity", duration: "1:23:49" },
  "3.6": { title: "How to Sketch Graphs", duration: "1:32:36" },
  "3.7": { title: "Optimization Problems", duration: "1:34:43" },
  "4.1": { title: "The Indefinite Integral", duration: "2:45:37" },
  "4.2": { title: "Integration by Substitution", duration: "1:33:58" },
  "4.3": { title: "Area Under a Curve, Riemann Sums", duration: "2:07:03" },
  "4.4": { title: "Evaluation of Definite Integrals", duration: "30:55" },
  "4.5": { title: "The Fundamental Theorem of Calculus", duration: "2:46:09" },
  "5.1": { title: "Area Between Two Curves", duration: "1:33:46" },
  "5.2": { title: "Volume by Disks and Washers", duration: "2:47:49" },
  "5.3": { title: "Volume by Cylindrical Shells", duration: "54:56" },
  "5.4": { title: "Arc Length", duration: "2:17:58" },
};

function getProgress(key) {
  try { const r = localStorage.getItem(key); if (!r) return { mastered: 0, watched: 0 }; const d = JSON.parse(r); const v = Object.values(d); return { mastered: v.filter(x => x === "mastered").length, watched: v.filter(x => x === "watched" || x === "mastered").length }; } catch { return { mastered: 0, watched: 0 }; }
}
function getCalcProgress() {
  try { const r = localStorage.getItem("telpo-calc-v1"); return r ? JSON.parse(r) : {}; } catch { return {}; }
}

const GAME_KEY = "telpo-game-v2";
function loadGame() { try { const r = localStorage.getItem(GAME_KEY); if (r) return JSON.parse(r); } catch {} return { xp: 0, level: 1, streak: 0, lastStudyDate: null, sessions: {}, dailyDone: 0, dailyDate: null, conquered: [] }; }
function saveGame(g) { try { localStorage.setItem(GAME_KEY, JSON.stringify(g)); } catch {} }

const BOSS_Q = {
  calc: [
    { q: "d/dx [x^3] = ?", opts: ["3x^2", "x^2", "3x", "x^3/3"], ans: 0 },
    { q: "lim(x->0) sin(x)/x = ?", opts: ["1", "0", "inf", "DNE"], ans: 0 },
    { q: "integral 2x dx = ?", opts: ["x^2 + C", "2x^2 + C", "x^2", "2x + C"], ans: 0 },
    { q: "Chain rule: d/dx [f(g(x))] = ?", opts: ["f'(g(x)) * g'(x)", "f'(x) * g'(x)", "f(g'(x))", "f'(g(x))"], ans: 0 },
    { q: "FTC Part 1: d/dx integral_a^x f(t)dt = ?", opts: ["f(x)", "F(x)", "f'(x)", "F(a)"], ans: 0 },
  ],
  physics: [
    { q: "F = ma. If m=5kg, a=3m/s^2, F = ?", opts: ["15N", "8N", "1.67N", "53N"], ans: 0 },
    { q: "KE = ?", opts: ["(1/2)mv^2", "mgh", "Fd", "mv"], ans: 0 },
    { q: "Free fall acceleration:", opts: ["9.8 m/s^2", "10 m/s", "9.8 m/s", "0 m/s^2"], ans: 0 },
  ],
  chem: [
    { q: "Electrons in neutral Carbon?", opts: ["6", "12", "4", "8"], ans: 0 },
    { q: "pH of neutral solution at 25C:", opts: ["7", "0", "14", "1"], ans: 0 },
    { q: "In PV = nRT, R is the:", opts: ["Gas constant", "Resistance", "Rate", "Radius"], ans: 0 },
  ],
};

const REVIEW_CARDS = {
  calc: ["State the power rule.", "What does f'(a) = 0 mean geometrically?", "When do you use L'Hopital's Rule?", "State FTC Part 2.", "When is u-sub useful?"],
  physics: ["State Newton's Second Law.", "What is the work-energy theorem?", "When is momentum conserved?"],
  chem: ["What determines chemical properties?", "How to find limiting reagent?", "What is molarity?"],
};

// ── Ambient Sound ──
function useAmbientSound() {
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState("rain");
  const stop = useCallback(() => { nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} }); nodesRef.current = []; setPlaying(false); }, []);
  const start = useCallback((m) => {
    stop();
    const ctx = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx; if (ctx.state === "suspended") ctx.resume();
    const nodes = []; const master = ctx.createGain(); master.gain.value = 0.12; master.connect(ctx.destination);
    if (m === "whitenoise") {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 800;
      src.connect(lp); lp.connect(master); src.start(); nodes.push(src);
    } else if (m === "drone") {
      [55, 82.5, 110, 165].forEach((f, i) => { const o = ctx.createOscillator(); o.type = i === 0 ? "sine" : "triangle"; o.frequency.value = f; const g = ctx.createGain(); g.gain.value = i === 0 ? 0.06 : 0.025; o.connect(g); g.connect(master); o.start(); nodes.push(o); });
    } else if (m === "rain") {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1200; bp.Q.value = 0.5;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3000;
      src.connect(bp); bp.connect(lp); lp.connect(master); src.start(); nodes.push(src);
    } else if (m === "lofi") {
      [261.6, 329.6, 392, 523.2].forEach((f, i) => { const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f; const g = ctx.createGain(); g.gain.value = 0; const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 400; o.connect(lp); lp.connect(g); g.connect(master); o.start(); const cy = 4 + i * 1.5; const now = ctx.currentTime; for (let t = 0; t < 120; t += cy) { g.gain.setValueAtTime(0, now + t); g.gain.linearRampToValueAtTime(0.04, now + t + cy * 0.3); g.gain.linearRampToValueAtTime(0, now + t + cy); } nodes.push(o); });
    } else if (m === "psy") {
      const hour = new Date().getHours();
      const isNight = hour >= 20 || hour < 6, isMorning = hour >= 6 && hour < 12;
      const baseFreq = isNight ? 40 : isMorning ? 50 : 55;
      const bpm = isNight ? 136 : isMorning ? 140 : 142;
      const fBase = isNight ? 200 : isMorning ? 300 : 400;
      const fRange = isNight ? 400 : isMorning ? 800 : 1200;
      const pCut = isNight ? 250 : isMorning ? 400 : 600;
      const rez = isNight ? 12 : isMorning ? 8 : 6;
      master.gain.value = 0.08;
      const sub = ctx.createOscillator(); sub.type = "sine"; sub.frequency.value = baseFreq;
      const subG = ctx.createGain(); subG.gain.value = 0.06; sub.connect(subG); subG.connect(master); sub.start(); nodes.push(sub);
      const subP = ctx.createOscillator(); subP.type = "sine"; subP.frequency.value = bpm / 60;
      const subPG = ctx.createGain(); subPG.gain.value = 0.03; subP.connect(subPG); subPG.connect(subG.gain); subP.start(); nodes.push(subP);
      const acid = ctx.createOscillator(); acid.type = "sawtooth"; acid.frequency.value = baseFreq * 2;
      const acidF = ctx.createBiquadFilter(); acidF.type = "lowpass"; acidF.frequency.value = fBase; acidF.Q.value = rez;
      const acidG = ctx.createGain(); acidG.gain.value = 0.035; acid.connect(acidF); acidF.connect(acidG); acidG.connect(master); acid.start(); nodes.push(acid);
      const aLfo = ctx.createOscillator(); aLfo.type = "sine"; aLfo.frequency.value = bpm / 60 / 4;
      const aLfoG = ctx.createGain(); aLfoG.gain.value = fRange; aLfo.connect(aLfoG); aLfoG.connect(acidF.frequency); aLfo.start(); nodes.push(aLfo);
      const mLfo = ctx.createOscillator(); mLfo.type = "sine"; mLfo.frequency.value = 0.003;
      const mLfoG = ctx.createGain(); mLfoG.gain.value = fRange * 0.5; mLfo.connect(mLfoG); mLfoG.connect(aLfoG.gain); mLfo.start(); nodes.push(mLfo);
      const aPump = ctx.createOscillator(); aPump.type = "sine"; aPump.frequency.value = bpm / 60;
      const aPumpG = ctx.createGain(); aPumpG.gain.value = 0.015; aPump.connect(aPumpG); aPumpG.connect(acidG.gain); aPump.start(); nodes.push(aPump);
      const acid2 = ctx.createOscillator(); acid2.type = "sawtooth"; acid2.frequency.value = baseFreq * 2 + 1.5;
      const acid2F = ctx.createBiquadFilter(); acid2F.type = "lowpass"; acid2F.frequency.value = fBase; acid2F.Q.value = rez - 2;
      const acid2G = ctx.createGain(); acid2G.gain.value = 0.02; acid2.connect(acid2F); acid2F.connect(acid2G); acid2G.connect(master); acid2.start(); nodes.push(acid2);
      const a2LG = ctx.createGain(); a2LG.gain.value = fRange * 0.8; aLfo.connect(a2LG); a2LG.connect(acid2F.frequency);
      [baseFreq*3,baseFreq*4,baseFreq*5,baseFreq*6,baseFreq*8].forEach((f,i) => {
        const o = ctx.createOscillator(); o.type = i%2===0?"sine":"triangle"; o.frequency.value = f+(Math.random()*3-1.5);
        const pf = ctx.createBiquadFilter(); pf.type = "lowpass"; pf.frequency.value = pCut;
        const pg = ctx.createGain(); pg.gain.value = 0.012; o.connect(pf); pf.connect(pg); pg.connect(master); o.start(); nodes.push(o);
        const pl = ctx.createOscillator(); pl.frequency.value = 0.03+i*0.015; const plg = ctx.createGain(); plg.gain.value = 0.008; pl.connect(plg); plg.connect(pg.gain); pl.start(); nodes.push(pl);
      });
      const nB = ctx.createBuffer(1, ctx.sampleRate*2, ctx.sampleRate); const nD = nB.getChannelData(0); for(let j=0;j<nD.length;j++) nD[j]=Math.random()*2-1;
      const nS = ctx.createBufferSource(); nS.buffer = nB; nS.loop = true;
      const nBp = ctx.createBiquadFilter(); nBp.type = "bandpass"; nBp.frequency.value = isNight?2000:4000; nBp.Q.value = 1.5;
      const nG = ctx.createGain(); nG.gain.value = 0.006; nS.connect(nBp); nBp.connect(nG); nG.connect(master); nS.start(); nodes.push(nS);
      const hL = ctx.createOscillator(); hL.type = "square"; hL.frequency.value = bpm/60*2;
      const hLG = ctx.createGain(); hLG.gain.value = 0.004; hL.connect(hLG); hLG.connect(nG.gain); hL.start(); nodes.push(hL);
      fetch("https://api.open-meteo.com/v1/forecast?latitude=33.79&longitude=-118.32&current_weather=true")
        .then(r=>r.json()).then(data=>{const wc=data?.current_weather?.weathercode||0;if(wc>=51){acidF.Q.value=14;acid2F.Q.value=12;nG.gain.value=0.012;nBp.frequency.value=1500;}else if(wc>=2){acidF.Q.value=10;nBp.frequency.value=3000;}}).catch(()=>{});
    }
    nodesRef.current = nodes; setPlaying(true); setMode(m);
  }, [stop]);
  const toggle = useCallback((m) => { if (playing && mode === m) stop(); else start(m); }, [playing, mode, start, stop]);
  return { playing, mode, toggle, stop };
}

// ── Password ──
function PasswordScreen({ onUnlock }) {
  const [code, setCode] = useState(""); const [shake, setShake] = useState(false);
  const [dots, setDots] = useState([false,false,false,false]); const ref = useRef(null);
  const PASSWORD = "0622";
  useEffect(() => { ref.current?.focus(); }, []);
  const handleKey = (d) => { if (code.length >= 4) return; const n = code + d; setCode(n); const nd = [false,false,false,false]; for(let i=0;i<n.length;i++) nd[i]=true; setDots(nd); if (n.length===4) { setTimeout(()=>{ if(n===PASSWORD) onUnlock(); else{setShake(true);setTimeout(()=>{setShake(false);setCode("");setDots([false,false,false,false]);},500);} },200); } };
  const handleBack = () => { if(code.length>0){const n=code.slice(0,-1);setCode(n);const nd=[false,false,false,false];for(let i=0;i<n.length;i++) nd[i]=true;setDots(nd);} };
  const handleKeyDown = (e) => { if(e.key>="0"&&e.key<="9") handleKey(e.key); if(e.key==="Backspace") handleBack(); };
  const keys = ["1","2","3","4","5","6","7","8","9","","0","del"];
  return (
    <div tabIndex={0} ref={ref} onKeyDown={handleKeyDown} style={{width:"100%",minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:SANS,outline:"none",position:"relative"}}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}><defs><pattern id="pg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke={C.gridLine} strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#pg)"/></svg>
      <div style={{position:"relative",zIndex:2,textAlign:"center"}}>
        <h1 style={{margin:"0 0 4px",fontSize:"28px",fontWeight:700,color:C.text,letterSpacing:"-0.03em"}}>telpo</h1>
        <p style={{margin:"0 0 40px",fontSize:"11px",color:C.textDim,fontFamily:MONO,letterSpacing:"0.1em",textTransform:"uppercase"}}>enter access code</p>
        <div style={{display:"flex",gap:"16px",justifyContent:"center",marginBottom:"40px",animation:shake?"shakeX 0.4s ease":"none"}}>
          {dots.map((f,i)=><div key={i} style={{width:"14px",height:"14px",borderRadius:"50%",border:`2px solid ${f?C.accent:C.border}`,background:f?C.accent:"transparent",boxShadow:f?`0 0 12px ${C.accent}55`:"none",transition:"all 0.2s ease"}}/>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,64px)",gap:"12px",justifyContent:"center"}}>
          {keys.map((k,i)=>k===""?<div key={i}/>:(
            <button key={k} onClick={()=>k==="del"?handleBack():handleKey(k)} style={{width:"64px",height:"64px",borderRadius:"50%",background:C.bgSurface,border:`1px solid ${C.border}`,color:C.text,fontSize:k==="del"?"11px":"20px",fontFamily:MONO,fontWeight:500,cursor:"pointer",transition:"all 0.15s ease",display:"flex",alignItems:"center",justifyContent:"center"}} onMouseEnter={e=>{e.target.style.background=C.bgHover}} onMouseLeave={e=>{e.target.style.background=C.bgSurface}}>{k}</button>
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
  const intRef = useRef(null);
  useEffect(() => { if(running&&seconds>0){intRef.current=setInterval(()=>setSeconds(s=>s-1),1000);} return()=>clearInterval(intRef.current); },[running,seconds]);
  useEffect(() => { if(seconds<=0&&duration&&running){setRunning(false);setCompleted(true);clearInterval(intRef.current);onComplete(duration);} },[seconds,duration,running]);
  const mins=Math.floor(seconds/60),secs=seconds%60,progress=duration?1-seconds/(duration*60):0,circ=2*Math.PI*90;
  if(duration===null) return (
    <div style={{position:"fixed",inset:0,zIndex:100,background:`${C.bgDeep}f5`,backdropFilter:"blur(24px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:SANS,animation:"fadeIn 0.4s ease"}}>
      <button onClick={onClose} style={{position:"absolute",top:24,right:28,background:"none",border:"none",color:C.textDim,fontSize:"14px",cursor:"pointer",fontFamily:MONO}}>ESC</button>
      <p style={{fontSize:"10px",fontFamily:MONO,letterSpacing:"0.12em",color:C.textDim,textTransform:"uppercase",marginBottom:"12px"}}>commitment device</p>
      <h2 style={{fontSize:"18px",fontWeight:700,color:C.text,marginBottom:"8px"}}>Choose Your Session</h2>
      <p style={{fontSize:"12px",color:C.textMuted,marginBottom:"32px",maxWidth:"300px",textAlign:"center",lineHeight:1.6}}>Leaving early resets your streak multiplier. Completing earns {xpMultiplier}x XP.</p>
      <div style={{display:"flex",gap:"16px"}}>
        {[25,50].map(d=><button key={d} onClick={()=>{setDuration(d);setSeconds(d*60);setRunning(true);}} style={{width:"140px",padding:"24px 16px",borderRadius:"14px",background:C.bgSurface,border:`1px solid ${C.border}`,cursor:"pointer",textAlign:"center",transition:"all 0.2s ease"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=`${C.accent}55`}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border}}>
          <div style={{fontSize:"32px",fontWeight:700,color:C.text,fontFamily:MONO}}>{d}</div>
          <div style={{fontSize:"11px",color:C.textDim,fontFamily:MONO,marginTop:"4px"}}>MINUTES</div>
          <div style={{fontSize:"10px",color:C.xp,marginTop:"8px"}}>+{d===25?50:120} XP</div>
        </button>)}
      </div>
    </div>
  );
  return (
    <div style={{position:"fixed",inset:0,zIndex:100,background:`${C.bgDeep}f5`,backdropFilter:"blur(24px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:SANS,animation:"fadeIn 0.4s ease"}}>
      {!completed&&<button onClick={onClose} style={{position:"absolute",top:24,right:28,background:"none",border:"none",color:C.red,fontSize:"11px",cursor:"pointer",fontFamily:MONO,letterSpacing:"0.08em"}}>ABANDON</button>}
      <p style={{fontSize:"10px",fontFamily:MONO,letterSpacing:"0.12em",color:C.textDim,textTransform:"uppercase",marginBottom:"32px"}}>{completed?"session complete":"focus mode // locked in"}</p>
      <svg width="200" height="200" style={{marginBottom:"28px"}}><circle cx="100" cy="100" r="90" fill="none" stroke={C.border} strokeWidth="3"/><circle cx="100" cy="100" r="90" fill="none" stroke={completed?C.green:C.accent} strokeWidth="3" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-progress)} transform="rotate(-90 100 100)" style={{transition:"stroke-dashoffset 1s linear"}}/><text x="100" y={completed?95:92} textAnchor="middle" fill={C.text} fontSize={completed?"24":"36"} fontFamily={MONO} fontWeight="600">{completed?"DONE":`${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`}</text>{!completed&&<text x="100" y="118" textAnchor="middle" fill={C.textDim} fontSize="10" fontFamily={MONO} letterSpacing="0.1em">{running?"LOCKED IN":"PAUSED"}</text>}</svg>
      {completed?(<div style={{textAlign:"center"}}><p style={{fontSize:"16px",color:C.xp,fontWeight:600,marginBottom:"4px"}}>+{(duration===25?50:120)*xpMultiplier} XP earned</p><button onClick={onClose} style={{marginTop:"16px",padding:"10px 28px",borderRadius:"8px",border:`1px solid ${C.green}44`,background:`${C.green}22`,color:C.text,fontSize:"13px",fontFamily:SANS,fontWeight:600,cursor:"pointer"}}>Continue Studying</button></div>):(<button onClick={()=>setRunning(!running)} style={{padding:"10px 28px",borderRadius:"8px",border:`1px solid ${C.accent}44`,background:running?C.bgSurface:`${C.accent}22`,color:C.text,fontSize:"13px",fontFamily:SANS,fontWeight:600,cursor:"pointer"}}>{running?"Pause":"Resume"}</button>)}
    </div>
  );
}

// ── Boss Battle ──
function BossBattle({ subjectId, subjectTitle, color, onComplete, onClose }) {
  const questions=BOSS_Q[subjectId]||BOSS_Q.calc;
  const [cur,setCur]=useState(0),[score,setScore]=useState(0),[sel,setSel]=useState(null),[showResult,setShowResult]=useState(false),[finished,setFinished]=useState(false),[timeLeft,setTimeLeft]=useState(30);
  const timerRef=useRef(null);
  useEffect(()=>{if(!finished&&sel===null){setTimeLeft(30);timerRef.current=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(timerRef.current);setSel(-1);setShowResult(true);return 0;}return t-1;}),1000);}return()=>clearInterval(timerRef.current);},[cur,finished]);
  const handleSelect=(i)=>{if(sel!==null)return;clearInterval(timerRef.current);setSel(i);setShowResult(true);if(i===questions[cur].ans)setScore(s=>s+1);};
  const handleNext=()=>{if(cur+1>=questions.length)setFinished(true);else{setCur(c=>c+1);setSel(null);setShowResult(false);}};
  const passed=score>=Math.ceil(questions.length*0.7);
  return (
    <div style={{position:"fixed",inset:0,zIndex:100,background:`${C.bgDeep}f5`,backdropFilter:"blur(24px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:SANS,animation:"fadeIn 0.4s ease",padding:"24px"}}>
      {!finished?(<div style={{maxWidth:"460px",width:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}><div><p style={{fontSize:"10px",fontFamily:MONO,color:color,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px"}}>Boss Battle</p><p style={{fontSize:"14px",fontWeight:700,color:C.text}}>{subjectTitle}</p></div><div style={{textAlign:"right"}}><div style={{fontSize:"22px",fontWeight:700,color:timeLeft<=10?C.red:C.text,fontFamily:MONO}}>{timeLeft}s</div><div style={{fontSize:"10px",color:C.textDim,fontFamily:MONO}}>{cur+1}/{questions.length}</div></div></div>
        <div style={{height:"3px",borderRadius:"2px",background:C.bgHover,marginBottom:"24px"}}><div style={{width:`${(cur/questions.length)*100}%`,height:"100%",borderRadius:"2px",background:color,transition:"width 0.4s ease"}}/></div>
        <p style={{fontSize:"15px",color:C.text,lineHeight:1.6,marginBottom:"24px"}}>{questions[cur].q}</p>
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>{questions[cur].opts.map((opt,i)=>{const isC=i===questions[cur].ans,isS=sel===i;let bg=C.bgSurface,bd=C.border,tx=C.textMuted;if(showResult&&isC){bg=`${C.green}22`;bd=`${C.green}55`;tx=C.text;}else if(showResult&&isS&&!isC){bg=`${C.red}22`;bd=`${C.red}55`;tx=C.text;}return(<button key={i} onClick={()=>handleSelect(i)} style={{padding:"14px 18px",borderRadius:"10px",background:bg,border:`1px solid ${bd}`,color:tx,fontSize:"13px",fontFamily:SANS,cursor:sel===null?"pointer":"default",textAlign:"left",transition:"all 0.25s ease"}}><span style={{fontFamily:MONO,marginRight:"10px",color:C.textDim,fontSize:"11px"}}>{String.fromCharCode(65+i)}</span>{opt}</button>);})}</div>
        {showResult&&<button onClick={handleNext} style={{marginTop:"20px",padding:"10px 24px",borderRadius:"8px",background:`${color}22`,border:`1px solid ${color}44`,color:C.text,fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:SANS}}>{cur+1>=questions.length?"See Results":"Next"}</button>}
      </div>):(<div style={{textAlign:"center"}}>
        <div style={{width:"80px",height:"80px",borderRadius:"50%",background:passed?`${C.green}22`:`${C.red}22`,border:`2px solid ${passed?C.green:C.red}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><span style={{fontSize:"18px",fontFamily:MONO,fontWeight:700,color:passed?C.green:C.red}}>{passed?"PASS":"FAIL"}</span></div>
        <h2 style={{fontSize:"18px",fontWeight:700,color:C.text,marginBottom:"6px"}}>{passed?"Module Conquered":"Not Yet"}</h2>
        <p style={{fontSize:"13px",color:C.textMuted,marginBottom:"24px"}}>{score}/{questions.length} correct</p>
        <div style={{display:"flex",gap:"12px",justifyContent:"center"}}>{passed?<button onClick={()=>{onComplete(subjectId);onClose();}} style={{padding:"10px 24px",borderRadius:"8px",background:`${C.green}22`,border:`1px solid ${C.green}44`,color:C.text,fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:SANS}}>Claim Reward</button>:<><button onClick={()=>{setCur(0);setScore(0);setSel(null);setShowResult(false);setFinished(false);}} style={{padding:"10px 24px",borderRadius:"8px",background:`${color}22`,border:`1px solid ${color}44`,color:C.text,fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:SANS}}>Retry</button><button onClick={onClose} style={{padding:"10px 24px",borderRadius:"8px",background:C.bgSurface,border:`1px solid ${C.border}`,color:C.textMuted,fontSize:"13px",cursor:"pointer",fontFamily:SANS}}>Back</button></>}</div>
      </div>)}
    </div>
  );
}

// ── Heat Map ──
function HeatMap({ sessions }) {
  const today=new Date();const days=[];for(let i=89;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i);const k=d.toISOString().slice(0,10);days.push({key:k,count:sessions[k]||0,day:d.getDay()});}
  const weeks=[];let week=new Array(7).fill(null);days.forEach((d,i)=>{if(i===0){for(let j=0;j<d.day;j++)week[j]=null;}week[d.day]=d;if(d.day===6||i===days.length-1){weeks.push(week);week=new Array(7).fill(null);}});
  return (<div style={{overflowX:"auto",padding:"4px 0"}}><div style={{display:"flex",gap:"3px"}}>{weeks.map((w,wi)=>(<div key={wi} style={{display:"flex",flexDirection:"column",gap:"3px"}}>{w.map((d,di)=>(<div key={di} title={d?`${d.key}: ${d.count}`:""}style={{width:"10px",height:"10px",borderRadius:"2px",background:!d?"transparent":d.count===0?C.bgHover:d.count===1?`${C.green}55`:d.count>=2?`${C.green}88`:C.green,border:d?`1px solid ${d.count>0?`${C.green}33`:C.border}`:"none"}}/>))}</div>))}</div></div>);
}

// ── Review Queue ──
function ReviewQueue({ cards, onDismiss }) {
  const [cur,setCur]=useState(0),[flipped,setFlipped]=useState(false);if(!cards.length)return null;const item=cards[cur];if(!item)return null;
  return (<div style={{padding:"16px 20px",borderRadius:"12px",background:C.bgSurface,border:`1px solid ${C.accent}22`,marginBottom:"16px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}><div style={{fontSize:"10px",fontFamily:MONO,color:C.accent,letterSpacing:"0.08em",textTransform:"uppercase"}}>Daily Review // {cur+1}/{cards.length}</div><div style={{fontSize:"10px",fontFamily:MONO,color:C.textDim}}>+10 XP each</div></div>
    <div onClick={()=>setFlipped(!flipped)} style={{padding:"20px",borderRadius:"10px",background:flipped?`${C.accent}11`:C.bgHover,border:`1px solid ${flipped?`${C.accent}22`:C.border}`,cursor:"pointer",minHeight:"60px",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s ease"}}><p style={{fontSize:"13px",color:flipped?C.textMuted:C.text,textAlign:"center",lineHeight:1.6}}>{flipped?"Can you answer from memory? Tap to flip.":item}</p></div>
    <div style={{display:"flex",gap:"8px",marginTop:"12px"}}>{[{l:"Got it",c:C.green},{l:"Needs work",c:C.red}].map(({l,c},idx)=>(<button key={l} onClick={()=>{if(cur+1>=cards.length)onDismiss();else{setCur(x=>x+1);setFlipped(false);}}} style={{flex:1,padding:"8px",borderRadius:"8px",background:`${c}18`,border:`1px solid ${c}33`,color:c,fontSize:"11px",fontWeight:600,cursor:"pointer",fontFamily:SANS}}>{l}</button>))}</div>
  </div>);
}

// ── Bubble Map with Lectures ──
function BubbleMap({ moduleKey, moduleLabel, color, glow, sections, onBack, onEnterModule }) {
  const [activeId, setActiveId] = useState(null);
  const calcProg = moduleKey === "calc" ? getCalcProgress() : {};

  const positions = useMemo(() => {
    const pos = {}; const count = sections.length;
    const cols = Math.min(count, 3);
    sections.forEach((s, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const totalRows = Math.ceil(count / cols);
      const xSpacing = cols > 1 ? 0.6 / (cols - 1) : 0;
      const ySpacing = totalRows > 1 ? 0.7 / (totalRows - 1) : 0;
      pos[s.id] = { x: 0.2 + col * xSpacing, y: 0.12 + row * ySpacing, r: 34 + Math.min(s.lectureIds?.length || 3, 9) * 1.5 };
    });
    return pos;
  }, [sections]);

  const relatedIds = useMemo(() => {
    if (!activeId) return new Set();
    const s = new Set();
    const node = sections.find(n => n.id === activeId);
    if (node) { (node.connections || []).forEach(c => s.add(c)); sections.forEach(n => { if (n.connections?.includes(activeId)) s.add(n.id); }); }
    return s;
  }, [activeId, sections]);

  const W = 600, H = Math.ceil(sections.length / 3) * 180 + 60;
  const activeNode = sections.find(s => s.id === activeId);

  return (
    <div style={{ padding: "24px 20px", maxWidth: 760, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontFamily: MONO, fontSize: "11px", padding: "0 0 16px", display: "flex", alignItems: "center", gap: "6px" }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 2L3 6l4 4" stroke={C.textDim} strokeWidth="1.5" strokeLinecap="round"/></svg>
        DASHBOARD
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color }} />
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: C.text, fontFamily: SANS }}>{moduleLabel}</h2>
      </div>
      <p style={{ margin: "0 0 20px", fontSize: "11px", fontFamily: MONO, color: C.textDim }}>
        {sections.length} sections // {sections.reduce((a, s) => a + (s.lectureIds?.length || 0), 0) || "~"} lectures // tap a section to expand
      </p>

      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", maxWidth: W }}>
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
                <path d={d} fill="none" stroke={active ? color : C.line} strokeWidth={active ? 2 : 1} opacity={active ? 0.7 : 0.25} style={{ transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
                {active && <circle r="2.5" fill={color} opacity="0.6"><animateMotion dur="2.5s" repeatCount="indefinite" path={d} /></circle>}
              </g>
            );
          }))}
          {/* Nodes */}
          {sections.map(s => {
            const p = positions[s.id]; if (!p) return null;
            const x = p.x * W, y = p.y * H, r = p.r;
            const isActive = activeId === s.id, isRelated = relatedIds.has(s.id);
            const scale = isActive ? 1.12 : isRelated ? 1.04 : 1;
            return (
              <g key={s.id} onClick={() => setActiveId(prev => prev === s.id ? null : s.id)} style={{ cursor: "pointer" }}>
                {isActive && <circle cx={x} cy={y} r={r + 8} fill={glow} style={{ transition: "all 0.4s ease" }} />}
                <circle cx={x} cy={y} r={r * scale}
                  fill={isActive ? `${color}18` : isRelated ? `${color}0a` : C.bgSurface}
                  stroke={isActive ? color : isRelated ? `${color}44` : C.border}
                  strokeWidth={isActive ? 1.5 : 1}
                  style={{ transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)" }} />
                <circle cx={x} cy={y} r={r * scale - 5} fill="none" stroke={isActive ? color : C.border}
                  strokeWidth="0.3" strokeDasharray="3 3" opacity={isActive ? 0.3 : 0.12} style={{ transition: "all 0.5s ease" }}>
                  {isActive && <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`360 ${x} ${y}`} dur="20s" repeatCount="indefinite" />}
                </circle>
                <text x={x} y={y - 4} textAnchor="middle" dominantBaseline="central" fill={isActive ? C.text : isRelated ? C.textMuted : C.textDim}
                  fontSize="10.5" fontWeight={isActive ? "600" : "500"} fontFamily={SANS} style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.3s ease" }}>
                  {s.short}
                </text>
                <text x={x} y={y + 10} textAnchor="middle" fill={C.textDim} fontSize="8" fontFamily={MONO} style={{ pointerEvents: "none" }}>
                  {s.lectureIds?.length || "~"} lectures
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Expanded Section with Lectures */}
      {activeNode && (
        <div style={{ margin: "16px 0", padding: "20px", borderRadius: "10px", background: C.bgSurface, border: `1px solid ${color}22`, animation: "panelIn 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: color }} />
            <span style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{activeNode.label}</span>
          </div>
          <p style={{ fontSize: "11px", color: C.textDim, margin: "0 0 14px", lineHeight: 1.5 }}>{activeNode.desc}</p>

          {activeNode.connections?.length > 0 && (
            <p style={{ fontSize: "10px", fontFamily: MONO, color: C.textDim, margin: "0 0 14px" }}>
              Leads to: {activeNode.connections.map(c => sections.find(s => s.id === c)?.short || c).join(", ")}
            </p>
          )}

          {/* Lecture list */}
          {activeNode.lectureIds && activeNode.lectureIds.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              {activeNode.lectureIds.map(lid => {
                const lec = CALC_LECTURES[lid];
                const status = calcProg[lid];
                if (!lec) return <div key={lid} style={{ padding: "8px 10px", fontSize: "11px", color: C.textDim }}>{lid}</div>;
                return (
                  <div key={lid} onClick={() => onEnterModule()} style={{
                    display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "6px",
                    cursor: "pointer", transition: "background 0.15s",
                  }} onMouseEnter={e => e.currentTarget.style.background = C.bgHover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{
                      width: "18px", height: "18px", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "7px", fontFamily: MONO, fontWeight: 600, flexShrink: 0,
                      background: status === "mastered" ? `${C.green}22` : status === "watched" ? `${C.gold}22` : C.bgHover,
                      color: status === "mastered" ? C.green : status === "watched" ? C.gold : C.textDim,
                      border: `1px solid ${status === "mastered" ? C.green : status === "watched" ? C.gold : C.border}`,
                    }}>{lid}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "12px", color: C.text, fontWeight: 450 }}>{lec.title}</span>
                      <span style={{ fontSize: "10px", color: C.textDim, fontFamily: MONO, marginLeft: "8px" }}>{lec.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <button onClick={() => onEnterModule()} style={{
              padding: "8px 18px", borderRadius: "6px", background: `${color}15`, border: `1px solid ${color}33`,
              color: color, fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: SANS,
            }}>Open Module</button>
          )}
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
  const [game, setGame] = useState(loadGame);
  const updateGame = (updates) => { setGame(prev => { const next = { ...prev, ...updates }; saveGame(next); return next; }); };

  useEffect(() => { const today = new Date().toISOString().slice(0, 10); const g = { ...game }; if (g.dailyDate !== today) { g.dailyDone = 0; g.dailyDate = today; } if (g.lastStudyDate) { const diff = Math.floor((new Date(today) - new Date(g.lastStudyDate)) / 86400000); if (diff > 1) g.streak = 0; } saveGame(g); setGame(g); }, []);

  const ambient = useAmbientSound();
  const soundModes = [
    { key: "rain", label: "Rain", icon: "R" },
    { key: "drone", label: "Drone", icon: "D" },
    { key: "whitenoise", label: "White Noise", icon: "W" },
    { key: "lofi", label: "Lo-fi", icon: "L" },
    { key: "psy", label: "Psytrance", icon: "P" },
  ];

  const xpForNext = game.level * 150;
  const xpMultiplier = game.streak >= 7 ? 3 : game.streak >= 3 ? 2 : 1;
  const dailyGoal = 3;
  const addXp = (amt) => { const n = game.xp + amt; if (n >= xpForNext) updateGame({ xp: n - xpForNext, level: game.level + 1 }); else updateGame({ xp: n }); };
  const handleFocusComplete = (dur) => { const earned = (dur === 25 ? 50 : 120) * xpMultiplier; const today = new Date().toISOString().slice(0, 10); addXp(earned); updateGame({ sessions: { ...game.sessions, [today]: (game.sessions[today] || 0) + 1 }, lastStudyDate: today, streak: game.streak + (game.lastStudyDate !== today ? 1 : 0) }); };
  const handleBossComplete = (id) => { addXp(100); updateGame({ conquered: [...new Set([...game.conquered, id])] }); };
  const reviewCards = useMemo(() => { let c = []; game.conquered.forEach(id => { if (REVIEW_CARDS[id]) c = c.concat(REVIEW_CARDS[id]); }); return c.slice(0, 5); }, [game.conquered]);
  const goBack = () => { setPage("home"); setRefresh(r => r + 1); };

  if (!unlocked) return (<>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');@keyframes shakeX{0%,100%{transform:translateX(0)}20%{transform:translateX(-12px)}40%{transform:translateX(10px)}60%{transform:translateX(-8px)}80%{transform:translateX(6px)}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <PasswordScreen onUnlock={() => setUnlocked(true)} />
  </>);

  // Module views
  if (page === "calc") return <CalcLab onBack={goBack} />;
  if (page === "physics") return <PhysicsLab onBack={goBack} />;
  if (page === "chem") return <ChemPlacement onBack={goBack} />;
  if (page === "cpp") return <CodingLab subject="cpp" onBack={goBack} />;
  if (page === "rust") return <CodingLab subject="rust" onBack={goBack} />;

  // Bubble maps
  const mapPage = (key) => {
    const sub = SUBJECTS.find(s => s.id === key);
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: SANS }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');*{box-sizing:border-box;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes panelIn{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ animation: "fadeIn 0.4s ease" }}>
          <BubbleMap moduleKey={key} moduleLabel={sub.title} color={sub.color} glow={sub.glow}
            sections={SECTIONS[key]} onBack={() => setPage("home")} onEnterModule={() => setPage(key)} />
        </div>
      </div>
    );
  };
  if (page === "map-calc") return mapPage("calc");
  if (page === "map-physics") return mapPage("physics");
  if (page === "map-chem") return mapPage("chem");

  // Dashboard
  const totalAll = SUBJECTS.reduce((s, x) => s + x.lectures, 0);
  const masteredAll = SUBJECTS.reduce((s, x) => s + getProgress(x.storageKey).mastered, 0);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: SANS }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');*{box-sizing:border-box;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes gridPulse{0%,100%{opacity:0.3}50%{opacity:0.6}}@keyframes panelIn{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:${C.bgDeep}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}`}</style>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px", animation: "fadeIn 0.5s ease" }}>
        {/* Header */}
        <div style={{ paddingTop: 32, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: C.textDim, letterSpacing: 3, textTransform: "uppercase", margin: "0 0 4px", fontFamily: MONO }}>telpo</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Study Dashboard</h1>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "2px", padding: "3px", borderRadius: "6px", background: C.bgSurface, border: `1px solid ${C.border}` }}>
              {soundModes.map(m => (
                <button key={m.key} onClick={() => ambient.toggle(m.key)} title={m.label} style={{
                  width: "28px", height: "28px", borderRadius: "4px", border: "none",
                  background: ambient.playing && ambient.mode === m.key ? `${C.accent}22` : "transparent",
                  color: ambient.playing && ambient.mode === m.key ? C.accent : C.textDim,
                  fontSize: "10px", fontFamily: MONO, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{m.icon}</button>
              ))}
            </div>
            <button onClick={() => setShowFocus(true)} style={{
              padding: "8px 16px", borderRadius: "6px", background: `${C.accent}15`, border: `1px solid ${C.accent}33`,
              color: C.accent, fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: MONO,
            }}>FOCUS</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "8px", marginBottom: "18px" }}>
          {[
            { label: "Streak", value: game.streak, sub: `d (${xpMultiplier}x)`, color: C.streak, bar: game.streak, max: 7 },
            { label: `Lv ${game.level}`, value: game.xp, sub: `/ ${xpForNext}`, color: C.xp, bar: game.xp, max: xpForNext },
            { label: "Daily", value: game.dailyDone, sub: `/ ${dailyGoal}`, color: game.dailyDone >= dailyGoal ? C.green : C.text, bar: game.dailyDone, max: dailyGoal },
            { label: "Mastered", value: masteredAll, sub: `/ ${totalAll}`, color: C.gold, bar: masteredAll, max: totalAll },
          ].map((s, i) => (
            <div key={i} style={{ padding: "12px 14px", borderRadius: "8px", background: C.bgSurface, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "9px", fontFamily: MONO, color: C.textDim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>{s.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "22px", fontWeight: 700, color: s.color, fontFamily: MONO }}>{s.value}</span>
                <span style={{ fontSize: "9px", color: C.textDim }}>{s.sub}</span>
              </div>
              <div style={{ marginTop: "6px", height: "3px", borderRadius: "2px", background: C.bgHover }}>
                <div style={{ width: `${Math.min((s.bar / s.max) * 100, 100)}%`, height: "100%", borderRadius: "2px", background: s.color, transition: "width 0.5s ease", opacity: 0.6 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Heat Map */}
        <div style={{ marginBottom: "18px", padding: "14px", borderRadius: "8px", background: C.bgSurface, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "9px", fontFamily: MONO, color: C.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>90d activity</span>
            <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
              {[0,1,2,3].map(i => <div key={i} style={{ width: "8px", height: "8px", borderRadius: "2px", background: i === 0 ? C.bgHover : i === 1 ? `${C.green}55` : i === 2 ? `${C.green}88` : C.green }} />)}
            </div>
          </div>
          <HeatMap sessions={game.sessions} />
        </div>

        {/* Review */}
        {showReview && reviewCards.length > 0 && <ReviewQueue cards={reviewCards} onDismiss={() => { setShowReview(false); addXp(reviewCards.length * 10); }} />}

        {/* Modules */}
        <p style={{ fontSize: "9px", fontFamily: MONO, color: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>Modules</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "32px" }}>
          {SUBJECTS.map(sub => {
            const prog = getProgress(sub.storageKey);
            const pct = sub.lectures > 0 ? (prog.mastered / sub.lectures) * 100 : 0;
            const isConquered = game.conquered.includes(sub.id);
            const hasMap = ["calc", "physics", "chem"].includes(sub.id);
            return (
              <div key={sub.id} onClick={() => setPage(hasMap ? `map-${sub.id}` : sub.id)} style={{
                display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px",
                background: C.bgSurface, borderRadius: "8px", border: `1px solid ${C.border}`,
                cursor: "pointer", transition: "all 0.2s",
              }} onMouseEnter={e => { e.currentTarget.style.borderColor = `${sub.color}33`; e.currentTarget.style.background = C.bgHover; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bgSurface; }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${sub.color}12`, border: `1px solid ${sub.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: sub.color }} />
                  <svg style={{ position: "absolute", inset: "-1px" }} width="38" height="38">
                    <circle cx="19" cy="19" r="18" fill="none" stroke={`${sub.color}15`} strokeWidth="1.5" />
                    <circle cx="19" cy="19" r="18" fill="none" stroke={sub.color} strokeWidth="1.5" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 18}`} strokeDashoffset={`${2 * Math.PI * 18 * (1 - pct / 100)}`}
                      transform="rotate(-90 19 19)" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{sub.title}</span>
                    {isConquered && <span style={{ fontSize: "8px", fontFamily: MONO, color: C.gold, background: `${C.gold}15`, padding: "2px 6px", borderRadius: "3px" }}>CONQUERED</span>}
                  </div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{sub.desc}</div>
                  <div style={{ fontSize: 9, color: C.textDim, fontFamily: MONO, marginTop: 3 }}>{prog.mastered}/{sub.lectures} mastered</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end", flexShrink: 0 }}>
                  {!isConquered && BOSS_Q[sub.id] && (
                    <button onClick={(e) => { e.stopPropagation(); setBossBattle({ id: sub.id, title: sub.title, color: sub.color }); }} style={{
                      padding: "4px 10px", borderRadius: "4px", background: `${C.gold}10`, border: `1px solid ${C.gold}25`,
                      color: C.gold, fontSize: "9px", fontWeight: 600, cursor: "pointer", fontFamily: MONO,
                    }}>BOSS</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "28px" }}>
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: C.green, animation: "gridPulse 2s ease infinite" }} />
          <span style={{ fontSize: "9px", color: C.textDim, fontFamily: MONO }}>TELPO v2.0 // {SUBJECTS.length} modules // {totalAll} lectures</span>
          {ambient.playing && <span style={{ fontSize: "9px", color: C.accent, fontFamily: MONO, marginLeft: "auto" }}>{ambient.mode.toUpperCase()}</span>}
        </div>
      </div>

      {showFocus && <FocusTimer onClose={() => setShowFocus(false)} onComplete={handleFocusComplete} xpMultiplier={xpMultiplier} />}
      {bossBattle && <BossBattle subjectId={bossBattle.id} subjectTitle={bossBattle.title} color={bossBattle.color} onComplete={handleBossComplete} onClose={() => setBossBattle(null)} />}
    </div>
  );
}
