import { useState, useMemo, useRef } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, ReferenceLine } from "recharts";

const DARK={bg:"#0A0E17",bgCard:"#111827",bgSurface:"#1A1F2E",text:"#E5E7EB",textMuted:"#A0A6B2",textDim:"#6B7280",border:"rgba(255,255,255,0.06)",accent:"#00E5A0",accentDark:"#00B87D",danger:"#FF6B6B",warning:"#F59E0B",info:"#3B82F6"};
const LIGHT={bg:"#F9FAFB",bgCard:"#FFFFFF",bgSurface:"#F3F4F6",text:"#111827",textMuted:"#4B5563",textDim:"#6B7280",border:"rgba(0,0,0,0.08)",accent:"#059669",accentDark:"#047857",danger:"#DC2626",warning:"#D97706",info:"#2563EB"};

const ASSETS=[
  {id:"us_sp500",name:"미국 S&P500",cat:"주식",type:"해외",color:"#3B82F6",br:0.009,vol:0.045},
  {id:"us_nasdaq",name:"미국 나스닥100",cat:"주식",type:"해외",color:"#8B5CF6",br:0.011,vol:0.055},
  {id:"us_small",name:"미국 소형가치주",cat:"주식",type:"해외",color:"#6366F1",br:0.008,vol:0.05},
  {id:"kr_kospi",name:"한국 KOSPI",cat:"주식",type:"국내",color:"#EC4899",br:0.006,vol:0.05},
  {id:"dev_ex",name:"선진국 주식(미국외)",cat:"주식",type:"해외",color:"#14B8A6",br:0.005,vol:0.04},
  {id:"em",name:"신흥국 주식",cat:"주식",type:"해외",color:"#F97316",br:0.006,vol:0.06},
  {id:"bond_long",name:"미국 장기채(20년+)",cat:"채권",type:"해외",color:"#06B6D4",br:0.004,vol:0.025},
  {id:"bond_mid",name:"미국 중기채(7~10년)",cat:"채권",type:"해외",color:"#0EA5E9",br:0.003,vol:0.015},
  {id:"bond_short",name:"미국 단기채(1~3년)",cat:"채권",type:"해외",color:"#67E8F9",br:0.002,vol:0.005},
  {id:"bond_agg",name:"미국 종합채권",cat:"채권",type:"해외",color:"#22D3EE",br:0.003,vol:0.01},
  {id:"tips",name:"미국 물가연동채",cat:"채권",type:"해외",color:"#2DD4BF",br:0.002,vol:0.012},
  {id:"kr_bond",name:"한국 국채 10년",cat:"채권",type:"국내",color:"#5EEAD4",br:0.003,vol:0.01},
  {id:"gold",name:"금(Gold)",cat:"대체",type:"해외",color:"#F59E0B",br:0.005,vol:0.035},
  {id:"silver",name:"은(Silver)",cat:"대체",type:"해외",color:"#D4D4D8",br:0.004,vol:0.06},
  {id:"commodity",name:"원자재 종합",cat:"대체",type:"해외",color:"#A16207",br:0.002,vol:0.04},
  {id:"btc",name:"비트코인(BTC)",cat:"대체",type:"해외",color:"#F7931A",br:0.02,vol:0.2},
  {id:"eth",name:"이더리움(ETH)",cat:"대체",type:"해외",color:"#627EEA",br:0.018,vol:0.22},
  {id:"us_reit",name:"미국 부동산(REITs)",cat:"부동산",type:"해외",color:"#E11D48",br:0.006,vol:0.04},
  {id:"gl_reit",name:"글로벌 부동산(REITs)",cat:"부동산",type:"해외",color:"#BE185D",br:0.005,vol:0.04},
  {id:"kr_reit",name:"한국 부동산(REITs)",cat:"부동산",type:"국내",color:"#FB7185",br:0.005,vol:0.035},
  {id:"cash_usd",name:"현금(달러)",cat:"현금",type:"해외",color:"#9CA3AF",br:0.003,vol:0.001},
  {id:"cash_krw",name:"현금(원화)",cat:"현금",type:"국내",color:"#6B7280",br:0.002,vol:0.001},
];
function ga(id){return ASSETS.find(a=>a.id===id)||{name:id,color:"#888",br:0.005,vol:0.03,type:"해외",cat:"기타"};}

const THEORIES=[
  {id:"allweather",name:"올웨더",color:"#3B82F6",assets:[{a:"us_sp500",w:30},{a:"bond_long",w:40},{a:"bond_mid",w:15},{a:"gold",w:7.5},{a:"commodity",w:7.5}]},
  {id:"6040",name:"60/40",color:"#10B981",assets:[{a:"us_sp500",w:60},{a:"bond_agg",w:40}]},
  {id:"permanent",name:"영구 포트폴리오",color:"#8B5CF6",assets:[{a:"us_sp500",w:25},{a:"bond_long",w:25},{a:"gold",w:25},{a:"bond_short",w:25}]},
  {id:"golden",name:"황금 나비",color:"#F59E0B",assets:[{a:"us_sp500",w:20},{a:"us_small",w:20},{a:"bond_long",w:20},{a:"bond_short",w:20},{a:"gold",w:20}]},
  {id:"markowitz",name:"마코위츠",color:"#EC4899",assets:[{a:"us_sp500",w:35},{a:"dev_ex",w:10},{a:"em",w:10},{a:"bond_agg",w:25},{a:"us_reit",w:10},{a:"gold",w:10}]},
  {id:"riskparity",name:"리스크 패리티",color:"#06B6D4",assets:[{a:"us_sp500",w:12},{a:"bond_long",w:35},{a:"bond_mid",w:20},{a:"gold",w:18},{a:"commodity",w:15}]},
];

