import { useState, useRef, useCallback, useEffect } from "react";
import { C, F } from "./shared_ui";

/*
 * Custom 3D Periodic Table for Telpo
 * All 118 elements with descriptions
 * CSS 3D transforms: drag to rotate, scroll to zoom, click for details
 * Dark theme native, no external dependencies
 */

// ── Element Data (all 118) ──
// [Z, sym, name, mass, category, config, row, col, description]
// category: 0=nonmetal 1=noble 2=alkali 3=alkaline 4=transition 5=post-trans 6=metalloid 7=halogen 8=lanthanide 9=actinide
const EL = [
[1,"H","Hydrogen",1.008,0,"1s1",1,1,"Lightest element. Makes up 75% of all normal matter by mass. Fuel for stars."],
[2,"He","Helium",4.003,1,"1s2",1,18,"Second lightest. Inert noble gas used in balloons and cryogenics. Formed by nuclear fusion in stars."],
[3,"Li","Lithium",6.941,2,"[He]2s1",2,1,"Lightest metal. Used in batteries, mood stabilizers, and lightweight alloys."],
[4,"Be","Beryllium",9.012,3,"[He]2s2",2,2,"Lightweight, strong metal. Used in aerospace and X-ray windows. Toxic dust."],
[5,"B","Boron",10.81,6,"[He]2s2 2p1",2,13,"Metalloid used in glass, detergents, and as a neutron absorber in nuclear reactors."],
[6,"C","Carbon",12.01,0,"[He]2s2 2p2",2,14,"Basis of all organic chemistry and life. Forms diamond, graphite, and fullerenes."],
[7,"N","Nitrogen",14.01,0,"[He]2s2 2p3",2,15,"78% of Earth's atmosphere. Essential for amino acids and DNA. Inert as N2 gas."],
[8,"O","Oxygen",16.00,0,"[He]2s2 2p4",2,16,"21% of atmosphere. Required for respiration and combustion. Most abundant element in Earth's crust."],
[9,"F","Fluorine",19.00,7,"[He]2s2 2p5",2,17,"Most electronegative element. Extremely reactive halogen. Used in toothpaste and Teflon."],
[10,"Ne","Neon",20.18,1,"[He]2s2 2p6",2,18,"Noble gas. Produces red-orange glow in discharge tubes. Used in neon signs."],
[11,"Na","Sodium",22.99,2,"[Ne]3s1",3,1,"Soft, reactive alkali metal. Essential for nerve function. Reacts violently with water."],
[12,"Mg","Magnesium",24.31,3,"[Ne]3s2",3,2,"Lightweight structural metal. Burns with bright white flame. Essential for chlorophyll."],
[13,"Al","Aluminum",26.98,5,"[Ne]3s2 3p1",3,13,"Most abundant metal in Earth's crust. Lightweight, corrosion-resistant. Used in cans and aircraft."],
[14,"Si","Silicon",28.09,6,"[Ne]3s2 3p2",3,14,"Second most abundant element in crust. Basis of semiconductor technology and computer chips."],
[15,"P","Phosphorus",30.97,0,"[Ne]3s2 3p3",3,15,"Essential for DNA, RNA, and ATP. White phosphorus glows in dark and is highly toxic."],
[16,"S","Sulfur",32.07,0,"[Ne]3s2 3p4",3,16,"Yellow solid with distinctive smell. Used in vulcanizing rubber, gunpowder, and sulfuric acid."],
[17,"Cl","Chlorine",35.45,7,"[Ne]3s2 3p5",3,17,"Toxic green gas. Used to purify water and make PVC plastic. Essential for stomach acid (HCl)."],
[18,"Ar","Argon",39.95,1,"[Ne]3s2 3p6",3,18,"Most abundant noble gas in atmosphere (0.93%). Used in welding and incandescent light bulbs."],
[19,"K","Potassium",39.10,2,"[Ar]4s1",4,1,"Essential for nerve signals and muscle contraction. Reacts with water more violently than sodium."],
[20,"Ca","Calcium",40.08,3,"[Ar]4s2",4,2,"Most abundant metal in the human body. Builds bones and teeth. Essential for muscle function."],
[21,"Sc","Scandium",44.96,4,"[Ar]3d1 4s2",4,3,"Light transition metal. Used in aluminum-scandium alloys for aerospace."],
[22,"Ti","Titanium",47.87,4,"[Ar]3d2 4s2",4,4,"Strong, lightweight, corrosion-resistant. Used in aircraft, implants, and spacecraft."],
[23,"V","Vanadium",50.94,4,"[Ar]3d3 4s2",4,5,"Hard steel-gray metal. Used to strengthen steel. Named after Norse goddess Vanadis."],
[24,"Cr","Chromium",52.00,4,"[Ar]3d5 4s1",4,6,"Hard, shiny metal. Chrome plating prevents corrosion. Gives rubies their red color."],
[25,"Mn","Manganese",54.94,4,"[Ar]3d5 4s2",4,7,"Essential for steel production. Required by many enzymes in the body."],
[26,"Fe","Iron",55.85,4,"[Ar]3d6 4s2",4,8,"Most used metal. Core of Earth is mostly iron. Essential for hemoglobin in blood."],
[27,"Co","Cobalt",58.93,4,"[Ar]3d7 4s2",4,9,"Used in superalloys and lithium-ion batteries. Gives glass a deep blue color."],
[28,"Ni","Nickel",58.69,4,"[Ar]3d8 4s2",4,10,"Corrosion-resistant. Used in stainless steel, coins, and rechargeable batteries."],
[29,"Cu","Copper",63.55,4,"[Ar]3d10 4s1",4,11,"Excellent electrical conductor. Used in wiring, plumbing, and electronics since antiquity."],
[30,"Zn","Zinc",65.38,4,"[Ar]3d10 4s2",4,12,"Protects iron from rusting (galvanization). Essential trace element for immune function."],
[31,"Ga","Gallium",69.72,5,"[Ar]3d10 4s2 4p1",4,13,"Melts in your hand (mp 29.8C). Used in LEDs, solar cells, and semiconductors."],
[32,"Ge","Germanium",72.63,6,"[Ar]3d10 4s2 4p2",4,14,"Metalloid semiconductor. Used in fiber optics, infrared optics, and early transistors."],
[33,"As","Arsenic",74.92,6,"[Ar]3d10 4s2 4p3",4,15,"Toxic metalloid historically used as poison. Used in semiconductors (GaAs)."],
[34,"Se","Selenium",78.97,0,"[Ar]3d10 4s2 4p4",4,16,"Essential trace element. Used in glassmaking and electronics. Toxic in large amounts."],
[35,"Br","Bromine",79.90,7,"[Ar]3d10 4s2 4p5",4,17,"Only nonmetal liquid at room temperature (besides mercury). Used in flame retardants."],
[36,"Kr","Krypton",83.80,1,"[Ar]3d10 4s2 4p6",4,18,"Noble gas. Used in high-performance flash photography and some fluorescent lighting."],
[37,"Rb","Rubidium",85.47,2,"[Kr]5s1",5,1,"Highly reactive alkali metal. Used in atomic clocks and specialty glass."],
[38,"Sr","Strontium",87.62,3,"[Kr]5s2",5,2,"Burns with bright red flame (used in fireworks). Chemically similar to calcium."],
[39,"Y","Yttrium",88.91,4,"[Kr]4d1 5s2",5,3,"Used in LEDs, lasers, and superconductors. Named after village of Ytterby, Sweden."],
[40,"Zr","Zirconium",91.22,4,"[Kr]4d2 5s2",5,4,"Highly corrosion-resistant. Used in nuclear reactors and artificial gemstones (cubic zirconia)."],
[41,"Nb","Niobium",92.91,4,"[Kr]4d4 5s1",5,5,"Superconducting metal. Used in MRI magnets and rocket nozzles."],
[42,"Mo","Molybdenum",95.95,4,"[Kr]4d5 5s1",5,6,"High melting point metal. Essential trace element. Strengthens steel alloys."],
[43,"Tc","Technetium",97,4,"[Kr]4d5 5s2",5,7,"First artificially produced element. Radioactive. Used in medical imaging."],
[44,"Ru","Ruthenium",101.1,4,"[Kr]4d7 5s1",5,8,"Hard platinum-group metal. Used in electronics and as a catalyst."],
[45,"Rh","Rhodium",102.9,4,"[Kr]4d8 5s1",5,9,"Most expensive precious metal. Used in catalytic converters and jewelry plating."],
[46,"Pd","Palladium",106.4,4,"[Kr]4d10",5,10,"Absorbs 900x its own volume of hydrogen. Used in catalytic converters and electronics."],
[47,"Ag","Silver",107.9,4,"[Kr]4d10 5s1",5,11,"Highest electrical conductivity of any element. Used in jewelry, photography, electronics."],
[48,"Cd","Cadmium",112.4,4,"[Kr]4d10 5s2",5,12,"Toxic heavy metal. Used in batteries (NiCd) and pigments. Environmental pollutant."],
[49,"In","Indium",114.8,5,"[Kr]4d10 5s2 5p1",5,13,"Soft metal used in touchscreens (ITO), solders, and semiconductors."],
[50,"Sn","Tin",118.7,5,"[Kr]4d10 5s2 5p2",5,14,"Used since antiquity in bronze. Used in tin cans, solder, and pewter."],
[51,"Sb","Antimony",121.8,6,"[Kr]4d10 5s2 5p3",5,15,"Metalloid used in flame retardants, batteries, and semiconductors."],
[52,"Te","Tellurium",127.6,6,"[Kr]4d10 5s2 5p4",5,16,"Rare metalloid used in solar panels, thermoelectric devices, and alloys."],
[53,"I","Iodine",126.9,7,"[Kr]4d10 5s2 5p5",5,17,"Essential for thyroid hormones. Sublimes to violet vapor. Antiseptic in medicine."],
[54,"Xe","Xenon",131.3,1,"[Kr]4d10 5s2 5p6",5,18,"Noble gas used in arc lamps, flash photography, and ion propulsion engines."],
[55,"Cs","Cesium",132.9,2,"[Xe]6s1",6,1,"Most reactive metal. Used in atomic clocks (defines the second). Melts at 28.4C."],
[56,"Ba","Barium",137.3,3,"[Xe]6s2",6,2,"Green flame in fireworks. Barium sulfate used as contrast agent in X-rays."],
[57,"La","Lanthanum",138.9,8,"[Xe]5d1 6s2",9,3,"First lanthanide. Used in camera lenses, catalysts, and hybrid car batteries."],
[58,"Ce","Cerium",140.1,8,"[Xe]4f1 5d1 6s2",9,4,"Most abundant rare earth. Used in catalytic converters, self-cleaning ovens."],
[59,"Pr","Praseodymium",140.9,8,"[Xe]4f3 6s2",9,5,"Used in aircraft engines and strong magnets. Gives glass a green color."],
[60,"Nd","Neodymium",144.2,8,"[Xe]4f4 6s2",9,6,"Makes the strongest permanent magnets (NdFeB). Used in headphones and hard drives."],
[61,"Pm","Promethium",145,8,"[Xe]4f5 6s2",9,7,"Radioactive. Only lanthanide with no stable isotopes. Used in nuclear batteries."],
[62,"Sm","Samarium",150.4,8,"[Xe]4f6 6s2",9,8,"Used in samarium-cobalt magnets. Has medical applications in cancer treatment."],
[63,"Eu","Europium",152.0,8,"[Xe]4f7 6s2",9,9,"Used in red phosphors for TVs and Euro banknote anti-counterfeiting."],
[64,"Gd","Gadolinium",157.3,8,"[Xe]4f7 5d1 6s2",9,10,"Used as MRI contrast agent. Has unusual magnetic properties."],
[65,"Tb","Terbium",158.9,8,"[Xe]4f9 6s2",9,11,"Used in green phosphors for displays and solid-state devices."],
[66,"Dy","Dysprosium",162.5,8,"[Xe]4f10 6s2",9,12,"Used in NdFeB magnets for high-temperature applications and nuclear reactors."],
[67,"Ho","Holmium",164.9,8,"[Xe]4f11 6s2",9,13,"Strongest magnetic moment of any element. Used in specialized lasers."],
[68,"Er","Erbium",167.3,8,"[Xe]4f12 6s2",9,14,"Pink-colored compounds. Used in fiber optic amplifiers for telecommunications."],
[69,"Tm","Thulium",168.9,8,"[Xe]4f13 6s2",9,15,"Rarest naturally occurring lanthanide. Used in portable X-ray devices."],
[70,"Yb","Ytterbium",173.0,8,"[Xe]4f14 6s2",9,16,"Used in atomic clocks, lasers, and metallurgy."],
[71,"Lu","Lutetium",175.0,8,"[Xe]4f14 5d1 6s2",9,17,"Densest and hardest lanthanide. Used in PET scan detectors."],
[72,"Hf","Hafnium",178.5,4,"[Xe]4f14 5d2 6s2",6,4,"Used in nuclear reactor control rods and high-temperature alloys."],
[73,"Ta","Tantalum",180.9,4,"[Xe]4f14 5d3 6s2",6,5,"Highly corrosion-resistant. Used in capacitors for electronics and surgical implants."],
[74,"W","Tungsten",183.8,4,"[Xe]4f14 5d4 6s2",6,6,"Highest melting point of all elements (3422C). Used in light bulb filaments."],
[75,"Re","Rhenium",186.2,4,"[Xe]4f14 5d5 6s2",6,7,"One of the rarest elements. Used in jet engine superalloys."],
[76,"Os","Osmium",190.2,4,"[Xe]4f14 5d6 6s2",6,8,"Densest naturally occurring element. Used in fountain pen tips and electrical contacts."],
[77,"Ir","Iridium",192.2,4,"[Xe]4f14 5d7 6s2",6,9,"Most corrosion-resistant metal. Iridium layer marks the asteroid that killed the dinosaurs."],
[78,"Pt","Platinum",195.1,4,"[Xe]4f14 5d9 6s1",6,10,"Precious metal used in catalytic converters, jewelry, and cancer drugs."],
[79,"Au","Gold",197.0,4,"[Xe]4f14 5d10 6s1",6,11,"Does not corrode. Used in jewelry, electronics, and as monetary standard for millennia."],
[80,"Hg","Mercury",200.6,4,"[Xe]4f14 5d10 6s2",6,12,"Only metal liquid at room temperature. Used in thermometers. Highly toxic."],
[81,"Tl","Thallium",204.4,5,"[Xe]4f14 5d10 6s2 6p1",6,13,"Extremely toxic. Was used as rat poison. Used in specialized electronics."],
[82,"Pb","Lead",207.2,5,"[Xe]4f14 5d10 6s2 6p2",6,14,"Dense, soft, toxic metal. Formerly in paint and gasoline. Used in batteries and radiation shielding."],
[83,"Bi","Bismuth",209.0,5,"[Xe]4f14 5d10 6s2 6p3",6,15,"Least toxic heavy metal. Forms rainbow oxide crystals. Used in Pepto-Bismol."],
[84,"Po","Polonium",209,6,"[Xe]4f14 5d10 6s2 6p4",6,16,"Highly radioactive. Discovered by Marie Curie. Used in anti-static devices."],
[85,"At","Astatine",210,7,"[Xe]4f14 5d10 6s2 6p5",6,17,"Rarest natural element on Earth. Radioactive halogen. Very few atoms exist at any time."],
[86,"Rn","Radon",222,1,"[Xe]4f14 5d10 6s2 6p6",6,18,"Radioactive noble gas. Natural decay product of uranium. Health hazard in basements."],
[87,"Fr","Francium",223,2,"[Rn]7s1",7,1,"Most unstable natural element. Extremely radioactive. Only ~30g exists on Earth at once."],
[88,"Ra","Radium",226,3,"[Rn]7s2",7,2,"Radioactive. Glows blue. Discovered by Marie and Pierre Curie. Formerly used in watch dials."],
[89,"Ac","Actinium",227,9,"[Rn]6d1 7s2",10,3,"Radioactive. First of the actinide series. Glows blue in the dark."],
[90,"Th","Thorium",232.0,9,"[Rn]6d2 7s2",10,4,"Radioactive but abundant. Potential nuclear fuel alternative to uranium."],
[91,"Pa","Protactinium",231.0,9,"[Rn]5f2 6d1 7s2",10,5,"Rare, radioactive. One of rarest naturally occurring elements."],
[92,"U","Uranium",238.0,9,"[Rn]5f3 6d1 7s2",10,6,"Fuel for nuclear power and weapons. Very dense (19.1 g/cm3). Weakly radioactive."],
[93,"Np","Neptunium",237,9,"[Rn]5f4 6d1 7s2",10,7,"First transuranium element. Produced in nuclear reactors. Named after Neptune."],
[94,"Pu","Plutonium",244,9,"[Rn]5f6 7s2",10,8,"Used in nuclear weapons and spacecraft power (RTGs). Extremely toxic."],
[95,"Am","Americium",243,9,"[Rn]5f7 7s2",10,9,"Used in smoke detectors. Produced in nuclear reactors."],
[96,"Cm","Curium",247,9,"[Rn]5f7 6d1 7s2",10,10,"Named after Marie and Pierre Curie. Used as power source in space missions."],
[97,"Bk","Berkelium",247,9,"[Rn]5f9 7s2",10,11,"Named after Berkeley, California. Produced in microgram quantities."],
[98,"Cf","Californium",251,9,"[Rn]5f10 7s2",10,12,"Used in nuclear reactor startup and cancer treatment. Named after California."],
[99,"Es","Einsteinium",252,9,"[Rn]5f11 7s2",10,13,"Discovered in fallout of first hydrogen bomb test. Named after Einstein."],
[100,"Fm","Fermium",257,9,"[Rn]5f12 7s2",10,14,"Also discovered in H-bomb debris. Named after Enrico Fermi."],
[101,"Md","Mendelevium",258,9,"[Rn]5f13 7s2",10,15,"Named after Dmitri Mendeleev, creator of the periodic table."],
[102,"No","Nobelium",259,9,"[Rn]5f14 7s2",10,16,"Named after Alfred Nobel. Only produced a few atoms at a time."],
[103,"Lr","Lawrencium",266,9,"[Rn]5f14 7s2 7p1",10,17,"Last actinide. Named after Ernest Lawrence, inventor of the cyclotron."],
[104,"Rf","Rutherfordium",267,4,"[Rn]5f14 6d2 7s2",7,4,"Synthetic. Named after Ernest Rutherford. Exists for seconds."],
[105,"Db","Dubnium",268,4,"[Rn]5f14 6d3 7s2",7,5,"Synthetic. Named after Dubna, Russia."],
[106,"Sg","Seaborgium",269,4,"[Rn]5f14 6d4 7s2",7,6,"Synthetic. Named after Glenn Seaborg."],
[107,"Bh","Bohrium",270,4,"[Rn]5f14 6d5 7s2",7,7,"Synthetic. Named after Niels Bohr."],
[108,"Hs","Hassium",277,4,"[Rn]5f14 6d6 7s2",7,8,"Synthetic. Named after Hesse, Germany."],
[109,"Mt","Meitnerium",278,4,"[Rn]5f14 6d7 7s2",7,9,"Synthetic. Named after Lise Meitner, pioneer of nuclear fission."],
[110,"Ds","Darmstadtium",281,4,"[Rn]5f14 6d8 7s2",7,10,"Synthetic. Named after Darmstadt, Germany."],
[111,"Rg","Roentgenium",282,4,"[Rn]5f14 6d9 7s2",7,11,"Synthetic. Named after Wilhelm Roentgen, discoverer of X-rays."],
[112,"Cn","Copernicium",285,4,"[Rn]5f14 6d10 7s2",7,12,"Synthetic. Named after Nicolaus Copernicus."],
[113,"Nh","Nihonium",286,5,"[Rn]5f14 6d10 7s2 7p1",7,13,"Synthetic. Named after Japan (Nihon)."],
[114,"Fl","Flerovium",289,5,"[Rn]5f14 6d10 7s2 7p2",7,14,"Synthetic. Named after Flerov Laboratory of Nuclear Reactions."],
[115,"Mc","Moscovium",290,5,"[Rn]5f14 6d10 7s2 7p3",7,15,"Synthetic. Named after Moscow."],
[116,"Lv","Livermorium",293,5,"[Rn]5f14 6d10 7s2 7p4",7,16,"Synthetic. Named after Lawrence Livermore National Laboratory."],
[117,"Ts","Tennessine",294,7,"[Rn]5f14 6d10 7s2 7p5",7,17,"Synthetic. Named after Tennessee."],
[118,"Og","Oganesson",294,1,"[Rn]5f14 6d10 7s2 7p6",7,18,"Synthetic. Named after Yuri Oganessian. Heaviest known element."],
];

