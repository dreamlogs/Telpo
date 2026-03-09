import { useState, useEffect, useRef, useCallback } from "react";
import { C, F, Slider, Tip, CanvasGraph, Practice, EquationExplorer, PHYSICS_EQUATIONS } from "./shared_ui";

const SK="telpo-physics-v1";
function load(){try{const r=localStorage.getItem(SK);return r?JSON.parse(r):{};}catch{return{};}}
function save(d){try{localStorage.setItem(SK,JSON.stringify(d));}catch{}}

const UNITS=[
  {id:"u1",title:"1. Vectors",lectures:[
    {id:"v1.1",title:"Scalars vs Vectors",yt:"https://www.youtube.com/watch?v=ihNZlp7iUHE",duration:"18:45",hasViz:true,vizType:"vectors",
      questions:[{q:"Is temperature a scalar or vector?",a:"Scalar. It has magnitude only, no direction."},{q:"A vector has components (3, 4). Find its magnitude.",a:"|v| = sqrt(3^2 + 4^2) = sqrt(25) = 5"},{q:"Find the direction angle of vector (3, 4).",a:"theta = arctan(4/3) = 53.13 degrees"},{q:"Add vectors A = (2, 3) and B = (-1, 5).",a:"A + B = (2+(-1), 3+5) = (1, 8)"}]},
    {id:"v1.2",title:"Vector Components and Addition",yt:"https://www.youtube.com/watch?v=bOIe0DIMbI8",duration:"26:12",hasViz:true,vizType:"vectors",
      questions:[{q:"Resolve a 50N force at 30 degrees into components.",a:"Fx = 50cos(30) = 43.3N, Fy = 50sin(30) = 25N"},{q:"Find the resultant of two perpendicular forces: 6N east and 8N north.",a:"R = sqrt(36+64) = 10N at theta = arctan(8/6) = 53.1 degrees north of east"}]},
    {id:"v1.3",title:"Unit Vectors and Dot Product",yt:"https://www.youtube.com/watch?v=WNuIhXo39_k",duration:"27:00",hasViz:false,
      questions:[{q:"Find the unit vector of (3, 4).",a:"u = (3/5, 4/5)"},{q:"Compute (2,3) dot (4,-1).",a:"2(4)+3(-1) = 8-3 = 5"}]},
  ]},
  {id:"u2",title:"2. Kinematics",lectures:[
    {id:"k2.1",title:"Displacement, Velocity, Acceleration",yt:"https://www.youtube.com/watch?v=ZM8ECpBuQYE",duration:"54:00",hasViz:true,vizType:"kinematics",
      questions:[{q:"A car goes from 0 to 60 m/s in 10s. What is the acceleration?",a:"a = dv/dt = 60/10 = 6 m/s^2"},{q:"What is the difference between speed and velocity?",a:"Speed is scalar (magnitude only). Velocity is vector (magnitude + direction)."},{q:"An object has v0=5m/s, a=2m/s^2. Find v after 4s.",a:"v = v0 + at = 5 + 2(4) = 13 m/s"}]},
    {id:"k2.2",title:"Kinematic Equations",yt:"https://www.youtube.com/watch?v=FOkQszg1-j8",duration:"1:02:30",hasViz:true,vizType:"kinematics",
      questions:[{q:"List the 4 kinematic equations.",a:"v=v0+at, x=v0t+0.5at^2, v^2=v0^2+2ax, x=0.5(v0+v)t"},{q:"A ball drops from rest. How far does it fall in 3s?",a:"y = 0.5*g*t^2 = 0.5(9.8)(9) = 44.1 m"},{q:"A car brakes from 30m/s to rest over 100m. Find a.",a:"v^2=v0^2+2ax -> 0=900+200a -> a=-4.5 m/s^2"}]},
    {id:"k2.3",title:"Projectile Motion",yt:"https://www.youtube.com/watch?v=aY8z2Kvmfco",duration:"47:15",hasViz:true,vizType:"projectile",
      questions:[{q:"A ball is launched at 20m/s at 45 degrees. Find horizontal range.",a:"R = v0^2*sin(2*theta)/g = 400(1)/9.8 = 40.8 m"},{q:"At max height, what is the vertical velocity?",a:"Zero. Only horizontal velocity remains."},{q:"Time of flight for 20m/s at 30 degrees above horizontal?",a:"T = 2*v0*sin(theta)/g = 2(20)(0.5)/9.8 = 2.04s"}]},
    {id:"k2.4",title:"Motion Graphs",yt:"https://www.youtube.com/watch?v=jS6TFKBdCz8",duration:"35:20",hasViz:false,
      questions:[{q:"What does the slope of a position vs time graph represent?",a:"Velocity"},{q:"What does the area under a velocity vs time graph represent?",a:"Displacement"}]},
  ]},
  {id:"u3",title:"3. Forces (Newton's Laws)",lectures:[
    {id:"f3.1",title:"Newton's Laws of Motion",yt:"https://www.youtube.com/watch?v=kKKM8Y-u7ds",duration:"1:10:00",hasViz:true,vizType:"forces",
      questions:[{q:"State Newton's 2nd Law.",a:"F = ma. Net force equals mass times acceleration."},{q:"A 5kg box is pushed with 20N. Friction is 5N. Find acceleration.",a:"F_net = 20-5 = 15N. a = 15/5 = 3 m/s^2"},{q:"What is Newton's 3rd Law?",a:"Every action has an equal and opposite reaction."},{q:"A 10kg object is on a table. What is the normal force?",a:"N = mg = 10(9.8) = 98N"}]},
    {id:"f3.2",title:"Free Body Diagrams",yt:"https://www.youtube.com/watch?v=0BPSR_ClzKo",duration:"22:30",hasViz:true,vizType:"forces",
      questions:[{q:"What forces act on a book sitting on a table?",a:"Weight (mg) downward, Normal force (N) upward. They are equal."},{q:"A box slides down a 30 degree ramp. What is the acceleration (frictionless)?",a:"a = g*sin(30) = 9.8(0.5) = 4.9 m/s^2"}]},
    {id:"f3.3",title:"Friction",yt:"https://www.youtube.com/watch?v=fo_pmp5rtzo",duration:"38:00",hasViz:false,
      questions:[{q:"mu_k = 0.3 for a 10kg block on flat ground. Find kinetic friction.",a:"f = mu_k * N = 0.3(98) = 29.4N"}]},
  ]},
  {id:"u4",title:"4. Work, Energy, Power",lectures:[
    {id:"e4.1",title:"Work and Kinetic Energy",yt:"https://www.youtube.com/watch?v=2WS1sG9fhOk",duration:"55:00",hasViz:true,vizType:"energy",
      questions:[{q:"A 50N force pushes a box 10m. Find the work done.",a:"W = Fd = 50(10) = 500 J"},{q:"Find KE of a 2kg object moving at 5m/s.",a:"KE = 0.5*m*v^2 = 0.5(2)(25) = 25 J"},{q:"State the work energy theorem.",a:"W_net = dKE = 0.5mv^2 - 0.5mv0^2"}]},
    {id:"e4.2",title:"Potential Energy and Conservation",yt:"https://www.youtube.com/watch?v=mhIOylZMg6Q",duration:"48:00",hasViz:true,vizType:"energy",
      questions:[{q:"A 3kg ball is 10m high. Find gravitational PE.",a:"PE = mgh = 3(9.8)(10) = 294 J"},{q:"A ball drops from 20m. Find speed at ground (no friction).",a:"mgh = 0.5mv^2 -> v = sqrt(2gh) = sqrt(392) = 19.8 m/s"}]},
    {id:"e4.3",title:"Power",yt:"https://www.youtube.com/watch?v=3sgLM2Y3vfs",duration:"20:00",hasViz:false,
      questions:[{q:"1000J of work done in 5s. What is the power?",a:"P = W/t = 200 W"}]},
  ]},
  {id:"u5",title:"5. Momentum and Collisions",lectures:[
    {id:"m5.1",title:"Momentum and Impulse",yt:"https://www.youtube.com/watch?v=xVAsBb4YhKs",duration:"52:00",hasViz:false,
      questions:[{q:"Find momentum of a 4kg ball at 6m/s.",a:"p = mv = 24 kg*m/s"},{q:"A 0.5kg ball changes velocity from 10 to -8 m/s. Find impulse.",a:"J = dp = 0.5(-8-10) = -9 N*s"}]},
    {id:"m5.2",title:"Conservation of Momentum",yt:"https://www.youtube.com/watch?v=Y-QOfc2XqOk",duration:"42:00",hasViz:false,
      questions:[{q:"2kg ball at 5m/s hits stationary 3kg ball. They stick. Find final v.",a:"2(5) = 5v -> v = 2 m/s"},{q:"Is momentum conserved in all collisions?",a:"Yes, total momentum is always conserved if no external forces act."}]},
  ]},
  {id:"u6",title:"6. Rotational Motion",lectures:[
    {id:"r6.1",title:"Angular Velocity and Torque",yt:"https://www.youtube.com/watch?v=fmXFWi-WfyU",duration:"58:00",hasViz:false,
      questions:[{q:"Convert 120 rpm to rad/s.",a:"120(2*pi/60) = 4*pi = 12.57 rad/s"},{q:"A 30N force acts 0.5m from pivot. Find torque.",a:"tau = rF = 0.5(30) = 15 N*m"}]},
    {id:"r6.2",title:"Rotational Energy and Angular Momentum",yt:"https://www.youtube.com/watch?v=_WHRWLnVm_M",duration:"45:00",hasViz:false,
      questions:[{q:"Rotational KE formula?",a:"KE_rot = 0.5*I*omega^2"},{q:"Angular momentum formula?",a:"L = I*omega"}]},
  ]},
  {id:"u7",title:"7. Fluids",lectures:[
    {id:"fl7.1",title:"Pressure and Density",yt:"https://www.youtube.com/watch?v=mzjlAla3H1Q",duration:"1:05:00",hasViz:false,
      questions:[{q:"Pressure formula?",a:"P = F/A"},{q:"Find pressure at 10m depth in water (rho=1000).",a:"P = rho*g*h = 1000(9.8)(10) = 98000 Pa"}]},
    {id:"fl7.2",title:"Buoyancy and Archimedes",yt:"https://www.youtube.com/watch?v=2wS2KHpaLBo",duration:"35:00",hasViz:false,
      questions:[{q:"State Archimedes' principle.",a:"Buoyant force = weight of displaced fluid. F_b = rho_fluid * V_displaced * g"}]},
  ]},
  {id:"u8",title:"8. Oscillations and Waves",lectures:[
    {id:"w8.1",title:"Simple Harmonic Motion",yt:"https://www.youtube.com/watch?v=Hbk2t0n0Jf0",duration:"1:08:00",hasViz:true,vizType:"shm",
      questions:[{q:"Period of a spring mass system?",a:"T = 2*pi*sqrt(m/k)"},{q:"Period of a simple pendulum?",a:"T = 2*pi*sqrt(L/g)"},{q:"Spring k=200N/m, x=0.1m. Find restoring force.",a:"F = -kx = -200(0.1) = -20N"}]},
    {id:"w8.2",title:"Mechanical Waves",yt:"https://www.youtube.com/watch?v=TfYCnOvNnFU",duration:"48:00",hasViz:true,vizType:"waves",
      questions:[{q:"Wave speed formula?",a:"v = f*lambda (frequency * wavelength)"},{q:"A wave has f=5Hz and lambda=2m. Find speed.",a:"v = 5(2) = 10 m/s"},{q:"Transverse vs longitudinal wave?",a:"Transverse: displacement perpendicular to travel. Longitudinal: parallel (like sound)."}]},
  ]},
  {id:"u9",title:"9. Electrostatics",lectures:[
    {id:"el9.1",title:"Electric Charge and Coulomb's Law",yt:"https://www.youtube.com/watch?v=GKGsKPeRfPo",duration:"55:00",hasViz:true,vizType:"coulomb",
      questions:[{q:"Coulomb's Law formula?",a:"F = kq1q2/r^2  where k = 8.99*10^9"},{q:"Two charges +2uC and -3uC are 0.5m apart. Find force.",a:"F = (8.99*10^9)(2*10^-6)(3*10^-6)/(0.25) = 0.216N, attractive"}]},
    {id:"el9.2",title:"Electric Field",yt:"https://www.youtube.com/watch?v=mdulzEfQXDE",duration:"42:00",hasViz:true,vizType:"efield",
      questions:[{q:"Electric field formula for point charge?",a:"E = kq/r^2"},{q:"What is the direction of E for a positive charge?",a:"Radially outward from the charge"}]},
    {id:"el9.3",title:"Gauss's Law",yt:"https://www.youtube.com/watch?v=QVTmRa0QOs0",duration:"50:00",hasViz:false,
      questions:[{q:"State Gauss's Law.",a:"Integral E dot dA = Q_enclosed / epsilon_0"}]},
    {id:"el9.4",title:"Electric Potential",yt:"https://www.youtube.com/watch?v=QpVxj3XrLgk",duration:"45:00",hasViz:false,
      questions:[{q:"Potential of point charge?",a:"V = kq/r"},{q:"Relationship between E and V?",a:"E = -dV/dx"}]},
    {id:"el9.5",title:"Capacitance",yt:"https://www.youtube.com/watch?v=u-jigaMJT-A",duration:"38:00",hasViz:false,
      questions:[{q:"Capacitance formula?",a:"C = Q/V"},{q:"Energy stored in capacitor?",a:"U = 0.5*C*V^2"}]},
  ]},
  {id:"u10",title:"10. Circuits",lectures:[
    {id:"c10.1",title:"Current and Ohm's Law",yt:"https://www.youtube.com/watch?v=G3H5lKoWPpY",duration:"52:00",hasViz:true,vizType:"circuit",
      questions:[{q:"Ohm's Law?",a:"V = IR"},{q:"12V battery, 4 ohm resistor. Find current.",a:"I = V/R = 12/4 = 3A"},{q:"Power dissipated by a 6 ohm resistor with 2A?",a:"P = I^2*R = 4(6) = 24W"}]},
    {id:"c10.2",title:"Series and Parallel Circuits",yt:"https://www.youtube.com/watch?v=VV6tZ3Aqfuc",duration:"1:00:00",hasViz:true,vizType:"circuit",
      questions:[{q:"3 ohm and 6 ohm in series. Total R?",a:"R = 3+6 = 9 ohm"},{q:"3 ohm and 6 ohm in parallel. Total R?",a:"1/R = 1/3+1/6 = 1/2 -> R = 2 ohm"}]},
    {id:"c10.3",title:"Kirchhoff's Rules",yt:"https://www.youtube.com/watch?v=3qNuHgmKzGU",duration:"40:00",hasViz:false,
      questions:[{q:"State Kirchhoff's junction rule.",a:"Sum of currents into a node = sum out (conservation of charge)"},{q:"State Kirchhoff's loop rule.",a:"Sum of voltage drops around any closed loop = 0 (conservation of energy)"}]},
  ]},
  {id:"u11",title:"11. Magnetism",lectures:[
    {id:"mg11.1",title:"Magnetic Fields and Forces",yt:"https://www.youtube.com/watch?v=RzR3j3ufijc",duration:"55:00",hasViz:false,
      questions:[{q:"Force on a moving charge in a B field?",a:"F = qv cross B = qvBsin(theta)"},{q:"Direction determined by?",a:"Right hand rule"}]},
    {id:"mg11.2",title:"Electromagnetic Induction",yt:"https://www.youtube.com/watch?v=lePUE9CkPH4",duration:"48:00",hasViz:false,
      questions:[{q:"Faraday's Law?",a:"EMF = -dPhi_B/dt"},{q:"Lenz's Law?",a:"Induced current opposes the change in flux that produced it"}]},
    {id:"mg11.3",title:"Maxwell's Equations",yt:"https://www.youtube.com/watch?v=hJD8kuYGBTM",duration:"35:00",hasViz:false,
      questions:[{q:"How many Maxwell's equations are there?",a:"Four: Gauss (E), Gauss (B), Faraday, Ampere-Maxwell"}]},
  ]},
  {id:"u12",title:"12. Thermodynamics",lectures:[
    {id:"th12.1",title:"Laws of Thermodynamics",yt:"https://www.youtube.com/watch?v=mUdkR9Y2vfg",duration:"1:05:00",hasViz:false,
      questions:[{q:"First Law of Thermodynamics?",a:"dU = Q - W. Internal energy change = heat added minus work done."},{q:"Second Law?",a:"Entropy of an isolated system always increases. Heat flows hot to cold naturally."}]},
    {id:"th12.2",title:"Heat Transfer",yt:"https://www.youtube.com/watch?v=FJaOfQlKrmI",duration:"38:00",hasViz:false,
      questions:[{q:"Three modes of heat transfer?",a:"Conduction, convection, radiation"},{q:"Q = mcdT. 2kg water heated from 20C to 80C. c=4186. Find Q.",a:"Q = 2(4186)(60) = 502320 J"}]},
  ]},
  {id:"u13",title:"13. Optics",lectures:[
    {id:"op13.1",title:"Reflection and Refraction",yt:"https://www.youtube.com/watch?v=K0GVJMytdk0",duration:"52:00",hasViz:false,
      questions:[{q:"Snell's Law?",a:"n1*sin(theta1) = n2*sin(theta2)"},{q:"Light goes from air (n=1) to glass (n=1.5) at 30 degrees. Find refracted angle.",a:"sin(theta2) = sin(30)/1.5 = 0.333 -> theta2 = 19.5 degrees"}]},
    {id:"op13.2",title:"Wave Optics: Interference and Diffraction",yt:"https://www.youtube.com/watch?v=h_GVseWC0N0",duration:"40:00",hasViz:false,
      questions:[{q:"Double slit constructive interference condition?",a:"d*sin(theta) = m*lambda (m = 0, 1, 2...)"}]},
  ]},
  {id:"u14",title:"14. Modern Physics",lectures:[
    {id:"mp14.1",title:"Special Relativity",yt:"https://www.youtube.com/watch?v=msVuCEs8Ydo",duration:"38:00",hasViz:false,
      questions:[{q:"Time dilation formula?",a:"dt = gamma*dt0 where gamma = 1/sqrt(1-v^2/c^2)"},{q:"E = mc^2 means?",a:"Mass and energy are equivalent. Rest energy = mass * speed of light squared."}]},
    {id:"mp14.2",title:"Quantum Mechanics Intro",yt:"https://www.youtube.com/watch?v=p7bzE1E5PMY",duration:"45:00",hasViz:false,
      questions:[{q:"Photon energy formula?",a:"E = hf where h = 6.626*10^-34 J*s"},{q:"De Broglie wavelength?",a:"lambda = h/p = h/(mv)"}]},
  ]},
  {id:"u15",title:"15. Nuclear Physics",lectures:[
    {id:"np15.1",title:"Atomic and Nuclear Structure",yt:"https://www.youtube.com/watch?v=ZEaW_bh5L94",duration:"42:00",hasViz:false,
      questions:[{q:"What holds the nucleus together?",a:"Strong nuclear force, which overcomes electrostatic repulsion between protons"},{q:"What is radioactive decay?",a:"Unstable nuclei emit particles (alpha, beta) or energy (gamma) to become more stable"}]},
    {id:"np15.2",title:"Nuclear Reactions",yt:"https://www.youtube.com/watch?v=E9VnCxfkCP0",duration:"35:00",hasViz:false,
      questions:[{q:"Fission vs fusion?",a:"Fission: heavy nucleus splits. Fusion: light nuclei combine. Both release energy."},{q:"What quantity is conserved in nuclear reactions?",a:"Mass number (A) and atomic number (Z) are conserved."}]},
  ]},
];

