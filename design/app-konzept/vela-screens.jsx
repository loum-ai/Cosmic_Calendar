const DS = window.LoumDesignSystem_a4f6f6;
const V = window.VELA;
const { Button, Card, BadgeBgOutline, Chip, Alert, ListCard, Input, Switch, Icon, Text, ActiveTransitCard } = DS;
const { NavGlyph, G, Eyebrow, PhoneShell, VelaTabs, AskBar, PlanetPhotoCard, Sheet, TwoLevel, RelatedChips, BirthWheel, MiniWheel, Kachel, TimeScrubber, Orb } = V;
const UI = "var(--font-ui)";
const DISPLAY = { fontFamily:"var(--f-display)", fontWeight:400, textTransform:"uppercase", color:"var(--fg)" };
const toneRgb = (t) => t==="mystic"?"32,240,208":t==="solar"?"255,172,137":t==="azure"?"85,153,255":"167,139,250";
function AspectBadge({ a, b, tone = "iris", size = 30 }) {
  const rgb = toneRgb(tone);
  const c = { width:size, height:size, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(17,16,25,.7)", boxShadow:`inset 0 0 0 1px rgba(${rgb},.55)`, color:"#EDEAFF", flexShrink:0, position:"relative", zIndex:1 };
  return <span style={{ display:"inline-flex", alignItems:"center", flexShrink:0 }}>
    <span style={c}><Icon name={a} size={size*.44}/></span>
    <span aria-hidden="true" style={{ width:20, height:1.5, background:`rgba(${rgb},.8)`, boxShadow:`0 0 7px rgba(${rgb},.7)`, margin:"0 -1px" }}></span>
    <span style={c}><Icon name={b} size={size*.44}/></span>
  </span>;
}

/* ══ 1 · CHART (Home) — oberer Viewport, interaktiv: Rad → Sheet-Stapel ══ */
function ChartHome({ initial = [] }) {
  const [stack, setStack] = React.useState(initial);
  const [kurz, setKurz] = React.useState(true);
  const top = stack[stack.length-1];
  const push = (it) => setStack(s => [...s, it]);
  const sel = top && top.t === "p" ? top.k : null;
  const selAspect = top && top.t === "a" ? top.i : null;
  let sheet = null;
  if (top && top.t === "p") {
    const p = V.byKey(top.k);
    const rel = V.ASPECTS.map((a,i)=>({a,i})).filter(x => x.a.a===top.k || x.a.b===top.k).slice(0,3);
    sheet = { meta:`${p.haus}. Haus · ${V.HOUSES[p.haus-1][0]}`, title:`${p.name} in ${p.sign}`, body: <React.Fragment>
      <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:14 }}>
        <MiniWheel focus={[p.key]}/>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:7, fontFamily:UI, fontSize:12.5, color:"rgba(238,245,248,.75)" }}><Icon name={V.SIGN_ICON[p.sign]} size={13}/>{p.sign}</span>
          <span style={{ fontFamily:UI, fontSize:12.5, color:"rgba(238,245,248,.55)" }}>{p.rolle}</span>
        </div>
      </div>
      <TwoLevel was={p.was} dir={p.dir}/>
      <RelatedChips items={rel.map(x => { const other = V.byKey(x.a.a===top.k ? x.a.b : x.a.a); return { label:`${V.ASPECT_TYPES[x.a.t].sym} ${other.name}`, icon:<Icon name={other.icon} size={12}/>, onClick:() => push({ t:"a", i:x.i }) }; }).concat([{ label:`${p.haus}. Haus`, onClick:() => push({ t:"h", n:p.haus }) }])}/>
    </React.Fragment> };
  } else if (top && top.t === "a") {
    const a = V.ASPECTS[top.i], T = V.ASPECT_TYPES[a.t], A = V.byKey(a.a), B = V.byKey(a.b);
    sheet = { meta:`${T.name} · ${T.meta}`, title:`${A.name} ${T.sym} ${B.name}`, body: <React.Fragment>
      <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:14 }}>
        <MiniWheel focus={[a.a,a.b]} aspect={a.t}/>
        <span style={{ fontFamily:UI, fontSize:12.5, lineHeight:1.5, color:"rgba(238,245,248,.55)" }}>Eine Linie zwischen zwei Kräften — {T.meta.toLowerCase()}.</span>
      </div>
      <TwoLevel was={T.was} dir={a.dir}/>
      <RelatedChips items={[A,B].map(p => ({ label:`${p.name} in ${p.sign}`, icon:<Icon name={p.icon} size={12}/>, onClick:() => push({ t:"p", k:p.key }) }))}/>
    </React.Fragment> };
  } else if (top && top.t === "h") {
    const [label] = V.HOUSES[top.n-1];
    const inH = V.ALL_POINTS.filter(p => p.haus === top.n);
    sheet = { meta:"Lebensbereich", title:`${top.n}. Haus — ${label}`, body: <React.Fragment>
      <TwoLevel was="Häuser sind die zwölf Lebensbereiche: Sie zeigen, wo im Leben eine Kraft wirkt — vom Auftritt bis zum Rückzug." dir={inH.length ? `Hier ${inH.length===1?"steht":"stehen"} bei dir ${inH.map(p=>p.name).join(", ")} — dieser Bereich ist Dauerthema, kein Nebenschauplatz.` : "Kein Planet steht hier: Dieser Bereich ist bei dir Thema, kein Dauerzustand — er meldet sich, wenn Transite ihn berühren."}/>
      {inH.length > 0 && <RelatedChips items={inH.slice(0,3).map(p => ({ label:p.name, icon:<Icon name={p.icon} size={12}/>, onClick:() => push({ t:"p", k:p.key }) }))}/>}
    </React.Fragment> };
  }
  return <PhoneShell tab="chart" height={912} pad="4px 20px 180px" bg={<V.Horizon tone="iris" h={280}/>}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <Eyebrow ls="2px">Geburts-Chart</Eyebrow>
        <h1 style={{ ...DISPLAY, fontSize:27, letterSpacing:".06em", margin:"6px 0 0" }}>{V.PROFILE.name}</h1>
        <div style={{ fontFamily:UI, fontSize:11.5, color:"rgba(238,245,248,.5)", marginTop:5 }}>{V.PROFILE.datum} · {V.PROFILE.zeit} · {V.PROFILE.ort}</div>
      </div>
      <Orb size={40}/>
    </div>
    {kurz && <div style={{ borderRadius:16, padding:"13px 15px", position:"relative", background:"linear-gradient(180deg,#201D2C 0%,#1B1926 55%,#17141F 100%)", boxShadow:"inset 0 0 0 1px rgba(255,255,255,.09), inset 0 1px 0 rgba(255,255,255,.05)" }}>
      <button onClick={() => setKurz(false)} aria-label="Schließen" style={{ position:"absolute", right:8, top:8, background:"none", border:"none", color:"rgba(255,255,255,.4)", cursor:"pointer", padding:4 }}><NavGlyph d={G.x} s={13}/></button>
      <Eyebrow color="#BBA8FF" ls="1.8px">Kurz gesagt</Eyebrow>
      <p style={{ fontFamily:UI, fontSize:12.5, lineHeight:1.55, color:"rgba(238,245,248,.72)", margin:"7px 12px 0 0" }}>Außen Löwe: Du wirkst sicherer, als es sich innen anfühlt. Innen Fische-Sonne und Jungfrau-Mond: viel wahrnehmen, fein sortieren. Tipp irgendetwas an — alles hier erklärt sich.</p>
    </div>}
    <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", gap:10, marginTop:2 }}>
      <div aria-hidden="true" style={{ position:"absolute", left:"50%", top:150, transform:"translate(-50%,-50%)", width:410, height:410, borderRadius:"50%", background:"radial-gradient(circle, rgba(167,139,250,.24) 0%, rgba(120,157,255,.10) 45%, transparent 68%)", mixBlendMode:"plus-lighter", pointerEvents:"none" }}></div>
      <div aria-hidden="true" style={{ position:"absolute", left:"50%", top:150, transform:"translate(-50%,-50%)", width:330, height:330, borderRadius:"50%", background:"rgba(10,9,18,.55)", boxShadow:"0 0 60px 20px rgba(10,9,18,.55)", pointerEvents:"none" }}></div>
      <BirthWheel size={316} sel={sel} selAspect={selAspect} onSel={(k) => setStack([{ t:"p", k }])} onSelAspect={(i) => setStack([{ t:"a", i }])}/>
      <V.AspectLegend/>
    </div>
    <AskBar/>
    {sheet && <Sheet open onClose={() => setStack([])} onBack={() => setStack(s => s.slice(0,-1))} depth={stack.length} meta={sheet.meta} title={sheet.title}>{sheet.body}</Sheet>}
  </PhoneShell>;
}

