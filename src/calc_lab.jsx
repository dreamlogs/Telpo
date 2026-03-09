import { useState, useEffect, useRef, useCallback } from "react";
import { C, F, Slider, Tip, CanvasGraph, Practice, EquationExplorer, CALC_EQUATIONS } from "./shared_ui";

// ════════════════════════════════════════════════════════════
//  TELPO — Calculus Learning Platform
// ════════════════════════════════════════════════════════════

const STORAGE_KEY = "telpo-calc-v1";
function loadProgress() { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; } }
function saveProgress(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }

// ─── CURRICULUM ─────────────────────────────────────────────
const UNITS = [
  { id: "u0", title: "Precalculus Review", lectures: [
    { id: "0.1", title: "Lines, Angle of Inclination, Distance Formula", yt: "https://youtube.com/watch?v=fYyARMqiaag", duration: "48:58", hasViz: true, vizType: "lines", questions: [
      { q: "Find the slope of the line through (2, 5) and (6, 13).", a: "m = (13 - 5)/(6 - 2) = 8/4 = 2" },
      { q: "A line has slope 3. What is its angle of inclination?", a: "theta = arctan(3) = 71.57 degrees" },
      { q: "Find the distance between (-1, 4) and (3, 1).", a: "d = sqrt((3-(-1))^2 + (1-4)^2) = sqrt(16+9) = sqrt(25) = 5" },
      { q: "Write the equation of a line with slope -2 through (1, 3).", a: "y - 3 = -2(x - 1) -> y = -2x + 5" },
    ]},
    { id: "0.2", title: "Introduction to Functions", yt: "https://youtube.com/watch?v=1EGf1JNBLSg", duration: "1:37:06", hasViz: true, vizType: "functions", questions: [
      { q: "Find the domain of f(x) = sqrt(x - 3).", a: "x - 3 >= 0 -> x >= 3. Domain: [3, infinity)" },
      { q: "If f(x) = 2x + 1, find f(-3).", a: "f(-3) = 2(-3) + 1 = -5" },
      { q: "Does y^2 = x define y as a function of x?", a: "No. For x = 4, y = 2 or y = -2. Fails vertical line test." },
      { q: "Find the range of f(x) = x^2 + 1.", a: "x^2 >= 0, so x^2 + 1 >= 1. Range: [1, infinity)" },
    ]},
    { id: "0.3", title: "Trigonometry and Graphing Trig Functions", yt: "https://youtube.com/watch?v=HZEvtMMGhgQ", duration: "1:20:15", hasViz: true, vizType: "trig", questions: [
      { q: "Convert 150 degrees to radians.", a: "150 * pi/180 = 5pi/6" },
      { q: "What is sin(pi/3)?", a: "sqrt(3)/2 = 0.866" },
      { q: "What is the period of y = 3sin(2x)?", a: "Period = 2pi/2 = pi" },
    ]},
    { id: "0.4", title: "Combining and Composition of Functions", yt: "https://youtube.com/watch?v=hZfaNe5Kv5I", duration: "15:53", hasViz: true, vizType: "composition", questions: [
      { q: "If f(x) = x^2 and g(x) = x + 1, find (f o g)(2).", a: "g(2) = 3, f(3) = 9" },
      { q: "Find (f + g)(x) if f(x) = 3x and g(x) = x^2.", a: "3x + x^2" },
    ]},
  ]},
  { id: "u1", title: "Limits and Continuity", lectures: [
    { id: "1.1", title: "An Introduction to Limits", yt: "https://youtube.com/watch?v=VSqOZNULRjQ", duration: "1:27:26", hasViz: true, vizType: "limits_intro", questions: [
      { q: "Evaluate lim(x->3) (x^2 - 9)/(x - 3).", a: "Factor: (x-3)(x+3)/(x-3) = x+3. Limit = 6" },
      { q: "Does lim(x->0) |x|/x exist?", a: "Left = -1, Right = +1. DNE." },
    ]},
    { id: "1.2", title: "Properties of Limits", yt: "https://youtube.com/watch?v=xMlGkMEfKtY", duration: "3:00:15", hasViz: true, vizType: "limit_laws", questions: [
      { q: "lim f(x) = 4, lim g(x) = -2. Find lim [f(x)*g(x)].", a: "4 * (-2) = -8" },
      { q: "Evaluate lim(x->0) sin(x)/x.", a: "1" },
    ]},
    { id: "1.4", title: "Continuity of Functions", yt: "https://youtube.com/watch?v=joewRl1CTL8", duration: "1:26:51", hasViz: true, vizType: "continuity", questions: [
      { q: "Three conditions for continuity at x = a?", a: "1) f(a) exists. 2) lim f(x) exists. 3) lim f(x) = f(a)" },
    ]},
    { id: "1.5", title: "Slope of a Curve, Velocity, Rates of Change", yt: "https://youtube.com/watch?v=tEVJNIhWNEg", duration: "1:50:43", hasViz: true, vizType: "secant_tangent", questions: [
      { q: "Average rate of change of f(x) = x^2 from x=1 to x=3?", a: "(9 - 1)/(3 - 1) = 8/2 = 4" },
    ]},
  ]},
  { id: "u2", title: "Differentiation", lectures: [
    { id: "2.1", title: "Introduction to the Derivative", yt: "https://youtube.com/watch?v=62bkNYKbFME", duration: "1:16:01", hasViz: true, vizType: "derivative_def", questions: [
      { q: "Find f'(x) from definition for f(x) = x^2.", a: "lim(h->0) [(x+h)^2 - x^2]/h = lim 2xh+h^2/h = 2x" },
      { q: "What does f'(a) represent geometrically?", a: "Slope of the tangent line at x = a" },
    ]},
    { id: "2.2", title: "Techniques of Differentiation", yt: "https://youtube.com/watch?v=t3HjMCJNwCE", duration: "1:12:31", hasViz: true, vizType: "diff_rules", questions: [
      { q: "d/dx [x^5 - 3x^2 + 7]", a: "5x^4 - 6x" },
      { q: "d/dx [4*sqrt(x)]", a: "2/sqrt(x)" },
    ]},
    { id: "2.3", title: "Product and Quotient Rules", yt: "https://youtube.com/watch?v=7aSx1VReb7E", duration: "1:02:22", hasViz: true, vizType: "product_quotient", questions: [
      { q: "State the product rule.", a: "(fg)' = f'g + fg'" },
      { q: "d/dx [x^2 * sin(x)]", a: "2x*sin(x) + x^2*cos(x)" },
    ]},
    { id: "2.4", title: "Applications of the Derivative", yt: "https://youtube.com/watch?v=N7Zil9q4ZYk", duration: "40:39", hasViz: false, questions: [] },
    { id: "2.5", title: "Derivatives of Trig Functions", yt: "https://youtube.com/watch?v=qFHn-MtOHEA", duration: "48:43", hasViz: true, vizType: "trig_derivs", questions: [
      { q: "d/dx [sin(x)]?", a: "cos(x)" },
      { q: "d/dx [tan(x)]?", a: "sec^2(x)" },
    ]},
    { id: "2.6", title: "The Chain Rule", yt: "https://youtube.com/watch?v=HaHsqDjWMLo", duration: "1:34:01", hasViz: true, vizType: "chain_rule", questions: [
      { q: "d/dx [sin(3x)]", a: "3cos(3x)" },
      { q: "d/dx [(x^2 + 1)^5]", a: "5(x^2+1)^4 * 2x = 10x(x^2 + 1)^4" },
    ]},
    { id: "2.7", title: "Implicit Differentiation", yt: "https://youtube.com/watch?v=2MfAzqIacvA", duration: "1:08:11", hasViz: true, vizType: "implicit", questions: [
      { q: "Find dy/dx for x^2 + y^2 = 25.", a: "2x + 2y(dy/dx) = 0 -> dy/dx = -x/y" },
    ]},
    { id: "2.8", title: "Related Rates", yt: "https://youtube.com/watch?v=43Qt3HqFsCk", duration: "53:52", hasViz: true, vizType: "related_rates", questions: [
      { q: "Circle radius grows at 2 cm/s. dA/dt when r = 5?", a: "dA/dt = 2*pi*r*(dr/dt) = 2*pi*5*2 = 20pi cm^2/s" },
    ]},
  ]},
  { id: "u3", title: "Applications of Derivatives", lectures: [
    { id: "3.1", title: "Increasing/Decreasing and Concavity", yt: "https://youtube.com/watch?v=dJJBBPPKr1Q", duration: "1:34:07", hasViz: true, vizType: "inc_dec_concavity", questions: [
      { q: "f'(x) > 0 on (a,b) means?", a: "f is increasing on (a,b)" },
      { q: "f''(x) < 0 means?", a: "Concave down" },
    ]},
    { id: "3.2", title: "Rolle's and Mean Value Theorem", yt: "https://youtube.com/watch?v=xYQGVpiyoLU", duration: "6:36", hasViz: true, vizType: "mvt", questions: [
      { q: "State MVT.", a: "There exists c in (a,b) where f'(c) = (f(b)-f(a))/(b-a)" },
    ]},
    { id: "3.3", title: "First Derivative Test", yt: "https://youtube.com/watch?v=W7qEKT3B_YI", duration: "26:10", hasViz: true, vizType: "first_deriv_test", questions: [
      { q: "f' changes + to - at c. What is c?", a: "Local maximum" },
    ]},
    { id: "3.4", title: "Second Derivative Test", yt: "https://youtube.com/watch?v=ofv3EGrRdJI", duration: "36:50", hasViz: true, vizType: "second_deriv_test", questions: [
      { q: "f'(c) = 0 and f''(c) > 0. What is c?", a: "Local minimum" },
    ]},
    { id: "3.5", title: "Limits at Infinity", yt: "https://youtube.com/watch?v=UTVEIlkEVY", duration: "1:23:49", hasViz: true, vizType: "limits_infinity", questions: [
      { q: "lim(x->infinity) (3x^2 + 1)/(5x^2 - 2)?", a: "Leading coefficients: 3/5" },
    ]},
    { id: "3.6", title: "How to Sketch Graphs", yt: "https://youtube.com/watch?v=ucMGRi0MNek", duration: "1:32:36", hasViz: true, vizType: "curve_sketch", questions: [] },
    { id: "3.7", title: "Optimization Problems", yt: "https://youtube.com/watch?v=mJKl-MJlPMY", duration: "1:34:43", hasViz: true, vizType: "optimization", questions: [
      { q: "Steps to solve optimization?", a: "1) Draw. 2) Write objective. 3) Constraint. 4) Substitute. 5) Derivative = 0. 6) Check." },
    ]},
  ]},
  { id: "u4", title: "Integration", lectures: [
    { id: "4.1", title: "The Indefinite Integral", yt: "https://youtube.com/watch?v=xaCPDMEkbig", duration: "2:45:37", hasViz: true, vizType: "antideriv", questions: [
      { q: "integral x^3 dx", a: "x^4/4 + C" },
      { q: "integral (3x^2 - 2x + 5) dx", a: "x^3 - x^2 + 5x + C" },
    ]},
    { id: "4.2", title: "Integration by Substitution", yt: "https://youtube.com/watch?v=sdYdnpYn-1o", duration: "1:33:58", hasViz: true, vizType: "u_sub", questions: [
      { q: "integral 2x*cos(x^2) dx", a: "u = x^2, du = 2x dx. sin(x^2) + C" },
    ]},
    { id: "4.3", title: "Area Under a Curve, Riemann Sums", yt: "https://youtube.com/watch?v=2qJHJU51Kps", duration: "2:07:03", hasViz: true, vizType: "riemann", questions: [
      { q: "What happens to Riemann sum as n approaches infinity?", a: "Becomes the exact definite integral" },
    ]},
    { id: "4.4", title: "Evaluation of Definite Integrals", yt: "https://youtube.com/watch?v=nCYFzy0Mfro", duration: "30:55", hasViz: false, questions: [] },
    { id: "4.5", title: "The Fundamental Theorem of Calculus", yt: "https://youtube.com/watch?v=ns8N1RuCBe0", duration: "2:46:09", hasViz: true, vizType: "ftc", questions: [
      { q: "State FTC Part 1.", a: "d/dx [integral(a to x) f(t) dt] = f(x)" },
      { q: "State FTC Part 2.", a: "integral(a to b) f(x) dx = F(b) - F(a)" },
    ]},
  ]},
  { id: "u5", title: "Applications of Integration", lectures: [
    { id: "5.1", title: "Area Between Two Curves", yt: "https://youtube.com/watch?v=nR3FrGdKgtI", duration: "1:33:46", hasViz: true, vizType: "area_between", questions: [
      { q: "Area between f and g on [a,b]?", a: "integral(a to b) |f(x) - g(x)| dx" },
    ]},
    { id: "5.2", title: "Volume by Disks and Washers", yt: "https://youtube.com/watch?v=Fk7ok1HavLU", duration: "2:47:49", hasViz: true, vizType: "disk_washer", questions: [
      { q: "Disk method formula?", a: "V = pi * integral(a to b) [f(x)]^2 dx" },
    ]},
    { id: "5.3", title: "Volume by Cylindrical Shells", yt: "https://youtube.com/watch?v=aDPYAoMsCLI", duration: "54:56", hasViz: true, vizType: "shells", questions: [
      { q: "Shell method formula?", a: "V = 2pi * integral(a to b) x*f(x) dx" },
    ]},
    { id: "5.4", title: "Arc Length", yt: "https://youtube.com/watch?v=DNDtWsPsOmY", duration: "2:17:58", hasViz: true, vizType: "arc_length", questions: [
      { q: "Arc length formula?", a: "L = integral(a to b) sqrt(1 + [f'(x)]^2) dx" },
    ]},
  ]},
];

