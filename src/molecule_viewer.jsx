import { useState } from "react";
import { C, F } from "./shared_ui";

/*
 * Molecule Viewer for Telpo
 * Preset compounds with Lewis structure SVGs
 * Bond types, lone pairs, geometry, polarity
 * Reaction combiner for common reactions
 */

// ── Molecule Library ──
// Each molecule: { formula, name, atoms[], bonds[], lonePairs[], ve, geometry, polar, octet, notes }
// atoms: [{sym, x, y, charge?}]  bonds: [{from, to, order}]  lonePairs: [{atom, positions:[[dx,dy],...]}]
const MOLECULES = [
  // ── Simple molecules ──
  { id:"h2o", formula:"H\u2082O", name:"Water", ve:8, geometry:"Bent (104.5\u00B0)", polar:true, octet:true,
    bondType:"Covalent", notes:"2 bonding pairs + 2 lone pairs on O give bent shape. Polar due to asymmetry.",
    atoms:[{sym:"O",x:150,y:80},{sym:"H",x:80,y:140},{sym:"H",x:220,y:140}],
    bonds:[{from:0,to:1,order:1},{from:0,to:2,order:1}],
    lonePairs:[{atom:0,positions:[[-12,-25],[12,-25]]}] },
  { id:"co2", formula:"CO\u2082", name:"Carbon Dioxide", ve:16, geometry:"Linear (180\u00B0)", polar:false, octet:true,
    bondType:"Covalent", notes:"Two double bonds. Linear = symmetric = nonpolar despite polar C=O bonds.",
    atoms:[{sym:"O",x:60,y:100},{sym:"C",x:150,y:100},{sym:"O",x:240,y:100}],
    bonds:[{from:0,to:1,order:2},{from:1,to:2,order:2}],
    lonePairs:[{atom:0,positions:[[-25,-10],[-25,10]]},{atom:2,positions:[[25,-10],[25,10]]}] },
  { id:"nh3", formula:"NH\u2083", name:"Ammonia", ve:8, geometry:"Trigonal Pyramidal", polar:true, octet:true,
    bondType:"Covalent", notes:"3 bonding pairs + 1 lone pair. Pyramidal shape makes it polar. Acts as a base.",
    atoms:[{sym:"N",x:150,y:80},{sym:"H",x:80,y:150},{sym:"H",x:150,y:160},{sym:"H",x:220,y:150}],
    bonds:[{from:0,to:1,order:1},{from:0,to:2,order:1},{from:0,to:3,order:1}],
    lonePairs:[{atom:0,positions:[[0,-30]]}] },
  { id:"ch4", formula:"CH\u2084", name:"Methane", ve:8, geometry:"Tetrahedral (109.5\u00B0)", polar:false, octet:true,
    bondType:"Covalent", notes:"4 bonding pairs, no lone pairs. Perfect tetrahedral. Nonpolar (symmetric).",
    atoms:[{sym:"C",x:150,y:100},{sym:"H",x:90,y:50},{sym:"H",x:210,y:50},{sym:"H",x:80,y:155},{sym:"H",x:220,y:155}],
    bonds:[{from:0,to:1,order:1},{from:0,to:2,order:1},{from:0,to:3,order:1},{from:0,to:4,order:1}],
    lonePairs:[] },
  { id:"n2", formula:"N\u2082", name:"Nitrogen Gas", ve:10, geometry:"Linear", polar:false, octet:true,
    bondType:"Covalent", notes:"Triple bond. Very strong (945 kJ/mol). Makes up 78% of atmosphere.",
    atoms:[{sym:"N",x:110,y:100},{sym:"N",x:190,y:100}],
    bonds:[{from:0,to:1,order:3}],
    lonePairs:[{atom:0,positions:[[-25,0]]},{atom:1,positions:[[25,0]]}] },
  { id:"o2", formula:"O\u2082", name:"Oxygen Gas", ve:12, geometry:"Linear", polar:false, octet:true,
    bondType:"Covalent", notes:"Double bond. Essential for combustion and respiration.",
    atoms:[{sym:"O",x:110,y:100},{sym:"O",x:190,y:100}],
    bonds:[{from:0,to:1,order:2}],
    lonePairs:[{atom:0,positions:[[-25,-10],[-25,10]]},{atom:1,positions:[[25,-10],[25,10]]}] },
  { id:"hcl", formula:"HCl", name:"Hydrochloric Acid", ve:8, geometry:"Linear", polar:true, octet:true,
    bondType:"Covalent (polar)", notes:"Polar covalent bond. H is \u03B4+ and Cl is \u03B4-. Strong acid in water.",
    atoms:[{sym:"H",x:100,y:100},{sym:"Cl",x:200,y:100}],
    bonds:[{from:0,to:1,order:1}],
    lonePairs:[{atom:1,positions:[[28,-12],[28,12],[0,-25]]}] },
  // ── Octet exceptions ──
  { id:"bf3", formula:"BF\u2083", name:"Boron Trifluoride", ve:24, geometry:"Trigonal Planar (120\u00B0)", polar:false, octet:false,
    bondType:"Covalent", notes:"INCOMPLETE OCTET: B has only 6 electrons. Exception to octet rule. Planar = nonpolar.",
    atoms:[{sym:"B",x:150,y:100},{sym:"F",x:150,y:40},{sym:"F",x:85,y:145},{sym:"F",x:215,y:145}],
    bonds:[{from:0,to:1,order:1},{from:0,to:2,order:1},{from:0,to:3,order:1}],
    lonePairs:[{atom:1,positions:[[-15,-15],[15,-15],[0,-25]]},{atom:2,positions:[[-25,5],[-18,18],[-5,25]]},{atom:3,positions:[[25,5],[18,18],[5,25]]}] },
  { id:"no", formula:"NO", name:"Nitric Oxide", ve:11, geometry:"Linear", polar:true, octet:false,
    bondType:"Covalent", notes:"ODD ELECTRON molecule (11 e-). Radical. N has only 7 electrons. Exception to octet rule.",
    atoms:[{sym:"N",x:110,y:100},{sym:"O",x:200,y:100}],
    bonds:[{from:0,to:1,order:2}],
    lonePairs:[{atom:0,positions:[[-25,0]]},{atom:1,positions:[[25,-10],[25,10]]}] },
  { id:"sf6", formula:"SF\u2086", name:"Sulfur Hexafluoride", ve:48, geometry:"Octahedral", polar:false, octet:false,
    bondType:"Covalent", notes:"EXPANDED OCTET: S has 12 electrons around it. Possible because S is in period 3 (has d orbitals).",
    atoms:[{sym:"S",x:150,y:110},{sym:"F",x:150,y:40},{sym:"F",x:150,y:180},{sym:"F",x:75,y:110},{sym:"F",x:225,y:110},{sym:"F",x:100,y:55},{sym:"F",x:200,y:165}],
    bonds:[{from:0,to:1,order:1},{from:0,to:2,order:1},{from:0,to:3,order:1},{from:0,to:4,order:1},{from:0,to:5,order:1},{from:0,to:6,order:1}],
    lonePairs:[] },
  // ── Ionic compounds ──
  { id:"nacl", formula:"NaCl", name:"Sodium Chloride", ve:0, geometry:"Ionic lattice", polar:false, octet:true,
    bondType:"Ionic", notes:"Na loses 1e\u207B \u2192 Na\u207A. Cl gains 1e\u207B \u2192 Cl\u207B. Electrostatic attraction forms crystal lattice.",
    atoms:[{sym:"Na",x:110,y:100,charge:"+"},{ sym:"Cl",x:200,y:100,charge:"\u2212"}],
    bonds:[{from:0,to:1,order:0}],
    lonePairs:[] },
  { id:"mgcl2", formula:"MgCl\u2082", name:"Magnesium Chloride", ve:0, geometry:"Ionic lattice", polar:false, octet:true,
    bondType:"Ionic", notes:"Mg loses 2e\u207B \u2192 Mg\u00B2\u207A. Each Cl gains 1e\u207B \u2192 Cl\u207B. Formula: crisscross charges.",
    atoms:[{sym:"Cl",x:60,y:100,charge:"\u2212"},{sym:"Mg",x:150,y:100,charge:"2+"},{sym:"Cl",x:240,y:100,charge:"\u2212"}],
    bonds:[{from:0,to:1,order:0},{from:1,to:2,order:0}],
    lonePairs:[] },
  // ── Polyatomic ions ──
  { id:"so4", formula:"SO\u2084\u00B2\u207B", name:"Sulfate Ion", ve:32, geometry:"Tetrahedral", polar:false, octet:false,
    bondType:"Covalent (polyatomic ion)", notes:"Central S with 4 oxygens. Charge is 2-. Common in ionic compounds like Na\u2082SO\u2084.",
    atoms:[{sym:"S",x:150,y:100},{sym:"O",x:150,y:40},{sym:"O",x:220,y:100},{sym:"O",x:150,y:160},{sym:"O",x:80,y:100}],
    bonds:[{from:0,to:1,order:2},{from:0,to:2,order:1},{from:0,to:3,order:2},{from:0,to:4,order:1}],
    lonePairs:[{atom:2,positions:[[25,-10],[25,10]]},{atom:4,positions:[[-25,-10],[-25,10]]}] },
  { id:"no3", formula:"NO\u2083\u207B", name:"Nitrate Ion", ve:24, geometry:"Trigonal Planar", polar:false, octet:true,
    bondType:"Covalent (polyatomic ion)", notes:"Resonance structure. Charge is 1-. In compounds like NaNO\u2083, Ca(NO\u2083)\u2082.",
    atoms:[{sym:"N",x:150,y:90},{sym:"O",x:150,y:35},{sym:"O",x:90,y:135},{sym:"O",x:210,y:135}],
    bonds:[{from:0,to:1,order:2},{from:0,to:2,order:1},{from:0,to:3,order:1}],
    lonePairs:[{atom:2,positions:[[-22,10],[-15,22]]},{atom:3,positions:[[22,10],[15,22]]}] },
  { id:"nh4", formula:"NH\u2084\u207A", name:"Ammonium Ion", ve:8, geometry:"Tetrahedral", polar:false, octet:true,
    bondType:"Covalent (polyatomic ion)", notes:"Only common POSITIVE polyatomic ion. Formed when NH\u2083 gains H\u207A.",
    atoms:[{sym:"N",x:150,y:100},{sym:"H",x:150,y:45},{sym:"H",x:210,y:130},{sym:"H",x:150,y:160},{sym:"H",x:90,y:130}],
    bonds:[{from:0,to:1,order:1},{from:0,to:2,order:1},{from:0,to:3,order:1},{from:0,to:4,order:1}],
    lonePairs:[] },
  { id:"oh", formula:"OH\u207B", name:"Hydroxide Ion", ve:8, geometry:"Linear", polar:true, octet:true,
    bondType:"Covalent (polyatomic ion)", notes:"Charge is 1-. Found in bases like NaOH, KOH, Ca(OH)\u2082.",
    atoms:[{sym:"O",x:130,y:100},{sym:"H",x:200,y:100}],
    bonds:[{from:0,to:1,order:1}],
    lonePairs:[{atom:0,positions:[[-25,-12],[-25,12],[0,-25]]}] },
];

