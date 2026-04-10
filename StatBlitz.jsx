import { useState, useEffect } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes glow{0%,100%{opacity:.25;transform:scale(1)}50%{opacity:.55;transform:scale(1.07)}}
  @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,229,255,.35)}50%{box-shadow:0 0 0 7px rgba(0,229,255,0)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
`;

const T = {
  bg:"#04060f", surface:"#080c1a", card:"#0c1120", cardH:"#101828",
  border:"rgba(22,32,53,.8)", borderH:"rgba(0,229,255,.35)",
  accent:"#00e5ff", accentD:"rgba(0,229,255,.1)",
  green:"#00d68f", red:"#ff3d5a", orange:"#ff6b35",
  text:"#e8ecf4", muted:"#48576e", sub:"#8899aa",
  fD:"'Bebas Neue',cursive", fB:"'DM Sans',sans-serif", fM:"'JetBrains Mono',monospace",
};

const GAMES = [
  {id:1,sport:"NBA",e:"🏀",home:"Lakers",away:"Celtics",time:"7:30 PM ET",hO:-110,aO:+105,total:224.5},
  {id:2,sport:"NBA",e:"🏀",home:"Warriors",away:"Nuggets",time:"9:00 PM ET",hO:+120,aO:-140,total:231.0},
  {id:3,sport:"NBA",e:"🏀",home:"Heat",away:"Bucks",time:"7:00 PM ET",hO:-105,aO:-115,total:219.5},
  {id:4,sport:"NFL",e:"🏈",home:"Chiefs",away:"Bills",time:"Sun 4:25 ET",hO:-160,aO:+135,total:47.5},
  {id:5,sport:"NFL",e:"🏈",home:"Eagles",away:"Cowboys",time:"Mon 8:15 ET",hO:-125,aO:+105,total:44.0},
  {id:6,sport:"MLB",e:"⚾",home:"Yankees",away:"Red Sox",time:"7:05 PM ET",hO:-145,aO:+125,total:8.5},
  {id:7,sport:"MLB",e:"⚾",home:"Dodgers",away:"Giants",time:"10:10 PM ET",hO:-170,aO:+145,total:7.5},
  {id:8,sport:"NHL",e:"🏒",home:"Bruins",away:"Maple Leafs",time:"7:00 PM ET",hO:-130,aO:+110,total:6.0},
  {id:9,sport:"NHL",e:"🏒",home:"Oilers",away:"Flames",time:"9:30 PM ET",hO:-155,aO:+130,total:6.5},
];

const PLAYERS = {
  nba:[
    {name:"LeBron James",team:"LAL",s1:"25.4",s2:"7.2",s3:"8.1",form:"hot",pick:"O25.5 PTS"},
    {name:"Jayson Tatum",team:"BOS",s1:"28.1",s2:"8.5",s3:"4.9",form:"hot",pick:"O27.5 PTS"},
    {name:"Stephen Curry",team:"GSW",s1:"26.8",s2:"4.3",s3:"6.4",form:"warm",pick:"O4.5 AST"},
    {name:"Nikola Jokic",team:"DEN",s1:"27.3",s2:"12.1",s3:"9.0",form:"hot",pick:"O11.5 REB"},
    {name:"Jimmy Butler",team:"MIA",s1:"21.4",s2:"5.9",s3:"4.8",form:"cold",pick:"FADE"},
  ],
  nfl:[
    {name:"Patrick Mahomes",team:"KC",s1:"312 YDS",s2:"2.8 TD",s3:"0.7 INT",form:"hot",pick:"O299.5 YDS"},
    {name:"Josh Allen",team:"BUF",s1:"298 YDS",s2:"2.5 TD",s3:"0.9 INT",form:"warm",pick:"O1.5 TD"},
    {name:"Jalen Hurts",team:"PHI",s1:"267 YDS",s2:"2.1 TD",s3:"0.5 INT",form:"warm",pick:"O24.5 RUSH"},
  ],
  mlb:[
    {name:"Aaron Judge",team:"NYY",s1:".291",s2:"42 HR",s3:"96 RBI",form:"hot",pick:"O0.5 HR"},
    {name:"Shohei Ohtani",team:"LAD",s1:".310",s2:"44 HR",s3:"102 RBI",form:"hot",pick:"O1.5 TB"},
  ],
  nhl:[
    {name:"Connor McDavid",team:"EDM",s1:"52 G",s2:"89 A",s3:"141 PTS",form:"hot",pick:"O1.5 PTS"},
    {name:"David Pastrnak",team:"BOS",s1:"48 G",s2:"62 A",s3:"110 PTS",form:"hot",pick:"O0.5 G"},
  ],
};

const HDR = {nba:["PTS","REB","AST"],nfl:["YDS","TD","INT"],mlb:["AVG","HR","RBI"],nhl:["G","A","PTS"]};
const SPORTS = [{id:"all",i:"🌐",l:"All"},{id:"NBA",i:"🏀",l:"NBA"},{id:"NFL",i:"🏈",l:"NFL"},{id:"MLB",i:"⚾",l:"MLB"},{id:"NHL",i:"🏒",l:"NHL"}];
const btn = (x={}) => ({border:"none",cursor:"pointer",fontFamily:T.fB,fontWeight:600,transition:"all .2s",...x});
const formC = (f) => ({hot:{bg:"rgba(0,214,143,.12)",c:T.green},warm:{bg:"rgba(255,107,53,.12)",c:T.orange},cold:{bg:"rgba(255,61,90,.12)",c:T.red}}[f]||{bg:"transparent",c:T.muted});

// ── LOGO ─────────────────────────────────────────────────────
function Logo({size=22}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:9}}>
      <div style={{width:size*1.5,height:size*1.5,background:`linear-gradient(135deg,${T.accent},#0084ff)`,
        borderRadius:size*.35,display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:size*.8,fontWeight:900,color:"#000",fontFamily:T.fD,
        boxShadow:`0 0 ${size}px rgba(0,229,255,.3)`}}>S</div>
      <span style={{fontFamily:T.fD,fontSize:size*1.3,letterSpacing:"1px",color:T.text}}>
        Stat<span style={{color:T.accent}}>Blitz</span>
      </span>
    </div>
  );
}