/* ══ 1b · CHART — weiter unten im selben Tab ══ */
function DeutungsKarte({ eyebrow, title, body, viz }) {
  return <div style={{ borderRadius:18, padding:"17px 16px 18px", width:252, flexShrink:0, scrollSnapAlign:"start", position:"relative", background:"linear-gradient(180deg,#1B1926 0%,#141320 100%)", boxShadow:"inset 0 0 0 1px rgba(167,139,250,.30), inset 0 14px 24px -20px rgba(32,240,208,.35), inset 0 -22px 34px -30px rgba(167,139,250,.4)" }}>
    <Eyebrow color="#BBA8FF" ls="1.8px">{eyebrow}</Eyebrow>
    {viz && <div aria-hidden="true" style={{ margin:"13px 0 -2px", minHeight:28, display:"flex", alignItems:"flex-end" }}>{viz}</div>}
    <div style={{ ...DISPLAY, fontSize:16, letterSpacing:".05em", margin:"10px 0 8px" }}>{title}</div>
    <p style={{ fontFamily:UI, fontSize:12.5, lineHeight:1.58, color:"rgba(238,245,248,.62)", margin:0 }}>{body}</p>
  </div>;
}
function ChartWeiter() {
  const deut = [
    ["Chart-Signatur","Wasser vorn, Erde als Boden","Vier deiner Stände in Wasserzeichen, drei in Erde: Du nimmst viel wahr — und brauchst Greifbares, um es zu halten.", <span style={{ display:"flex", gap:12, alignItems:"flex-end" }}>{[["Wasser",24,"32,240,208"],["Erde",15,"255,172,137"],["Luft",8,"167,139,250"],["Feuer",5,"242,98,181"]].map(([l,h,rgb]) => <span key={l} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}><span style={{ width:18, height:h, borderRadius:3, background:`rgba(${rgb},.8)`, boxShadow:`0 0 8px rgba(${rgb},.35)` }}></span><span style={{ fontFamily:UI, fontSize:7.5, letterSpacing:".8px", textTransform:"uppercase", color:"rgba(255,255,255,.45)" }}>{l}</span></span>)}</span>],
    ["Schwerpunkte","Unter dem Horizont","Häuser 2 bis 8 sind voll besetzt: Das meiste passiert bei dir innen, bevor es jemand sieht.", <svg width="78" height="30" viewBox="0 0 78 30">{Array.from({length:12},(_,i)=>{const a=Math.PI-(i*Math.PI/11);const x=39+Math.cos(a)*33, y=27-Math.sin(a)*21; const on=i>=1&&i<=7; return <circle key={i} cx={x} cy={y} r={on?2.7:1.6} fill={on?"#BBA8FF":"rgba(248,247,242,.25)"} style={on?{filter:"drop-shadow(0 0 4px rgba(167,139,250,.7))"}:undefined}/>;})}</svg>],
    ["Aspekt-Muster","Die Achse Sonne–Mond","Eine Opposition spannt dein Chart auf: Wollen und Fühlen verhandeln ständig — das ist dein Grundton, kein Fehler.", <svg width="74" height="28" viewBox="0 0 74 28"><line x1="8" y1="21" x2="66" y2="7" stroke="rgba(255,172,137,.85)" strokeWidth="1.5" style={{ filter:"drop-shadow(0 0 5px rgba(255,172,137,.6))" }}/><circle cx="8" cy="21" r="3.4" fill="#F8F7F2"/><circle cx="66" cy="7" r="3.4" fill="#F8F7F2"/></svg>],
    ["Sonne & Mond","Fische trifft Jungfrau","Deine Sonne träumt in Bildern, dein Mond sortiert in Listen. Zusammen: Intuition mit Qualitätskontrolle.", <AspectBadge a="Planets2Property1Sun" b="Planets2Property1Moon" tone="iris" size={26}/>],
  ];
  return <PhoneShell tab="chart" minH={1160}>
    <div>
      <Eyebrow ls="2px">Auf einen Blick</Eyebrow>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:10 }}>
        <Kachel icon="Planets2Property1Sun" label="Sonne" value="Fische" sub="8. Haus"/>
        <Kachel icon="Planets2Property1Moon" label="Mond" value="Jungfrau" sub="2. Haus"/>
        <Kachel icon="Planets2Property1AC" label="Aszendent" value="Löwe" sub="Auftritt"/>
        <Kachel icon="ElementsProperty1Water" label="Element" value="Wasser" sub="4 Stände"/>
        <Kachel glyph={<span style={{ fontSize:13 }}>◆</span>} label="Modus" value="Fix" sub="hält"/>
        <Kachel icon="Planets2Property1Saturn" label="Heute" value="♄ △ ☉" sub="Trigon" lit/>
      </div>
    </div>
    <div>
      <Eyebrow ls="2px">Chart · weiter unten</Eyebrow>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginTop:10 }}>
        <h2 style={{ ...DISPLAY, fontSize:19, letterSpacing:".06em", margin:0 }}>Was dich ausmacht</h2>
        <span style={{ fontFamily:UI, fontSize:11, color:"rgba(255,255,255,.38)" }}>wischen →</span>
      </div>
    </div>
    <div style={{ display:"flex", gap:10, overflowX:"auto", scrollSnapType:"x mandatory", margin:"0 -20px 0 0", padding:"0 20px 4px 0", scrollbarWidth:"none" }}>
      {deut.map(d => <DeutungsKarte key={d[0]} eyebrow={d[0]} title={d[1]} body={d[2]} viz={d[3]}/>)}
    </div>
    <div>
      <Eyebrow ls="2px">Deine Planeten</Eyebrow>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:10 }}>
        <PlanetPhotoCard p={V.byKey("sonne")} hero/>
        <PlanetPhotoCard p={V.byKey("ac")} hero/>
      </div>
      <div style={{ display:"flex", gap:12, overflowX:"auto", scrollSnapType:"x mandatory", margin:"12px -20px 0 0", padding:"0 20px 6px 0", scrollbarWidth:"none" }}>
        {V.PLANETS.filter(p => p.key !== "sonne").map(p => <PlanetPhotoCard key={p.key} p={p}/>)}
      </div>
    </div>
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
        <Eyebrow ls="2px">12 Lebensbereiche</Eyebrow>
        <span style={{ fontFamily:UI, fontSize:11, color:"rgba(255,255,255,.38)" }}>Häuser</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7, marginTop:10 }}>
        {V.HOUSES.map(([label, sign], i) => <button key={label} className="glass-surface" data-interactive="true" style={{ borderRadius:12, padding:"10px 10px 9px", textAlign:"left", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", gap:3 }}>
          <span style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"var(--f-display)", fontSize:13, color:"rgba(187,168,255,.8)" }}>{i+1}</span>
            <span style={{ color:"rgba(255,255,255,.38)" }}><Icon name={V.SIGN_ICON[sign]} size={11}/></span>
          </span>
          <span style={{ fontFamily:UI, fontSize:11.5, fontWeight:500, color:"var(--fg)" }}>{label}</span>
        </button>)}
      </div>
    </div>
    <div>
      <Eyebrow ls="2px">Zeichen & Mondknoten</Eyebrow>
      <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginTop:10 }}>
        {[["Sonne Fische","ZodiacProperty1Pisces"],["Mond Jungfrau","ZodiacProperty1Virgo"],["AC Löwe","ZodiacProperty1Leo"],["☊ Steinbock","ZodiacProperty1Capricorn"],["☋ Krebs","ZodiacProperty1Cancer"]].map(([l, ic]) => <span key={l} style={{ display:"inline-flex", alignItems:"center", gap:7, fontFamily:UI, fontSize:12, color:"rgba(238,245,248,.78)", background:"rgba(248,247,242,.04)", boxShadow:"inset 0 0 0 1px rgba(255,255,255,.12)", borderRadius:999, padding:"8px 13px" }}><Icon name={ic} size={12}/>{l}</span>)}
      </div>
    </div>
  </PhoneShell>;
}