// ── Reaction presets ──
const REACTIONS = [
  { id:"r1", eq:"NH\u2083 + HNO\u2083 \u2192 NH\u2084NO\u2083", name:"Ammonia + Nitric Acid", type:"Acid-base",
    reactants:["nh3","hcl"], product:"nh4",
    notes:"Ammonia (base) accepts H\u207A from nitric acid. Forms ammonium nitrate (ionic compound). This is a neutralization reaction." },
  { id:"r2", eq:"Na + Cl \u2192 NaCl", name:"Sodium + Chlorine", type:"Synthesis (ionic)",
    reactants:["na","cl"], product:"nacl",
    notes:"Na loses 1 electron \u2192 Na\u207A. Cl gains 1 electron \u2192 Cl\u207B. Opposite charges attract = ionic bond." },
  { id:"r3", eq:"2H\u2082 + O\u2082 \u2192 2H\u2082O", name:"Hydrogen + Oxygen", type:"Synthesis (combustion)",
    reactants:["h2","o2"], product:"h2o",
    notes:"Hydrogen gas burns in oxygen. Highly exothermic. Each H shares electrons with O (covalent bonds)." },
  { id:"r4", eq:"CH\u2084 + 2O\u2082 \u2192 CO\u2082 + 2H\u2082O", name:"Methane Combustion", type:"Combustion",
    reactants:["ch4","o2"], product:"co2",
    notes:"Complete combustion of a hydrocarbon. Products are always CO\u2082 + H\u2082O. Exothermic." },
];