function genMonths(s,e){const m=[];const[sy,sm]=s.split("-").map(Number);const[ey,em]=e.split("-").map(Number);for(let y=sy;y<=ey;y++)for(let mo=1;mo<=12;mo++){if(y===sy&&mo<sm)continue;if(y===ey&&mo>em)break;m.push(`${y}-${String(mo).padStart(2,"0")}`);}return m;}

function sim(port,months,hr,hc,rebal,initAmt){
  const seed=(port.id||"x").split("").reduce((a,c)=>a+c.charCodeAt(0),0);let rng=seed;
  const rand=()=>{rng=(rng*16807+7)%2147483647;return(rng/2147483647)-0.5;};
  let tot=initAmt,peak=tot,mdd=0;const data=[],mRet=[],aRet={};
  const en=port.assets.map(x=>({...x,...ga(x.a)}));
  en.forEach(x=>{aRet[x.a]=[];});
  const fw=en.filter(x=>x.type==="해외").reduce((s,x)=>s+x.w,0)/100;
  const hcm=(hc/100)*(hr/100)*fw/12;
  const cr={"2001-09":-0.08,"2002-07":-0.07,"2008-09":-0.12,"2008-10":-0.16,"2008-11":-0.07,"2020-03":-0.13};
  const bm={"2003-03":0.08,"2009-03":0.09,"2009-04":0.1,"2020-04":0.12,"2020-11":0.1,"2021-01":0.06};
  const ri=rebal==="monthly"?1:rebal==="quarterly"?3:12;
  months.forEach((month,idx)=>{
    let pr=0;en.forEach(x=>{
      let r=x.br+rand()*x.vol*2;
      if(cr[month]){if(x.cat==="주식")r=cr[month]*(x.vol/0.045);else if(x.cat==="채권")r=Math.abs(cr[month])*0.3;else if(x.id==="gold")r=Math.abs(cr[month])*0.2;else if(x.id==="btc"||x.id==="eth")r=cr[month]*1.5;}
      if(bm[month]){if(x.cat==="주식")r=bm[month]*(x.vol/0.045);else if(x.id==="btc"||x.id==="eth")r=bm[month]*2;}
      if(idx%ri!==0)r*=(1+(rand()*0.005));
      aRet[x.a].push({month,ret:Math.round(r*10000)/100});pr+=r*(x.w/100);
    });
    pr+=(1-hr/100)*fw*rand()*0.015;pr-=hcm;
    tot*=(1+pr);mRet.push(pr);if(tot>peak)peak=tot;const dd=(tot-peak)/peak;if(dd<mdd)mdd=dd;
    data.push({date:month,value:Math.round(tot),dd:Math.round(dd*10000)/100,pct:Math.round((tot/initAmt-1)*10000)/100});
  });
  const yrs=months.length/12;const cagr=(Math.pow(tot/initAmt,1/yrs)-1)*100;
  const avg=mRet.reduce((a,b)=>a+b,0)/mRet.length;
  const vol=Math.sqrt(mRet.reduce((a,r)=>a+(r-avg)**2,0)/mRet.length)*Math.sqrt(12)*100;
  const sharpe=vol>0?(cagr-2)/vol:0;
  const yba={};en.forEach(x=>{aRet[x.a].forEach(r=>{const yr=r.month.split("-")[0];if(!yba[yr])yba[yr]={year:yr};if(!yba[yr][x.a])yba[yr][x.a]=0;yba[yr][x.a]+=r.ret;});});
  Object.keys(yba).forEach(yr=>{let pt=0;en.forEach(x=>{pt+=(yba[yr][x.a]||0)*(x.w/100);});yba[yr]._total=Math.round(pt*100)/100;});
  return{data,yba:Object.values(yba).sort((a,b)=>a.year.localeCompare(b.year)),totalRet:Math.round((tot/initAmt-1)*1000)/10,cagr:Math.round(cagr*100)/100,mdd:Math.round(mdd*10000)/100,sharpe:Math.round(sharpe*100)/100,vol:Math.round(vol*10)/10,en,finalVal:Math.round(tot)};
}