const ALL=UNITS.flatMap(u=>u.lectures.map(l=>({...l,unitId:u.id,unitTitle:u.title})));

// ─── CANVAS (local alias) ──────────────────────────────────
function Canvas({draw,width=680,height=380}){
  const ref=useRef(null);
  useEffect(()=>{const c=ref.current;if(!c)return;const ctx=c.getContext("2d");const d=devicePixelRatio||1;c.width=width*d;c.height=height*d;ctx.scale(d,d);draw(ctx,width,height);},[draw,width,height]);
  return <canvas ref={ref} style={{width:"100%",maxWidth:width,height:"auto",aspectRatio:`${width}/${height}`,borderRadius:6,border:`1px solid ${C.border}`,cursor:"crosshair",background:C.graphBg}}/>;
}

// ─── VISUALIZATIONS ─────────────────────────────────────────

function VizVectors(){
  const [mag,setMag]=useState(5),[ang,setAng]=useState(45);
  const [mag2,setMag2]=useState(3),[ang2,setAng2]=useState(120);
  const draw=useCallback((ctx,W,H)=>{
    const P=44,S=30;const cx=W/2,cy=H/2;
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=C.grid;ctx.lineWidth=0.5;
    for(let x=P;x<W-P;x+=S){ctx.beginPath();ctx.moveTo(x,P);ctx.lineTo(x,H-P);ctx.stroke();}
    for(let y=P;y<H-P;y+=S){ctx.beginPath();ctx.moveTo(P,y);ctx.lineTo(W-P,y);ctx.stroke();}
    ctx.strokeStyle=C.axis;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(P,cy);ctx.lineTo(W-P,cy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx,P);ctx.lineTo(cx,H-P);ctx.stroke();
    const r=ang*Math.PI/180,r2=ang2*Math.PI/180;
    const ax=mag*Math.cos(r)*S,ay=-mag*Math.sin(r)*S;
    const bx=mag2*Math.cos(r2)*S,by=-mag2*Math.sin(r2)*S;
    const drawArrow=(ox,oy,dx,dy,col)=>{
      ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+dx,oy+dy);ctx.stroke();
      const a=Math.atan2(dy,dx),sz=8;
      ctx.fillStyle=col;ctx.beginPath();
      ctx.moveTo(ox+dx,oy+dy);
      ctx.lineTo(ox+dx-sz*Math.cos(a-0.4),oy+dy-sz*Math.sin(a-0.4));
      ctx.lineTo(ox+dx-sz*Math.cos(a+0.4),oy+dy-sz*Math.sin(a+0.4));
      ctx.fill();
    };
    ctx.setLineDash([3,3]);ctx.strokeStyle=C.silverLight;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+ax,cy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx+ax,cy);ctx.lineTo(cx+ax,cy+ay);ctx.stroke();
    ctx.setLineDash([]);
    drawArrow(cx,cy,ax,ay,C.blue);
    drawArrow(cx,cy,bx,by,"#a78bfa");
    drawArrow(cx,cy,ax+bx,ay+by,"#34d399");
    ctx.setLineDash([4,3]);ctx.strokeStyle="rgba(52,211,153,0.3)";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(cx+ax,cy+ay);ctx.lineTo(cx+ax+bx,cy+ay+by);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx+bx,cy+by);ctx.lineTo(cx+ax+bx,cy+ay+by);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle=C.text;ctx.font=`12px ${F.sans}`;ctx.textAlign="left";
    const rmag=Math.sqrt((ax+bx)**2+(ay+by)**2)/S;
    const rang=Math.atan2(-(ay+by),(ax+bx))*180/Math.PI;
    ctx.fillText(`A = (${(mag*Math.cos(r)).toFixed(1)}, ${(mag*Math.sin(r)).toFixed(1)})`,P+4,P+14);
    ctx.fillStyle="#a78bfa";ctx.fillText(`B = (${(mag2*Math.cos(r2)).toFixed(1)}, ${(mag2*Math.sin(r2)).toFixed(1)})`,P+4,P+30);
    ctx.fillStyle=C.green;ctx.fillText(`R = A+B  |R| = ${rmag.toFixed(2)}  theta = ${rang.toFixed(1)} deg`,P+4,P+46);
  },[mag,ang,mag2,ang2]);
  return <div><Canvas draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}>
    <Slider label="A magnitude" value={mag} min={0} max={8} step={0.1} onChange={setMag}/>
    <Slider label="A angle (deg)" value={ang} min={0} max={360} step={1} onChange={setAng}/>
    <Slider label="B magnitude" value={mag2} min={0} max={8} step={0.1} onChange={setMag2}/>
    <Slider label="B angle (deg)" value={ang2} min={0} max={360} step={1} onChange={setAng2}/>
  </div><Tip text="Blue = vector A. Purple = vector B. Green = resultant R = A + B. Dashed lines show the parallelogram rule. Components are shown as projections on the axes."/></div>;
}

