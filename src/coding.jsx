import { useState, useEffect } from "react";
import { C, F, Practice } from "./shared_ui";

const CPP_UNITS=[
  {id:"c0",title:"Foundations",lectures:[
    {id:"cpp0.1",title:"Arduino IDE Setup and First Sketch",yt:"https://www.youtube.com/watch?v=fJWR7dBuc18",duration:"15:00",
      questions:[{q:"What are the two required functions in every Arduino sketch?",a:"setup() runs once at start. loop() runs repeatedly."},{q:"What does pinMode(13, OUTPUT) do?",a:"Configures pin 13 as an output pin so you can write HIGH/LOW to it."}],
      code:`void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}`},
    {id:"cpp0.2",title:"Variables, Data Types, and Serial Monitor",yt:"https://www.youtube.com/watch?v=KQwhFGBLCJM",duration:"20:00",
      questions:[{q:"What is the difference between int and float?",a:"int stores whole numbers. float stores decimal numbers."},{q:"How do you print to the Serial Monitor?",a:"Serial.begin(9600) in setup, then Serial.println(value) in loop."}],
      code:`int count = 0;\nvoid setup() {\n  Serial.begin(9600);\n}\nvoid loop() {\n  Serial.println(count);\n  count++;\n  delay(500);\n}`},
    {id:"cpp0.3",title:"Digital Input/Output",yt:"https://www.youtube.com/watch?v=4LkAd83XiXA",duration:"18:00",
      questions:[{q:"digitalRead() returns what values?",a:"HIGH (1) or LOW (0)"},{q:"What is a pull-down resistor?",a:"A resistor connecting a pin to ground to ensure LOW when no input is present."}]},
    {id:"cpp0.4",title:"Analog Input and PWM Output",yt:"https://www.youtube.com/watch?v=YfV-vCVMpZs",duration:"22:00",
      questions:[{q:"analogRead() returns values in what range?",a:"0 to 1023 (10 bit ADC)"},{q:"analogWrite() uses what range?",a:"0 to 255 (8 bit PWM)"}]},
  ]},
  {id:"c1",title:"C++ Core",lectures:[
    {id:"cpp1.1",title:"Control Flow: if, else, switch",yt:"https://www.youtube.com/watch?v=_1AwR-un4Hk",duration:"25:00",
      questions:[{q:"Write an if/else that checks if a sensor value > 500.",a:`if (sensorVal > 500) {\n  digitalWrite(LED, HIGH);\n} else {\n  digitalWrite(LED, LOW);\n}`},{q:"When is switch better than if/else?",a:"When comparing one variable against many constant values."}],
      code:`int val = analogRead(A0);\nif (val > 500) {\n  digitalWrite(13, HIGH);\n} else {\n  digitalWrite(13, LOW);\n}`},
    {id:"cpp1.2",title:"Loops: for, while, do-while",yt:"https://www.youtube.com/watch?v=nMSC_LGpMeI",duration:"20:00",
      questions:[{q:"Write a for loop that blinks an LED 5 times.",a:`for (int i = 0; i < 5; i++) {\n  digitalWrite(13, HIGH);\n  delay(200);\n  digitalWrite(13, LOW);\n  delay(200);\n}`}]},
    {id:"cpp1.3",title:"Functions",yt:"https://www.youtube.com/watch?v=8mUav-KVKMk",duration:"22:00",
      questions:[{q:"Write a function that takes brightness (0 to 255) and sets an LED.",a:`void setLED(int brightness) {\n  analogWrite(9, brightness);\n}`},{q:"What does void mean as a return type?",a:"The function returns nothing."}]},
    {id:"cpp1.4",title:"Arrays",yt:"https://www.youtube.com/watch?v=1wQBJSfVK88",duration:"18:00",
      questions:[{q:"Declare an array of 6 LED pins.",a:`int leds[] = {2, 3, 4, 5, 6, 7};`},{q:"How do you find array length in C++?",a:`sizeof(leds) / sizeof(leds[0])`}]},
    {id:"cpp1.5",title:"Pointers and References",yt:"https://www.youtube.com/watch?v=DTxHyVn0ODg",duration:"30:00",
      questions:[{q:"What does * mean in int* ptr?",a:"ptr is a pointer to an integer. It stores a memory address."},{q:"What does & do?",a:"Gets the address of a variable. int* p = &x gives p the address of x."}]},
    {id:"cpp1.6",title:"Structs and Classes",yt:"https://www.youtube.com/watch?v=2BP8NhxjrO0",duration:"28:00",
      questions:[{q:"What is the difference between a struct and a class in C++?",a:"Default access: struct is public, class is private. Otherwise identical."},{q:"Write a struct for an LED with pin and state.",a:`struct LED {\n  int pin;\n  bool state;\n};`}]},
  ]},
  {id:"c2",title:"Sensors and Actuators",lectures:[
    {id:"cpp2.1",title:"Buttons and Debouncing",yt:"https://www.youtube.com/watch?v=aMato4olzi8",duration:"18:00",
      questions:[{q:"Why do buttons need debouncing?",a:"Mechanical contacts bounce, causing multiple reads. Debouncing waits for a stable signal."}]},
    {id:"cpp2.2",title:"Potentiometers and Analog Sensors",yt:"https://www.youtube.com/watch?v=YfV-vCVMpZs",duration:"15:00",
      questions:[{q:"How do you map a 0-1023 value to 0-255?",a:`int output = map(sensorVal, 0, 1023, 0, 255);`}]},
    {id:"cpp2.3",title:"Servo Motors",yt:"https://www.youtube.com/watch?v=kUHmYKWwuWs",duration:"14:00",
      questions:[{q:"What library do you include for servo control?",a:`#include <Servo.h>`}]},
    {id:"cpp2.4",title:"Ultrasonic Distance Sensor",yt:"https://www.youtube.com/watch?v=6F1B_N6LuKw",duration:"16:00",
      questions:[{q:"How does an ultrasonic sensor measure distance?",a:"Sends a sound pulse, measures time for echo to return. d = (time * speed_of_sound) / 2"}]},
  ]},
  {id:"c3",title:"Advanced Arduino",lectures:[
    {id:"cpp3.1",title:"I2C Communication",yt:"https://www.youtube.com/watch?v=6IAkYpmA1DQ",duration:"20:00",
      questions:[{q:"What two wires does I2C use?",a:"SDA (data) and SCL (clock)"}]},
    {id:"cpp3.2",title:"SPI Communication",yt:"https://www.youtube.com/watch?v=fvOAbDMzoks",duration:"18:00",
      questions:[{q:"How many wires does SPI use?",a:"Four: MOSI, MISO, SCLK, SS"}]},
    {id:"cpp3.3",title:"Interrupts",yt:"https://www.youtube.com/watch?v=QtyOiLNkNZg",duration:"15:00",
      questions:[{q:"What is an interrupt?",a:"A signal that pauses the main program to run a special function (ISR) immediately."}]},
    {id:"cpp3.4",title:"EEPROM and Persistent Storage",yt:"https://www.youtube.com/watch?v=ShqvATqXA7g",duration:"12:00",
      questions:[{q:"What is EEPROM used for?",a:"Storing data that persists after power off. Limited write cycles (around 100,000)."}]},
    {id:"cpp3.5",title:"Libraries and Building Projects",yt:"https://www.youtube.com/watch?v=KQwhFGBLCJM",duration:"20:00",
      questions:[{q:"How do you install a library in Arduino IDE?",a:"Sketch then Include Library then Manage Libraries then search and install."}]},
    {id:"cpp3.6",title:"Project: Synthesizer Module",yt:"https://www.youtube.com/watch?v=2k2MaLRYKKI",duration:"25:00",
      questions:[{q:"How do you generate a tone on Arduino?",a:`tone(pin, frequency, duration) outputs a square wave at the given frequency.`}]},
  ]},
];