/* ══ 2 · TRANSITE — „Was der Himmel heute auslöst" + Zeit-Regler ══ */
function TransitWheel({ day = 0, size = 250 }) {
  const c = size/2, f = size/340, rZ = 118*f/(118/166), rOut = size/2-4, rT = rOut-16, rN = rOut-40;
  const trans = [
    { icon:"Planets2Property1Moon", base:68, speed:12.2 },
    { icon:"Planets2Property1Sun", base:-179, speed:.99 },
    { icon:"Planets2Property1Saturn", base:-162, speed:.06 },
  ];
  return <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
    <svg width={size} height={size} style={{ position:"absolute", inset:0 }}>
      <defs><linearGradient id="velaBezelT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#20F0D0"/><stop offset=".5" stopColor="#A78BFA"/><stop offset="1" stopColor="#789DFF"/></linearGradient></defs>
      <circle cx={c} cy={c} r={rOut} fill="rgba(150,130,220,.03)" stroke="url(#velaBezelT)" strokeWidth="1.3" opacity=".55"/>
      <circle cx={c} cy={c} r={rN+12} fill="none" stroke="rgba(196,180,255,.08)" strokeWidth="1"/>
      {Array.from({length:12}, (_,k) => { const p1 = V.posAt(180-k*30, rOut, c), p2 = V.posAt(180-k*30, rOut-6, c);
        return <line key={k} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(196,180,255,.26)" strokeWidth="1"/>; })}
      {V.ALL_POINTS.map(p => { const q = V.posAt(V.angleOf(p), rN, c);
        return <circle key={p.key} cx={q.x} cy={q.y} r="2.2" fill="rgba(206,190,255,.4)"/>; })}
    </svg>
    {trans.map(t => { const q = V.posAt(t.base - t.speed*day, rT, c);
      return <span key={t.icon} style={{ position:"absolute", left:q.x-12, top:q.y-12, width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"50%", background:"rgba(167,139,250,.16)", boxShadow:"inset 0 0 0 1px rgba(187,168,255,.6), 0 0 10px rgba(167,139,250,.5)", color:"#EDE6FF", transition:"left .25s ease-out, top .25s ease-out" }}><Icon name={t.icon} size={11}/></span>; })}
  </div>;
}
function TransiteScreen() {
  const [day, setDay] = React.useState(0);
  return <PhoneShell tab="transite" aurora minH={1010} bg={<V.Horizon tone="mystic" h={300}/>}>
    <div>
      <Eyebrow ls="2px">Transite</Eyebrow>
      <h1 style={{ ...DISPLAY, fontSize:23, letterSpacing:".05em", lineHeight:1.25, margin:"8px 0 0" }}>Was der Himmel<br/>heute auslöst</h1>
      <p style={{ fontFamily:UI, fontSize:12.5, color:"rgba(238,245,248,.55)", margin:"8px 0 0" }}>Mittwoch, 22. Juli · gegen deinen Geburtshimmel gelesen</p>
    </div>
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
      <TransitWheel day={day}/>
      <div style={{ width:"100%" }}><TimeScrubber value={day} onChange={setDay}/></div>
      <span style={{ fontFamily:UI, fontSize:10.5, letterSpacing:"1.4px", textTransform:"uppercase", color:"rgba(255,255,255,.35)", textAlign:"center" }}>Zieh am Regler — die Planeten wandern sichtbar</span>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {(() => { const [t0, ...rest] = V.TRANSITS; const rgb = toneRgb(t0.tone);
        return <React.Fragment>
          <div style={{ borderRadius:18, padding:"16px 16px 15px", position:"relative", overflow:"hidden", background:"linear-gradient(180deg,#1B1926 0%,#141320 100%)", boxShadow:`inset 0 0 0 1px rgba(${rgb},.3)` }}>
            <div aria-hidden="true" style={{ position:"absolute", right:-40, top:-46, width:170, height:170, borderRadius:"50%", background:`radial-gradient(circle, rgba(${rgb},.16), transparent 68%)` }}></div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <AspectBadge a={t0.a} b={t0.b} tone={t0.tone} size={34}/>
              <span style={{ fontFamily:UI, fontSize:9.5, letterSpacing:"1.8px", textTransform:"uppercase", color:`rgba(${rgb},.9)`, marginLeft:"auto" }}>{t0.range}</span>
            </div>
            <div style={{ ...DISPLAY, fontSize:17, letterSpacing:".05em", margin:"12px 0 7px", position:"relative" }}>{t0.title}</div>
            <p style={{ fontFamily:UI, fontSize:12.5, lineHeight:1.55, color:"rgba(238,245,248,.66)", margin:0, position:"relative" }}>{t0.note}</p>
          </div>
          {rest.map(t => <div key={t.title} className="glass-surface" style={{ borderRadius:14, padding:"11px 14px", display:"flex", alignItems:"center", gap:12 }}>
            <AspectBadge a={t.a} b={t.b} tone={t.tone} size={26}/>
            <span style={{ flex:1, minWidth:0 }}>
              <span style={{ display:"block", fontFamily:UI, fontSize:13, fontWeight:500, color:"var(--fg)" }}>{t.title}</span>
              <span style={{ display:"block", fontFamily:UI, fontSize:11.5, color:"rgba(238,245,248,.5)", marginTop:2 }}>{t.note}</span>
            </span>
            <span style={{ fontFamily:UI, fontSize:9, letterSpacing:"1.4px", textTransform:"uppercase", color:"rgba(255,255,255,.4)", flexShrink:0 }}>{t.range}</span>
          </div>)}
        </React.Fragment>; })()}
    </div>
    <Button variant="default" style={{ width:"100%" }}><span style={{ display:"inline-flex", alignItems:"center", gap:8 }}><NavGlyph d={G.star} s={15} w={2}/>Impuls für heute</span></Button>
    <p style={{ fontFamily:UI, fontSize:11.5, color:"rgba(255,255,255,.38)", textAlign:"center", margin:"-8px 0 0" }}>Eine Frage an dein Chart — jeden Tag eine.</p>
  </PhoneShell>;
}

/* ══ 3 · SYNASTRIE — „Du & Jonas" ══ */
function Sphären({ a = "L", b = "J" }) {
  const disc = (col, rgb) => ({ position:"absolute", top:8, width:168, height:168, borderRadius:"50%", background:`radial-gradient(circle at 50% 42%, rgba(${rgb},.34) 0%, rgba(${rgb},.10) 52%, transparent 72%)`, boxShadow:`inset 0 0 0 1px rgba(${rgb},.35)` });
  return <div style={{ position:"relative", height:190, margin:"0 auto", width:280 }}>
    <div aria-hidden="true" style={{ ...disc("iris","167,139,250"), left:0 }}></div>
    <div aria-hidden="true" style={{ ...disc("mystic","32,240,208"), right:0, mixBlendMode:"plus-lighter" }}></div>
    <span aria-hidden="true" style={{ position:"absolute", left:"50%", top:92, transform:"translate(-50%,-50%)", width:44, height:44, borderRadius:"50%", background:"radial-gradient(circle, rgba(248,247,242,.30), transparent 70%)", mixBlendMode:"plus-lighter" }}></span>
    <span style={{ position:"absolute", left:62, top:92, transform:"translate(-50%,-50%)", fontFamily:"var(--f-display)", fontSize:26, color:"rgba(238,235,255,.9)" }}>{a}</span>
    <span style={{ position:"absolute", right:36, top:92, transform:"translate(-50%,-50%)", fontFamily:"var(--f-display)", fontSize:26, color:"rgba(225,255,248,.9)" }}>{b}</span>
  </div>;
}
function SynastrieScreen() {
  const [sel, setSel] = React.useState(0);
  const person = V.PERSONS[sel];
  return <PhoneShell tab="synastrie" minH={1010} bg={<V.DuoGlow/>}>
    <div>
      <Eyebrow ls="2px">Synastrie</Eyebrow>
      <div style={{ display:"flex", gap:7, marginTop:10, flexWrap:"wrap" }}>
        {V.PERSONS.map((p, i) => <Chip key={p.name} selected={sel===i} onClick={() => setSel(i)}>{p.name}</Chip>)}
        <Chip><span style={{ display:"inline-flex", alignItems:"center", gap:5 }}><NavGlyph d={G.plus} s={12} w={2}/>Neu</span></Chip>
      </div>
    </div>
    <div style={{ textAlign:"center" }}>
      <h1 style={{ ...DISPLAY, fontSize:25, letterSpacing:".08em", margin:"2px 0 0" }}>Du & {person.name}</h1>
      <Sphären b={person.initials}/>
      <div style={{ display:"flex", justifyContent:"center", gap:7, flexWrap:"wrap", marginTop:-4 }}>
        {person.trio.map(([w, z]) => <span key={w} style={{ display:"inline-flex", alignItems:"center", gap:6, fontFamily:UI, fontSize:11.5, color:"rgba(238,245,248,.7)", background:"rgba(248,247,242,.04)", boxShadow:"inset 0 0 0 1px rgba(255,255,255,.11)", borderRadius:999, padding:"6px 11px" }}><Icon name={V.SIGN_ICON[z]} size={11}/>{w} {z}</span>)}
      </div>
    </div>
    {person.aspekte.length ? <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", padding:"0 2px" }}>
        <Eyebrow ls="1.8px" color="rgba(255,255,255,.55)">Zwischen euren Charts</Eyebrow>
        <span style={{ fontFamily:UI, fontSize:11, color:"rgba(255,255,255,.35)" }}>3 von 11</span>
      </div>
      {person.aspekte.map((a, i) => <div key={a.t} className="glass-surface" style={{ borderRadius:14, padding:"13px 15px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <AspectBadge a={a.g[0]} b={a.g[1]} tone={a.tone} size={26}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:UI, fontSize:13.5, fontWeight:500, color:"var(--fg)" }}>{a.t}</div>
            <div style={{ fontFamily:UI, fontSize:9.5, letterSpacing:"1.6px", textTransform:"uppercase", color:"rgba(187,168,255,.7)", marginTop:3 }}>{a.m}</div>
          </div>
        </div>
        <p style={{ fontFamily:UI, fontSize:12.5, lineHeight:1.55, color:"rgba(238,245,248,.62)", margin:"9px 0 0" }}>{a.b}</p>
      </div>)}
    </div> : <Alert tone="neutral" title="Noch kein Vergleich">Leg Geburtsdatum und -ort an — dann liest VELA zwischen euren Charts.</Alert>}
    <Button variant="default" style={{ width:"100%" }}><span style={{ display:"inline-flex", alignItems:"center", gap:8 }}><Icon name="IconChat" size={15}/>Mehr über euch fragen</span></Button>
  </PhoneShell>;
}

/* ══ 4 · LERNEN — Glossar mit „Bei dir" ══ */
function LernenScreen() {
  const [open, setOpen] = React.useState("Aspekte");
  const groups = [
    { n:"Planeten", c:"10 Einträge", icon:"Planets2Property1Sun", tone:"167,139,250", rows:V.PLANETS.slice(0,4).map(p => [p.name, p.rolle]) },
    { n:"Tierkreiszeichen", c:"12 Einträge", icon:"ZodiacProperty1Leo", tone:"255,172,137", rows:[["Widder","Anfang & Mut"],["Stier","Beständigkeit"],["Zwillinge","Austausch"],["…","alle 12"]] },
    { n:"Häuser", c:"12 Einträge", icon:"Planets2Property1MC", tone:"85,153,255", rows:V.HOUSES.slice(0,4).map(([l], i) => [`${i+1}. Haus`, l]) },
    { n:"Aspekte", c:"5 Einträge", icon:"Planets2Property1Mercurius", tone:"32,240,208", rows:Object.values(V.ASPECT_TYPES).map(t => [`${t.sym} ${t.name}`, t.meta]) },
    { n:"Mondknoten", c:"2 Einträge", icon:"Planets2Property1NounSouth3188634", tone:"218,143,255", rows:[["☊ Nordknoten","wohin du wächst"],["☋ Südknoten","was du längst kannst"]] },
  ];
  return <PhoneShell tab="lernen" minH={1010}>
    <div>
      <Eyebrow ls="2px">Lernen</Eyebrow>
      <h1 style={{ ...DISPLAY, fontSize:23, letterSpacing:".05em", margin:"8px 0 0" }}>Das Vokabular</h1>
      <p style={{ fontFamily:UI, fontSize:12.5, lineHeight:1.55, color:"rgba(238,245,248,.55)", margin:"8px 0 0" }}>Jeder Eintrag öffnet dasselbe Erklär-Sheet wie im Chart — immer mit „Bei dir".</p>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
      {groups.map(g => { const on = open === g.n;
        return <div key={g.n} className="glass-surface" style={{ borderRadius:16, padding:on?"14px 16px 8px":"13px 16px", background:on?"linear-gradient(180deg,#1B1926 0%,#151420 100%)":undefined, boxShadow:on?"inset 0 0 0 1px rgba(167,139,250,.3)":undefined }}>
          <button onClick={() => setOpen(on?null:g.n)} style={{ display:"flex", alignItems:"center", gap:12, width:"100%", background:"none", border:"none", padding:0, cursor:"pointer", textAlign:"left" }}>
            <span style={{ width:32, height:32, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"50%", background:`rgba(${g.tone},${on?.18:.10})`, boxShadow:`inset 0 0 0 1px rgba(${g.tone},${on?.55:.32})`, color:on?"#fff":`rgba(${g.tone},.95)` }}><Icon name={g.icon} size={14}/></span>
            <span style={{ flex:1 }}>
              <span style={{ display:"block", fontFamily:UI, fontSize:14, fontWeight:500, color:"var(--fg)" }}>{g.n}</span>
              <span style={{ display:"block", fontFamily:UI, fontSize:9.5, letterSpacing:"1.6px", textTransform:"uppercase", color:"rgba(255,255,255,.38)", marginTop:2 }}>{g.c}</span>
            </span>
            <span style={{ color:"rgba(255,255,255,.4)", transform:on?"rotate(180deg)":"none", transition:"transform .25s" }}><NavGlyph d={G.chevD} s={16}/></span>
          </button>
          {on && <div style={{ marginTop:10, borderTop:"1px solid rgba(255,255,255,.07)" }}>
            {g.rows.map(([t, m]) => <button key={t} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"11px 2px", background:"none", border:"none", borderBottom:"1px solid rgba(255,255,255,.05)", cursor:"pointer", textAlign:"left" }}>
              <span style={{ flex:1, fontFamily:UI, fontSize:13, color:"rgba(238,245,248,.85)" }}>{t}</span>
              <span style={{ fontFamily:UI, fontSize:11, color:"rgba(255,255,255,.4)" }}>{m}</span>
              <span style={{ color:"rgba(255,255,255,.3)" }}><NavGlyph d={G.chevR} s={12}/></span>
            </button>)}
          </div>}
        </div>; })}
    </div>
  </PhoneShell>;
}

/* ══ 5 · PROFIL — Orb, Geburtsdaten, Einstellungen ══ */
function ProfilScreen() {
  const [remind, setRemind] = React.useState(true);
  return <PhoneShell tab="profil" aurora minH={1010}>
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, marginTop:8, textAlign:"center" }}>
      <Orb size={104} pulse/>
      <h1 style={{ ...DISPLAY, fontSize:25, letterSpacing:".1em", margin:"4px 0 0" }}>{V.PROFILE.name}</h1>
      <span style={{ fontFamily:UI, fontSize:11, letterSpacing:"2px", textTransform:"uppercase", color:"rgba(255,255,255,.5)" }}>{V.PROFILE.trio}</span>
      <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontFamily:UI, fontSize:11, color:"#20F0D0", background:"rgba(32,240,208,.07)", boxShadow:"inset 0 0 0 1px rgba(32,240,208,.3)", borderRadius:999, padding:"5px 11px" }}><span style={{ width:5, height:5, borderRadius:"50%", background:"#20F0D0", boxShadow:"0 0 6px rgba(32,240,208,.8)" }}></span>Verbunden</span>
    </div>
    <div className="glass-surface" style={{ borderRadius:16, padding:"14px 16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <Eyebrow ls="1.8px">Geburtsdaten</Eyebrow>
        <button aria-label="Bearbeiten" style={{ background:"none", border:"none", color:"rgba(255,255,255,.45)", cursor:"pointer", padding:4 }}><NavGlyph d={G.edit} s={14}/></button>
      </div>
      {[["Datum", V.PROFILE.datum],["Zeit", V.PROFILE.zeit + " Uhr"],["Ort", V.PROFILE.ort]].map(([k, v]) => <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderTop:"1px solid rgba(255,255,255,.06)", fontFamily:UI, fontSize:13 }}>
        <span style={{ color:"rgba(255,255,255,.45)" }}>{k}</span><span style={{ color:"var(--fg)" }}>{v}</span>
      </div>)}
      <p style={{ fontFamily:UI, fontSize:10.5, color:"rgba(255,255,255,.35)", margin:"8px 0 0" }}>Nur für deine Deutungen gespeichert. Jederzeit löschbar.</p>
    </div>
    <div className="glass-surface" style={{ borderRadius:16, padding:"6px 16px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <span style={{ color:"rgba(255,255,255,.55)" }}><NavGlyph d={G.bell} s={17}/></span>
        <span style={{ flex:1 }}>
          <span style={{ display:"block", fontFamily:UI, fontSize:13, color:"var(--fg)" }}>Tägliche Erinnerung</span>
          <span style={{ display:"block", fontFamily:UI, fontSize:11, color:"rgba(255,255,255,.4)", marginTop:2 }}>Zur Dämmerung · heute 21:26</span>
        </span>
        <Switch checked={remind} onChange={setRemind} aria-label="Tägliche Erinnerung"/>
      </div>
      <button style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"13px 0", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
        <span style={{ color:"rgba(255,255,255,.55)" }}><NavGlyph d={G.globe} s={17}/></span>
        <span style={{ flex:1, fontFamily:UI, fontSize:13, color:"var(--fg)" }}>Sprache</span>
        <span style={{ fontFamily:UI, fontSize:12, color:"rgba(255,255,255,.45)" }}>Deutsch</span>
        <span style={{ color:"rgba(255,255,255,.3)" }}><NavGlyph d={G.chevR} s={13}/></span>
      </button>
    </div>
    <button className="glass-surface" data-interactive="true" style={{ borderRadius:16, padding:"14px 16px", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
      <span style={{ width:34, height:34, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"50%", background:"rgba(167,139,250,.12)", boxShadow:"inset 0 0 0 1px rgba(167,139,250,.35)", color:"#BBA8FF" }}><NavGlyph d={G.star} s={15}/></span>
      <span style={{ flex:1 }}>
        <span style={{ display:"block", fontFamily:UI, fontSize:13.5, fontWeight:500, color:"var(--fg)" }}>Sternenjournal</span>
        <span style={{ display:"block", fontFamily:UI, fontSize:11, color:"rgba(255,255,255,.4)", marginTop:2 }}>7 gemerkte Einsichten</span>
      </span>
      <span style={{ color:"rgba(255,255,255,.35)" }}><NavGlyph d={G.chevR} s={14}/></span>
    </button>
  </PhoneShell>;
}

/* ══ KI-Sheet — Antwort mit Frage als Zitat, Orb pulsiert, Planet leuchtet ══ */
function KIFrame() {
  return <PhoneShell tab="chart" height={852} pad="4px 20px 20px" bg={<V.Horizon tone="azure" h={420}/>}>
    <div style={{ opacity:.35, pointerEvents:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
      <div style={{ alignSelf:"stretch" }}>
        <Eyebrow ls="2px">Geburts-Chart</Eyebrow>
        <h1 style={{ ...DISPLAY, fontSize:27, letterSpacing:".06em", margin:"6px 0 0" }}>{V.PROFILE.name}</h1>
      </div>
      <BirthWheel size={300} sel="ac" interactive={false}/>
    </div>
    <div className="vela-fadeup" style={{ position:"absolute", left:0, right:0, bottom:0, zIndex:10, background:"linear-gradient(180deg, rgba(30,28,44,.82) 0%, rgba(16,15,24,.94) 100%)", backdropFilter:"blur(24px) saturate(1.2)", WebkitBackdropFilter:"blur(24px) saturate(1.2)", boxShadow:"var(--shadow-sheet), inset 0 1px 0 rgba(255,255,255,.14), inset 0 0 0 1px rgba(255,255,255,.08)", borderRadius:"28px 28px 0 0", padding:"12px 22px 24px" }}>
      <div style={{ width:36, height:4, borderRadius:2, background:"rgba(255,255,255,.14)", margin:"0 auto 16px" }}></div>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:14 }}>
        <Orb size={38} pulse/>
        <blockquote style={{ margin:0, flex:1, borderLeft:"2px solid rgba(167,139,250,.45)", paddingLeft:12 }}>
          <span style={{ fontFamily:UI, fontSize:9.5, letterSpacing:"1.8px", textTransform:"uppercase", color:"rgba(187,168,255,.7)" }}>Deine Frage</span>
          <p style={{ fontFamily:UI, fontSize:14.5, fontWeight:500, color:"var(--fg)", margin:"4px 0 0", lineHeight:1.4 }}>„Wie wirke ich auf andere?"</p>
        </blockquote>
      </div>
      <p style={{ fontFamily:UI, fontSize:13.5, lineHeight:1.65, color:"rgba(238,245,248,.78)", margin:0 }}>Ruhiger, als du denkst — und deutlicher. Dein <span style={{ color:"#BBA8FF", borderBottom:"1px solid rgba(187,168,255,.4)" }}>Aszendent im Löwen</span> steht im Raum, bevor du etwas sagst: Menschen lesen Wärme und Sicherheit. Was sie nicht sehen: die Fische-Sonne dahinter, die erst prüft, wie tief das Wasser ist<span className="vela-caret"></span></p>
      <div style={{ display:"flex", alignItems:"center", gap:8, margin:"12px 0 14px" }}>
        <span style={{ width:5, height:5, borderRadius:"50%", background:"#5599FF", boxShadow:"0 0 7px rgba(85,153,255,.8)" }}></span>
        <span style={{ fontFamily:UI, fontSize:10, letterSpacing:"1.8px", textTransform:"uppercase", color:"rgba(255,255,255,.4)" }}>Antwortet ruhig · Aszendent leuchtet im Rad</span>
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {["Und im Konflikt?","Was sehen andere zuerst?","Warum wirke ich distanziert?"].map(q => <button key={q} style={{ fontFamily:UI, fontSize:11.5, color:"rgba(238,245,248,.7)", background:"rgba(248,247,242,.04)", border:"none", boxShadow:"inset 0 0 0 1px rgba(255,255,255,.12)", borderRadius:999, padding:"7px 12px", cursor:"pointer" }}>{q}</button>)}
      </div>
    </div>
  </PhoneShell>;
}

/* ══ Signature-Momente ══ */
function OnboardingFrame() {
  return <PhoneShell height={852} pad="4px 20px 30px" bg={<V.Horizon tone="iris" h={380}/>}>
    <div style={{ textAlign:"center", marginTop:6 }}>
      <Eyebrow ls="2.4px">Onboarding · Der Moment</Eyebrow>
    </div>
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:26 }}>
      <div className="vela-skyturn" style={{ width:300, height:300 }}>
        <BirthWheel size={300} interactive={false} houses={false}/>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:UI, fontSize:10.5, letterSpacing:"2.4px", textTransform:"uppercase", color:"rgba(187,168,255,.75)" }}>Der Himmel dreht zurück · 1992</div>
        <p style={{ ...DISPLAY, fontSize:21, letterSpacing:".07em", lineHeight:1.45, margin:"14px 12px 0" }}>So stand der Himmel,<br/>als du deinen ersten<br/><span className="highlight" style={{ letterSpacing:"-.02em", textTransform:"none" }}>Atemzug</span> nahmst.</p>
        <p style={{ fontFamily:UI, fontSize:12.5, color:"rgba(238,245,248,.5)", margin:"14px 0 0" }}>{V.PROFILE.datum} · {V.PROFILE.zeit} · {V.PROFILE.ort}</p>
      </div>
    </div>
    <Button variant="default" style={{ width:"100%" }}>Mein Chart öffnen</Button>
  </PhoneShell>;
}
function AbendFrame() {
  const [v, setV] = React.useState(72);
  return <PhoneShell height={852} pad="4px 20px 30px" bg={<V.Horizon tone="mystic" h={260}/>}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
      <Eyebrow ls="2px">Abend-Ritual</Eyebrow>
      <Eyebrow ls="1.5px" color="rgba(255,255,255,.38)">21:40 · Dämmerung war 21:26</Eyebrow>
    </div>
    <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", gap:26 }}>
      <div>
        <h1 style={{ ...DISPLAY, fontSize:24, letterSpacing:".05em", lineHeight:1.35, margin:0 }}>Hat sich der Tag<br/>so angefühlt?</h1>
        <div className="glass-surface" style={{ borderRadius:14, padding:"12px 14px", marginTop:18 }}>
          <Eyebrow ls="1.6px" size={9.5}>Heute Morgen hieß es</Eyebrow>
          <p style={{ fontFamily:UI, fontSize:13, lineHeight:1.55, color:"rgba(238,245,248,.72)", margin:"6px 0 0" }}>„Gefühle werden sagbar. Sag eins davon laut — das reicht."</p>
        </div>
      </div>
      <div>
        <input className="vela-scrub vela-scrub-mystic" type="range" min="0" max="100" value={v} onChange={e => setV(+e.target.value)} aria-label="Hat sich der Tag so angefühlt?"/>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontFamily:UI, fontSize:10.5, letterSpacing:"1.4px", textTransform:"uppercase", color:"rgba(255,255,255,.4)" }}><span>Gar nicht</span><span>Genau so</span></div>
      </div>
      <p style={{ fontFamily:UI, fontSize:11.5, color:"rgba(255,255,255,.38)", textAlign:"center", margin:0 }}>Eine Geste, kein Formular. Aus deinen Abenden wächst dein Resonanz-Journal.</p>
    </div>
    <div style={{ display:"flex", gap:10 }}>
      <Button variant="ghost" style={{ flex:1 }}>Später</Button>
      <Button variant="default" style={{ flex:2 }}>Festhalten</Button>
    </div>
  </PhoneShell>;
}
function JournalFrame() {
  const stars = [[70,64],[128,38],[196,58],[252,96],[214,158],[142,146],[96,196]];
  const lines = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[5,6]];
  return <PhoneShell tab="profil" minH={852}>
    <div>
      <Eyebrow ls="2px">Sternenjournal</Eyebrow>
      <h1 style={{ ...DISPLAY, fontSize:23, letterSpacing:".05em", margin:"8px 0 0" }}>Deine Konstellation</h1>
      <p style={{ fontFamily:UI, fontSize:12.5, lineHeight:1.55, color:"rgba(238,245,248,.55)", margin:"8px 0 0" }}>Jede gemerkte Einsicht wird ein Stern. Aus Sternen wird — langsam — dein eigenes Bild.</p>
    </div>
    <div style={{ position:"relative", height:230 }}>
      <svg width="353" height="230" style={{ display:"block" }} aria-label="Konstellation aus 7 Einsichten">
        {lines.map(([a, b], i) => <line key={i} x1={stars[a][0]} y1={stars[a][1]} x2={stars[b][0]} y2={stars[b][1]} stroke="rgba(167,139,250,.35)" strokeWidth="1"/>)}
        {stars.map(([x, y], i) => <g key={i}>
          {i === 6 && <circle cx={x} cy={y} r="9" fill="rgba(187,168,255,.16)"/>}
          <circle cx={x} cy={y} r={i === 6 ? 3.4 : 2.4} fill="#F8F7F2" style={{ filter:`drop-shadow(0 0 ${i===6?8:4}px rgba(187,168,255,${i===6?.95:.6}))` }}/>
        </g>)}
        <text x={stars[6][0]+14} y={stars[6][1]+4} fontFamily="Bricolage Grotesque" fontSize="10" fill="rgba(187,168,255,.85)">neu · heute</text>
      </svg>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
      {[["Mars im 4. Haus","Dein Motor startet zu Hause.","12. Juli"],["Sonne ☍ Mond","Kopf und Gefühl — beide haben recht.","heute"]].map(([t, b, d]) => <div key={t} className="glass-surface" style={{ borderRadius:14, padding:"12px 15px", display:"flex", alignItems:"baseline", gap:10 }}>
        <span style={{ color:"#BBA8FF", fontSize:12 }}>✶</span>
        <span style={{ flex:1 }}>
          <span style={{ display:"block", fontFamily:UI, fontSize:13, fontWeight:500, color:"var(--fg)" }}>{t}</span>
          <span style={{ display:"block", fontFamily:UI, fontSize:12, color:"rgba(238,245,248,.55)", marginTop:3 }}>{b}</span>
        </span>
        <span style={{ fontFamily:UI, fontSize:10, letterSpacing:"1px", textTransform:"uppercase", color:"rgba(255,255,255,.35)" }}>{d}</span>
      </div>)}
    </div>
  </PhoneShell>;
}
function ShareRow() {
  const card = { width:200, borderRadius:18, overflow:"hidden", position:"relative", background:"var(--color-void)", boxShadow:"0 0 0 1px rgba(255,255,255,.10), 0 20px 44px rgba(0,0,0,.4)", padding:"18px 16px 16px", display:"flex", flexDirection:"column", alignItems:"center", gap:10 };
  return <div className="loum" style={{ width:700, borderRadius:24, background:"#121118", padding:"26px 28px 24px", boxShadow:"inset 0 0 0 1px rgba(255,255,255,.07)", position:"relative", overflow:"hidden" }}>
    <div className="loum-starfield"></div>
    <div style={{ position:"relative", zIndex:1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:18 }}>
        <Eyebrow ls="2px">Teilbare Karten</Eyebrow>
        <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontFamily:UI, fontSize:11, color:"rgba(255,255,255,.45)" }}><NavGlyph d={G.share} s={13}/>Als Bild teilen</span>
      </div>
      <div style={{ display:"flex", gap:16 }}>
        <div style={card}>
          <div aria-hidden="true" style={{ position:"absolute", inset:0, background:"radial-gradient(120% 80% at 50% -10%, rgba(167,139,250,.18), transparent 62%)" }}></div>
          <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <BirthWheel size={140} interactive={false} houses={false}/>
            <span style={{ ...DISPLAY, fontSize:14, letterSpacing:".18em" }}>{V.PROFILE.name}</span>
            <span style={{ fontFamily:UI, fontSize:8.5, letterSpacing:"1.6px", textTransform:"uppercase", color:"rgba(255,255,255,.5)" }}>{V.PROFILE.trio}</span>
            <span style={{ fontFamily:UI, fontSize:8, letterSpacing:"1.4px", textTransform:"uppercase", color:"rgba(255,255,255,.32)" }}>Geburtsrad · Poster</span>
          </div>
        </div>
        <div style={card}>
          <div aria-hidden="true" style={{ position:"absolute", inset:0, background:"radial-gradient(120% 80% at 50% -10%, rgba(167,139,250,.18), transparent 62%)" }}></div>
          <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:10, alignSelf:"stretch", flex:1 }}>
            <span style={{ fontFamily:UI, fontSize:8.5, letterSpacing:"1.6px", textTransform:"uppercase", color:"rgba(187,168,255,.8)" }}>Heute · 22. Juli</span>
            <span style={{ display:"inline-flex", alignItems:"center", gap:6, color:"rgba(248,247,242,.9)" }}><Icon name="Planets2Property1Saturn" size={13}/><span style={{ fontSize:11 }}>△</span><Icon name="Planets2Property1Sun" size={13}/></span>
            <span style={{ ...DISPLAY, fontSize:13.5, letterSpacing:".06em", lineHeight:1.4 }}>Die beständige Arbeit wird leise gesehen.</span>
            <span style={{ marginTop:"auto", fontFamily:UI, fontSize:8, letterSpacing:"1.4px", textTransform:"uppercase", color:"rgba(255,255,255,.32)" }}>Tages-Transitkarte</span>
          </div>
        </div>
        <div style={card}>
          <div aria-hidden="true" style={{ position:"absolute", inset:0, background:"radial-gradient(120% 80% at 50% -10%, rgba(167,139,250,.18), transparent 62%)" }}></div>
          <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, alignSelf:"stretch", flex:1 }}>
            <div style={{ transform:"scale(.62)", transformOrigin:"top center", margin:"-6px 0 -66px" }}><Sphären/></div>
            <span style={{ ...DISPLAY, fontSize:13, letterSpacing:".12em" }}>Laura & Jonas</span>
            <span style={{ fontFamily:UI, fontSize:9, color:"rgba(238,245,248,.6)", textAlign:"center", lineHeight:1.5 }}>Mond △ Venus — schneller verstanden als erklärt.</span>
            <span style={{ marginTop:"auto", fontFamily:UI, fontSize:8, letterSpacing:"1.4px", textTransform:"uppercase", color:"rgba(255,255,255,.32)" }}>Duett-Karte</span>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