function VizKinematics(){
  const [v0,setV0]=useState(10),[a,setA]=useState(-2),[t,setT]=useState(0);
  const draw=useCallback((ctx,W,H)=>{
    const P=44,tMax=10;
    const tx=t=>P+((t)/tMax)*(W-2*P);
    const positions=[];for(let i=0;i<=100;i++){const tt=i*tMax/100;const x=v0*tt+0.5*a*tt*tt;positions.push({t:tt,x});}
    const xMin=Math.min(...positions.map(p=>p.x))-2,xMax=Math.max(...positions.map(p=>p.x))+2;
    const ty=x=>P+((xMax-x)/(xMax-xMin))*(H-2*P);
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=C.grid;ctx.lineWidth=0.5;
    for(let i=0;i<=tMax;i++){ctx.beginPath();ctx.moveTo(tx(i),P);ctx.lineTo(tx(i),H-P);ctx.stroke();}
    ctx.strokeStyle=C.axis;ctx.lineWidth=1;
    if(xMin<=0&&xMax>=0){ctx.beginPath();ctx.moveTo(P,ty(0));ctx.lineTo(W-P,ty(0));ctx.stroke();}
    ctx.beginPath();ctx.moveTo(P,H-P);ctx.lineTo(W-P,H-P);ctx.stroke();
    ctx.strokeStyle=C.blue;ctx.lineWidth=2;ctx.beginPath();
    positions.forEach((p,i)=>{if(i===0)ctx.moveTo(tx(p.t),ty(p.x));else ctx.lineTo(tx(p.t),ty(p.x));});
    ctx.stroke();
    const curX=v0*t+0.5*a*t*t;const curV=v0+a*t;
    ctx.beginPath();ctx.arc(tx(t),ty(curX),5,0,Math.PI*2);ctx.fillStyle=C.blue;ctx.fill();
    ctx.fillStyle=C.text;ctx.font=`12px ${F.sans}`;ctx.textAlign="left";
    ctx.fillText(`x(t) = ${v0}t + 0.5(${a})t^2`,P+8,P+16);
    ctx.fillStyle=C.textMid;ctx.font=`11px ${F.mono}`;
    ctx.fillText(`t=${t.toFixed(1)}s  x=${curX.toFixed(1)}m  v=${curV.toFixed(1)}m/s`,P+8,P+34);
  },[v0,a,t]);
  return <div><Canvas draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
    <Slider label="v0 (m/s)" value={v0} min={-10} max={20} step={0.5} onChange={setV0}/>
    <Slider label="a (m/s^2)" value={a} min={-5} max={5} step={0.1} onChange={setA}/>
    <Slider label="time (s)" value={t} min={0} max={10} step={0.1} onChange={setT}/>
  </div><Tip text="This is the position vs time graph. The curve shape depends on acceleration: constant a gives a parabola. Drag time to see position and velocity at each moment."/></div>;
}