function CalPicker({value,onChange,t}){
  const[open,setOpen]=useState(false);const[yr,mo]=value.split("-").map(Number);const[viewYr,setViewYr]=useState(yr);const[mode,setMode]=useState("month");
  const yrs=[];for(let y=1995;y<=2026;y++)yrs.push(y);
  const mons=["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  return(<div style={{position:"relative",display:"inline-block"}}>
    <div onClick={()=>{setOpen(!open);setViewYr(yr);setMode("month");}} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${t.border}`,background:t.bgSurface,color:t.text,fontSize:12,cursor:"pointer",minWidth:80,textAlign:"center"}}>{value}</div>
    {open&&<div style={{position:"absolute",top:"100%",left:0,marginTop:4,background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:10,padding:10,zIndex:300,width:220,boxShadow:"0 8px 24px rgba(0,0,0,0.3)"}}>
      {mode==="month"?<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><button onClick={()=>setViewYr(viewYr-1)} style={{background:"transparent",border:"none",color:t.textMuted,cursor:"pointer",fontSize:14}}>◀</button><span onClick={()=>setMode("year")} style={{fontWeight:700,fontSize:13,cursor:"pointer",color:t.text}}>{viewYr}년</span><button onClick={()=>setViewYr(viewYr+1)} style={{background:"transparent",border:"none",color:t.textMuted,cursor:"pointer",fontSize:14}}>▶</button></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>{mons.map((m,i)=>{const sel=viewYr===yr&&i+1===mo;return<div key={i} onClick={()=>{onChange(`${viewYr}-${String(i+1).padStart(2,"0")}`);setOpen(false);}} style={{padding:"6px 0",textAlign:"center",borderRadius:4,fontSize:11,cursor:"pointer",background:sel?t.accent:"transparent",color:sel?t.bg:t.textMuted,fontWeight:sel?700:400}}>{m}</div>;})}</div>
      </>:<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><button onClick={()=>setMode("month")} style={{background:"transparent",border:"none",color:t.textMuted,cursor:"pointer",fontSize:12}}>← 뒤로</button><span style={{fontSize:12,fontWeight:700,color:t.text}}>연도 선택</span><span/></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,maxHeight:200,overflow:"auto"}}>{yrs.map(y=>{const sel=y===viewYr;return<div key={y} onClick={()=>{setViewYr(y);setMode("month");}} style={{padding:"5px 0",textAlign:"center",borderRadius:4,fontSize:11,cursor:"pointer",background:sel?t.accent:"transparent",color:sel?t.bg:t.textMuted,fontWeight:sel?700:400}}>{y}</div>;})}</div>
      </>}
    </div>}
  </div>);
}

const CURRENCIES=[{id:"KRW",sym:"₩",name:"원화"},{id:"USD",sym:"$",name:"달러"},{id:"EUR",sym:"€",name:"유로"},{id:"JPY",sym:"¥",name:"엔화"}];

// 천원단위 포맷
function fmtNum(v){return Number(v).toLocaleString();}
function fmtShort(v){if(v>=100000000)return`${(v/100000000).toFixed(1)} 억`;if(v>=10000)return`${fmtNum(Math.round(v/10000))} 만`;return fmtNum(v);}

export default function App(){
  const[dark,setDark]=useState(true);const t=dark?DARK:LIGHT;
  const[sel,setSel]=useState(["allweather","6040"]);
  const[customs,setCustoms]=useState([]);
  const[startD,setStartD]=useState("2000-01");
  const[endD,setEndD]=useState("2025-05");
  const[rebal,setRebal]=useState("monthly");
  const[hr,setHr]=useState(50);const[hc]=useState(1.8);
  const[benchmark,setBenchmark]=useState("allweather");
  const[showModal,setShowModal]=useState(false);
  const[editP,setEditP]=useState({name:"",color:"#D85A30",assets:[]});
  const[picker,setPicker]=useState(false);
  const[selYear,setSelYear]=useState(null);
  const[cumUnit,setCumUnit]=useState("pct");
  const[initAmt,setInitAmt]=useState(10000000);
  const[currency,setCurrency]=useState("KRW");
  const curSym=CURRENCIES.find(c=>c.id===currency)?.sym||"₩";
  const fmtAmt=v=>`${curSym} ${fmtNum(v)}`;

  const secRef={cum:useRef(null),mdd:useRef(null),yearly:useRef(null),alloc:useRef(null)};
  const scrollTo=k=>{secRef[k]?.current?.scrollIntoView({behavior:"smooth",block:"start"});};

  const allP=[...THEORIES,...customs];
  const activeP=allP.filter(p=>sel.includes(p.id));
  const months=useMemo(()=>genMonths(startD,endD),[startD,endD]);
  const results=useMemo(()=>{const r={};activeP.forEach(p=>{r[p.id]=sim(p,months,hr,hc,rebal,initAmt);});return r;},[activeP.map(p=>p.id).join(","),months.length,hr,hc,rebal,initAmt]);
  const chartData=useMemo(()=>{if(!activeP.length)return[];const base=results[activeP[0].id]?.data||[];return base.map((d,i)=>{const pt={date:d.date};activeP.forEach(p=>{const rd=results[p.id]?.data[i];if(rd){pt[`${p.id}_v`]=rd.value;pt[`${p.id}_p`]=rd.pct;pt[`${p.id}_d`]=rd.dd;}});return pt;});},[results,activeP.map(p=>p.id).join(",")]);

  const toggle=id=>setSel(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const addC=()=>{const id="c_"+Date.now();setCustoms(p=>[...p,{...editP,id}]);setSel(p=>[...p,id]);setShowModal(false);setEditP({name:"",color:"#D85A30",assets:[]});};
  const addA=aid=>{if(editP.assets.find(x=>x.a===aid))return;setEditP(p=>({...p,assets:[...p.assets,{a:aid,w:0}]}));setPicker(false);};
  const bmResult=results[benchmark];const bmPort=allP.find(p=>p.id===benchmark);
  const ttStyle={background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:8,fontSize:11,color:t.text};

  // 금액 입력 포맷 (display용)
  const[amtInput,setAmtInput]=useState(fmtNum(initAmt));
  const handleAmtChange=e=>{const raw=e.target.value.replace(/[^0-9]/g,"");const num=parseInt(raw)||0;setInitAmt(num);setAmtInput(fmtNum(num));};
  const handleAmtFocus=()=>setAmtInput(String(initAmt));
  const handleAmtBlur=()=>setAmtInput(fmtNum(initAmt));

  const css=`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&family=Outfit:wght@300;400;600;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}input[type=range]{-webkit-appearance:none;background:${t.border};height:4px;border-radius:2px;outline:none}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${t.accent};cursor:pointer}select,input[type=text],input[type=number]{background:${t.bgSurface};border:1px solid ${t.border};color:${t.text};border-radius:6px;padding:6px 10px;font-size:12px;outline:none;font-family:inherit}`;

  const Chip=({active,color,children,onClick,onRemove})=>(<div onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:16,border:`1px solid ${active?color||t.accent:t.border}`,background:active?`${color||t.accent}18`:"transparent",cursor:"pointer",fontSize:12,fontWeight:active?600:400,color:active?t.text:t.textMuted,transition:"all .15s",whiteSpace:"nowrap"}}>{color&&<span style={{width:7,height:7,borderRadius:"50%",background:color}}/>}{children}{onRemove&&<span onClick={e=>{e.stopPropagation();onRemove();}} style={{marginLeft:3,fontSize:10,opacity:.5,cursor:"pointer"}}>✕</span>}</div>);
  const Tab=({active,children,onClick})=>(<button onClick={onClick} style={{padding:"6px 14px",borderRadius:6,border:`1px solid ${active?t.accent:t.border}`,background:active?`${t.accent}18`:"transparent",color:active?t.accent:t.textMuted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{children}</button>);

  return(
    <div style={{minHeight:"100vh",background:t.bg,color:t.text,fontFamily:"'Outfit',-apple-system,sans-serif",transition:"background .3s"}}>
      <style>{css}</style>

      <header style={{borderBottom:`1px solid ${t.border}`,padding:"0 20px",background:dark?"rgba(10,14,23,.95)":"rgba(255,255,255,.95)",backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1400,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:48}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${t.accent},${t.accentDark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:dark?"#0A0E17":"#fff"}}>P</div><span style={{fontWeight:800,fontSize:16,letterSpacing:"-.5px"}}>PortfolioLab</span><span style={{fontSize:9,color:t.accent,fontWeight:700,background:`${t.accent}18`,padding:"2px 5px",borderRadius:3}}>BACKTEST</span></div>
          <button onClick={()=>setDark(!dark)} style={{background:t.bgSurface,border:`1px solid ${t.border}`,borderRadius:6,padding:"5px 10px",color:t.textMuted,fontSize:11,cursor:"pointer"}}>{dark?"☀️ 라이트":"🌙 다크"}</button>
        </div>
      </header>

      <div style={{borderBottom:`1px solid ${t.border}`,background:dark?"rgba(17,24,39,.95)":"rgba(243,244,246,.95)",backdropFilter:"blur(12px)",position:"sticky",top:48,zIndex:90,padding:"10px 20px"}}>
        <div style={{maxWidth:1400,margin:"0 auto",display:"flex",flexWrap:"wrap",gap:12,alignItems:"flex-end"}}>
          <div style={{flex:"1 1 auto"}}>
            <div style={{fontSize:9,color:t.textDim,marginBottom:4,fontWeight:700,letterSpacing:".5px"}}>포트폴리오</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
              <select value={benchmark} onChange={e=>setBenchmark(e.target.value)} style={{fontSize:11,padding:"4px 8px",borderRadius:6,background:t.bgSurface,border:`1px solid ${t.accent}50`,color:t.accent,fontWeight:700,minWidth:80}}>{allP.filter(p=>sel.includes(p.id)).map(p=><option key={p.id} value={p.id}>★ {p.name}</option>)}</select>
              <div style={{width:1,height:20,background:t.border,flexShrink:0}}/>
              {THEORIES.map(p=><Chip key={p.id} active={sel.includes(p.id)} color={p.color} onClick={()=>toggle(p.id)}>{p.name}</Chip>)}
              {customs.map(p=><Chip key={p.id} active={sel.includes(p.id)} color={p.color} onClick={()=>toggle(p.id)} onRemove={()=>{setCustoms(c=>c.filter(x=>x.id!==p.id));setSel(s=>s.filter(x=>x!==p.id));}}>{p.name}</Chip>)}
              <div onClick={()=>setShowModal(true)} style={{display:"inline-flex",alignItems:"center",gap:3,padding:"4px 10px",borderRadius:16,border:`1px dashed ${t.border}`,color:t.textDim,fontSize:11,cursor:"pointer"}}>+ 맞춤형</div>
            </div>
          </div>
          <div style={{width:1,height:28,background:t.border,flexShrink:0}}/>
          <div><div style={{fontSize:9,color:t.textDim,marginBottom:4,fontWeight:700}}>투자금액</div><div style={{display:"flex",gap:4,alignItems:"center"}}><select value={currency} onChange={e=>setCurrency(e.target.value)} style={{fontSize:11,padding:"4px 6px",borderRadius:4,width:56}}>{CURRENCIES.map(c=><option key={c.id} value={c.id}>{c.sym} {c.id}</option>)}</select><input type="text" value={amtInput} onChange={handleAmtChange} onFocus={handleAmtFocus} onBlur={handleAmtBlur} style={{width:110,fontSize:11,textAlign:"right"}}/></div></div>
          <div style={{width:1,height:28,background:t.border,flexShrink:0}}/>
          <div><div style={{fontSize:9,color:t.textDim,marginBottom:4,fontWeight:700}}>기간</div><div style={{display:"flex",alignItems:"center",gap:4}}><CalPicker value={startD} onChange={setStartD} t={t}/><span style={{color:t.textDim,fontSize:11}}>~</span><CalPicker value={endD} onChange={setEndD} t={t}/></div></div>
          <div style={{width:1,height:28,background:t.border,flexShrink:0}}/>
          <div><div style={{fontSize:9,color:t.textDim,marginBottom:4,fontWeight:700}}>리밸런싱</div><div style={{display:"flex",gap:3}}>{[["monthly","월"],["quarterly","분기"],["yearly","연"]].map(([k,v])=><Tab key={k} active={rebal===k} onClick={()=>setRebal(k)}>{v}</Tab>)}</div></div>
          <div style={{width:1,height:28,background:t.border,flexShrink:0}}/>
          <div><div style={{fontSize:9,color:t.textDim,marginBottom:4,fontWeight:700}}>환헤지</div><div style={{display:"flex",alignItems:"center",gap:5}}><input type="range" min="0" max="100" step="10" value={hr} onChange={e=>setHr(+e.target.value)} style={{width:70}}/><span style={{fontSize:12,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:t.accent,minWidth:28}}>{hr}%</span><span style={{fontSize:9,color:t.warning,background:`${t.warning}18`,padding:"2px 5px",borderRadius:3,fontWeight:600}}>비용 {hc}%</span></div></div>
        </div>
      </div>

      {activeP.length>0&&<div style={{borderBottom:`1px solid ${t.border}`,background:dark?"rgba(17,24,39,.9)":"rgba(243,244,246,.9)",position:"sticky",top:108,zIndex:80,padding:"8px 20px"}}><div style={{maxWidth:1400,margin:"0 auto",display:"flex",gap:6}}>
        <Tab onClick={()=>scrollTo("cum")}>📈 누적 수익률</Tab><Tab onClick={()=>scrollTo("mdd")}>📉 MDD</Tab><Tab onClick={()=>scrollTo("yearly")}>📊 연도별 자산</Tab><Tab onClick={()=>scrollTo("alloc")}>🥧 자산 배분</Tab>
      </div></div>}

      <div style={{maxWidth:1400,margin:"0 auto",padding:"16px 20px"}}>
        {!activeP.length?(<div style={{textAlign:"center",padding:"60px 0",color:t.textMuted}}><div style={{fontSize:36,marginBottom:10}}>📊</div><div style={{fontSize:15,fontWeight:600}}>포트폴리오를 선택해주세요</div></div>):(
        <div style={{display:"flex",flexDirection:"column",gap:20,animation:"fadeIn .4s ease"}}>

          {/* 누적 수익률 */}
          <div ref={secRef.cum} style={{background:t.bgCard,borderRadius:12,padding:16,border:`1px solid ${t.border}`,scrollMarginTop:140}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:700}}>📈 누적 수익률</div>
              <div style={{display:"flex",gap:3}}><Tab active={cumUnit==="pct"} onClick={()=>setCumUnit("pct")}>% 수익률</Tab><Tab active={cumUnit==="amount"} onClick={()=>setCumUnit("amount")}>{curSym} 금액</Tab></div>
            </div>
            <ResponsiveContainer width="100%" height={360}><LineChart data={chartData} margin={{top:5,right:5,left:10,bottom:0}}><CartesianGrid stroke={t.border} strokeDasharray="3 3"/><XAxis dataKey="date" tick={{fill:t.textDim,fontSize:10}} tickLine={false} axisLine={{stroke:t.border}} interval={Math.floor(chartData.length/8)}/><YAxis tick={{fill:t.textDim,fontSize:10}} tickLine={false} axisLine={false} tickFormatter={cumUnit==="pct"?v=>`${v}%`:v=>fmtShort(v)}/><Tooltip contentStyle={ttStyle} formatter={(v,n)=>{const p=allP.find(x=>cumUnit==="pct"?n===`${x.id}_p`:n===`${x.id}_v`);return[cumUnit==="pct"?`${v}%`:fmtAmt(v),p?.name||""];}}/>{activeP.map(p=><Line key={p.id} type="monotone" dataKey={cumUnit==="pct"?`${p.id}_p`:`${p.id}_v`} stroke={p.color} strokeWidth={1.8} dot={false}/>)}</LineChart></ResponsiveContainer>
            <div style={{display:"flex",gap:12,marginTop:10,flexWrap:"wrap"}}>{activeP.map(p=><div key={p.id} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:t.textMuted}}><span style={{width:10,height:3,borderRadius:2,background:p.color}}/>{p.name} → {fmtAmt(results[p.id]?.finalVal||0)}</div>)}</div>
          </div>

          {/* 비교표 */}
          <div style={{background:t.bgCard,borderRadius:12,padding:16,border:`1px solid ${t.border}`,overflowX:"auto"}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>📋 포트폴리오 비교표</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{borderBottom:`2px solid ${t.border}`}}>{["포트폴리오","최종금액","CAGR","누적수익률","MDD","샤프","변동성","vs 기준"].map((h,i)=><th key={i} style={{padding:"8px 10px",textAlign:i===0?"left":"right",color:t.textMuted,fontWeight:600,fontSize:11,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
              <tbody>{activeP.map(p=>{const r=results[p.id];if(!r)return null;const isBm=p.id===benchmark;const diff=bmResult?Math.round((r.cagr-bmResult.cagr)*100)/100:0;return(
                <tr key={p.id} style={{borderBottom:`1px solid ${t.border}`,background:isBm?`${t.accent}08`:"transparent"}}>
                  <td style={{padding:"10px",display:"flex",alignItems:"center",gap:6}}><span style={{width:8,height:8,borderRadius:"50%",background:p.color}}/><span style={{fontWeight:600}}>{p.name}</span>{isBm&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:t.accent,color:t.bg,fontWeight:700}}>기준</span>}</td>
                  <td style={{padding:"10px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>{fmtAmt(r.finalVal)}</td>
                  <td style={{padding:"10px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:r.cagr>=0?t.accent:t.danger}}>{r.cagr>0?"+":""}{r.cagr}%</td>
                  <td style={{padding:"10px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",color:r.totalRet>=0?t.accent:t.danger}}>{r.totalRet>0?"+":""}{fmtNum(r.totalRet)}%</td>
                  <td style={{padding:"10px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",color:t.danger}}>{r.mdd}%</td>
                  <td style={{padding:"10px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace"}}>{r.sharpe}</td>
                  <td style={{padding:"10px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",color:t.warning}}>{r.vol}%</td>
                  <td style={{padding:"10px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",color:isBm?t.textDim:diff>=0?t.accent:t.danger}}>{isBm?"—":`${diff>0?"+":""}${diff}%`}</td>
                </tr>);})}</tbody>
            </table>
          </div>

          {/* MDD */}
          <div ref={secRef.mdd} style={{background:t.bgCard,borderRadius:12,padding:16,border:`1px solid ${t.border}`,scrollMarginTop:140}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>📉 최대 낙폭 (MDD)</div>
            <ResponsiveContainer width="100%" height={300}><AreaChart data={chartData} margin={{top:5,right:5,left:0,bottom:0}}><CartesianGrid stroke={t.border} strokeDasharray="3 3"/><XAxis dataKey="date" tick={{fill:t.textDim,fontSize:10}} tickLine={false} axisLine={{stroke:t.border}} interval={Math.floor(chartData.length/8)}/><YAxis tick={{fill:t.textDim,fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`}/><Tooltip contentStyle={ttStyle} formatter={v=>[`${v}%`,"MDD"]}/>{activeP.map(p=><Area key={p.id} type="monotone" dataKey={`${p.id}_d`} stroke={p.color} fill={p.color} fillOpacity={0.08} strokeWidth={1.5} dot={false}/>)}</AreaChart></ResponsiveContainer>
            <div style={{display:"flex",gap:12,marginTop:10,flexWrap:"wrap"}}>{activeP.map(p=><div key={p.id} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:t.textMuted}}><span style={{width:10,height:3,borderRadius:2,background:p.color}}/>{p.name} ({results[p.id]?.mdd}%)</div>)}</div>
          </div>

          {/* 연도별 자산 - 클릭 시 테두리/그림자 효과, 커서 없음 */}
          <div ref={secRef.yearly} style={{background:t.bgCard,borderRadius:12,padding:16,border:`1px solid ${t.border}`,scrollMarginTop:140}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>📊 연도별 자산별 수익률</div>
            <div style={{fontSize:11,color:t.textMuted,marginBottom:12}}>기준: {bmPort?.name||"없음"} · 차트 바를 클릭하면 오른쪽에 상세</div>
            {bmResult&&<div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
              <div style={{flex:"1 1 auto",minWidth:0}}>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={bmResult.yba} margin={{top:5,right:5,left:0,bottom:0}} onClick={e=>{if(e&&e.activeLabel)setSelYear(selYear===e.activeLabel?null:e.activeLabel);}}>
                    <CartesianGrid stroke={t.border} strokeDasharray="3 3"/>
                    <XAxis dataKey="year" tick={{fill:t.textDim,fontSize:10}} tickLine={false} axisLine={{stroke:t.border}} interval={2}/>
                    <YAxis tick={{fill:t.textDim,fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`}/>
                    <Tooltip contentStyle={ttStyle} cursor={false} formatter={(v,name)=>{const a=ga(name);return[`${Number(v).toFixed(1)}%`,a.name];}}/>
                    <ReferenceLine y={0} stroke={t.textDim} strokeWidth={0.5}/>
                    {bmResult.en.map(a=><Bar key={a.a} dataKey={a.a} stackId="a" fill={a.color} opacity={0.85} cursor="pointer"/>)}
                  </BarChart>
                </ResponsiveContainer>
                <div style={{display:"flex",gap:10,marginTop:8,flexWrap:"wrap"}}>{bmResult.en.map(a=><div key={a.a} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:t.textMuted}}><span style={{width:8,height:8,borderRadius:2,background:a.color}}/>{a.name} ({a.w}%)</div>)}</div>
              </div>
              {selYear&&<div style={{width:280,flexShrink:0,background:t.bgSurface,borderRadius:10,padding:14,border:`1px solid ${t.accent}30`,animation:"fadeIn .3s",maxHeight:440,overflow:"auto",boxShadow:`0 0 20px ${t.accent}15`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:14,fontWeight:700,color:t.accent}}>{selYear}년</span><button onClick={()=>setSelYear(null)} style={{background:"transparent",border:"none",color:t.textDim,cursor:"pointer",fontSize:14}}>✕</button></div>
                {bmResult.en.map(a=>{const yd=bmResult.yba.find(y=>y.year===selYear);const val=yd?(yd[a.a]||0):0;const ct=Math.round(val*(a.w/100)*100)/100;return(
                  <div key={a.a} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${t.border}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:7,height:7,borderRadius:2,background:a.color}}/><div><div style={{fontSize:11,fontWeight:600}}>{a.name}</div><div style={{fontSize:10,color:t.textDim}}>{a.w}%</div></div></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:val>=0?t.accent:t.danger}}>{val>=0?"+":""}{val.toFixed(1)}%</div><div style={{fontSize:9,color:t.textDim}}>기여 {ct>=0?"+":""}{ct}%</div></div>
                  </div>);})}
                <div style={{marginTop:10,padding:"8px 10px",borderRadius:8,background:`${t.accent}12`,border:`1px solid ${t.accent}30`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,fontWeight:700}}>연간 합계</span><span style={{fontSize:16,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:(bmResult.yba.find(y=>y.year===selYear)?._total||0)>=0?t.accent:t.danger}}>{((bmResult.yba.find(y=>y.year===selYear)?._total||0)>=0?"+":"")}{(bmResult.yba.find(y=>y.year===selYear)?._total||0).toFixed(1)}%</span></div>
              </div>}
            </div>}
          </div>

          {/* 자산 배분 */}
          <div ref={secRef.alloc} style={{background:t.bgCard,borderRadius:12,padding:16,border:`1px solid ${t.border}`,scrollMarginTop:140}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>🥧 자산 배분</div>
            <div style={{display:"grid",gridTemplateColumns:activeP.length<=2?"repeat(2,1fr)":"repeat(3,1fr)",gap:16}}>
              {activeP.map(p=>{const r=results[p.id];if(!r)return null;
              const pColor=p.color;const lastPct=r.data[r.data.length-1]?.pct||0;
              return(
                <div key={p.id} style={{background:t.bgSurface,borderRadius:10,padding:14,border:`1px solid ${t.border}`}}>
                  {/* 상단: 이름 좌측 / 기간+CAGR 우측 */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{fontSize:14,fontWeight:800,color:pColor}}>{p.name}</div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:10,color:t.textDim}}>{startD} ~ {endD}</div>
                      <div style={{fontSize:9,color:t.textDim,marginTop:1}}>CAGR <span style={{fontSize:14,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:r.cagr>=0?t.accent:t.danger}}>{r.cagr>0?"+":""}{r.cagr}%</span></div>
                    </div>
                  </div>
                  {/* 중단: 도넛 + 자산목록 (간격 좁게) */}
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
                    <div style={{position:"relative",width:110,height:110,flexShrink:0}}>
                      <ResponsiveContainer width={110} height={110}><PieChart><Pie data={r.en.map(a=>({name:a.name,value:a.w}))} cx="50%" cy="50%" innerRadius={30} outerRadius={48} dataKey="value" stroke="none" strokeWidth={0}>{r.en.map((a,i)=><Cell key={i} fill={a.color}/>)}</Pie><Tooltip contentStyle={ttStyle} formatter={(v,name)=>[`${v}%`,name]}/></PieChart></ResponsiveContainer>
                      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}><div style={{fontSize:11,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:t.text}}>{curSym} {fmtShort(r.finalVal)}</div></div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:1,flex:1,minWidth:0}}>
                      {r.en.map(a=><div key={a.a} style={{display:"flex",alignItems:"center",fontSize:11,color:t.textMuted,gap:4}}>
                        <span style={{width:5,height:5,borderRadius:"50%",background:a.color,flexShrink:0}}/>
                        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{a.name}</span>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,flexShrink:0,marginLeft:4}}>{a.w}%</span>
                      </div>)}
                    </div>
                  </div>
                  {/* 하단: 에어리어 차트 (꽉 차게) */}
                  <div style={{borderTop:`1px solid ${t.border}`,paddingTop:8}}>
                    <ResponsiveContainer width="100%" height={70}>
                      <AreaChart data={r.data.filter((_,i)=>i%3===0)} margin={{top:2,right:0,left:0,bottom:0}}>
                        <defs><linearGradient id={`ag-${p.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={pColor} stopOpacity={0.35}/><stop offset="100%" stopColor={pColor} stopOpacity={0.02}/></linearGradient></defs>
                        <Area type="monotone" dataKey="pct" stroke={pColor} strokeWidth={1.5} fill={`url(#ag-${p.id})`} dot={false}/>
                        <XAxis dataKey="date" hide={true}/>
                        <YAxis hide={true}/>
                        <Tooltip contentStyle={ttStyle} formatter={v=>[`${v}%`,"수익률"]} labelFormatter={l=>l}/>
                      </AreaChart>
                    </ResponsiveContainer>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:t.textDim,marginTop:2}}>
                      <span>{startD}</span>
                      <span style={{fontWeight:700,color:lastPct>=0?t.accent:t.danger}}>{lastPct>=0?"+":""}{fmtNum(lastPct)}%</span>
                      <span>{endD}</span>
                    </div>
                  </div>
                </div>);})}
            </div>
          </div>
        </div>)}
      </div>

      {/* 맞춤형 모달 */}
      {showModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowModal(false)}>
        <div onClick={e=>e.stopPropagation()} style={{background:t.bgCard,borderRadius:14,padding:24,width:"92%",maxWidth:560,border:`1px solid ${t.border}`,maxHeight:"85vh",overflow:"auto"}}>
          <div style={{fontSize:16,fontWeight:800,marginBottom:16}}>맞춤형 포트폴리오</div>
          <div style={{marginBottom:12}}><div style={{fontSize:11,color:t.textMuted,marginBottom:3}}>이름</div><input type="text" value={editP.name} onChange={e=>setEditP(p=>({...p,name:e.target.value}))} placeholder="내 포트폴리오" style={{width:"100%"}}/></div>
          <div style={{marginBottom:12}}><div style={{fontSize:11,color:t.textMuted,marginBottom:3}}>색상</div><div style={{display:"flex",gap:5}}>{["#D85A30","#BA7517","#EC4899","#8B5CF6","#06B6D4","#EF4444","#10B981"].map(c=><div key={c} onClick={()=>setEditP(p=>({...p,color:c}))} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",border:editP.color===c?`2px solid ${t.text}`:"2px solid transparent"}}/>)}</div></div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:t.textMuted,marginBottom:6}}>자산 구성</div>
            {editP.assets.map((asset,i)=>{const info=ga(asset.a);return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,padding:"6px 8px",borderRadius:8,background:t.bgSurface,border:`1px solid ${t.border}`}}>
                <span style={{width:8,height:8,borderRadius:2,background:info.color}}/><span style={{flex:1,fontSize:12,fontWeight:500}}>{info.name}</span>
                <span style={{fontSize:10,color:t.textDim,padding:"1px 5px",borderRadius:3,background:`${t.accent}12`}}>{info.type}</span>
                <input type="number" value={asset.w} onChange={e=>{const a=[...editP.assets];a[i]={...a[i],w:+e.target.value};setEditP(p=>({...p,assets:a}));}} style={{width:50,fontSize:12,textAlign:"right"}}/><span style={{fontSize:11,color:t.textDim}}>%</span>
                <button onClick={()=>setEditP(p=>({...p,assets:p.assets.filter((_,j)=>j!==i)}))} style={{background:"transparent",border:"none",color:t.danger,cursor:"pointer",fontSize:13}}>✕</button>
              </div>);})}
            {picker?<div style={{background:t.bgSurface,border:`1px solid ${t.border}`,borderRadius:10,padding:12,marginTop:6,maxHeight:250,overflow:"auto"}}>
              {["주식","채권","대체","부동산","현금"].map(cat=><div key={cat} style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:t.textDim,marginBottom:4}}>{cat}</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{ASSETS.filter(a=>a.cat===cat).map(a=>{const al=editP.assets.some(x=>x.a===a.id);return<div key={a.id} onClick={()=>!al&&addA(a.id)} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 8px",borderRadius:6,border:`1px solid ${al?t.accent:t.border}`,background:al?`${t.accent}12`:"transparent",cursor:al?"default":"pointer",opacity:al?.5:1,fontSize:11,color:al?t.accent:t.textMuted}}><span style={{width:6,height:6,borderRadius:"50%",background:a.color}}/>{a.name}</div>;})}</div></div>)}
              <button onClick={()=>setPicker(false)} style={{width:"100%",marginTop:4,padding:"5px",borderRadius:6,border:`1px solid ${t.border}`,background:"transparent",color:t.textMuted,fontSize:11,cursor:"pointer"}}>닫기</button>
            </div>:<button onClick={()=>setPicker(true)} style={{width:"100%",marginTop:6,padding:"7px",borderRadius:8,border:`1px dashed ${t.border}`,background:"transparent",color:t.textMuted,fontSize:12,cursor:"pointer"}}>+ 자산 추가</button>}
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><span style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:editP.assets.reduce((s,a)=>s+a.w,0)===100?t.accent:t.danger}}>합계: {editP.assets.reduce((s,a)=>s+a.w,0)}%{editP.assets.reduce((s,a)=>s+a.w,0)!==100&&" (100% 필요)"}</span></div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
            <button onClick={()=>{setShowModal(false);setPicker(false);}} style={{background:"transparent",border:`1px solid ${t.border}`,borderRadius:7,padding:"7px 18px",color:t.textMuted,fontSize:12,cursor:"pointer"}}>취소</button>
            <button onClick={addC} disabled={!editP.name||editP.assets.reduce((s,a)=>s+a.w,0)!==100} style={{background:t.accent,border:"none",borderRadius:7,padding:"7px 18px",color:dark?"#0A0E17":"#fff",fontSize:12,fontWeight:700,cursor:"pointer",opacity:(!editP.name||editP.assets.reduce((s,a)=>s+a.w,0)!==100)?.4:1}}>추가</button>
          </div>
        </div>
      </div>}

      <footer style={{maxWidth:1400,margin:"0 auto",padding:"20px",borderTop:`1px solid ${t.border}`,textAlign:"center"}}><div style={{fontSize:11,color:t.textDim}}>⚠️ 시뮬레이션 데이터 기반. 투자 조언이 아닙니다.</div><div style={{fontSize:10,color:t.textDim,marginTop:3}}>© 2026 PortfolioLab</div></footer>
    </div>
  );
}