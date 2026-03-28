import { useState, useEffect, useCallback } from "react";
import { C, F, Slider, Practice, EquationExplorer, Tip } from "./shared_ui";

/*
 * Chemistry Placement Prep for Telpo
 * LBCC placement exam: 45 min, paper/pencil, no calculator
 * Pass = place into CHEM 1A (skip CHEM 2)
 *
 * Structure per lecture:
 *   - YouTube link
 *   - Full reading module (real paragraphs with all key content)
 *   - Interactive diagram where applicable
 *   - EquationExplorer with sliders
 *   - Practice with typed answers, 2 attempts, step-by-step breakdown
 */

const STORAGE_KEY = "Telpo-chemplace-v1";
const catColor = { metal: "#60a5fa", nonmetal: "#34d399", metalloid: "#fbbf24", noble: "#a78bfa" };

/* ══════════════════════════════════════════════════════════════════
   INTERACTIVE DIAGRAMS
   ══════════════════════════════════════════════════════════════════ */

const PT = [
  { sym:"H",n:1,name:"Hydrogen",mass:1.008,cat:"nonmetal",g:1,p:1,cfg:"1s\u00b9",ve:1 },
  { sym:"He",n:2,name:"Helium",mass:4.003,cat:"noble",g:18,p:1,cfg:"1s\u00b2",ve:2 },
  { sym:"Li",n:3,name:"Lithium",mass:6.941,cat:"metal",g:1,p:2,cfg:"[He] 2s\u00b9",ve:1 },
  { sym:"Be",n:4,name:"Beryllium",mass:9.012,cat:"metal",g:2,p:2,cfg:"[He] 2s\u00b2",ve:2 },
  { sym:"B",n:5,name:"Boron",mass:10.81,cat:"metalloid",g:13,p:2,cfg:"[He] 2s\u00b2 2p\u00b9",ve:3 },
  { sym:"C",n:6,name:"Carbon",mass:12.01,cat:"nonmetal",g:14,p:2,cfg:"[He] 2s\u00b2 2p\u00b2",ve:4 },
  { sym:"N",n:7,name:"Nitrogen",mass:14.01,cat:"nonmetal",g:15,p:2,cfg:"[He] 2s\u00b2 2p\u00b3",ve:5 },
  { sym:"O",n:8,name:"Oxygen",mass:16.00,cat:"nonmetal",g:16,p:2,cfg:"[He] 2s\u00b2 2p\u2074",ve:6 },
  { sym:"F",n:9,name:"Fluorine",mass:19.00,cat:"nonmetal",g:17,p:2,cfg:"[He] 2s\u00b2 2p\u2075",ve:7 },
  { sym:"Ne",n:10,name:"Neon",mass:20.18,cat:"noble",g:18,p:2,cfg:"[He] 2s\u00b2 2p\u2076",ve:8 },
  { sym:"Na",n:11,name:"Sodium",mass:22.99,cat:"metal",g:1,p:3,cfg:"[Ne] 3s\u00b9",ve:1 },
  { sym:"Mg",n:12,name:"Magnesium",mass:24.31,cat:"metal",g:2,p:3,cfg:"[Ne] 3s\u00b2",ve:2 },
  { sym:"Al",n:13,name:"Aluminum",mass:26.98,cat:"metal",g:13,p:3,cfg:"[Ne] 3s\u00b2 3p\u00b9",ve:3 },
  { sym:"Si",n:14,name:"Silicon",mass:28.09,cat:"metalloid",g:14,p:3,cfg:"[Ne] 3s\u00b2 3p\u00b2",ve:4 },
  { sym:"P",n:15,name:"Phosphorus",mass:30.97,cat:"nonmetal",g:15,p:3,cfg:"[Ne] 3s\u00b2 3p\u00b3",ve:5 },
  { sym:"S",n:16,name:"Sulfur",mass:32.07,cat:"nonmetal",g:16,p:3,cfg:"[Ne] 3s\u00b2 3p\u2074",ve:6 },
  { sym:"Cl",n:17,name:"Chlorine",mass:35.45,cat:"nonmetal",g:17,p:3,cfg:"[Ne] 3s\u00b2 3p\u2075",ve:7 },
  { sym:"Ar",n:18,name:"Argon",mass:39.95,cat:"noble",g:18,p:3,cfg:"[Ne] 3s\u00b2 3p\u2076",ve:8 },
  { sym:"K",n:19,name:"Potassium",mass:39.10,cat:"metal",g:1,p:4,cfg:"[Ar] 4s\u00b9",ve:1 },
  { sym:"Ca",n:20,name:"Calcium",mass:40.08,cat:"metal",g:2,p:4,cfg:"[Ar] 4s\u00b2",ve:2 },
];

function PeriodicExplorer() {
  const [sel, setSel] = useState(null);
  const rows = [1,2,3,4].map(p => PT.filter(e => e.p === p));
  const el = sel !== null ? PT.find(e => e.n === sel) : null;
  return (
    <div style={{ margin:"12px 0", padding:16, background:C.panel, borderRadius:8, border:`1px solid ${C.border}` }}>
      <p style={{ fontSize:10, fontWeight:600, color:C.textDim, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 10px" }}>Interactive: Periodic Table (first 20)</p>
      <div style={{ display:"flex", flexDirection:"column", gap:3, marginBottom:12 }}>
        {rows.map((row,ri) => (
          <div key={ri} style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
            {row.map(e => {
              const on = sel === e.n;
              return (
                <div key={e.n} onClick={() => setSel(on ? null : e.n)} style={{
                  width:34, height:34, borderRadius:4, display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center", cursor:"pointer",
                  background: on ? catColor[e.cat] : `${catColor[e.cat]}22`,
                  border: `1.5px solid ${on ? catColor[e.cat] : "transparent"}`,
                  marginLeft: (e.p===1&&e.g===18)||(e.p>=2&&e.p<=3&&e.g===13&&row.length<8) ? "auto" : 0,
                  transition:"all 0.15s",
                }}>
                  <span style={{ fontSize:7, color:on?"#fff":C.textDim, fontFamily:F.mono }}>{e.n}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:on?"#fff":C.text }}>{e.sym}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:12, marginBottom:10, flexWrap:"wrap" }}>
        {Object.entries(catColor).map(([k,v]) => (
          <div key={k} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:v }} />
            <span style={{ fontSize:10, color:C.textDim, textTransform:"capitalize" }}>{k==="noble"?"noble gas":k}</span>
          </div>
        ))}
      </div>
      {el ? (
        <div style={{ padding:12, background:C.bg, borderRadius:6, border:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:6 }}>
            <span style={{ fontSize:22, fontWeight:700, color:catColor[el.cat] }}>{el.sym}</span>
            <span style={{ fontSize:14, fontWeight:500, color:C.text }}>{el.name}</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 16px", fontSize:12, color:C.textMid }}>
            <span>Atomic #: <b style={{ color:C.text }}>{el.n}</b></span>
            <span>Mass: <b style={{ color:C.text }}>{el.mass}</b> amu</span>
            <span>Protons: <b style={{ color:C.text }}>{el.n}</b></span>
            <span>Neutrons: <b style={{ color:C.text }}>{Math.round(el.mass)-el.n}</b></span>
            <span>Electrons: <b style={{ color:C.text }}>{el.n}</b></span>
            <span>Valence e-: <b style={{ color:C.green }}>{el.ve}</b></span>
            <span style={{ gridColumn:"1/-1" }}>Config: <b style={{ color:C.blue, fontFamily:F.mono }}>{el.cfg}</b></span>
          </div>
        </div>
      ) : <p style={{ fontSize:11, color:C.textDim, textAlign:"center", margin:0 }}>Tap an element to explore</p>}
    </div>
  );
}

function ElectronShells() {
  const [z, setZ] = useState(8);
  const el = PT.find(e => e.n === z) || PT[0];
  const shells = []; let rem = z;
  [2,8,8,2].forEach(mx => { if(rem>0){ const c=Math.min(rem,mx); shells.push(c); rem-=c; }});
  return (
    <div style={{ margin:"12px 0", padding:16, background:C.panel, borderRadius:8, border:`1px solid ${C.border}` }}>
      <p style={{ fontSize:10, fontWeight:600, color:C.textDim, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 10px" }}>Interactive: Electron Shell Model</p>
      <Slider label="Atomic Number (Z)" value={z} min={1} max={20} step={1} onChange={v=>setZ(Math.round(v))} />
      <div style={{ display:"flex", alignItems:"center", gap:20, marginTop:12 }}>
        <div style={{ position:"relative", width:160, height:160, flexShrink:0 }}>
          <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:28, height:28, borderRadius:"50%", background:C.blue, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff" }}>{el.sym}</div>
          {shells.map((_,si) => { const r=30+si*22; return <div key={`ring-${si}`} style={{ position:"absolute", left:"50%", top:"50%", width:r*2, height:r*2, transform:"translate(-50%,-50%)", borderRadius:"50%", border:`1px dashed ${C.border}` }} />; })}
          {shells.map((cnt,si) => { const r=30+si*22; return Array.from({length:cnt}).map((_,ei) => { const a=(ei/cnt)*Math.PI*2-Math.PI/2; return <div key={`${si}-${ei}`} style={{ position:"absolute", left:80+Math.cos(a)*r-4, top:80+Math.sin(a)*r-4, width:8, height:8, borderRadius:"50%", background:si===shells.length-1?C.green:C.blue }} />; }); })}
        </div>
        <div style={{ fontSize:12, color:C.textMid, lineHeight:1.8 }}>
          <p style={{ margin:0, fontWeight:600, color:C.text, fontSize:14 }}>{el.name} (Z={z})</p>
          {shells.map((c,i) => <p key={i} style={{ margin:0 }}>Shell {i+1}: <b style={{ color:i===shells.length-1?C.green:C.blue }}>{c} e-</b></p>)}
          <p style={{ margin:"4px 0 0", fontSize:11, fontFamily:F.mono, color:C.blue }}>{el.cfg}</p>
          <p style={{ margin:"2px 0 0", color:C.green, fontWeight:600 }}>Valence: {shells[shells.length-1]} e-</p>
        </div>
      </div>
    </div>
  );
}

const BAL = [
  { display:"H\u2082 + O\u2082 \u2192 H\u2082O", labels:["H\u2082","O\u2082","H\u2082O"], ans:[2,1,2], nR:2 },
  { display:"Fe + O\u2082 \u2192 Fe\u2082O\u2083", labels:["Fe","O\u2082","Fe\u2082O\u2083"], ans:[4,3,2], nR:2 },
  { display:"N\u2082 + H\u2082 \u2192 NH\u2083", labels:["N\u2082","H\u2082","NH\u2083"], ans:[1,3,2], nR:2 },
  { display:"C\u2083H\u2088 + O\u2082 \u2192 CO\u2082 + H\u2082O", labels:["C\u2083H\u2088","O\u2082","CO\u2082","H\u2082O"], ans:[1,5,3,4], nR:2 },
  { display:"Al + HCl \u2192 AlCl\u2083 + H\u2082", labels:["Al","HCl","AlCl\u2083","H\u2082"], ans:[2,6,2,3], nR:2 },
];
function BalancerGame() {
  const [pi, setPi] = useState(0);
  const prob = BAL[pi];
  const [co, setCo] = useState(prob.ans.map(()=>1));
  const [show, setShow] = useState(false);
  const ok = co.every((c,i)=>c===prob.ans[i]);
  function bump(i,d){ setCo(p=>{const n=[...p];n[i]=Math.max(1,Math.min(10,n[i]+d));return n;}); setShow(false); }
  function next(){ const ni=(pi+1)%BAL.length; setPi(ni); setCo(BAL[ni].ans.map(()=>1)); setShow(false); }
  return (
    <div style={{ margin:"12px 0", padding:16, background:C.panel, borderRadius:8, border:`1px solid ${C.border}` }}>
      <p style={{ fontSize:10, fontWeight:600, color:C.textDim, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 6px" }}>Interactive: Balance the Equation</p>
      <p style={{ fontSize:13, color:C.text, fontWeight:500, margin:"0 0 12px" }}>{prob.display}</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignItems:"center", marginBottom:12 }}>
        {prob.labels.map((lb,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:3 }}>
            {i===prob.nR && <span style={{ fontSize:16, color:C.textDim, margin:"0 4px" }}>\u2192</span>}
            {i>0 && i!==prob.nR && <span style={{ fontSize:14, color:C.textDim }}>+</span>}
            <div style={{ display:"flex", alignItems:"center", background:C.bg, borderRadius:6, border:`1px solid ${C.border}` }}>
              <button onClick={()=>bump(i,-1)} style={{ width:22, height:30, border:"none", background:"transparent", cursor:"pointer", fontSize:13, color:C.textDim }}>-</button>
              <span style={{ width:18, textAlign:"center", fontFamily:F.mono, fontSize:14, fontWeight:700, color:C.blue }}>{co[i]}</span>
              <button onClick={()=>bump(i,1)} style={{ width:22, height:30, border:"none", background:"transparent", cursor:"pointer", fontSize:13, color:C.textDim }}>+</button>
            </div>
            <span style={{ fontSize:13, color:C.text, fontWeight:500 }}>{lb}</span>
          </div>
        ))}
      </div>
      {ok ? (
        <div style={{ padding:8, background:C.greenDim, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:12, fontWeight:600, color:C.green }}>Balanced!</span>
          <button onClick={next} style={{ background:C.green, color:"#fff", border:"none", borderRadius:4, padding:"4px 10px", fontSize:11, cursor:"pointer", fontFamily:F.sans }}>Next</button>
        </div>
      ) : (
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setShow(true)} style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:4, padding:"4px 10px", fontSize:11, color:C.textDim, cursor:"pointer", fontFamily:F.sans }}>Show Answer</button>
          {show && <span style={{ fontSize:12, color:C.textMid, fontFamily:F.mono, alignSelf:"center" }}>{prob.ans.join(", ")}</span>}
        </div>
      )}
    </div>
  );
}