const ALL_LECTURES = UNITS.flatMap(u => u.lectures.map(l => ({ ...l, unitId: u.id, unitTitle: u.title })));

// ─── VISUALIZATIONS ─────────────────────────────────────────

function VizLines() {
  const [m,setM]=useState(1), [b,setB]=useState(0), [x1v,setX1v]=useState(-2), [x2v,setX2v]=useState(2);
  const draw = useCallback((ctx,W,H)=>{
    const P=44, xN=-6,xX=6,yN=-6,yX=6;
    const tx=x=>P+((x-xN)/(xX-xN))*(W-2*P), ty=y=>P+((yX-y)/(yX-yN))*(H-2*P);
    ctx.fillStyle=C.graphBg; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=C.grid; ctx.lineWidth=0.5;
    for(let i=xN;i<=xX;i++){ctx.beginPath();ctx.moveTo(tx(i),P);ctx.lineTo(tx(i),H-P);ctx.stroke();}
    for(let i=yN;i<=yX;i++){ctx.beginPath();ctx.moveTo(P,ty(i));ctx.lineTo(W-P,ty(i));ctx.stroke();}
    ctx.strokeStyle=C.axis;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(P,ty(0));ctx.lineTo(W-P,ty(0));ctx.stroke();
    ctx.beginPath();ctx.moveTo(tx(0),P);ctx.lineTo(tx(0),H-P);ctx.stroke();
    ctx.fillStyle=C.textLight;ctx.font=`9px ${F.mono}`;ctx.textAlign="center";
    for(let i=xN;i<=xX;i++)if(i!==0)ctx.fillText(i,tx(i),ty(0)+14);
    const g=ctx.createLinearGradient(tx(xN),0,tx(xX),0);
    g.addColorStop(0,"rgba(77,163,255,0.2)");g.addColorStop(0.5,C.blue);g.addColorStop(1,"rgba(77,163,255,0.2)");
    ctx.strokeStyle=g;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(tx(xN),ty(m*xN+b));ctx.lineTo(tx(xX),ty(m*xX+b));ctx.stroke();
    const y1=m*x1v+b,y2=m*x2v+b,rise=y2-y1,run=x2v-x1v;
    ctx.strokeStyle=C.silverLight;ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(tx(x1v),ty(y1));ctx.lineTo(tx(x2v),ty(y1));ctx.stroke();
    ctx.beginPath();ctx.moveTo(tx(x2v),ty(y1));ctx.lineTo(tx(x2v),ty(y2));ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle=C.textDim;ctx.font=`10px ${F.sans}`;ctx.textAlign="center";
    ctx.fillText(`run = ${run.toFixed(1)}`,(tx(x1v)+tx(x2v))/2,ty(y1)+14);
    ctx.textAlign="left";ctx.fillText(`rise = ${rise.toFixed(1)}`,tx(x2v)+6,(ty(y1)+ty(y2))/2+4);
    [{x:x1v,y:y1},{x:x2v,y:y2}].forEach(p=>{ctx.beginPath();ctx.arc(tx(p.x),ty(p.y),4,0,Math.PI*2);ctx.fillStyle=C.blue;ctx.fill();});
    ctx.fillStyle=C.text;ctx.font=`13px ${F.sans}`;ctx.textAlign="left";
    ctx.fillText(`y = ${m.toFixed(1)}x + ${b.toFixed(1)}`,P+8,P+16);
    ctx.fillStyle=C.textMid;ctx.font=`11px ${F.mono}`;
    ctx.fillText(`slope = ${(rise/run).toFixed(3)}   angle = ${(Math.atan(m)*180/Math.PI).toFixed(1)}deg   dist = ${Math.sqrt(run*run+rise*rise).toFixed(3)}`,P+8,P+34);
  },[m,b,x1v,x2v]);
  return <div><CanvasGraph draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}><Slider label="Slope (m)" value={m} min={-5} max={5} step={0.1} onChange={setM}/><Slider label="Intercept (b)" value={b} min={-5} max={5} step={0.1} onChange={setB}/><Slider label="Point 1" value={x1v} min={-5} max={4} step={0.5} onChange={setX1v}/><Slider label="Point 2" value={x2v} min={-4} max={5} step={0.5} onChange={setX2v}/></div><Tip text="Slope = rise/run. Angle of inclination = arctan(m). Distance uses the Pythagorean theorem between two points."/></div>;
}