const CATEGORIES = [
  { label: "Simple Molecules", ids: ["h2o","co2","nh3","ch4","n2","o2","hcl"] },
  { label: "Octet Exceptions", ids: ["bf3","no","sf6"] },
  { label: "Ionic Compounds", ids: ["nacl","mgcl2"] },
  { label: "Polyatomic Ions", ids: ["so4","no3","nh4","oh"] },
];

// ── SVG Lewis Structure Renderer ──
function LewisStructureSVG({ mol }) {
  if (!mol) return null;
  const bondOffset = { 1: [0], 2: [-3, 3], 3: [-4, 0, 4] };
  return (
    <svg viewBox="0 0 300 200" style={{ width: "100%", maxWidth: 300, display: "block", margin: "0 auto" }}>
      {/* Bonds */}
      {mol.bonds.map((b, i) => {
        const a1 = mol.atoms[b.from], a2 = mol.atoms[b.to];
        if (b.order === 0) {
          // Ionic bond - dashed line
          return <line key={`b${i}`} x1={a1.x} y1={a1.y} x2={a2.x} y2={a2.y} stroke="#5a5c66" strokeWidth="1" strokeDasharray="4 3" />;
        }
        const dx = a2.x - a1.x, dy = a2.y - a1.y;
        const len = Math.sqrt(dx*dx + dy*dy) || 1;
        const nx = -dy/len, ny = dx/len;
        return bondOffset[b.order].map((off, j) => (
          <line key={`b${i}-${j}`} x1={a1.x + nx*off} y1={a1.y + ny*off} x2={a2.x + nx*off} y2={a2.y + ny*off}
            stroke="#6a7fa8" strokeWidth="2" strokeLinecap="round" />
        ));
      })}
      {/* Lone pairs */}
      {mol.lonePairs.map((lp, i) => {
        const a = mol.atoms[lp.atom];
        return lp.positions.map((p, j) => (
          <circle key={`lp${i}-${j}`} cx={a.x + p[0]} cy={a.y + p[1]} r="2.5" fill="#a78bfa" opacity="0.7" />
        ));
      })}
      {/* Atoms */}
      {mol.atoms.map((a, i) => (
        <g key={`a${i}`}>
          <circle cx={a.x} cy={a.y} r="18" fill="rgba(20,24,33,0.9)" stroke={a.charge ? (a.charge.includes("+") ? "#f87171" : "#60a5fa") : "#6a7fa8"} strokeWidth="1.5" />
          <text x={a.x} y={a.y + 1} textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="700"
            fill={a.charge ? (a.charge.includes("+") ? "#f87171" : "#60a5fa") : "#d4d2cb"} fontFamily="'IBM Plex Sans',system-ui,sans-serif">
            {a.sym}
          </text>
          {a.charge && (
            <text x={a.x + 14} y={a.y - 12} textAnchor="middle" fontSize="10" fontWeight="700"
              fill={a.charge.includes("+") ? "#f87171" : "#60a5fa"} fontFamily="'IBM Plex Mono',monospace">
              {a.charge}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ── Main Component ──
export default function MoleculeViewer() {
  const [selectedId, setSelectedId] = useState("h2o");
  const [tab, setTab] = useState("molecules"); // "molecules" | "reactions"
  const mol = MOLECULES.find(m => m.id === selectedId);

  return (
    <div style={{ margin: "12px 0" }}>
      {/* Tab toggle */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {[["molecules","Molecules"],["reactions","Reactions"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "5px 14px", borderRadius: 5, fontSize: 11, cursor: "pointer", fontFamily: F.sans,
            background: tab === k ? "rgba(96,165,250,0.12)" : "transparent",
            border: `1px solid ${tab === k ? "#60a5fa" : C.border}`,
            color: tab === k ? "#60a5fa" : C.textDim, fontWeight: tab === k ? 600 : 400,
          }}>{l}</button>
        ))}
      </div>

      {tab === "molecules" && (
        <>
          {/* Category selector */}
          {CATEGORIES.map(cat => (
            <div key={cat.label} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 9, fontWeight: 600, color: C.textDim, letterSpacing: 1.2, textTransform: "uppercase", margin: "0 0 4px" }}>{cat.label}</p>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {cat.ids.map(id => {
                  const m = MOLECULES.find(x => x.id === id);
                  if (!m) return null;
                  const active = selectedId === id;
                  return (
                    <button key={id} onClick={() => setSelectedId(id)} style={{
                      padding: "4px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: F.mono,
                      background: active ? "rgba(96,165,250,0.15)" : "transparent",
                      border: `1px solid ${active ? "#60a5fa" : C.border}`,
                      color: active ? "#60a5fa" : C.textDim,
                      fontWeight: active ? 600 : 400,
                    }}>{m.formula}</button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Lewis structure display */}
          {mol && (
            <div style={{ marginTop: 10, padding: 16, borderRadius: 8, background: "rgba(10,12,18,0.5)", border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#d4d2cb" }}>{mol.formula}</span>
                <span style={{ fontSize: 14, color: C.textMid }}>{mol.name}</span>
                {!mol.octet && <span style={{ fontSize: 9, fontWeight: 700, color: "#f87171", background: "rgba(248,113,113,0.12)", padding: "2px 6px", borderRadius: 3 }}>OCTET EXCEPTION</span>}
              </div>

              {/* SVG Lewis structure */}
              <div style={{ background: "rgba(10,12,18,0.4)", borderRadius: 8, padding: "12px 0", marginBottom: 12 }}>
                <LewisStructureSVG mol={mol} />
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: C.textDim }}>
                    <span style={{ display: "inline-block", width: 12, height: 2, background: "#6a7fa8", borderRadius: 1 }} /> Bond
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: C.textDim }}>
                    <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#a78bfa" }} /> Lone pair
                  </span>
                </div>
              </div>

              {/* Properties grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 12, color: C.textMid, marginBottom: 10 }}>
                <span>Bond type: <b style={{ color: mol.bondType.includes("Ionic") ? "#f87171" : "#60a5fa" }}>{mol.bondType}</b></span>
                <span>Valence e{"\u207B"}: <b style={{ color: "#d4d2cb" }}>{mol.ve}</b></span>
                <span>Geometry: <b style={{ color: "#d4d2cb" }}>{mol.geometry}</b></span>
                <span>Polar: <b style={{ color: mol.polar ? "#fbbf24" : "#34d399" }}>{mol.polar ? "Yes" : "No"}</b></span>
                <span>Octet rule: <b style={{ color: mol.octet ? "#34d399" : "#f87171" }}>{mol.octet ? "Obeyed" : "Exception"}</b></span>
              </div>

              <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{mol.notes}</p>
            </div>
          )}
        </>
      )}

      {tab === "reactions" && (
        <div>
          {REACTIONS.map(rxn => (
            <div key={rxn.id} style={{
              marginBottom: 8, padding: 14, borderRadius: 8,
              background: "rgba(10,12,18,0.5)", border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#d4d2cb", fontFamily: F.mono }}>{rxn.eq}</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "#60a5fa", background: "rgba(96,165,250,0.1)", padding: "2px 8px", borderRadius: 3 }}>{rxn.type}</span>
                <span style={{ fontSize: 10, color: C.textDim }}>{rxn.name}</span>
              </div>
              <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{rxn.notes}</p>
              {/* Show product structure */}
              {rxn.product && MOLECULES.find(m => m.id === rxn.product) && (
                <div style={{ marginTop: 8, padding: 8, background: "rgba(10,12,18,0.3)", borderRadius: 6 }}>
                  <p style={{ fontSize: 9, color: C.textDim, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 4px" }}>Product structure</p>
                  <LewisStructureSVG mol={MOLECULES.find(m => m.id === rxn.product)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