const CAT_NAMES = ["Nonmetal","Noble gas","Alkali metal","Alkaline earth","Transition metal","Post-transition","Metalloid","Halogen","Lanthanide","Actinide"];
const CAT_COLORS = ["#34d399","#a78bfa","#f87171","#fb923c","#60a5fa","#6ee7b7","#fbbf24","#f472b6","#818cf8","#c084fc"];

export default function PeriodicTable3D() {
  const containerRef = useRef(null);
  const [rotX, setRotX] = useState(12);
  const [rotY, setRotY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [selected, setSelected] = useState(null);

  const onPointerDown = useCallback((e) => {
    if (e.target.closest(".el-cell")) return;
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onPointerMove = useCallback((e) => {
    if (!dragging) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setRotY(r => r + dx * 0.3);
    setRotX(r => Math.max(-60, Math.min(60, r - dy * 0.3)));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, [dragging]);
  const onPointerUp = useCallback(() => setDragging(false), []);
  const onWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(z => Math.max(0.4, Math.min(2.2, z - e.deltaY * 0.001)));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const sel = selected !== null ? EL.find(e => e[0] === selected) : null;

  // Cell size
  const cw = 52, ch = 58, gap = 3;

  return (
    <div style={{ margin: "12px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: C.textDim, letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>
          Interactive: 3D Periodic Table (all 118 elements)
        </p>
        <span style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono }}>Drag to rotate / Scroll to zoom</span>
      </div>

      {/* 3D Container */}
      <div ref={containerRef}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
        style={{
          width: "100%", height: 520, perspective: 1800, cursor: dragging ? "grabbing" : "grab",
          overflow: "hidden", borderRadius: 10, background: "rgba(10,12,18,0.6)",
          border: `1px solid ${C.border}`, position: "relative",
        }}>
        <div style={{
          width: 18 * (cw + gap), height: 10 * (ch + gap) + 40,
          position: "absolute", left: "50%", top: "50%",
          transform: `translate(-50%,-50%) scale(${zoom}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transformStyle: "preserve-3d", transition: dragging ? "none" : "transform 0.1s ease-out",
        }}>
          {EL.map(el => {
            const [z, sym, name, mass, cat, cfg, row, col, desc] = el;
            const isSel = selected === z;
            const x = (col - 1) * (cw + gap);
            const y = (row - 1) * (ch + gap);
            const color = CAT_COLORS[cat];
            return (
              <div key={z} className="el-cell"
                onClick={(e) => { e.stopPropagation(); setSelected(isSel ? null : z); }}
                style={{
                  position: "absolute", left: x, top: y, width: cw, height: ch,
                  borderRadius: 4, cursor: "pointer",
                  background: isSel ? `${color}44` : `${color}11`,
                  border: `1px solid ${isSel ? color : `${color}33`}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s ease",
                  transform: isSel ? "translateZ(20px) scale(1.15)" : "translateZ(0)",
                  boxShadow: isSel ? `0 0 20px ${color}44` : "none",
                  transformStyle: "preserve-3d",
                  zIndex: isSel ? 10 : 1,
                }}>
                <span style={{ fontSize: 7, color: `${color}99`, fontFamily: F.mono, lineHeight: 1 }}>{z}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: isSel ? "#fff" : color, lineHeight: 1.2 }}>{sym}</span>
                <span style={{ fontSize: 6, color: `${color}77`, lineHeight: 1, marginTop: 1, maxWidth: cw - 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                <span style={{ fontSize: 6, color: `${color}55`, fontFamily: F.mono, lineHeight: 1 }}>{mass}</span>
              </div>
            );
          })}
          {/* Lanthanide/Actinide labels */}
          <div style={{ position: "absolute", left: 0, top: 8 * (ch + gap) + 16, fontSize: 8, color: CAT_COLORS[8], fontFamily: F.mono }}>57-71 Lanthanides</div>
          <div style={{ position: "absolute", left: 0, top: 9 * (ch + gap) + 16, fontSize: 8, color: CAT_COLORS[9], fontFamily: F.mono }}>89-103 Actinides</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, justifyContent: "center" }}>
        {CAT_NAMES.map((name, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: CAT_COLORS[i] }} />
            <span style={{ fontSize: 9, color: C.textDim }}>{name}</span>
          </div>
        ))}
      </div>

      {/* Element Detail Panel */}
      {sel && (
        <div style={{
          marginTop: 12, padding: 16, borderRadius: 8,
          background: `${CAT_COLORS[sel[4]]}08`,
          border: `1px solid ${CAT_COLORS[sel[4]]}33`,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: CAT_COLORS[sel[4]] }}>{sel[1]}</span>
            <div>
              <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{sel[2]}</span>
              <span style={{ fontSize: 11, color: C.textDim, marginLeft: 8 }}>{CAT_NAMES[sel[4]]}</span>
            </div>
            <button onClick={() => setSelected(null)} style={{
              marginLeft: "auto", background: "none", border: "none", color: C.textDim,
              fontSize: 16, cursor: "pointer", padding: 4,
            }}>{"\u2715"}</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 16px", fontSize: 12, color: C.textMid, marginBottom: 10 }}>
            <span>Atomic #: <b style={{ color: C.text }}>{sel[0]}</b></span>
            <span>Mass: <b style={{ color: C.text }}>{sel[3]}</b> amu</span>
            <span>Protons: <b style={{ color: C.text }}>{sel[0]}</b></span>
            <span>Electrons: <b style={{ color: C.text }}>{sel[0]}</b></span>
            <span>Neutrons: <b style={{ color: C.text }}>{Math.round(sel[3]) - sel[0]}</b></span>
            <span>Group: <b style={{ color: CAT_COLORS[sel[4]] }}>{sel[7]}</b></span>
          </div>
          <div style={{ fontSize: 11, fontFamily: F.mono, color: C.blue, marginBottom: 10, padding: "6px 10px", background: `${C.blue}11`, borderRadius: 4 }}>
            {sel[5]}
          </div>
          <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{sel[8]}</p>
        </div>
      )}
    </div>
  );
}