function VizProjectile(){
  const [v0,setV0]=useState(25),[ang,setAng]=useState(45);
  const draw=useCallback((ctx,W,H)=>{
    const P=44,g=9.8;const r=ang*Math.PI/180;
    const vx=v0*Math.cos(r),vy=v0*Math.sin(r);
    const tFlight=2*vy/g,maxH=vy*vy/(2*g),range=vx*tFlight;
    const sx=Math.max(range*1.2,10),sy=Math.max(maxH*1.4,10);
    const tx=x=>P+(x/sx)*(W-2*P),ty=y=>H-P-(y/sy)*(H-2*P);
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=C.axis;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(P,H-P);ctx.lineTo(W-P,H-P);ctx.stroke();
    ctx.beginPath();ctx.moveTo(P,P);ctx.lineTo(P,H-P);ctx.stroke();
    ctx.strokeStyle=C.blue;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=200;i++){const t=i*tFlight/200;const x=vx*t,y=vy*t-0.5*g*t*t;
    if(y<0)break;if(i===0)ctx.moveTo(tx(x),ty(y));else ctx.lineTo(tx(x),ty(y));}
    ctx.stroke();
    ctx.setLineDash([3,3]);ctx.strokeStyle=C.silverLight;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(tx(range/2),ty(maxH));ctx.lineTo(tx(range/2),ty(0));ctx.stroke();
    ctx.beginPath();ctx.moveTo(P,ty(maxH));ctx.lineTo(tx(range/2),ty(maxH));ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();ctx.arc(tx(range/2),ty(maxH),4,0,Math.PI*2);ctx.fillStyle=C.blue;ctx.fill();
    ctx.fillStyle=C.text;ctx.font=`12px ${F.sans}`;ctx.textAlign="left";
    ctx.fillText(`v0 = ${v0} m/s   theta = ${ang} deg`,P+8,P+16);
    ctx.fillStyle=C.textMid;ctx.font=`11px ${F.mono}`;
    ctx.fillText(`range = ${range.toFixed(1)}m   max height = ${maxH.toFixed(1)}m   time = ${tFlight.toFixed(2)}s`,P+8,P+34);
  },[v0,ang]);
  return <div><Canvas draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}>
    <Slider label="Launch speed (m/s)" value={v0} min={5} max={50} step={1} onChange={setV0}/>
    <Slider label="Launch angle (deg)" value={ang} min={5} max={85} step={1} onChange={setAng}/>
  </div><Tip text="45 degrees gives maximum range (for flat ground). Horizontal velocity stays constant. Vertical velocity changes due to gravity. At the peak, vertical velocity = 0."/></div>;
}