function VizFunctions() {
  const [t,setT]=useState("quadratic"),[a,setA]=useState(1),[h,setH]=useState(0),[k,setK]=useState(0);
  const fns={quadratic:{l:"x^2",fn:x=>a*(x-h)**2+k,base:x=>x*x},cubic:{l:"x^3",fn:x=>a*(x-h)**3+k,base:x=>x**3},sqrt:{l:"sqrt x",fn:x=>{const v=x-h;return v<0?null:a*Math.sqrt(v)+k},base:x=>x<0?null:Math.sqrt(x)},abs:{l:"|x|",fn:x=>a*Math.abs(x-h)+k,base:Math.abs},recip:{l:"1/x",fn:x=>{const d=x-h;return Math.abs(d)<.05?null:a/d+k},base:x=>Math.abs(x)<.05?null:1/x},exp:{l:"e^x",fn:x=>a*Math.exp(x-h)+k,base:Math.exp}};
  const c=fns[t];
  const draw=useCallback((ctx,W,H)=>{
    const P=44,xN=-8,xX=8,yN=-8,yX=8;
    const tx=x=>P+((x-xN)/(xX-xN))*(W-2*P),ty=y=>P+((yX-y)/(yX-yN))*(H-2*P);
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=C.grid;ctx.lineWidth=0.5;
    for(let i=xN;i<=xX;i++){ctx.beginPath();ctx.moveTo(tx(i),P);ctx.lineTo(tx(i),H-P);ctx.stroke();}
    for(let i=yN;i<=yX;i++){ctx.beginPath();ctx.moveTo(P,ty(i));ctx.lineTo(W-P,ty(i));ctx.stroke();}
    ctx.strokeStyle=C.axis;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(P,ty(0));ctx.lineTo(W-P,ty(0));ctx.stroke();
    ctx.beginPath();ctx.moveTo(tx(0),P);ctx.lineTo(tx(0),H-P);ctx.stroke();
    ctx.strokeStyle=C.silverLight;ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();let s=false;
    for(let px=P;px<W-P;px++){const x=xN+((px-P)/(W-2*P))*(xX-xN);const y=c.base(x);if(y===null||!isFinite(y)||Math.abs(y)>yX*2){s=false;continue;}if(!s){ctx.moveTo(px,ty(y));s=true;}else ctx.lineTo(px,ty(y));}
    ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle=C.blue;ctx.lineWidth=2;ctx.beginPath();s=false;
    for(let px=P;px<W-P;px+=.5){const x=xN+((px-P)/(W-2*P))*(xX-xN);const y=c.fn(x);if(y===null||!isFinite(y)||y>yX*2||y<yN*2){s=false;continue;}if(!s){ctx.moveTo(px,ty(y));s=true;}else ctx.lineTo(px,ty(y));}
    ctx.stroke();
    ctx.fillStyle=C.text;ctx.font=`13px ${F.sans}`;ctx.textAlign="left";ctx.fillText(`a=${a.toFixed(1)} h=${h.toFixed(1)} k=${k.toFixed(1)}`,P+8,P+16);
  },[t,a,h,k,c]);
  return <div>
    <div style={{display:"flex",gap:4,marginBottom:8,flexWrap:"wrap"}}>{Object.entries(fns).map(([key,v])=><button key={key} onClick={()=>setT(key)} style={{background:key===t?C.blue:"transparent",color:key===t?"#fff":C.textDim,border:`1px solid ${key===t?C.blue:C.border}`,borderRadius:4,padding:"3px 10px",fontFamily:F.sans,fontSize:11,cursor:"pointer"}}>{v.l}</button>)}</div>
    <CanvasGraph draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}><Slider label="a" value={a} min={-3} max={3} step={0.1} onChange={setA}/><Slider label="h" value={h} min={-5} max={5} step={0.1} onChange={setH}/><Slider label="k" value={k} min={-5} max={5} step={0.1} onChange={setK}/></div>
    <Tip text="Dashed = parent. Solid = transformed. a stretches/flips. h shifts horizontally (opposite sign). k shifts vertically."/></div>;
}