const RUST_UNITS=[
  {id:"r0",title:"Getting Started",lectures:[
    {id:"rs0.1",title:"Install Rust and Hello World",yt:"https://www.youtube.com/watch?v=OX9HJsJUDxA",duration:"12:00",
      questions:[{q:"What command creates a new Rust project?",a:"cargo new project_name"},{q:"What command compiles and runs?",a:"cargo run"}],
      code:`fn main() {\n    println!("Hello, world!");\n}`},
    {id:"rs0.2",title:"Variables, Types, and Mutability",yt:"https://www.youtube.com/watch?v=t047Hseyj_k",duration:"20:00",
      questions:[{q:"Are Rust variables mutable by default?",a:"No. Use let mut x = 5 to make them mutable."},{q:"Name 4 scalar types in Rust.",a:"i32, f64, bool, char"}],
      code:`let x = 5;\nlet mut y = 10;\ny += x;\nprintln!("{}", y);`},
    {id:"rs0.3",title:"Functions and Control Flow",yt:"https://www.youtube.com/watch?v=pMhDOoSfyPA",duration:"22:00",
      questions:[{q:"Write a function that returns the square of an i32.",a:`fn square(x: i32) -> i32 {\n    x * x\n}`},{q:"Does Rust require explicit return?",a:"No. The last expression without a semicolon is returned."}]},
  ]},
  {id:"r1",title:"Ownership and Borrowing",lectures:[
    {id:"rs1.1",title:"Ownership Rules",yt:"https://www.youtube.com/watch?v=lQ7XF-6HYGc",duration:"25:00",
      questions:[{q:"What are the 3 ownership rules?",a:"1) Each value has one owner. 2) Only one owner at a time. 3) Value dropped when owner goes out of scope."},{q:"What happens after let s2 = s1 for a String?",a:"s1 is moved to s2. s1 is no longer valid."}]},
    {id:"rs1.2",title:"References and Borrowing",yt:"https://www.youtube.com/watch?v=lQ7XF-6HYGc",duration:"20:00",
      questions:[{q:"What is the difference between &x and &mut x?",a:"&x is an immutable reference (can read). &mut x is a mutable reference (can modify)."},{q:"Can you have multiple mutable references?",a:"No. One mutable reference OR multiple immutable references, never both."}],
      code:`fn length(s: &String) -> usize {\n    s.len()\n}\nlet s = String::from("hello");\nprintln!("{}", length(&s));`},
    {id:"rs1.3",title:"Lifetimes",yt:"https://www.youtube.com/watch?v=juIINGuZyBc",duration:"28:00",
      questions:[{q:"What do lifetimes prevent?",a:"Dangling references. They ensure references don't outlive the data they point to."},{q:"What does 'a mean?",a:"A lifetime parameter. It tells the compiler how long a reference is valid."}]},
  ]},
  {id:"r2",title:"Data Structures",lectures:[
    {id:"rs2.1",title:"Structs",yt:"https://www.youtube.com/watch?v=n3bPhdiJm9I",duration:"18:00",
      questions:[{q:"Define a struct for a 2D vector.",a:`struct Vec2 {\n    x: f64,\n    y: f64,\n}`}],
      code:`struct Point {\n    x: f64,\n    y: f64,\n}\nimpl Point {\n    fn distance(&self, other: &Point) -> f64 {\n        ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt()\n    }\n}`},
    {id:"rs2.2",title:"Enums and Pattern Matching",yt:"https://www.youtube.com/watch?v=DSZqIJhkNCM",duration:"22:00",
      questions:[{q:"Write an enum for a traffic light.",a:`enum Light {\n    Red,\n    Yellow,\n    Green,\n}`},{q:"What keyword matches against enum variants?",a:"match"}]},
    {id:"rs2.3",title:"Vectors, Strings, HashMaps",yt:"https://www.youtube.com/watch?v=Zs-pS6LgEIc",duration:"24:00",
      questions:[{q:"Create a vector and push values.",a:`let mut v = Vec::new();\nv.push(1);\nv.push(2);`}]},
  ]},
  {id:"r3",title:"Error Handling and Traits",lectures:[
    {id:"rs3.1",title:"Result and Option",yt:"https://www.youtube.com/watch?v=wM6o70NAWUI",duration:"22:00",
      questions:[{q:"What are the two variants of Option<T>?",a:"Some(T) and None"},{q:"What does the ? operator do?",a:"Returns the error early if Result is Err, unwraps Ok otherwise."}]},
    {id:"rs3.2",title:"Traits and Generics",yt:"https://www.youtube.com/watch?v=T0Xflz4p68c",duration:"28:00",
      questions:[{q:"What is a trait in Rust?",a:"A collection of methods that types can implement. Similar to interfaces."},{q:"Write a simple trait.",a:`trait Area {\n    fn area(&self) -> f64;\n}`}]},
    {id:"rs3.3",title:"Closures and Iterators",yt:"https://www.youtube.com/watch?v=dHkzSZnYXmk",duration:"20:00",
      questions:[{q:"Write a closure that doubles a number.",a:`let double = |x| x * 2;`},{q:"What does .map() do on an iterator?",a:"Transforms each element by applying a closure."}]},
  ]},
  {id:"r4",title:"Systems Programming",lectures:[
    {id:"rs4.1",title:"Modules and Crates",yt:"https://www.youtube.com/watch?v=969j0qnJGi8",duration:"18:00",
      questions:[{q:"What is a crate?",a:"A Rust compilation unit. Binary or library."},{q:"How do you declare a module?",a:"mod my_module; or mod my_module { ... }"}]},
    {id:"rs4.2",title:"File I/O",yt:"https://www.youtube.com/watch?v=K_wnB9A5eVE",duration:"15:00",
      questions:[{q:"How do you read a file to string?",a:`use std::fs;\nlet contents = fs::read_to_string("file.txt")?;`}]},
    {id:"rs4.3",title:"Concurrency",yt:"https://www.youtube.com/watch?v=06WcsNPHbKM",duration:"25:00",
      questions:[{q:"How do you spawn a thread in Rust?",a:`use std::thread;\nthread::spawn(|| {\n    println!("hello from thread");\n});`}]},
    {id:"rs4.4",title:"Building a CLI Tool",yt:"https://www.youtube.com/watch?v=BStWkd3v5VE",duration:"30:00",
      questions:[{q:"What crate is commonly used for CLI argument parsing?",a:"clap"}]},
    {id:"rs4.5",title:"Unsafe Rust and FFI",yt:"https://www.youtube.com/watch?v=uKlHwko_s50",duration:"20:00",
      questions:[{q:"When would you use unsafe Rust?",a:"Dereferencing raw pointers, calling C functions (FFI), or implementing unsafe traits."}]},
  ]},
];