function VizForces(){
  const [mass,setMass]=useState(5),[F_app,setFApp]=useState(20),[angle,setAngle]=useState(0),[mu,setMu]=useState(0.2);
  const draw=useCallback((ctx,W,H)=>{
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H);
    const bx=W/2-30,by=H/2-15,bw=60,bh=30;
    ctx.fillStyle=C.panel;ctx.strokeStyle=C.axis;ctx.lineWidth=1;
    ctx.fillRect(bx,by,bw,bh);ctx.strokeRect(bx,by,bw,bh);
    ctx.fillStyle=C.text;ctx.font=`11px ${F.sans}`;ctx.textAlign="center";
    ctx.fillText(`${mass}kg`,bx+bw/2,by+bh/2+4);
    const g=9.8,r=angle*Math.PI/180;
    const N=mass*g-F_app*Math.sin(r);
    const f=mu*Math.max(N,0);
    const Fx=F_app*Math.cos(r)-f;
    const acc=Fx/mass;
    const sc=2;
    const drawForce=(ox,oy,dx,dy,col,label)=>{
      if(Math.abs(dx)<0.5&&Math.abs(dy)<0.5)return;
      ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+dx*sc,oy-dy*sc);ctx.stroke();
      const a2=Math.atan2(-dy,dx),sz=8;
      ctx.fillStyle=col;ctx.beginPath();
      ctx.moveTo(ox+dx*sc,oy-dy*sc);
      ctx.lineTo(ox+dx*sc-sz*Math.cos(a2-0.4),oy-dy*sc+sz*Math.sin(a2-0.4));
      ctx.lineTo(ox+dx*sc-sz*Math.cos(a2+0.4),oy-dy*sc+sz*Math.sin(a2+0.4));
      ctx.fill();
      ctx.fillStyle=col;ctx.font=`10px ${F.mono}`;ctx.textAlign="center";
      ctx.fillText(label,ox+dx*sc*0.5+(dy>2?12:0),oy-dy*sc-(dx>2?8:0)-4);
    };
    const cx=bx+bw/2,cy=by+bh/2;
    drawForce(cx,cy,F_app*Math.cos(r),F_app*Math.sin(r),C.blue,`F=${F_app.toFixed(0)}N`);
    drawForce(cx,cy,0,-mass*g,"#f87171",`W=${(mass*g).toFixed(0)}N`);
    drawForce(cx,cy,0,Math.max(N,0),C.green,`N=${Math.max(N,0).toFixed(1)}N`);
    if(f>0.5)drawForce(cx,cy,-f,0,"#fbbf24",`f=${f.toFixed(1)}N`);
    ctx.fillStyle=C.text;ctx.font=`12px ${F.sans}`;ctx.textAlign="left";
    ctx.fillText("Free Body Diagram",44,30);
    ctx.fillStyle=C.textMid;ctx.font=`11px ${F.mono}`;
    ctx.fillText(`F_net = ${Fx.toFixed(1)}N   a = ${acc.toFixed(2)} m/s^2`,44,48);
  },[mass,F_app,angle,mu]);
  return <div><Canvas draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}>
    <Slider label="Mass (kg)" value={mass} min={1} max={20} step={0.5} onChange={setMass}/>
    <Slider label="Applied Force (N)" value={F_app} min={0} max={100} step={1} onChange={setFApp}/>
    <Slider label="Force angle (deg)" value={angle} min={0} max={60} step={1} onChange={setAngle}/>
    <Slider label="mu (friction)" value={mu} min={0} max={0.8} step={0.05} onChange={setMu}/>
  </div><Tip text="Blue = applied force. Red = weight. Green = normal force. Gold = friction. Change the angle and watch how force components shift between horizontal and vertical. F=ma gives acceleration from net force."/></div>;
}

