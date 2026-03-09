import { useState, useEffect, useRef, useCallback } from "react";

// ════════════════════════════════════════════════════════════
//  TELPO SHARED UI
//  Slider, Practice, EquationExplorer
// ════════════════════════════════════════════════════════════

export const C = {
  bg: "#ffffff",
  panel: "#f8f9fb",
  panelHover: "#f1f3f7",
  border: "#e8eaef",
  borderHover: "#d0d4dc",
  graphBg: "#fcfcfd",
  blue: "#4da3ff",
  blueDim: "rgba(77,163,255,0.08)",
  blueMid: "rgba(77,163,255,0.25)",
  blueLight: "rgba(77,163,255,0.05)",
  silver: "#9ca3af",
  silverLight: "#c9cdd4",
  text: "#1a1a2e",
  textMid: "#5a5f72",
  textDim: "#9298a8",
  textLight: "#b4b9c6",
  red: "#f87171",
  redDim: "rgba(248,113,113,0.1)",
  green: "#34d399",
  greenDim: "rgba(52,211,153,0.1)",
  gold: "#fbbf24",
  goldDim: "rgba(251,191,36,0.08)",
  grid: "#f0f1f5",
  axis: "#d0d4dc",
  done: "#34d399",
  studying: "#fbbf24",
};

export const F = {
  sans: "'Inter','SF Pro Display','Segoe UI',system-ui,sans-serif",
  mono: "'SF Mono','Menlo','Monaco',monospace",
};

// ─── SLIDER WITH NUMBER INPUT ──────────────────────────────

export function Slider({ label, value, min, max, step, onChange }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef(null);

  const display = step < 0.1 ? value.toFixed(2) : step >= 1 ? String(value) : value.toFixed(1);

  const handleStartEdit = () => {
    setEditing(true);
    setInputVal(display);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    setEditing(false);
    const parsed = parseFloat(inputVal);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      const snapped = Math.round(clamped / step) * step;
      onChange(parseFloat(snapped.toFixed(6)));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <span style={{ color: C.textDim, fontFamily: F.sans, fontSize: 11 }}>{label}</span>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            style={{
              width: 52, padding: "1px 4px", fontFamily: F.mono, fontSize: 11,
              fontWeight: 600, color: C.text, background: C.bg,
              border: `1px solid ${C.blue}`, borderRadius: 3, outline: "none",
              textAlign: "right",
            }}
          />
        ) : (
          <span
            onClick={handleStartEdit}
            style={{
              color: C.text, fontFamily: F.mono, fontSize: 11, fontWeight: 600,
              cursor: "text", padding: "1px 4px", borderRadius: 3,
              border: `1px solid transparent`,
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.border}
            onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
          >
            {display}
          </span>
        )}
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: C.blue, height: 2 }}
      />
    </div>
  );
}

// ─── TIP ───────────────────────────────────────────────────

export function Tip({ text }) {
  return (
    <div style={{ marginTop: 10, padding: "8px 12px", background: C.blueDim, borderRadius: 4, borderLeft: `2px solid ${C.blue}` }}>
      <p style={{ color: C.textMid, fontFamily: F.sans, fontSize: 11, margin: 0, lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

// ─── CANVAS ────────────────────────────────────────────────

export function CanvasGraph({ draw, width = 680, height = 380, onMouseMove, onMouseLeave }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    c.width = width * dpr; c.height = height * dpr;
    ctx.scale(dpr, dpr);
    draw(ctx, width, height);
  }, [draw, width, height]);
  return (
    <canvas ref={ref}
      style={{ width: "100%", maxWidth: width, height: "auto", aspectRatio: `${width}/${height}`, borderRadius: 6, border: `1px solid ${C.border}`, cursor: "crosshair", background: C.graphBg }}
      onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
    />
  );
}

// ─── ANSWER CHECKER ────────────────────────────────────────

function extractKeyValues(answer) {
  // Pull all numbers (including negatives, decimals, fractions)
  const nums = [];
  // Match patterns like: 5, -3.14, 1/2, √25, 2π, etc.
  const numPattern = /-?\d+\.?\d*/g;
  let m;
  while ((m = numPattern.exec(answer)) !== null) {
    nums.push(parseFloat(m[0]));
  }
  return nums;
}

function normalizeStr(s) {
  return s.toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[−–—]/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt");
}

export function checkAnswer(userInput, expectedAnswer) {
  if (!userInput.trim()) return false;
  const u = normalizeStr(userInput);
  const e = normalizeStr(expectedAnswer);

  // Exact match after normalization
  if (u === e) return true;

  // Check if expected answer contains key result indicators
  // Look for patterns like "= 5", "= -3", "≈ 71.57"
  const resultPatterns = expectedAnswer.match(/[=≈]\s*(-?\d+\.?\d*)/g);
  if (resultPatterns && resultPatterns.length > 0) {
    // Get the last result (usually the final answer)
    const lastResult = resultPatterns[resultPatterns.length - 1].replace(/[=≈]\s*/, "").trim();
    const lastNum = parseFloat(lastResult);
    const userNums = extractKeyValues(userInput);

    // Check if user provided the key number
    if (userNums.some(n => Math.abs(n - lastNum) < 0.05)) return true;
  }

  // Extract all numbers from expected and check overlap
  const expectedNums = extractKeyValues(expectedAnswer);
  const userNums = extractKeyValues(userInput);

  if (expectedNums.length > 0 && userNums.length > 0) {
    // Check if the final/key number matches
    const keyNum = expectedNums[expectedNums.length - 1];
    if (userNums.some(n => Math.abs(n - keyNum) < 0.05)) return true;
  }

  // Keyword matching for text answers
  const keywords = expectedAnswer
    .split(/[.,;:!?\n]/)
    .flatMap(s => s.split(" "))
    .filter(w => w.length > 3)
    .map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ""));

  if (keywords.length > 0) {
    const matched = keywords.filter(k => u.includes(k));
    if (matched.length >= Math.ceil(keywords.length * 0.5)) return true;
  }

  return false;
}