function MoleMap() {
  const [g, setG] = useState(36);
  const [mm, setMM] = useState(18);
  const mol = mm>0 ? g/mm : 0;
  const part = mol * 6.022e23;
  const sci = (n) => { if(n===0) return "0"; const e=Math.floor(Math.log10(Math.abs(n))); return `${(n/10**e).toFixed(2)} \u00d7 10^${e}`; };
  return (
    <div style={{ margin:"12px 0", padding:16, background:C.panel, borderRadius:8, border:`1px solid ${C.border}` }}>
      <p style={{ fontSize:10, fontWeight:600, color:C.textDim, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 10px" }}>Interactive: Mole Conversion Map</p>
      <Slider label="Grams" value={g} min={1} max={200} step={1} onChange={setG} />
      <Slider label="Molar Mass (g/mol)" value={mm} min={1} max={200} step={1} onChange={setMM} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, margin:"14px 0", flexWrap:"wrap" }}>
        <div style={{ padding:"8px 12px", background:C.blueDim, borderRadius:8, textAlign:"center", minWidth:70 }}>
          <div style={{ fontSize:9, color:C.textDim }}>GRAMS</div>
          <div style={{ fontSize:18, fontWeight:700, color:C.blue, fontFamily:F.mono }}>{g}</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"0 5px" }}>
          <span style={{ fontSize:14, color:C.textDim }}>\u2192</span>
          <span style={{ fontSize:8, color:C.textDim, fontFamily:F.mono }}>\u00f7 {mm}</span>
        </div>
        <div style={{ padding:"8px 12px", background:C.greenDim, borderRadius:8, textAlign:"center", minWidth:70 }}>
          <div style={{ fontSize:9, color:C.textDim }}>MOLES</div>
          <div style={{ fontSize:18, fontWeight:700, color:C.green, fontFamily:F.mono }}>{mol.toFixed(2)}</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"0 5px" }}>
          <span style={{ fontSize:14, color:C.textDim }}>\u2192</span>
          <span style={{ fontSize:8, color:C.textDim, fontFamily:F.mono }}>\u00d7 6.022e23</span>
        </div>
        <div style={{ padding:"8px 12px", background:"rgba(167,139,250,0.08)", borderRadius:8, textAlign:"center", minWidth:90 }}>
          <div style={{ fontSize:9, color:C.textDim }}>PARTICLES</div>
          <div style={{ fontSize:13, fontWeight:700, color:"#a78bfa", fontFamily:F.mono }}>{sci(part)}</div>
        </div>
      </div>
      <Tip text="The mole is always the bridge. Grams \u2192 moles (divide by molar mass) \u2192 particles (multiply by Avogadro's number). Reverse the operations to go backwards." />
    </div>
  );
}

// ── Heating Curve Interactive ─────────────────────────────────
function HeatingCurve() {
  const [heat, setHeat] = useState(0);
  // Simplified heating curve for water: 0-100 = ice heating, 100-200 = melting, 200-300 = water heating, 300-400 = boiling, 400-500 = steam heating
  const getState = (h) => {
    if(h<100) return { phase:"Solid (ice)", temp:(-20 + h*0.2).toFixed(0), region:"Heating solid", color:C.blue };
    if(h<200) return { phase:"Melting (s\u2192l)", temp:"0", region:"Phase change: melting point", color:"#a78bfa" };
    if(h<300) return { phase:"Liquid (water)", temp:(0 + (h-200)).toFixed(0), region:"Heating liquid", color:C.green };
    if(h<400) return { phase:"Boiling (l\u2192g)", temp:"100", region:"Phase change: boiling point", color:"#a78bfa" };
    return { phase:"Gas (steam)", temp:(100 + (h-400)*0.5).toFixed(0), region:"Heating gas", color:C.red };
  };
  const s = getState(heat);
  // Draw curve points
  const points = Array.from({length:50},(_,i)=>{
    const h = i*10;
    const st = getState(h);
    return { x: (i/49)*100, y: 100 - ((parseFloat(st.temp)+20)/170)*100 };
  });
  const pathD = points.map((p,i) => `${i===0?"M":"L"}${p.x} ${p.y}`).join(" ");
  const curPt = getState(heat);
  const cx = (heat/500)*100;
  const cy = 100 - ((parseFloat(curPt.temp)+20)/170)*100;

  return (
    <div style={{ margin:"12px 0", padding:16, background:C.panel, borderRadius:8, border:`1px solid ${C.border}` }}>
      <p style={{ fontSize:10, fontWeight:600, color:C.textDim, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 10px" }}>Interactive: Heating Curve</p>
      <Slider label="Heat Added" value={heat} min={0} max={500} step={5} onChange={setHeat} />
      <svg viewBox="-5 -5 110 115" style={{ width:"100%", maxWidth:500, display:"block", margin:"8px auto" }}>
        <line x1="0" y1="100" x2="100" y2="100" stroke={C.border} strokeWidth="0.5"/>
        <line x1="0" y1="0" x2="0" y2="100" stroke={C.border} strokeWidth="0.5"/>
        <text x="50" y="112" textAnchor="middle" fontSize="4" fill={C.textDim}>Heat added \u2192</text>
        <text x="-3" y="50" textAnchor="middle" fontSize="4" fill={C.textDim} transform="rotate(-90,-3,50)">Temp (\u00b0C)</text>
        {/* Plateau labels */}
        <rect x="18" y={100-((0+20)/170)*100-1} width="20" height="2" fill="#a78bfa" opacity="0.3" rx="1"/>
        <rect x="58" y={100-((100+20)/170)*100-1} width="20" height="2" fill="#a78bfa" opacity="0.3" rx="1"/>
        <text x="28" y={100-((0+20)/170)*100+5} textAnchor="middle" fontSize="3" fill="#a78bfa">melting</text>
        <text x="68" y={100-((100+20)/170)*100+5} textAnchor="middle" fontSize="3" fill="#a78bfa">boiling</text>
        <path d={pathD} fill="none" stroke={C.blue} strokeWidth="1"/>
        <circle cx={cx} cy={cy} r="2.5" fill={s.color} stroke="#fff" strokeWidth="0.5"/>
      </svg>
      <div style={{ display:"flex", gap:12, marginTop:8 }}>
        <div style={{ flex:1, padding:8, background:C.bg, borderRadius:6, border:`1px solid ${C.border}`, textAlign:"center" }}>
          <div style={{ fontSize:9, color:C.textDim }}>Phase</div>
          <div style={{ fontSize:13, fontWeight:600, color:s.color }}>{s.phase}</div>
        </div>
        <div style={{ flex:1, padding:8, background:C.bg, borderRadius:6, border:`1px solid ${C.border}`, textAlign:"center" }}>
          <div style={{ fontSize:9, color:C.textDim }}>Temp</div>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, fontFamily:F.mono }}>{s.temp}\u00b0C</div>
        </div>
        <div style={{ flex:1, padding:8, background:C.bg, borderRadius:6, border:`1px solid ${C.border}`, textAlign:"center" }}>
          <div style={{ fontSize:9, color:C.textDim }}>What is happening</div>
          <div style={{ fontSize:11, fontWeight:500, color:C.textMid }}>{s.region}</div>
        </div>
      </div>
      <Tip text="Flat regions = phase changes (temperature constant, energy breaks intermolecular forces). Slopes = heating within a single phase. Exothermic = releases heat (freezing, condensation). Endothermic = absorbs heat (melting, boiling)." />
    </div>
  );
}