function VizTrig() {
  const [amp,setAmp]=useState(1),[freq,setFreq]=useState(1),[ph,setPh]=useState(0),[sh,setSh]=useState(0),[fn,setFn]=useState("sin");
  const tf=fn==="sin"?Math.sin:fn==="cos"?Math.cos:Math.tan;
  const draw=useCallback((ctx,W,H)=>{
    const P=44,xN=-2*Math.PI,xX=2*Math.PI,yN=-4,yX=4;
    const tx=x=>P+((x-xN)/(xX-xN))*(W-2*P),ty=y=>P+((yX-y)/(yX-yN))*(H-2*P);
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=C.grid;ctx.lineWidth=0.5;
    const marks=[-2*Math.PI,-Math.PI,0,Math.PI,2*Math.PI];
    marks.forEach(x=>{ctx.beginPath();ctx.moveTo(tx(x),P);ctx.lineTo(tx(x),H-P);ctx.stroke();});
    for(let y=yN;y<=yX;y++){ctx.beginPath();ctx.moveTo(P,ty(y));ctx.lineTo(W-P,ty(y));ctx.stroke();}
    ctx.strokeStyle=C.axis;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(P,ty(0));ctx.lineTo(W-P,ty(0));ctx.stroke();
    ctx.strokeStyle=C.silverLight;ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();let s=false;
    for(let px=P;px<W-P;px++){const x=xN+((px-P)/(W-2*P))*(xX-xN);const y=tf(x);if(!isFinite(y)||Math.abs(y)>10){s=false;continue;}if(!s){ctx.moveTo(px,ty(y));s=true;}else ctx.lineTo(px,ty(y));}
    ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle=C.blue;ctx.lineWidth=2;ctx.beginPath();s=false;
    for(let px=P;px<W-P;px+=.5){const x=xN+((px-P)/(W-2*P))*(xX-xN);const y=amp*tf(freq*(x-ph))+sh;if(!isFinite(y)||Math.abs(y)>yX*2){s=false;continue;}if(!s){ctx.moveTo(px,ty(y));s=true;}else ctx.lineTo(px,ty(y));}
    ctx.stroke();
    ctx.fillStyle=C.textMid;ctx.font=`11px ${F.mono}`;ctx.textAlign="left";
    ctx.fillText(`period = ${(2*Math.PI/Math.abs(freq)).toFixed(2)}`,P+8,P+16);
  },[amp,freq,ph,sh,fn,tf]);
  return <div>
    <div style={{display:"flex",gap:4,marginBottom:8}}>{["sin","cos","tan"].map(t=><button key={t} onClick={()=>setFn(t)} style={{background:t===fn?C.blue:"transparent",color:t===fn?"#fff":C.textDim,border:`1px solid ${t===fn?C.blue:C.border}`,borderRadius:4,padding:"3px 12px",fontFamily:F.sans,fontSize:11,cursor:"pointer"}}>{t}</button>)}</div>
    <CanvasGraph draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}><Slider label="Amplitude" value={amp} min={-3} max={3} step={0.1} onChange={setAmp}/><Slider label="Frequency" value={freq} min={0.1} max={4} step={0.1} onChange={setFreq}/><Slider label="Phase" value={ph} min={-3} max={3} step={0.1} onChange={setPh}/><Slider label="Shift" value={sh} min={-3} max={3} step={0.1} onChange={setSh}/></div>
    <Tip text="Amplitude = height. Frequency = speed of oscillation (period = 2pi/freq). Phase slides horizontally. Shift moves vertically."/></div>;
}