// ─── STEP-BY-STEP BREAKDOWN ────────────────────────────────

function parseSteps(answer) {
  // Try to split the answer into logical steps
  // Common patterns: numbered steps, arrow chains, comma separated operations
  if (answer.includes("→")) {
    return answer.split("→").map(s => s.trim()).filter(Boolean);
  }
  if (answer.includes(". ") && answer.split(". ").length > 1) {
    return answer.split(". ").map(s => s.trim()).filter(Boolean);
  }
  if (answer.includes("=") && answer.split("=").length > 2) {
    const parts = answer.split("=").map(s => s.trim());
    const steps = [];
    for (let i = 0; i < parts.length - 1; i++) {
      steps.push(parts[i] + " = " + parts[i + 1]);
    }
    return steps;
  }
  // Single step
  return [answer];
}

// ─── PRACTICE COMPONENT (TYPED ANSWERS) ────────────────────

export function Practice({ questions }) {
  const [state, setState] = useState({});
  // state[i] = { input: '', attempts: 0, status: 'active'|'retry'|'correct'|'failed'|'understood' }

  if (!questions || !questions.length) return null;

  const getQ = (i) => state[i] || { input: "", attempts: 0, status: "active" };
  const total = questions.length;
  const completed = Object.values(state).filter(s => s.status === "correct" || s.status === "understood").length;

  const updateQ = (i, updates) => {
    setState(prev => ({ ...prev, [i]: { ...getQ(i), ...updates } }));
  };

  const handleSubmit = (i) => {
    const q = getQ(i);
    const correct = checkAnswer(q.input, questions[i].a);
    if (correct) {
      updateQ(i, { status: "correct", attempts: q.attempts + 1 });
    } else if (q.attempts >= 1) {
      updateQ(i, { status: "failed", attempts: 2 });
    } else {
      updateQ(i, { status: "retry", attempts: 1 });
    }
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(i);
    }
  };

  const handleUnderstand = (i) => {
    updateQ(i, { status: "understood", input: "" });
  };

  const resetAll = () => setState({});

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>
          Practice ({completed}/{total})
        </p>
        <button onClick={resetAll} style={{
          background: "transparent", border: `1px solid ${C.border}`, borderRadius: 3,
          padding: "3px 8px", fontFamily: F.sans, fontSize: 10, color: C.textDim, cursor: "pointer",
        }}>Reset</button>
      </div>
      <div style={{ height: 2, background: C.border, borderRadius: 1, marginBottom: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(completed / total) * 100}%`, background: C.green, transition: "width 0.3s" }} />
      </div>

      {questions.map((q, i) => {
        const s = getQ(i);
        const steps = parseSteps(q.a);

        return (
          <div key={i} style={{
            background: C.panel, borderRadius: 6, border: `1px solid ${s.status === "correct" ? C.green : s.status === "failed" ? C.red : s.status === "retry" ? C.gold : C.border}`,
            padding: "12px 14px", marginBottom: 6, transition: "border-color 0.2s",
          }}>
            {/* Question */}
            <p style={{ color: C.text, fontFamily: F.sans, fontSize: 12, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{q.q}</p>

            {/* Correct state */}
            {s.status === "correct" && (
              <div style={{ marginTop: 8, padding: "6px 10px", background: C.greenDim, borderRadius: 4 }}>
                <p style={{ color: C.green, fontFamily: F.sans, fontSize: 11, margin: 0, fontWeight: 600 }}>Correct</p>
              </div>
            )}

            {/* Understood state */}
            {s.status === "understood" && (
              <div style={{ marginTop: 8, padding: "6px 10px", background: C.greenDim, borderRadius: 4 }}>
                <p style={{ color: C.green, fontFamily: F.sans, fontSize: 11, margin: 0 }}>Reviewed</p>
              </div>
            )}

            {/* Active / Retry input */}
            {(s.status === "active" || s.status === "retry") && (
              <div style={{ marginTop: 8 }}>
                {s.status === "retry" && (
                  <p style={{ color: C.gold, fontFamily: F.sans, fontSize: 11, margin: "0 0 6px", fontWeight: 600 }}>
                    Not quite. Try once more.
                  </p>
                )}
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="text"
                    value={s.input}
                    onChange={e => updateQ(i, { input: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, i)}
                    placeholder="Type your answer..."
                    style={{
                      flex: 1, padding: "7px 10px", fontFamily: F.mono, fontSize: 12,
                      color: C.text, background: C.bg, border: `1px solid ${s.status === "retry" ? C.gold : C.border}`,
                      borderRadius: 4, outline: "none", transition: "border-color 0.15s",
                    }}
                    onFocus={e => e.target.style.borderColor = C.blue}
                    onBlur={e => e.target.style.borderColor = s.status === "retry" ? C.gold : C.border}
                  />
                  <button onClick={() => handleSubmit(i)} style={{
                    background: C.blue, color: "#fff", border: "none", borderRadius: 4,
                    padding: "7px 14px", fontFamily: F.sans, fontSize: 11, cursor: "pointer",
                    fontWeight: 600, flexShrink: 0,
                  }}>Check</button>
                </div>
                <p style={{ color: C.textLight, fontFamily: F.sans, fontSize: 10, margin: "4px 0 0" }}>
                  {s.status === "retry" ? "Attempt 2 of 2" : "Attempt 1 of 2"}
                </p>
              </div>
            )}

            {/* Failed state: step-by-step breakdown */}
            {s.status === "failed" && (
              <div style={{ marginTop: 8 }}>
                <p style={{ color: C.red, fontFamily: F.sans, fontSize: 11, margin: "0 0 8px", fontWeight: 600 }}>
                  Here is the breakdown:
                </p>

                {/* Your answer vs correct */}
                <div style={{ padding: "6px 10px", background: C.redDim, borderRadius: 4, marginBottom: 8 }}>
                  <p style={{ color: C.textMid, fontFamily: F.mono, fontSize: 11, margin: 0 }}>
                    Your answer: {s.input || "(empty)"}
                  </p>
                </div>

                {/* Step by step */}
                <div style={{ padding: "10px 12px", background: C.bg, borderRadius: 4, border: `1px solid ${C.border}` }}>
                  <p style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 600, color: C.textDim, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 6px" }}>
                    Step by step
                  </p>
                  {steps.map((step, si) => (
                    <div key={si} style={{ display: "flex", gap: 8, marginBottom: si < steps.length - 1 ? 4 : 0, alignItems: "flex-start" }}>
                      <span style={{
                        fontFamily: F.mono, fontSize: 10, color: C.blue, fontWeight: 600,
                        width: 18, flexShrink: 0, textAlign: "right", paddingTop: 1,
                      }}>{si + 1}.</span>
                      <p style={{
                        color: si === steps.length - 1 ? C.text : C.textMid,
                        fontFamily: F.mono, fontSize: 12, margin: 0, lineHeight: 1.6,
                        fontWeight: si === steps.length - 1 ? 600 : 400,
                      }}>{step}</p>
                    </div>
                  ))}
                </div>

                {/* I understand button */}
                <button onClick={() => handleUnderstand(i)} style={{
                  marginTop: 10, background: C.blue, color: "#fff", border: "none", borderRadius: 4,
                  padding: "8px 18px", fontFamily: F.sans, fontSize: 12, cursor: "pointer", fontWeight: 600,
                  width: "100%",
                }}>I understand</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── EQUATION EXPLORER ─────────────────────────────────────
// Interactive equation panel for each lecture

export function EquationExplorer({ equations }) {
  if (!equations || !equations.length) return null;

  return (
    <div style={{ marginTop: 12, marginBottom: 12 }}>
      <p style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 600, color: C.textDim, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 8px" }}>
        Equations
      </p>
      {equations.map((eq, i) => <EquationCard key={i} eq={eq} />)}
    </div>
  );
}

function EquationCard({ eq }) {
  // eq = { label, params: [{name, min, max, step, init}], compute: (vals) => string, formula: string }
  const initVals = {};
  eq.params.forEach(p => { initVals[p.name] = p.init; });
  const [vals, setVals] = useState(initVals);
  const [collapsed, setCollapsed] = useState(false);

  const setVal = (name, v) => setVals(prev => ({ ...prev, [name]: v }));
  const result = eq.compute(vals);

  return (
    <div style={{
      background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
      padding: "10px 12px", marginBottom: 6,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setCollapsed(!collapsed)}>
        <p style={{ fontFamily: F.mono, fontSize: 13, color: C.text, margin: 0, fontWeight: 600 }}>{eq.formula}</p>
        <span style={{ color: C.textLight, fontSize: 12, transform: collapsed ? "rotate(-90deg)" : "rotate(0)", transition: "transform 0.15s" }}>v</span>
      </div>

      {!collapsed && (
        <div style={{ marginTop: 8 }}>
          {/* Result */}
          <div style={{ padding: "6px 10px", background: C.blueDim, borderRadius: 4, marginBottom: 8 }}>
            <p style={{ fontFamily: F.mono, fontSize: 12, color: C.blue, margin: 0, fontWeight: 600 }}>{result}</p>
          </div>

          {/* Parameter sliders */}
          <div style={{ display: "grid", gridTemplateColumns: eq.params.length > 2 ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 }}>
            {eq.params.map(p => (
              <Slider key={p.name} label={p.name} value={vals[p.name]} min={p.min} max={p.max} step={p.step} onChange={v => setVal(p.name, v)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EQUATION DEFINITIONS ──────────────────────────────────
// Map of vizType/lectureId to equation definitions

export const CALC_EQUATIONS = {
  "0.1": [
    {
      formula: "y = mx + b",
      params: [
        { name: "m", min: -5, max: 5, step: 0.1, init: 2 },
        { name: "x", min: -10, max: 10, step: 0.5, init: 3 },
        { name: "b", min: -5, max: 5, step: 0.1, init: 1 },
      ],
      compute: ({ m, x, b }) => `y = ${m}(${x}) + ${b} = ${(m * x + b).toFixed(2)}`,
    },
    {
      formula: "slope = (y2 - y1) / (x2 - x1)",
      params: [
        { name: "x1", min: -5, max: 5, step: 1, init: 1 },
        { name: "y1", min: -5, max: 5, step: 1, init: 2 },
        { name: "x2", min: -5, max: 5, step: 1, init: 4 },
        { name: "y2", min: -5, max: 5, step: 1, init: 8 },
      ],
      compute: ({ x1, y1, x2, y2 }) => {
        const run = x2 - x1;
        if (Math.abs(run) < 0.001) return "undefined (vertical line)";
        return `m = (${y2} - ${y1}) / (${x2} - ${x1}) = ${((y2 - y1) / run).toFixed(3)}`;
      },
    },
    {
      formula: "d = sqrt((x2-x1)^2 + (y2-y1)^2)",
      params: [
        { name: "x1", min: -5, max: 5, step: 1, init: -1 },
        { name: "y1", min: -5, max: 5, step: 1, init: 4 },
        { name: "x2", min: -5, max: 5, step: 1, init: 3 },
        { name: "y2", min: -5, max: 5, step: 1, init: 1 },
      ],
      compute: ({ x1, y1, x2, y2 }) => {
        const d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        return `d = sqrt(${(x2 - x1) ** 2} + ${(y2 - y1) ** 2}) = ${d.toFixed(3)}`;
      },
    },
  ],
  "0.2": [
    {
      formula: "f(x) = ax^2 + bx + c",
      params: [
        { name: "a", min: -3, max: 3, step: 0.1, init: 1 },
        { name: "b", min: -5, max: 5, step: 0.5, init: 0 },
        { name: "c", min: -5, max: 5, step: 0.5, init: 0 },
        { name: "x", min: -5, max: 5, step: 0.1, init: 2 },
      ],
      compute: ({ a, b, c, x }) => `f(${x}) = ${a}(${x})^2 + ${b}(${x}) + ${c} = ${(a * x * x + b * x + c).toFixed(2)}`,
    },
  ],
  "0.3": [
    {
      formula: "y = A sin(Bx + C) + D",
      params: [
        { name: "A", min: -3, max: 3, step: 0.1, init: 1 },
        { name: "B", min: 0.1, max: 4, step: 0.1, init: 1 },
        { name: "x", min: -6, max: 6, step: 0.1, init: 1.57 },
      ],
      compute: ({ A, B, x }) => {
        const period = (2 * Math.PI / B).toFixed(2);
        return `y = ${A}sin(${B} * ${x.toFixed(2)}) = ${(A * Math.sin(B * x)).toFixed(4)}   period = ${period}`;
      },
    },
    {
      formula: "degrees to radians: rad = deg * pi/180",
      params: [
        { name: "deg", min: 0, max: 360, step: 1, init: 150 },
      ],
      compute: ({ deg }) => `${deg} * pi/180 = ${(deg * Math.PI / 180).toFixed(4)} rad = ${(deg / 180).toFixed(4)}pi`,
    },
  ],
  "0.4": [
    {
      formula: "(f o g)(x) = f(g(x))",
      params: [
        { name: "x", min: -5, max: 5, step: 0.5, init: 2 },
      ],
      compute: ({ x }) => {
        const gx = x + 1;
        const fgx = gx * gx;
        return `g(${x}) = ${x}+1 = ${gx},  f(g(${x})) = (${gx})^2 = ${fgx}`;
      },
    },
  ],
  "1.1": [
    {
      formula: "lim f(x) as x approaches a",
      params: [
        { name: "a", min: -3, max: 5, step: 1, init: 3 },
      ],
      compute: ({ a }) => {
        // (x^2 - a^2) / (x - a) = x + a
        return `lim (x^2 - ${a * a}) / (x - ${a}) = ${a} + ${a} = ${2 * a}`;
      },
    },
  ],
  "1.2": [
    {
      formula: "lim [c * f(x)] = c * lim f(x)",
      params: [
        { name: "c", min: -5, max: 5, step: 0.5, init: 3 },
        { name: "L", min: -5, max: 5, step: 0.5, init: 4 },
      ],
      compute: ({ c, L }) => `${c} * ${L} = ${(c * L).toFixed(1)}`,
    },
  ],
  "2.1": [
    {
      formula: "f'(x) = lim [f(x+h) - f(x)] / h",
      params: [
        { name: "x", min: -3, max: 3, step: 0.1, init: 1 },
        { name: "h", min: 0.001, max: 2, step: 0.001, init: 0.5 },
      ],
      compute: ({ x, h }) => {
        const fx = x * x;
        const fxh = (x + h) * (x + h);
        const sec = (fxh - fx) / h;
        const deriv = 2 * x;
        return `f(x)=x^2: secant = ${sec.toFixed(4)}, f'(${x}) = ${deriv.toFixed(1)}, error = ${Math.abs(sec - deriv).toFixed(5)}`;
      },
    },
  ],
  "2.2": [
    {
      formula: "d/dx [x^n] = n * x^(n-1)",
      params: [
        { name: "n", min: -3, max: 6, step: 1, init: 3 },
        { name: "x", min: -3, max: 3, step: 0.1, init: 2 },
      ],
      compute: ({ n, x }) => `d/dx [x^${n}] at x=${x}: ${n} * ${x}^${n - 1} = ${(n * Math.pow(x, n - 1)).toFixed(3)}`,
    },
  ],
  "2.3": [
    {
      formula: "(fg)' = f'g + fg'",
      params: [
        { name: "x", min: -3, max: 3, step: 0.1, init: 1 },
      ],
      compute: ({ x }) => {
        // f = x^2, g = sin(x)
        const fp = 2 * x, g = Math.sin(x), f = x * x, gp = Math.cos(x);
        return `f=x^2, g=sin(x): (fg)' = ${fp.toFixed(2)}*sin(${x.toFixed(1)}) + ${f.toFixed(2)}*cos(${x.toFixed(1)}) = ${(fp * g + f * gp).toFixed(4)}`;
      },
    },
  ],
  "2.5": [
    {
      formula: "d/dx [sin(x)] = cos(x)",
      params: [
        { name: "x", min: -6, max: 6, step: 0.1, init: 0 },
      ],
      compute: ({ x }) => `sin'(${x.toFixed(1)}) = cos(${x.toFixed(1)}) = ${Math.cos(x).toFixed(4)}`,
    },
  ],
  "2.6": [
    {
      formula: "d/dx [f(g(x))] = f'(g(x)) * g'(x)",
      params: [
        { name: "x", min: -3, max: 3, step: 0.1, init: 1 },
        { name: "n", min: 2, max: 6, step: 1, init: 3 },
      ],
      compute: ({ x, n }) => {
        // d/dx [(x^2+1)^n] = n(x^2+1)^(n-1) * 2x
        const inner = x * x + 1;
        const result = n * Math.pow(inner, n - 1) * 2 * x;
        return `d/dx [(x^2+1)^${n}] = ${n}(${inner.toFixed(1)})^${n - 1} * ${(2 * x).toFixed(1)} = ${result.toFixed(3)}`;
      },
    },
  ],
  "2.7": [
    {
      formula: "x^2 + y^2 = r^2, dy/dx = -x/y",
      params: [
        { name: "r", min: 1, max: 10, step: 1, init: 5 },
        { name: "x", min: -4, max: 4, step: 0.5, init: 3 },
      ],
      compute: ({ r, x }) => {
        const y2 = r * r - x * x;
        if (y2 <= 0) return `x=${x} is outside the circle r=${r}`;
        const y = Math.sqrt(y2);
        return `y = sqrt(${r * r} - ${x * x}) = ${y.toFixed(2)}, dy/dx = -${x}/${y.toFixed(2)} = ${(-x / y).toFixed(4)}`;
      },
    },
  ],
  "2.8": [
    {
      formula: "dA/dt = 2*pi*r*(dr/dt)",
      params: [
        { name: "r", min: 1, max: 20, step: 0.5, init: 5 },
        { name: "drdt", min: 0.5, max: 5, step: 0.5, init: 2 },
      ],
      compute: ({ r, drdt }) => `dA/dt = 2pi(${r})(${drdt}) = ${(2 * Math.PI * r * drdt).toFixed(2)} cm^2/s`,
    },
  ],
  "3.1": [
    {
      formula: "f(x) = x^3 - 3x, f'(x) = 3x^2 - 3",
      params: [
        { name: "x", min: -3, max: 3, step: 0.1, init: 0 },
      ],
      compute: ({ x }) => {
        const fp = 3 * x * x - 3;
        const fpp = 6 * x;
        return `f'(${x.toFixed(1)}) = ${fp.toFixed(2)} (${fp > 0 ? "increasing" : fp < 0 ? "decreasing" : "critical"}), f''(${x.toFixed(1)}) = ${fpp.toFixed(2)} (${fpp > 0 ? "concave up" : fpp < 0 ? "concave down" : "inflection"})`;
      },
    },
  ],
  "3.5": [
    {
      formula: "lim (ax^2 + b) / (cx^2 + d) as x -> inf",
      params: [
        { name: "a", min: -5, max: 5, step: 1, init: 3 },
        { name: "c", min: 1, max: 5, step: 1, init: 5 },
      ],
      compute: ({ a, c }) => `Leading coefficients: ${a}/${c} = ${(a / c).toFixed(4)}`,
    },
  ],
  "3.7": [
    {
      formula: "A = x * y, perimeter = 2x + 2y = P",
      params: [
        { name: "P", min: 10, max: 100, step: 2, init: 40 },
      ],
      compute: ({ P }) => {
        const x = P / 4;
        return `Max area when x = y = P/4 = ${x}. A_max = ${(x * x).toFixed(1)}`;
      },
    },
  ],
  "4.1": [
    {
      formula: "integral x^n dx = x^(n+1)/(n+1) + C",
      params: [
        { name: "n", min: -2, max: 6, step: 1, init: 3 },
        { name: "x", min: -3, max: 3, step: 0.1, init: 2 },
      ],
      compute: ({ n, x }) => {
        if (n === -1) return `integral 1/x dx = ln|${x}| = ${Math.log(Math.abs(x)).toFixed(4)} + C`;
        return `integral x^${n} dx = x^${n + 1}/${n + 1} + C. At x=${x}: ${(Math.pow(x, n + 1) / (n + 1)).toFixed(4)} + C`;
      },
    },
  ],
  "4.3": [
    {
      formula: "Riemann: sum f(xi) * dx, n rectangles",
      params: [
        { name: "n", min: 1, max: 50, step: 1, init: 5 },
        { name: "a", min: 0, max: 2, step: 0.5, init: 0 },
        { name: "b", min: 1, max: 5, step: 0.5, init: 3 },
      ],
      compute: ({ n, a, b }) => {
        const dx = (b - a) / n;
        let sum = 0;
        for (let i = 0; i < n; i++) { sum += (a + i * dx) ** 2 * dx; }
        const exact = (b ** 3 - a ** 3) / 3;
        return `f(x)=x^2: L_${n} = ${sum.toFixed(4)}, exact = ${exact.toFixed(4)}, error = ${Math.abs(sum - exact).toFixed(5)}`;
      },
    },
  ],
  "4.5": [
    {
      formula: "FTC: integral(a,b) f(x)dx = F(b) - F(a)",
      params: [
        { name: "a", min: 0, max: 3, step: 0.5, init: 0 },
        { name: "b", min: 1, max: 5, step: 0.5, init: 3 },
      ],
      compute: ({ a, b }) => {
        // integral x^2 from a to b = b^3/3 - a^3/3
        return `integral x^2 from ${a} to ${b}: ${b}^3/3 - ${a}^3/3 = ${(b ** 3 / 3 - a ** 3 / 3).toFixed(4)}`;
      },
    },
  ],
  "5.1": [
    {
      formula: "Area = integral |f(x) - g(x)| dx",
      params: [
        { name: "a", min: -2, max: 2, step: 0.5, init: 0 },
        { name: "b", min: 1, max: 4, step: 0.5, init: 2 },
      ],
      compute: ({ a, b }) => {
        // f(x) = x+2, g(x) = x^2
        // integral (x+2 - x^2) from a to b
        const F = x => x * x / 2 + 2 * x - x ** 3 / 3;
        return `f=x+2, g=x^2: Area = ${Math.abs(F(b) - F(a)).toFixed(4)}`;
      },
    },
  ],
  "5.2": [
    {
      formula: "V = pi * integral [f(x)]^2 dx",
      params: [
        { name: "a", min: 0, max: 2, step: 0.5, init: 0 },
        { name: "b", min: 1, max: 4, step: 0.5, init: 2 },
      ],
      compute: ({ a, b }) => {
        // f(x) = x, V = pi * integral x^2 from a to b = pi * (b^3 - a^3)/3
        return `f(x)=x: V = pi * (${b}^3 - ${a}^3)/3 = ${(Math.PI * (b ** 3 - a ** 3) / 3).toFixed(4)}`;
      },
    },
  ],
  "5.4": [
    {
      formula: "L = integral sqrt(1 + [f'(x)]^2) dx",
      params: [
        { name: "a", min: 0, max: 2, step: 0.5, init: 0 },
        { name: "b", min: 1, max: 4, step: 0.5, init: 2 },
      ],
      compute: ({ a, b }) => {
        // f(x) = x^2, f'(x) = 2x
        // numerical integration
        const n = 100;
        const dx = (b - a) / n;
        let sum = 0;
        for (let i = 0; i < n; i++) {
          const x = a + (i + 0.5) * dx;
          sum += Math.sqrt(1 + (2 * x) ** 2) * dx;
        }
        return `f(x)=x^2: arc length from ${a} to ${b} = ${sum.toFixed(4)}`;
      },
    },
  ],
};