const CURRICULA = { cpp: CPP_UNITS, rust: RUST_UNITS };
const KEYS = { cpp: "Telpo-cpp-v1", rust: "Telpo-rust-v1" };
const TITLES = { cpp: "Arduino C++", rust: "Rust" };
const DESCS = { cpp: "Embedded systems, sensors, actuators, and hardware programming.", rust: "Systems programming from ownership to concurrency." };

function loadP(k){try{const r=localStorage.getItem(k);return r?JSON.parse(r):{};}catch{return{};}}
function saveP(k,d){try{localStorage.setItem(k,JSON.stringify(d));}catch{}}

export default function CodingLab({subject,onBack}){
  const units=CURRICULA[subject]||[];
  const sk=KEYS[subject];
  const allLecs=units.flatMap(u=>u.lectures.map(l=>({...l,unitTitle:u.title})));
  const [view,setView]=useState("map"),[active,setActive]=useState(null),[progress,setProgress]=useState(()=>loadP(sk));
  useEffect(()=>{saveP(sk,progress);},[progress,sk]);
  const toggle=(id,s)=>setProgress(p=>{const n={...p};n[id]===s?delete n[id]:n[id]=s;return n;});
  const total=allLecs.length,mastered=Object.values(progress).filter(v=>v==="mastered").length;

  if(view==="map")return(
    <div style={{minHeight:"100vh",background:C.bg,padding:"0 24px",maxWidth:720,margin:"0 auto",fontFamily:F.sans}}>
      <div style={{paddingTop:24}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:C.textDim,fontFamily:F.sans,fontSize:12,cursor:"pointer",padding:0,marginBottom:12}}>Back to Home</button>
        <p style={{fontSize:10,fontWeight:600,color:C.silver,letterSpacing:2.5,textTransform:"uppercase",margin:"0 0 4px"}}>Telpo</p>
        <h1 style={{fontSize:24,fontWeight:600,color:C.text,margin:"0 0 6px"}}>{TITLES[subject]}</h1>
        <p style={{fontSize:12,color:C.textDim,margin:"0 0 14px"}}>{DESCS[subject]}</p>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
          <div style={{flex:1,height:2,background:C.border,borderRadius:1,overflow:"hidden"}}><div style={{height:"100%",width:`${total?((mastered/total)*100):0}%`,background:C.blue,transition:"width 0.4s"}}/></div>
          <span style={{fontFamily:F.mono,fontSize:10,color:C.textDim}}>{mastered}/{total}</span>
        </div>
      </div>
      {units.map(u=><div key={u.id} style={{marginBottom:24}}>
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
                {l.questions?.length>0&&<span style={{fontSize:10,color:C.textLight}}>{l.questions.length}p</span>}
                {l.code&&<span style={{fontSize:10,color:C.blue}}>code</span>}
              </div>
            </div>
            <span style={{color:C.textLight,fontSize:13}}></span>
          </div>);})}
      </div>)}
      <p style={{textAlign:"center",fontSize:9,color:C.textLight,letterSpacing:1.5,margin:"24px 0 40px"}}>TELPO {TITLES[subject].toUpperCase()} v1.1</p>
    </div>
  );

  const l=active,s=progress[l?.id];
  return(
    <div style={{minHeight:"100vh",background:C.bg,padding:"0 24px",maxWidth:720,margin:"0 auto",fontFamily:F.sans}}>
      <div style={{paddingTop:24}}>
        <button onClick={()=>setView("map")} style={{background:"transparent",border:"none",color:C.textDim,fontFamily:F.sans,fontSize:12,cursor:"pointer",padding:0,marginBottom:16}}>Back</button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <p style={{fontSize:10,fontWeight:600,color:C.silver,letterSpacing:2,textTransform:"uppercase",margin:"0 0 2px"}}>{l.unitTitle}</p>
            <h1 style={{fontSize:20,fontWeight:600,color:C.text,margin:"0 0 6px"}}>{l.title}</h1>
          </div>
          <a href={l.yt} target="_blank" rel="noopener noreferrer" style={{
            fontSize:11,color:C.blue,textDecoration:"none",fontFamily:F.mono,
            padding:"6px 12px",border:`1px solid ${C.blue}`,borderRadius:4,flexShrink:0,marginTop:4,
          }}>YouTube</a>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          <span style={{fontSize:11,color:C.textDim,fontFamily:F.mono}}>{l.duration}</span>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {[{k:"watched",l2:"Watched",c:C.gold,bg:C.goldDim},{k:"mastered",l2:"Mastered",c:C.green,bg:C.greenDim}].map(v=>(
            <button key={v.k} onClick={()=>toggle(l.id,v.k)} style={{background:s===v.k?v.bg:"transparent",color:s===v.k?v.c:C.textDim,border:`1px solid ${s===v.k?v.c:C.border}`,borderRadius:3,padding:"5px 12px",fontFamily:F.sans,fontSize:11,cursor:"pointer",fontWeight:500}}>{s===v.k?"ok ":""}{v.l2}</button>))}
        </div>

        {l.code&&<div style={{marginBottom:16}}>
          <p style={{fontSize:10,fontWeight:600,color:C.textDim,letterSpacing:1,textTransform:"uppercase",margin:"0 0 6px"}}>Example</p>
          <pre style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:4,padding:"12px 14px",fontFamily:F.mono,fontSize:12,color:C.text,lineHeight:1.6,overflow:"auto",margin:0,whiteSpace:"pre-wrap"}}>{l.code}</pre>
        </div>}

        <Practice questions={l.questions}/>

        <div style={{background:C.panel,borderRadius:4,border:`1px solid ${C.border}`,padding:"12px 14px",margin:"16px 0 20px"}}>
          <p style={{fontSize:10,fontWeight:600,color:C.textDim,letterSpacing:1,textTransform:"uppercase",margin:"0 0 4px"}}>Calc connection</p>
          <p style={{color:C.textMid,fontSize:11,margin:0,lineHeight:1.6}}>
            {subject==="cpp"
              ?"Think about how the math you're learning in calc applies here. Sensor readings are functions. PWM is related to wave frequency. Motor control uses rates of change (derivatives)."
              :"Rust's type system connects to math precision. Iterators map to sequences and series. Closures are like function composition. Error handling mirrors conditional logic in proofs."}
          </p>
        </div>

        <div style={{background:C.panel,borderRadius:4,border:`1px solid ${C.border}`,padding:"12px 14px",margin:"0 0 40px"}}>
          <p style={{fontSize:10,fontWeight:600,color:C.textDim,letterSpacing:1,textTransform:"uppercase",margin:"0 0 4px"}}>Mastery check</p>
          <p style={{color:C.textMid,fontSize:11,margin:0,lineHeight:1.6}}>Write the code from memory without references. If you can, mark it mastered.</p>
        </div>
      </div>
    </div>
  );
}