function VizDerivativeDef() {
  const [xV,setXV]=useState(1),[dx,setDx]=useState(1.5);
  const fn=x=>x*x;
  const draw=useCallback((ctx,W,H)=>{
    const P=44,xN=-2,xX=5,yN=-1,yX=16;
    const tx=x=>P+((x-xN)/(xX-xN))*(W-2*P),ty=y=>P+((yX-y)/(yX-yN))*(H-2*P);
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=C.grid;ctx.lineWidth=0.5;
    for(let i=Math.ceil(xN);i<=xX;i++){ctx.beginPath();ctx.moveTo(tx(i),P);ctx.lineTo(tx(i),H-P);ctx.stroke();}
    for(let i=0;i<=yX;i+=2){ctx.beginPath();ctx.moveTo(P,ty(i));ctx.lineTo(W-P,ty(i));ctx.stroke();}
    ctx.strokeStyle=C.axis;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(P,ty(0));ctx.lineTo(W-P,ty(0));ctx.stroke();
    ctx.strokeStyle=C.blue;ctx.lineWidth=2;ctx.beginPath();
    for(let px=P;px<W-P;px++){const x=xN+((px-P)/(W-2*P))*(xX-xN);if(px===P)ctx.moveTo(px,ty(fn(x)));else ctx.lineTo(px,ty(fn(x)));}ctx.stroke();
    const y1=fn(xV),y2=fn(xV+dx),sec=(y2-y1)/dx,tan=2*xV;
    ctx.strokeStyle=C.silverLight;ctx.lineWidth=1;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(tx(xN),ty(y1+sec*(xN-xV)));ctx.lineTo(tx(xX),ty(y1+sec*(xX-xV)));ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle=C.blue;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(tx(xN),ty(y1+tan*(xN-xV)));ctx.lineTo(tx(xX),ty(y1+tan*(xX-xV)));ctx.stroke();
    ctx.beginPath();ctx.arc(tx(xV),ty(y1),5,0,Math.PI*2);ctx.fillStyle=C.blue;ctx.fill();
    ctx.beginPath();ctx.arc(tx(xV+dx),ty(y2),4,0,Math.PI*2);ctx.fillStyle=C.silver;ctx.fill();
    ctx.fillStyle=C.text;ctx.font=`12px ${F.sans}`;ctx.textAlign="left";ctx.fillText("f(x) = x^2",P+8,P+16);
    ctx.fillStyle=C.silver;ctx.font=`11px ${F.mono}`;ctx.fillText(`secant: ${sec.toFixed(3)}`,P+8,P+34);
    ctx.fillStyle=C.blue;ctx.fillText(`tangent: ${tan.toFixed(3)}`,P+8,P+50);
  },[xV,dx]);
  return <div><CanvasGraph draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}><Slider label="x" value={xV} min={-1} max={3.5} step={0.1} onChange={setXV}/><Slider label="dx" value={dx} min={0.01} max={3} step={0.01} onChange={setDx}/></div><Tip text="Dashed = secant. Solid = tangent. Shrink dx to 0 and watch the secant become the tangent. That limit IS the derivative."/></div>;
}