/* ══ Komponenten-Bibliothek ══ */
function SpecCard({ title, caption, children, wide }) {
  return <div className="glass-surface" style={{ gridColumn:wide?"span 2":undefined, borderRadius:20, padding:"18px 18px 20px", display:"flex", flexDirection:"column", gap:12 }}>
    <span className="eyebrow" style={{ fontSize:10.5 }}>{title}</span>
    <div style={{ display:"flex", flexWrap:"wrap", gap:12, alignItems:"center" }}>{children}</div>
    {caption && <p style={{ fontFamily:UI, fontSize:12, color:"rgba(238,245,248,.45)", margin:0, lineHeight:1.4 }}>{caption}</p>}
  </div>;
}
function SpecGroup({ label, children }) {
  return <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
    <Text as="meta" style={{ color:"var(--fg-soft)" }}>{label}</Text>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))", gap:14, alignItems:"start" }}>{children}</div>
  </div>;
}
function PunktSpec({ state, label }) {
  const on = state === "gewählt";
  return <span style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
    <span style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"50%", background:on?"rgba(167,139,250,.20)":"rgba(17,16,25,.55)", boxShadow:on?"inset 0 0 0 1.5px rgba(187,168,255,.85), 0 0 14px rgba(167,139,250,.55)":"inset 0 0 0 1px rgba(255,255,255,.16)", color:on?"#EDE6FF":"rgba(248,247,242,.85)", opacity:state==="gedimmt"?.25:1 }}><Icon name="Planets2Property1Sun" size={14}/></span>
    <span style={{ fontFamily:UI, fontSize:10, color:"rgba(255,255,255,.45)" }}>{label}</span>
  </span>;
}
function ComponentLibrary() {
  const [demoSel, setDemoSel] = React.useState("sonne");
  const [scrub, setScrub] = React.useState(3);
  const lineSpec = (t) => { const T = V.ASPECT_TYPES[t]; const rgb = T.tone === "mystic" ? "32,240,208" : "255,172,137";
    return <span key={t} style={{ display:"flex", alignItems:"center", gap:8 }}><svg width="44" height="8"><line x1="1" y1="4" x2="43" y2="4" stroke={`rgba(${rgb},.8)`} strokeWidth={t==="opp"||t==="sq"?1.8:1.3} strokeDasharray={t==="sex"?"3 3":undefined}/></svg><span style={{ fontFamily:UI, fontSize:11, color:"rgba(238,245,248,.65)" }}>{T.sym} {T.name}</span></span>; };
  return <div className="loum" style={{ width:1160, position:"relative", overflow:"hidden", background:"var(--color-void)", borderRadius:24, padding:"38px 36px 42px", boxShadow:"0 60px 100px -45px rgba(0,0,0,.55), inset 0 0 0 1px var(--card-hairline)" }}>
    <div className="loum-starfield"></div>
    <V.AuroraWash/>
    <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:32 }}>
      <div>
        <Text as="meta">Komponenten-Bibliothek</Text>
        <Text as="h3" style={{ marginTop:8, fontSize:22 }}>Die Bausteine von VELA</Text>
      </div>
      <SpecGroup label="Das Rad">
        <SpecCard title="Geburtsrad · interaktiv" caption="Tierkreis · Häuser 1–12 · Planeten · Aspektlinien — Auswahl hebt Relevantes, dimmt den Rest" wide>
          <div style={{ display:"flex", gap:20, alignItems:"center" }}>
            <BirthWheel size={230} sel={demoSel} onSel={setDemoSel}/>
            <span style={{ fontFamily:UI, fontSize:12, color:"rgba(238,245,248,.55)", maxWidth:150, lineHeight:1.5 }}>{(() => { const p = V.byKey(demoSel); return p ? `${p.name} in ${p.sign} · ${p.haus}. Haus` : "Punkt antippen"; })()}</span>
          </div>
        </SpecCard>
        <SpecCard title="Planeten-Punkt" caption="ruhig · gewählt · gedimmt">
          <PunktSpec state="ruhig" label="ruhig"/><PunktSpec state="gewählt" label="gewählt"/><PunktSpec state="gedimmt" label="gedimmt"/>
        </SpecCard>
        <SpecCard title="Aspektlinien" caption="Fluss in Mystic, Spannung in Solar">
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>{["tri","sex","opp","sq"].map(lineSpec)}</div>
        </SpecCard>
        <SpecCard title="Mini-Rad" caption="im Sheet: nur die betroffenen Punkte">
          <MiniWheel focus={["sonne","mond"]} aspect="opp"/><MiniWheel focus={["venus"]}/>
        </SpecCard>
      </SpecGroup>
      <SpecGroup label="Sheets & Ebenen">
        <SpecCard title="Zwei Ebenen" caption="jede Erklärung: allgemein + persönlich" wide>
          <div style={{ width:"100%" }}><TwoLevel was="Der Mond ist dein Innenleben — wie du fühlst, wenn niemand zusieht." dir="In Jungfrau sortiert dein Inneres Gefühle wie Werkzeug: benennen, prüfen, ablegen."/></div>
        </SpecCard>
        <SpecCard title="Verwandte Elemente" caption="Links weiter ins Netz — der Sheet-Stapel wächst">
          <RelatedChips items={[{ label:"☍ Mond", icon:<Icon name="Planets2Property1Moon" size={12}/> },{ label:"8. Haus" }]}/>
        </SpecCard>
        <SpecCard title="Stapel-Kopf" caption="Zurück durch den Stapel · Schließen">
          <div style={{ display:"flex", alignItems:"center", gap:10, width:"100%", background:"rgba(248,247,242,.03)", borderRadius:12, padding:"10px 12px", boxShadow:"inset 0 0 0 1px rgba(255,255,255,.08)" }}>
            <NavGlyph d={G.arrowL} s={16}/>
            <span style={{ flex:1 }}><span style={{ display:"block", fontFamily:UI, fontSize:9, letterSpacing:"1.6px", textTransform:"uppercase", color:"rgba(187,168,255,.75)" }}>Opposition · Spannung</span><span style={{ ...DISPLAY, fontSize:14, letterSpacing:".05em" }}>Sonne ☍ Mond</span></span>
            <NavGlyph d={G.x} s={14}/>
          </div>
        </SpecCard>
      </SpecGroup>
      <SpecGroup label="KI-Begleiter">
        <SpecCard title="Frage-Eingabe" caption="unten fixiert im Chart-Tab · Beispiel-Chips" wide>
          <div style={{ width:"100%" }}><AskBar fixed={false}/></div>
        </SpecCard>
        <SpecCard title="Frage als Zitat" caption="jede Antwort beginnt mit der Frage">
          <blockquote style={{ margin:0, borderLeft:"2px solid rgba(167,139,250,.45)", paddingLeft:12 }}>
            <span style={{ fontFamily:UI, fontSize:9.5, letterSpacing:"1.8px", textTransform:"uppercase", color:"rgba(187,168,255,.7)" }}>Deine Frage</span>
            <p style={{ fontFamily:UI, fontSize:13.5, fontWeight:500, color:"var(--fg)", margin:"4px 0 0" }}>„Wie wirke ich auf andere?"</p>
          </blockquote>
        </SpecCard>
        <SpecCard title="Avatar-Orb" caption="ruhig · antwortet (pulsiert)">
          <Orb size={54}/><Orb size={54} pulse/>
        </SpecCard>
      </SpecGroup>
      <SpecGroup label="Bausteine">
        <SpecCard title="Überblick-Kachel" caption="Sonne, Mond, AC, Element, Modus, Transit">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, width:"100%" }}>
            <Kachel icon="Planets2Property1Sun" label="Sonne" value="Fische" sub="8. Haus"/>
            <Kachel icon="Planets2Property1Moon" label="Mond" value="Jungfrau" sub="2. Haus" lit/>
          </div>
        </SpecCard>
        <SpecCard title="Transit-Karte" caption="Klartext statt Warnung" wide>
          <div style={{ width:"100%" }}><ActiveTransitCard glyphs={<React.Fragment><Icon name="Planets2Property1Saturn" size={14}/><span style={{ fontSize:12 }}>△</span><Icon name="Planets2Property1Sun" size={14}/></React.Fragment>} title="Saturn Trigon deine Sonne" range="12. Jul – 3. Aug" note="Die beständige Arbeit wird leise gesehen."/></div>
        </SpecCard>
        <SpecCard title="Zeit-Regler" caption="scrubben — Planeten wandern" wide>
          <div style={{ width:"100%" }}><TimeScrubber value={scrub} onChange={setScrub}/></div>
        </SpecCard>
        <SpecCard title="Personen-Chip" caption="Synastrie: wechseln · hinzufügen">
          <Chip selected>Jonas</Chip><Chip>Mara</Chip><Chip><span style={{ display:"inline-flex", alignItems:"center", gap:5 }}><NavGlyph d={G.plus} s={12} w={2}/>Neu</span></Chip>
        </SpecCard>
        <SpecCard title="Abend-Regler" caption="eine Geste, kein Formular">
          <div style={{ width:"100%" }}>
            <input className="vela-scrub vela-scrub-mystic" type="range" min="0" max="100" defaultValue="70" aria-label="Resonanz"/>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontFamily:UI, fontSize:9.5, letterSpacing:"1.2px", textTransform:"uppercase", color:"rgba(255,255,255,.4)" }}><span>Gar nicht</span><span>Genau so</span></div>
          </div>
        </SpecCard>
      </SpecGroup>
    </div>
  </div>;
}

/* ══ Hero-Rad (Marketing-Karte) ══ */
function HeroWheel() {
  const [sel, setSel] = React.useState("sonne");
  const p = sel ? V.byKey(sel) : null;
  return <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
    <BirthWheel size={370} sel={sel} onSel={(k) => setSel(k === sel ? null : k)}/>
    <div style={{ minHeight:20, fontFamily:UI, fontSize:12.5, color:"rgba(238,245,248,.65)", textAlign:"center" }}>
      {p ? <span><span style={{ color:"var(--fg)", fontWeight:500 }}>{p.name} in {p.sign}</span> · {p.haus}. Haus — antippen öffnet „Was ist das?" und „Bei dir"</span> : "Tipp einen Punkt an — Relevantes leuchtet, der Rest tritt zurück."}
    </div>
  </div>;
}

window.VELAScreens = { ChartHome, ChartWeiter, TransiteScreen, SynastrieScreen, LernenScreen, ProfilScreen, KIFrame, OnboardingFrame, AbendFrame, JournalFrame, ShareRow, ComponentLibrary, HeroWheel, Sphären };