export const PHYSICS_EQUATIONS = {
  "v1.1": [
    {
      formula: "|v| = sqrt(vx^2 + vy^2)",
      params: [
        { name: "vx", min: -10, max: 10, step: 0.5, init: 3 },
        { name: "vy", min: -10, max: 10, step: 0.5, init: 4 },
      ],
      compute: ({ vx, vy }) => `|v| = sqrt(${vx}^2 + ${vy}^2) = ${Math.sqrt(vx * vx + vy * vy).toFixed(3)}, theta = ${(Math.atan2(vy, vx) * 180 / Math.PI).toFixed(1)} deg`,
    },
  ],
  "v1.2": [
    {
      formula: "Fx = F*cos(theta), Fy = F*sin(theta)",
      params: [
        { name: "F", min: 0, max: 100, step: 1, init: 50 },
        { name: "theta", min: 0, max: 90, step: 1, init: 30 },
      ],
      compute: ({ F, theta }) => {
        const r = theta * Math.PI / 180;
        return `Fx = ${(F * Math.cos(r)).toFixed(1)}N, Fy = ${(F * Math.sin(r)).toFixed(1)}N`;
      },
    },
  ],
  "k2.1": [
    {
      formula: "v = v0 + at",
      params: [
        { name: "v0", min: -10, max: 30, step: 0.5, init: 0 },
        { name: "a", min: -5, max: 10, step: 0.5, init: 6 },
        { name: "t", min: 0, max: 20, step: 0.5, init: 10 },
      ],
      compute: ({ v0, a, t }) => `v = ${v0} + ${a}(${t}) = ${(v0 + a * t).toFixed(1)} m/s`,
    },
  ],
  "k2.2": [
    {
      formula: "x = v0*t + (1/2)*a*t^2",
      params: [
        { name: "v0", min: 0, max: 20, step: 0.5, init: 0 },
        { name: "a", min: -10, max: 10, step: 0.1, init: 9.8 },
        { name: "t", min: 0, max: 10, step: 0.1, init: 3 },
      ],
      compute: ({ v0, a, t }) => `x = ${v0}(${t}) + 0.5(${a})(${t})^2 = ${(v0 * t + 0.5 * a * t * t).toFixed(2)} m`,
    },
  ],
  "k2.3": [
    {
      formula: "Range = v0^2 * sin(2*theta) / g",
      params: [
        { name: "v0", min: 5, max: 50, step: 1, init: 20 },
        { name: "theta", min: 5, max: 85, step: 1, init: 45 },
      ],
      compute: ({ v0, theta }) => {
        const r = theta * Math.PI / 180;
        const range = v0 * v0 * Math.sin(2 * r) / 9.8;
        const maxH = (v0 * Math.sin(r)) ** 2 / (2 * 9.8);
        return `Range = ${range.toFixed(1)}m, Max H = ${maxH.toFixed(1)}m`;
      },
    },
  ],
  "f3.1": [
    {
      formula: "F = ma, a = F_net / m",
      params: [
        { name: "m", min: 1, max: 20, step: 0.5, init: 5 },
        { name: "F", min: 0, max: 100, step: 1, init: 20 },
        { name: "f", min: 0, max: 50, step: 1, init: 5 },
      ],
      compute: ({ m, F, f }) => `F_net = ${F} - ${f} = ${F - f}N, a = ${F - f}/${m} = ${((F - f) / m).toFixed(2)} m/s^2`,
    },
  ],
  "e4.1": [
    {
      formula: "W = F*d, KE = (1/2)*m*v^2",
      params: [
        { name: "m", min: 0.5, max: 10, step: 0.5, init: 2 },
        { name: "v", min: 0, max: 20, step: 0.5, init: 5 },
      ],
      compute: ({ m, v }) => `KE = 0.5(${m})(${v})^2 = ${(0.5 * m * v * v).toFixed(1)} J`,
    },
  ],
  "e4.2": [
    {
      formula: "PE = mgh, v = sqrt(2gh)",
      params: [
        { name: "m", min: 0.5, max: 10, step: 0.5, init: 3 },
        { name: "h", min: 1, max: 30, step: 1, init: 10 },
      ],
      compute: ({ m, h }) => `PE = ${m}(9.8)(${h}) = ${(m * 9.8 * h).toFixed(1)}J, v_ground = sqrt(2*9.8*${h}) = ${Math.sqrt(2 * 9.8 * h).toFixed(2)} m/s`,
    },
  ],
  "w8.1": [
    {
      formula: "T = 2*pi*sqrt(m/k), F = -kx",
      params: [
        { name: "k", min: 10, max: 200, step: 5, init: 200 },
        { name: "m", min: 0.1, max: 5, step: 0.1, init: 1 },
        { name: "x", min: -2, max: 2, step: 0.1, init: 0.1 },
      ],
      compute: ({ k, m, x }) => {
        const T = 2 * Math.PI * Math.sqrt(m / k);
        const F = -k * x;
        return `T = ${T.toFixed(3)}s, F = -${k}(${x}) = ${F.toFixed(1)}N`;
      },
    },
  ],
  "w8.2": [
    {
      formula: "v = f * lambda",
      params: [
        { name: "f", min: 0.5, max: 10, step: 0.5, init: 5 },
        { name: "lambda", min: 0.1, max: 5, step: 0.1, init: 2 },
      ],
      compute: ({ f, lambda }) => `v = ${f} * ${lambda} = ${(f * lambda).toFixed(1)} m/s`,
    },
  ],
  "el9.1": [
    {
      formula: "F = k*q1*q2 / r^2",
      params: [
        { name: "q1", min: -5, max: 5, step: 0.5, init: 2 },
        { name: "q2", min: -5, max: 5, step: 0.5, init: -3 },
        { name: "r", min: 0.1, max: 2, step: 0.05, init: 0.5 },
      ],
      compute: ({ q1, q2, r }) => {
        const F = 8.99e9 * Math.abs(q1 * 1e-6) * Math.abs(q2 * 1e-6) / (r * r);
        return `F = ${F.toFixed(3)}N (${q1 * q2 < 0 ? "attractive" : "repulsive"})`;
      },
    },
  ],
  "c10.1": [
    {
      formula: "V = IR, P = I^2*R",
      params: [
        { name: "V", min: 1, max: 24, step: 0.5, init: 12 },
        { name: "R", min: 1, max: 20, step: 0.5, init: 4 },
      ],
      compute: ({ V, R }) => `I = ${V}/${R} = ${(V / R).toFixed(2)}A, P = ${(V * V / R).toFixed(1)}W`,
    },
  ],
  "c10.2": [
    {
      formula: "Series: R=R1+R2, Parallel: 1/R=1/R1+1/R2",
      params: [
        { name: "R1", min: 1, max: 20, step: 0.5, init: 3 },
        { name: "R2", min: 1, max: 20, step: 0.5, init: 6 },
      ],
      compute: ({ R1, R2 }) => `Series: ${(R1 + R2).toFixed(1)} ohm, Parallel: ${(1 / (1 / R1 + 1 / R2)).toFixed(2)} ohm`,
    },
  ],
};