function VizSecantTangent() {
  const [xV,setXV]=useState(1),[dx,setDx]=useState(2);
  const fn=x=>Math.sin(x)+1.5;
  const draw=useCallback((ctx,W,H)=>{
    const P=44,xN=-2,xX=7,yN=-1,yX=4;
    const tx=x=>P+((x-xN)/(xX-xN))*(W-2*P),ty=y=>P+((yX-y)/(yX-yN))*(H-2*P);
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=C.grid;ctx.lineWidth=0.5;
    for(let i=Math.ceil(xN);i<=xX;i++){ctx.beginPath();ctx.moveTo(tx(i),P);ctx.lineTo(tx(i),H-P);ctx.stroke();}
    for(let i=Math.ceil(yN);i<=yX;i++){ctx.beginPath();ctx.moveTo(P,ty(i));ctx.lineTo(W-P,ty(i));ctx.stroke();}
    ctx.strokeStyle=C.axis;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(P,ty(0));ctx.lineTo(W-P,ty(0));ctx.stroke();
    ctx.strokeStyle=C.blue;ctx.lineWidth=2;ctx.beginPath();
    for(let px=P;px<W-P;px++){const x=xN+((px-P)/(W-2*P))*(xX-xN);if(px===P)ctx.moveTo(px,ty(fn(x)));else ctx.lineTo(px,ty(fn(x)));}ctx.stroke();
    const y1=fn(xV),y2=fn(xV+dx),avg=(y2-y1)/dx,inst=Math.cos(xV);
    ctx.strokeStyle=C.silverLight;ctx.lineWidth=1;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(tx(xN),ty(y1+avg*(xN-xV)));ctx.lineTo(tx(xX),ty(y1+avg*(xX-xV)));ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle=C.blue;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(tx(xN),ty(y1+inst*(xN-xV)));ctx.lineTo(tx(xX),ty(y1+inst*(xX-xV)));ctx.stroke();
    ctx.beginPath();ctx.arc(tx(xV),ty(y1),5,0,Math.PI*2);ctx.fillStyle=C.blue;ctx.fill();
    ctx.beginPath();ctx.arc(tx(xV+dx),ty(y2),4,0,Math.PI*2);ctx.fillStyle=C.silver;ctx.fill();
    ctx.fillStyle=C.text;ctx.font=`12px ${F.sans}`;ctx.textAlign="left";ctx.fillText("f(x) = sin(x) + 1.5",P+8,P+16);
    ctx.fillStyle=C.textMid;ctx.font=`11px ${F.mono}`;ctx.fillText(`avg: ${avg.toFixed(4)}   inst: ${inst.toFixed(4)}`,P+8,P+34);
  },[xV,dx]);
  return <div><CanvasGraph draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}><Slider label="x" value={xV} min={-1} max={6} step={0.1} onChange={setXV}/><Slider label="dx" value={dx} min={0.01} max={4} step={0.01} onChange={setDx}/></div><Tip text="Average rate = secant slope. Instantaneous rate = tangent slope. This is velocity vs speed at a moment."/></div>;
}

function VizIncDecConcavity() {
  const [xV,setXV]=useState(0);
  const fn=x=>x**3-3*x,fp=x=>3*x*x-3,fpp=x=>6*x;
  const draw=useCallback((ctx,W,H)=>{
    const P=44,xN=-3,xX=3,yN=-5,yX=5;
    const tx=x=>P+((x-xN)/(xX-xN))*(W-2*P),ty=y=>P+((yX-y)/(yX-yN))*(H-2*P);
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=C.grid;ctx.lineWidth=0.5;
    for(let i=Math.ceil(xN);i<=xX;i++){ctx.beginPath();ctx.moveTo(tx(i),P);ctx.lineTo(tx(i),H-P);ctx.stroke();}
    for(let i=Math.ceil(yN);i<=yX;i++){ctx.beginPath();ctx.moveTo(P,ty(i));ctx.lineTo(W-P,ty(i));ctx.stroke();}
    ctx.strokeStyle=C.axis;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(P,ty(0));ctx.lineTo(W-P,ty(0));ctx.stroke();
    ctx.beginPath();ctx.moveTo(tx(0),P);ctx.lineTo(tx(0),H-P);ctx.stroke();
    ctx.strokeStyle=C.blue;ctx.lineWidth=2;ctx.beginPath();
    for(let px=P;px<W-P;px++){const x=xN+((px-P)/(W-2*P))*(xX-xN);if(px===P)ctx.moveTo(px,ty(fn(x)));else ctx.lineTo(px,ty(fn(x)));}ctx.stroke();
    ctx.strokeStyle=C.silverLight;ctx.lineWidth=1;ctx.setLineDash([4,3]);ctx.beginPath();
    for(let px=P;px<W-P;px++){const x=xN+((px-P)/(W-2*P))*(xX-xN);if(px===P)ctx.moveTo(px,ty(fp(x)));else ctx.lineTo(px,ty(fp(x)));}ctx.stroke();ctx.setLineDash([]);
    const y=fn(xV),d1=fp(xV),d2=fpp(xV);
    ctx.beginPath();ctx.arc(tx(xV),ty(y),5,0,Math.PI*2);ctx.fillStyle=C.blue;ctx.fill();
    ctx.fillStyle=C.text;ctx.font=`12px ${F.sans}`;ctx.textAlign="left";ctx.fillText("f(x) = x^3 - 3x",P+8,P+16);
    ctx.fillStyle=C.textMid;ctx.font=`11px ${F.mono}`;
    const d1s = d1>0?"inc":d1<0?"dec":"crit";
    const d2s = d2>0?"up":d2<0?"down":"inflect";
    ctx.fillText(`f' = ${d1.toFixed(2)} (${d1s})   f'' = ${d2.toFixed(2)} (${d2s})`,P+8,P+34);
  },[xV]);
  return <div><CanvasGraph draw={draw}/><Slider label="x" value={xV} min={-2.5} max={2.5} step={0.05} onChange={setXV}/><Tip text="Solid = f(x). Dashed = f'(x). Where f' > 0 the function increases. Where f'' changes sign is an inflection point."/></div>;
}