function VizEnergy(){
  const [h,setH]=useState(10),[m,setM]=useState(2),[pos,setPos]=useState(0);
  const g=9.8;
  const draw=useCallback((ctx,W,H2)=>{
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H2);
    const P=44,barW=(W-2*P)*0.6;
    const curH=h*(1-pos);const v=Math.sqrt(2*g*h*pos);
    const PE=m*g*curH,KE=0.5*m*v*v,total=m*g*h;
    const maxE=total*1.1||1;
    const bw=40,gap=20,startX=P+20;
    const barH2=H2-2*P-20;
    [{val:PE,col:C.blue,label:"PE"},{val:KE,col:"#34d399",label:"KE"},{val:total,col:C.silver,label:"Total"}].forEach((b,i)=>{
      const bx=startX+i*(bw+gap);
      const bh=(b.val/maxE)*barH2;
      ctx.fillStyle=b.col+"22";ctx.fillRect(bx,H2-P-bh,bw,bh);
      ctx.strokeStyle=b.col;ctx.lineWidth=1;ctx.strokeRect(bx,H2-P-bh,bw,bh);
      ctx.fillStyle=b.col;ctx.font=`10px ${F.mono}`;ctx.textAlign="center";
      ctx.fillText(`${b.val.toFixed(0)}J`,bx+bw/2,H2-P-bh-6);
      ctx.fillStyle=C.textDim;ctx.fillText(b.label,bx+bw/2,H2-P+14);
    });
    const ballX=W*0.7,groundY=H2-P,topY=P+20;
    ctx.strokeStyle=C.silverLight;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(ballX,groundY);ctx.lineTo(ballX,topY);ctx.stroke();
    const ballY=topY+(groundY-topY)*pos;
    ctx.beginPath();ctx.arc(ballX,ballY,10,0,Math.PI*2);ctx.fillStyle=C.blue;ctx.fill();
    ctx.fillStyle=C.textMid;ctx.font=`10px ${F.mono}`;ctx.textAlign="left";
    ctx.fillText(`h = ${curH.toFixed(1)}m`,ballX+16,ballY-4);
    ctx.fillText(`v = ${v.toFixed(1)}m/s`,ballX+16,ballY+12);
    ctx.fillStyle=C.text;ctx.font=`12px ${F.sans}`;ctx.textAlign="left";
    ctx.fillText(`m = ${m}kg   h0 = ${h}m`,P+8,P+14);
  },[h,m,pos]);
  return <div><Canvas draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
    <Slider label="Height (m)" value={h} min={1} max={30} step={1} onChange={setH}/>
    <Slider label="Mass (kg)" value={m} min={0.5} max={10} step={0.5} onChange={setM}/>
    <Slider label="Fall position" value={pos} min={0} max={1} step={0.01} onChange={setPos}/>
  </div><Tip text="As the ball falls, PE converts to KE. Total energy stays constant (conservation). At the top: all PE. At the bottom: all KE. Drag the position slider to see the energy transform."/></div>;
}

function VizSHM(){
  const [k,setK]=useState(50),[m,setM]=useState(1),[amp,setAmp]=useState(1),[t,setT]=useState(0);
  const draw=useCallback((ctx,W,H)=>{
    const P=44,omega=Math.sqrt(k/m),period=2*Math.PI/omega;
    const x=amp*Math.cos(omega*t),v=-amp*omega*Math.sin(omega*t);
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H);
    const tMax=period*2.5||5;
    const tx=tt=>P+(tt/tMax)*(W-2*P);
    const ty=val=>H/2-val/(amp*1.3)*(H/2-P);
    ctx.strokeStyle=C.grid;ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(P,H/2);ctx.lineTo(W-P,H/2);ctx.stroke();
    ctx.strokeStyle=C.blue;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=300;i++){const tt=i*tMax/300;const xx=amp*Math.cos(omega*tt);
    if(i===0)ctx.moveTo(tx(tt),ty(xx));else ctx.lineTo(tx(tt),ty(xx));}
    ctx.stroke();
    ctx.beginPath();ctx.arc(tx(t),ty(x),5,0,Math.PI*2);ctx.fillStyle=C.blue;ctx.fill();
    const springY=ty(x);
    ctx.strokeStyle=C.silverLight;ctx.lineWidth=1;
    ctx.setLineDash([2,2]);ctx.beginPath();ctx.moveTo(tx(t),springY);ctx.lineTo(tx(t),H/2);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=C.text;ctx.font=`12px ${F.sans}`;ctx.textAlign="left";
    ctx.fillText(`SHM: x = ${amp}cos(${omega.toFixed(1)}t)`,P+8,P+14);
    ctx.fillStyle=C.textMid;ctx.font=`11px ${F.mono}`;
    ctx.fillText(`T = ${period.toFixed(2)}s  x = ${x.toFixed(2)}m  v = ${v.toFixed(2)}m/s`,P+8,P+32);
  },[k,m,amp,t]);
  return <div><Canvas draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}>
    <Slider label="k (N/m)" value={k} min={10} max={200} step={5} onChange={setK}/>
    <Slider label="mass (kg)" value={m} min={0.1} max={5} step={0.1} onChange={setM}/>
    <Slider label="amplitude (m)" value={amp} min={0.1} max={3} step={0.1} onChange={setAmp}/>
    <Slider label="time (s)" value={t} min={0} max={10} step={0.05} onChange={setT}/>
  </div><Tip text="SHM: the restoring force is proportional to displacement (F=-kx). Period T = 2*pi*sqrt(m/k). Stiffer spring (higher k) = faster oscillation. More mass = slower."/></div>;
}

function VizWaves(){
  const [freq,setFreq]=useState(2),[wl,setWl]=useState(1),[amp,setAmp]=useState(1),[t,setT]=useState(0);
  const draw=useCallback((ctx,W,H)=>{
    const P=44;
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=C.axis;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(P,H/2);ctx.lineTo(W-P,H/2);ctx.stroke();
    const xMax=4;
    const tx=x=>P+(x/xMax)*(W-2*P);
    const ty=y=>H/2-y/(amp*1.3)*(H/2-P);
    const k2=2*Math.PI/wl,omega=2*Math.PI*freq;
    ctx.strokeStyle=C.blue;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=500;i++){const x=i*xMax/500;const y=amp*Math.sin(k2*x-omega*t);
    if(i===0)ctx.moveTo(tx(x),ty(y));else ctx.lineTo(tx(x),ty(y));}
    ctx.stroke();
    const v=freq*wl;
    ctx.fillStyle=C.text;ctx.font=`12px ${F.sans}`;ctx.textAlign="left";
    ctx.fillText(`y = ${amp}sin(${k2.toFixed(1)}x - ${omega.toFixed(1)}t)`,P+8,P+14);
    ctx.fillStyle=C.textMid;ctx.font=`11px ${F.mono}`;
    ctx.fillText(`v = f*lambda = ${freq}*${wl} = ${v.toFixed(1)} m/s`,P+8,P+32);
  },[freq,wl,amp,t]);
  return <div><Canvas draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}>
    <Slider label="Frequency (Hz)" value={freq} min={0.5} max={5} step={0.1} onChange={setFreq}/>
    <Slider label="Wavelength (m)" value={wl} min={0.2} max={3} step={0.1} onChange={setWl}/>
    <Slider label="Amplitude" value={amp} min={0.1} max={2} step={0.1} onChange={setAmp}/>
    <Slider label="Time" value={t} min={0} max={5} step={0.02} onChange={setT}/>
  </div><Tip text="v = f*lambda. Wave speed = frequency * wavelength. Drag time to see the wave move. Higher frequency = more oscillations per second. Shorter wavelength = waves packed tighter."/></div>;
}