// ── DISCLOSURE ────────────────────────────────────────────────
function DisclBar(){
  return(
    <div style={{background:"#020508",borderBottom:"1px solid rgba(0,229,255,.05)",
      padding:"6px 20px",fontFamily:T.fM,fontSize:10,color:"#2a4a3a",textAlign:"center",flexShrink:0}}>
      ⚠ <strong style={{color:"#3a6a4a"}}>ENTERTAINMENT & INFORMATION ONLY</strong> · Not betting advice ·
      Must be <strong style={{color:"#3a6a4a"}}>21+</strong> · Problem gambling: <strong style={{color:"#3a6a4a"}}>1-800-522-4700</strong>
    </div>
  );
}

// ── LANDING ───────────────────────────────────────────────────
function Landing({onStart}){
  const [vis,setVis] = useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),60);},[]);

  const tickerItems = [
    "🏀 Lakers -110 ▲ AI PICK","🏈 Chiefs -160 ▲ STRONG","⚾ Yankees O8.5 ▲ VALUE",
    "🏒 Bruins -130 ▼ FADE","🏀 Celtics +105 ▲ AI PICK","🏈 Bills +135 ▲ VALUE",
    "⚾ Dodgers -170 ▲ STRONG","🏒 McDavid O1.5 ▲ HOT",
  ];

  return(
    <div style={{background:T.bg,color:T.text,fontFamily:T.fB,height:"100%",overflowY:"auto"}}>

      {/* NAV */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"16px 36px",background:"rgba(4,6,15,.92)",borderBottom:`1px solid ${T.border}`,
        backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:50}}>
        <Logo size={18}/>
        <div style={{display:"flex",gap:20,alignItems:"center"}}>
          {["How It Works","Sports","Pricing"].map(l=>(
            <span key={l} style={{color:T.muted,fontSize:13,cursor:"pointer"}}>{l}</span>
          ))}
          <button onClick={onStart} style={{...btn(),background:T.accent,color:"#000",
            padding:"9px 20px",borderRadius:8,fontSize:13}}>Get Started →</button>
        </div>
      </div>

      {/* HERO */}
      <div style={{position:"relative",padding:"80px 36px 60px",textAlign:"center",overflow:"hidden"}}>
        {[{l:"-5%",t:"-10%",c:"rgba(0,229,255,.1)",s:580},{r:"-5%",b:"0",c:"rgba(255,107,53,.08)",s:480}].map((o,i)=>(
          <div key={i} style={{position:"absolute",width:o.s,height:o.s,borderRadius:"50%",
            background:`radial-gradient(circle,${o.c},transparent 70%)`,filter:"blur(70px)",
            left:o.l,right:o.r,top:o.t,bottom:o.b,animation:`glow ${5+i}s ease-in-out infinite`,pointerEvents:"none"}}/>
        ))}
        <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:24,
          background:"rgba(0,229,255,.07)",border:"1px solid rgba(0,229,255,.15)",
          borderRadius:100,padding:"7px 16px",animation:"fadeUp .5s ease both"}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:T.accent,
            display:"inline-block",animation:"pulse 2s infinite"}}/>
          <span style={{fontFamily:T.fM,fontSize:11,color:T.accent,letterSpacing:.5}}>
            AI SCANNING LIVE · {GAMES.length} GAMES TODAY
          </span>
        </div>
        <h1 style={{fontFamily:T.fD,fontSize:"clamp(52px,9vw,100px)",lineHeight:.9,
          letterSpacing:"2px",animation:"fadeUp .5s .08s ease both",opacity:vis?1:0,marginBottom:0}}>
          SMARTER STATS.<br/><span style={{color:T.accent}}>FASTER PICKS.</span><br/>BIGGER WINS.
        </h1>
        <p style={{maxWidth:500,color:T.muted,fontSize:16,lineHeight:1.8,
          margin:"22px auto 34px",animation:"fadeUp .5s .16s ease both",opacity:vis?1:0}}>
          Real-time player stats, AI-driven recommendations, and bankroll management across all major sports.
          Built for the serious 21+ bettor.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",
          animation:"fadeUp .5s .24s ease both",opacity:vis?1:0}}>
          <button onClick={onStart} style={{...btn(),background:T.accent,color:"#000",
            padding:"13px 30px",borderRadius:10,fontSize:14,
            boxShadow:`0 0 24px rgba(0,229,255,.22)`}}>Start Free — No Card Needed →</button>
          <button onClick={onStart} style={{...btn(),background:"transparent",color:T.text,
            padding:"13px 24px",borderRadius:10,fontSize:14,border:`1px solid ${T.border}`}}>
            Live Demo
          </button>
        </div>
      </div>

      {/* TICKER */}
      <div style={{background:T.accent,overflow:"hidden",padding:"9px 0"}}>
        <div style={{display:"flex",animation:"ticker 22s linear infinite",whiteSpace:"nowrap"}}>
          {[...tickerItems,...tickerItems].map((t,i)=>(
            <span key={i} style={{fontFamily:T.fM,fontSize:12,fontWeight:700,color:"#000",padding:"0 28px"}}>{t}</span>
          ))}
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{display:"flex",justifyContent:"center",gap:56,flexWrap:"wrap",
        padding:"48px 36px",background:T.surface,borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`}}>
        {[["AI","Powered Stats"],["4","Major Sports"],["Hourly","Sharp Alerts"],["21+","Age Verified"]].map(([n,l])=>(
          <div key={l} style={{textAlign:"center"}}>
            <div style={{fontFamily:T.fD,fontSize:48,color:T.accent,letterSpacing:"1px",lineHeight:1}}>{n}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:5,fontFamily:T.fM,letterSpacing:1}}>{l.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <div style={{padding:"70px 36px"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{fontFamily:T.fM,fontSize:10,color:T.accent,letterSpacing:3,marginBottom:8}}>HOW IT WORKS</div>
          <h2 style={{fontFamily:T.fD,fontSize:"clamp(32px,5vw,56px)",letterSpacing:"1px",marginBottom:40}}>
            THREE STEPS TO SHARPER BETS
          </h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:2,background:T.border}}>
            {[
              {n:"01",i:"📊",t:"PICK YOUR GAME",s:"Browse today's matchups across NBA, NFL, MLB, and NHL with real-time odds."},
              {n:"02",i:"🤖",t:"GET AI ANALYSIS",s:"Our proprietary AI analyzes stats, form, line movement and surfaces high-value picks."},
              {n:"03",i:"💰",t:"BET WITH EDGE",s:"Use our Kelly Criterion calculator to size bets correctly and protect your bankroll."},
            ].map(s=>(
              <div key={s.n} style={{background:T.card,padding:"32px 28px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:-10,right:16,fontFamily:T.fD,fontSize:100,
                  color:"rgba(0,229,255,.04)",lineHeight:1,pointerEvents:"none"}}>{s.n}</div>
                <div style={{fontSize:26,marginBottom:14}}>{s.i}</div>
                <div style={{fontFamily:T.fD,fontSize:22,letterSpacing:".5px",marginBottom:10}}>{s.t}</div>
                <div style={{fontSize:13,color:T.muted,lineHeight:1.75}}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{background:T.surface,borderTop:`1px solid ${T.border}`,padding:"70px 36px"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{fontFamily:T.fM,fontSize:10,color:T.accent,letterSpacing:3,marginBottom:8}}>FEATURES</div>
          <h2 style={{fontFamily:T.fD,fontSize:"clamp(32px,5vw,56px)",letterSpacing:"1px",marginBottom:40}}>
            BUILT FOR SERIOUS BETTORS
          </h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,background:T.border}}>
            {[
              {i:"🤖",t:"AI RECOMMENDATIONS",s:"Our proprietary AI analyzes each matchup and delivers clear confident picks with confidence scores."},
              {i:"📈",t:"LIVE PLAYER STATS",s:"Up-to-date form, season averages, and hot/cold streaks for every player across all sports."},
              {i:"💼",t:"BANKROLL MANAGER",s:"Kelly Criterion calculator, bet history tracking, and P&L dashboard to keep your edge sustainable."},
              {i:"⚡",t:"HOURLY SHARP ALERTS",s:"Sharp members get SMS + email the moment a high-confidence pick is found. Every hour, not once a day."},
            ].map(f=>(
              <div key={f.t} style={{background:T.card,padding:"32px 28px",display:"flex",gap:18,
                transition:"background .2s"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.cardH}
                onMouseLeave={e=>e.currentTarget.style.background=T.card}>
                <div style={{fontSize:26,flexShrink:0}}>{f.i}</div>
                <div>
                  <div style={{fontFamily:T.fD,fontSize:20,letterSpacing:".5px",marginBottom:8}}>{f.t}</div>
                  <div style={{fontSize:13,color:T.muted,lineHeight:1.75}}>{f.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div style={{padding:"70px 36px"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{fontFamily:T.fM,fontSize:10,color:T.accent,letterSpacing:3,marginBottom:8}}>PRICING</div>
          <h2 style={{fontFamily:T.fD,fontSize:"clamp(32px,5vw,56px)",letterSpacing:"1px",marginBottom:6}}>
            NO FLUFF. JUST EDGE.
          </h2>
          <p style={{color:T.muted,fontSize:13,fontFamily:T.fM,marginBottom:40}}>Cancel anytime · No hidden fees · 21+ only</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:2,background:T.border}}>
            {[
              {name:"STARTER",price:"$0",period:"Free forever",cta:"Get Started",
                features:["3 AI picks/day","NBA & NFL only","Basic stats","Bankroll calc","21+ verified"]},
              {name:"PRO",price:"$29",period:"/month",cta:"Start Free Trial",featured:true,
                features:["Unlimited AI picks","All 4 sports","Player props","Full bankroll tracker","Line movement alerts","Email digest","21+ verified"]},
              {name:"SHARP",price:"$79",period:"/month",cta:"Go Sharp",
                features:["Everything in Pro","📱 SMS — hourly picks","📧 Email — new picks only","🎮 Private Discord","⚡ 24hr early-line picks","📊 Weekly Sharp Report","🔑 API access","21+ verified"]},
            ].map(p=>(
              <div key={p.name} style={{background:p.featured?"#0a1628":T.card,
                border:p.featured?`1px solid rgba(0,229,255,.2)`:"none",
                padding:"36px 28px",position:"relative"}}>
                {p.featured&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",
                  background:T.accent,color:"#000",fontFamily:T.fM,fontSize:9,fontWeight:700,
                  padding:"3px 12px",borderRadius:100,whiteSpace:"nowrap"}}>MOST POPULAR</div>}
                <div style={{fontFamily:T.fM,fontSize:10,color:T.muted,letterSpacing:2,marginBottom:8}}>{p.name}</div>
                <div style={{fontFamily:T.fD,fontSize:44,letterSpacing:"-1px",lineHeight:1}}>
                  {p.price}<span style={{fontSize:14,color:T.muted,fontFamily:T.fB,fontWeight:400}}>{p.period}</span>
                </div>
                <div style={{margin:"20px 0",display:"flex",flexDirection:"column",gap:9}}>
                  {p.features.map(f=>(
                    <div key={f} style={{fontSize:12,color:T.sub,display:"flex",gap:7}}>
                      <span style={{color:T.green,flexShrink:0}}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button onClick={onStart} style={{...btn(),width:"100%",padding:12,borderRadius:8,fontSize:13,
                  background:p.featured?T.accent:"transparent",color:p.featured?"#000":T.text,
                  border:p.featured?"none":`1px solid ${T.border}`}}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LEGAL */}
      <div style={{background:"#02050a",borderTop:"1px solid #0a180a",padding:"40px 36px"}}>
        <div style={{maxWidth:800,margin:"0 auto",background:"#030a03",border:"1px solid #0a180a",
          borderRadius:12,padding:"24px 28px"}}>
          <div style={{fontFamily:T.fM,fontSize:10,color:"#2a5a2a",letterSpacing:3,marginBottom:12}}>
            ⚠ LEGAL DISCLAIMER & RESPONSIBLE GAMBLING
          </div>
          <div style={{fontSize:11,color:"#1e3a1e",lineHeight:2,fontFamily:T.fM}}>
            <p style={{marginBottom:8}}><strong style={{color:"#3a6a3a"}}>FOR ENTERTAINMENT & INFORMATION ONLY.</strong> StatBlitz provides AI-generated analysis for informational purposes only. Nothing constitutes gambling advice, financial advice, or a recommendation to wager.</p>
            <p style={{marginBottom:8}}><strong style={{color:"#3a6a3a"}}>NO GUARANTEED RESULTS.</strong> Sports betting involves substantial risk. Past performance does not guarantee future results. You may lose all money wagered.</p>
            <p style={{marginBottom:8}}><strong style={{color:"#3a6a3a"}}>AGE RESTRICTION — 21+.</strong> StatBlitz is strictly for users aged 21 and older.</p>
            <p><strong style={{color:"#3a6a3a"}}>HELP.</strong> Problem gambling? <strong style={{color:"#3a6a3a"}}>1-800-522-4700</strong> · National Council on Problem Gambling · Free · Confidential · 24/7</p>
          </div>
        </div>
      </div>

      <footer style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        flexWrap:"wrap",gap:10,padding:"20px 36px",background:T.surface,borderTop:`1px solid ${T.border}`}}>
        <Logo size={14}/>
        <div style={{fontFamily:T.fM,fontSize:10,color:T.muted}}>© 2026 StatBlitz · Entertainment only · 21+ only</div>
        <div style={{fontFamily:T.fM,fontSize:10,color:"#1e3a2e"}}>1-800-522-4700</div>
      </footer>
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────
function Auth({onLogin,onBack}){
  const [tab,setTab] = useState("login");
  const [form,setForm] = useState({email:"",password:"",name:""});
  const [checks,setChecks] = useState({age:false,terms:false});
  const [err,setErr] = useState("");
  const [loading,setLoading] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const doLogin = () => {
    setErr("");
    if(!form.email||!form.password){setErr("Please fill all fields.");return;}
    setLoading(true);
    setTimeout(()=>{
      if(form.email==="demo@statblitz.com"&&form.password==="demo123") onLogin({name:"Alex",email:form.email});
      else setErr("Invalid credentials. Try demo@statblitz.com / demo123");
      setLoading(false);
    },700);
  };

  const doSignup = () => {
    setErr("");
    if(!form.name||!form.email||!form.password){setErr("Please fill all fields.");return;}
    if(form.password.length<6){setErr("Password must be 6+ characters.");return;}
    if(!checks.age){setErr("You must confirm you are 21 or older.");return;}
    if(!checks.terms){setErr("You must accept the terms.");return;}
    onLogin({name:form.name,email:form.email});
  };

  const inp = {width:"100%",background:"rgba(255,255,255,.03)",border:`1px solid ${T.border}`,
    borderRadius:8,padding:"11px 13px",color:T.text,fontFamily:T.fM,fontSize:13,outline:"none",marginTop:5};

  return(
    <div style={{height:"100%",overflowY:"auto",background:T.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",fontFamily:T.fB,padding:"32px 20px",position:"relative"}}>
      {[{top:"-10%",left:"-5%",c:"rgba(0,229,255,.07)"},{bottom:"-10%",right:"-5%",c:"rgba(0,214,143,.05)"}].map((o,i)=>(
        <div key={i} style={{position:"absolute",width:420,height:420,borderRadius:"50%",
          background:`radial-gradient(circle,${o.c},transparent 70%)`,filter:"blur(70px)",
          ...o,animation:`glow ${4+i}s ease-in-out infinite`,pointerEvents:"none"}}/>
      ))}
      <div style={{width:"100%",maxWidth:400,position:"relative",zIndex:1,animation:"fadeUp .4s ease both"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <Logo size={18}/>
          <div style={{fontFamily:T.fM,fontSize:10,color:T.muted,marginTop:8}}>AI Sports Intelligence · 21+</div>
        </div>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:28}}>
          <div style={{display:"flex",background:"rgba(255,255,255,.03)",borderRadius:8,padding:3,marginBottom:20}}>
            {[["login","Log In"],["signup","Sign Up"]].map(([id,label])=>(
              <button key={id} onClick={()=>{setTab(id);setErr("");}}
                style={{...btn(),flex:1,padding:"8px",borderRadius:6,fontSize:13,
                  background:tab===id?T.accent:"transparent",color:tab===id?"#000":T.muted}}>{label}</button>
            ))}
          </div>
          {tab==="login"?(
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              {[["EMAIL","email","your@email.com","email"],["PASSWORD","password","••••••••","password"]].map(([l,t,ph,k])=>(
                <div key={k}>
                  <div style={{fontSize:9,fontFamily:T.fM,color:T.muted,letterSpacing:2}}>{l}</div>
                  <input style={inp} type={t} placeholder={ph} value={form[k]} onChange={set(k)}
                    onKeyDown={e=>e.key==="Enter"&&doLogin()}
                    onFocus={e=>e.target.style.borderColor=T.accent}
                    onBlur={e=>e.target.style.borderColor=T.border}/>
                </div>
              ))}
              {err&&<div style={{color:T.red,fontSize:12,fontFamily:T.fM,textAlign:"center"}}>{err}</div>}
              <button onClick={doLogin} disabled={loading}
                style={{...btn(),background:T.accent,color:"#000",padding:12,borderRadius:8,fontSize:14,opacity:loading?.6:1}}>
                {loading?"Verifying...":"Enter StatBlitz →"}
              </button>
              <div style={{fontSize:11,color:T.muted,fontFamily:T.fM,textAlign:"center"}}>Demo: demo@statblitz.com / demo123</div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:11}}>
              {[["FULL NAME","text","Your Name","name"],["EMAIL","email","your@email.com","email"],["PASSWORD","password","Min 6 chars","password"]].map(([l,t,ph,k])=>(
                <div key={k}>
                  <div style={{fontSize:9,fontFamily:T.fM,color:T.muted,letterSpacing:2}}>{l}</div>
                  <input style={inp} type={t} placeholder={ph} value={form[k]} onChange={set(k)}
                    onFocus={e=>e.target.style.borderColor=T.accent}
                    onBlur={e=>e.target.style.borderColor=T.border}/>
                </div>
              ))}
              {[
                {k:"age",l:"I confirm I am 21 years of age or older and sports betting is legal in my jurisdiction."},
                {k:"terms",l:"I understand StatBlitz provides entertainment and informational content only — not betting or financial advice."},
              ].map(c=>(
                <label key={c.k} style={{display:"flex",gap:8,alignItems:"flex-start",cursor:"pointer"}}>
                  <input type="checkbox" checked={checks[c.k]}
                    onChange={e=>setChecks(ch=>({...ch,[c.k]:e.target.checked}))}
                    style={{marginTop:3,flexShrink:0,accentColor:T.accent}}/>
                  <span style={{fontSize:11,color:T.muted,fontFamily:T.fM,lineHeight:1.6}}>{c.l}</span>
                </label>
              ))}
              {err&&<div style={{color:T.red,fontSize:12,fontFamily:T.fM,textAlign:"center"}}>{err}</div>}
              <button onClick={doSignup}
                style={{...btn(),background:T.accent,color:"#000",padding:12,borderRadius:8,fontSize:14}}>
                Create Account →
              </button>
            </div>
          )}
        </div>
        <div style={{textAlign:"center",marginTop:10,fontFamily:T.fM,fontSize:10,color:"#1e3a2e"}}>
          For entertainment only · 21+ · Gamble responsibly
        </div>
        <div style={{textAlign:"center",marginTop:8}}>
          <span onClick={onBack} style={{color:T.muted,fontSize:12,fontFamily:T.fM,cursor:"pointer"}}>← Back to home</span>
        </div>
      </div>
    </div>
  );
}

// ── AI MODAL ──────────────────────────────────────────────────
function AIModal({game,onClose}){
  const [res,setRes] = useState(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    if(!game)return;
    setLoading(true);setRes(null);
    const hS=game.hO>0?"+":"",aS=game.aO>0?"+":"";
    fetch("https://api.anthropic.com/v1/messages",{method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,
        messages:[{role:"user",content:`Sharp sports betting analyst. Analyze this ${game.sport} matchup.
Game: ${game.away} @ ${game.home}
Moneyline: ${game.home} ${hS}${game.hO} | ${game.away} ${aS}${game.aO}
Total O/U: ${game.total}
Write 3-4 sentences of sharp analysis, then:
BEST BET: [pick]
CONFIDENCE: [number]%`}]})})
    .then(r=>r.json())
    .then(d=>{
      const text=d.content?.[0]?.text||"";
      const pick=text.match(/BEST BET:\s*(.+)/i)?.[1]?.trim()||"See analysis";
      const conf=parseInt(text.match(/CONFIDENCE:\s*(\d+)/i)?.[1]||"65");
      const analysis=text.replace(/BEST BET:.+/gi,"").replace(/CONFIDENCE:.+/gi,"").trim();
      setRes({analysis,pick,conf});setLoading(false);
    })
    .catch(()=>{setRes({analysis:"Unable to connect. Try again.",pick:"N/A",conf:0});setLoading(false);});
  },[game]);

  if(!game)return null;
  const cc=res?.conf>=80?T.green:res?.conf>=70?T.accent:T.orange;

  return(
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(4,6,15,.92)",backdropFilter:"blur(10px)",
        zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:T.card,border:`1px solid rgba(0,229,255,.2)`,borderRadius:14,
        width:"100%",maxWidth:480,maxHeight:"82vh",overflowY:"auto",animation:"slideUp .3s ease both"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"16px 20px",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,background:T.card}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:T.fD,fontSize:18,letterSpacing:".5px"}}>⚡ AI ANALYSIS</span>
            <span style={{background:T.accentD,color:T.accent,fontFamily:T.fM,fontSize:9,padding:"2px 7px",borderRadius:3}}>LIVE</span>
          </div>
          <button onClick={onClose} style={{...btn(),background:"none",color:T.muted,fontSize:18}}>✕</button>
        </div>
        <div style={{padding:"12px 20px",background:"#070b18",borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontFamily:T.fD,fontSize:18}}>{game.away}</span>
            <span style={{fontFamily:T.fM,fontSize:9,color:T.muted,padding:"2px 7px",border:`1px solid ${T.border}`,borderRadius:3}}>@ {game.sport}</span>
            <span style={{fontFamily:T.fD,fontSize:18}}>{game.home}</span>
          </div>
          <div style={{fontFamily:T.fM,fontSize:10,color:T.muted}}>{game.time} · O/U {game.total}</div>
        </div>
        <div style={{padding:20}}>
          {loading?(
            <div style={{display:"flex",alignItems:"center",gap:10,color:T.muted,fontFamily:T.fM,fontSize:12}}>
              <div style={{width:14,height:14,border:`2px solid ${T.border}`,borderTopColor:T.accent,
                borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
              Analyzing matchup...
            </div>
          ):(
            <>
              <div style={{fontSize:13,lineHeight:1.85,color:T.sub,marginBottom:16}}>{res.analysis}</div>
              <div style={{background:"rgba(0,229,255,.04)",border:`1px solid rgba(0,229,255,.14)`,
                borderRadius:10,padding:16,marginBottom:12}}>
                <div style={{fontFamily:T.fM,fontSize:9,color:T.muted,letterSpacing:2,marginBottom:6}}>⚡ BEST BET</div>
                <div style={{fontFamily:T.fD,fontSize:26,color:T.accent,letterSpacing:".5px",marginBottom:11}}>{res.pick}</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,height:4,background:T.border,borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${res.conf}%`,background:`linear-gradient(90deg,${T.accent},${T.green})`,borderRadius:2}}/>
                  </div>
                  <span style={{fontFamily:T.fM,fontSize:11,color:cc,fontWeight:600}}>{res.conf}%</span>
                </div>
              </div>
              <div style={{fontSize:10,color:T.muted,fontFamily:T.fM,lineHeight:1.8,paddingTop:11,borderTop:`1px solid ${T.border}`}}>
                ⚠ Entertainment & information only — not betting advice · 21+ · Problem gambling: <strong style={{color:"#3a6a4a"}}>1-800-522-4700</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────