function VizRiemann() {
  const [n,setN]=useState(5),[a,setA]=useState(0),[b,setB]=useState(3),[t,setT]=useState("left");
  const fn=x=>x*x;
  const draw=useCallback((ctx,W,H)=>{
    const P=44,xN=-1,xX=5,yN=-1,yX=12;
    const tx=x=>P+((x-xN)/(xX-xN))*(W-2*P),ty=y=>P+((yX-y)/(yX-yN))*(H-2*P);
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=C.grid;ctx.lineWidth=0.5;
    for(let i=Math.ceil(xN);i<=xX;i++){ctx.beginPath();ctx.moveTo(tx(i),P);ctx.lineTo(tx(i),H-P);ctx.stroke();}
    for(let i=0;i<=yX;i+=2){ctx.beginPath();ctx.moveTo(P,ty(i));ctx.lineTo(W-P,ty(i));ctx.stroke();}
    ctx.strokeStyle=C.axis;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(P,ty(0));ctx.lineTo(W-P,ty(0));ctx.stroke();
    const dx=(b-a)/n;let total=0;
    for(let i=0;i<n;i++){const xl=a+i*dx;const sx=t==="left"?xl:t==="right"?xl+dx:xl+dx/2;const h2=fn(sx);total+=h2*dx;
    ctx.fillStyle=C.blueDim;ctx.fillRect(tx(xl),ty(Math.max(h2,0)),tx(xl+dx)-tx(xl),ty(0)-ty(Math.max(h2,0)));
    ctx.strokeStyle=C.blueMid;ctx.lineWidth=0.5;ctx.strokeRect(tx(xl),ty(Math.max(h2,0)),tx(xl+dx)-tx(xl),ty(0)-ty(Math.max(h2,0)));}
    ctx.strokeStyle=C.blue;ctx.lineWidth=2;ctx.beginPath();
    for(let px=P;px<W-P;px++){const x=xN+((px-P)/(W-2*P))*(xX-xN);if(px===P)ctx.moveTo(px,ty(fn(x)));else ctx.lineTo(px,ty(fn(x)));}ctx.stroke();
    const exact=(b**3-a**3)/3;
    ctx.fillStyle=C.text;ctx.font=`12px ${F.sans}`;ctx.textAlign="left";ctx.fillText("f(x) = x^2",P+8,P+16);
    ctx.fillStyle=C.textMid;ctx.font=`11px ${F.mono}`;
    ctx.fillText(`sum = ${total.toFixed(4)}   exact = ${exact.toFixed(4)}   err = ${Math.abs(total-exact).toFixed(5)}`,P+8,P+34);
  },[n,a,b,t]);
  return <div>
    <div style={{display:"flex",gap:4,marginBottom:8}}>{["left","right","midpoint"].map(v=><button key={v} onClick={()=>setT(v)} style={{background:v===t?C.blue:"transparent",color:v===t?"#fff":C.textDim,border:`1px solid ${v===t?C.blue:C.border}`,borderRadius:4,padding:"3px 12px",fontFamily:F.sans,fontSize:11,cursor:"pointer"}}>{v}</button>)}</div>
    <CanvasGraph draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}><Slider label="n" value={n} min={1} max={100} step={1} onChange={setN}/><Slider label="a" value={a} min={0} max={2} step={0.1} onChange={setA}/><Slider label="b" value={b} min={1} max={4.5} step={0.1} onChange={setB}/></div>
    <Tip text="More rectangles = less error. As n approaches infinity the sum becomes the exact integral."/></div>;
}

const VIZ_MAP={lines:VizLines,functions:VizFunctions,trig:VizTrig,secant_tangent:VizSecantTangent,derivative_def:VizDerivativeDef,riemann:VizRiemann,inc_dec_concavity:VizIncDecConcavity};

