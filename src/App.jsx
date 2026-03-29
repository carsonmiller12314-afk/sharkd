import { useState, useEffect, useRef } from "react";

// ─── FIREBASE ────────────────────────────────────────────────────────────────
// Firebase is loaded via CDN scripts in index.html
// We access it through the global firebase object
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBXPiIW7VaJBeQxMSYkLWEEkFttmbMOnGU",
  authDomain: "sharkd-eafd7.firebaseapp.com",
  projectId: "sharkd-eafd7",
  storageBucket: "sharkd-eafd7.firebasestorage.app",
  messagingSenderId: "689227077822",
  appId: "1:689227077822:web:6212012a2b555c6e3566ef",
};

// Firebase helpers — safe to call even before SDK loads
function getFirebase(){
  if(typeof window==="undefined")return null;
  try{
    if(!window._fbApp){
      const {initializeApp}=window.firebase_app||{};
      if(initializeApp) window._fbApp=initializeApp(FIREBASE_CONFIG);
    }
    return window._fbApp;
  }catch(e){return null;}
}

async function signInWithGoogle(){
  try{
    const app=getFirebase();
    if(!app)throw new Error("Firebase not loaded");
    const auth=window.firebase_auth.getAuth(app);
    const provider=new window.firebase_auth.GoogleAuthProvider();
    const result=await window.firebase_auth.signInWithPopup(auth,provider);
    return result.user;
  }catch(e){
    console.error("Google sign-in error:",e);
    return null;
  }
}

async function signOut(){
  try{
    const app=getFirebase();
    if(!app)return;
    const auth=window.firebase_auth.getAuth(app);
    await window.firebase_auth.signOut(auth);
  }catch(e){console.error(e);}
}

async function saveUserProfile(uid,data){
  try{
    const app=getFirebase();
    if(!app)return;
    const db=window.firebase_firestore.getFirestore(app);
    await window.firebase_firestore.setDoc(
      window.firebase_firestore.doc(db,"users",uid),
      {...data,updatedAt:new Date().toISOString()},
      {merge:true}
    );
  }catch(e){console.error("saveUserProfile:",e);}
}

async function loadUserProfile(uid){
  try{
    const app=getFirebase();
    if(!app)return null;
    const db=window.firebase_firestore.getFirestore(app);
    const snap=await window.firebase_firestore.getDoc(
      window.firebase_firestore.doc(db,"users",uid)
    );
    return snap.exists()?snap.data():null;
  }catch(e){console.error("loadUserProfile:",e);return null;}
}

async function checkUsernameAvailable(username){
  try{
    const app=getFirebase();
    if(!app)return true; // assume available if Firebase not loaded
    const db=window.firebase_firestore.getFirestore(app);
    const q=window.firebase_firestore.query(
      window.firebase_firestore.collection(db,"users"),
      window.firebase_firestore.where("username","==",username.toLowerCase())
    );
    const snap=await window.firebase_firestore.getDocs(q);
    return snap.empty;
  }catch(e){console.error(e);return true;}
}

async function saveGame(uid,game){
  try{
    const app=getFirebase();
    if(!app)return;
    const db=window.firebase_firestore.getFirestore(app);
    await window.firebase_firestore.setDoc(
      window.firebase_firestore.doc(db,"users",uid,"games",String(game.id)),
      game
    );
  }catch(e){console.error("saveGame:",e);}
}

async function loadGames(uid){
  try{
    const app=getFirebase();
    if(!app)return[];
    const db=window.firebase_firestore.getFirestore(app);
    const snap=await window.firebase_firestore.getDocs(
      window.firebase_firestore.collection(db,"users",uid,"games")
    );
    return snap.docs.map(d=>d.data()).sort((a,b)=>b.id-a.id);
  }catch(e){console.error("loadGames:",e);return[];}
}

// ─── FIREBASE: DEBTS, GROUPS, SETTLED ────────────────────────────────────────
async function saveDebt(uid,debt){
  try{
    const app=getFirebase();if(!app)return;
    const db=window.firebase_firestore.getFirestore(app);
    await window.firebase_firestore.setDoc(window.firebase_firestore.doc(db,"users",uid,"debts",String(debt.id)),debt);
  }catch(e){console.error("saveDebt:",e);}
}
async function deleteDebt(uid,debtId){
  try{
    const app=getFirebase();if(!app)return;
    const db=window.firebase_firestore.getFirestore(app);
    await window.firebase_firestore.deleteDoc(window.firebase_firestore.doc(db,"users",uid,"debts",String(debtId)));
  }catch(e){console.error("deleteDebt:",e);}
}
async function loadDebts(uid){
  try{
    const app=getFirebase();if(!app)return[];
    const db=window.firebase_firestore.getFirestore(app);
    const snap=await window.firebase_firestore.getDocs(window.firebase_firestore.collection(db,"users",uid,"debts"));
    return snap.docs.map(d=>d.data());
  }catch(e){console.error("loadDebts:",e);return[];}
}
async function saveSettled(uid,item){
  try{
    const app=getFirebase();if(!app)return;
    const db=window.firebase_firestore.getFirestore(app);
    await window.firebase_firestore.setDoc(window.firebase_firestore.doc(db,"users",uid,"settled",String(item.id)),item);
  }catch(e){console.error("saveSettled:",e);}
}
async function loadSettled(uid){
  try{
    const app=getFirebase();if(!app)return[];
    const db=window.firebase_firestore.getFirestore(app);
    const snap=await window.firebase_firestore.getDocs(window.firebase_firestore.collection(db,"users",uid,"settled"));
    return snap.docs.map(d=>d.data()).sort((a,b)=>b.id-a.id);
  }catch(e){console.error("loadSettled:",e);return[];}
}
async function saveGroup(uid,group){
  try{
    const app=getFirebase();if(!app)return;
    const db=window.firebase_firestore.getFirestore(app);
    await window.firebase_firestore.setDoc(window.firebase_firestore.doc(db,"users",uid,"groups",String(group.id)),group);
  }catch(e){console.error("saveGroup:",e);}
}
async function loadGroups(uid){
  try{
    const app=getFirebase();if(!app)return[];
    const db=window.firebase_firestore.getFirestore(app);
    const snap=await window.firebase_firestore.getDocs(window.firebase_firestore.collection(db,"users",uid,"groups"));
    return snap.docs.map(d=>d.data());
  }catch(e){console.error("loadGroups:",e);return[];}
}

// ─── FIREBASE: FRIENDS & CHATS ───────────────────────────────────────────────
async function saveFriend(uid,friend){
  try{
    const app=getFirebase();if(!app)return;
    const db=window.firebase_firestore.getFirestore(app);
    await window.firebase_firestore.setDoc(
      window.firebase_firestore.doc(db,"users",uid,"friends",String(friend.id)),
      friend
    );
  }catch(e){console.error("saveFriend:",e);}
}
async function loadFriends(uid){
  try{
    const app=getFirebase();if(!app)return[];
    const db=window.firebase_firestore.getFirestore(app);
    const snap=await window.firebase_firestore.getDocs(
      window.firebase_firestore.collection(db,"users",uid,"friends")
    );
    return snap.docs.map(d=>d.data());
  }catch(e){console.error("loadFriends:",e);return[];}
}
async function removeFriend(uid,friendId){
  try{
    const app=getFirebase();if(!app)return;
    const db=window.firebase_firestore.getFirestore(app);
    await window.firebase_firestore.deleteDoc(
      window.firebase_firestore.doc(db,"users",uid,"friends",String(friendId))
    );
  }catch(e){console.error("removeFriend:",e);}
}
async function sendFriendRequest(fromUid,fromUsername,fromFullName,toUid){
  try{
    const app=getFirebase();if(!app)return;
    const db=window.firebase_firestore.getFirestore(app);
    const reqId=fromUid+"_"+toUid;
    await window.firebase_firestore.setDoc(
      window.firebase_firestore.doc(db,"users",toUid,"friendRequests",reqId),
      {fromUid,fromUsername,fromFullName,toUid,status:"pending",sentAt:new Date().toISOString(),reqId}
    );
  }catch(e){console.error("sendFriendRequest:",e);}
}
async function loadFriendRequests(uid){
  try{
    const app=getFirebase();if(!app)return[];
    const db=window.firebase_firestore.getFirestore(app);
    const snap=await window.firebase_firestore.getDocs(
      window.firebase_firestore.collection(db,"users",uid,"friendRequests")
    );
    return snap.docs.map(d=>d.data()).filter(r=>r.status==="pending");
  }catch(e){console.error("loadFriendRequests:",e);return[];}
}
async function acceptFriendRequest(myUid,myUsername,myFullName,req,myGames){
  try{
    const app=getFirebase();if(!app)return;
    const db=window.firebase_firestore.getFirestore(app);
    const colors=["#a78bfa","#34d399","#fb923c","#f472b6","#38bdf8","#facc15"];
    const col=colors[Math.floor(Math.random()*colors.length)];
    const friendForMe={id:req.fromUid,name:req.fromFullName||req.fromUsername,username:req.fromUsername,avatar:req.fromUsername?.[0]?.toUpperCase()||"?",color:col,allTime:0,venmo:""};
    const friendForThem={id:myUid,name:myFullName||myUsername,username:myUsername,avatar:myUsername?.[0]?.toUpperCase()||"?",color:col,allTime:0,venmo:""};
    await saveFriend(myUid,friendForMe);
    await saveFriend(req.fromUid,friendForThem);
    await window.firebase_firestore.deleteDoc(
      window.firebase_firestore.doc(db,"users",myUid,"friendRequests",req.reqId)
    );
    return friendForMe;
  }catch(e){console.error("acceptFriendRequest:",e);return null;}
}
async function saveChat(uid,friendId,msg){
  try{
    const app=getFirebase();if(!app)return;
    const db=window.firebase_firestore.getFirestore(app);
    const chatId=[uid,friendId].sort().join("_");
    await window.firebase_firestore.addDoc(
      window.firebase_firestore.collection(db,"chats",chatId,"messages"),
      {...msg,ts:new Date().toISOString()}
    );
  }catch(e){console.error("saveChat:",e);}
}
async function loadChat(uid,friendId){
  try{
    const app=getFirebase();if(!app)return[];
    const db=window.firebase_firestore.getFirestore(app);
    const chatId=[uid,friendId].sort().join("_");
    const snap=await window.firebase_firestore.getDocs(
      window.firebase_firestore.query(
        window.firebase_firestore.collection(db,"chats",chatId,"messages"),
        window.firebase_firestore.orderBy("ts","asc")
      )
    );
    return snap.docs.map(d=>d.data());
  }catch(e){console.error("loadChat:",e);return[];}
}

// ─── SCREENS ──────────────────────────────────────────────────────────────────
const S = {
  LANDING:"landing", LOGIN:"login",
  HOME:"home", NEW_GAME:"new_game", SETTLEMENTS:"settlements",
  HISTORY:"history", STATS:"stats", RANK:"rank",
  FRIENDS:"friends", FRIEND_PROFILE:"friend_profile", ADD_FRIENDS:"add_friends",
  LEADERBOARD:"leaderboard", WORLD_PROFILE:"world_profile",
  GROUPS:"groups", GROUP_DETAIL:"group_detail",
  RIVALS:"rivals", FEED:"feed",
  SETTINGS:"settings", NOTIFICATIONS:"notifications",
  GAME_DETAIL:"game_detail", EDIT_GAME:"edit_game",
  CONFIRM_PAY:"confirm_pay",
};

// ─── THEME ────────────────────────────────────────────────────────────────────
const Gold="#c9a84c", GoldDim="#8b6914", Up="#00e096", Down="#ff4d6d";
const BG="#080812", Card="#0f0f1d", Border="#1c1c2e", Sidebar="#0a0a18";

// ─── RANK SYSTEM ─────────────────────────────────────────────────────────────
const RANKS=[
  {tier:"Noob",        min:0,  max:1.49,emoji:"🐣",color:"#777",   desc:"Just learning the ropes."},
  {tier:"Novice",      min:1.5,max:2.99,emoji:"🃏",color:"#60a5fa",desc:"Getting the hang of it."},
  {tier:"Intermediate",min:3,  max:4.49,emoji:"🎯",color:"#34d399",desc:"Solid fundamentals."},
  {tier:"Advanced",    min:4.5,max:5.99,emoji:"🔥",color:"#f97316",desc:"Consistently profitable."},
  {tier:"Expert",      min:6,  max:7.49,emoji:"⚡",color:"#a78bfa",desc:"Top of most groups."},
  {tier:"Pro",         min:7.5,max:8.99,emoji:"💎",color:"#38bdf8",desc:"Elite level."},
  {tier:"Shark",       min:9,  max:10,  emoji:"🦈",color:"#c9a84c",desc:"Apex predator."},
];
const METRICS=[
  {key:"winRate",      label:"Win Rate",     icon:"🎯",weight:0.30,fmt:v=>`${Math.round(v*10)}%`},
  {key:"profitPerGame",label:"Profit/Game",  icon:"💰",weight:0.25,fmt:v=>`$${Math.round(v*8)}`},
  {key:"roi",          label:"ROI",          icon:"📈",weight:0.20,fmt:v=>`${Math.round(v*10)}%`},
  {key:"consistency",  label:"Consistency",  icon:"📊",weight:0.15,fmt:v=>`${v.toFixed(1)}/10`},
  {key:"bigWinRate",   label:"Big Win Rate", icon:"🔥",weight:0.10,fmt:v=>`${Math.round(v*10)}%`},
];
function longevityMultiplier(g){if(g>=50)return 1;if(g>=30)return 0.90;if(g>=20)return 0.78;if(g>=10)return 0.62;if(g>=5)return 0.45;return 0.25;}
function deriveStats(games){
  if(!games||!games.length)return{winRate:0,profitPerGame:0,roi:0,consistency:0,bigWinRate:0,gamesPlayed:0};
  const n=games.length,wins=games.filter(g=>g.net>0).length;
  const totalNet=games.reduce((s,g)=>s+g.net,0),totalBuyin=games.reduce((s,g)=>s+(g.buyin||0),0);
  const bigWins=games.filter(g=>g.cashout>=(g.buyin||0)*2).length;
  const avg=totalNet/n,variance=games.reduce((s,g)=>s+Math.pow(g.net-avg,2),0)/n;
  return{winRate:(wins/n)*10,profitPerGame:Math.min(10,Math.max(0,(totalNet/n+50)/20)),roi:totalBuyin>0?Math.min(10,Math.max(0,(totalNet/totalBuyin)*10+5)):0,consistency:Math.min(10,Math.max(0,1-Math.sqrt(variance)/200)*10),bigWinRate:(bigWins/n)*10,gamesPlayed:n};
}
function calcScore(stats){let ws=0,wt=0;METRICS.forEach(m=>{ws+=(stats[m.key]||0)*m.weight;wt+=m.weight;});return+(Math.min(10,Math.max(0,ws/wt))*longevityMultiplier(stats.gamesPlayed||0)).toFixed(2);}
function getRank(score){return RANKS.slice().reverse().find(r=>score>=r.min)||RANKS[0];}