function VizCoulomb(){
  const [q1,setQ1]=useState(2),[q2,setQ2]=useState(-3),[r,setR]=useState(0.5);
  const k0=8.99e9;
  const draw=useCallback((ctx,W,H)=>{
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H);
    const cy=H/2,x1=W*0.3,x2=W*0.7;
    const F2=k0*Math.abs(q1*1e-6)*Math.abs(q2*1e-6)/(r*r);
    const attractive=q1*q2<0;
    ctx.beginPath();ctx.arc(x1,cy,18,0,Math.PI*2);ctx.fillStyle=q1>0?C.blue:"#f87171";ctx.fill();
    ctx.fillStyle="#fff";ctx.font=`bold 12px ${F.mono}`;ctx.textAlign="center";
    ctx.fillText(q1>0?"+":"-",x1,cy+4);
    ctx.beginPath();ctx.arc(x2,cy,18,0,Math.PI*2);ctx.fillStyle=q2>0?C.blue:"#f87171";ctx.fill();
    ctx.fillStyle="#fff";ctx.fillText(q2>0?"+":"-",x2,cy+4);
    const aLen=Math.min(60,Math.max(15,F2/500));
    ctx.strokeStyle=C.green;ctx.lineWidth=2;
    if(attractive){
      ctx.beginPath();ctx.moveTo(x1+22,cy);ctx.lineTo(x1+22+aLen,cy);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x2-22,cy);ctx.lineTo(x2-22-aLen,cy);ctx.stroke();
    }else{
      ctx.beginPath();ctx.moveTo(x1-22,cy);ctx.lineTo(x1-22-aLen,cy);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x2+22,cy);ctx.lineTo(x2+22+aLen,cy);ctx.stroke();
    }
    ctx.strokeStyle=C.silverLight;ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(x1,cy+35);ctx.lineTo(x2,cy+35);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=C.textDim;ctx.font=`10px ${F.mono}`;ctx.fillText(`r = ${r.toFixed(2)} m`,(x1+x2)/2,cy+50);
    ctx.fillStyle=C.text;ctx.font=`12px ${F.sans}`;ctx.textAlign="left";
    ctx.fillText(`F = kq1q2/r^2`,44,30);
    ctx.fillStyle=C.textMid;ctx.font=`11px ${F.mono}`;
    ctx.fillText(`F = ${F2.toFixed(3)} N   ${attractive?"attractive":"repulsive"}`,44,48);
  },[q1,q2,r]);
  return <div><Canvas draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
    <Slider label="q1 (uC)" value={q1} min={-5} max={5} step={0.5} onChange={setQ1}/>
    <Slider label="q2 (uC)" value={q2} min={-5} max={5} step={0.5} onChange={setQ2}/>
    <Slider label="r (m)" value={r} min={0.1} max={2} step={0.05} onChange={setR}/>
  </div><Tip text="Like charges repel, opposites attract. Force is proportional to both charges and inversely proportional to distance squared. Halving the distance quadruples the force."/></div>;
}

function VizCircuit(){
  const [V,setV]=useState(12),[R1,setR1]=useState(4),[R2,setR2]=useState(6),[mode,setMode]=useState("series");
  const draw=useCallback((ctx,W,H)=>{
    ctx.fillStyle=C.graphBg;ctx.fillRect(0,0,W,H);
    let Rtot,I,V1,V2;
    if(mode==="series"){Rtot=R1+R2;I=V/Rtot;V1=I*R1;V2=I*R2;}
    else{Rtot=1/(1/R1+1/R2);I=V/Rtot;V1=V;V2=V;}
    const cx=W/2,cy=H/2;
    ctx.strokeStyle=C.silverLight;ctx.lineWidth=2;
    if(mode==="series"){
      ctx.strokeRect(cx-120,cy-40,240,80);
      ctx.fillStyle=C.blueDim;ctx.fillRect(cx-100,cy-15,60,30);ctx.strokeStyle=C.blue;ctx.lineWidth=1;ctx.strokeRect(cx-100,cy-15,60,30);
      ctx.fillStyle=C.blueDim;ctx.fillRect(cx+40,cy-15,60,30);ctx.strokeRect(cx+40,cy-15,60,30);
      ctx.fillStyle=C.text;ctx.font=`11px ${F.mono}`;ctx.textAlign="center";
      ctx.fillText(`${R1}ohm`,cx-70,cy+4);ctx.fillText(`${R2}ohm`,cx+70,cy+4);
    }else{
      ctx.beginPath();ctx.moveTo(cx-100,cy-50);ctx.lineTo(cx+100,cy-50);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx-100,cy+50);ctx.lineTo(cx+100,cy+50);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx-100,cy-50);ctx.lineTo(cx-100,cy+50);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx+100,cy-50);ctx.lineTo(cx+100,cy+50);ctx.stroke();
      ctx.fillStyle=C.blueDim;ctx.fillRect(cx-30,cy-65,60,30);ctx.strokeStyle=C.blue;ctx.lineWidth=1;ctx.strokeRect(cx-30,cy-65,60,30);
      ctx.fillStyle=C.blueDim;ctx.fillRect(cx-30,cy+35,60,30);ctx.strokeRect(cx-30,cy+35,60,30);
      ctx.fillStyle=C.text;ctx.font=`11px ${F.mono}`;ctx.textAlign="center";
      ctx.fillText(`${R1}ohm`,cx,cy-46);ctx.fillText(`${R2}ohm`,cx,cy+54);
    }
    ctx.fillStyle=C.text;ctx.font=`12px ${F.sans}`;ctx.textAlign="left";
    ctx.fillText(`${mode.toUpperCase()}   V = ${V}V`,44,30);
    ctx.fillStyle=C.textMid;ctx.font=`11px ${F.mono}`;
    ctx.fillText(`R_total = ${Rtot.toFixed(2)}ohm   I = ${I.toFixed(2)}A   P = ${(V*I).toFixed(1)}W`,44,48);
    if(mode==="series")ctx.fillText(`V1 = ${V1.toFixed(1)}V   V2 = ${V2.toFixed(1)}V`,44,64);
    else ctx.fillText(`I1 = ${(V/R1).toFixed(2)}A   I2 = ${(V/R2).toFixed(2)}A`,44,64);
  },[V,R1,R2,mode]);
  return <div>
    <div style={{display:"flex",gap:4,marginBottom:8}}>{["series","parallel"].map(m=><button key={m} onClick={()=>setMode(m)} style={{background:m===mode?C.blue:"transparent",color:m===mode?"#fff":C.textDim,border:`1px solid ${m===mode?C.blue:C.border}`,borderRadius:4,padding:"3px 12px",fontFamily:F.sans,fontSize:11,cursor:"pointer"}}>{m}</button>)}</div>
    <Canvas draw={draw}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
    <Slider label="Voltage (V)" value={V} min={1} max={24} step={0.5} onChange={setV}/>
    <Slider label="R1 (ohm)" value={R1} min={1} max={20} step={0.5} onChange={setR1}/>
    <Slider label="R2 (ohm)" value={R2} min={1} max={20} step={0.5} onChange={setR2}/>
  </div><Tip text="Series: R_total = R1+R2, same current through both. Parallel: 1/R = 1/R1+1/R2, same voltage across both. V=IR always."/></div>;
}