// ── Lewis Structure Electron Counter ─────────────────────────
function LewisHelper() {
  const molecules = [
    { name:"H\u2082O", atoms:[{sym:"O",ve:6},{sym:"H",ve:1},{sym:"H",ve:1}], total:8, bonds:2, lonePairsCenter:2, shape:"Bent", octet:true },
    { name:"CO\u2082", atoms:[{sym:"C",ve:4},{sym:"O",ve:6},{sym:"O",ve:6}], total:16, bonds:4, lonePairsCenter:0, shape:"Linear (double bonds)", octet:true },
    { name:"NH\u2083", atoms:[{sym:"N",ve:5},{sym:"H",ve:1},{sym:"H",ve:1},{sym:"H",ve:1}], total:8, bonds:3, lonePairsCenter:1, shape:"Trigonal pyramidal", octet:true },
    { name:"BF\u2083", atoms:[{sym:"B",ve:3},{sym:"F",ve:7},{sym:"F",ve:7},{sym:"F",ve:7}], total:24, bonds:3, lonePairsCenter:0, shape:"Trigonal planar (incomplete octet)", octet:false },
    { name:"NO", atoms:[{sym:"N",ve:5},{sym:"O",ve:6}], total:11, bonds:2, lonePairsCenter:1, shape:"Linear (odd electron, radical)", octet:false },
    { name:"SF\u2086", atoms:[{sym:"S",ve:6},{sym:"F",ve:7},{sym:"F",ve:7},{sym:"F",ve:7},{sym:"F",ve:7},{sym:"F",ve:7},{sym:"F",ve:7}], total:48, bonds:6, lonePairsCenter:0, shape:"Octahedral (expanded octet)", octet:false },
    { name:"CCl\u2084", atoms:[{sym:"C",ve:4},{sym:"Cl",ve:7},{sym:"Cl",ve:7},{sym:"Cl",ve:7},{sym:"Cl",ve:7}], total:32, bonds:4, lonePairsCenter:0, shape:"Tetrahedral", octet:true },
  ];
  const [idx, setIdx] = useState(0);
  const mol = molecules[idx];
  return (
    <div style={{ margin:"12px 0", padding:16, background:C.panel, borderRadius:8, border:`1px solid ${C.border}` }}>
      <p style={{ fontSize:10, fontWeight:600, color:C.textDim, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 10px" }}>Interactive: Lewis Structure Helper</p>
      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12 }}>
        {molecules.map((m,i) => (
          <button key={i} onClick={()=>setIdx(i)} style={{
            padding:"4px 10px", borderRadius:4, fontSize:12, fontFamily:F.sans, cursor:"pointer",
            background:i===idx?C.blue:"transparent", color:i===idx?"#fff":C.textDim,
            border:`1px solid ${i===idx?C.blue:C.border}`,
          }}>{m.name}</button>
        ))}
      </div>
      <div style={{ padding:12, background:C.bg, borderRadius:6, border:`1px solid ${C.border}` }}>
        <p style={{ fontSize:16, fontWeight:700, color:C.text, margin:"0 0 8px" }}>{mol.name}</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 16px", fontSize:12, color:C.textMid }}>
          <span>Total valence e-: <b style={{ color:C.blue, fontFamily:F.mono }}>{mol.total}{mol.total%2!==0?" (odd!)":""}</b></span>
          <span>Bonds to center: <b style={{ color:C.text }}>{mol.bonds}</b></span>
          <span>Lone pairs on center: <b style={{ color:C.text }}>{mol.lonePairsCenter}</b></span>
          <span>Shape: <b style={{ color:C.text }}>{mol.shape}</b></span>
          <span style={{ gridColumn:"1/-1" }}>Obeys octet rule: <b style={{ color:mol.octet?C.green:C.red }}>{mol.octet?"Yes":"No"}</b>
            {!mol.octet && mol.total%2!==0 && <span style={{ color:C.red, fontSize:11 }}> (odd e- count, radical)</span>}
            {!mol.octet && mol.bonds>4 && <span style={{ color:C.red, fontSize:11 }}> (expanded octet, d orbitals)</span>}
            {!mol.octet && mol.bonds===3 && mol.lonePairsCenter===0 && mol.name.includes("B") && <span style={{ color:C.red, fontSize:11 }}> (incomplete octet, only 6 e-)</span>}
          </span>
        </div>
        <div style={{ marginTop:8, fontSize:11, color:C.textDim }}>
          Valence e- breakdown: {mol.atoms.map(a => `${a.sym}(${a.ve})`).join(" + ")} = {mol.total}
        </div>
      </div>
    </div>
  );
}

// ── Equilibrium Shift Simulator ──────────────────────────────
function EquilibriumShift() {
  const [action, setAction] = useState(null);
  const rxn = "2NO(g) + O\u2082(g) \u21CC 2NO\u2082(g)";
  const actions = [
    { label:"Add NO", shift:"right", reason:"Adding reactant pushes equilibrium toward products" },
    { label:"Remove NO", shift:"left", reason:"Removing reactant shifts toward reactants to replace it" },
    { label:"Add NO\u2082", shift:"left", reason:"Adding product pushes equilibrium toward reactants" },
    { label:"Remove NO\u2082", shift:"right", reason:"Removing product shifts toward products to replace it" },
    { label:"Increase pressure", shift:"right", reason:"3 mol gas on left, 2 on right. System shifts to fewer moles (right)" },
    { label:"Add catalyst", shift:"none", reason:"Catalyst speeds both directions equally. No shift in equilibrium position" },
  ];
  const act = action !== null ? actions[action] : null;
  return (
    <div style={{ margin:"12px 0", padding:16, background:C.panel, borderRadius:8, border:`1px solid ${C.border}` }}>
      <p style={{ fontSize:10, fontWeight:600, color:C.textDim, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 10px" }}>Interactive: Le Chatelier's Principle</p>
      <p style={{ fontSize:14, fontWeight:600, color:C.text, margin:"0 0 12px", textAlign:"center" }}>{rxn}</p>
      <p style={{ fontSize:11, color:C.textDim, margin:"0 0 10px", textAlign:"center" }}>What happens when you disturb equilibrium? Tap to find out.</p>
      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12, justifyContent:"center" }}>
        {actions.map((a,i) => (
          <button key={i} onClick={()=>setAction(i)} style={{
            padding:"6px 12px", borderRadius:4, fontSize:11, fontFamily:F.sans, cursor:"pointer",
            background:action===i?C.blue:"transparent", color:action===i?"#fff":C.textMid,
            border:`1px solid ${action===i?C.blue:C.border}`,
          }}>{a.label}</button>
        ))}
      </div>
      {act && (
        <div style={{ padding:12, borderRadius:6, textAlign:"center",
          background: act.shift==="right"?C.greenDim : act.shift==="left"?C.redDim : C.goldDim,
          border:`1px solid ${act.shift==="right"?C.green : act.shift==="left"?C.red : C.gold}22`,
        }}>
          <p style={{ fontSize:20, margin:"0 0 4px" }}>
            {act.shift==="right" ? "\u2192 Shifts RIGHT (more product)" : act.shift==="left" ? "\u2190 Shifts LEFT (more reactant)" : "\u2194 NO SHIFT"}
          </p>
          <p style={{ fontSize:12, color:C.textMid, margin:0 }}>{act.reason}</p>
        </div>
      )}
    </div>
  );
}