// ─── MATH UTILS ──────────────────────────────────────────────────────────────
function parseCents(str){const s=(str||"").replace(/[^0-9.]/g,"");if(!s)return 0;const p=s.split(".");return parseInt(p[0]||"0",10)*100+parseInt(((p[1]||"")+"00").slice(0,2),10);}
function fmtCents(c){const sign=c<0?"-":"",abs=Math.abs(c),d=Math.floor(abs/100),cents=abs%100;return cents===0?`${sign}$${d}`:`${sign}$${d}.${String(cents).padStart(2,"0")}`;}
function minimizeDebts(nets){
  let cr=nets.filter(n=>n.netCents>0).map(n=>({...n})),de=nets.filter(n=>n.netCents<0).map(n=>({...n}));
  const txns=[];let ci=0,di=0;
  while(ci<cr.length&&di<de.length){const c=cr[ci],d=de[di],amt=Math.min(c.netCents,-d.netCents);txns.push({from:d.name,to:c.name,amountCents:amt});c.netCents-=amt;d.netCents+=amt;if(c.netCents===0)ci++;if(d.netCents===0)di++;}
  return txns;
}
function parseGameDate(dateStr){
  if(!dateStr)return new Date();
  // Try ISO format first (2026-03-27)
  if(/^\d{4}-\d{2}-\d{2}/.test(dateStr))return new Date(dateStr+"T12:00:00");
  // Try "Mar 27" or "Mar 27, 2026" format
  const withYear=dateStr.includes(",")?dateStr:dateStr+", "+new Date().getFullYear();
  const d=new Date(withYear);
  return isNaN(d)?new Date():d;
}
function buildChartFromGames(games,period){
  const now=new Date();
  const days={"1W":7,"1M":30,"3M":90,"1Y":365,"ALL":9999}[period]||30;
  const cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-days);
  const parsed=games.map(g=>({...g,ts:parseGameDate(g.date)})).filter(g=>!isNaN(g.ts)&&g.ts>=cutoff).sort((a,b)=>a.ts-b.ts);
  if(!parsed.length)return[{label:"",value:0,date:cutoff}];
  let running=0;
  const pts=parsed.map(g=>{running+=g.net;return{label:g.ts.toLocaleDateString("en",{month:"short",day:"numeric"}),value:running,date:g.ts};});
  return[{label:"",value:0,date:cutoff},...pts];
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Btn({label,onClick,color=Gold,size="md",outline=false}){
  const pad=size==="lg"?"16px 32px":size==="sm"?"8px 16px":"12px 24px";
  const fs=size==="lg"?17:size==="sm"?12:14;
  return(
    <div onClick={onClick} style={{
      background:outline?"transparent":`linear-gradient(135deg,${color},${color}bb)`,
      border:`1.5px solid ${color}`,borderRadius:12,padding:pad,textAlign:"center",
      color:outline?color:color===Gold?BG:"#fff",fontWeight:"bold",fontSize:fs,
      cursor:"pointer",transition:"all .2s",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,
    }}>{label}</div>
  );
}
function Tag({text,color}){return <div style={{background:`${color}22`,border:`1px solid ${color}44`,borderRadius:8,padding:"2px 10px",color,fontSize:12,fontWeight:"bold",display:"inline-flex",alignItems:"center"}}>{text}</div>;}
function SectionLabel({text}){return <div style={{color:"#555",fontSize:11,letterSpacing:3,textTransform:"uppercase",marginBottom:12,fontFamily:"monospace"}}>{text}</div>;}
function Avatar({char,color,size=40,fontSize=16}){
  const isEmoji=char&&(char.length>1||char.codePointAt(0)>127);
  return <div style={{width:size,height:size,borderRadius:"50%",background:isEmoji?"#1a1a2e":`${color}22`,border:`2px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",color:isEmoji?"#fff":color,fontWeight:"bold",fontSize,flexShrink:0}}>{char||"?"}</div>;
}
function Card2({children,style={}}){return <div style={{background:Card,border:`1px solid ${Border}`,borderRadius:16,padding:"20px",...style}}>{children}</div>;}
function StatBox({label,value,color="#fff",sub}){
  return(
    <div style={{background:Card,border:`1px solid ${Border}`,borderRadius:14,padding:"16px 20px"}}>
      <div style={{color:"#555",fontSize:12,marginBottom:6}}>{label}</div>
      <div style={{color,fontSize:28,fontWeight:"bold",fontFamily:"monospace"}}>{value}</div>
      {sub&&<div style={{color:"#444",fontSize:11,marginTop:4}}>{sub}</div>}
    </div>
  );
}

// ─── STOCK CHART ─────────────────────────────────────────────────────────────
function StockChart({data,color,width=600,height=200}){
  if(!data||data.length<2)return <div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:"#333",fontSize:13}}>Log games to see your chart</div>;
  const vals=data.map(d=>d.value),minV=Math.min(...vals),maxV=Math.max(...vals),range=maxV-minV||1;
  const pad={top:16,bottom:28,left:8,right:8},W=width-pad.left-pad.right,H=height-pad.top-pad.bottom;
  const x=i=>pad.left+(i/(data.length-1))*W,y=v=>pad.top+H-((v-minV)/range)*H;
  const linePath=data.map((d,i)=>`${i===0?"M":"L"}${x(i)},${y(d.value)}`).join(" ");
  const areaPath=linePath+` L${x(data.length-1)},${height-pad.bottom} L${x(0)},${height-pad.bottom} Z`;
  const gid=`g${Math.abs(color.split("").reduce((a,c)=>a+c.charCodeAt(0),0))}`;
  return(
    <svg width={width} height={height} style={{display:"block"}}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor={color} stopOpacity="0.01"/></linearGradient>
      </defs>
      {minV<0&&maxV>0&&<line x1={pad.left} y1={y(0)} x2={width-pad.right} y2={y(0)} stroke="#ffffff15" strokeWidth="1" strokeDasharray="4 4"/>}
      <path d={areaPath} fill={`url(#${gid})`}/>
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={x(data.length-1)} cy={y(data[data.length-1].value)} r="4" fill={color} stroke="#0d0d19" strokeWidth="2"/>
      {data.filter((_,i)=>i===0||i===data.length-1||i%Math.ceil(data.length/6)===0).map((d,i)=>d.label?<text key={i} x={x(data.indexOf(d))} y={height-4} textAnchor="middle" fontSize="10" fill="#383848" fontFamily="monospace">{d.label}</text>:null)}
    </svg>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function useIsMobile(){
  const [mobile,setMobile]=useState(false);
  useEffect(()=>{
    const check=()=>setMobile(window.innerWidth<768);
    check();
    window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[]);
  return mobile;
}

function SidebarNav({screen,nav,profile,debts,notifs,myGames,mobileOpen,setMobileOpen}){
  const unread=notifs.filter(n=>!n.read).length;
  const pending=debts.filter(d=>d.from==="You"||d.to==="You").length;
  const myStats=deriveStats(myGames),myScore=calcScore(myStats),myRank=getRank(myScore);
  const allTime=myGames.reduce((s,g)=>s+g.net,0);
  const isMobile=useIsMobile();

  const navItems=[
    {s:S.HOME,        icon:"🏠",label:"Home"},
    {s:S.NEW_GAME,    icon:"🃏",label:"New Game"},
    {s:S.SETTLEMENTS, icon:"⚡",label:"Settle Up",badge:pending},
    {s:S.HISTORY,     icon:"📋",label:"History"},
    {s:S.STATS,       icon:"📈",label:"My Stats"},
    {s:S.RANK,        icon:"🦈",label:"Rank"},
    {s:S.FRIENDS,     icon:"👥",label:"Friends"},
    {s:S.LEADERBOARD, icon:"🏆",label:"Leaderboard"},
    {s:S.GROUPS,      icon:"🎯",label:"Groups"},
    {s:S.RIVALS,      icon:"⚔️",label:"Rivals"},
    {s:S.FEED,        icon:"📡",label:"Feed"},
  ];

  const doNav=s=>{nav(s);if(isMobile)setMobileOpen(false);};

  const sidebarContent=(
    <div style={{width:240,background:Sidebar,borderRight:`1px solid ${Border}`,display:"flex",flexDirection:"column",height:"100vh"}}>
      {/* Logo */}
      <div style={{padding:"22px 20px 18px",borderBottom:`1px solid ${Border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:26}}>🦈</div>
          <div>
            <div style={{color:Gold,fontWeight:"bold",fontSize:19,letterSpacing:1}}>Sharkd</div>
            <div style={{color:"#444",fontSize:10,fontFamily:"monospace"}}>poker tracker</div>
          </div>
        </div>
        {isMobile&&<div onClick={()=>setMobileOpen(false)} style={{color:"#555",fontSize:22,cursor:"pointer",lineHeight:1}}>×</div>}
      </div>

      {/* Nav items */}
      <div style={{flex:1,overflowY:"auto",padding:"10px 0"}}>
        {navItems.map(item=>{
          const active=screen===item.s;
          return(
            <div key={item.s} onClick={()=>doNav(item.s)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 20px",cursor:"pointer",background:active?`${Gold}15`:"transparent",borderLeft:active?`3px solid ${Gold}`:"3px solid transparent",transition:"all .15s"}}>
              <span style={{fontSize:17,opacity:active?1:0.45}}>{item.icon}</span>
              <span style={{color:active?Gold:"#666",fontWeight:active?"bold":"normal",fontSize:14}}>{item.label}</span>
              {item.badge>0&&<div style={{marginLeft:"auto",background:Down,borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:"bold",color:"#fff"}}>{item.badge}</div>}
            </div>
          );
        })}
      </div>

      {/* Bottom — rank + profile */}
      <div style={{borderTop:`1px solid ${Border}`,padding:"14px 16px"}}>
        {/* Rank strip */}
        <div onClick={()=>doNav(S.RANK)} style={{background:`${myRank.color}12`,border:`1px solid ${myRank.color}33`,borderRadius:10,padding:"10px 12px",marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>{myRank.emoji}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:myRank.color,fontWeight:"bold",fontSize:13}}>{myRank.tier}</div>
            <div style={{color:myRank.color,fontSize:12,fontFamily:"monospace",opacity:.7}}>{myScore.toFixed(1)}/10</div>
          </div>
          <div style={{color:allTime>=0?Up:Down,fontWeight:"bold",fontSize:13,fontFamily:"monospace"}}>{allTime>=0?"+":""}${allTime}</div>
        </div>
        {/* Notifications */}
        <div onClick={()=>doNav(S.NOTIFICATIONS)} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 4px",cursor:"pointer",marginBottom:6}}>
          <span style={{fontSize:17,opacity:0.45}}>🔔</span>
          <span style={{color:"#666",fontSize:13}}>Notifications</span>
          {unread>0&&<div style={{marginLeft:"auto",background:Down,borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:"bold",color:"#fff"}}>{unread}</div>}
        </div>
        {/* Profile */}
        <div onClick={()=>doNav(S.SETTINGS)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"7px 4px"}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:`${Gold}22`,border:`2px solid ${Gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:Gold,fontWeight:"bold",flexShrink:0}}>{profile.username?.[0]?.toUpperCase()||"?"}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:"#fff",fontWeight:"bold",fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>@{profile.username}</div>
            <div style={{color:"#555",fontSize:11}}>{profile.fullName||""}</div>
          </div>
          <span style={{color:"#444",fontSize:12}}>⚙️</span>
        </div>
      </div>
    </div>
  );

  if(isMobile){
    return(
      <>
        {/* Mobile top bar */}
        <div style={{position:"fixed",top:0,left:0,right:0,height:56,background:Sidebar,borderBottom:`1px solid ${Border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",zIndex:200}}>
          <div style={{display:"flex",alignItems:"center",gap:8}} onClick={()=>doNav(S.HOME)}>
            <span style={{fontSize:22}}>🦈</span>
            <span style={{color:Gold,fontWeight:"bold",fontSize:17}}>Sharkd</span>
          </div>
          <div onClick={()=>setMobileOpen(true)} style={{color:"#888",fontSize:24,cursor:"pointer",lineHeight:1}}>☰</div>
        </div>
        {/* Overlay */}
        {mobileOpen&&(
          <>
            <div onClick={()=>setMobileOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:300}}/>
            <div style={{position:"fixed",top:0,left:0,bottom:0,zIndex:301}}>{sidebarContent}</div>
          </>
        )}
      </>
    );
  }

  return <div style={{position:"fixed",left:0,top:0,bottom:0,zIndex:100}}>{sidebarContent}</div>;
}

// ─── MAIN CONTENT WRAPPER ────────────────────────────────────────────────────
function MainContent({children,isMobile}){
  return(
    <div style={{marginLeft:isMobile?0:240,minHeight:"100vh",background:BG,padding:isMobile?"80px 20px 32px":"32px 40px",boxSizing:"border-box"}}>
      {children}
    </div>
  );
}
function PageHeader({title,subtitle,action}){
  const isMobile=useIsMobile();
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:isMobile?20:28,flexWrap:"wrap",gap:10}}>
      <div style={{minWidth:0,flex:1}}>
        <div style={{color:Gold,fontSize:11,letterSpacing:3,textTransform:"uppercase",fontFamily:"monospace",marginBottom:4}}>Sharkd</div>
        <div style={{color:"#fff",fontSize:isMobile?20:28,fontWeight:"bold",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{title}</div>
        {subtitle&&<div style={{color:"#555",fontSize:13,marginTop:4}}>{subtitle}</div>}
      </div>
      {action&&<div style={{flexShrink:0}}>{action}</div>}
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({onLogin}){
  return(
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Georgia','Times New Roman',serif"}}>
      {/* Nav */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 24px",borderBottom:`1px solid ${Border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:24}}>🦈</span>
          <span style={{color:Gold,fontWeight:"bold",fontSize:20,letterSpacing:1}}>Sharkd</span>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div onClick={onLogin} style={{color:"#888",fontSize:13,cursor:"pointer"}}>Sign in</div>
          <Btn label="Get Started" onClick={onLogin} size="sm"/>
        </div>
      </div>

      {/* Hero */}
      <div style={{textAlign:"center",padding:"60px 24px 48px",maxWidth:800,margin:"0 auto"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${Gold}18`,border:`1px solid ${Gold}33`,borderRadius:20,padding:"6px 16px",marginBottom:20}}>
          <span style={{fontSize:13}}>🦈</span>
          <span style={{color:Gold,fontSize:12,fontWeight:"bold"}}>Track every game. Settle every debt.</span>
        </div>
        <h1 style={{color:"#fff",fontSize:"clamp(32px,8vw,64px)",fontWeight:"bold",lineHeight:1.15,margin:"0 0 16px"}}>
          Home poker,<br/><span style={{color:Gold}}>made simple.</span>
        </h1>
        <p style={{color:"#666",fontSize:"clamp(14px,4vw,20px)",lineHeight:1.7,marginBottom:32,padding:"0 8px"}}>
          Log games, settle debts, track your stats, and climb the ranks.
        </p>
        <div style={{display:"flex",gap:16,justifyContent:"center",alignItems:"center"}}>
          <div onClick={onLogin} style={{
            display:"flex",alignItems:"center",gap:12,background:"#fff",borderRadius:12,
            padding:"14px 24px",cursor:"pointer",fontSize:15,fontWeight:"bold",color:"#111",
            boxShadow:"0 4px 20px rgba(0,0,0,.3)",transition:"all .2s",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </div>
        </div>
        <div style={{color:"#444",fontSize:12,marginTop:16}}>Free forever · No credit card needed</div>
      </div>

      {/* Features */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,padding:"0 20px 60px",maxWidth:1100,margin:"0 auto"}}>
        {[
          {icon:"🃏",title:"Log Any Game",       body:"Enter buy-ins and cashouts. We settle who owes who instantly."},
          {icon:"⚡",title:"Settle Debts",        body:"Send payment requests. Everyone confirms. Done."},
          {icon:"🦈",title:"Earn Your Rank",      body:"Climb from Noob to Shark based on your real stats."},
          {icon:"📈",title:"Track Your Stats",    body:"Profit chart, win rate, best games, and more."},
          {icon:"👥",title:"Group Up",            body:"Separate groups for each of your regular crews."},
          {icon:"⚔️",title:"Rivals",              body:"Head-to-head records against every friend."},
        ].map((f,i)=>(
          <div key={i} style={{background:Card,border:`1px solid ${Border}`,borderRadius:16,padding:"24px"}}>
            <div style={{fontSize:32,marginBottom:12}}>{f.icon}</div>
            <div style={{color:"#fff",fontWeight:"bold",fontSize:16,marginBottom:8}}>{f.title}</div>
            <div style={{color:"#555",fontSize:14,lineHeight:1.6}}>{f.body}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{textAlign:"center",padding:"48px 24px",borderTop:`1px solid ${Border}`}}>
        <div style={{color:"#fff",fontSize:32,fontWeight:"bold",marginBottom:16}}>Ready to track your game?</div>
        <div style={{color:"#555",fontSize:16,marginBottom:28}}>Join for free. No credit card required.</div>
        <div onClick={onLogin} style={{display:"inline-flex",alignItems:"center",gap:12,background:"#fff",borderRadius:12,padding:"14px 28px",cursor:"pointer",fontSize:16,fontWeight:"bold",color:"#111"}}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Get Started Free
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN / SIGNUP ───────────────────────────────────────────────────────────
function LoginPage({onLogin}){
  const [step,setStep]=useState("google");
  const [googleUser,setGoogleUser]=useState(null);
  const [firstName,setFirstName]=useState("");
  const [lastName,setLastName]=useState("");
  const [dob,setDob]=useState("");
  const [venmo,setVenmo]=useState("");
  const [username,setUsername]=useState("");
  const [usernameFocus,setUsernameFocus]=useState(false);
  const [usernameStatus,setUsernameStatus]=useState(null);
  const [checking,setChecking]=useState(false);
  const [signingIn,setSigningIn]=useState(false);
  const [error,setError]=useState("");

  const handleGoogleSignIn=async()=>{
    setSigningIn(true);setError("");
    try{
      const user=await signInWithGoogle();
      if(user){
        const existing=await loadUserProfile(user.uid);
        if(existing&&existing.username){
          onLogin(existing.fullName||existing.username,existing.venmo||"",existing.username,existing.dob||"",user.uid,user);
          return;
        }
        const nameParts=(user.displayName||"").split(" ");
        setFirstName(nameParts[0]||"");
        setLastName(nameParts.slice(1).join(" ")||"");
        setGoogleUser(user);
        setStep("profile");
      }else{setError("Sign-in was cancelled. Please try again.");}
    }catch(e){setError("Sign-in failed. Please try again.");}
    setSigningIn(false);
  };

  const checkUsername=async val=>{
    const clean=val.toLowerCase().replace(/[^a-z0-9_]/g,"");
    setUsername(clean);
    if(clean.length<3){setUsernameStatus(null);return;}
    setChecking(true);
    const available=await checkUsernameAvailable(clean);
    setUsernameStatus(available?"available":"taken");
    setChecking(false);
  };

  const valid=firstName.trim().length>=1&&lastName.trim().length>=1&&dob.length===10&&username.length>=3&&usernameStatus==="available";

  const handleFinish=async()=>{
    if(!valid)return;
    const fullName=`${firstName.trim()} ${lastName.trim()}`;
    const profileData={fullName,firstName:firstName.trim(),lastName:lastName.trim(),username:username.toLowerCase(),venmo:venmo.trim().replace(/^@/,""),dob,email:googleUser?.email||"",photoURL:googleUser?.photoURL||"",createdAt:new Date().toISOString()};
    if(googleUser)await saveUserProfile(googleUser.uid,profileData);
    onLogin(fullName,venmo.trim(),username.toLowerCase(),dob,googleUser?.uid||null,googleUser);
  };

  const GoogleIcon=()=><svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>;

  if(step==="google"){
    return(
      <div style={{background:BG,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif"}}>
        <div style={{width:440,background:Card,border:`1px solid ${Border}`,borderRadius:24,padding:"48px 40px",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>🦈</div>
          <div style={{color:Gold,fontSize:11,letterSpacing:3,fontFamily:"monospace",marginBottom:8}}>SHARKD</div>
          <div style={{color:"#fff",fontSize:24,fontWeight:"bold",marginBottom:8}}>Welcome</div>
          <div style={{color:"#555",fontSize:14,marginBottom:32,lineHeight:1.6}}>Sign in to track your games, settle debts, and climb the ranks.</div>
          <div onClick={signingIn?undefined:handleGoogleSignIn} style={{display:"flex",alignItems:"center",gap:12,background:signingIn?"#ddd":"#fff",borderRadius:12,padding:"14px 24px",cursor:signingIn?"not-allowed":"pointer",fontSize:15,fontWeight:"bold",color:"#111",justifyContent:"center",marginBottom:16,boxShadow:"0 4px 20px rgba(0,0,0,.3)",opacity:signingIn?0.7:1}}>
            <GoogleIcon/>{signingIn?"Signing in...":"Continue with Google"}
          </div>
          {error&&<div style={{color:Down,fontSize:13,marginBottom:8}}>{error}</div>}
          <div style={{color:"#333",fontSize:12}}>Free forever - No credit card needed</div>
        </div>
      </div>
    );
  }

  return(
    <div style={{background:BG,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",padding:"40px 20px"}}>
      <div style={{width:520,background:Card,border:`1px solid ${Border}`,borderRadius:24,padding:"40px"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          {googleUser?.photoURL&&<img src={googleUser.photoURL} style={{width:56,height:56,borderRadius:"50%",marginBottom:12,border:`2px solid ${Gold}`}}/>}
          <div style={{color:"#fff",fontSize:20,fontWeight:"bold",marginBottom:4}}>Set up your Sharkd profile</div>
          <div style={{color:"#555",fontSize:13}}>{googleUser?.email||"This is how other players will know you"}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          <div>
            <div style={{color:"#555",fontSize:11,fontFamily:"monospace",letterSpacing:1,marginBottom:6}}>FIRST NAME *</div>
            <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Carson" autoFocus style={{width:"100%",background:BG,border:`1.5px solid ${firstName?Gold:Border}`,borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:15,boxSizing:"border-box",outline:"none"}}/>
          </div>
          <div>
            <div style={{color:"#555",fontSize:11,fontFamily:"monospace",letterSpacing:1,marginBottom:6}}>LAST NAME *</div>
            <input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Miller" style={{width:"100%",background:BG,border:`1.5px solid ${lastName?Gold:Border}`,borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:15,boxSizing:"border-box",outline:"none"}}/>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{color:"#555",fontSize:11,fontFamily:"monospace",letterSpacing:1,marginBottom:6}}>DATE OF BIRTH *</div>
          <input value={dob} onChange={e=>{let v=e.target.value.replace(/\D/g,"");if(v.length>=2)v=v.slice(0,2)+"/"+v.slice(2);if(v.length>=5)v=v.slice(0,5)+"/"+v.slice(5);setDob(v.slice(0,10));}} placeholder="MM/DD/YYYY" maxLength={10} style={{width:"100%",background:BG,border:`1.5px solid ${dob.length===10?Gold:Border}`,borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:15,boxSizing:"border-box",outline:"none",fontFamily:"monospace"}}/>
          <div style={{color:"#444",fontSize:11,marginTop:4}}>Must be 18+ to use Sharkd</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{color:"#555",fontSize:11,fontFamily:"monospace",letterSpacing:1,marginBottom:6}}>SHARKD USERNAME *</div>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:Gold,fontSize:15,fontWeight:"bold",pointerEvents:"none"}}>@</span>
            <input value={username} onChange={e=>checkUsername(e.target.value)} onFocus={()=>setUsernameFocus(true)} onBlur={()=>setUsernameFocus(false)} placeholder="yourhandle" maxLength={20} style={{width:"100%",background:BG,border:`1.5px solid ${usernameStatus==="available"?Up:usernameStatus==="taken"?Down:usernameFocus?Gold:Border}`,borderRadius:10,padding:"11px 14px 11px 30px",color:"#fff",fontSize:15,boxSizing:"border-box",outline:"none",fontFamily:"monospace"}}/>
            {checking&&<div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:"#555",fontSize:12}}>checking...</div>}
            {!checking&&usernameStatus&&<div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:16}}>{usernameStatus==="available"?"ok":"taken"}</div>}
          </div>
          {usernameStatus==="taken"&&<div style={{color:Down,fontSize:12,marginTop:4}}>@{username} is taken. Try another.</div>}
          {usernameStatus==="available"&&<div style={{color:Up,fontSize:12,marginTop:4}}>@{username} is available!</div>}
          {!usernameStatus&&<div style={{color:"#444",fontSize:11,marginTop:4}}>Letters, numbers, underscores only. Min 3 chars.</div>}
        </div>
        <div style={{marginBottom:24}}>
          <div style={{color:"#555",fontSize:11,fontFamily:"monospace",letterSpacing:1,marginBottom:6}}>VENMO USERNAME (optional)</div>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#00a4eb",fontSize:16,fontWeight:"bold",pointerEvents:"none"}}>@</span>
            <input value={venmo} onChange={e=>setVenmo(e.target.value.replace(/^@/,""))} placeholder="your-venmo" style={{width:"100%",background:BG,border:"1.5px solid #00a4eb33",borderRadius:10,padding:"11px 14px 11px 30px",color:"#fff",fontSize:15,boxSizing:"border-box",outline:"none",fontFamily:"monospace"}}/>
          </div>
          <div style={{color:"#444",fontSize:11,marginTop:4}}>Friends see this to know where to pay you</div>
        </div>
        <div style={{opacity:valid?1:0.4,transition:"opacity .3s"}}>
          <div onClick={handleFinish} style={{background:`linear-gradient(135deg,${Gold},${GoldDim})`,borderRadius:12,padding:"15px",textAlign:"center",color:BG,fontWeight:"bold",fontSize:16,cursor:valid?"pointer":"not-allowed"}}>
            Enter Sharkd
          </div>
        </div>
        {!valid&&<div style={{color:"#444",fontSize:12,textAlign:"center",marginTop:10}}>Fill in all required fields to continue</div>}
      </div>
    </div>
  );
}


// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
function HomeScreen({nav,profile,debts,notifs,myGames,setSelectedDebt}){
  const isMobile=useIsMobile();
  const owing=debts.filter(d=>d.from==="You"),owed=debts.filter(d=>d.to==="You");
  const youOwe=owing.reduce((s,d)=>s+d.amount,0),owedToYou=owed.reduce((s,d)=>s+d.amount,0);
  const pending=owing.length+owed.length;
  const allTime=myGames.reduce((s,g)=>s+g.net,0);
  const myStats=deriveStats(myGames),myScore=calcScore(myStats),myRank=getRank(myScore);
  const recentGames=myGames.slice(0,5);
  const nextRankIdx=RANKS.findIndex(r=>r.tier===myRank.tier)+1;
  const nextRank=RANKS[nextRankIdx]||null;
  const rankPct=nextRank?((myScore-myRank.min)/(myRank.max-myRank.min))*100:100;
  const isNew=myGames.length===0&&debts.length===0;

  return(
    <MainContent isMobile={isMobile}>
      <PageHeader
        title={`Hey, ${profile.username} 👋`}
        subtitle="Your poker overview"
        action={<Btn label="+ New Game" onClick={()=>nav(S.NEW_GAME)}/>}
      />

      {/* Top stats */}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:isMobile?10:16,marginBottom:isMobile?20:28}}>
        <StatBox label="All-Time Net" value={`${allTime>=0?"+":""}$${allTime}`} color={allTime>=0?Up:Down}/>
        <StatBox label="You Owe" value={`$${youOwe}`} color={youOwe>0?Down:"#555"} sub={`${owing.length} pending`}/>
        <StatBox label="Owed to You" value={`$${owedToYou}`} color={owedToYou>0?Up:"#555"} sub={`${owed.length} pending`}/>
        <StatBox label="Your Rank" value={`${myRank.emoji} ${myRank.tier}`} color={myRank.color} sub={`${myScore.toFixed(1)}/10`}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"2fr 1fr",gap:20}}>
        {/* Left column */}
        <div>
          {/* Pending actions */}
          <Card2 style={{marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <SectionLabel text={`Pending Actions${pending>0?` (${pending})`:""}`}/>
              {pending>0&&<Btn label="View All" onClick={()=>nav(S.SETTLEMENTS)} size="sm" outline/>}
            </div>
            {pending===0?(
              <div style={{textAlign:"center",padding:"24px 0"}}>
                <div style={{fontSize:32,marginBottom:8}}>🎉</div>
                <div style={{color:Up,fontWeight:"bold",fontSize:15,marginBottom:4}}>All square!</div>
                <div style={{color:"#555",fontSize:13}}>No pending debts. Everyone's paid up.</div>
              </div>
            ):(
              <div>
                {owing.map(d=>(
                  <div key={d.id} onClick={()=>{setSelectedDebt(d);nav(S.CONFIRM_PAY);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:`${Down}0a`,border:`1px solid ${Down}22`,borderRadius:10,marginBottom:8,cursor:"pointer"}}>
                    <div><div style={{color:"#fff",fontSize:14}}>You → {d.to}</div><div style={{color:"#555",fontSize:12,marginTop:2}}>{d.game}</div></div>
                    <div style={{color:Down,fontWeight:"bold",fontSize:16}}>-${Number(d.amount).toFixed(2)}</div>
                  </div>
                ))}
                {owed.map(d=>(
                  <div key={d.id} onClick={()=>nav(S.SETTLEMENTS)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:`${Up}0a`,border:`1px solid ${Up}22`,borderRadius:10,marginBottom:8,cursor:"pointer"}}>
                    <div><div style={{color:"#fff",fontSize:14}}>{d.from} → You</div><div style={{color:"#555",fontSize:12,marginTop:2}}>{d.game}</div></div>
                    <div style={{color:Up,fontWeight:"bold",fontSize:16}}>+${Number(d.amount).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </Card2>

          {/* Recent games */}
          <Card2>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <SectionLabel text="Recent Games"/>
              <Btn label="View All" onClick={()=>nav(S.HISTORY)} size="sm" outline/>
            </div>
            {recentGames.length===0?(
              <div style={{textAlign:"center",padding:"24px 0"}}>
                <div style={{fontSize:32,marginBottom:8}}>🃏</div>
                <div style={{color:"#555",fontSize:13}}>No games yet. Log your first game!</div>
                <div style={{marginTop:12}}><Btn label="+ Log a Game" onClick={()=>nav(S.NEW_GAME)} size="sm"/></div>
              </div>
            ):recentGames.map(g=>(
              <div key={g.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${Border}`}}>
                <div>
                  <div style={{color:"#fff",fontSize:14,fontWeight:"bold"}}>{g.game}</div>
                  <div style={{color:"#555",fontSize:12,marginTop:2}}>{g.date} · {(g.players||[]).length} players</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:g.net>=0?Up:Down,fontWeight:"bold",fontSize:16,fontFamily:"monospace"}}>{g.net>=0?"+":""}${g.net}</div>
                  <Tag text={g.settled?"✓ Settled":"⏳ Pending"} color={g.settled?Up:Gold}/>
                </div>
              </div>
            ))}
          </Card2>
        </div>

        {/* Right column */}
        <div>
          {/* Quick actions */}
          <Card2 style={{marginBottom:20}}>
            <SectionLabel text="Quick Actions"/>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {icon:"🃏",label:"New Game",    s:S.NEW_GAME},
                {icon:"⚡",label:"Settle Up",   s:S.SETTLEMENTS},
                {icon:"📈",label:"My Stats",    s:S.STATS},
                {icon:"🏆",label:"Leaderboard", s:S.LEADERBOARD},
                {icon:"📡",label:"Friend Feed",  s:S.FEED},
              ].map(a=>(
                <div key={a.s} onClick={()=>nav(a.s)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:`${BG}`,border:`1px solid ${Border}`,borderRadius:10,cursor:"pointer",transition:"border-color .15s"}}>
                  <span style={{fontSize:18}}>{a.icon}</span>
                  <span style={{color:"#aaa",fontSize:14}}>{a.label}</span>
                  <span style={{marginLeft:"auto",color:"#444"}}>→</span>
                </div>
              ))}
            </div>
          </Card2>

          {/* Rank teaser */}
          <div onClick={()=>nav(S.RANK)} style={{background:`linear-gradient(135deg,${myRank.color}18,${Card})`,border:`1px solid ${myRank.color}44`,borderRadius:16,padding:"20px",cursor:"pointer"}}>
            <SectionLabel text="Your Rank"/>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <span style={{fontSize:36}}>{myRank.emoji}</span>
              <div>
                <div style={{color:myRank.color,fontWeight:"bold",fontSize:20}}>{myRank.tier}</div>
                <div style={{color:myRank.color,fontSize:28,fontWeight:"bold",fontFamily:"monospace"}}>{myScore.toFixed(1)}<span style={{fontSize:14,opacity:.6}}>/10</span></div>
              </div>
            </div>
            {nextRank?<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#555",fontSize:12}}>→ {nextRank.emoji} {nextRank.tier}</span><span style={{color:myRank.color,fontSize:12,fontFamily:"monospace"}}>{(nextRank.min-myScore).toFixed(2)} pts</span></div><div style={{height:4,background:"#1a1a2e",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${rankPct}%`,background:myRank.color,borderRadius:2}}/></div></div>:<div style={{color:Gold,fontSize:12,textAlign:"center"}}>🦈 Maximum rank achieved!</div>}
          </div>
        </div>
      </div>
    </MainContent>
  );
}

// ─── NEW GAME ────────────────────────────────────────────────────────────────
function NewGameScreen({nav,profile,friends,groups,addGame,showToast}){
  const isMobile=useIsMobile();  const [step,setStep]=useState(1);
  const [gameName,setGameName]=useState(""),[ nameF,setNameF]=useState(false);
  const [selectedGroupId,setSelectedGroupId]=useState(null);
  const [selected,setSelected]=useState(new Set(["You"]));
  const [amounts,setAmounts]=useState({});
  const [focusedCell,setFocusedCell]=useState(null);
  const [showConfirm,setShowConfirm]=useState(false);
  const [guestInput,setGuestInput]=useState("");
  const [guests,setGuests]=useState([]);
  const todayStr=new Date().toISOString().slice(0,10);
  const [gameDate,setGameDate]=useState(todayStr);

  const addGuest=()=>{
    const name=guestInput.trim();
    if(!name)return;
    if(guests.find(g=>g.name.toLowerCase()===name.toLowerCase())||name.toLowerCase()==="you")return;
    const g={name,username:"guest",color:"#888",initial:name[0].toUpperCase(),isGuest:true};
    setGuests(prev=>[...prev,g]);
    setSelected(prev=>{const n=new Set(prev);n.add(name);return n;});
    setGuestInput("");
  };
  const removeGuest=name=>{
    setGuests(prev=>prev.filter(g=>g.name!==name));
    setSelected(prev=>{const n=new Set(prev);n.delete(name);return n;});
  };

  const toggleFriend=name=>{if(name==="You")return;setSelected(prev=>{const n=new Set(prev);n.has(name)?n.delete(name):n.add(name);return n;});};
  const loadGroup=g=>{setSelectedGroupId(g.id);setSelected(new Set(["You",...g.members]));};
  const allCandidates=[
    {name:"You",username:`@${(profile?.username||"you").toLowerCase().replace(/\s/g,"_")}`,color:Gold,initial:(profile?.avatarChar||profile?.username?.[0]||"Y")},
    ...friends.map(f=>({name:f.name,username:`@${f.username}`,color:f.color,initial:f.avatar||f.name[0]})),
    ...guests,
  ];
  const upd=(name,field,val)=>{
    const clean=val.replace(/[^0-9.]/g,"").replace(/^(\d*\.?\d{0,2}).*$/,"$1");
    setAmounts(prev=>({...prev,[name]:{...prev[name],[field]:clean}}));
  };
  const activePlayers=allCandidates.filter(p=>selected.has(p.name));
  const nets=activePlayers.map(p=>{
    const a=amounts[p.name]||{};
    const b=parseCents(a.buyin||""),c=parseCents(a.cashout||"");
    return{name:p.name,buyinCents:b,cashoutCents:c,netCents:c-b};
  });
  const totalBuyin=nets.reduce((s,p)=>s+p.buyinCents,0);
  const totalCashout=nets.reduce((s,p)=>s+p.cashoutCents,0);
  const balanced=totalBuyin>0&&totalBuyin===totalCashout;
  const txns=balanced?minimizeDebts(nets.map(n=>({name:n.name,netCents:n.netCents}))):[];
  const finalName=gameName.trim()||"Unnamed Game";
  const displayDate=gameDate===todayStr?new Date().toLocaleDateString("en",{month:"short",day:"numeric"}):new Date(gameDate+"T12:00:00").toLocaleDateString("en",{month:"short",day:"numeric",year:gameDate.slice(0,4)!==todayStr.slice(0,4)?"numeric":undefined});

  return(
    <MainContent isMobile={isMobile}>
      <PageHeader title="New Game" subtitle="Log your game results"/>

      {/* Progress */}
      <div style={{display:"flex",gap:8,marginBottom:32,maxWidth:500}}>
        {[1,2,3].map(s=>(
          <div key={s} style={{flex:1}}>
            <div style={{height:4,borderRadius:2,background:s<=step?Gold:Border,transition:"background .4s",marginBottom:6}}/>
            <div style={{color:s<=step?Gold:"#444",fontSize:12,fontFamily:"monospace"}}>{s===1?"Players":s===2?"Amounts":"Review"}</div>
          </div>
        ))}
      </div>

      <div style={{maxWidth:700}}>
        {step===1&&(
          <Card2>
            <div style={{marginBottom:20}}>
              <div style={{color:nameF?Gold:"#555",fontSize:11,fontFamily:"monospace",letterSpacing:1,marginBottom:8,transition:"color .2s"}}>GAME NAME</div>
              <input value={gameName} onChange={e=>setGameName(e.target.value)} onFocus={()=>setNameF(true)} onBlur={()=>setNameF(false)}
                placeholder="e.g. Friday Night at Jakes"
                style={{width:"100%",background:BG,border:`1.5px solid ${nameF?Gold:Border}`,borderRadius:12,padding:"13px 16px",color:"#fff",fontSize:16,boxSizing:"border-box",outline:"none",transition:"all .2s"}}/>
            </div>
            {groups.length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{color:"#555",fontSize:11,fontFamily:"monospace",letterSpacing:1,marginBottom:8}}>QUICK LOAD GROUP</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {groups.map(g=>(
                    <div key={g.id} onClick={()=>loadGroup(g)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,cursor:"pointer",background:selectedGroupId===g.id?`${g.color}22`:Card,border:`1px solid ${selectedGroupId===g.id?g.color:Border}`,transition:"all .2s"}}>
                      <span>{g.emoji}</span><span style={{color:selectedGroupId===g.id?g.color:"#888",fontSize:13,fontWeight:"bold"}}>{g.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Date picker */}
            <div style={{marginBottom:20}}>
              <div style={{color:"#555",fontSize:11,fontFamily:"monospace",letterSpacing:1,marginBottom:8}}>GAME DATE</div>
              <input type="date" value={gameDate} onChange={e=>setGameDate(e.target.value)} max={todayStr}
                style={{background:BG,border:`1.5px solid ${Border}`,borderRadius:12,padding:"12px 16px",color:"#fff",fontSize:15,outline:"none",colorScheme:"dark",width:"100%",boxSizing:"border-box"}}/>
              {gameDate!==todayStr&&<div style={{color:Gold,fontSize:12,marginTop:6}}>⏪ Logging a past game: {displayDate}</div>}
            </div>

            <div style={{color:"#555",fontSize:13,marginBottom:16}}>Select players for this game:</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
              {allCandidates.map(p=>{
                const inGame=selected.has(p.name),isYou=p.name==="You";
                return(
                  <div key={p.name} onClick={()=>toggleFriend(p.name)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,border:`1.5px solid ${inGame?`${p.color}66`:Border}`,background:inGame?`${p.color}12`:"transparent",cursor:isYou?"default":"pointer",transition:"all .2s"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:`${p.color}22`,display:"flex",alignItems:"center",justifyContent:"center",color:p.color,fontWeight:"bold",fontSize:15}}>{p.initial}</div>
                    <div style={{flex:1}}>
                      <div style={{color:inGame?"#fff":"#666",fontWeight:"bold",fontSize:14}}>{isYou?(profile?.username||"You"):p.name}</div>
                      <div style={{color:"#444",fontSize:11,fontFamily:"monospace"}}>{p.username}</div>
                    </div>
                    <div style={{color:inGame?Up:"#333",fontSize:18}}>{inGame?"✓":"+"}</div>
                  </div>
                );
              })}
            </div>
            {/* Guest player input */}
            <div style={{marginBottom:16}}>
              <div style={{color:"#555",fontSize:11,fontFamily:"monospace",letterSpacing:1,marginBottom:8}}>ADD GUEST PLAYER (not on Sharkd)</div>
              <div style={{display:"flex",gap:8}}>
                <input value={guestInput} onChange={e=>setGuestInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addGuest()} placeholder="Enter their name..." style={{flex:1,background:BG,border:`1.5px solid ${Border}`,borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
                <div onClick={addGuest} style={{background:`${Gold}22`,border:`1px solid ${Gold}44`,borderRadius:10,padding:"11px 16px",color:Gold,fontWeight:"bold",fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>+ Add</div>
              </div>
              {guests.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10}}>
                {guests.map(g=>(
                  <div key={g.name} style={{display:"flex",alignItems:"center",gap:6,background:"#1a1a2e",border:"1px solid #333",borderRadius:20,padding:"4px 12px"}}>
                    <span style={{color:"#aaa",fontSize:13}}>{g.name}</span>
                    <span onClick={()=>removeGuest(g.name)} style={{color:"#555",fontSize:16,cursor:"pointer",lineHeight:1}}>×</span>
                  </div>
                ))}
              </div>}
            </div>
            <div style={{color:"#555",fontSize:13,marginBottom:16}}>{selected.size} players selected</div>
            <div style={{opacity:selected.size>=2?1:0.4}}>
              <Btn label={`Next: Enter Amounts →`} onClick={()=>{if(selected.size>=2)setStep(2);}} size="lg"/>
            </div>
          </Card2>
        )}

        {step===2&&(
          <div>
            <div style={{display:"grid",gap:12,marginBottom:20}}>
              {activePlayers.map(p=>{
                const a=amounts[p.name]||{};
                const net=nets.find(n=>n.name===p.name);
                const netC=net?.netCents||0;
                const hasData=(a.buyin||"")!==""&&(a.cashout||"")!=="";
                const rc=!hasData?Border:netC>0?Up:netC<0?Down:"#888";
                return(
                  <div key={p.name} style={{background:Card,border:`1.5px solid ${rc}44`,borderRadius:14,padding:"16px 20px",transition:"border-color .3s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:32,height:32,borderRadius:"50%",background:`${rc}22`,display:"flex",alignItems:"center",justifyContent:"center",color:rc,fontWeight:"bold",fontSize:14}}>{p.initial}</div>
                        <div style={{color:"#fff",fontWeight:"bold",fontSize:15}}>{p.name==="You"?(profile?.username||"You"):p.name}</div>
                      </div>
                      {hasData&&<div style={{color:netC>0?Up:netC<0?Down:"#888",fontWeight:"bold",fontSize:18,fontFamily:"monospace"}}>{netC>0?"+":""}{fmtCents(netC)}</div>}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      {[{field:"buyin",label:"TOTAL BUY-IN"},{field:"cashout",label:"CASH OUT"}].map(({field,label})=>{
                        const cellKey=`${p.name}-${field}`,focused=focusedCell===cellKey;
                        return(
                          <div key={field}>
                            <div style={{color:focused?Gold:"#555",fontSize:10,marginBottom:6,fontFamily:"monospace",letterSpacing:1,transition:"color .2s"}}>{label}</div>
                            <div style={{position:"relative"}}>
                              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:focused?Gold:"#555",fontSize:16,fontWeight:"bold",pointerEvents:"none"}}>$</span>
                              <input value={a[field]||""} onChange={e=>upd(p.name,field,e.target.value)}
                                onFocus={()=>setFocusedCell(cellKey)} onBlur={()=>setFocusedCell(null)}
                                placeholder="0.00" inputMode="decimal"
                                style={{width:"100%",background:focused?"#13132a":BG,border:`1.5px solid ${focused?Gold:Border}`,borderRadius:10,padding:"11px 12px 11px 28px",color:"#fff",fontSize:18,fontWeight:"bold",boxSizing:"border-box",outline:"none",transition:"all .2s",fontFamily:"monospace"}}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Balance checker */}
            <div style={{background:totalBuyin===0?Card:balanced?`${Up}0a`:`${Down}0a`,border:`1px solid ${totalBuyin===0?Border:balanced?`${Up}33`:`${Down}33`}`,borderRadius:14,padding:"16px 20px",marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"#555",fontSize:14}}>Total buy-in</span><span style={{color:"#fff",fontWeight:"bold",fontFamily:"monospace"}}>{fmtCents(totalBuyin)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span style={{color:"#555",fontSize:14}}>Total cashout</span><span style={{color:"#fff",fontWeight:"bold",fontFamily:"monospace"}}>{fmtCents(totalCashout)}</span></div>
              <div style={{height:1,background:Border,marginBottom:12}}/>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{color:"#888",fontSize:14}}>Difference</span>
                <span style={{color:balanced?Up:totalBuyin===0?"#555":Down,fontWeight:"bold",fontFamily:"monospace",fontSize:16}}>
                  {balanced?"✓ Balanced":totalBuyin===0?"—":fmtCents(totalCashout-totalBuyin)}
                </span>
              </div>
            </div>

            <div style={{display:"flex",gap:12}}>
              <Btn label="← Back" onClick={()=>setStep(1)} outline/>
              <div style={{opacity:balanced?1:0.4,flex:1}}>
                <Btn label="Review Settlements →" onClick={()=>{if(balanced)setStep(3);}} size="lg"/>
              </div>
            </div>
          </div>
        )}

        {step===3&&(
          <div>
            <Card2 style={{marginBottom:16}}>
              <SectionLabel text="Results"/>
              {nets.map(r=>(
                <div key={r.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${Border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:r.netCents>0?`${Up}22`:r.netCents<0?`${Down}22`:"#1a1a2e",display:"flex",alignItems:"center",justifyContent:"center",color:r.netCents>0?Up:r.netCents<0?Down:"#555",fontWeight:"bold",fontSize:13}}>{r.name[0]}</div>
                    <span style={{color:"#fff",fontSize:15,fontWeight:"bold"}}>{r.name==="You"?(profile?.username||"You"):r.name}</span>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:r.netCents>0?Up:r.netCents<0?Down:"#888",fontWeight:"bold",fontSize:18,fontFamily:"monospace"}}>{r.netCents>0?"+":""}{fmtCents(r.netCents)}</div>
                    <div style={{color:"#444",fontSize:11,fontFamily:"monospace"}}>{fmtCents(r.buyinCents)} in → {fmtCents(r.cashoutCents)} out</div>
                  </div>
                </div>
              ))}
            </Card2>

            {txns.length>0&&(
              <Card2 style={{marginBottom:16}}>
                <SectionLabel text={`${txns.length} Payment${txns.length!==1?"s":""} Needed`}/>
                {txns.map((t,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<txns.length-1?`1px solid ${Border}`:"none"}}>
                    <div style={{background:`${Down}22`,borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",color:Down,fontWeight:"bold",fontSize:13}}>{t.from[0]}</div>
                    <div style={{color:"#aaa",fontSize:14,flex:1}}>{t.from==="You"?(profile?.username||"You"):t.from}</div>
                    <div style={{color:Gold,fontWeight:"bold",fontSize:16,fontFamily:"monospace"}}>{fmtCents(t.amountCents)}</div>
                    <div style={{color:"#555",fontSize:18}}>→</div>
                    <div style={{color:"#aaa",fontSize:14,flex:1,textAlign:"right"}}>{t.to==="You"?(profile?.username||"You"):t.to}</div>
                    <div style={{background:`${Up}22`,borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",color:Up,fontWeight:"bold",fontSize:13}}>{t.to[0]}</div>
                  </div>
                ))}
              </Card2>
            )}

            {!showConfirm?(
              <div style={{display:"flex",gap:12}}>
                <Btn label="← Back" onClick={()=>setStep(2)} outline/>
                <Btn label="Send Payment Requests →" onClick={()=>setShowConfirm(true)} size="lg"/>
              </div>
            ):(
              <div style={{background:`${Gold}0a`,border:`1px solid ${Gold}33`,borderRadius:14,padding:"20px"}}>
                <div style={{color:Gold,fontWeight:"bold",fontSize:16,marginBottom:8}}>⚠️ Confirm</div>
                <div style={{color:"#888",fontSize:14,lineHeight:1.6,marginBottom:16}}>
                  Send requests for <strong style={{color:"#fff"}}>{finalName}</strong> to {activePlayers.filter(p=>p.name!=="You").map(p=>p.name).join(", ")}?
                </div>
                <div style={{display:"flex",gap:12}}>
                  <Btn label="Cancel" onClick={()=>setShowConfirm(false)} outline/>
                  <Btn label="✓ Confirm & Send" onClick={()=>addGame(finalName,activePlayers,nets,selectedGroupId,displayDate)}/>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainContent>
  );
}

// ─── SETTLEMENTS ─────────────────────────────────────────────────────────────
function SettlementsScreen({nav,debts,settleDebt,showToast,settledHistory,setSelectedDebt}){
  const isMobile=useIsMobile();  const [tab,setTab]=useState("active");
  const owing=debts.filter(d=>d.from==="You"),owed=debts.filter(d=>d.to==="You");
  return(
    <MainContent isMobile={isMobile}>
      <PageHeader title="Settle Up" subtitle="Manage pending payments"/>
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        {[["active","⚡ Active"],["history","📋 History"]].map(([t,label])=>(
          <div key={t} onClick={()=>setTab(t)} style={{padding:"9px 20px",borderRadius:10,cursor:"pointer",background:tab===t?`${Gold}22`:Card,border:`1px solid ${tab===t?Gold:Border}`,color:tab===t?Gold:"#555",fontWeight:"bold",fontSize:13,transition:"all .2s"}}>{label}</div>
        ))}
      </div>
      {tab==="active"&&(
        <div style={{maxWidth:700}}>
          {owing.length===0&&owed.length===0?(
            <Card2 style={{textAlign:"center",padding:"48px"}}>
              <div style={{fontSize:48,marginBottom:12}}>🎉</div>
              <div style={{color:Up,fontWeight:"bold",fontSize:20,marginBottom:8}}>All square!</div>
              <div style={{color:"#555",fontSize:14}}>No pending debts. Everyone's paid up.</div>
            </Card2>
          ):(
            <>
              {owing.length>0&&<><SectionLabel text="You Owe"/>
                {owing.map(d=>(
                  <div key={d.id} onClick={()=>{setSelectedDebt(d);nav(S.CONFIRM_PAY);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",background:Card,border:`1px solid ${Down}33`,borderRadius:14,marginBottom:10,cursor:"pointer"}}>
                    <div><div style={{color:"#fff",fontSize:15,fontWeight:"bold"}}>You → {d.to}</div><div style={{color:"#555",fontSize:12,marginTop:3}}>{d.game}</div></div>
                    <div style={{textAlign:"right"}}><div style={{color:Down,fontSize:22,fontWeight:"bold"}}>${Number(d.amount).toFixed(2)}</div><div style={{color:Down,fontSize:12,marginTop:4}}>Tap to mark paid →</div></div>
                  </div>
                ))}</>}
              {owed.length>0&&<><SectionLabel text="Owed to You" style={{marginTop:20}}/>
                {owed.map(d=>(
                  <div key={d.id} onClick={()=>{settleDebt(d.id);showToast(`✓ Confirmed $$${Number(d.amount).toFixed(2)} from ${d.from}!`);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",background:Card,border:`1px solid ${Up}33`,borderRadius:14,marginBottom:10,cursor:"pointer"}}>
                    <div><div style={{color:"#fff",fontSize:15,fontWeight:"bold"}}>{d.from} → You</div><div style={{color:"#555",fontSize:12,marginTop:3}}>{d.game}</div><div style={{color:Up,fontSize:12,marginTop:4}}>Tap anywhere to confirm received</div></div>
                    <div style={{textAlign:"right"}}><div style={{color:Up,fontSize:22,fontWeight:"bold"}}>${Number(d.amount).toFixed(2)}</div></div>
                  </div>
                ))}</>}
            </>
          )}
        </div>
      )}
      {tab==="history"&&(
        <div style={{maxWidth:700}}>
          <div style={{color:"#555",fontSize:13,marginBottom:16}}>All settled payments</div>
          {settledHistory.map(d=>(
            <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",background:Card,border:`1px solid ${Up}22`,borderRadius:14,marginBottom:10}}>
              <div><div style={{color:"#fff",fontSize:14,fontWeight:"bold"}}>{d.from==="You"?`You → ${d.to}`:`${d.from} → You`}</div><div style={{color:"#555",fontSize:12,marginTop:2}}>{d.game} · {d.date}</div></div>
              <div style={{textAlign:"right"}}><div style={{color:d.from==="You"?Down:Up,fontWeight:"bold",fontSize:15}}>{d.from==="You"?"-":"+"}${Number(d.amount).toFixed(2)}</div><Tag text="✓ Settled" color={Up}/></div>
            </div>
          ))}
        </div>
      )}
    </MainContent>
  );
}

// ─── CONFIRM PAY ─────────────────────────────────────────────────────────────
function ConfirmPayScreen({nav,debt,showToast,settleDebt,friends,profile}){
  const isMobile=useIsMobile();  if(!debt){nav(S.SETTLEMENTS);return null;}
  const payee=friends?.find(f=>f.name===debt.to);
  const theirVenmo=payee?.venmo||"";
  return(
    <MainContent isMobile={isMobile}>
      <PageHeader title="Confirm Payment" subtitle="Mark this debt as paid"/>
      <div style={{maxWidth:500}}>
        <Card2 style={{textAlign:"center",marginBottom:20,padding:"40px"}}>
          <div style={{fontSize:64,marginBottom:16}}>💸</div>
          <div style={{color:"#555",fontSize:16,marginBottom:8}}>You're paying</div>
          <div style={{color:"#fff",fontSize:64,fontWeight:"bold",fontFamily:"monospace",lineHeight:1}}>${Number(debt.amount).toFixed(2)}</div>
          <div style={{color:Gold,fontSize:22,marginTop:12}}>to {debt.to}</div>
          <div style={{color:"#555",fontSize:14,marginTop:6}}>{debt.game}</div>
          {theirVenmo&&(
            <div style={{marginTop:20,background:"#00a4eb18",border:"1px solid #00a4eb44",borderRadius:12,padding:"12px 20px",display:"inline-flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>💸</span>
              <div>
                <div style={{color:"#00a4eb",fontWeight:"bold",fontSize:14}}>Venmo: @{theirVenmo}</div>
                <div style={{color:"#555",fontSize:11,marginTop:2}}>Find them on Venmo to pay</div>
              </div>
            </div>
          )}
        </Card2>
        <Card2 style={{marginBottom:20}}>
          <div style={{color:"#555",fontSize:14,lineHeight:1.7}}>Once you mark this paid, <span style={{color:Gold}}>{debt.to}</span> gets a notification to confirm. The debt clears when they confirm.</div>
        </Card2>
        <div style={{display:"flex",gap:12}}>
          <Btn label="← Back" onClick={()=>nav(S.SETTLEMENTS)} outline/>
          <Btn label={`Mark $$${Number(debt.amount).toFixed(2)} as paid ✓`} onClick={()=>{settleDebt(debt.id);showToast(`✓ Sent to ${debt.to} for confirmation!`);nav(S.HOME);}} size="lg"/>
        </div>
      </div>
    </MainContent>
  );
}

// ─── HISTORY ─────────────────────────────────────────────────────────────────
function HistoryScreen({nav,myGames,setSelectedGame}){
  const isMobile=useIsMobile();  const [search,setSearch]=useState("");
  const filtered=myGames.filter(g=>
    g.game.toLowerCase().includes(search.toLowerCase())||
    g.date.toLowerCase().includes(search.toLowerCase())||
    (g.players||[]).some(p=>p.toLowerCase().includes(search.toLowerCase()))
  );
  const totalNet=myGames.reduce((s,g)=>s+g.net,0);
  return(
    <MainContent isMobile={isMobile}>
      <PageHeader title="Game History" subtitle={`${myGames.length} games · All-time: `}
        action={<div style={{display:"flex",gap:12,alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search games..." style={{background:Card,border:`1px solid ${Border}`,borderRadius:10,padding:"9px 16px",color:"#fff",fontSize:14,outline:"none",width:220}}/>
        </div>}
      />
      {filtered.length===0?(
        <Card2 style={{textAlign:"center",padding:"48px"}}>
          <div style={{fontSize:48,marginBottom:12}}>{myGames.length===0?"🃏":"🔍"}</div>
          <div style={{color:"#555",fontSize:14}}>{myGames.length===0?"No games yet. Log your first game!":"No games match your search."}</div>
          {myGames.length===0&&<div style={{marginTop:16}}><Btn label="+ Log a Game" onClick={()=>nav(S.NEW_GAME)}/></div>}
        </Card2>
      ):(
        <div>
          {filtered.map(g=>{
            const pot=(g.results||[]).reduce((s,r)=>s+(r.buyin||0),0)||g.buyin||0;
            const myResult=g.results?g.results.find(r=>r.name==="You"):{net:g.net};
            return(
              <div key={g.id} onClick={()=>{setSelectedGame(g);nav(S.GAME_DETAIL);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",background:Card,border:`1px solid ${(myResult?.net||0)>=0?`${Up}22`:`${Down}22`}`,borderRadius:14,marginBottom:10,cursor:"pointer",transition:"border-color .2s"}}>
                <div>
                  <div style={{color:"#fff",fontWeight:"bold",fontSize:16}}>{g.game}</div>
                  <div style={{color:"#555",fontSize:13,marginTop:4}}>{g.date} · {(g.players||[]).length} players · ${pot} pot</div>
                </div>
                <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                  <Tag text={g.settled?"✓ Settled":"⏳ Pending"} color={g.settled?Up:Gold}/>
                  {myResult&&<div style={{color:(myResult.net||0)>=0?Up:Down,fontWeight:"bold",fontSize:18,fontFamily:"monospace"}}>{(myResult.net||0)>=0?"+":""}${myResult.net||0}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MainContent>
  );
}

// ─── GAME DETAIL ─────────────────────────────────────────────────────────────
function GameDetailScreen({nav,game,chats,addChat,profile,onEdit}){
  const isMobile=useIsMobile();  const [tab,setTab]=useState("results"),[chatMsg,setChatMsg]=useState("");
  if(!game){nav(S.HISTORY);return null;}
  const totalPot=(game.results||[]).reduce((s,r)=>s+(r.buyin||0),0)||game.buyin||0;
  const sorted=[...(game.results||[])].sort((a,b)=>b.net-a.net);
  const txns=game.results?minimizeDebts(game.results.map(r=>({name:r.name,netCents:(r.net||0)*100}))):[];
  const gameMsgs=(chats&&chats[game.id])||[];
  const send=()=>{if(!chatMsg.trim())return;addChat(game.id,chatMsg.trim(),profile);setChatMsg("");};
  return(
    <MainContent isMobile={isMobile}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div>
          <div onClick={()=>nav(S.HISTORY)} style={{color:Gold,fontSize:13,cursor:"pointer",marginBottom:8,display:"inline-flex",alignItems:"center",gap:6}}>← Back to History</div>
          <div style={{color:"#fff",fontSize:28,fontWeight:"bold"}}>{game.game}</div>
          <div style={{color:"#555",fontSize:14,marginTop:4}}>{game.date} · {(game.results||[]).length} players · ${totalPot} total pot</div>
        </div>
        {onEdit&&<Btn label="✏️ Edit Game" onClick={onEdit} outline/>}
      </div>

      <div style={{display:"flex",gap:8,marginBottom:24}}>
        {[["results","📊 Results"],["payments","💸 Payments"],["chat","💬 Chat"]].map(([t,label])=>(
          <div key={t} onClick={()=>setTab(t)} style={{padding:"9px 20px",borderRadius:10,cursor:"pointer",background:tab===t?`${Gold}22`:Card,border:`1px solid ${tab===t?Gold:Border}`,color:tab===t?Gold:"#555",fontWeight:"bold",fontSize:13,transition:"all .2s"}}>{label}</div>
        ))}
      </div>

      <div style={{maxWidth:700}}>
        {tab==="results"&&sorted.map((r,i)=>(
          <div key={r.name} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",background:Card,border:`1px solid ${r.net>0?`${Up}22`:r.net<0?`${Down}22`:Border}`,borderRadius:14,marginBottom:10}}>
            <div style={{width:32,textAlign:"center",fontSize:i===0?20:13,color:i===0?Gold:"#555"}}>{i===0?"🏆":`#${i+1}`}</div>
            <div style={{width:36,height:36,borderRadius:"50%",background:r.net>0?`${Up}22`:r.net<0?`${Down}22`:"#1a1a2e",display:"flex",alignItems:"center",justifyContent:"center",color:r.net>0?Up:r.net<0?Down:"#555",fontWeight:"bold",fontSize:14}}>{r.name[0]}</div>
            <div style={{flex:1}}><div style={{color:r.name==="You"?Gold:"#fff",fontWeight:"bold",fontSize:15}}>{r.name}</div><div style={{color:"#555",fontSize:12,fontFamily:"monospace",marginTop:2}}>${r.buyin||0} in → ${r.cashout||0} out</div></div>
            <div style={{color:r.net>0?Up:r.net<0?Down:"#888",fontWeight:"bold",fontSize:22,fontFamily:"monospace"}}>{r.net>0?"+":""}${r.net}</div>
          </div>
        ))}
        {tab==="payments"&&(
          <>
            {txns.length===0?<Card2 style={{textAlign:"center",padding:"32px"}}><div style={{color:Up,fontSize:16,fontWeight:"bold"}}>✓ Everyone is square!</div></Card2>
              :txns.map((t,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",background:Card,border:`1px solid ${Border}`,borderRadius:14,marginBottom:10}}>
                  <div style={{background:`${Down}22`,borderRadius:"50%",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",color:Down,fontWeight:"bold"}}>{t.from[0]}</div>
                  <div style={{flex:1,color:"#aaa",fontSize:14}}>{t.from}</div>
                  <div style={{color:Gold,fontWeight:"bold",fontSize:18,fontFamily:"monospace"}}>${(t.amountCents/100).toFixed(2)}</div>
                  <div style={{color:"#555",fontSize:20}}>→</div>
                  <div style={{flex:1,textAlign:"right",color:"#aaa",fontSize:14}}>{t.to}</div>
                  <div style={{background:`${Up}22`,borderRadius:"50%",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",color:Up,fontWeight:"bold"}}>{t.to[0]}</div>
                </div>
              ))
            }
            <div style={{background:game.settled?`${Up}0a`:`${Gold}0a`,border:`1px solid ${game.settled?`${Up}33`:`${Gold}33`}`,borderRadius:14,padding:"14px 20px",display:"flex",alignItems:"center",gap:12,marginTop:8}}>
              <span style={{fontSize:24}}>{game.settled?"✅":"⏳"}</span>
              <div><div style={{color:game.settled?Up:Gold,fontWeight:"bold",fontSize:15}}>{game.settled?"Fully Settled":"Settlement Pending"}</div><div style={{color:"#555",fontSize:12,marginTop:2}}>{game.settled?"All payments confirmed":"Some players still owe"}</div></div>
            </div>
          </>
        )}
        {tab==="chat"&&(
          <Card2>
            <div style={{maxHeight:320,overflowY:"auto",marginBottom:16}}>
              {gameMsgs.length===0?<div style={{textAlign:"center",color:"#444",padding:"24px",fontSize:13}}>No messages yet. Say something!</div>
                :gameMsgs.map((m,i)=>{
                  const isMe=m.isMe||m.from===profile.username||m.from==="You";
                  return(
                    <div key={i} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start",marginBottom:12}}>
                      {!isMe&&<div style={{width:28,height:28,borderRadius:"50%",background:`${m.color}22`,display:"flex",alignItems:"center",justifyContent:"center",color:m.color,fontWeight:"bold",fontSize:12,flexShrink:0,marginRight:8}}>{m.avatar||m.from[0]}</div>}
                      <div style={{maxWidth:"65%"}}>
                        {!isMe&&<div style={{color:m.color,fontSize:11,marginBottom:3,fontWeight:"bold"}}>{m.from}</div>}
                        <div style={{background:isMe?`${Gold}22`:Border,border:`1px solid ${isMe?Gold:Border}`,borderRadius:isMe?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"10px 14px",color:"#fff",fontSize:14,lineHeight:1.5}}>{m.msg}</div>
                        <div style={{color:"#333",fontSize:10,marginTop:3,textAlign:isMe?"right":"left"}}>{m.time}</div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
            <div style={{display:"flex",gap:10}}>
              <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Say something..." style={{flex:1,background:BG,border:`1px solid ${Border}`,borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none"}}/>
              <Btn label="Send →" onClick={send}/>
            </div>
          </Card2>
        )}
      </div>
    </MainContent>
  );
}

// ─── STATS ───────────────────────────────────────────────────────────────────
function InteractiveChart({myGames,period}){
  const ref=useRef(null);
  const chartRef=useRef(null);
  const ptsRef=useRef([]);
  const hoveringRef=useRef(false);
  const totalRef=useRef(0);
  const colorRef=useRef(Up);
  const [chartLoaded,setChartLoaded]=useState(!!window.ChartJS);
  useEffect(()=>{
    if(window.ChartJS){setChartLoaded(true);return;}
    const script=document.createElement("script");
    script.src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload=()=>{window.ChartJS=window.Chart;setChartLoaded(true);};
    document.head.appendChild(script);
  },[]);

  function buildPts(games,pd){
    const now=new Date();
    const days={"1W":7,"1M":30,"3M":90,"1Y":365,"ALL":9999}[pd]||30;
    const cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-days);
    const filtered=games.filter(g=>{const d=parseGameDate(g.date);return d>=cutoff;}).sort((a,b)=>parseGameDate(a.date)-parseGameDate(b.date));
    let r=0;const pts=[{label:"",value:0,net:null}];
    filtered.forEach(g=>{r+=g.net;pts.push({label:g.date,value:r,net:g.net});});
    return pts;
  }

  useEffect(()=>{
    if(!ref.current||!chartLoaded||!window.ChartJS)return;
    const pts=buildPts(myGames,period);
    ptsRef.current=pts;
    const vals=pts.map(p=>p.value);
    const total=vals[vals.length-1]||0;
    totalRef.current=total;
    const color=total>=0?Up:Down;
    colorRef.current=color;

    const ctx=ref.current.getContext("2d");
    const grad=ctx.createLinearGradient(0,0,0,220);
    grad.addColorStop(0,color+"30");grad.addColorStop(1,color+"02");

    const crosshairPlugin={
      id:"crosshair",
      afterDraw(ch){
        if(ch.tooltip._active&&ch.tooltip._active.length){
          const cx=ch.ctx,x=ch.tooltip._active[0].element.x;
          const top=ch.chartArea.top,bottom=ch.chartArea.bottom;
          cx.save();cx.beginPath();cx.moveTo(x,top);cx.lineTo(x,bottom);
          cx.lineWidth=1;cx.strokeStyle="#c9a84c55";cx.setLineDash([4,4]);cx.stroke();cx.restore();
        }
      }
    };

    if(chartRef.current)chartRef.current.destroy();
    chartRef.current=new window.ChartJS(ref.current,{
      type:"line",plugins:[crosshairPlugin],
      data:{labels:pts.map(p=>p.label),datasets:[{data:vals,borderColor:color,borderWidth:2.5,pointRadius:0,pointHoverRadius:0,tension:0.35,fill:true,backgroundColor:grad}]},
      options:{
        responsive:true,maintainAspectRatio:false,
        interaction:{mode:"index",intersect:false},
        plugins:{legend:{display:false},tooltip:{enabled:false,external:(ctx2)=>{
          const tip=ctx2.tooltip;
          const bigEl=document.getElementById("stat-big-num");
          const tipEl=document.getElementById("stat-tip");
          if(!bigEl||!tipEl)return;
          if(tip.opacity===0){hoveringRef.current=false;bigEl.textContent=(totalRef.current>=0?"+":"")+`$${totalRef.current}`;bigEl.style.color=colorRef.current;tipEl.innerHTML="";return;}
          const idx=tip.dataPoints?.[0]?.dataIndex;
          if(idx==null||idx===0){return;}
          hoveringRef.current=true;
          const p=ptsRef.current[idx];
          const sg=p.net>=0?"+":"",st=p.value>=0?"+":"";
          const gc=p.net>=0?Up:Down,tc=p.value>=0?Up:Down;
          bigEl.textContent=`${st}$${p.value}`;bigEl.style.color=tc;
          tipEl.innerHTML=`<span style="color:#c9a84c">${p.label}</span> &nbsp;·&nbsp; game: <span style="color:${gc};font-weight:bold">${sg}$${p.net}</span> &nbsp;·&nbsp; total: <span style="color:${tc};font-weight:bold">${st}$${p.value}</span>`;
        }}},
        scales:{
          x:{grid:{color:"#ffffff05"},ticks:{color:"#333",font:{size:10},maxTicksLimit:6}},
          y:{grid:{color:"#ffffff05"},ticks:{color:"#333",font:{size:10},callback:v=>(v>=0?"+":"")+`$${Math.round(v)}`}}
        }
      }
    });
    ref.current.addEventListener("mouseleave",()=>{
      hoveringRef.current=false;
      const bigEl=document.getElementById("stat-big-num");
      const tipEl=document.getElementById("stat-tip");
      if(bigEl){bigEl.textContent=(totalRef.current>=0?"+":"")+`$${totalRef.current}`;bigEl.style.color=colorRef.current;}
      if(tipEl)tipEl.innerHTML="";
    });
    return()=>{if(chartRef.current)chartRef.current.destroy();};
  },[myGames,period,chartLoaded]);

  return <canvas ref={ref}/>;
}

function StatsScreen({profile,nav,myGames,myStats,myScore,myRank}){
  const isMobile=useIsMobile();
  const [period,setPeriod]=useState("1M");
  const PERIODS=["1W","1M","3M","1Y","ALL"];
  const cutoffs={"1W":7,"1M":30,"3M":90,"1Y":365,"ALL":9999};
  const now=new Date(),cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-cutoffs[period]);
  const pg=myGames.filter(g=>{const d=parseGameDate(g.date);return d>=cutoff;});
  const allTimeNet=myGames.reduce((s,g)=>s+g.net,0);
  const totalNet=pg.reduce((s,g)=>s+g.net,0);
  const wins=pg.filter(g=>g.net>0).length,losses=pg.filter(g=>g.net<0).length;
  const winRate=pg.length?Math.round((wins/pg.length)*100):0;
  const bestWin=myGames.length?Math.max(...myGames.map(g=>g.net)):0;
  const worstLoss=myGames.length?Math.min(...myGames.map(g=>g.net)):0;
  const avgPerGame=pg.length?Math.round(totalNet/pg.length):0;
  const color=allTimeNet>=0?Up:Down;
  const nextIdx=RANKS.findIndex(r=>r.tier===myRank.tier)+1,nextRank=RANKS[nextIdx]||null;
  const rankPct=nextRank?((myScore-myRank.min)/(myRank.max-myRank.min))*100:100;

  return(
    <MainContent isMobile={isMobile}>
      <PageHeader title="My Stats" subtitle="Your poker performance over time"/>

      {/* Glass chart card */}
      <div style={{background:`linear-gradient(135deg,#0d0d20,#080812)`,border:`1px solid #ffffff08`,borderRadius:20,padding:24,marginBottom:24}}>
        {/* Header row */}
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          <div style={{background:`${Gold}18`,border:`1px solid ${Gold}33`,borderRadius:10,padding:"6px 12px",color:Gold,fontSize:11,fontFamily:"monospace",letterSpacing:2}}>SHARKD</div>
          <div>
            <div id="stat-big-num" style={{fontSize:38,fontWeight:"bold",fontFamily:"monospace",color,transition:"color .1s"}}>{allTimeNet>=0?"+":""}${allTimeNet}</div>
            <div style={{color:"#555",fontSize:12,marginTop:2}}>all-time profit · {myGames.length} games</div>
          </div>
        </div>

        {/* Mini stats */}
        <div style={{display:"flex",gap:20,borderTop:`1px solid #1c1c2e`,borderBottom:`1px solid #1c1c2e`,padding:"12px 0",marginBottom:16,flexWrap:"wrap"}}>
          {[{lbl:"WIN RATE",val:`${winRate}%`,col:winRate>=50?Up:Down},{lbl:"BEST WIN",val:`+$${bestWin}`,col:Up},{lbl:"WORST LOSS",val:`-$${Math.abs(worstLoss)}`,col:Down},{lbl:"GAMES",val:myGames.length,col:"#fff"}].map(s=>(
            <div key={s.lbl}>
              <div style={{color:"#444",fontSize:11,fontFamily:"monospace",marginBottom:2}}>{s.lbl}</div>
              <div style={{fontSize:15,fontWeight:"bold",fontFamily:"monospace",color:s.col}}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Period pills */}
        <div style={{display:"flex",gap:4,marginBottom:14}}>
          {PERIODS.map(p=>(
            <div key={p} onClick={()=>setPeriod(p)} style={{padding:"6px 14px",borderRadius:6,cursor:"pointer",background:period===p?"#ffffff0a":"transparent",color:period===p?"#fff":"#555",fontSize:12,fontFamily:"monospace",transition:"all .15s"}}>{p}</div>
          ))}
        </div>

        {/* Hover tip */}
        <div id="stat-tip" style={{fontSize:12,color:"#444",fontFamily:"monospace",minHeight:18,marginBottom:10}}></div>

        {/* Chart */}
        <div style={{position:"relative",height:220}}>
          <InteractiveChart myGames={myGames} period={period}/>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:20}}>
        {/* Game breakdown */}
        <Card2>
          <SectionLabel text="Game Breakdown"/>
          {pg.length===0?<div style={{color:"#555",fontSize:13,textAlign:"center",padding:"16px"}}>No games in this period</div>:(
            <>
              {[{label:"Games played",val:pg.length,col:"#fff"},{label:"Profitable sessions",val:wins,col:Up},{label:"Losing sessions",val:losses,col:Down},{label:"Avg per session",val:`${avgPerGame>=0?"+":""}$${avgPerGame}`,col:avgPerGame>=0?Up:Down}].map(r=>(
                <div key={r.label} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${Border}`}}>
                  <span style={{color:"#666",fontSize:14}}>{r.label}</span>
                  <span style={{color:r.col,fontWeight:"bold",fontSize:14}}>{r.val}</span>
                </div>
              ))}
              <div style={{height:6,background:Border,borderRadius:3,overflow:"hidden",marginTop:16}}>
                <div style={{height:"100%",width:`${winRate}%`,background:Up,borderRadius:3}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                <span style={{color:Up,fontSize:11}}>{winRate}% wins</span>
                <span style={{color:Down,fontSize:11}}>{100-winRate}% losses</span>
              </div>
            </>
          )}
        </Card2>

        {/* Rank card */}
        <div onClick={()=>nav(S.RANK)} style={{background:`linear-gradient(135deg,${myRank.color}18,${Card})`,border:`1px solid ${myRank.color}44`,borderRadius:16,padding:"20px",cursor:"pointer"}}>
          <SectionLabel text="Your Rank"/>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
            <span style={{fontSize:48}}>{myRank.emoji}</span>
            <div>
              <div style={{color:myRank.color,fontWeight:"bold",fontSize:22}}>{myRank.tier}</div>
              <div style={{color:myRank.color,fontSize:36,fontWeight:"bold",fontFamily:"monospace"}}>{myScore.toFixed(1)}<span style={{fontSize:16,opacity:.6}}>/10</span></div>
            </div>
          </div>
          {nextRank&&<div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{color:"#555",fontSize:13}}>→ {nextRank.emoji} {nextRank.tier}</span><span style={{color:myRank.color,fontSize:13,fontFamily:"monospace"}}>{(nextRank.min-myScore).toFixed(2)} pts away</span></div>
            <div style={{height:6,background:"#1a1a2e",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${rankPct}%`,background:myRank.color,borderRadius:3}}/></div>
          </div>}
          <div style={{color:"#444",fontSize:12,marginTop:12,textAlign:"right"}}>View full rank card →</div>
        </div>
      </div>
    </MainContent>
  );
}

// ─── RANK SCREEN ─────────────────────────────────────────────────────────────
function RankScreen({nav,profile,myStats,myScore,myRank}){
  const isMobile=useIsMobile();  const [tab,setTab]=useState("card");
  const nextIdx=RANKS.findIndex(r=>r.tier===myRank.tier)+1,nextRank=RANKS[nextIdx]||null;
  const toNext=nextRank?nextRank.min-myScore:0,pct=nextRank?((myScore-myRank.min)/(myRank.max-myRank.min))*100:100;
  return(
    <MainContent isMobile={isMobile}>
      <PageHeader title="Your Rank" subtitle="Based on your real game stats"/>
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        {[["card","🏅 Card"],["metrics","📊 Metrics"],["ladder","🪜 Ladder"]].map(([t,label])=>(
          <div key={t} onClick={()=>setTab(t)} style={{padding:"9px 20px",borderRadius:10,cursor:"pointer",background:tab===t?`${myRank.color}22`:Card,border:`1px solid ${tab===t?myRank.color:Border}`,color:tab===t?myRank.color:"#555",fontWeight:"bold",fontSize:13,transition:"all .2s"}}>{label}</div>
        ))}
      </div>
      <div style={{maxWidth:700}}>
        {tab==="card"&&(
          <div style={{background:`linear-gradient(135deg,#0d0d1e,#13132a)`,border:`1px solid ${myRank.color}44`,borderRadius:24,padding:"40px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",right:-20,bottom:-30,fontSize:200,opacity:.03,color:myRank.color}}>♠</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
              <div>
                <div style={{color:myRank.color,fontSize:11,letterSpacing:3,fontFamily:"monospace",marginBottom:8}}>PLAYER RANK · SHARKD</div>
                <div style={{color:"#fff",fontSize:28,fontWeight:"bold",marginBottom:12}}>{profile.username}</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{background:`${myRank.color}22`,border:`1px solid ${myRank.color}55`,borderRadius:12,padding:"8px 20px",color:myRank.color,fontWeight:"bold",fontSize:18}}>{myRank.emoji} {myRank.tier}</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:myRank.color,fontSize:72,fontWeight:"bold",fontFamily:"monospace",textShadow:`0 0 40px ${myRank.color}88`,lineHeight:1}}>{myScore.toFixed(1)}</div>
                <div style={{color:"#555",fontSize:14}}>out of 10</div>
              </div>
            </div>
            <div style={{background:`${myRank.color}0e`,border:`1px solid ${myRank.color}1a`,borderRadius:12,padding:"14px 18px",color:"#888",fontSize:14,lineHeight:1.6,marginBottom:20,fontStyle:"italic"}}>"{myRank.desc}"</div>
            {nextRank?<div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"#555",fontSize:13}}>Progress to {nextRank.emoji} {nextRank.tier}</span><span style={{color:myRank.color,fontSize:13,fontFamily:"monospace"}}>{toNext.toFixed(2)} pts away</span></div>
              <div style={{height:6,background:"#1a1a2e",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${myRank.color}77,${myRank.color})`,borderRadius:3}}/></div>
            </div>:<div style={{background:`${Gold}18`,border:`1px solid ${Gold}44`,borderRadius:10,padding:"12px",color:Gold,fontWeight:"bold",fontSize:14,textAlign:"center"}}>🦈 Maximum rank achieved. You are the apex predator.</div>}
          </div>
        )}
        {tab==="metrics"&&(
          <Card2>
            <SectionLabel text={`Metrics — ${myStats.gamesPlayed} games played`}/>
            {METRICS.map((m,i)=>{
              const val=myStats[m.key]||0;
              return(
                <div key={m.key} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>{m.icon}</span><span style={{color:"#fff",fontSize:14,fontWeight:"bold"}}>{m.label}</span><span style={{color:"#555",fontSize:12}}>({(m.weight*100).toFixed(0)}%)</span></div>
                    <span style={{color:myRank.color,fontWeight:"bold",fontSize:14,fontFamily:"monospace"}}>{m.fmt(val)}</span>
                  </div>
                  <div style={{height:6,background:"#1a1a2e",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${val*10}%`,background:`linear-gradient(90deg,${myRank.color}77,${myRank.color})`,borderRadius:3}}/></div>
                </div>
              );
            })}
          </Card2>
        )}
        {tab==="ladder"&&(
          <Card2>
            {[...RANKS].reverse().map(r=>{
              const isCur=r.tier===myRank.tier,isAbove=r.min>myScore,pct2=isCur?((myScore-r.min)/(r.max-r.min))*100:0;
              return(
                <div key={r.tier} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:`1px solid ${Border}`,opacity:isAbove?.3:1}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:isCur?`${r.color}22`:"#0f0f1d",border:`2px solid ${isCur?r.color:"#2a2a3a"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:isCur?`0 0 16px ${r.color}55`:"none"}}>{r.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:isCur?r.color:"#aaa",fontWeight:"bold",fontSize:15}}>{r.tier}</span>{isCur&&<span style={{background:`${r.color}22`,border:`1px solid ${r.color}44`,borderRadius:6,padding:"2px 8px",fontSize:10,color:r.color,letterSpacing:1,fontFamily:"monospace"}}>YOU</span>}</div>
                    <div style={{color:"#333",fontSize:11,fontFamily:"monospace",marginTop:2}}>{r.min.toFixed(1)} – {r.max.toFixed(1)}</div>
                  </div>
                  <div style={{width:80,height:4,background:"#1a1a2e",borderRadius:2,overflow:"hidden"}}>
                    {isCur&&<div style={{height:"100%",width:`${pct2}%`,background:r.color,borderRadius:2}}/>}
                    {!isAbove&&!isCur&&<div style={{height:"100%",width:"100%",background:`${r.color}44`,borderRadius:2}}/>}
                  </div>
                </div>
              );
            })}
          </Card2>
        )}
      </div>
    </MainContent>
  );
}

// ─── FRIENDS ─────────────────────────────────────────────────────────────────
function FriendsScreen({nav,profile,friends,setFriends,setSelectedFriend}){
  const isMobile=useIsMobile();  const [search,setSearch]=useState(""),[confirmRemove,setConfirmRemove]=useState(null);
  const filtered=friends.filter(f=>f.name.toLowerCase().includes(search.toLowerCase())||f.username.toLowerCase().includes(search.toLowerCase()));
  return(
    <MainContent isMobile={isMobile}>
      <PageHeader title="Friends" subtitle={`${friends.length} friends`}
        action={<div style={{display:"flex",gap:12}}>
          <div onClick={()=>nav(S.RIVALS)} style={{padding:"10px 20px",borderRadius:10,background:`#a78bfa22`,border:`1px solid #a78bfa44`,color:"#a78bfa",fontWeight:"bold",fontSize:13,cursor:"pointer"}}>⚔️ Rivals</div>
          <Btn label="+ Add Friends" onClick={()=>nav(S.ADD_FRIENDS)}/>
        </div>}
      />
      <div style={{marginBottom:20,maxWidth:400}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or @username..." style={{width:"100%",background:Card,border:`1px solid ${Border}`,borderRadius:10,padding:"11px 16px",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
      </div>
      {filtered.length===0?<Card2 style={{textAlign:"center",padding:"48px"}}><div style={{fontSize:48,marginBottom:12}}>👥</div><div style={{color:"#555",fontSize:14}}>No friends yet. Add some!</div><div style={{marginTop:16}}><Btn label="+ Add Friends" onClick={()=>nav(S.ADD_FRIENDS)}/></div></Card2>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
          {filtered.map(f=>(
            <div key={f.id} style={{background:Card,border:`1px solid ${Border}`,borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
              <div onClick={()=>{setSelectedFriend(f);nav(S.FRIEND_PROFILE);}} style={{display:"flex",alignItems:"center",gap:12,flex:1,cursor:"pointer"}}>
                <Avatar char={f.avatar} color={f.color} size={44} fontSize={18}/>
                <div style={{flex:1}}>
                  <div style={{color:"#fff",fontWeight:"bold",fontSize:15}}>{f.name}</div>
                  <div style={{color:"#444",fontSize:12,marginTop:2,fontFamily:"monospace"}}>@{f.username}</div>
                  {f.venmo&&<div style={{color:"#00a4eb",fontSize:11,marginTop:2}}>💸 @{f.venmo}</div>}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:f.allTime>=0?Up:Down,fontWeight:"bold",fontSize:15}}>{f.allTime>=0?"+":""}${f.allTime}</div>
                  <div style={{color:"#444",fontSize:11,marginTop:2}}>all time</div>
                </div>
              </div>
              <div onClick={()=>setConfirmRemove(f.id)} style={{width:28,height:28,borderRadius:"50%",background:`${Down}18`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:Down,flexShrink:0}}>×</div>
            </div>
          ))}
        </div>
      )}
      {confirmRemove&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
          <div style={{background:"#13131f",border:`1px solid ${Border}`,borderRadius:20,padding:"32px",width:380}}>
            <div style={{color:"#fff",fontWeight:"bold",fontSize:18,marginBottom:8}}>Remove {friends.find(x=>x.id===confirmRemove)?.name}?</div>
            <div style={{color:"#555",fontSize:14,marginBottom:24}}>They'll be removed from your friends list.</div>
            <div style={{display:"flex",gap:12}}>
              <Btn label="Cancel" onClick={()=>setConfirmRemove(null)} outline/>
              <div onClick={()=>{setFriends(prev=>prev.filter(f=>f.id!==confirmRemove));setConfirmRemove(null);}} style={{flex:1,background:`${Down}22`,border:`1px solid ${Down}44`,borderRadius:12,padding:"12px",textAlign:"center",color:Down,fontWeight:"bold",cursor:"pointer",fontSize:14}}>Remove</div>
            </div>
          </div>
        </div>
      )}
    </MainContent>
  );
}

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
function LeaderboardScreen({profile,friends,myGames,nav,setSelectedFriend,setSelectedWorldPlayer}){
  const isMobile=useIsMobile();  const [tab,setTab]=useState("friends"),[worldSearch,setWorldSearch]=useState("");
  const myAllTime=myGames.reduce((s,g)=>s+g.net,0);
  const friendsSorted=[...friends,{id:0,name:profile?.username||"You",avatar:profile?.avatarChar||"♠",color:profile?.avatarColor||Gold,allTime:myAllTime,isYou:true,username:(profile?.username||"you").toLowerCase().replace(/\s/g,"_")}].sort((a,b)=>b.allTime-a.allTime);
  const medals=["🥇","🥈","🥉"];
  return(
    <MainContent isMobile={isMobile}>
      <PageHeader title="Leaderboard" subtitle="See how you stack up"/>
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        {[["friends","👥 Friends"],["world","🌍 World"]].map(([t,label])=>(
          <div key={t} onClick={()=>setTab(t)} style={{padding:"9px 20px",borderRadius:10,cursor:"pointer",background:tab===t?`${Gold}22`:Card,border:`1px solid ${tab===t?Gold:Border}`,color:tab===t?Gold:"#555",fontWeight:"bold",fontSize:13,transition:"all .2s"}}>{label}</div>
        ))}
      </div>
      {tab==="friends"&&(
        <div style={{maxWidth:700}}>
          {friendsSorted.map((f,i)=>(
            <div key={f.id} onClick={()=>{if(!f.isYou&&setSelectedFriend){const fr=friends.find(x=>x.name===f.name);if(fr){setSelectedFriend(fr);nav(S.FRIEND_PROFILE);}}}}
              style={{display:"flex",alignItems:"center",gap:14,padding:"16px 20px",background:f.isYou?`linear-gradient(135deg,${Gold}12,${Card})`:i===0?`linear-gradient(135deg,#1e1a0a,${Card})`:Card,border:`1px solid ${f.isYou?`${Gold}44`:i===0?`${Gold}22`:Border}`,borderRadius:14,marginBottom:10,cursor:f.isYou?"default":"pointer"}}>
              <div style={{width:36,textAlign:"center",fontSize:i<3?22:14,color:i<3?Gold:"#444"}}>{medals[i]||`#${i+1}`}</div>
              <Avatar char={f.avatar} color={f.isYou?Gold:f.color} size={44} fontSize={18}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:f.isYou?Gold:"#fff",fontWeight:"bold",fontSize:16}}>{f.isYou?(profile?.username||"You"):f.name}</span>{f.isYou&&<span style={{background:`${Gold}22`,border:`1px solid ${Gold}44`,borderRadius:6,padding:"2px 8px",fontSize:10,color:Gold,letterSpacing:1}}>YOU</span>}</div>
                <div style={{color:"#444",fontSize:12,marginTop:2,fontFamily:"monospace"}}>@{f.username||f.name.toLowerCase()}</div>
              </div>
              <div style={{color:f.allTime>=0?Up:Down,fontWeight:"bold",fontSize:20,fontFamily:"monospace"}}>{f.allTime>=0?"+":""}${f.allTime}</div>
            </div>
          ))}
        </div>
      )}
      {tab==="world"&&(
        <Card2 style={{textAlign:"center",padding:"48px"}}>
          <div style={{fontSize:48,marginBottom:12}}>🌍</div>
          <div style={{color:"#fff",fontWeight:"bold",fontSize:18,marginBottom:8}}>World Leaderboard</div>
          <div style={{color:"#555",fontSize:14}}>Coming soon — connect with players worldwide</div>
        </Card2>
      )}
    </MainContent>
  );
}

// ─── GROUPS ──────────────────────────────────────────────────────────────────
function GroupsScreen({nav,groups,setGroups,myGames,setSelectedGroup,friends}){
  const isMobile=useIsMobile();  const [showCreate,setShowCreate]=useState(false),[newName,setNewName]=useState("");
  return(
    <MainContent isMobile={isMobile}>
      <PageHeader title="Groups" subtitle="Your regular crews"
        action={<Btn label="+ New Group" onClick={()=>setShowCreate(true)}/>}
      />
      {groups.length===0?<Card2 style={{textAlign:"center",padding:"48px"}}><div style={{fontSize:48,marginBottom:12}}>👥</div><div style={{color:"#555",fontSize:14,marginBottom:16}}>No groups yet. Create one for your regular crew!</div><Btn label="+ Create Group" onClick={()=>setShowCreate(true)}/></Card2>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
          {groups.map(g=>{
            const gGames=myGames.filter(h=>h.groupId===g.id);
            const gNet=gGames.reduce((s,h)=>s+(h.net||0),0);
            return(
              <div key={g.id} onClick={()=>{setSelectedGroup(g);nav(S.GROUP_DETAIL);}} style={{background:Card,border:`1px solid ${g.color}33`,borderRadius:18,padding:"24px",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                  <div style={{width:52,height:52,borderRadius:16,background:`${g.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{g.emoji}</div>
                  <div style={{flex:1}}><div style={{color:"#fff",fontWeight:"bold",fontSize:18}}>{g.name}</div><div style={{color:"#555",fontSize:13,marginTop:2}}>{g.members.length} players · {gGames.length||g.games} games</div></div>
                  <div style={{textAlign:"right"}}><div style={{color:gNet>=0?Up:Down,fontWeight:"bold",fontSize:18}}>{gNet>=0?"+":""}${gNet}</div><div style={{color:"#555",fontSize:11,marginTop:2}}>your record</div></div>
                </div>
                <div style={{display:"flex",gap:-6}}>
                  {g.members.slice(0,6).map((m,i)=>{
                    const f=friends.find(f=>f.name===m);
                    return <div key={i} style={{width:28,height:28,borderRadius:"50%",background:`${f?.color||"#555"}22`,border:`2px solid ${f?.color||"#555"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:f?.color||"#555",fontWeight:"bold",marginLeft:i>0?-8:0,zIndex:6-i}}>{m[0]}</div>;
                  })}
                </div>
                <div style={{color:"#555",fontSize:12,marginTop:12}}>Last game: {gGames[0]?.date||g.lastGame}</div>
              </div>
            );
          })}
        </div>
      )}
      {showCreate&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
          <div style={{background:"#13131f",border:`1px solid ${Border}`,borderRadius:20,padding:"32px",width:400}}>
            <div style={{color:"#fff",fontWeight:"bold",fontSize:18,marginBottom:20}}>Create Group</div>
            <div style={{color:"#555",fontSize:11,fontFamily:"monospace",letterSpacing:1,marginBottom:8}}>GROUP NAME</div>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Friday Night Crew" autoFocus style={{width:"100%",background:BG,border:`1px solid ${Border}`,borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:15,boxSizing:"border-box",outline:"none",marginBottom:20}}/>
            <div style={{display:"flex",gap:12}}>
              <Btn label="Cancel" onClick={()=>setShowCreate(false)} outline/>
              <div onClick={()=>{if(!newName.trim())return;const ng={id:Date.now(),name:newName.trim(),emoji:"🃏",color:"#a78bfa",members:[],games:0,lastGame:"—"};setGroups(prev=>[...prev,ng]);if(window._sharkdUid)saveGroup(window._sharkdUid,ng);setNewName("");setShowCreate(false);}} style={{flex:1,background:`linear-gradient(135deg,${Gold},${GoldDim})`,borderRadius:12,padding:"12px",textAlign:"center",color:BG,fontWeight:"bold",cursor:"pointer",fontSize:14}}>Create</div>
            </div>
          </div>
        </div>
      )}
    </MainContent>
  );
}

// ─── GROUP DETAIL ─────────────────────────────────────────────────────────────
function GroupDetailScreen({nav,group,myGames,setSelectedGame,friends}){
  const isMobile=useIsMobile();  if(!group){nav(S.GROUPS);return null;}
  const gGames=myGames.filter(h=>h.groupId===group.id);
  return(
    <MainContent isMobile={isMobile}>
      <div onClick={()=>nav(S.GROUPS)} style={{color:Gold,fontSize:13,cursor:"pointer",marginBottom:16,display:"inline-flex",alignItems:"center",gap:6}}>← Back to Groups</div>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:28}}>
        <div style={{width:60,height:60,borderRadius:18,background:`${group.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>{group.emoji}</div>
        <div><div style={{color:"#fff",fontWeight:"bold",fontSize:24}}>{group.name}</div><div style={{color:"#555",fontSize:14,marginTop:4}}>{group.members.length} players · {gGames.length} games</div></div>
      </div>
      <SectionLabel text="Members"/>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24}}>
        {group.members.map(m=>{const f=friends.find(f=>f.name===m);return(<div key={m} style={{background:Card,border:`1px solid ${f?.color||Border}33`,borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",gap:8}}><div style={{width:24,height:24,borderRadius:"50%",background:`${f?.color||"#555"}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:f?.color||"#555",fontWeight:"bold"}}>{m[0]}</div><span style={{color:"#fff",fontSize:13}}>{m}</span></div>);})}
      </div>
      <SectionLabel text="Games"/>
      {gGames.length===0?<Card2 style={{textAlign:"center",padding:"32px"}}><div style={{color:"#555",fontSize:13}}>No games logged for this group yet</div></Card2>
        :gGames.map(g=>{const myResult=g.results?.find(r=>r.name==="You");const pot=g.results?.reduce((s,r)=>s+(r.buyin||0),0)||0;return(
          <div key={g.id} onClick={()=>{setSelectedGame(g);nav(S.GAME_DETAIL);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",background:Card,border:`1px solid ${Border}`,borderRadius:14,marginBottom:10,cursor:"pointer"}}>
            <div><div style={{color:"#fff",fontWeight:"bold",fontSize:15}}>{g.game}</div><div style={{color:"#555",fontSize:12,marginTop:2}}>{g.date} · ${pot} pot</div></div>
            <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}><Tag text={g.settled?"✓ Settled":"⏳ Pending"} color={g.settled?Up:Gold}/>{myResult&&<div style={{color:myResult.net>=0?Up:Down,fontWeight:"bold",fontSize:15}}>{myResult.net>=0?"+":""}${myResult.net}</div>}</div>
          </div>
        );})}
    </MainContent>
  );
}

// ─── RIVALS ──────────────────────────────────────────────────────────────────
function RivalsScreen({nav,friends,myGames}){
  const isMobile=useIsMobile();  const buildRival=fname=>{
    const shared=myGames.filter(g=>(g.players||[]).includes(fname)&&(g.players||[]).includes("You"));
    const wins=shared.filter(g=>{const me=g.results?.find(r=>r.name==="You"),them=g.results?.find(r=>r.name===fname);return me&&them&&me.net>them.net;}).length;
    const losses=shared.filter(g=>{const me=g.results?.find(r=>r.name==="You"),them=g.results?.find(r=>r.name===fname);return me&&them&&me.net<them.net;}).length;
    const netVs=shared.reduce((s,g)=>{const me=g.results?.find(r=>r.name==="You"),them=g.results?.find(r=>r.name===fname);return s+(me?.net||0)-(them?.net||0);},0);
    const games=shared.slice(0,5).map(g=>{const me=g.results?.find(r=>r.name==="You"),them=g.results?.find(r=>r.name===fname);return{date:g.date,net:me?.net||0,vsNet:them?.net||0};});
    return{wins,losses,draws:shared.length-wins-losses,netVs,games,total:shared.length};
  };
  return(
    <MainContent isMobile={isMobile}>
      <PageHeader title="Rivals" subtitle="Your head-to-head record against every friend"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
        {friends.map(f=>{
          const r=buildRival(f.name);
          const pct=r.total?Math.round((r.wins/r.total)*100):0;
          return(
            <Card2 key={f.id}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                <Avatar char={f.avatar} color={f.color} size={44} fontSize={18}/>
                <div style={{flex:1}}><div style={{color:"#fff",fontWeight:"bold",fontSize:16}}>{f.name}</div><div style={{color:"#444",fontSize:12,fontFamily:"monospace"}}>@{f.username}</div></div>
                <div style={{textAlign:"right"}}><div style={{color:r.netVs>=0?Up:Down,fontWeight:"bold",fontSize:18}}>{r.netVs>=0?"+":""}${r.netVs}</div><div style={{color:"#555",fontSize:11}}>net vs</div></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                {[{l:"Wins",v:r.wins,c:Up},{l:"Losses",v:r.losses,c:Down},{l:"Games",v:r.total,c:"#fff"}].map(s=>(
                  <div key={s.l} style={{background:`${s.c}0a`,border:`1px solid ${s.c}22`,borderRadius:10,padding:"10px",textAlign:"center"}}><div style={{color:s.c,fontWeight:"bold",fontSize:20}}>{s.v}</div><div style={{color:"#555",fontSize:11}}>{s.l}</div></div>
                ))}
              </div>
              {r.total>0&&<><div style={{height:5,background:Border,borderRadius:3,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:`${pct}%`,background:Up,borderRadius:3}}/></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:Up,fontSize:11}}>{pct}% win rate</span><span style={{color:Down,fontSize:11}}>{100-pct}% loss rate</span></div></>}
              {r.total===0&&<div style={{color:"#444",fontSize:12,textAlign:"center"}}>No shared games yet</div>}
            </Card2>
          );
        })}
      </div>
      {friends.length===0&&<Card2 style={{textAlign:"center",padding:"48px"}}><div style={{fontSize:48,marginBottom:12}}>⚔️</div><div style={{color:"#555",fontSize:14}}>Add friends to see your rivalry stats</div></Card2>}
    </MainContent>
  );
}

// ─── FEED ────────────────────────────────────────────────────────────────────
function FeedScreen({nav,feedItems}){
  const isMobile=useIsMobile();  const icons={win:"🏆",loss:"💸",rank:"⚡",streak:"🔥",game:"🃏"};
  return(
    <MainContent isMobile={isMobile}>
      <PageHeader title="Friend Activity" subtitle="See what your crew is up to"/>
      <div style={{maxWidth:700}}>
        {feedItems.length===0?<Card2 style={{textAlign:"center",padding:"48px"}}><div style={{fontSize:48,marginBottom:12}}>📡</div><div style={{color:"#555",fontSize:14}}>No activity yet. Log a game to see results here.</div></Card2>
          :feedItems.map(item=>(
            <div key={item.id} style={{background:item.isMe?`${Gold}08`:Card,border:`1px solid ${item.isMe?`${Gold}22`:Border}`,borderRadius:14,padding:"16px 20px",marginBottom:10,display:"flex",alignItems:"center",gap:14}}>
              <div style={{position:"relative",flexShrink:0}}>
                <Avatar char={item.avatar} color={item.color} size={44} fontSize={18}/>
                <div style={{position:"absolute",bottom:-2,right:-2,width:20,height:20,borderRadius:"50%",background:Card,border:`1px solid ${Border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>{icons[item.type]||"📌"}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{color:"#fff",fontSize:14,lineHeight:1.5}}>
                  <span style={{fontWeight:"bold",color:item.isMe?Gold:item.color}}>{item.isMe?"You":item.player}</span>
                  {item.type==="win"&&<span style={{color:"#888"}}> won <span style={{color:Up,fontWeight:"bold"}}>+${item.amount}</span> in {item.game}</span>}
                  {item.type==="loss"&&<span style={{color:"#888"}}> lost <span style={{color:Down,fontWeight:"bold"}}>${Math.abs(item.amount)}</span> in {item.game}</span>}
                  {item.type==="rank"&&<span style={{color:"#888"}}> ranked up to <span style={{color:Gold,fontWeight:"bold"}}>{item.rank}</span> 🎉</span>}
                  {item.type==="streak"&&<span style={{color:"#888"}}> is on a <span style={{color:Gold,fontWeight:"bold"}}>{item.streak}-game streak</span> 🔥</span>}
                  {item.type==="game"&&<span style={{color:"#888"}}> logged <span style={{color:Gold,fontWeight:"bold"}}>{item.game}</span></span>}
                </div>
                <div style={{color:"#555",fontSize:12,marginTop:4}}>{item.time}</div>
              </div>
            </div>
          ))
        }
      </div>
    </MainContent>
  );
}

// ─── ADD FRIENDS ─────────────────────────────────────────────────────────────
function AddFriendsScreen({nav,showToast,friends,setFriends,profile}){
  const isMobile=useIsMobile();
  const [search,setSearch]=useState("");
  const [results,setResults]=useState([]);
  const [searching,setSearching]=useState(false);
  const [sent,setSent]=useState({});

  const doSearch=async()=>{
    const q=search.trim().toLowerCase().replace(/^@/,"");
    if(!q||q.length<3)return;
    setSearching(true);
    setResults([]);
    try{
      const app=getFirebase();
      if(!app)throw new Error("no firebase");
      const db=window.firebase_firestore.getFirestore(app);
      const snap=await window.firebase_firestore.getDocs(
        window.firebase_firestore.query(
          window.firebase_firestore.collection(db,"users"),
          window.firebase_firestore.where("username","==",q)
        )
      );
      const found=snap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.username!==profile.username);
      setResults(found);
    }catch(e){console.error(e);}
    setSearching(false);
  };

  const addFriend=async(u)=>{
    await sendFriendRequest(profile.uid,profile.username,profile.fullName||profile.username,u.id);
    setSent(s=>({...s,[u.id]:true}));
    showToast(`✓ Friend request sent to @${u.username}!`);
  };

  return(
    <MainContent isMobile={isMobile}>
      <PageHeader title="Add Friends" subtitle="Find players by their Sharkd username"/>
      <div style={{maxWidth:600}}>
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} placeholder="Search @username..." autoFocus style={{flex:1,background:Card,border:`1px solid ${Border}`,borderRadius:12,padding:"13px 16px",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box"}}/>
          <div onClick={doSearch} style={{background:`${Gold}22`,border:`1px solid ${Gold}44`,borderRadius:12,padding:"13px 20px",color:Gold,fontWeight:"bold",fontSize:14,cursor:"pointer",whiteSpace:"nowrap"}}>{searching?"...":"Search"}</div>
        </div>
        {searching&&<Card2 style={{textAlign:"center",padding:"32px",marginBottom:16}}><div style={{color:"#555",fontSize:14}}>Searching...</div></Card2>}
        {!searching&&results.length>0&&results.map(u=>{
          const alreadyFriend=friends.find(f=>f.id===u.id);
          return(
            <div key={u.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",background:Card,border:`1px solid ${Border}`,borderRadius:14,marginBottom:10}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:`${Gold}22`,border:`2px solid ${Gold}44`,display:"flex",alignItems:"center",justifyContent:"center",color:Gold,fontWeight:"bold",fontSize:18}}>{u.username?.[0]?.toUpperCase()||"?"}</div>
              <div style={{flex:1}}>
                <div style={{color:"#fff",fontWeight:"bold",fontSize:15}}>{u.fullName||u.username}</div>
                <div style={{color:"#444",fontSize:12,fontFamily:"monospace"}}>@{u.username}</div>
              </div>
              {alreadyFriend?
                <div style={{color:"#555",fontSize:13,fontFamily:"monospace"}}>Already friends</div>:
                sent[u.id]?
                <div style={{color:Up,fontSize:13,fontFamily:"monospace"}}>✓ Request Sent</div>:
                <div onClick={()=>addFriend(u)} style={{background:`${Gold}22`,border:`1px solid ${Gold}44`,borderRadius:10,padding:"9px 18px",color:Gold,fontSize:13,fontWeight:"bold",cursor:"pointer"}}>Send Request</div>
              }
            </div>
          );
        })}
        {!searching&&search.length>0&&results.length===0&&(
          <Card2 style={{textAlign:"center",padding:"32px",marginBottom:16}}>
            <div style={{fontSize:32,marginBottom:8}}>🔍</div>
            <div style={{color:"#555",fontSize:14}}>No user found for "@{search.replace(/^@/,"")}"</div>
            <div style={{color:"#444",fontSize:12,marginTop:6}}>Make sure it's their exact Sharkd username</div>
          </Card2>
        )}
        {search.length===0&&results.length===0&&(
          <Card2 style={{textAlign:"center",padding:"32px",marginBottom:16}}>
            <div style={{fontSize:32,marginBottom:8}}>👥</div>
            <div style={{color:"#555",fontSize:14}}>Search for a player by their Sharkd username</div>
          </Card2>
        )}
        <div style={{marginTop:20,background:Card,border:`1px solid ${Border}`,borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:28}}>🔗</span>
          <div style={{flex:1}}><div style={{color:"#fff",fontWeight:"bold",fontSize:15}}>Invite via link</div><div style={{color:"#555",fontSize:13,marginTop:2}}>Share your invite link with friends</div></div>
          <Btn label="Copy Link" onClick={()=>showToast("✓ Link copied!")} size="sm"/>
        </div>
      </div>
    </MainContent>
  );
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
function NotificationsScreen({nav,notifs,markAllRead,setNotifs,setFriends,profile,showToast}){
  const isMobile=useIsMobile();
  const icons={request:"💸",confirm:"✅",game:"🃏",friend:"👥",rival:"⚔️",friendRequest:"👥"};

  const handleAccept=async(n)=>{
    const newFriend=await acceptFriendRequest(profile.uid,profile.username,profile.fullName||profile.username,n.req);
    if(newFriend){
      setFriends(prev=>[...prev,newFriend]);
      setNotifs(prev=>prev.filter(x=>x.id!==n.id));
      showToast(`✓ You and @${n.from} are now friends!`);
    }
  };
  const handleDecline=async(n)=>{
    try{
      const app=getFirebase();if(!app)return;
      const db=window.firebase_firestore.getFirestore(app);
      await window.firebase_firestore.deleteDoc(window.firebase_firestore.doc(db,"users",profile.uid,"friendRequests",n.req.reqId));
    }catch(e){}
    setNotifs(prev=>prev.filter(x=>x.id!==n.id));
    showToast("Friend request declined.");
  };

  return(
    <MainContent isMobile={isMobile}>
      <PageHeader title="Notifications" action={notifs.some(n=>!n.read)?<Btn label="Mark all read" onClick={markAllRead} outline size="sm"/>:null}/>
      <div style={{maxWidth:700}}>
        {notifs.length===0?<Card2 style={{textAlign:"center",padding:"48px"}}><div style={{fontSize:48,marginBottom:12}}>🔔</div><div style={{color:"#555",fontSize:14}}>No notifications yet</div></Card2>
          :notifs.map(n=>(
            <div key={n.id} style={{background:n.read?Card:`${Gold}08`,border:`1px solid ${n.read?Border:`${Gold}22`}`,borderRadius:14,padding:"16px 20px",marginBottom:10,display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:n.read?"#1a1a2e":`${Gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{icons[n.type]||"🔔"}</div>
              <div style={{flex:1}}><div style={{color:n.read?"#888":"#fff",fontSize:14,lineHeight:1.5}}>{n.msg}</div><div style={{color:"#555",fontSize:12,marginTop:3}}>{n.time}</div></div>
              {n.type==="friendRequest"?(
                <div style={{display:"flex",gap:8}}>
                  <div onClick={()=>handleAccept(n)} style={{background:`${Up}22`,border:`1px solid ${Up}44`,borderRadius:8,padding:"8px 14px",color:Up,fontWeight:"bold",fontSize:13,cursor:"pointer"}}>Accept</div>
                  <div onClick={()=>handleDecline(n)} style={{background:`${Down}22`,border:`1px solid ${Down}44`,borderRadius:8,padding:"8px 14px",color:Down,fontWeight:"bold",fontSize:13,cursor:"pointer"}}>Decline</div>
                </div>
              ):(!n.read&&<div style={{width:10,height:10,borderRadius:"50%",background:Gold,flexShrink:0}}/>)}
            </div>
          ))
        }
      </div>
    </MainContent>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
function SettingsScreen({nav,profile,setProfile,showToast,onLogout}){
  const isMobile=useIsMobile();  const [tab,setTab]=useState("profile"),[username,setUsername]=useState(profile.username);
  const [venmo,setVenmo]=useState(profile.venmo||"");
  const saveProfile=()=>{if(!username.trim())return;setProfile(p=>({...p,username:username.trim(),venmo:venmo.trim().replace(/^@/,"")}));showToast("✓ Profile saved!");};
  return(
    <MainContent isMobile={isMobile}>
      <PageHeader title="Settings"/>
      <div style={{display:"flex",gap:24}}>
        {/* Tabs */}
        <div style={{width:200,flexShrink:0}}>
          {[["profile","👤 Profile"],["security","🔒 Security"],["privacy","🔏 Privacy"]].map(([t,label])=>(
            <div key={t} onClick={()=>setTab(t)} style={{padding:"12px 16px",borderRadius:10,cursor:"pointer",background:tab===t?`${Gold}18`:"transparent",borderLeft:tab===t?`3px solid ${Gold}`:"3px solid transparent",color:tab===t?Gold:"#666",fontWeight:tab===t?"bold":"normal",fontSize:14,marginBottom:4,transition:"all .15s"}}>{label}</div>
          ))}
          <div onClick={onLogout} style={{padding:"12px 16px",borderRadius:10,cursor:"pointer",color:Down,fontSize:14,marginTop:16,borderLeft:"3px solid transparent"}}>🚪 Sign Out</div>
        </div>

        {/* Content */}
        <div style={{flex:1,maxWidth:600}}>
          {tab==="profile"&&(
            <Card2>
              <SectionLabel text="Display Name"/>
              <input value={username} onChange={e=>setUsername(e.target.value)} style={{width:"100%",background:BG,border:`1px solid ${Border}`,borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:16,boxSizing:"border-box",outline:"none",marginBottom:20}}/>
              <SectionLabel text="Venmo Username"/>
              <div style={{position:"relative",marginBottom:8}}>
                <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#00a4eb",fontSize:16,fontWeight:"bold",pointerEvents:"none"}}>@</span>
                <input value={venmo} onChange={e=>setVenmo(e.target.value.replace(/^@/,""))} placeholder="your-venmo-handle" style={{width:"100%",background:BG,border:`1px solid #00a4eb33`,borderRadius:10,padding:"12px 16px 12px 32px",color:"#fff",fontSize:15,boxSizing:"border-box",outline:"none",fontFamily:"monospace"}}/>
              </div>
              <div style={{color:"#444",fontSize:12,marginBottom:20}}>Friends see this to know where to pay you — no payments processed here</div>
              <Btn label="Save Profile" onClick={saveProfile}/>
            </Card2>
          )}
          {tab==="security"&&(
            <Card2>
              <SectionLabel text="Account"/>
              <div style={{color:"#555",fontSize:14,marginBottom:20,lineHeight:1.6}}>Signed in with Google. Password management is handled through your Google account.</div>
              <div style={{background:`${Down}0a`,border:`1px solid ${Down}22`,borderRadius:12,padding:"20px"}}>
                <div style={{color:"#fff",fontWeight:"bold",marginBottom:6}}>Delete Account</div>
                <div style={{color:"#555",fontSize:13,marginBottom:14,lineHeight:1.6}}>Permanently delete your account and all game history. This cannot be undone.</div>
                <div style={{background:`${Down}18`,border:`1px solid ${Down}44`,borderRadius:10,padding:"12px",textAlign:"center",color:Down,fontWeight:"bold",fontSize:14,cursor:"pointer"}}>Delete My Account</div>
              </div>
            </Card2>
          )}
          {tab==="privacy"&&(
            <Card2>
              <SectionLabel text="Profile Visibility"/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0",borderBottom:`1px solid ${Border}`}}>
                <div><div style={{color:"#fff",fontWeight:"bold",fontSize:15}}>Public Profile</div><div style={{color:"#555",fontSize:13,marginTop:2}}>Anyone can search and view your stats</div></div>
                <div onClick={()=>setProfile(p=>({...p,isPublic:!p.isPublic}))} style={{width:48,height:26,borderRadius:13,background:profile.isPublic?Up:"#2a2a3a",position:"relative",cursor:"pointer",transition:"background .25s",flexShrink:0}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:profile.isPublic?25:3,transition:"left .25s"}}/>
                </div>
              </div>
            </Card2>
          )}
        </div>
      </div>
    </MainContent>
  );
}

// ─── EDIT GAME ────────────────────────────────────────────────────────────────
function EditGameScreen({nav,game,editGame,profile}){
  const isMobile=useIsMobile();  const [amounts,setAmounts]=useState(()=>{const a={};(game?.results||[]).forEach(r=>{a[r.name]={buyin:String(r.buyin||0),cashout:String(r.cashout||0)};});return a;});
  const [focusedCell,setFocusedCell]=useState(null);
  if(!game){nav(S.HISTORY);return null;}
  const upd=(name,field,val)=>{const clean=val.replace(/[^0-9.]/g,"").replace(/^(\d*\.?\d{0,2}).*$/,"$1");setAmounts(prev=>({...prev,[name]:{...prev[name],[field]:clean}}));};
  const players=game.results||[];
  const nets=players.map(p=>{const a=amounts[p.name]||{};const b=parseCents(a.buyin||""),c=parseCents(a.cashout||"");return{name:p.name,buyinCents:b,cashoutCents:c,netCents:c-b};});
  const totalBuyin=nets.reduce((s,n)=>s+n.buyinCents,0),totalCashout=nets.reduce((s,n)=>s+n.cashoutCents,0);
  const balanced=totalBuyin>0&&totalBuyin===totalCashout;
  const save=()=>{editGame(game.id,nets.map(n=>({name:n.name,buyin:Math.round(n.buyinCents/100),cashout:Math.round(n.cashoutCents/100),net:Math.round(n.netCents/100)})));nav(S.GAME_DETAIL);};
  return(
    <MainContent isMobile={isMobile}>
      <div onClick={()=>nav(S.GAME_DETAIL)} style={{color:Gold,fontSize:13,cursor:"pointer",marginBottom:16,display:"inline-flex",alignItems:"center",gap:6}}>← Back</div>
      <PageHeader title={`Edit: ${game.game}`} subtitle="Fix any incorrect amounts"/>
      <div style={{maxWidth:700}}>
        {players.map(p=>{
          const a=amounts[p.name]||{},net=nets.find(n=>n.name===p.name),netC=net?.netCents||0;
          const hasData=(a.buyin||"")!==""&&(a.cashout||"")!=="";
          const rc=!hasData?Border:netC>0?Up:netC<0?Down:"#888";
          return(
            <div key={p.name} style={{background:Card,border:`1.5px solid ${rc}44`,borderRadius:14,padding:"16px 20px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:`${rc}22`,display:"flex",alignItems:"center",justifyContent:"center",color:rc,fontWeight:"bold",fontSize:14}}>{p.name[0]}</div>
                  <span style={{color:"#fff",fontWeight:"bold",fontSize:15}}>{p.name==="You"?(profile?.username||"You"):p.name}</span>
                </div>
                {hasData&&<div style={{color:netC>0?Up:netC<0?Down:"#888",fontWeight:"bold",fontSize:18,fontFamily:"monospace"}}>{netC>0?"+":""}{fmtCents(netC)}</div>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[{field:"buyin",label:"TOTAL BUY-IN"},{field:"cashout",label:"CASH OUT"}].map(({field,label})=>{
                  const cellKey=`${p.name}-${field}`,focused=focusedCell===cellKey;
                  return(<div key={field}><div style={{color:focused?Gold:"#555",fontSize:10,marginBottom:6,fontFamily:"monospace",letterSpacing:1}}>{label}</div><div style={{position:"relative"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:focused?Gold:"#555",fontSize:16,fontWeight:"bold",pointerEvents:"none"}}>$</span><input value={a[field]||""} onChange={e=>upd(p.name,field,e.target.value)} onFocus={()=>setFocusedCell(cellKey)} onBlur={()=>setFocusedCell(null)} placeholder="0.00" inputMode="decimal" style={{width:"100%",background:focused?"#13132a":BG,border:`1.5px solid ${focused?Gold:Border}`,borderRadius:10,padding:"11px 12px 11px 28px",color:"#fff",fontSize:18,fontWeight:"bold",boxSizing:"border-box",outline:"none",fontFamily:"monospace"}}/></div></div>);
                })}
              </div>
            </div>
          );
        })}
        <div style={{background:balanced?`${Up}0a`:`${Down}0a`,border:`1px solid ${balanced?`${Up}33`:`${Down}33`}`,borderRadius:14,padding:"14px 20px",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{color:"#555",fontSize:14}}>Total buy-in</span><span style={{color:"#fff",fontWeight:"bold",fontFamily:"monospace"}}>{fmtCents(totalBuyin)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{color:"#555",fontSize:14}}>Total cashout</span><span style={{color:"#fff",fontWeight:"bold",fontFamily:"monospace"}}>{fmtCents(totalCashout)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#888",fontSize:14}}>Difference</span><span style={{color:balanced?Up:Down,fontWeight:"bold",fontFamily:"monospace",fontSize:16}}>{balanced?"✓ Balanced":fmtCents(totalCashout-totalBuyin)}</span></div>
        </div>
        <div style={{display:"flex",gap:12}}>
          <Btn label="← Cancel" onClick={()=>nav(S.GAME_DETAIL)} outline/>
          <div style={{opacity:balanced?1:0.4,flex:1}}><Btn label="Save Changes ✓" onClick={()=>{if(balanced)save();}} size="lg"/></div>
        </div>
      </div>
    </MainContent>
  );
}

// ─── FRIEND PROFILE ──────────────────────────────────────────────────────────
function FriendProfileScreen({nav,friend,fromScreen,profile}){
  const isMobile=useIsMobile();  const [tab,setTab]=useState("stats"),[chatMsg,setChatMsg]=useState(""),[chatHistory,setChatHistory]=useState({});
  useEffect(()=>{
    if(!profile?.uid||!friend?.id)return;
    loadChat(profile.uid,friend.id).then(msgs=>{
      if(msgs.length>0)setChatHistory(prev=>({...prev,[friend.id]:msgs.map(m=>({...m,isMe:m.from===profile.username}))}));
    });
  },[friend?.id]);
  if(!friend){nav(fromScreen||S.FRIENDS);return null;}
  const score=calcScore({winRate:5,profitPerGame:5,roi:5,consistency:5,bigWinRate:5,gamesPlayed:friend.gamesPlayed||0});
  const rank=getRank(score);
  const sendMsg=()=>{
    if(!chatMsg.trim())return;
    const newMsg={id:Date.now(),from:profile.username||"You",msg:chatMsg.trim(),time:"Just now",isMe:true,color:Gold};
    setChatHistory(prev=>({...prev,[friend.id]:[...(prev[friend.id]||[]),newMsg]}));
    if(profile?.uid&&friend?.id)saveChat(profile.uid,friend.id,newMsg);
    setChatMsg("");
  };
  const msgs=chatHistory[friend.id]||[];
  return(
    <MainContent isMobile={isMobile}>
      <div onClick={()=>nav(fromScreen||S.FRIENDS)} style={{color:Gold,fontSize:13,cursor:"pointer",marginBottom:20,display:"inline-flex",alignItems:"center",gap:6}}>← Back</div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:28,background:`linear-gradient(135deg,${friend.color}18,${Card})`,border:`1px solid ${friend.color}33`,borderRadius:20,padding:"24px 28px"}}>
        <div style={{position:"relative"}}>
          <Avatar char={friend.avatar} color={friend.color} size={80} fontSize={32}/>
          <div style={{position:"absolute",bottom:-4,right:-4,background:rank.color,borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,border:`2px solid ${BG}`}}>{rank.emoji}</div>
        </div>
        <div style={{flex:1}}>
          <div style={{color:"#fff",fontWeight:"bold",fontSize:26}}>{friend.name}</div>
          <div style={{color:"#555",fontSize:14,fontFamily:"monospace",marginTop:2}}>@{friend.username}</div>
          {friend.venmo&&<div style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:8,background:"#00a4eb18",border:"1px solid #00a4eb44",borderRadius:8,padding:"4px 12px"}}><span style={{fontSize:14}}>💸</span><span style={{color:"#00a4eb",fontSize:13,fontFamily:"monospace",fontWeight:"bold"}}>@{friend.venmo}</span><span style={{color:"#555",fontSize:11}}>Venmo</span></div>}
          {!friend.venmo&&<div style={{color:"#444",fontSize:12,marginTop:8}}>No Venmo set</div>}
        </div>
        <div style={{display:"flex",gap:20,textAlign:"center"}}>
          {[{label:"All-time",val:`${(friend.allTime||0)>=0?"+":""}$${friend.allTime||0}`,color:(friend.allTime||0)>=0?Up:Down},{label:"Rank",val:`${rank.emoji} ${rank.tier}`,color:rank.color}].map(s=>(
            <div key={s.label}><div style={{color:s.color,fontWeight:"bold",fontSize:18}}>{s.val}</div><div style={{color:"#555",fontSize:12,marginTop:2}}>{s.label}</div></div>
          ))}
        </div>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[["stats","📊 Stats"],["chat","💬 Chat"]].map(([t,label])=>(
          <div key={t} onClick={()=>setTab(t)} style={{padding:"9px 20px",borderRadius:10,cursor:"pointer",background:tab===t?`${friend.color}22`:Card,border:`1px solid ${tab===t?friend.color:Border}`,color:tab===t?friend.color:"#555",fontWeight:"bold",fontSize:13,transition:"all .2s"}}>{label}</div>
        ))}
      </div>
      <div style={{maxWidth:700}}>
        {tab==="stats"&&(
          <Card2>
            <SectionLabel text="Player Stats"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
              {[{l:"All-time",v:`${(friend.allTime||0)>=0?"+":""}$${friend.allTime||0}`,c:(friend.allTime||0)>=0?Up:Down},{l:"Rank",v:`${rank.emoji} ${rank.tier}`,c:rank.color},{l:"Score",v:`${score.toFixed(1)}/10`,c:rank.color}].map(s=>(
                <div key={s.l} style={{background:BG,borderRadius:12,padding:"14px",textAlign:"center"}}><div style={{color:s.c,fontWeight:"bold",fontSize:18}}>{s.v}</div><div style={{color:"#555",fontSize:12,marginTop:4}}>{s.l}</div></div>
              ))}
            </div>
          </Card2>
        )}
        {tab==="chat"&&(
          <Card2>
            <SectionLabel text="Messages"/>
            <div style={{minHeight:200,maxHeight:320,overflowY:"auto",marginBottom:16}}>
              {msgs.length===0?<div style={{textAlign:"center",color:"#444",padding:"32px",fontSize:13}}>No messages yet. Say something!</div>
                :msgs.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.isMe?"flex-end":"flex-start",marginBottom:12}}>
                    <div style={{maxWidth:"65%"}}>
                      {!m.isMe&&<div style={{color:friend.color,fontSize:11,marginBottom:3,fontWeight:"bold"}}>{m.from}</div>}
                      <div style={{background:m.isMe?`${Gold}22`:Border,border:`1px solid ${m.isMe?Gold:Border}`,borderRadius:m.isMe?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"10px 14px",color:"#fff",fontSize:14,lineHeight:1.5}}>{m.msg}</div>
                      <div style={{color:"#333",fontSize:10,marginTop:3,textAlign:m.isMe?"right":"left"}}>{m.time}</div>
                    </div>
                  </div>
                ))
              }
            </div>
            <div style={{display:"flex",gap:10}}>
              <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder={`Message ${friend.name}...`} style={{flex:1,background:BG,border:`1px solid ${Border}`,borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none"}}/>
              <Btn label="Send →" onClick={sendMsg}/>
            </div>
          </Card2>
        )}
      </div>
    </MainContent>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState("loading");
  const [screen,setScreen]=useState(S.HOME);
  const [mobileOpen,setMobileOpen]=useState(false);
  const [selectedDebt,setSelectedDebt]=useState(null);
  const [selectedFriend,setSelectedFriend]=useState(null);
  const [selectedWorldPlayer,setSelectedWorldPlayer]=useState(null);
  const [selectedGame,setSelectedGame]=useState(null);
  const [selectedGroup,setSelectedGroup]=useState(null);
  const [prevScreen,setPrevScreen]=useState(S.HOME);
  const [toast,setToast]=useState(null);

  // All state starts EMPTY — no fake data
  const [debts,setDebts]=useState([]);
  const [friends,setFriends]=useState([]);
  const [notifs,setNotifs]=useState([]);
  const [groups,setGroups]=useState([]);
  const [settledHistory,setSettledHistory]=useState([]);
  const [chats,setChats]=useState({});
  const [feedItems,setFeedItems]=useState([]);
  const [myGames,setMyGames]=useState([]);
  const [profile,setProfile]=useState({username:"",avatarChar:"♠",avatarColor:Gold,photo:null,isPublic:true,venmo:""});

  useEffect(()=>{
    const app=getFirebase();
    if(!app){setPage("landing");return;}
    const auth=window.firebase_auth?.getAuth(app);
    if(!auth){setPage("landing");return;}
    const unsub=window.firebase_auth.onAuthStateChanged(auth,async user=>{
      if(user){
        const existing=await loadUserProfile(user.uid);
        if(existing&&existing.username){
          window._sharkdUid=user.uid;
          setProfile(p=>({...p,...existing,uid:user.uid,photoURL:user.photoURL||"",email:user.email||""}));
          const savedGames=await loadGames(user.uid);
          if(savedGames.length>0)setMyGames(savedGames);
          const savedFriends=await loadFriends(user.uid);
          if(savedFriends.length>0)setFriends(savedFriends);
          const savedDebts=await loadDebts(user.uid);
          if(savedDebts.length>0)setDebts(savedDebts);
          const savedSettled=await loadSettled(user.uid);
          if(savedSettled.length>0)setSettledHistory(savedSettled);
          const savedGroups=await loadGroups(user.uid);
          if(savedGroups.length>0)setGroups(savedGroups);
          const pendingReqs=await loadFriendRequests(user.uid);
          if(pendingReqs.length>0)setNotifs(prev=>[...pendingReqs.map(r=>({id:r.reqId,type:"friendRequest",from:r.fromUsername,fromUid:r.fromUid,fromFullName:r.fromFullName,msg:`${r.fromUsername} wants to be friends!`,time:"",read:false,req:r})),...prev]);
          setPage("app");
        }else{
          setPage("login");
        }
      }else{
        setPage("landing");
      }
    });
    return()=>unsub();
  },[]);

  const nav=s=>{setPrevScreen(screen);setScreen(s);};
  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(null),2600);};

  const settleDebt=id=>{
    const d=debts.find(x=>x.id===id);
    if(d){
      const settledItem={...d,settledDate:"Today",id:Date.now()};
      setSettledHistory(prev=>[settledItem,...prev]);
      if(profile.uid)saveSettled(profile.uid,settledItem);
      if(profile.uid)deleteDebt(profile.uid,id);
    }
    setDebts(prev=>prev.filter(x=>x.id!==id));
  };
  const markAllRead=()=>setNotifs(prev=>prev.map(n=>({...n,read:true})));

  const addGame=(gameName,activePlayers,nets,selectedGroupId,gameDate)=>{
    const dateStr=gameDate||new Date().toLocaleDateString("en",{month:"short",day:"numeric"});
    const myNet=nets.find(n=>n.name==="You");
    const myNetDollars=myNet?Math.round(myNet.netCents/100):0;
    const newId=Date.now();
    const newGame={
      id:newId,game:gameName,date:dateStr,
      buyin:myNet?Math.round(myNet.buyinCents/100):0,
      cashout:myNet?Math.round(myNet.cashoutCents/100):0,
      net:myNetDollars,
      players:activePlayers.map(p=>p.name),
      results:nets.map(n=>({name:n.name,buyin:Math.round(n.buyinCents/100),cashout:Math.round(n.cashoutCents/100),net:Math.round(n.netCents/100)})),
      settled:false,groupId:selectedGroupId||null,
    };
    const txns=minimizeDebts(nets.map(n=>({name:n.name,netCents:n.netCents})));
    // Guest players (not on Sharkd) auto-settle — only real friends need approval
    const guestNames=new Set(activePlayers.filter(p=>p.isGuest).map(p=>p.name));
    const newDebts=txns.filter(t=>!guestNames.has(t.from)&&!guestNames.has(t.to)).map((t,i)=>({id:newId+i+1,from:t.from,to:t.to,amount:t.amountCents/100,status:"pending",game:gameName}));
    const finalGame={...newGame,settled:newDebts.length===0};
    setMyGames(prev=>[finalGame,...prev]);
    // Save to Firebase if user is logged in
    if(profile.uid)saveGame(profile.uid,finalGame);
    if(newDebts.length){
      setDebts(prev=>[...prev,...newDebts]);
      if(profile.uid)newDebts.forEach(d=>saveDebt(profile.uid,d));
    }
    if(selectedGroupId){
      setGroups(prev=>prev.map(g=>{
        if(g.id!==selectedGroupId)return g;
        const updated={...g,lastGame:dateStr,games:g.games+1};
        if(profile.uid)saveGroup(profile.uid,updated);
        return updated;
      }));
    }
    const newFeedItems=nets.map((n,i)=>({id:newId+1000+i,type:n.netCents>0?"win":"loss",player:n.name==="You"?(profile.username||"You"):n.name,amount:Math.round(n.netCents/100),game:gameName,time:"Just now",avatar:n.name==="You"?(profile.avatarChar||"Y"):n.name[0],color:n.name==="You"?(profile.avatarColor||Gold):friends.find(f=>f.name===n.name)?.color||"#888",isMe:n.name==="You"}));
    setFeedItems(prev=>[...newFeedItems,...prev]);
    setNotifs(prev=>[{id:newId,type:"game",from:"You",msg:`"${gameName}" saved · ${nets.length} players · you ${myNetDollars>=0?"won +":"lost "}$${Math.abs(myNetDollars)}`,time:"Just now",read:false},...prev]);
    showToast(`🃏 "${gameName}" saved!`);
    setScreen(S.HOME);
  };

  const editGame=(gameId,updatedResults)=>{
    setMyGames(prev=>prev.map(g=>{
      if(g.id!==gameId)return g;
      const myResult=updatedResults.find(r=>r.name==="You");
      return{...g,results:updatedResults,net:myResult?.net||0,buyin:myResult?.buyin||0,cashout:myResult?.cashout||0};
    }));
    showToast("✓ Game updated!");
  };

  const addChat=(gameId,msg,prof)=>{
    const newMsg={id:Date.now(),from:prof.username||"You",msg,time:"Just now",avatar:prof.avatarChar||"Y",color:prof.avatarColor||Gold,isMe:true};
    setChats(prev=>({...prev,[gameId]:[...(prev[gameId]||[]),newMsg]}));
    if(prof.uid&&selectedFriend?.id)saveChat(prof.uid,selectedFriend.id,newMsg);
  };;

  const myStats=deriveStats(myGames),myScore=calcScore(myStats),myRank=getRank(myScore);
  const unreadCount=notifs.filter(n=>!n.read).length;

  // ── Routing ────────────────────────────────────────────────────────────────
  if(page==="loading") return <div style={{background:BG,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>🦈</div><div style={{color:Gold,fontSize:16,fontFamily:"monospace"}}>Loading...</div></div></div>;
  if(page==="landing") return <LandingPage onLogin={()=>setPage("login")}/>;
  if(page==="login") return <LoginPage onLogin={async(fullName,venmo,username,dob,uid,googleUser)=>{
    setProfile(p=>({...p,username,fullName,venmo,dob,uid,photoURL:googleUser?.photoURL||"",email:googleUser?.email||""}));
    // Load existing games from Firebase
    if(uid){
      const savedGames=await loadGames(uid);
      if(savedGames.length>0)setMyGames(savedGames);
    }
    setPage("app");
  }}/>;

  return(
    <div style={{fontFamily:"'Georgia','Times New Roman',serif",background:BG,minHeight:"100vh",display:"flex"}}>
      <SidebarNav screen={screen} nav={nav} profile={profile} debts={debts} notifs={notifs} myGames={myGames} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
      <div style={{flex:1,overflowY:"auto"}}>
        {screen===S.HOME          &&<HomeScreen          nav={nav} profile={profile} debts={debts} notifs={notifs} myGames={myGames} setSelectedDebt={setSelectedDebt}/>}
        {screen===S.NEW_GAME      &&<NewGameScreen        nav={nav} profile={profile} friends={friends} groups={groups} addGame={addGame} showToast={showToast}/>}
        {screen===S.SETTLEMENTS   &&<SettlementsScreen    nav={nav} debts={debts} settleDebt={settleDebt} showToast={showToast} settledHistory={settledHistory} setSelectedDebt={setSelectedDebt}/>}
        {screen===S.CONFIRM_PAY   &&<ConfirmPayScreen     nav={nav} debt={selectedDebt} showToast={showToast} settleDebt={settleDebt} friends={friends} profile={profile}/>}
        {screen===S.HISTORY       &&<HistoryScreen        nav={nav} myGames={myGames} setSelectedGame={setSelectedGame}/>}
        {screen===S.GAME_DETAIL   &&<GameDetailScreen     nav={nav} game={selectedGame} chats={chats} addChat={addChat} profile={profile} onEdit={()=>{setScreen(S.EDIT_GAME);}}/>}
        {screen===S.EDIT_GAME     &&<EditGameScreen       nav={nav} game={selectedGame} editGame={editGame} profile={profile}/>}
        {screen===S.STATS         &&<StatsScreen          nav={nav} profile={profile} myGames={myGames} myStats={myStats} myScore={myScore} myRank={myRank}/>}
        {screen===S.RANK          &&<RankScreen           nav={nav} profile={profile} myStats={myStats} myScore={myScore} myRank={myRank}/>}
        {screen===S.FRIENDS       &&<FriendsScreen        nav={nav} profile={profile} friends={friends} setFriends={setFriends} setSelectedFriend={setSelectedFriend}/>}
        {screen===S.FRIEND_PROFILE&&<FriendProfileScreen  nav={nav} friend={selectedFriend} fromScreen={prevScreen} profile={profile}/>}
        {screen===S.ADD_FRIENDS   &&<AddFriendsScreen     nav={nav} showToast={showToast} friends={friends} setFriends={setFriends} profile={profile}/>}
        {screen===S.LEADERBOARD   &&<LeaderboardScreen    nav={nav} profile={profile} friends={friends} myGames={myGames} setSelectedFriend={setSelectedFriend} setSelectedWorldPlayer={setSelectedWorldPlayer}/>}
        {screen===S.GROUPS        &&<GroupsScreen         nav={nav} groups={groups} setGroups={setGroups} myGames={myGames} setSelectedGroup={setSelectedGroup} friends={friends}/>}
        {screen===S.GROUP_DETAIL  &&<GroupDetailScreen    nav={nav} group={selectedGroup} myGames={myGames} setSelectedGame={setSelectedGame} friends={friends}/>}
        {screen===S.RIVALS        &&<RivalsScreen         nav={nav} friends={friends} myGames={myGames}/>}
        {screen===S.FEED          &&<FeedScreen           nav={nav} feedItems={feedItems}/>}
        {screen===S.NOTIFICATIONS &&<NotificationsScreen  nav={nav} notifs={notifs} markAllRead={markAllRead} setNotifs={setNotifs} setFriends={setFriends} profile={profile} showToast={showToast}/>}
        {screen===S.SETTINGS      &&<SettingsScreen       nav={nav} profile={profile} setProfile={setProfile} showToast={showToast} onLogout={async()=>{await signOut();setPage("landing");setScreen(S.HOME);setMyGames([]);setDebts([]);setFriends([]);setNotifs([]);setFeedItems([]);setGroups([]);setProfile({username:"",avatarChar:"",avatarColor:Gold,photo:null,isPublic:true,venmo:"",uid:null});}}/>}
      </div>
      {toast&&<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",background:Gold,color:BG,padding:"12px 28px",borderRadius:24,fontSize:14,fontWeight:"bold",whiteSpace:"nowrap",boxShadow:`0 4px 24px ${Gold}55`,zIndex:500}}>{toast}</div>}
    </div>
  );
}