function Dashboard({user,onLogout}){
  const [view,setView] = useState("games");
  const [sf,setSf] = useState("all");
  const [ps,setPs] = useState("nba");
  const [sg,setSg] = useState(null);
  const [bk,setBk] = useState({b:"",p:"",o:""});
  const [kelly,setKelly] = useState(null);

  const filtered = sf==="all"?GAMES:GAMES.filter(g=>g.sport===sf);
  const calcK = v => {
    const b=parseFloat(v.b)||0,p=parseFloat(v.p)/100||0,d=parseFloat(v.o)||0;
    if(!b||!p||!d){setKelly(null);return;}
    const k=(p*(d-1)-(1-p))/(d-1),h=Math.max(0,k/2);
    setKelly({bet:(h*b).toFixed(2),pct:(h*100).toFixed(1)});
  };
  const setBkK = k => e => {const v={...bk,[k]:e.target.value};setBk(v);calcK(v);};
  const inp = {background:"rgba(255,255,255,.03)",border:`1px solid ${T.border}`,borderRadius:8,
    padding:"9px 12px",color:T.text,fontFamily:T.fM,fontSize:12,outline:"none",width:"100%"};

  return(
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg,color:T.text,fontFamily:T.fB}}>
      {/* NAV */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"11px 24px",background:T.surface,borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <Logo size={14}/>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:5,background:T.accentD,
            border:`1px solid rgba(0,229,255,.18)`,borderRadius:100,padding:"3px 10px 3px 7px"}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:T.accent,animation:"pulse 2s infinite"}}/>
            <span style={{fontFamily:T.fM,fontSize:9,color:T.accent}}>AI LIVE</span>
          </div>
          <div style={{width:28,height:28,background:`linear-gradient(135deg,${T.accent},#0084ff)`,
            borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
            fontWeight:700,fontSize:11,color:"#000"}}>{user.name[0].toUpperCase()}</div>
          <span style={{fontSize:13,fontWeight:500}}>{user.name}</span>
          <button onClick={onLogout} style={{...btn(),background:"transparent",
            border:`1px solid ${T.border}`,color:T.muted,padding:"4px 11px",borderRadius:5,fontSize:11}}>Out</button>
        </div>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* SIDEBAR */}
        <div style={{width:180,background:T.surface,borderRight:`1px solid ${T.border}`,
          padding:"16px 8px",flexShrink:0,overflowY:"auto"}}>
          <div style={{fontSize:9,fontFamily:T.fM,color:T.muted,letterSpacing:2,padding:"0 6px",marginBottom:6}}>MENU</div>
          {[{id:"games",i:"🎯",l:"Today's Games"},{id:"players",i:"👤",l:"Player Stats"},{id:"bankroll",i:"💼",l:"Bankroll"}].map(s=>(
            <div key={s.id} onClick={()=>setView(s.id)}
              style={{display:"flex",alignItems:"center",gap:7,padding:"8px",borderRadius:6,
                cursor:"pointer",marginBottom:2,fontSize:12,fontWeight:500,
                background:view===s.id?T.accentD:"transparent",color:view===s.id?T.accent:T.muted}}>
              <span>{s.i}</span>{s.l}
            </div>
          ))}
          <div style={{borderTop:`1px solid ${T.border}`,marginTop:12,paddingTop:12}}>
            <div style={{fontSize:9,fontFamily:T.fM,color:T.muted,letterSpacing:2,padding:"0 6px",marginBottom:6}}>SPORTS</div>
            {SPORTS.map(s=>(
              <div key={s.id} onClick={()=>{setSf(s.id);setView("games");}}
                style={{display:"flex",alignItems:"center",gap:6,padding:"7px 8px",borderRadius:6,
                  cursor:"pointer",marginBottom:2,fontSize:12,
                  color:sf===s.id&&view==="games"?T.accent:T.muted}}>
                <span>{s.i}</span>{s.l}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN */}
        <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>
          <div style={{marginBottom:20}}>
            <h1 style={{fontFamily:T.fD,fontSize:26,letterSpacing:".5px"}}>
              GM, <span style={{color:T.accent}}>{user.name.toUpperCase()}</span> 👋
            </h1>
            <div style={{fontSize:11,color:T.muted,fontFamily:T.fM,marginTop:3}}>
              {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})} · AI scanning every hour
            </div>
          </div>

          {/* METRICS */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:22}}>
            {[{l:"WIN RATE",v:"68%",c:T.accent,d:"↑ +3% this week"},
              {l:"BANKROLL",v:"$2,340",c:T.green,d:"↑ +$140 today"},
              {l:"LIVE PICKS",v:"7",c:T.accent,d:"Across 3 sports"},
              {l:"HOT STREAK",v:"3W",c:T.green,d:"Best: 6W"}].map(m=>(
              <div key={m.l} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:14,
                transition:"border .2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=T.borderH}
                onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                <div style={{fontSize:9,fontFamily:T.fM,color:T.muted,letterSpacing:1,marginBottom:6}}>{m.l}</div>
                <div style={{fontFamily:T.fD,fontSize:26,color:m.c,letterSpacing:".5px"}}>{m.v}</div>
                <div style={{fontSize:10,marginTop:3,color:T.muted,fontFamily:T.fM}}>{m.d}</div>
              </div>
            ))}
          </div>

          {/* GAMES */}
          {view==="games"&&<>
            <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
              {SPORTS.map(s=>(
                <div key={s.id} onClick={()=>setSf(s.id)}
                  style={{display:"flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadius:7,
                    cursor:"pointer",fontSize:12,fontWeight:600,
                    background:sf===s.id?T.accentD:T.card,
                    border:`1px solid ${sf===s.id?T.accent:T.border}`,
                    color:sf===s.id?T.accent:T.muted}}>
                  {s.i} {s.l}
                </div>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontFamily:T.fD,fontSize:18,letterSpacing:".5px"}}>TODAY'S MATCHUPS</div>
              <div style={{fontFamily:T.fM,fontSize:10,color:T.muted,background:T.card,
                border:`1px solid ${T.border}`,padding:"3px 9px",borderRadius:100}}>{filtered.length} games</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
              {filtered.map(g=>{
                const hS=g.hO>0?"+":"",aS=g.aO>0?"+":"";
                return(
                  <div key={g.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,
                    padding:16,transition:"all .2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,229,255,.25)";e.currentTarget.style.background=T.cardH;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.card;}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                      <span style={{fontFamily:T.fM,fontSize:9,color:T.muted,
                        background:"rgba(255,255,255,.04)",padding:"2px 6px",borderRadius:3}}>{g.e} {g.sport}</span>
                      <span style={{fontFamily:T.fM,fontSize:9,color:T.accent}}>{g.time}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div>
                        <div style={{fontFamily:T.fD,fontSize:16}}>{g.away}</div>
                        <div style={{fontFamily:T.fM,fontSize:12,marginTop:2,color:g.aO<0?T.red:T.green}}>{aS}{g.aO}</div>
                      </div>
                      <div style={{fontFamily:T.fM,fontSize:9,color:T.muted,
                        border:`1px solid ${T.border}`,padding:"2px 6px",borderRadius:3}}>VS</div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:T.fD,fontSize:16}}>{g.home}</div>
                        <div style={{fontFamily:T.fM,fontSize:12,marginTop:2,color:g.hO<0?T.red:T.green}}>{hS}{g.hO}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                      paddingTop:9,borderTop:`1px solid ${T.border}`}}>
                      <span style={{fontSize:10,color:T.muted,fontFamily:T.fM}}>O/U {g.total}</span>
                      <button onClick={()=>setSg(g)}
                        style={{...btn(),background:T.accentD,color:T.accent,
                          padding:"5px 12px",borderRadius:5,fontSize:11,fontFamily:T.fM,
                          border:`1px solid rgba(0,229,255,.2)`}}>⚡ AI Pick</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>}

          {/* PLAYERS */}
          {view==="players"&&<>
            <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
              {["nba","nfl","mlb","nhl"].map(s=>(
                <div key={s} onClick={()=>setPs(s)}
                  style={{padding:"6px 13px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600,
                    background:ps===s?T.accentD:T.card,border:`1px solid ${ps===s?T.accent:T.border}`,
                    color:ps===s?T.accent:T.muted}}>{s.toUpperCase()}</div>
              ))}
            </div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 70px 90px",
                padding:"10px 16px",background:T.surface,borderBottom:`1px solid ${T.border}`}}>
                {["PLAYER",...(HDR[ps]||[]),"FORM","AI PICK"].map(h=>(
                  <div key={h} style={{fontSize:9,fontFamily:T.fM,color:T.muted,letterSpacing:1}}>{h}</div>
                ))}
              </div>
              {(PLAYERS[ps]||[]).map((p,i,arr)=>{
                const fs=formC(p.form);
                return(
                  <div key={p.name} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 70px 90px",
                    padding:"12px 16px",borderBottom:i<arr.length-1?`1px solid rgba(255,255,255,.03)`:"none",
                    alignItems:"center",transition:"background .15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.02)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:26,height:26,borderRadius:6,
                        background:`linear-gradient(135deg,${T.accent},#0084ff)`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:10,fontWeight:700,color:"#000"}}>{p.name[0]}</div>
                      <div>
                        <div style={{fontSize:12,fontWeight:600}}>{p.name}</div>
                        <div style={{fontSize:9,color:T.muted,fontFamily:T.fM}}>{p.team}</div>
                      </div>
                    </div>
                    {[p.s1,p.s2,p.s3].map((s,j)=>(
                      <div key={j} style={{fontFamily:T.fM,fontSize:11,color:T.sub}}>{s}</div>
                    ))}
                    <span style={{background:fs.bg,color:fs.c,padding:"2px 7px",borderRadius:3,
                      fontSize:9,fontFamily:T.fM,fontWeight:600,display:"inline-block"}}>
                      {p.form.toUpperCase()}
                    </span>
                    <span style={{fontFamily:T.fM,fontSize:10,color:T.accent,fontWeight:600}}>{p.pick}</span>
                  </div>
                );
              })}
            </div>
          </>}

          {/* BANKROLL */}
          {view==="bankroll"&&
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:20}}>
                <div style={{fontFamily:T.fD,fontSize:16,letterSpacing:".5px",marginBottom:16}}>KELLY CRITERION CALC</div>
                {[["BANKROLL ($)","b","e.g. 1000"],["WIN PROB (%)","p","e.g. 55"],["DECIMAL ODDS","o","e.g. 1.91"]].map(([l,k,ph])=>(
                  <div key={k} style={{marginBottom:11}}>
                    <div style={{fontSize:9,fontFamily:T.fM,color:T.muted,letterSpacing:1,marginBottom:4}}>{l}</div>
                    <input style={inp} type="number" placeholder={ph} value={bk[k]} onChange={setBkK(k)}
                      onFocus={e=>e.target.style.borderColor=T.accent}
                      onBlur={e=>e.target.style.borderColor=T.border}/>
                  </div>
                ))}
                <div style={{background:"rgba(0,229,255,.04)",border:`1px solid rgba(0,229,255,.12)`,borderRadius:8,padding:13}}>
                  <div style={{fontSize:9,fontFamily:T.fM,color:T.muted,letterSpacing:1,marginBottom:6}}>RECOMMENDED BET</div>
                  {kelly
                    ?<><div style={{fontFamily:T.fD,fontSize:24,color:T.accent}}>${kelly.bet}</div>
                      <div style={{fontSize:10,color:T.muted,fontFamily:T.fM,marginTop:2}}>{kelly.pct}% · ½ Kelly</div></>
                    :<div style={{fontSize:12,color:T.muted,fontFamily:T.fM}}>Enter values above</div>}
                </div>
              </div>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:20}}>
                <div style={{fontFamily:T.fD,fontSize:16,letterSpacing:".5px",marginBottom:16}}>BET HISTORY</div>
                {[{g:"Lakers vs Celtics",p:"Lakers -110 · $50",r:"+$45",w:true},
                  {g:"Chiefs vs Bills",p:"Chiefs -160 · $80",r:"+$50",w:true},
                  {g:"Yankees O8.5",p:"Over -110 · $40",r:"-$40",w:false},
                  {g:"Nuggets vs Warriors",p:"Nuggets -140 · $70",r:"+$50",w:true},
                  {g:"Dodgers vs Giants",p:"Dodgers -170 · $85",r:"+$50",w:true}].map((h,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"9px",background:"rgba(255,255,255,.02)",borderRadius:7,marginBottom:6}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:500}}>{h.g}</div>
                      <div style={{fontSize:10,color:T.muted,fontFamily:T.fM,marginTop:2}}>{h.p}</div>
                    </div>
                    <div style={{fontFamily:T.fM,fontWeight:600,fontSize:13,color:h.w?T.green:T.red}}>{h.r}</div>
                  </div>
                ))}
              </div>
            </div>
          }
        </div>
      </div>

      {/* DISCLOSURE */}
      <div style={{padding:"8px 24px",background:"#020508",borderTop:"1px solid #0a1508",
        fontFamily:T.fM,fontSize:9,color:"#1e3020",textAlign:"center",lineHeight:1.7,flexShrink:0}}>
        ⚠ Entertainment & information only — not betting advice · Must be <strong style={{color:"#2a5030"}}>21+</strong> ·
        Problem gambling: <strong style={{color:"#2a5030"}}>1-800-522-4700</strong> · Free · Confidential · 24/7
      </div>

      {sg&&<AIModal game={sg} onClose={()=>setSg(null)}/>}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────
export default function StatBlitz(){
  const [page,setPage] = useState("landing");
  const [user,setUser] = useState(null);
  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{STYLES}</style>
      <DisclBar/>
      <div style={{flex:1,overflow:"hidden",position:"relative"}}>
        {page==="landing"&&<Landing onStart={()=>setPage("auth")}/>}
        {page==="auth"&&<Auth onLogin={u=>{setUser(u);setPage("dashboard");}} onBack={()=>setPage("landing")}/>}
        {page==="dashboard"&&user&&<Dashboard user={user} onLogout={()=>{setUser(null);setPage("landing");}}/>}
      </div>
    </div>
  );
}