const VIZ_MAP={vectors:VizVectors,kinematics:VizKinematics,projectile:VizProjectile,forces:VizForces,energy:VizEnergy,shm:VizSHM,waves:VizWaves,coulomb:VizCoulomb,circuit:VizCircuit,efield:VizCoulomb};

// ─── APP ────────────────────────────────────────────────────
export default function PhysicsLab({onBack}){
  const [view,setView]=useState("map"),[active,setActive]=useState(null),[progress,setProgress]=useState(load);
  useEffect(()=>{save(progress);},[progress]);
  const toggle=(id,s)=>setProgress(p=>{const n={...p};n[id]===s?delete n[id]:n[id]=s;return n;});
  const total=ALL.length,mastered=Object.values(progress).filter(v=>v==="mastered").length;

  if(view==="map")return(
    <div style={{minHeight:"100vh",background:C.bg,padding:"0 24px",maxWidth:720,margin:"0 auto",fontFamily:F.sans}}>
      <div style={{paddingTop:24}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:C.textDim,fontFamily:F.sans,fontSize:12,cursor:"pointer",padding:0,marginBottom:12}}>Back to Home</button>
        <p style={{fontSize:10,fontWeight:600,color:C.silver,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 4px"}}>telpo</p>
        <h1 style={{fontSize:24,fontWeight:600,color:C.text,margin:"0 0 6px"}}>Physics</h1>
        <p style={{fontSize:12,color:C.textDim,margin:"0 0 14px"}}>15 units. Mechanics through quantum. Organic Chemistry Tutor + Professor Dave.</p>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
          <div style={{flex:1,height:2,background:C.border,borderRadius:1,overflow:"hidden"}}><div style={{height:"100%",width:`${(mastered/total)*100}%`,background:C.blue,transition:"width 0.4s"}}/></div>
          <span style={{fontFamily:F.mono,fontSize:10,color:C.textDim}}>{mastered}/{total}</span>
        </div>
      </div>
      {UNITS.map(u=><div key={u.id} style={{marginBottom:24}}>
        <p style={{fontSize:11,fontWeight:600,color:C.textMid,margin:"0 0 6px"}}>{u.title}</p>
        {u.lectures.map(l=>{const s=progress[l.id];return(
          <div key={l.id} onClick={()=>{setActive({...l,unitTitle:u.title});setView("lecture");}}
            style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=C.panel} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <span style={{width:20,height:20,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontFamily:F.mono,fontWeight:600,flexShrink:0,
              background:s==="mastered"?C.greenDim:s==="watched"?C.goldDim:C.panel,
              color:s==="mastered"?C.green:s==="watched"?C.gold:C.textLight,
              border:`1px solid ${s==="mastered"?C.green:s==="watched"?C.gold:C.border}`}}>
              {s==="mastered"?"ok":"o"}</span>
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
      <p style={{textAlign:"center",fontSize:9,color:C.textLight,letterSpacing:1.5,margin:"24px 0 40px"}}>TELPO PHYSICS v1.1</p>
    </div>
  );

  const l=active,Viz=l?.hasViz?VIZ_MAP[l.vizType]||null:null,s=progress[l?.id];
  const eqs = PHYSICS_EQUATIONS[l?.id] || null;

  return(
    <div style={{minHeight:"100vh",background:C.bg,padding:"0 24px",maxWidth:720,margin:"0 auto",fontFamily:F.sans}}>
      <div style={{paddingTop:24}}>
        <button onClick={()=>setView("map")} style={{background:"transparent",border:"none",color:C.textDim,fontFamily:F.sans,fontSize:12,cursor:"pointer",padding:0,marginBottom:16}}>Back</button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <p style={{fontSize:10,fontWeight:600,color:C.silver,letterSpacing:2,textTransform:"uppercase",margin:"0 0 2px"}}>{l.id}</p>
            <h1 style={{fontSize:20,fontWeight:600,color:C.text,margin:"0 0 6px"}}>{l.title}</h1>
          </div>
          <a href={l.yt} target="_blank" rel="noopener noreferrer" style={{
            fontSize:11,color:C.blue,textDecoration:"none",fontFamily:F.mono,
            padding:"6px 12px",border:`1px solid ${C.blue}`,borderRadius:4,flexShrink:0,marginTop:4,
          }}>YouTube</a>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:16}}>
          <span style={{fontSize:11,color:C.textDim,fontFamily:F.mono}}>{l.duration}</span>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {[{k:"watched",l2:"Watched",c:C.gold,bg:C.goldDim},{k:"mastered",l2:"Mastered",c:C.green,bg:C.greenDim}].map(v=>(
            <button key={v.k} onClick={()=>toggle(l.id,v.k)} style={{background:s===v.k?v.bg:"transparent",color:s===v.k?v.c:C.textDim,border:`1px solid ${s===v.k?v.c:C.border}`,borderRadius:3,padding:"5px 12px",fontFamily:F.sans,fontSize:11,cursor:"pointer",fontWeight:500}}>{s===v.k?"ok ":""}{v.l2}</button>))}
        </div>
        {Viz?<Viz/>:l.hasViz?<div style={{padding:24,textAlign:"center",background:C.panel,borderRadius:4,border:`1px solid ${C.border}`,marginBottom:16}}><p style={{color:C.textDim,fontSize:11,margin:0}}>Interactive module queued. We build it when you reach this topic.</p></div>:null}

        {/* Interactive Equations */}
        <EquationExplorer equations={eqs} />

        <Practice questions={l.questions}/>
        <div style={{background:C.panel,borderRadius:4,border:`1px solid ${C.border}`,padding:"12px 14px",margin:"16px 0 40px"}}>
          <p style={{fontSize:10,fontWeight:600,color:C.textDim,letterSpacing:1,textTransform:"uppercase",margin:"0 0 4px"}}>Mastery check</p>
          <p style={{color:C.textMid,fontSize:11,margin:0,lineHeight:1.6}}>Explain the concept out loud without notes. If you can teach it, mark it mastered.</p>
        </div>
      </div>
    </div>
  );
}