// ── Activation Energy Diagram ────────────────────────────────
function ActivationEnergyDiagram() {
  const [type, setType] = useState("exo");
  const [catalyst, setCatalyst] = useState(false);
  const exo = type === "exo";
  const rE = exo ? 60 : 30; // reactant energy
  const pE = exo ? 30 : 60; // product energy
  const peakE = catalyst ? 70 : 85;
  return (
    <div style={{ margin:"12px 0", padding:16, background:C.panel, borderRadius:8, border:`1px solid ${C.border}` }}>
      <p style={{ fontSize:10, fontWeight:600, color:C.textDim, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 10px" }}>Interactive: Energy Diagram</p>
      <div style={{ display:"flex", gap:6, marginBottom:10 }}>
        <button onClick={()=>setType("exo")} style={{ padding:"4px 12px", borderRadius:4, fontSize:11, cursor:"pointer", background:exo?C.blue:"transparent", color:exo?"#fff":C.textDim, border:`1px solid ${exo?C.blue:C.border}`, fontFamily:F.sans }}>Exothermic</button>
        <button onClick={()=>setType("endo")} style={{ padding:"4px 12px", borderRadius:4, fontSize:11, cursor:"pointer", background:!exo?C.blue:"transparent", color:!exo?"#fff":C.textDim, border:`1px solid ${!exo?C.blue:C.border}`, fontFamily:F.sans }}>Endothermic</button>
        <button onClick={()=>setCatalyst(!catalyst)} style={{ padding:"4px 12px", borderRadius:4, fontSize:11, cursor:"pointer", background:catalyst?C.green:"transparent", color:catalyst?"#fff":C.textDim, border:`1px solid ${catalyst?C.green:C.border}`, fontFamily:F.sans }}>{catalyst?"Catalyst ON":"+ Catalyst"}</button>
      </div>
      <svg viewBox="0 0 200 110" style={{ width:"100%", maxWidth:460, display:"block", margin:"0 auto" }}>
        <line x1="20" y1="100" x2="180" y2="100" stroke={C.border} strokeWidth="0.5"/>
        <line x1="20" y1="10" x2="20" y2="100" stroke={C.border} strokeWidth="0.5"/>
        <text x="10" y="55" fontSize="5" fill={C.textDim} transform="rotate(-90,10,55)">Energy</text>
        <text x="100" y="108" textAnchor="middle" fontSize="5" fill={C.textDim}>Reaction progress \u2192</text>
        {/* Reactant level */}
        <line x1="25" y1={rE} x2="60" y2={rE} stroke={C.blue} strokeWidth="1.5"/>
        <text x="42" y={rE-3} textAnchor="middle" fontSize="5" fill={C.blue}>Reactants</text>
        {/* Product level */}
        <line x1="140" y1={pE} x2="175" y2={pE} stroke={exo?C.green:C.red} strokeWidth="1.5"/>
        <text x="157" y={pE-3} textAnchor="middle" fontSize="5" fill={exo?C.green:C.red}>Products</text>
        {/* Activation energy curve */}
        <path d={`M60,${rE} Q100,${100-peakE} 140,${pE}`} fill="none" stroke={catalyst?"#34d399":C.text} strokeWidth="1" strokeDasharray={catalyst?"3,2":"none"}/>
        {!catalyst && <path d={`M60,${rE} Q100,${100-85} 140,${pE}`} fill="none" stroke={C.text} strokeWidth="1"/>}
        {catalyst && <path d={`M60,${rE} Q100,${100-85} 140,${pE}`} fill="none" stroke={C.textLight} strokeWidth="0.5" strokeDasharray="2,2"/>}
        {/* Ea arrow */}
        <line x1="100" y1={rE} x2="100" y2={100-peakE} stroke={C.red} strokeWidth="0.5" strokeDasharray="2,1"/>
        <text x="108" y={(rE+(100-peakE))/2} fontSize="4.5" fill={C.red}>Ea{catalyst?" (lower)":""}</text>
        {/* Delta H arrow */}
        <line x1="160" y1={rE} x2="160" y2={pE} stroke={exo?C.green:C.red} strokeWidth="0.5" strokeDasharray="2,1"/>
        <text x="166" y={(rE+pE)/2} fontSize="4.5" fill={exo?C.green:C.red}>{exo?"\u0394H < 0":"\u0394H > 0"}</text>
      </svg>
      <div style={{ textAlign:"center", fontSize:11, color:C.textMid, marginTop:6 }}>
        {exo ? "Exothermic: products lower energy, heat released (\u0394H negative)" : "Endothermic: products higher energy, heat absorbed (\u0394H positive)"}
        {catalyst ? ". Catalyst lowers Ea but does NOT change \u0394H or equilibrium position." : ""}
      </div>
    </div>
  );
}

function GasLawSim() {
  const [p1, setP1] = useState(2);
  const v2 = p1>0 ? 12/p1 : 0;
  const [tc, setTc] = useState(300);
  const v2c = tc>0 ? 10*(600/tc) : 0;
  return (
    <div style={{ margin:"12px 0", padding:16, background:C.panel, borderRadius:8, border:`1px solid ${C.border}` }}>
      <p style={{ fontSize:10, fontWeight:600, color:C.textDim, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 10px" }}>Interactive: Gas Law Simulator</p>
      <p style={{ fontSize:12, fontWeight:600, color:C.text, margin:"0 0 6px" }}>Boyle's Law: P\u2081V\u2081 = P\u2082V\u2082 (constant T)</p>
      <p style={{ fontSize:11, color:C.textDim, margin:"0 0 8px" }}>Initial: P=2 atm, V=6 L (product=12). Change pressure and watch volume.</p>
      <Slider label="P (atm)" value={p1} min={0.5} max={8} step={0.5} onChange={setP1} />
      <div style={{ display:"flex", gap:12, margin:"8px 0 16px" }}>
        <div style={{ flex:1, textAlign:"center", padding:8, background:C.blueDim, borderRadius:6 }}>
          <div style={{ fontSize:9, color:C.textDim }}>Pressure</div>
          <div style={{ fontSize:16, fontWeight:700, color:C.blue, fontFamily:F.mono }}>{p1} atm</div>
        </div>
        <div style={{ flex:1, textAlign:"center", padding:8, background:C.greenDim, borderRadius:6 }}>
          <div style={{ fontSize:9, color:C.textDim }}>Volume</div>
          <div style={{ fontSize:16, fontWeight:700, color:C.green, fontFamily:F.mono }}>{v2.toFixed(1)} L</div>
        </div>
      </div>
      <div style={{ width:"100%", height:36, background:C.bg, borderRadius:6, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:16, position:"relative" }}>
        <div style={{ height:"100%", width:`${Math.min(100,(v2/12)*100)}%`, background:`${C.blue}22`, transition:"width 0.3s", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:10, fontFamily:F.mono, color:C.blue }}>{v2.toFixed(1)} L</span>
        </div>
      </div>
      <p style={{ fontSize:12, fontWeight:600, color:C.text, margin:"0 0 6px" }}>Charles's Law: V\u2081/T\u2081 = V\u2082/T\u2082 (constant P)</p>
      <p style={{ fontSize:11, color:C.textDim, margin:"0 0 8px" }}>V=10L at your chosen T. What is V at T=600K?</p>
      <Slider label="T (K)" value={tc} min={100} max={800} step={50} onChange={setTc} />
      <div style={{ padding:8, background:C.blueDim, borderRadius:6, textAlign:"center", marginTop:6 }}>
        <span style={{ fontFamily:F.mono, fontSize:13, color:C.blue }}>V=10L at {tc}K \u2192 V = {v2c.toFixed(1)}L at 600K</span>
      </div>
    </div>
  );
}

function MolaritySim() {
  const [mol, setMol] = useState(2);
  const [vol, setVol] = useState(0.5);
  const M = vol>0 ? mol/vol : 0;
  const [m1, setM1] = useState(6);
  const [v1d, setV1d] = useState(100);
  const [v2d, setV2d] = useState(300);
  const m2 = v2d>0 ? (m1*v1d)/v2d : 0;
  return (
    <div style={{ margin:"12px 0", padding:16, background:C.panel, borderRadius:8, border:`1px solid ${C.border}` }}>
      <p style={{ fontSize:10, fontWeight:600, color:C.textDim, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 10px" }}>Interactive: Molarity & Dilution</p>
      <p style={{ fontSize:12, fontWeight:600, color:C.text, margin:"0 0 6px" }}>Molarity = moles / liters</p>
      <Slider label="Moles of solute" value={mol} min={0.1} max={10} step={0.1} onChange={setMol} />
      <Slider label="Volume (L)" value={vol} min={0.1} max={5} step={0.1} onChange={setVol} />
      <div style={{ padding:10, background:C.blueDim, borderRadius:6, textAlign:"center", margin:"8px 0 16px" }}>
        <span style={{ fontFamily:F.mono, fontSize:15, color:C.blue, fontWeight:700 }}>M = {mol.toFixed(1)} / {vol.toFixed(1)} = {M.toFixed(2)} M</span>
      </div>
      <p style={{ fontSize:12, fontWeight:600, color:C.text, margin:"0 0 6px" }}>Dilution: M\u2081V\u2081 = M\u2082V\u2082</p>
      <Slider label="M\u2081" value={m1} min={0.5} max={12} step={0.5} onChange={setM1} />
      <Slider label="V\u2081 (mL)" value={v1d} min={10} max={500} step={10} onChange={setV1d} />
      <Slider label="V\u2082 (mL)" value={v2d} min={50} max={1000} step={10} onChange={setV2d} />
      <div style={{ padding:10, background:C.greenDim, borderRadius:6, textAlign:"center", margin:"8px 0" }}>
        <span style={{ fontFamily:F.mono, fontSize:13, color:C.green, fontWeight:700 }}>({m1})({v1d}) = M\u2082({v2d}) \u2192 M\u2082 = {m2.toFixed(2)} M</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   EQUATION EXPLORER DEFINITIONS
   ══════════════════════════════════════════════════════════════════ */
const CHEM_EQUATIONS = {
  "atoms": [{ formula:"Mass # = protons + neutrons", params:[{name:"protons",min:1,max:20,step:1,init:6},{name:"neutrons",min:0,max:20,step:1,init:6}], compute:({protons,neutrons})=>`Mass # = ${protons}+${neutrons} = ${protons+neutrons}. Element: ${(PT.find(e=>e.n===protons)||{name:"?"}).name}` }],
  "electrons": [{ formula:"Shells: 2, 8, 8, 2 (first 20)", params:[{name:"Z",min:1,max:20,step:1,init:11}], compute:({Z})=>{ let r=Z; const sh=[]; [2,8,8,2].forEach(m=>{if(r>0){const c=Math.min(r,m);sh.push(c);r-=c;}}); return `Z=${Z}: [${sh.join(",")}], valence=${sh[sh.length-1]}`; }}],
  "mole": [
    { formula:"moles = grams / molar mass", params:[{name:"grams",min:1,max:200,step:1,init:44},{name:"MM",min:1,max:200,step:1,init:44}], compute:({grams,MM})=>`${grams} / ${MM} = ${(grams/MM).toFixed(3)} mol` },
    { formula:"particles = moles \u00d7 6.022e23", params:[{name:"moles",min:0.1,max:10,step:0.1,init:1}], compute:({moles})=>{ const p=moles*6.022e23; const e=Math.floor(Math.log10(p)); return `${(p/10**e).toFixed(2)} \u00d7 10^${e}`; }},
  ],
  "stoich": [{ formula:"g A \u2192 mol A \u2192 mol B \u2192 g B", params:[{name:"gA",min:1,max:100,step:1,init:46},{name:"MMA",min:1,max:100,step:1,init:23},{name:"ratio",min:1,max:5,step:1,init:1},{name:"MMB",min:1,max:100,step:1,init:58}], compute:({gA,MMA,ratio,MMB})=>{ const mA=gA/MMA; const mB=mA*ratio; return `${gA}/${MMA}=${mA.toFixed(2)}mol \u2192 \u00d7${ratio}=${mB.toFixed(2)}mol \u2192 \u00d7${MMB}=${(mB*MMB).toFixed(1)}g`; }}],
  "gas": [
    { formula:"PV = nRT", params:[{name:"P",min:0.5,max:5,step:0.1,init:1},{name:"V",min:1,max:50,step:1,init:22},{name:"T",min:200,max:500,step:10,init:273}], compute:({P,V,T})=>`n = (${P})(${V})/((0.0821)(${T})) = ${(P*V/(0.0821*T)).toFixed(3)} mol` },
    { formula:"Boyle: P\u2081V\u2081 = P\u2082V\u2082", params:[{name:"P1",min:0.5,max:5,step:0.5,init:2},{name:"V1",min:1,max:20,step:1,init:6},{name:"P2",min:0.5,max:5,step:0.5,init:3}], compute:({P1,V1,P2})=>`V2 = (${P1})(${V1})/${P2} = ${(P1*V1/P2).toFixed(1)} L` },
  ],
  "molarity": [
    { formula:"M = mol / L", params:[{name:"mol",min:0.1,max:10,step:0.1,init:2},{name:"L",min:0.1,max:5,step:0.1,init:0.5}], compute:({mol,L})=>`M = ${mol}/${L} = ${(mol/L).toFixed(2)} M` },
    { formula:"M\u2081V\u2081 = M\u2082V\u2082", params:[{name:"M1",min:0.5,max:12,step:0.5,init:6},{name:"V1",min:10,max:500,step:10,init:100},{name:"V2",min:50,max:1000,step:10,init:300}], compute:({M1,V1,V2})=>`M2 = (${M1})(${V1})/${V2} = ${(M1*V1/V2).toFixed(2)} M` },
  ],
};

/* ══════════════════════════════════════════════════════════════════
   LECTURE DATA (reading + interactive + equations + practice)
   ══════════════════════════════════════════════════════════════════ */
const UNITS = [
  { id:"u1", title:"Atomic Structure & Periodic Table", week:1, desc:"Subatomic particles, electron config, periodic trends, bonding.", lectures:[
    { id:"a1", title:"Atoms, Elements & Subatomic Particles", yt:"https://www.youtube.com/watch?v=1xSQlwWGT8M", ytLabel:"Professor Dave Explains", interactive:"periodic", eqKey:"atoms",
      reading:["Everything around you is made of atoms. An atom is the smallest unit of an element that retains that element's chemical properties. Atoms consist of three subatomic particles: protons (positive charge, in the nucleus), neutrons (no charge, in the nucleus), and electrons (negative charge, orbiting the nucleus).","The atomic number is the number of protons in an atom and defines the element. Hydrogen = 1, carbon = 6, oxygen = 8. Change the proton count and you change the element. The mass number equals protons plus neutrons. So carbon-14 has 6 protons and 8 neutrons.","Isotopes are atoms of the same element with different numbers of neutrons. Carbon-12 and carbon-14 are both carbon (6 protons), but carbon-14 has 2 extra neutrons. They behave almost identically in chemical reactions because chemistry is driven by electrons.","In a neutral atom, electrons equal protons. Electrons determine bonding behavior. The periodic table organizes elements by atomic number. Elements in the same column (group) share similar properties because they have the same number of valence electrons."],
      practice:[{q:"Fluorine has atomic number 9 and mass number 19. How many neutrons?",a:"19 - 9 = 10 neutrons"},{q:"An atom has 12 protons, 12 neutrons, and 12 electrons. What element?",a:"Atomic number 12 = Magnesium (Mg)"},{q:"How many protons, neutrons, electrons in neutral Na-23?",a:"Na Z=11. Protons=11, electrons=11, neutrons=23-11=12"},{q:"Carbon-12 and Carbon-14 are isotopes. What do they share?",a:"Same protons (6). C-12 has 6 neutrons, C-14 has 8 neutrons"}] },
    { id:"a2", title:"Electron Configuration & Orbitals", yt:"https://www.youtube.com/watch?v=Aoi4j8es4gQ", ytLabel:"The Organic Chemistry Tutor", interactive:"shells", eqKey:"electrons",
      reading:["Electrons occupy orbitals in a specific filling order: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p. An s orbital holds 2 electrons, a p set holds 6, a d set holds 10. For the first 20 elements this is straightforward since 3d does not start filling until element 21.","Oxygen (Z=8) fills as 1s2 2s2 2p4. Sodium (Z=11) fills as 1s2 2s2 2p6 3s1. Noble gas shorthand replaces inner electrons with the previous noble gas symbol in brackets: sodium becomes [Ne] 3s1.","Valence electrons are those in the outermost shell and they control chemical bonding. For main group elements, the group number tells you the count: group 1 has 1, group 2 has 2, groups 13 through 18 have 3 through 8. Atoms with the same valence electron count react similarly, which is why elements in the same group share chemical properties."],
      practice:[{q:"Write the electron configuration for sulfur (Z=16).",a:"1s2 2s2 2p6 3s2 3p4, or [Ne] 3s2 3p4"},{q:"How many valence electrons does phosphorus (Z=15) have?",a:"5 valence electrons. [Ne] 3s2 3p3, shell 3 has 2+3=5"},{q:"Which element is [Ne] 3s2 3p5?",a:"Z = 10+7 = 17 = Chlorine"},{q:"Why do Li and Na behave similarly?",a:"Both have 1 valence electron (group 1). Li:[He]2s1, Na:[Ne]3s1"}] },
    { id:"a3", title:"Periodic Trends", yt:"https://www.youtube.com/watch?v=vMqDn1rNNeU", ytLabel:"Professor Dave Explains",
      reading:["Atomic radius increases going down a group (more shells) and decreases left to right (more protons pulling the same shell closer). Cesium is the largest common atom, helium the smallest.","Ionization energy (energy to remove an electron) increases going up and to the right. Small atoms hold electrons tightly. Fluorine and neon have very high ionization energies.","Electronegativity (attraction for bonding electrons) follows the same pattern: up and to the right. Fluorine is the most electronegative element. Metals have low electronegativity, nonmetals have high.","Key groups: 1 = alkali metals (1 valence e-, very reactive), 2 = alkaline earth (2 valence e-), 17 = halogens (7 valence e-, reactive nonmetals), 18 = noble gases (full shell, unreactive). Metals are left/center, nonmetals upper right, metalloids along the staircase."],
      practice:[{q:"Which has larger atomic radius, Na or Cl?",a:"Na. Both period 3, but Na is further left with fewer protons pulling the shell"},{q:"Rank by increasing ionization energy: K, Ca, Br",a:"K < Ca < Br. Left to right across period 4"},{q:"Which is more electronegative, O or S?",a:"Oxygen. Above S in group 16, electronegativity increases going up"},{q:"An element is shiny, conducts, loses electrons easily. Metal/nonmetal/metalloid?",a:"Metal"}] },
    { id:"a4", title:"Ions, Ionic & Covalent Bonding", yt:"https://www.youtube.com/watch?v=Fi4zinSEEQc", ytLabel:"Professor Dave Explains",
      reading:["Atoms form ions to achieve stable electron configurations (octet rule). Metals lose electrons to become cations (Na+, Ca2+, Al3+). Nonmetals gain electrons to become anions (Cl-, O2-, N3-).","Ionic bonds form between metals and nonmetals through electron transfer. The opposite charges attract, creating a crystal lattice. NaCl is the classic example. Covalent bonds form between nonmetals through electron sharing. H2O is covalent.","Polyatomic ions to memorize: sulfate SO4 2-, nitrate NO3-, phosphate PO4 3-, carbonate CO3 2-, hydroxide OH-, ammonium NH4+ (only common positive one). These appear constantly in naming and formula writing."],
      practice:[{q:"What ion does magnesium (group 2) form?",a:"Mg2+. Loses 2 electrons to match neon config"},{q:"Is MgCl2 ionic or covalent?",a:"Ionic. Mg is metal, Cl is nonmetal"},{q:"Charge on phosphate?",a:"PO4 3- (three minus)"},{q:"Why does NaCl form a lattice, not molecules?",a:"Ionic bonds are nondirectional. Each Na+ attracts multiple Cl- and vice versa, forming a 3D crystal lattice"}] },
  ]},
  { id:"u2", title:"Chemical Nomenclature", week:2, desc:"Naming ionic, covalent compounds, and acids.", lectures:[
    { id:"n1", title:"Naming Ionic Compounds", yt:"https://www.youtube.com/watch?v=nKJFxsOAGTo", ytLabel:"The Organic Chemistry Tutor",
      reading:["Pattern: metal name + nonmetal with -ide. NaCl = sodium chloride. CaBr2 = calcium bromide. K2O = potassium oxide.","Transition metals need Roman numerals for the charge. FeCl2 = iron(II) chloride (Fe2+). FeCl3 = iron(III) chloride (Fe3+). Determine charge by balancing against the anion.","With polyatomic ions, use the ion's name. Na2SO4 = sodium sulfate. Ca(NO3)2 = calcium nitrate. NH4Cl = ammonium chloride.","To write formulas from names: find charges, crisscross. Aluminum oxide: Al3+ and O2- crisscross to Al2O3. Verify: 2(3+)+3(2-)=0."],
      practice:[{q:"Name CaCl2",a:"Calcium chloride"},{q:"Formula for iron(III) oxide",a:"Fe2O3. Fe3+ and O2-, crisscross"},{q:"Name NH4NO3",a:"Ammonium nitrate"},{q:"Formula for aluminum sulfate",a:"Al2(SO4)3. Al3+ and SO4 2-"}] },
    { id:"n2", title:"Naming Covalent Compounds", yt:"https://www.youtube.com/watch?v=MI-UYhkOplA", ytLabel:"The Organic Chemistry Tutor",
      reading:["Two nonmetals use Greek prefixes: mono(1), di(2), tri(3), tetra(4), penta(5), hexa(6). First element never gets mono-. Second element gets -ide ending.","CO2 = carbon dioxide. N2O5 = dinitrogen pentoxide. PCl3 = phosphorus trichloride. SF6 = sulfur hexafluoride.","Key difference from ionic: ionic compounds use charges to determine ratios (no prefixes needed). Covalent compounds have no charges, so prefixes are required."],
      practice:[{q:"Name N2O4",a:"Dinitrogen tetroxide"},{q:"Formula for diphosphorus pentoxide",a:"P2O5"},{q:"Name SF6",a:"Sulfur hexafluoride"},{q:"Why no prefixes for NaCl but prefixes for CO2?",a:"NaCl is ionic (charges set ratio). CO2 is covalent (no charges, need prefixes)"}] },
    { id:"n3", title:"Naming Acids", yt:"https://www.youtube.com/watch?v=IEVKR6SDwJI", ytLabel:"The Organic Chemistry Tutor",
      reading:["Binary acids (H + nonmetal, no oxygen): hydro___ic acid. HCl = hydrochloric, HBr = hydrobromic, H2S = hydrosulfuric.","Oxyacids with -ate ion: ___ic acid. H2SO4 (sulfate) = sulfuric acid. HNO3 (nitrate) = nitric acid. Oxyacids with -ite ion: ___ous acid. H2SO3 (sulfite) = sulfurous acid. HNO2 (nitrite) = nitrous acid. No hydro- for oxyacids.","Key acids to know: HCl (hydrochloric), H2SO4 (sulfuric), HNO3 (nitric), H3PO4 (phosphoric), CH3COOH (acetic)."],
      practice:[{q:"Name HNO3",a:"Nitric acid. NO3- is nitrate (-ate), acid is -ic"},{q:"Formula for hydrobromic acid",a:"HBr. Hydro-ic = binary acid = H + nonmetal"},{q:"Name H2SO3",a:"Sulfurous acid. SO3 2- is sulfite (-ite), acid is -ous"},{q:"Is HClO3 hydrochloric or chloric acid?",a:"Chloric acid. Contains oxygen (ClO3- = chlorate), -ate becomes -ic, no hydro-"}] },
  ]},
  { id:"u3", title:"Chemical Reactions & Balancing", week:2, desc:"Five reaction types, balancing equations, predicting products.", lectures:[
    { id:"r1", title:"Five Types of Chemical Reactions", yt:"https://www.youtube.com/watch?v=VnSJloBm3TA", ytLabel:"Professor Dave Explains",
      reading:["Synthesis: A + B \u2192 AB. Two combine into one. 2Na + Cl2 \u2192 2NaCl.","Decomposition: AB \u2192 A + B. One breaks into simpler parts. 2H2O \u2192 2H2 + O2.","Single replacement: A + BC \u2192 AC + B. One element swaps in. Zn + CuSO4 \u2192 ZnSO4 + Cu.","Double replacement: AB + CD \u2192 AD + CB. Partners swap. NaCl + AgNO3 \u2192 NaNO3 + AgCl.","Combustion: hydrocarbon + O2 \u2192 CO2 + H2O. CH4 + 2O2 \u2192 CO2 + 2H2O. Products are always CO2 and H2O for complete combustion of any CxHy."],
      practice:[{q:"Classify: 2Mg + O2 \u2192 2MgO",a:"Synthesis. Two reactants combine into one product"},{q:"Classify: AgNO3 + NaCl \u2192 AgCl + NaNO3",a:"Double replacement. Cations swap anion partners"},{q:"Products of complete combustion of C2H6?",a:"CO2 + H2O"},{q:"Classify: 2KClO3 \u2192 2KCl + 3O2",a:"Decomposition. One compound splits into two"}] },
    { id:"r2", title:"Balancing Chemical Equations", yt:"https://www.youtube.com/watch?v=RnGu3xO2h74", ytLabel:"The Organic Chemistry Tutor", interactive:"balancer",
      reading:["Conservation of mass: atoms in = atoms out. Balance by adjusting coefficients only (never subscripts). Changing subscripts changes the compound itself.","Strategy: balance elements appearing in one reactant and one product first. Save H and O for last. Count atoms after each adjustment.","Example: Fe + O2 \u2192 Fe2O3. Fe needs 4 on left, 2Fe2O3 on right (4 Fe each). O: right has 6, so 3O2 on left. Final: 4Fe + 3O2 \u2192 2Fe2O3. Verify: 4 Fe, 6 O each side."],
      practice:[{q:"Balance: Al + O2 \u2192 Al2O3",a:"4Al + 3O2 \u2192 2Al2O3. 4 Al, 6 O each side"},{q:"Balance: C3H8 + O2 \u2192 CO2 + H2O",a:"C3H8 + 5O2 \u2192 3CO2 + 4H2O. C:3, H:8, O:10 each side"},{q:"Balance: Na + H2O \u2192 NaOH + H2",a:"2Na + 2H2O \u2192 2NaOH + H2. Na:2, H:4, O:2 each side"}] },
  ]},
  { id:"u4", title:"The Mole & Stoichiometry", week:3, desc:"Mole conversions, stoichiometry, limiting reagent, percent yield.", lectures:[
    { id:"m1", title:"The Mole, Molar Mass & Conversions", yt:"https://www.youtube.com/watch?v=AsqEkF7hcII", ytLabel:"Professor Dave Explains", interactive:"molemap", eqKey:"mole",
      reading:["One mole = 6.022 \u00d7 10\u00b2\u00b3 particles (Avogadro's number). Molar mass = mass of one mole in grams. For elements, it equals atomic mass from the periodic table. For compounds, add all atoms: H2O = 2(1.008) + 16.00 = 18.02 g/mol.","Core conversions: grams to moles (divide by molar mass), moles to grams (multiply), moles to particles (multiply by 6.022e23), particles to moles (divide). The mole is always the bridge between grams and particles.","Example: 3.0 mol NaCl. Molar mass = 23 + 35.5 = 58.5. Grams = 3.0 \u00d7 58.5 = 175.5 g."],
      practice:[{q:"Molar mass of Ca(OH)2? (Ca=40, O=16, H=1)",a:"40 + 2(16+1) = 40 + 34 = 74 g/mol"},{q:"Moles in 88g CO2? (C=12, O=16)",a:"MM = 44. 88/44 = 2.0 mol"},{q:"Molecules in 0.5 mol H2O?",a:"0.5 \u00d7 6.022e23 = 3.011 \u00d7 10^23"},{q:"Mass of 1.204e24 atoms of C?",a:"1.204e24 / 6.022e23 = 2.0 mol. 2.0 \u00d7 12 = 24 g"}] },
    { id:"m2", title:"Stoichiometry & Limiting Reagent", yt:"https://www.youtube.com/watch?v=jFv6k2O2_Oo", ytLabel:"Professor Dave Explains", eqKey:"stoich",
      reading:["Coefficients in balanced equations give mole ratios. 2H2 + O2 \u2192 2H2O means 2:1:2. Gram to gram: (1) grams A \u2192 moles A via molar mass, (2) moles A \u2192 moles B via ratio, (3) moles B \u2192 grams B via molar mass.","Limiting reagent: calculate product from each reactant. The one giving less product is limiting. Percent yield = (actual/theoretical) \u00d7 100.","Example: 46g Na in 2Na+Cl2\u21922NaCl. 46/23=2mol Na \u2192 2mol NaCl \u2192 2\u00d758.5=117g NaCl."],
      practice:[{q:"N2+3H2\u21922NH3. Grams NH3 from 14g N2? (N=14,H=1)",a:"14/28=0.5mol N2 \u2192 1.0mol NH3 \u2192 1.0\u00d717=17g"},{q:"2H2+O2\u21922H2O. 3mol H2, 2mol O2. Limiting?",a:"H2 gives 3mol H2O. O2 gives 4. H2 is limiting"},{q:"Theoretical=50g, actual=42g. Percent yield?",a:"(42/50)\u00d7100 = 84%"}] },
  ]},
  { id:"u5", title:"Gas Laws", week:4, desc:"Boyle's, Charles's, ideal gas law.", lectures:[
    { id:"g1", title:"Gas Laws: Boyle's, Charles's, Combined", yt:"https://www.youtube.com/watch?v=GwoX_BemwHs", ytLabel:"The Organic Chemistry Tutor", interactive:"gasSim", eqKey:"gas",
      reading:["Boyle's: P1V1 = P2V2 (constant T). Pressure and volume inversely proportional. Double pressure, halve volume.","Charles's: V1/T1 = V2/T2 (constant P). Volume and temperature directly proportional. Temperature MUST be Kelvin (K = C + 273).","Combined: (P1V1)/T1 = (P2V2)/T2. STP = 0\u00b0C (273K) and 1 atm. At STP, 1 mol of any gas = 22.4 L.","Pressure conversions: 1 atm = 760 mmHg = 760 torr = 101.325 kPa."],
      practice:[{q:"Gas at 4atm, 3L. Pressure drops to 2atm. New volume?",a:"P1V1=P2V2. (4)(3)=(2)(V2). V2=6L"},{q:"Gas at 200K, 5L. T rises to 400K. New volume?",a:"V1/T1=V2/T2. 5/200=V2/400. V2=10L"},{q:"Convert 380 mmHg to atm",a:"380/760 = 0.5 atm"},{q:"Moles in 44.8L at STP?",a:"44.8/22.4 = 2.0 mol"}] },
    { id:"g2", title:"Ideal Gas Law (PV=nRT)", yt:"https://www.youtube.com/watch?v=TqLlfHBFY08", ytLabel:"Professor Dave Explains", eqKey:"gas",
      reading:["PV = nRT. P in atm, V in liters, n in moles, R = 0.0821, T in Kelvin. Solve for any variable.","Example: n in 5.0L at 2.0atm, 273K? n = PV/RT = (2)(5)/(0.0821)(273) = 10/22.4 = 0.446 mol.","Dalton's Law: Ptotal = P1 + P2 + P3... Total pressure = sum of partial pressures."],
      practice:[{q:"V if n=0.5mol, P=1atm, T=273K?",a:"V = nRT/P = (0.5)(0.0821)(273)/1 = 11.2 L"},{q:"N2 at 0.8atm, O2 at 0.5atm. Total P?",a:"0.8 + 0.5 = 1.3 atm"},{q:"Volume of 3mol gas at STP?",a:"3 \u00d7 22.4 = 67.2 L"}] },
  ]},
  { id:"u6", title:"Solutions & Concentration", week:4, desc:"Molarity and dilution calculations.", lectures:[
    { id:"s1", title:"Molarity & Dilution", yt:"https://www.youtube.com/watch?v=V1JFmV3FRIQ", ytLabel:"Professor Dave Explains", interactive:"molarity", eqKey:"molarity",
      reading:["Molarity (M) = moles of solute / liters of solution. A 2M NaCl solution has 2 moles NaCl per liter. Volume must be in liters.","To prepare a solution: grams needed = M \u00d7 V \u00d7 molar mass. Dissolve that mass, then add water to reach target volume.","Dilution: M1V1 = M2V2. Adding water decreases concentration but moles stay constant. Example: 100mL of 6M HCl diluted to 300mL. (6)(100)=(M2)(300). M2=2M.","Mixing: total moles = M1V1 + M2V2, total volume = V1+V2, final M = total moles / total volume."],
      practice:[{q:"Molarity of 4mol KOH in 2L?",a:"M = 4/2 = 2.0 M"},{q:"Grams NaOH (MW=40) for 250mL of 2M?",a:"Moles = 2\u00d70.25 = 0.5. Grams = 0.5\u00d740 = 20g"},{q:"Dilute 50mL of 12M HCl to 6M. Final volume?",a:"(12)(50) = (6)(V2). V2 = 100 mL"},{q:"Mix 100mL 1M NaCl + 200mL 4M NaCl. Final M?",a:"Moles: 0.1+0.8=0.9. Volume: 0.3L. M=0.9/0.3=3.0M"}] },
  ]},
  { id:"u7", title:"States of Matter & Thermochemistry", week:3, desc:"Phase changes, exothermic vs endothermic, heat and energy.", lectures:[
    { id:"ph1", title:"States of Matter & Phase Changes", yt:"https://www.youtube.com/watch?v=WLKEVfLFau4", ytLabel:"The Organic Chemistry Tutor", interactive:"heatingCurve",
      reading:["Matter exists in three common states: solid (fixed shape and volume, particles vibrate in place), liquid (fixed volume but takes shape of container, particles slide past each other), and gas (no fixed shape or volume, particles move freely and fill any container).","Phase changes happen when energy is added or removed. Melting (solid to liquid), evaporation/boiling (liquid to gas), and sublimation (solid to gas) all require energy input. These are endothermic processes because the substance absorbs heat from the surroundings.","Freezing (liquid to solid), condensation (gas to liquid), and deposition (gas to solid) all release energy. These are exothermic processes because the substance releases heat to the surroundings. A key test question: a substance releases heat when it changes from liquid to solid (freezing).","During a phase change, the temperature stays constant even though heat is being added or removed. All the energy goes into breaking or forming intermolecular forces, not into changing the kinetic energy of the molecules. This is why a heating curve has flat plateaus at the melting and boiling points.","Heating curves show temperature vs time as heat is added. The upward slopes represent heating within a single phase. The flat regions (plateaus) represent phase changes where temperature is constant. The length of each plateau depends on the heat of fusion (melting) or heat of vaporization (boiling)."],
      practice:[{q:"A substance releases heat when it changes from liquid to solid, solid to gas, solid to liquid, or liquid to gas?",a:"Liquid to solid (freezing). Freezing is exothermic, it releases heat"},{q:"During boiling, what happens to the temperature of the water?",a:"Temperature stays constant at 100C (at 1 atm). Energy goes into breaking intermolecular forces, not raising temperature"},{q:"Is evaporation endothermic or exothermic?",a:"Endothermic. Liquid to gas requires energy input to overcome intermolecular forces"},{q:"On a heating curve, what do the flat regions represent?",a:"Phase changes. Temperature is constant during melting and boiling as energy breaks intermolecular forces"}] },
    { id:"ph2", title:"Exothermic vs Endothermic Reactions", yt:"https://www.youtube.com/watch?v=LQT5cSoNucA", ytLabel:"Professor Dave Explains", interactive:"activationE",
      reading:["In an exothermic reaction, the system releases heat to the surroundings. The products have less energy than the reactants. Delta H is negative. Combustion is a classic exothermic reaction. You feel warmth because energy flows out of the reaction.","In an endothermic reaction, the system absorbs heat from the surroundings. The products have more energy than the reactants. Delta H is positive. Photosynthesis and dissolving ammonium nitrate in water are endothermic. The surroundings feel cold because energy flows into the reaction.","Energy diagrams show the energy of reactants vs products. For exothermic reactions, the products are lower on the diagram than the reactants. For endothermic, the products are higher. The hump between them is the activation energy, which is the minimum energy needed to start the reaction.","The law of conservation of energy applies: energy is not created or destroyed, just transferred between the system and surroundings. If a reaction releases 100 kJ, the surroundings absorb 100 kJ."],
      practice:[{q:"A reaction has delta H = -250 kJ. Is it exothermic or endothermic?",a:"Exothermic. Negative delta H means energy is released"},{q:"In an energy diagram for an exothermic reaction, are products higher or lower than reactants?",a:"Lower. Products have less energy because energy was released"},{q:"Dissolving ammonium nitrate makes the solution feel cold. Exo or endothermic?",a:"Endothermic. The solution absorbs heat from your hand, making it feel cold"},{q:"What is activation energy?",a:"The minimum energy required to start a chemical reaction. Shown as the hump on an energy diagram between reactants and products"}] },
  ]},
  { id:"u8", title:"Lewis Structures & Octet Rule", week:3, desc:"Dot structures, bonding, octet exceptions.", lectures:[
    { id:"lw1", title:"Lewis Dot Structures", yt:"https://www.youtube.com/watch?v=cIuXl7o6mAw", ytLabel:"The Organic Chemistry Tutor", interactive:"lewis",
      reading:["Lewis dot structures show how valence electrons are arranged in a molecule. Each dot represents one valence electron. Lines between atoms represent shared pairs (bonds). Lone pairs (unshared electrons) are shown as dots on individual atoms.","To draw a Lewis structure: (1) Count total valence electrons from all atoms. (2) Place the least electronegative atom in the center (H is always outer). (3) Connect atoms with single bonds first. (4) Distribute remaining electrons as lone pairs to satisfy octets. (5) If octets are not satisfied, form double or triple bonds by sharing lone pairs.","Example: CO2 has 4 + 6 + 6 = 16 valence electrons. Carbon is central. Two double bonds to oxygen: O=C=O. Each oxygen has 2 lone pairs, carbon has 0. All octets satisfied.","Example: H2O has 1 + 1 + 6 = 8 valence electrons. Oxygen is central with two single bonds to H and two lone pairs. The lone pairs give water its bent shape.","For polyatomic ions, add one electron for each negative charge, subtract one for each positive charge. NH4+ has 5 + 4(1) - 1 = 8 valence electrons."],
      practice:[{q:"How many total valence electrons in CCl4? (C=4, Cl=7 each)",a:"4 + 4(7) = 32 valence electrons"},{q:"Draw the Lewis structure concept for N2. How many bonds?",a:"Triple bond (N:::N). Each N has 5 valence e-, need to share 3 pairs to satisfy octets. One lone pair on each N"},{q:"How many lone pairs on the oxygen in H2O?",a:"2 lone pairs. O has 6 valence e-, uses 2 for bonds to H, leaving 4 as 2 lone pairs"},{q:"Total valence electrons in NO3-?",a:"5 + 3(6) + 1 = 24. The extra 1 is from the negative charge"}] },
    { id:"lw2", title:"Octet Rule and Exceptions", yt:"https://www.youtube.com/watch?v=MxrVDGmelKI", ytLabel:"The Organic Chemistry Tutor", interactive:"lewis",
      reading:["The octet rule states that atoms tend to gain, lose, or share electrons to achieve 8 electrons in their outer shell (like noble gases). This works well for C, N, O, F, and most main group elements.","Exceptions to the octet rule fall into three categories. (1) Incomplete octets: some atoms are stable with fewer than 8 electrons. Boron (B) is happy with 6 (as in BF3). Beryllium can have 4. (2) Odd electron molecules: molecules with an odd total of valence electrons cannot have all atoms with octets. NO has 11 valence electrons, so nitrogen has only 7. (3) Expanded octets: atoms in period 3 and below can hold more than 8 electrons because they have d orbitals available. SF6 has 12 electrons around sulfur. PCl5 has 10 around phosphorus.","The test will likely ask you to identify which molecule does not obey the octet rule. Look for: odd total valence electrons (like NO, NO2), atoms bonded to many other atoms (like SF6, PCl5), or boron compounds (BF3, BH3).","Formal charge helps determine the best Lewis structure when multiple options exist. Formal charge = valence electrons - lone pair electrons - (1/2)(bonding electrons). The best structure minimizes formal charges and places negative formal charges on more electronegative atoms."],
      practice:[{q:"Which does NOT obey the octet rule: N2, NO, CF4, or Ar?",a:"NO. It has 11 total valence electrons (odd number), so not all atoms can have octets. N has only 7 electrons"},{q:"Why can sulfur form SF6 but oxygen cannot form OF6?",a:"Sulfur is in period 3 and has d orbitals available for expanded octet (12 e- around S). Oxygen is in period 2 with no d orbitals, limited to 8"},{q:"BF3 has an incomplete octet. How many electrons surround boron?",a:"6 electrons. Boron has 3 valence e-, forms 3 bonds to F, no lone pairs. Only 6 electrons around B"},{q:"How many total valence electrons in NO? Is it even or odd?",a:"5 + 6 = 11. Odd. This is why it cannot satisfy the octet rule for all atoms"}] },
  ]},
  { id:"u9", title:"Equilibrium & Le Chatelier's", week:4, desc:"Keq, shifting equilibrium, Le Chatelier's principle.", lectures:[
    { id:"eq1", title:"Chemical Equilibrium & Keq", yt:"https://www.youtube.com/watch?v=dUMmoPb4HII", ytLabel:"The Organic Chemistry Tutor",
      reading:["A reversible reaction reaches equilibrium when the forward and reverse rates are equal. At equilibrium, concentrations of reactants and products remain constant (but not necessarily equal). The double arrow symbol (\u21CC) indicates a reversible reaction.","The equilibrium constant Keq (or Kc for concentrations) is the ratio of product concentrations to reactant concentrations, each raised to the power of their coefficient. For aA + bB \u21CC cC + dD, Keq = [C]^c [D]^d / [A]^a [B]^b.","If Keq is large (much greater than 1), products are favored at equilibrium. If Keq is small (much less than 1), reactants are favored. Keq = 1 means roughly equal amounts of products and reactants.","Pure solids and pure liquids are not included in the Keq expression. Only gases and aqueous (dissolved) species appear. This matters for reactions involving precipitates or water as a solvent."],
      practice:[{q:"For N2 + 3H2 \u21CC 2NH3, write the Keq expression.",a:"Keq = [NH3]^2 / ([N2][H2]^3)"},{q:"A reaction has Keq = 4.2 x 10^8. Are products or reactants favored?",a:"Products are heavily favored. Keq much greater than 1 means high product concentration at equilibrium"},{q:"Why is water not included in the Keq expression for aqueous reactions?",a:"Pure liquids (and pure solids) have constant concentration and are not included in Keq"},{q:"At equilibrium, are the forward and reverse reactions still occurring?",a:"Yes. Both reactions continue at equal rates. Concentrations are constant because formation and consumption balance out"}] },
    { id:"eq2", title:"Le Chatelier's Principle", yt:"https://www.youtube.com/watch?v=rV9nTmNJqJE", ytLabel:"Professor Dave Explains", interactive:"eqShift",
      reading:["Le Chatelier's principle states: if a system at equilibrium is disturbed, it will shift to partially counteract the disturbance and re-establish equilibrium. Think of it as the system pushing back against any change you make.","Adding more reactant shifts equilibrium toward products (right). Removing reactant shifts toward reactants (left). Adding product shifts toward reactants (left). Removing product shifts toward products (right). The system always shifts away from whatever you added and toward whatever you removed.","For the reaction 2NO(g) + O2(g) \u21CC 2NO2(g), adding NO gas pushes the equilibrium to the right, making more NO2. This is a very common test question format.","Changing pressure affects gaseous equilibria. Increasing pressure (decreasing volume) shifts toward the side with fewer moles of gas. Decreasing pressure shifts toward the side with more moles. For 2NO + O2 \u21CC 2NO2 (3 moles gas on left, 2 on right), increasing pressure shifts right.","A catalyst does NOT shift equilibrium. It speeds up both the forward and reverse reactions equally, so equilibrium is reached faster but the final position does not change. Adding a catalyst does not change the amount of product at equilibrium.","Temperature changes depend on whether the reaction is exothermic or endothermic. For exothermic reactions, increasing temperature shifts left (toward reactants). For endothermic, increasing temperature shifts right (toward products). Think of heat as a product in exothermic and a reactant in endothermic."],
      practice:[{q:"2NO(g) + O2(g) \u21CC 2NO2(g). Which change increases NO2: remove NO, add NO, add catalyst, or remove O2?",a:"Add NO gas. Adding reactant shifts equilibrium toward products (right), making more NO2"},{q:"Does adding a catalyst change the amount of product at equilibrium?",a:"No. A catalyst speeds up both forward and reverse reactions equally. Equilibrium is reached faster but the position does not change"},{q:"N2 + 3H2 \u21CC 2NH3 is exothermic. What happens if you increase temperature?",a:"Shifts left (toward reactants). For exothermic reactions, heat is like a product. Adding heat shifts away from products"},{q:"2SO2 + O2 \u21CC 2SO3. If you increase pressure, which way does equilibrium shift?",a:"Right (toward products). Left has 3 moles of gas, right has 2. System shifts to the side with fewer moles of gas to reduce pressure"}] },
  ]},
  { id:"u10", title:"Kinetics & Reaction Rates", week:4, desc:"Collision theory, activation energy, factors affecting rate.", lectures:[
    { id:"kn1", title:"Reaction Rates & Collision Theory", yt:"https://www.youtube.com/watch?v=OttRV5ykP7A", ytLabel:"The Organic Chemistry Tutor", interactive:"activationE",
      reading:["Reaction rate measures how fast reactants are consumed or products are formed. It depends on several factors: temperature, concentration, surface area, and the presence of catalysts.","Collision theory explains why these factors matter. For a reaction to occur, reactant particles must (1) collide with each other, (2) collide with sufficient energy (equal to or greater than the activation energy), and (3) collide with the correct orientation.","Higher temperature increases reaction rate because molecules move faster, collide more frequently, and more collisions have energy equal to or greater than the activation energy. This is the most common test question on kinetics. The answer is NOT that concentration increases (temperature does not change concentration), but that more molecules have enough energy to react.","Higher concentration increases rate because there are more particles per unit volume, leading to more frequent collisions. Greater surface area (like grinding a solid into powder) exposes more reactant particles to collisions.","A catalyst lowers the activation energy, providing an alternative reaction pathway that requires less energy. More collisions then have sufficient energy to react. The catalyst is not consumed in the reaction. It speeds up both forward and reverse reactions equally."],
      practice:[{q:"Why does increasing temperature increase reaction rate?",a:"More reactants collide with energy equal to or greater than the activation energy. Molecules move faster and more collisions exceed the energy threshold"},{q:"A catalyst speeds up a reaction by:",a:"Lowering the activation energy. It provides an alternative pathway requiring less energy, so more collisions are effective"},{q:"Grinding a solid into powder increases reaction rate. Why?",a:"Greater surface area exposes more particles to collisions with other reactants"},{q:"Does a catalyst change the amount of product formed at equilibrium?",a:"No. A catalyst speeds up both forward and reverse reactions equally. It changes how fast equilibrium is reached, not where it is"}] },
  ]},
  { id:"u11", title:"Math Skills & Review", week:5, desc:"Sci notation, sig figs, logarithms, dimensional analysis, full review.", lectures:[
    { id:"x1", title:"Scientific Notation, Sig Figs & Logarithms", yt:"https://www.youtube.com/watch?v=eCJ76hz7jPM", ytLabel:"The Organic Chemistry Tutor",
      reading:["Scientific notation: coefficient (1-10) \u00d7 10^exponent. 0.00045 = 4.5\u00d710^-4. 6,020,000 = 6.02\u00d710^6. Multiply: multiply coefficients, add exponents. Divide: divide coefficients, subtract exponents.","Sig figs: nonzero digits count. Zeros between nonzero count. Leading zeros do not count. Trailing zeros after decimal count. 0.00302 = 3 sig figs. 0.04050 = 4 sig figs.","Dimensional analysis: multiply by conversion factors so units cancel. Write units at every step. If units do not cancel to your target, the setup is wrong. Example: 1.029 yd^3 to m^3 with 1m = 1.093 yd. Convert: 1.029 / (1.093)^3 = 1.029 / 1.306 = 0.788 m^3.","Logarithms appear on the test. The key rule: log(10^n) = n. So log(10^-13) = -13. log(10^4) = 4. log(10^0) = 0. You do not need to calculate complex logs by hand, just know that log base 10 of a power of 10 equals the exponent.","Combined calculation example from the practice test: (9.1 x 10^4)(1.1 x 10^-5)(log 10^-13)(1000). Step by step: 9.1 x 1.1 = 10.01. 10^4 x 10^-5 = 10^-1. log(10^-13) = -13. 1000 = 10^3. So: 10.01 x 10^-1 x (-13) x 10^3 = 10.01 x (-13) x 10^2 = -130.1 x 10^2 = -13010, approximately -13000."],
      practice:[{q:"Express 0.0067 in scientific notation",a:"6.7 \u00d7 10^-3"},{q:"(4.0\u00d710^5) / (2.0\u00d710^2) = ?",a:"2.0 \u00d7 10^3. Divide coefficients, subtract exponents"},{q:"What is log(10^-13)?",a:"-13. log(10^n) = n"},{q:"Calculate: (9.1 x 10^4)(1.1 x 10^-5)(log 10^-13)(1000)",a:"9.1 x 1.1 = ~10. 10^4 x 10^-5 = 10^-1. log(10^-13) = -13. 1000 = 10^3. Result: 10 x 10^-1 x (-13) x 10^3 = -13000"},{q:"Sig figs in 0.04050?",a:"4 sig figs (4, 0, 5, 0)"},{q:"Convert 1.029 yd^3 to m^3 (1m = 1.093 yd)",a:"1.029 / (1.093)^3 = 1.029 / 1.306 = 0.788 m^3"}] },
    { id:"x2", title:"Full Review & Test Strategy", yt:"https://www.youtube.com/watch?v=TBt4gvzHEW0", ytLabel:"The Organic Chemistry Tutor",
      reading:["The LBCC chemistry placement is 45 minutes, paper/pencil, no calculator. Pass places you into CHEM 1A, saving a full semester over CHEM 2.","Strategy: read carefully, write units at every step, check that answers make sense. Budget about 1 minute per question. Skip hard ones and come back.","Topics confirmed from the California Chemistry Diagnostic Test: scientific notation, unit conversions, compounds and elements, states of matter, reactions, structure of matter, periodic properties, solutions, equilibrium, kinetics, thermodynamics, lab skills, basic math and algebra.","Night before priorities: mole conversions, balancing equations, naming compounds, gas law calculations, Le Chatelier's principle, Lewis structures, and phase changes."],
      practice:[{q:"Molar mass of H2SO4? (H=1, S=32, O=16)",a:"2+32+64 = 98 g/mol"},{q:"Name Fe2(SO4)3",a:"Iron(III) sulfate. 3 sulfates = 6-, so Fe = 3+ each"},{q:"Balance: Al2(SO3)3 + HCl \u2192 AlCl3 + H2SO3. Smallest whole number coefficient for HCl?",a:"Al2(SO3)3 + 6HCl \u2192 2AlCl3 + 3H2SO3. Coefficient for HCl = 6"},{q:"Which element has exactly 5 electrons in the highest energy level: Se, Ba, P, or Ge?",a:"P (phosphorus). Config [Ne] 3s2 3p3. Highest energy level (3) has 2+3 = 5 electrons"},{q:"What volume of 1.5M NaOH provides 0.75 mol?",a:"V = mol/M = 0.75/1.5 = 0.5 L = 500 mL"},{q:"2NO(g) + O2(g) \u21CC 2NO2(g). What increases NO2: add NO, remove NO, add catalyst, or remove O2?",a:"Add NO. Adding reactant shifts equilibrium right, producing more NO2"},{q:"Which does not obey the octet rule: N2, NO, CF4, or Ar?",a:"NO. 11 total valence electrons (odd), nitrogen has only 7 electrons"}] },
  ]},
];

/* ══════════════════════════════════════════════════════════════════
   MODULE SHELL
   ══════════════════════════════════════════════════════════════════ */
function loadProgress() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}"); } catch { return {}; } }
function saveProgress(p) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {} }
const allLectures = UNITS.flatMap(u => u.lectures);
const totalLectures = allLectures.length;

function BackBtn({ onClick, label="Back" }) {
  return <button onClick={onClick} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 0", fontFamily:F.sans, fontSize:12, color:C.blue, display:"flex", alignItems:"center", gap:4 }}><span style={{ fontSize:14 }}>&larr;</span>{label}</button>;
}
function StatusBadge({ status }) {
  const s = {mastered:{bg:C.greenDim,color:C.green,l:"Mastered"},watched:{bg:C.goldDim,color:C.gold,l:"Watched"},none:{bg:"transparent",color:C.textLight,l:""}}[status]||{bg:"transparent",color:C.textLight,l:""};
  if(!s.l) return null;
  return <span style={{ fontSize:9, fontWeight:600, color:s.color, background:s.bg, padding:"2px 8px", borderRadius:3 }}>{s.l}</span>;
}

function LectureView({ lecture, status, onStatus, onBack }) {
  const Interactives = { periodic:PeriodicExplorer, shells:ElectronShells, balancer:BalancerGame, molemap:MoleMap, gasSim:GasLawSim, molarity:MolaritySim, heatingCurve:HeatingCurve, lewis:LewisHelper, eqShift:EquilibriumShift, activationE:ActivationEnergyDiagram };
  const Interactive = lecture.interactive ? Interactives[lecture.interactive] : null;
  const eqs = lecture.eqKey ? CHEM_EQUATIONS[lecture.eqKey] : null;
  const [showVideo, setShowVideo] = useState(false);
  // Extract YouTube video ID
  const ytId = lecture.yt ? lecture.yt.match(/[?&]v=([^&]+)/)?.[1] || "" : "";
  return (
    <div>
      <BackBtn onClick={onBack} label="Back to units" />
      <div style={{ marginTop:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
          <h2 style={{ fontSize:18, fontWeight:600, color:C.text, margin:0, flex:1 }}>{lecture.title}</h2>
          <StatusBadge status={status} />
        </div>
        {/* Mini YouTube Player */}
        {ytId && !showVideo && (
          <button onClick={()=>setShowVideo(true)} style={{
            display:"flex", alignItems:"center", gap:8, width:"100%", marginTop:10, marginBottom:16,
            padding:"10px 14px", background:C.redDim, borderRadius:8, border:`1px solid rgba(248,113,113,0.2)`,
            color:C.red, fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:F.sans,
          }}>
            <span style={{ fontSize:16 }}>&#9654;</span>
            <span>Watch: {lecture.title}</span>
            <span style={{ fontSize:10, color:C.textDim, marginLeft:"auto" }}>{lecture.ytLabel}</span>
          </button>
        )}
        {ytId && showVideo && (
          <div style={{ marginTop:10, marginBottom:16, borderRadius:8, overflow:"hidden", border:`1px solid ${C.border}`, background:"#000" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 10px", background:C.panel }}>
              <span style={{ fontSize:10, color:C.textDim, fontWeight:500 }}>{lecture.ytLabel}</span>
              <div style={{ display:"flex", gap:6 }}>
                <a href={lecture.yt} target="_blank" rel="noopener noreferrer" style={{ fontSize:10, color:C.blue, textDecoration:"none" }}>Open in YouTube</a>
                <button onClick={()=>setShowVideo(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:C.textDim, padding:0 }}>\u2715</button>
              </div>
            </div>
            <div style={{ position:"relative", paddingBottom:"56.25%", height:0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?rel=0`}
                style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", border:"none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
        {/* Reading */}
        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:10, fontWeight:600, color:C.textDim, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 10px" }}>Reading</p>
          <div style={{ padding:"14px 16px", background:C.panel, borderRadius:8, border:`1px solid ${C.border}` }}>
            {lecture.reading.map((para,i) => <p key={i} style={{ fontSize:13, color:C.textMid, lineHeight:1.8, margin:i===0?"0":"12px 0 0" }}>{para}</p>)}
          </div>
        </div>
        {Interactive && <Interactive />}
        {eqs && <EquationExplorer equations={eqs} />}
        <Practice questions={lecture.practice} />
        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14, marginTop:16, display:"flex", gap:8 }}>
          <button onClick={()=>onStatus("watched")} style={{ flex:1, padding:"10px 0", borderRadius:6, border:`1px solid ${status==="watched"?C.gold:C.border}`, background:status==="watched"?C.goldDim:C.panel, fontFamily:F.sans, fontSize:12, color:status==="watched"?C.gold:C.textDim, cursor:"pointer", fontWeight:500 }}>Mark Watched</button>
          <button onClick={()=>onStatus("mastered")} style={{ flex:1, padding:"10px 0", borderRadius:6, border:`1px solid ${status==="mastered"?C.green:C.border}`, background:status==="mastered"?C.greenDim:C.panel, fontFamily:F.sans, fontSize:12, color:status==="mastered"?C.green:C.textDim, cursor:"pointer", fontWeight:500 }}>Mark Mastered</button>
        </div>
      </div>
    </div>
  );
}

export default function ChemPlacement({ onBack, startUnit }) {
  const [progress, setProgress] = useState(loadProgress);
  const [activeLecture, setActiveLecture] = useState(null);
  const [expandedUnit, setExpandedUnit] = useState(startUnit || null);
  const updateStatus = useCallback((id,s) => { setProgress(prev => { const next={...prev,[id]:s}; saveProgress(next); return next; }); }, []);
  const masteredCount = Object.values(progress).filter(v=>v==="mastered").length;

  if (activeLecture) {
    const lec = allLectures.find(l=>l.id===activeLecture);
    if(!lec){setActiveLecture(null);return null;}
    return (
      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:F.sans }}>
        <div style={{ maxWidth:660, margin:"0 auto", padding:"24px 24px 48px" }}>
          <LectureView lecture={lec} status={progress[lec.id]||"none"} onStatus={s=>updateStatus(lec.id,s)} onBack={()=>setActiveLecture(null)} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:F.sans }}>
      <div style={{ maxWidth:660, margin:"0 auto", padding:"24px 24px 48px" }}>
        <BackBtn onClick={onBack} label="Home" />
        <div style={{ marginTop:12, marginBottom:20 }}>
          <p style={{ fontSize:10, fontWeight:600, color:C.silver, letterSpacing:3, textTransform:"uppercase", margin:"0 0 4px" }}>Chemistry Placement</p>
          <h1 style={{ fontSize:22, fontWeight:600, color:C.text, margin:"0 0 6px" }}>CHEM 1A Prep</h1>
          <p style={{ fontSize:12, color:C.textDim, margin:"0 0 14px", lineHeight:1.6 }}>5 week study plan. 45 min test, paper/pencil, no calculator. Pass to skip CHEM 2.</p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flex:1, height:3, background:C.border, borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(masteredCount/totalLectures)*100}%`, background:C.green, borderRadius:2, transition:"width 0.4s" }} />
            </div>
            <span style={{ fontFamily:F.mono, fontSize:10, color:C.textDim }}>{masteredCount}/{totalLectures}</span>
          </div>
        </div>
        {UNITS.map((unit, unitIdx) => {
          const um = unit.lectures.filter(l=>progress[l.id]==="mastered").length;
          const unitComplete = um === unit.lectures.length;
          const isExp = expandedUnit===unit.id;
          const isTarget = startUnit === unit.id;
          const nextUnit = unitComplete ? UNITS[unitIdx + 1] : null;
          // When startUnit is set, dim non-target units
          const dimmed = startUnit && !isTarget;
          return (
            <div key={unit.id} style={{ marginBottom:8, opacity: dimmed ? 0.4 : 1, transition: "opacity 0.3s" }}>
              <div onClick={()=>setExpandedUnit(isExp?null:unit.id)} style={{ padding:"12px 14px", background: unitComplete ? C.greenDim : C.panel, borderRadius:isExp?"8px 8px 0 0":8, border:`1px solid ${unitComplete ? C.green : C.border}`, cursor:"pointer" }} onMouseEnter={e=>{ if(!unitComplete) e.currentTarget.style.borderColor=C.blue; }} onMouseLeave={e=>{ if(!unitComplete) e.currentTarget.style.borderColor=C.border; }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:9, fontFamily:F.mono, color:C.textDim, background:C.blueDim, padding:"2px 6px", borderRadius:3 }}>W{unit.week}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:550, color:C.text }}>{unit.title}</div>
                    <div style={{ fontSize:11, color:C.textDim, marginTop:2 }}>{unit.desc}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:F.mono, fontSize:10, color: unitComplete ? C.green : C.textDim }}>{unitComplete ? "\u2713 " : ""}{um}/{unit.lectures.length}</div>
                    <div style={{ width:50, height:2, background:C.border, borderRadius:1, marginTop:4, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${(um/unit.lectures.length)*100}%`, background:C.green, transition:"width 0.3s" }} />
                    </div>
                  </div>
                  <span style={{ color:C.textLight, fontSize:12, transition:"transform 0.2s", transform:isExp?"rotate(90deg)":"none" }}>&#9656;</span>
                </div>
              </div>
              {isExp && (
                <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderTop:"none", borderRadius:"0 0 8px 8px", padding:"4px 0" }}>
                  {unit.lectures.map(lec => {
                    const st = progress[lec.id]||"none";
                    return (
                      <div key={lec.id} onClick={()=>setActiveLecture(lec.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", cursor:"pointer", transition:"background 0.1s" }} onMouseEnter={e=>e.currentTarget.style.background=C.blueDim} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <div style={{ width:6, height:6, borderRadius:3, flexShrink:0, background:st==="mastered"?C.green:st==="watched"?C.gold:C.border }} />
                        <span style={{ flex:1, fontSize:13, color:C.text }}>{lec.title}</span>
                        <StatusBadge status={st} />
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Section complete prompt */}
              {unitComplete && isExp && (
                <div style={{ padding:"12px 16px", background:C.greenDim, borderRadius:"0 0 8px 8px", border:`1px solid ${C.green}`, borderTop:"none", textAlign:"center" }}>
                  <p style={{ fontSize:13, fontWeight:600, color:C.green, margin:"0 0 6px" }}>Section complete!</p>
                  {nextUnit ? (
                    <button onClick={()=>setExpandedUnit(nextUnit.id)} style={{
                      padding:"8px 20px", borderRadius:6, background:C.green, border:"none",
                      color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:F.sans,
                    }}>Move to: {nextUnit.title}</button>
                  ) : (
                    <p style={{ fontSize:12, color:C.green, margin:0 }}>All sections done. You are ready for the test.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div style={{ marginTop:20, padding:14, background:C.goldDim, borderRadius:8, border:`1px solid rgba(251,191,36,0.15)` }}>
          <p style={{ fontSize:10, fontWeight:600, color:C.gold, letterSpacing:2, textTransform:"uppercase", margin:"0 0 6px" }}>Test Day</p>
          <div style={{ fontSize:12, color:C.textMid, lineHeight:1.7 }}>
            <p style={{ margin:"0 0 4px" }}>Bring valid photo ID. No exceptions.</p>
            <p style={{ margin:"0 0 4px" }}>No calculator. Practice all math by hand.</p>
            <p style={{ margin:"0 0 4px" }}>45 minutes. About 1 minute per question.</p>
            <p style={{ margin:0 }}>Schedule: (562) 938-4049, Mon through Thu, 7:30 AM to 6:00 PM.</p>
          </div>
        </div>
        <p style={{ textAlign:"center", fontSize:9, color:C.textLight, letterSpacing:1.5, paddingTop:20 }}>TELPO CHEM PLACEMENT v2.0</p>
      </div>
    </div>
  );
}