// ─── APP ────────────────────────────────────────────────────
export default function Telpo({onBack}){
  const [view,setView]=useState("map"),[active,setActive]=useState(null),[progress,setProgress]=useState(loadProgress);
  useEffect(()=>{saveProgress(progress);},[progress]);
  const toggle=(id,s)=>setProgress(p=>{const n={...p};n[id]===s?delete n[id]:n[id]=s;return n;});
  const total=ALL_LECTURES.length,mastered=Object.values(progress).filter(v=>v==="mastered").length;

  if(view==="map")return(
    <div style={{minHeight:"100vh",background:C.bg,padding:"0 24px",maxWidth:720,margin:"0 auto",fontFamily:F.sans}}>
      <div style={{paddingTop:40,marginBottom:32}}>
        {onBack && <button onClick={onBack} style={{background:"transparent",border:"none",color:"#9298a8",fontFamily:"'Inter',system-ui,sans-serif",fontSize:12,cursor:"pointer",padding:0,marginBottom:12}}>Back to Home</button>}
        <p style={{fontSize:10,fontWeight:600,color:C.silver,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 4px"}}>telpo</p>
        <h1 style={{fontSize:24,fontWeight:600,color:C.text,margin:"0 0 6px"}}>Calculus 1</h1>
        <p style={{fontSize:12,color:C.textDim,margin:"0 0 14px"}}>32 lectures. Watch, interact, practice, master.</p>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,height:2,background:C.border,borderRadius:1,overflow:"hidden"}}><div style={{height:"100%",width:`${(mastered/total)*100}%`,background:C.blue,borderRadius:1,transition:"width 0.4s"}}/></div>
          <span style={{fontFamily:F.mono,fontSize:10,color:C.textDim}}>{mastered}/{total}</span>
        </div>
      </div>
      {UNITS.map(u=><div key={u.id} style={{marginBottom:24}}>
        <p style={{fontSize:11,fontWeight:600,color:C.textMid,margin:"0 0 6px",letterSpacing:0.3}}>{u.title}</p>
        {u.lectures.map(l=>{const s=progress[l.id];return(
          <div key={l.id} onClick={()=>{setActive({...l,unitTitle:u.title});setView("lecture");}}
            style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=C.panel} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <span style={{width:20,height:20,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontFamily:F.mono,fontWeight:600,flexShrink:0,
              background:s==="mastered"?C.greenDim:s==="watched"?C.goldDim:C.panel,
              color:s==="mastered"?C.done:s==="watched"?C.gold:C.textLight,
              border:`1px solid ${s==="mastered"?C.done:s==="watched"?C.gold:C.border}`}}>
              {s==="mastered"?"ok":l.id}</span>
            <div style={{flex:1}}>
              <span style={{fontSize:13,color:C.text,fontWeight:450}}>{l.title}</span>
              <div style={{display:"flex",gap:8,marginTop:1}}>
                <span style={{fontSize:10,color:C.textLight,fontFamily:F.mono}}>{l.duration}</span>
                {l.hasViz&&<span style={{fontSize:10,color:C.blue}}>interactive</span>}
                {l.questions?.length>0&&<span style={{fontSize:10,color:C.textLight}}>{l.questions.length}p</span>}
              </div>
            </div>
            <span style={{color:C.textLight,fontSize:13}}>></span>
          </div>);})}
      </div>)}
      <p style={{textAlign:"center",fontSize:9,color:C.textLight,letterSpacing:1.5,margin:"24px 0 40px"}}>TELPO v1.1</p>
    </div>
  );

  const l=active,Viz=l?.hasViz?VIZ_MAP[l.vizType]||null:null,s=progress[l?.id];
  const eqs = CALC_EQUATIONS[l?.id] || null;

  return(
    <div style={{minHeight:"100vh",background:C.bg,padding:"0 24px",maxWidth:720,margin:"0 auto",fontFamily:F.sans}}>
      <div style={{paddingTop:24}}>
        <button onClick={()=>setView("map")} style={{background:"transparent",border:"none",color:C.textDim,fontFamily:F.sans,fontSize:12,cursor:"pointer",padding:0,marginBottom:16}}>Back</button>
        <p style={{fontSize:10,fontWeight:600,color:C.silver,letterSpacing:2,textTransform:"uppercase",margin:"0 0 2px"}}>Lecture {l.id}</p>
        <h1 style={{fontSize:20,fontWeight:600,color:C.text,margin:"0 0 6px"}}>{l.title}</h1>
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:16}}>
          <span style={{fontSize:11,color:C.textDim,fontFamily:F.mono}}>{l.duration}</span>
          <span style={{color:C.textLight}}>.</span>
          <a href={l.yt} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:C.blue,textDecoration:"none"}}>YouTube</a>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {[{k:"watched",l:"Watched",c:C.gold,bg:C.goldDim},{k:"mastered",l:"Mastered",c:C.done,bg:C.greenDim}].map(v=>(
            <button key={v.k} onClick={()=>toggle(l.id,v.k)} style={{background:s===v.k?v.bg:"transparent",color:s===v.k?v.c:C.textDim,border:`1px solid ${s===v.k?v.c:C.border}`,borderRadius:3,padding:"5px 12px",fontFamily:F.sans,fontSize:11,cursor:"pointer",fontWeight:500}}>{s===v.k?"ok ":""}{v.l}</button>))}
        </div>

        {/* Visualization */}
        {Viz?<Viz/>:l.hasViz?<div style={{padding:24,textAlign:"center",background:C.panel,borderRadius:4,border:`1px solid ${C.border}`,marginBottom:16}}><p style={{color:C.textDim,fontSize:11,margin:0}}>Module ready to build. We scope it together when you reach this lecture.</p></div>:null}

        {/* Interactive Equations */}
        <EquationExplorer equations={eqs} />

        {/* Typed answer practice */}
        <Practice questions={l.questions}/>

        <div style={{background:C.panel,borderRadius:4,border:`1px solid ${C.border}`,padding:"12px 14px",margin:"16px 0 40px"}}>
          <p style={{fontSize:10,fontWeight:600,color:C.textDim,letterSpacing:1,textTransform:"uppercase",margin:"0 0 4px"}}>Mastery check</p>
          <p style={{color:C.textMid,fontSize:11,margin:0,lineHeight:1.6}}>Close the video. Explain the concept out loud. If you can teach it cold, mark it mastered.</p>
        </div>
      </div>
    </div>
  );
}
