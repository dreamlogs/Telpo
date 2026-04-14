import { useState, useEffect, useRef, useCallback } from "react";
import { C, F, Slider, Tip, CanvasGraph, Practice, EquationExplorer, CALC_EQUATIONS } from "./shared_ui";

// ════════════════════════════════════════════════════════════
//  TELPO — Calculus Learning Platform
// ════════════════════════════════════════════════════════════

const STORAGE_KEY = "Telpo-calc-v1";
function loadProgress() { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; } }
function saveProgress(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }

// ─── CURRICULUM ─────────────────────────────────────────────
const UNITS = [
  // ═══ ZUGATES MATH 60 — Stewart 9th Ed — Spring 2026 ═══
  // Week 1: Apr 13-16 | Week 2: Apr 20-23 (Exam 1) | Chapters 2
  { id:"ch2", title:"Ch 2: Limits and Derivatives", exam:"Exam #1 — Apr 23", lectures:[
    { id:"2.1", title:"The Tangent and Velocity Problems", stewart:"2.1", week:1, day:"Mon Apr 13",
      yt:"https://youtube.com/watch?v=zLozwNf5r-8", ytLabel:"The Organic Chemistry Tutor", duration:"15:48",
      hasViz:true, vizType:"secant_tangent",
      reading:[
        "A tangent to a curve is a line that touches the curve at one point. A secant intersects the curve at two or more points.",
        "Average velocity = change in position / time elapsed = slope of the secant line. Instantaneous velocity = slope of the tangent line = limit of average velocities as the interval shrinks.",
        "Our goal in this section is to estimate the slope of the tangent line at a particular point by computing secant slopes with the second point getting closer and closer.",
        "Key formula: m_sec = [f(x) - f(a)] / (x - a). As x approaches a, m_sec approaches m_tan."
      ],
      practice:[
        {q:"A smartwatch records steps: t=0: 3438, t=10: 4559, t=20: 5622, t=30: 6536, t=40: 7398. Find the avg walking pace (steps/min) on [0,40].",a:"(7398-3438)/(40-0) = 3960/40 = 99 steps/min"},
        {q:"Same data. Estimate the pace at t=20 by averaging slopes on [10,20] and [20,30].",a:"[10,20]: (5622-4559)/10 = 106.3. [20,30]: (6536-5622)/10 = 91.4. Average: (106.3+91.4)/2 = 98.85 steps/min"},
        {q:"P(0.5, 0) is on y = cos(pi*x). Find secant slope PQ with Q at x=0.",a:"m = (cos(0)-0)/(0-0.5) = 1/(-0.5) = -2"},
        {q:"Rock on Mars: y = 10t - 1.86t^2. Avg velocity on [1, 1.5]?",a:"[10(1.5)-1.86(1.5)^2 - (10(1)-1.86(1)^2)] / 0.5 = (10.815-8.14)/0.5 = 5.35 m/s"},
        {q:"Same rock. Estimate instantaneous velocity at t=1.",a:"Approximately 6.28 m/s (limit of avg velocities as interval shrinks to 0)"}
      ] },
    { id:"2.2", title:"The Limit of a Function", stewart:"2.2", week:1, day:"Tue Apr 14",
      yt:"https://youtube.com/watch?v=7Q2HwTHcxA0", ytLabel:"The Organic Chemistry Tutor", duration:"18:01",
      hasViz:true, vizType:"limits_intro",
      reading:[
        "Open intervals (a,b) do NOT contain their endpoints. Closed intervals [a,b] contain their endpoints.",
        "lim(x->a) f(x) = L if the values of f(x) approach L as x approaches a from both sides, but does NOT require f(a) = L or even that f(a) exists.",
        "A limit only exists if f(x) approaches the same value from both sides. lim sin(1/x) as x->0 DNE because f(x) oscillates wildly.",
        "One-sided limits: lim(x->a-) is the left-hand limit (x approaches from negative side). lim(x->a+) is the right-hand limit. The two-sided limit exists iff both one-sided limits are equal.",
        "Infinite limits: lim f(x) = +inf means values get arbitrarily large positive. lim f(x) = -inf means arbitrarily large negative. The vertical line x=a is a vertical asymptote if at least one of the 6 one-sided infinite limit cases holds."
      ],
      practice:[
        {q:"From a graph: f(2) = 4 but lim(x->2-) f(x) = 2 and lim(x->2+) f(x) = 2. What is lim(x->2) f(x)?",a:"2. The limit is 2 (both sides agree), even though f(2) = 4. The function value at the point does not matter for the limit."},
        {q:"lim(x->3-) f(x) = 4 and lim(x->3+) f(x) = 2. Does lim(x->3) f(x) exist?",a:"DNE. Left and right limits disagree."},
        {q:"Does lim(x->0) sin(1/x) exist?",a:"No. sin(1/x) oscillates between -1 and 1 as x->0, never approaching a single value."},
        {q:"lim(x->a) f(x) = +inf. What is x=a?",a:"A vertical asymptote of the graph of f."},
        {q:"Given a graph: f(0) = 6, lim(x->8-) f(x) = 1, lim(x->8+) f(x) = -3. Find lim(x->0) f(x), f(8), and lim(x->8) f(x).",a:"lim(x->0) = 4 (read from graph approach). f(8) = -1 (point value). lim(x->8) DNE (left and right limits differ)."}
      ] },
    { id:"2.3", title:"Calculating Limits Using Limit Laws", stewart:"2.3", week:1, day:"Tue Apr 14",
      yt:"https://youtube.com/watch?v=fOrOeZA-vdY", ytLabel:"The Organic Chemistry Tutor", duration:"11:22",
      hasViz:true, vizType:"limit_laws",
      reading:[
        "7 Limit Laws: (1) Sum: lim[f+g] = lim f + lim g. (2) Difference. (3) Constant multiple: lim[cf] = c*lim f. (4) Product: lim[fg] = lim f * lim g. (5) Quotient (denom != 0). (6) Power: lim[f^n] = (lim f)^n. (7) Root: lim[nth root of f] = nth root of lim f.",
        "Direct Substitution: if f is a polynomial or rational function and a is in the domain, then lim(x->a) f(x) = f(a). Just plug in.",
        "When direct substitution gives 0/0, it is indeterminate. Use algebra: factor and cancel, rationalize (multiply by conjugate for roots), simplify complex fractions, or find a common denominator.",
        "If f(x) = g(x) for all x != a, then lim f = lim g (provided limits exist). This justifies canceling common factors.",
        "Squeeze Theorem: if f(x) <= g(x) <= h(x) near a and lim f = lim h = L, then lim g = L."
      ],
      practice:[
        {q:"lim(x->-3) (2x^3 + 6x^2 - 9)",a:"Direct sub: 2(-27)+6(9)-9 = -54+54-9 = -9"},
        {q:"lim(x->-3) (x^2+3x)/(x^2-x-12)",a:"Factor: x(x+3)/[(x-4)(x+3)] = x/(x-4). Sub: -3/(-7) = 3/7"},
        {q:"lim(x->-5) (2x^2+9x-5)/(x^2-25)",a:"Factor: (2x-1)(x+5)/[(x-5)(x+5)] = (2x-1)/(x-5). Sub: (-11)/(-10) = 11/10"},
        {q:"lim(x->2) (2-x)/(sqrt(x+2)-2)",a:"Rationalize: multiply by (sqrt(x+2)+2)/(sqrt(x+2)+2). Get -(x-2)(sqrt(x+2)+2)/(x-2) = -(sqrt(x+2)+2). Sub: -(2+2) = -4"},
        {q:"lim(x->-4) (sqrt(x^2+9)-5)/(x+4)",a:"Rationalize: multiply by (sqrt(x^2+9)+5)/(sqrt(x^2+9)+5). Get (x^2-16)/[(x+4)(sqrt(x^2+9)+5)] = (x-4)/(sqrt(x^2+9)+5). Sub: -8/10 = -4/5"},
        {q:"If 2x <= g(x) <= x^4 - x^2 + 2 for all x, find lim(x->1) g(x).",a:"lim(x->1) 2x = 2. lim(x->1) (x^4-x^2+2) = 2. By Squeeze Theorem, lim g(x) = 2."}
      ] },
    { id:"2.4", title:"The Precise Definition of a Limit", stewart:"2.4", week:1, day:"Wed Apr 15",
      yt:"https://youtube.com/watch?v=dXkoMscSbTs", ytLabel:"Professor Leonard", duration:"1:46:30",
      hasViz:false,
      reading:[
        "Greek lowercase letters: delta (the input tolerance) and epsilon (the output tolerance).",
        "Precise definition: lim(x->a) f(x) = L means for every number epsilon > 0, there exists a number delta > 0 such that if 0 < |x-a| < delta, then |f(x)-L| < epsilon.",
        "The distance from x to a is |x-a|. The distance from f(x) to L is |f(x)-L|. The definition says: no matter how small you make epsilon (the output tolerance), I can find a delta (input tolerance) that works.",
        "To prove a limit: (1) Start with |f(x)-L| < epsilon. (2) Simplify to get |x-a| < something. (3) Choose delta = that something. (4) Write the formal proof showing if 0 < |x-a| < delta then |f(x)-L| < epsilon.",
        "For linear functions f(x) = mx + b, delta = epsilon/|m| always works."
      ],
      practice:[
        {q:"For f(x) = 2x+3, find delta such that |f(x)-5| < 0.01 when 0 < |x-1| < delta.",a:"|2x+3-5| = |2x-2| = 2|x-1| < 0.01. So |x-1| < 0.005. delta = 0.005"},
        {q:"Prove: lim(x->1) (2x+3) = 5.",a:"Given epsilon > 0, choose delta = epsilon/2. If 0 < |x-1| < delta, then |2x+3-5| = 2|x-1| < 2(epsilon/2) = epsilon."},
        {q:"Prove: lim(x->2) (2-3x) = -4.",a:"|(2-3x)-(-4)| = |6-3x| = 3|x-2|. Choose delta = epsilon/3. Then 3|x-2| < 3(epsilon/3) = epsilon."},
        {q:"Prove: lim(x->1) (2x-5) = -3.",a:"|(2x-5)-(-3)| = |2x-2| = 2|x-1|. Choose delta = epsilon/2."},
        {q:"Prove: lim(x->5) (3x/2 - 1/2) = 7.",a:"|(3x/2-1/2)-7| = |3x/2-15/2| = (3/2)|x-5|. Choose delta = 2*epsilon/3."}
      ] },
    { id:"2.5", title:"Continuity", stewart:"2.5", week:1, day:"Wed Apr 15",
      yt:"https://youtube.com/watch?v=joewRl1CTL8", ytLabel:"The Organic Chemistry Tutor", duration:"22:29",
      hasViz:true, vizType:"continuity",
      reading:[
        "f is continuous at a if three conditions hold: (1) f(a) is defined, (2) lim(x->a) f(x) exists, (3) lim(x->a) f(x) = f(a). All three must be true.",
        "Polynomials are continuous everywhere. Rational functions are continuous on their domain. Trig, exponential, and root functions are continuous on their domains.",
        "Types of discontinuity: removable (hole, limit exists but f(a) is wrong or missing), jump (left and right limits differ), infinite (vertical asymptote).",
        "Intermediate Value Theorem: if f is continuous on [a,b] and N is between f(a) and f(b), then there exists c in (a,b) where f(c) = N. Used to prove roots exist."
      ],
      practice:[
        {q:"Is f(x) = (x^2-1)/(x-1) continuous at x=1?",a:"No. f(1) is undefined (0/0). Removable discontinuity. The limit is 2 but f(1) DNE."},
        {q:"Three conditions for continuity at x = a?",a:"1) f(a) defined. 2) lim(x->a) f(x) exists. 3) lim = f(a). All three required."},
        {q:"f(0) = -2, f(3) = 5, f continuous on [0,3]. Must f have a zero?",a:"Yes, by IVT. 0 is between -2 and 5, so there exists c in (0,3) with f(c) = 0."},
        {q:"g(x) = {x if x<1, 3 if x=1, 2-x^2 if 1<x<=2, x-3 if x>2}. Is g continuous at x=1?",a:"lim(x->1-) = 1, lim(x->1+) = 1, but g(1) = 3. Since lim != g(1), NOT continuous at x=1."}
      ] },
    { id:"2.6", title:"Limits at Infinity; Horizontal Asymptotes", stewart:"2.6", week:1, day:"Thu Apr 16",
      yt:"https://youtube.com/watch?v=NmLljBAg82o", ytLabel:"The Organic Chemistry Tutor", duration:"12:58",
      hasViz:true, vizType:"limits_infinity",
      reading:[
        "lim(x->+inf) f(x) = L means f(x) approaches L as x grows without bound. The line y=L is a horizontal asymptote.",
        "For rational functions, use dominant terms (highest power in numerator and denominator). Divide top and bottom by x^(highest power in denominator). Terms like 1/x, 1/x^2 go to 0.",
        "Degree comparison shortcut: if deg(top) < deg(bottom), limit = 0. Equal degrees: ratio of leading coefficients. deg(top) > deg(bottom): limit = +/- infinity.",
        "Theorem: if r > 0 is rational, then lim(x->+inf) 1/x^r = 0. Also lim(x->-inf) 1/x^r = 0 (when x^r is defined).",
        "Exponential limits: for b > 1, lim(x->inf) b^x = inf and lim(x->inf) b^(-x) = 0. For e^x: lim(x->-inf) e^x = 0 and lim(x->inf) e^x = inf. lim(x->inf) e^(-x) = 0.",
        "lim(x->-inf) tan^(-1)(x) = -pi/2. lim(x->+inf) tan^(-1)(x) = pi/2."
      ],
      practice:[
        {q:"lim(x->inf) (-2)/(3x+7)",a:"0. Constant over growing denominator."},
        {q:"lim(t->-inf) (6t^2+t-5)/(9-2t^2)",a:"Divide by t^2: (6+1/t-5/t^2)/(-2+9/t^2). As t->-inf: 6/(-2) = -3"},
        {q:"lim(x->inf) (e^3x - e^(-3x))/(e^3x + e^(-3x))",a:"Divide by e^3x: (1 - e^(-6x))/(1 + e^(-6x)). As x->inf, e^(-6x)->0. Answer: 1"},
        {q:"lim(x->inf) (e^(-x) + 2cos(3x)). Does it exist?",a:"e^(-x)->0 but 2cos(3x) oscillates between -2 and 2 forever. Limit DNE."},
        {q:"lim(x->inf) sin^2(x)/(x^2+1)",a:"0. Since 0 <= sin^2(x) <= 1, we have 0 <= sin^2(x)/(x^2+1) <= 1/(x^2+1) -> 0. By Squeeze Theorem, limit = 0."},
        {q:"lim(x->0+) tan^(-1)(ln x)",a:"As x->0+, ln(x)->-inf. tan^(-1)(-inf) = -pi/2."}
      ] },
  ]},
  // Week 2: Apr 20-23 | Week 3: Apr 27-30 | Week 4: May 4-7 (Exam 2) | Chapter 3
  { id:"ch3a", title:"Ch 3: Derivatives (Part 1)", exam:"Exam #2 — May 7", lectures:[
    { id:"2.7", title:"Derivatives and Rates of Change", stewart:"2.7", week:2, day:"Mon Apr 20",
      yt:"https://youtube.com/watch?v=AwxT1xjMP9g", ytLabel:"The Organic Chemistry Tutor", duration:"20:15",
      hasViz:true, vizType:"derivative_def",
      reading:[
        "The derivative of f at a, written f'(a), is the slope of the tangent line to y=f(x) at x=a.",
        "Definition 1: f'(a) = lim(x->a) [f(x)-f(a)]/(x-a). Definition 2: f'(a) = lim(h->0) [f(a+h)-f(a)]/h. Both are equivalent.",
        "The tangent line to y=f(x) at (a, f(a)): y - f(a) = f'(a)(x - a).",
        "Average rate of change over [x1,x2] = [f(x2)-f(x1)]/(x2-x1) = slope of secant. Instantaneous rate = f'(a) = slope of tangent.",
        "If s(t) is position, v(a) = s'(a) = lim(h->0) [s(a+h)-s(a)]/h. Acceleration a(t) = v'(t) = s''(t)."
      ],
      practice:[
        {q:"Find slope of tangent to y=x^3+1 at (1,2) using Def 1.",a:"lim(x->1) (x^3+1-2)/(x-1) = lim (x^3-1)/(x-1) = lim (x^2+x+1) = 3"},
        {q:"Find tangent line to y=x^2-2x^3 at (1,-1).",a:"f'(1) = -4. Line: y+1 = -4(x-1), so y = -4x+3"},
        {q:"y = sqrt(1-3x). Find tangent line at (-1,2).",a:"m = lim(h->0) [sqrt(4-3h)-2]/h. Rationalize: -3/4. Line: y-2 = (-3/4)(x+1)"},
        {q:"Rock on Mars: H = 10t-1.86t^2. Find v(2).",a:"v(a) = 10-3.72a. v(2) = 10-7.44 = 2.56 m/s"},
        {q:"If g(5) = -3 and g'(5) = 4, find the tangent line at x=5.",a:"y-(-3) = 4(x-5). y = 4x-23"},
        {q:"If g(x)=x^4-2, find g'(1) and use it for tangent line at (1,-1).",a:"g'(1) = lim(h->0) [(1+h)^4-2-(-1)]/h = 4. Line: y+1=4(x-1)"}
      ] },
    { id:"2.8", title:"The Derivative as a Function", stewart:"2.8", week:2, day:"Tue Apr 21",
      yt:"https://youtube.com/watch?v=-aTLjoDT1GQ", ytLabel:"The Organic Chemistry Tutor", duration:"26:44",
      hasViz:true, vizType:"derivative_def",
      reading:[
        "f'(x) = lim(h->0) [f(x+h)-f(x)]/h gives the derivative as a function of x (not just at one point).",
        "Notation: f'(x), y', dy/dx, d/dx[f(x)], D_x[f(x)] all mean the same thing.",
        "f is differentiable at a if f'(a) exists. Differentiable on (a,b) if differentiable at every point in the interval.",
        "THEOREM: Differentiable at a implies continuous at a. But continuous does NOT imply differentiable (example: |x| at x=0).",
        "Three ways f fails to be differentiable: (1) discontinuity, (2) sharp corner/cusp, (3) vertical tangent line.",
        "Higher derivatives: f''(x) is the derivative of f'(x). If s(t) is position, v(t)=s'(t) is velocity, a(t)=s''(t) is acceleration."
      ],
      practice:[
        {q:"Find f'(x) for f(x) = mx + b using the definition.",a:"lim(h->0) [m(x+h)+b-mx-b]/h = lim mh/h = m"},
        {q:"Find f'(x) for f(x) = 4+8x-5x^2 using the definition.",a:"lim(h->0) [8h-10xh-5h^2]/h = 8-10x"},
        {q:"Find f'(x) for F(t) = t^3-5t+1.",a:"lim(h->0) [(x+h)^3-5(x+h)+1-(x^3-5x+1)]/h = 3x^2-5"},
        {q:"Find f'(x) for F(v) = v/(v+2) using definition.",a:"lim(h->0) [(x+h)/(x+h+2) - x/(x+2)]/h = 2/(x+2)^2"},
        {q:"Is |x| differentiable at x=0?",a:"No. Sharp corner. Left derivative = -1, right derivative = +1. They disagree."},
        {q:"f(x) = x^3-3x. Find f'(x) and f''(x).",a:"f'(x) = 3x^2-3. f''(x) = 6x."}
      ] },
    { id:"3.1", title:"Derivatives of Polynomials and Exponential Functions", stewart:"3.1", week:2, day:"Wed Apr 22",
      yt:"https://youtube.com/watch?v=9Yz-RCdS2Tg", ytLabel:"The Organic Chemistry Tutor", duration:"10:07",
      hasViz:true, vizType:"diff_rules",
      reading:["Power Rule: d/dx [x^n] = nx^(n-1). Works for any real n.","d/dx [c] = 0. d/dx [cf(x)] = c*f\'(x). d/dx [f+g] = f\'+g\'.","d/dx [e^x] = e^x. The exponential function is its own derivative."],
      practice:[{q:"d/dx [x^5 - 3x^2 + 7]",a:"5x^4 - 6x"},{q:"d/dx [4*sqrt(x)]",a:"4 * (1/2)x^(-1/2) = 2/sqrt(x)"},{q:"d/dx [e^x + x^3]",a:"e^x + 3x^2"}] },
    { id:"3.2", title:"The Product and Quotient Rules", stewart:"3.2", week:3, day:"Mon Apr 27",
      yt:"https://youtube.com/watch?v=17X5g9QArTc", ytLabel:"The Organic Chemistry Tutor", duration:"25:43",
      hasViz:true, vizType:"product_quotient",
      reading:["Product Rule: (fg)\' = f\'g + fg\'. Remember: derivative of first times second plus first times derivative of second.","Quotient Rule: (f/g)\' = (f\'g - fg\')/g^2. Low d-high minus high d-low over low squared."],
      practice:[{q:"d/dx [x^2 * sin(x)]",a:"2x*sin(x) + x^2*cos(x)"},{q:"d/dx [x/(x+1)]",a:"[(x+1)-x]/(x+1)^2 = 1/(x+1)^2"},{q:"State the product rule.",a:"(fg)\' = f\'g + fg\'"}] },
    { id:"3.3", title:"Derivatives of Trigonometric Functions", stewart:"3.3", week:3, day:"Mon Apr 27",
      yt:"https://youtube.com/watch?v=PEqCa0U77mc", ytLabel:"The Organic Chemistry Tutor", duration:"22:28",
      hasViz:true, vizType:"trig_derivs",
      reading:["d/dx [sin x] = cos x. d/dx [cos x] = -sin x.","d/dx [tan x] = sec^2 x. d/dx [cot x] = -csc^2 x.","d/dx [sec x] = sec x tan x. d/dx [csc x] = -csc x cot x.","These six must be memorized cold."],
      practice:[{q:"d/dx [sin x]",a:"cos x"},{q:"d/dx [tan x]",a:"sec^2 x"},{q:"d/dx [3cos x - 2sin x]",a:"-3sin x - 2cos x"}] },
    { id:"3.4", title:"The Chain Rule", stewart:"3.4", week:3, day:"Tue Apr 28",
      yt:"https://youtube.com/watch?v=HaHsqDjWMLU", ytLabel:"The Organic Chemistry Tutor", duration:"46:09",
      hasViz:true, vizType:"chain_rule",
      reading:["Chain Rule: d/dx [f(g(x))] = f\'(g(x)) * g\'(x). Derivative of outer times derivative of inner.","Think of it as peeling layers. The outermost function gets differentiated first, then multiply by the derivative of what\'s inside.","This is the most important rule. It applies whenever functions are nested."],
      practice:[{q:"d/dx [sin(3x)]",a:"cos(3x) * 3 = 3cos(3x)"},{q:"d/dx [(x^2+1)^5]",a:"5(x^2+1)^4 * 2x = 10x(x^2+1)^4"},{q:"d/dx [e^(2x)]",a:"e^(2x) * 2 = 2e^(2x)"}] },
    { id:"3.5", title:"Implicit Differentiation", stewart:"3.5", week:3, day:"Tue Apr 28",
      yt:"https://youtube.com/watch?v=xbviQHhU1rA", ytLabel:"The Organic Chemistry Tutor", duration:"20:08",
      hasViz:true, vizType:"implicit",
      reading:["Use when y is not isolated. Differentiate both sides with respect to x. Every time you differentiate y, multiply by dy/dx (chain rule).","Then solve algebraically for dy/dx."],
      practice:[{q:"Find dy/dx for x^2 + y^2 = 25.",a:"2x + 2y(dy/dx) = 0. dy/dx = -x/y"},{q:"Find dy/dx for xy = 6.",a:"y + x(dy/dx) = 0. dy/dx = -y/x"}] },
    { id:"3.6", title:"Derivatives of Log and Inverse Trig Functions", stewart:"3.6", week:3, day:"Wed Apr 29",
      yt:"https://youtube.com/watch?v=Dp9sgIvaKPk", ytLabel:"The Organic Chemistry Tutor", duration:"25:43",
      hasViz:false,
      reading:["d/dx [ln x] = 1/x. d/dx [log_a x] = 1/(x ln a).","d/dx [arcsin x] = 1/sqrt(1-x^2). d/dx [arctan x] = 1/(1+x^2).","Logarithmic differentiation: take ln of both sides, then differentiate. Useful for products/quotients of many functions."],
      practice:[{q:"d/dx [ln(x^2+1)]",a:"2x/(x^2+1) (chain rule)"},{q:"d/dx [arctan(x)]",a:"1/(1+x^2)"}] },
    { id:"3.7", title:"Rates of Change in Natural and Social Sciences", stewart:"3.7", week:3, day:"Thu Apr 30",
      yt:"https://youtube.com/watch?v=dvQdQLTnDpk", ytLabel:"The Organic Chemistry Tutor", duration:"13:09",
      hasViz:false,
      reading:["The derivative is the rate of change. Position s(t): velocity = s\'(t), acceleration = s\'\'(t).","In physics: force = mass * acceleration. Current = dQ/dt. Power = dW/dt.","In biology: growth rate = dN/dt. In economics: marginal cost = dC/dx."],
      practice:[{q:"s(t) = t^3 - 6t. Find velocity at t=2.",a:"v(t) = 3t^2 - 6. v(2) = 12 - 6 = 6"},{q:"When is the particle at rest?",a:"v(t) = 0: 3t^2 - 6 = 0, t = sqrt(2)"}] },
    { id:"3.8", title:"Exponential Growth and Decay", stewart:"3.8", week:3, day:"Thu Apr 30",
      yt:"https://youtube.com/watch?v=yg_497u6JnA", ytLabel:"The Organic Chemistry Tutor", duration:"14:03",
      hasViz:false,
      reading:["dy/dt = ky has solution y = y_0 * e^(kt). If k > 0 growth. If k < 0 decay.","Half-life: time for quantity to halve. T = ln(2)/|k|.","Population growth, radioactive decay, and Newton\'s law of cooling all use this model."],
      practice:[{q:"A population doubles every 3 years. Find k.",a:"2 = e^(3k). k = ln(2)/3 = 0.231"},{q:"Half-life is 5 years. What fraction remains after 15 years?",a:"(1/2)^3 = 1/8"}] },
    { id:"3.9", title:"Related Rates", stewart:"3.9", week:4, day:"Mon May 4",
      yt:"https://youtube.com/watch?v=43Qt3HqFsCk", ytLabel:"Professor Leonard", duration:"53:52",
      hasViz:true, vizType:"related_rates",
      reading:["Related rates: two quantities change with time. Use an equation relating them, differentiate both sides with respect to t (implicit differentiation).","Steps: (1) Draw picture. (2) Identify variables and rates. (3) Write equation relating variables. (4) Differentiate with respect to t. (5) Plug in known values. (6) Solve."],
      practice:[{q:"Circle radius grows at 2 cm/s. Find dA/dt when r=5.",a:"A = pi*r^2. dA/dt = 2*pi*r*(dr/dt) = 2*pi*5*2 = 20pi"},{q:"Ladder 10ft slides down wall at 1ft/s. How fast is base moving when top is 6ft high?",a:"x^2+y^2=100. 2x(dx/dt)+2y(dy/dt)=0. When y=6, x=8. 16(dx/dt)+12(-1)=0. dx/dt = 3/4 ft/s"}] },
    { id:"3.10", title:"Linear Approximations and Differentials", stewart:"3.10", week:4, day:"Tue May 5",
      yt:"https://youtube.com/watch?v=XQaCbFMnDo0", ytLabel:"The Organic Chemistry Tutor", duration:"27:10",
      hasViz:false,
      reading:["Linear approximation: f(x) approx f(a) + f\'(a)(x-a). Uses the tangent line to estimate nearby values.","Differential: dy = f\'(x)dx. It approximates the change in y for a small change dx in x."],
      practice:[{q:"Use linear approx to estimate sqrt(4.1) using f(x)=sqrt(x) at a=4.",a:"f(4)=2, f\'(x)=1/(2sqrt(x)), f\'(4)=1/4. sqrt(4.1) approx 2 + (1/4)(0.1) = 2.025"}] },
  ]},
  // Week 5: May 11-14 | Week 6: May 18-21 (Exam 3) | Chapter 4
  { id:"ch4", title:"Ch 4: Applications of Differentiation", exam:"Exam #3 — May 20", lectures:[
    { id:"4.1", title:"Maximum and Minimum Values", stewart:"4.1", week:4, day:"Wed May 6",
      yt:"https://youtube.com/watch?v=Sx2lPZlnWfs", ytLabel:"The Organic Chemistry Tutor", duration:"14:34",
      hasViz:true, vizType:"inc_dec_concavity",
      reading:["Absolute max/min: highest/lowest value on a closed interval. Critical numbers: where f\'(c)=0 or f\'(c) DNE.","Extreme Value Theorem: if f is continuous on [a,b], it has an absolute max and min.","Closed Interval Method: evaluate f at critical numbers and endpoints. Biggest = abs max, smallest = abs min."],
      practice:[{q:"Find critical numbers of f(x)=x^3-3x.",a:"f\'(x)=3x^2-3=0. x=1 and x=-1"},{q:"Find abs max/min of f(x)=x^2-4x on [0,5].",a:"f\'=2x-4=0 at x=2. f(0)=0, f(2)=-4, f(5)=5. Max=5 at x=5, Min=-4 at x=2."}] },
    { id:"4.2", title:"The Mean Value Theorem", stewart:"4.2", week:5, day:"Mon May 11",
      yt:"https://youtube.com/watch?v=SL2RobwU_M4", ytLabel:"The Organic Chemistry Tutor", duration:"15:18",
      hasViz:true, vizType:"mvt",
      reading:["MVT: If f is continuous on [a,b] and differentiable on (a,b), then there exists c in (a,b) where f\'(c) = [f(b)-f(a)]/(b-a).","Meaning: somewhere the instantaneous rate equals the average rate.","Rolle\'s Theorem is a special case: if f(a)=f(b), then f\'(c)=0 for some c in (a,b)."],
      practice:[{q:"State the Mean Value Theorem.",a:"There exists c in (a,b) where f\'(c) = (f(b)-f(a))/(b-a)"},{q:"f(x)=x^2 on [1,3]. Find c from MVT.",a:"f\'(c) = (9-1)/(3-1) = 4. f\'(c)=2c=4. c=2."}] },
    { id:"4.3", title:"What Derivatives Tell Us About the Shape of a Graph", stewart:"4.3", week:5, day:"Mon May 11",
      yt:"https://youtube.com/watch?v=OhqNbQi9QPk", ytLabel:"The Organic Chemistry Tutor", duration:"24:51",
      hasViz:true, vizType:"first_deriv_test",
      reading:["f\'>0: increasing. f\'<0: decreasing. Sign change at critical point = local extremum.","First Derivative Test: f\' changes + to - at c = local max. f\' changes - to + = local min.","f\'\'>0: concave up. f\'\'<0: concave down. f\'\'=0: possible inflection point.","Second Derivative Test: f\'(c)=0 and f\'\'(c)>0 = local min. f\'\'(c)<0 = local max."],
      practice:[{q:"f\' changes + to - at c. What is c?",a:"Local maximum"},{q:"f\'(c)=0 and f\'\'(c)>0. What is c?",a:"Local minimum"},{q:"What is an inflection point?",a:"Where concavity changes (f\'\'changes sign)"}] },
    { id:"4.4", title:"Indeterminate Forms and L\'Hospital\'s Rule", stewart:"4.4", week:5, day:"Tue May 12",
      yt:"https://youtube.com/watch?v=Gh48aOvWcxw", ytLabel:"The Organic Chemistry Tutor", duration:"37:02",
      hasViz:false,
      reading:["L\'Hospital\'s Rule: if lim f(x)/g(x) gives 0/0 or inf/inf, then lim f(x)/g(x) = lim f\'(x)/g\'(x).","Can apply repeatedly if still indeterminate after first application.","Only works for 0/0 or infinity/infinity. Other forms (0*inf, inf-inf, 0^0, 1^inf, inf^0) must be rewritten first."],
      practice:[{q:"lim(x->0) sin(x)/x using L\'Hospital",a:"0/0 form. lim cos(x)/1 = 1"},{q:"lim(x->inf) x/e^x",a:"inf/inf. L\'H: 1/e^x = 0"},{q:"lim(x->0+) x*ln(x)",a:"Rewrite as ln(x)/(1/x). inf/inf. L\'H: (1/x)/(-1/x^2) = -x -> 0"}] },
    { id:"4.5", title:"Summary of Curve Sketching", stewart:"4.5", week:5, day:"Wed May 13",
      yt:"https://youtube.com/watch?v=JTVNUdL7sWs", ytLabel:"The Organic Chemistry Tutor", duration:"1:01:16",
      hasViz:true, vizType:"curve_sketch",
      reading:["Full curve sketch checklist: (1) Domain. (2) Intercepts. (3) Symmetry. (4) Asymptotes. (5) Intervals of increase/decrease (f\'). (6) Local max/min. (7) Concavity and inflection points (f\'\')."],
      practice:[{q:"What are the steps to sketch a curve?",a:"Domain, intercepts, symmetry, asymptotes, f\' (inc/dec, extrema), f\'\' (concavity, inflection)"}] },
    { id:"4.7", title:"Optimization Problems", stewart:"4.7", week:5, day:"Thu May 14",
      yt:"https://youtube.com/watch?v=lx8RcYcYVuU", ytLabel:"The Organic Chemistry Tutor", duration:"46:29",
      hasViz:true, vizType:"optimization",
      reading:["Steps: (1) Draw and label. (2) Write the objective function (what to maximize/minimize). (3) Write constraints. (4) Use constraint to reduce to one variable. (5) Take derivative, set = 0, solve. (6) Verify max or min."],
      practice:[{q:"Optimization steps?",a:"1) Draw. 2) Objective. 3) Constraint. 4) Substitute. 5) f\'=0. 6) Verify."},{q:"Find two numbers that sum to 100 with max product.",a:"x + y = 100. P = x(100-x). P\' = 100-2x = 0. x = 50. Both numbers are 50."}] },
    { id:"4.9", title:"Antiderivatives", stewart:"4.9", week:6, day:"Mon May 18",
      yt:"https://youtube.com/watch?v=xaCPDMEkbig", ytLabel:"The Organic Chemistry Tutor", duration:"28:14",
      hasViz:true, vizType:"antideriv",
      reading:["An antiderivative F of f satisfies F\'(x) = f(x). The general antiderivative is F(x) + C.","Power rule reversed: integral x^n dx = x^(n+1)/(n+1) + C (n != -1).","integral 1/x dx = ln|x| + C. integral e^x dx = e^x + C. integral cos x dx = sin x + C."],
      practice:[{q:"integral x^3 dx",a:"x^4/4 + C"},{q:"integral (3x^2 - 2x + 5) dx",a:"x^3 - x^2 + 5x + C"},{q:"integral cos(x) dx",a:"sin(x) + C"}] },
  ]},
  // Week 6-7: May 19-28 | Week 8: Jun 1-4 (Exam 4 + Final) | Chapter 5
  { id:"ch5", title:"Ch 5: Integrals", exam:"Exam #4 — Jun 2 | FINAL — Jun 4", lectures:[
    { id:"5.1", title:"The Area and Distance Problems", stewart:"5.1", week:6, day:"Tue May 19",
      yt:"https://youtube.com/watch?v=YTKQswb60Pw", ytLabel:"The Organic Chemistry Tutor", duration:"27:51",
      hasViz:true, vizType:"riemann",
      reading:["Area under a curve can be approximated by rectangles (Riemann sums).","Left, right, and midpoint sums. More rectangles = better approximation.","As n approaches infinity, the Riemann sum becomes the exact area = the definite integral."],
      practice:[{q:"What happens to Riemann sum as n -> infinity?",a:"Becomes the exact definite integral"},{q:"Is a left sum an overestimate or underestimate for decreasing f?",a:"Overestimate (rectangles stick above the curve)"}] },
    { id:"5.2", title:"The Definite Integral", stewart:"5.2", week:6, day:"Thu May 21",
      yt:"https://youtube.com/watch?v=Gc3QvUB0PkI", ytLabel:"The Organic Chemistry Tutor", duration:"19:03",
      hasViz:false,
      reading:["integral(a to b) f(x) dx = lim(n->inf) sum f(x_i)*delta_x. This is the formal definition.","Properties: integral(a to a) = 0. integral(a to b) = -integral(b to a). Linearity: integral(cf+g) = c*integral(f) + integral(g).","If f(x) >= 0, the definite integral equals the area under the curve from a to b."],
      practice:[{q:"integral(a to a) f(x) dx = ?",a:"0"},{q:"integral(0 to 3) 2 dx = ?",a:"2*3 = 6 (rectangle with height 2, width 3)"}] },
    { id:"5.3", title:"The Fundamental Theorem of Calculus", stewart:"5.3", week:7, day:"Tue May 26",
      yt:"https://youtube.com/watch?v=aeB5BWY0RlE", ytLabel:"The Organic Chemistry Tutor", duration:"20:28",
      hasViz:true, vizType:"ftc",
      reading:["FTC Part 1: d/dx [integral(a to x) f(t) dt] = f(x). Differentiation undoes integration.","FTC Part 2: integral(a to b) f(x) dx = F(b) - F(a) where F is any antiderivative of f.","This connects the two main operations of calculus. It says area = antiderivative evaluated at endpoints."],
      practice:[{q:"State FTC Part 1.",a:"d/dx [integral(a to x) f(t) dt] = f(x)"},{q:"State FTC Part 2.",a:"integral(a to b) f(x) dx = F(b) - F(a)"},{q:"integral(0 to 2) 3x^2 dx",a:"F(x) = x^3. F(2)-F(0) = 8-0 = 8"}] },
    { id:"5.4", title:"Indefinite Integrals and the Net Change Theorem", stewart:"5.4", week:7, day:"Wed May 27",
      yt:"https://youtube.com/watch?v=zOxaUlRkFG0", ytLabel:"The Organic Chemistry Tutor", duration:"18:38",
      hasViz:false,
      reading:["Indefinite integral: integral f(x) dx = F(x) + C (general antiderivative, no bounds).","Net Change Theorem: integral(a to b) F\'(x) dx = F(b) - F(a). The integral of a rate of change gives total change.","Example: integral(t1 to t2) v(t) dt = s(t2) - s(t1) = displacement."],
      practice:[{q:"integral (4x^3 + 2x) dx",a:"x^4 + x^2 + C"},{q:"v(t)=3t^2. Displacement from t=0 to t=2?",a:"integral(0 to 2) 3t^2 dt = t^3|_0^2 = 8"}] },
    { id:"5.5", title:"The Substitution Rule", stewart:"5.5", week:7, day:"Thu May 28",
      yt:"https://youtube.com/watch?v=sdYdnpYn-1o", ytLabel:"The Organic Chemistry Tutor", duration:"34:07",
      hasViz:true, vizType:"u_sub",
      reading:["U-substitution reverses the chain rule. Choose u = inner function, find du, replace, integrate, substitute back.","Steps: (1) Pick u. (2) Find du/dx, solve for dx. (3) Replace all x terms. (4) Integrate in terms of u. (5) Substitute back.","For definite integrals, either change the bounds to u-values or substitute back before evaluating."],
      practice:[{q:"integral 2x*cos(x^2) dx",a:"u = x^2, du = 2x dx. integral cos(u) du = sin(u) + C = sin(x^2) + C"},{q:"integral x*sqrt(x^2+1) dx",a:"u = x^2+1, du = 2x dx. (1/2)*integral sqrt(u) du = (1/3)(x^2+1)^(3/2) + C"}] },
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
export default function Telpo({onBack, startUnit}){
  const [view,setView]=useState(startUnit ? "map" : "map"),[active,setActive]=useState(null),[progress,setProgress]=useState(loadProgress);
  const [showVideo, setShowVideo] = useState(false);
  const [expandedUnit, setExpandedUnit] = useState(startUnit || null);
  useEffect(()=>{saveProgress(progress);},[progress]);
  useEffect(()=>{ if(startUnit) setExpandedUnit(startUnit); },[startUnit]);
  const toggle=(id,s)=>setProgress(p=>{const n={...p};n[id]===s?delete n[id]:n[id]=s;return n;});
  const total=ALL_LECTURES.length,mastered=Object.values(progress).filter(v=>v==="mastered").length;
  const l=active, Viz=l?.hasViz?VIZ_MAP[l.vizType]||null:null, s=progress[l?.id];
  const eqs = l ? (CALC_EQUATIONS[l.id] || null) : null;
  const ytId = l?.yt?.match(/[?&]v=([^&]+)/)?.[1] || l?.yt?.match(/youtu\.be\/([^?]+)/)?.[1] || null;

  if(view==="map")return(
    <div style={{minHeight:"100vh",background:C.bg,padding:"0 24px",maxWidth:720,margin:"0 auto",fontFamily:F.sans}}>
      <div style={{paddingTop:40,marginBottom:32}}>
        {onBack && <button onClick={onBack} style={{background:"transparent",border:"none",color:"#9298a8",fontFamily:"'Inter',system-ui,sans-serif",fontSize:12,cursor:"pointer",padding:0,marginBottom:12}}>Back to Home</button>}
        <p style={{fontSize:10,fontWeight:600,color:C.silver,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 4px"}}>Telpo</p>
        <h1 style={{fontSize:24,fontWeight:600,color:C.text,margin:"0 0 6px"}}>Calculus 1</h1>
        <p style={{fontSize:12,color:C.textDim,margin:"0 0 14px"}}>Stewart 9th Ed, Ch 2-5. 30 sections. 4 exams + final. MTWTh 8:00 AM.</p>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,height:2,background:C.border,borderRadius:1,overflow:"hidden"}}><div style={{height:"100%",width:`${(mastered/total)*100}%`,background:C.blue,borderRadius:1,transition:"width 0.4s"}}/></div>
          <span style={{fontFamily:F.mono,fontSize:10,color:C.textDim}}>{mastered}/{total}</span>
        </div>
      </div>
      {UNITS.map(u=>{
        const isExpanded = expandedUnit === u.id;
        const unitMastered = u.lectures.filter(l => progress[l.id] === "mastered").length;
        const unitTotal = u.lectures.length;
        return (<div key={u.id} style={{marginBottom:4}}>
        <button onClick={() => setExpandedUnit(isExpanded ? null : u.id)} style={{
          width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"10px 12px", background: isExpanded ? C.panel : "transparent",
          border:`1px solid ${isExpanded ? C.border : "transparent"}`, borderRadius: isExpanded ? "8px 8px 0 0" : 8,
          cursor:"pointer", fontFamily:F.sans, transition:"background 0.15s",
        }}>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <span style={{fontSize:11,fontWeight:600,color: isExpanded ? C.text : C.textMid,letterSpacing:0.3}}>{u.title}</span>
            {u.exam && <span style={{fontSize:8,color:"#8a7a5b",fontFamily:F.mono,background:"rgba(138,122,91,0.1)",padding:"2px 6px",borderRadius:3}}>{u.exam}</span>}
          </div>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <span style={{fontSize:10,color: unitMastered === unitTotal && unitTotal > 0 ? C.done : C.textDim, fontFamily:F.mono}}>{unitMastered}/{unitTotal}</span>
            <span style={{fontSize:10,color:C.textDim,transform: isExpanded ? "rotate(90deg)" : "none", transition:"transform 0.2s"}}>{"\u25B6"}</span>
          </div>
        </button>
        {isExpanded && <div style={{border:`1px solid ${C.border}`, borderTop:"none", borderRadius:"0 0 8px 8px", background:C.bg}}>
        {u.lectures.map(l=>{const s=progress[l.id];return(
          <div key={l.id} onClick={()=>{setActive({...l,unitTitle:u.title});setView("lecture");setShowVideo(false);}}
            style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=C.panel} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <span style={{width:20,height:20,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontFamily:F.mono,fontWeight:600,flexShrink:0,
              background:s==="mastered"?C.greenDim:s==="watched"?C.goldDim:C.panel,
              color:s==="mastered"?C.done:s==="watched"?C.gold:C.textLight,
              border:`1px solid ${s==="mastered"?C.done:s==="watched"?C.gold:C.border}`}}>
              {s==="mastered"?"\u2713":l.stewart||l.id}</span>
            <div style={{flex:1}}>
              <span style={{fontSize:13,color:C.text,fontWeight:450}}>{l.title}</span>
              <div style={{display:"flex",gap:8,marginTop:1}}>
                <span style={{fontSize:10,color:C.textLight,fontFamily:F.mono}}>{l.duration}</span>
                {l.day && <span style={{fontSize:9,color:"#8a7a5b",fontFamily:F.mono}}>{l.day}</span>}
                {l.hasViz&&<span style={{fontSize:10,color:C.blue}}>interactive</span>}
                {(l.practice?.length||l.questions?.length)>0&&<span style={{fontSize:10,color:C.textLight}}>{(l.practice||l.questions).length}q</span>}
              </div>
            </div>
          </div>);})}
        </div>}
      </div>);})}
      <p style={{textAlign:"center",fontSize:9,color:C.textLight,letterSpacing:1.5,margin:"24px 0 40px"}}>TELPO v1.2</p>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,padding:"0 24px",maxWidth:720,margin:"0 auto",fontFamily:F.sans}}>
      <div style={{paddingTop:24}}>
        <button onClick={()=>setView("map")} style={{background:"transparent",border:"none",color:C.textDim,fontFamily:F.sans,fontSize:12,cursor:"pointer",padding:0,marginBottom:16}}>Back</button>
        <p style={{fontSize:10,fontWeight:600,color:C.silver,letterSpacing:2,textTransform:"uppercase",margin:"0 0 2px"}}>Stewart {l.stewart || l.id}</p>
        <h1 style={{fontSize:20,fontWeight:600,color:C.text,margin:"0 0 6px"}}>{l.title}</h1>
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:C.textDim,fontFamily:F.mono}}>{l.duration}</span>
          <span style={{color:C.textLight}}>.</span>
          <a href={l.yt} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:C.blue,textDecoration:"none"}}>{l.ytLabel || "YouTube"}</a>
          {l.day && <><span style={{color:C.textLight}}>.</span><span style={{fontSize:10,color:"#8a7a5b",fontFamily:F.mono}}>{l.day}</span></>}
        </div>
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {[{k:"watched",l:"Watched",c:C.gold,bg:C.goldDim},{k:"mastered",l:"Mastered",c:C.done,bg:C.greenDim}].map(v=>(
            <button key={v.k} onClick={()=>toggle(l.id,v.k)} style={{background:s===v.k?v.bg:"transparent",color:s===v.k?v.c:C.textDim,border:`1px solid ${s===v.k?v.c:C.border}`,borderRadius:3,padding:"5px 12px",fontFamily:F.sans,fontSize:11,cursor:"pointer",fontWeight:500}}>{s===v.k?"ok ":""}{v.l}</button>))}
        </div>

        {/* YouTube Player */}
        {ytId && !showVideo && (
          <button onClick={()=>setShowVideo(true)} style={{
            display:"flex", alignItems:"center", gap:8, width:"100%", marginBottom:16,
            padding:"10px 14px", background:"rgba(154,102,102,0.15)", borderRadius:8, border:"1px solid rgba(154,102,102,0.25)",
            color:"#9a6666", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:F.sans,
          }}>
            <span style={{ fontSize:16 }}>&#9654;</span>
            <span>Watch: {l.title}</span>
            <span style={{ fontSize:10, color:C.textDim, marginLeft:"auto" }}>{l.ytLabel || "The Organic Chemistry Tutor"}</span>
          </button>
        )}
        {ytId && showVideo && (
          <div style={{ marginBottom:16, borderRadius:8, overflow:"hidden", border:`1px solid ${C.border}`, background:"#000" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 10px", background:C.panel }}>
              <span style={{ fontSize:10, color:C.textDim, fontWeight:500 }}>{l.ytLabel || "The Organic Chemistry Tutor"}</span>
              <div style={{ display:"flex", gap:6 }}>
                <a href={l.yt} target="_blank" rel="noopener noreferrer" style={{ fontSize:10, color:C.blue, textDecoration:"none" }}>Open in YouTube</a>
                <button onClick={()=>setShowVideo(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:C.textDim, padding:0 }}>{"\u2715"}</button>
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

        {/* Visualization */}
        {Viz?<Viz/>:l.hasViz?<div style={{padding:24,textAlign:"center",background:C.panel,borderRadius:4,border:`1px solid ${C.border}`,marginBottom:16}}><p style={{color:C.textDim,fontSize:11,margin:0}}>Module ready to build. We scope it together when you reach this lecture.</p></div>:null}

        {/* Interactive Equations */}
        <EquationExplorer equations={eqs} />

        {/* Reading notes */}
        {l.reading && l.reading.length > 0 && (
          <div style={{marginBottom:16}}>
            <p style={{fontSize:10,fontWeight:600,color:C.textDim,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 8px"}}>Key Concepts</p>
            {l.reading.map((r,i) => <p key={i} style={{fontSize:12,color:C.textMid,lineHeight:1.8,margin:"0 0 8px",padding:"8px 12px",background:C.panel,borderRadius:6,border:`1px solid ${C.border}`}}>{r}</p>)}
          </div>
        )}
        {/* Typed answer practice */}
        <Practice questions={l.practice || l.questions} storageId={l.id}/>

        <div style={{background:C.panel,borderRadius:4,border:`1px solid ${C.border}`,padding:"12px 14px",margin:"16px 0 40px"}}>
          <p style={{fontSize:10,fontWeight:600,color:C.textDim,letterSpacing:1,textTransform:"uppercase",margin:"0 0 4px"}}>Mastery check</p>
          <p style={{color:C.textMid,fontSize:11,margin:0,lineHeight:1.6}}>Close the video. Explain the concept out loud. If you can teach it cold, mark it mastered.</p>
        </div>
      </div>
    </div>
  );
}
