import { useState, useEffect, useRef } from "react";

const S = {
  HOME:"home", FRIENDS:"friends", NEW_GAME:"new_game", SETTLEMENTS:"settlements",
  LEADERBOARD:"leaderboard", HISTORY:"history", CONFIRM_PAY:"confirm_pay", STATS:"stats",
  SETTINGS:"settings", ADD_FRIENDS:"add_friends", RANK:"rank", FRIEND_PROFILE:"friend_profile",
  WORLD_PROFILE:"world_profile", GAME_DETAIL:"game_detail", NOTIFICATIONS:"notifications",
  GROUPS:"groups", GROUP_DETAIL:"group_detail", RIVALS:"rivals", FEED:"feed", ONBOARD:"onboard",
  EDIT_GAME:"edit_game",
};

const Gold="#c9a84c",GoldDim="#8b6914",Up="#00e096",Down="#ff4d6d";
const BG="#080812",Card="#0f0f1d",Border="#1c1c2e";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const INIT_FRIENDS=[
  {id:1,name:"Jake",  username:"jakethesnake", avatar:"J",allTime:340, color:"#e63946",venmo:"jake-smith"},
  {id:2,name:"Sarah", username:"sarahbets",    avatar:"S",allTime:-120,color:"#457b9d",venmo:"sarah-b"},
  {id:3,name:"Tom",   username:"tomfoolery",   avatar:"T",allTime:210, color:"#2a9d8f",venmo:"tommy-t"},
  {id:4,name:"Mia",   username:"mia_plays",    avatar:"M",allTime:-80, color:"#e9c46a",venmo:""},
  {id:5,name:"Carlos",username:"carlospoker99",avatar:"C",allTime:95,  color:"#f4a261",venmo:"carlos-p99"},
];
const INIT_DEBTS=[
  {id:1,from:"You",  to:"Jake", amount:45,status:"pending", game:"Fri Night at Jake's"},
  {id:2,from:"Sarah",to:"You",  amount:30,status:"pending", game:"Fri Night at Jake's"},
  {id:3,from:"Tom",  to:"You",  amount:15,status:"awaiting",game:"Tuesday Session"},
];
const SETTLED_HISTORY=[
  {id:101,from:"You",  to:"Jake", amount:80, game:"Weekend Tourney",date:"Feb 28",settledDate:"Mar 2"},
  {id:102,from:"Carlos",to:"You", amount:45, game:"Weekend Tourney",date:"Feb 28",settledDate:"Mar 1"},
  {id:103,from:"You",  to:"Sarah",amount:40, game:"Monthly Big",    date:"Jan 31",settledDate:"Feb 3"},
];
const INIT_NOTIFS=[
  {id:1,type:"request",from:"Sarah", msg:"Sarah sent you a $30 request",         time:"2m ago", read:false},
  {id:2,type:"confirm",from:"Jake",  msg:"Jake confirmed your $45 payment",       time:"1h ago", read:false},
  {id:3,type:"request",from:"Tom",   msg:"Tom is waiting on $15 from you",        time:"2h ago", read:true},
  {id:4,type:"game",   from:"Carlos",msg:"Carlos added you to 'Tuesday Session'", time:"1d ago", read:true},
  {id:5,type:"rival",  from:"Jake",  msg:"Jake overtook you on the leaderboard!", time:"2d ago", read:true},
];
const INIT_GROUPS=[
  {id:1,name:"Friday Night Crew",emoji:"🃏",color:"#e63946",members:["Jake","Sarah","Tom","Mia","Carlos"],games:18,lastGame:"Mar 10"},
  {id:2,name:"Tuesday Regulars", emoji:"⚡",color:"#a78bfa",members:["Jake","Tom","Carlos"],            games:9, lastGame:"Mar 5"},
];
const ACTIVITY_FEED=[
  {id:1,type:"win",    player:"Jake",  amount:145,game:"Fri Night at Jake's",time:"2h ago",  avatar:"J",color:"#e63946"},
  {id:2,type:"loss",   player:"Sarah", amount:-30, game:"Fri Night at Jake's",time:"2h ago",  avatar:"S",color:"#457b9d"},
  {id:3,type:"win",    player:"Tom",   amount:85,  game:"Fri Night at Jake's",time:"2h ago",  avatar:"T",color:"#2a9d8f"},
  {id:4,type:"rank",   player:"Carlos",rank:"Advanced",time:"1d ago",           avatar:"C",color:"#f4a261"},
  {id:5,type:"win",    player:"Tom",   amount:110, game:"Weekend Tourney",     time:"4d ago",  avatar:"T",color:"#2a9d8f"},
  {id:6,type:"streak", player:"Jake",  streak:5,   time:"5d ago",               avatar:"J",color:"#e63946"},
  {id:7,type:"loss",   player:"Mia",   amount:-55, game:"Weekend Tourney",     time:"6d ago",  avatar:"M",color:"#e9c46a"},
];
const RIVAL_DATA={
  Jake:  {wins:4,losses:6,draws:0,netVs:-120,games:[{date:"Mar 10",net:85,vsNet:145},{date:"Mar 5",net:-30,vsNet:-50},{date:"Feb 28",net:210,vsNet:220},{date:"Jan 31",net:120,vsNet:280},{date:"Jan 10",net:40,vsNet:150}]},
  Sarah: {wins:7,losses:3,draws:0,netVs:180, games:[{date:"Mar 10",net:85,vsNet:-30},{date:"Mar 5",net:-30,vsNet:30},{date:"Feb 28",net:210,vsNet:-40}]},
  Tom:   {wins:5,losses:5,draws:0,netVs:0,   games:[{date:"Mar 10",net:85,vsNet:85},{date:"Mar 5",net:-30,vsNet:45},{date:"Feb 28",net:210,vsNet:110}]},
  Mia:   {wins:8,losses:2,draws:0,netVs:240, games:[{date:"Mar 10",net:85,vsNet:-20},{date:"Feb 28",net:210,vsNet:-55}]},
  Carlos:{wins:6,losses:4,draws:0,netVs:95,  games:[{date:"Mar 5",net:-30,vsNet:30},{date:"Feb 28",net:210,vsNet:85}]},
};
const GAME_CHATS={
  1:[
    {id:1,from:"Jake",  msg:"What a night! That river card saved me 💀",    time:"Mar 10 11:45pm",avatar:"J",color:"#e63946"},
    {id:2,from:"Sarah", msg:"I can't believe I lost that hand 😭",           time:"Mar 10 11:46pm",avatar:"S",color:"#457b9d"},
    {id:3,from:"Tom",   msg:"GGs everyone, same time next week?",            time:"Mar 10 11:48pm",avatar:"T",color:"#2a9d8f"},
    {id:4,from:"You",   msg:"I'll host next Friday, same buy-in",            time:"Mar 10 11:50pm",avatar:"Y",color:"#c9a84c"},
    {id:5,from:"Jake",  msg:"I'm in. Sarah you owe me $30 by Sunday 😂",    time:"Mar 10 11:51pm",avatar:"J",color:"#e63946"},
  ],
  2:[
    {id:1,from:"Tom",   msg:"Good game boys, Tom's bankroll growing 📈",     time:"Mar 5 10:30pm", avatar:"T",color:"#2a9d8f"},
    {id:2,from:"Carlos",msg:"Lucky cards man, rematch next week",            time:"Mar 5 10:32pm", avatar:"C",color:"#f4a261"},
  ],
  3:[
    {id:1,from:"Jake",  msg:"BIGGEST POT EVER. What a tourney",              time:"Feb 28 1:15am", avatar:"J",color:"#e63946"},
    {id:2,from:"You",   msg:"$210 profit, not bad for a Saturday 🦈",        time:"Feb 28 1:17am", avatar:"Y",color:"#c9a84c"},
    {id:3,from:"Mia",   msg:"Okay I need a rematch, down $55 is embarrassing",time:"Feb 28 1:18am",avatar:"M",color:"#e9c46a"},
  ],
};
const HISTORY_DATA=[
  {id:1,game:"Fri Night at Jake's",date:"Mar 10",
    results:[{name:"You",buyins:[{amount:100,label:"Buy-in"}],cashout:185,net:85},{name:"Jake",buyins:[{amount:100,label:"Buy-in"},{amount:50,label:"Re-buy"}],cashout:295,net:145},{name:"Sarah",buyins:[{amount:50,label:"Buy-in"}],cashout:20,net:-30},{name:"Tom",buyins:[{amount:100,label:"Buy-in"}],cashout:185,net:85},{name:"Mia",buyins:[{amount:50,label:"Buy-in"}],cashout:30,net:-20}],
    settled:true,groupId:1},
  {id:2,game:"Tuesday Session",date:"Mar 5",
    results:[{name:"You",buyins:[{amount:50,label:"Buy-in"}],cashout:20,net:-30},{name:"Jake",buyins:[{amount:50,label:"Buy-in"}],cashout:0,net:-50},{name:"Tom",buyins:[{amount:50,label:"Buy-in"}],cashout:95,net:45},{name:"Carlos",buyins:[{amount:50,label:"Buy-in"}],cashout:80,net:30}],
    settled:false,groupId:2},
  {id:3,game:"Weekend Tourney",date:"Feb 28",
    results:[{name:"You",buyins:[{amount:100,label:"Buy-in"}],cashout:310,net:210},{name:"Jake",buyins:[{amount:100,label:"Buy-in"}],cashout:320,net:220},{name:"Sarah",buyins:[{amount:100,label:"Buy-in"}],cashout:60,net:-40},{name:"Tom",buyins:[{amount:100,label:"Buy-in"}],cashout:210,net:110},{name:"Mia",buyins:[{amount:100,label:"Buy-in"}],cashout:45,net:-55},{name:"Carlos",buyins:[{amount:100,label:"Buy-in"}],cashout:185,net:85}],
    settled:true,groupId:1},
];
const ALL_USERS=[
  {id:10,name:"Marcus", username:"marcus_cards", avatar:"M",color:"#a78bfa",mutual:2},
  {id:11,name:"Priya",  username:"priya_bets",   avatar:"P",color:"#34d399",mutual:1},
  {id:12,name:"Devon",  username:"devonallday",  avatar:"D",color:"#fb923c",mutual:3},
  {id:13,name:"Zoe",    username:"zoe_raises",   avatar:"Z",color:"#f472b6",mutual:0},
  {id:14,name:"Luis",   username:"luispoker",    avatar:"L",color:"#60a5fa",mutual:2},
  {id:15,name:"Aisha",  username:"aisha_wins",   avatar:"A",color:"#e9c46a",mutual:4},
];
const WORLD_BOARD=[
  {id:101,name:"PokerKing88",avatar:"👑",color:"#c9a84c",allTime:4820,country:"🇺🇸"},
  {id:102,name:"BluffMaster", avatar:"🦁",color:"#e63946",allTime:3210,country:"🇬🇧"},
  {id:103,name:"AllInAnna",   avatar:"♠", color:"#a78bfa",allTime:2750,country:"🇩🇪"},
  {id:1,  name:"Jake",        avatar:"J", color:"#e63946",allTime:340, country:"🇺🇸",isYousFriend:true},
  {id:104,name:"RiverRat99",  avatar:"🎲",color:"#2a9d8f",allTime:2100,country:"🇧🇷"},
  {id:105,name:"CardShark",   avatar:"🃏",color:"#f4a261",allTime:1890,country:"🇯🇵"},
  {id:3,  name:"Tom",         avatar:"T", color:"#2a9d8f",allTime:210, country:"🇺🇸",isYousFriend:true},
  {id:106,name:"FlopQueen",   avatar:"♥", color:"#f472b6",allTime:1540,country:"🇫🇷"},
  {id:107,name:"RaiseOrFold", avatar:"🤠",color:"#e9c46a",allTime:980, country:"🇨🇦"},
  {id:5,  name:"Carlos",      avatar:"C", color:"#f4a261",allTime:95,  country:"🇺🇸",isYousFriend:true},
  {id:108,name:"SilentAce",   avatar:"😎",color:"#60a5fa",allTime:880, country:"🇰🇷"},
  {id:109,name:"ChipDumper",  avatar:"♦", color:"#34d399",allTime:440, country:"🇦🇺"},
  {id:0,  name:"You (Alex)",  avatar:"♠", color:"#c9a84c",allTime:155, country:"🇺🇸",isYou:true},
  {id:4,  name:"Mia",         avatar:"M", color:"#e9c46a",allTime:-80, country:"🇺🇸",isYousFriend:true},
  {id:2,  name:"Sarah",       avatar:"S", color:"#457b9d",allTime:-120,country:"🇺🇸",isYousFriend:true},
];
const WORLD_STATS={
  "PokerKing88":{winRate:9.2,profitPerGame:9.5,roi:9.0,consistency:8.5,bigWinRate:9.0,gamesPlayed:87},
  "BluffMaster": {winRate:8.8,profitPerGame:8.5,roi:8.2,consistency:7.8,bigWinRate:8.5,gamesPlayed:64},
  "AllInAnna":   {winRate:8.5,profitPerGame:8.0,roi:8.0,consistency:8.0,bigWinRate:8.2,gamesPlayed:72},
  "RiverRat99":  {winRate:8.2,profitPerGame:7.8,roi:7.5,consistency:7.2,bigWinRate:7.8,gamesPlayed:55},
  "CardShark":   {winRate:7.8,profitPerGame:7.5,roi:7.2,consistency:7.5,bigWinRate:7.5,gamesPlayed:48},
  "FlopQueen":   {winRate:7.5,profitPerGame:7.0,roi:7.0,consistency:7.8,bigWinRate:7.0,gamesPlayed:41},
  "RaiseOrFold": {winRate:6.8,profitPerGame:6.5,roi:6.2,consistency:6.5,bigWinRate:6.0,gamesPlayed:33},
  "SilentAce":   {winRate:6.5,profitPerGame:6.0,roi:5.8,consistency:7.0,bigWinRate:5.5,gamesPlayed:29},
  "ChipDumper":  {winRate:5.5,profitPerGame:5.0,roi:4.8,consistency:5.2,bigWinRate:4.5,gamesPlayed:22},
};
const WORLD_GAMES={
  "PokerKing88":[{date:"Mar 12",game:"High Stakes",buyin:500,net:1200},{date:"Mar 8",game:"Tournament",buyin:200,net:850},{date:"Mar 1",game:"Cash Game",buyin:500,net:-200},{date:"Feb 22",game:"Big Game",buyin:300,net:620},{date:"Feb 15",game:"Night Game",buyin:500,net:950}],
  "BluffMaster": [{date:"Mar 11",game:"London Club",buyin:400,net:780},{date:"Mar 6",game:"Cash Game",buyin:200,net:440},{date:"Feb 28",game:"Tournament",buyin:300,net:-150},{date:"Feb 20",game:"Night Game",buyin:400,net:590},{date:"Feb 12",game:"Big Game",buyin:200,net:320}],
  "AllInAnna":   [{date:"Mar 10",game:"Berlin Game",buyin:300,net:620},{date:"Mar 4",game:"Cash Game",buyin:150,net:380},{date:"Feb 26",game:"Tournament",buyin:300,net:510},{date:"Feb 18",game:"Night Game",buyin:200,net:-80},{date:"Feb 10",game:"Weekly",buyin:150,net:295}],
  "RiverRat99":  [{date:"Mar 9",game:"São Paulo",buyin:200,net:480},{date:"Mar 3",game:"Cash Game",buyin:100,net:230},{date:"Feb 25",game:"Tournament",buyin:200,net:-100},{date:"Feb 17",game:"Night Game",buyin:100,net:310},{date:"Feb 9",game:"Big Game",buyin:200,net:420}],
  "CardShark":   [{date:"Mar 8",game:"Tokyo Game",buyin:200,net:350},{date:"Mar 2",game:"Cash Game",buyin:100,net:180},{date:"Feb 24",game:"Tournament",buyin:200,net:290},{date:"Feb 16",game:"Night Game",buyin:100,net:-60},{date:"Feb 8",game:"Weekly",buyin:100,net:220}],
  "FlopQueen":   [{date:"Mar 7",game:"Paris Club",buyin:150,net:290},{date:"Mar 1",game:"Cash Game",buyin:100,net:150},{date:"Feb 23",game:"Tournament",buyin:150,net:240},{date:"Feb 15",game:"Night Game",buyin:100,net:-50},{date:"Feb 7",game:"Weekly",buyin:100,net:180}],
  "RaiseOrFold": [{date:"Mar 6",game:"Toronto",buyin:100,net:210},{date:"Feb 28",game:"Cash Game",buyin:100,net:140},{date:"Feb 20",game:"Tournament",buyin:100,net:-80},{date:"Feb 12",game:"Night Game",buyin:100,net:180},{date:"Feb 4",game:"Weekly",buyin:100,net:95}],
  "SilentAce":   [{date:"Mar 5",game:"Seoul Game",buyin:100,net:190},{date:"Feb 27",game:"Cash Game",buyin:100,net:110},{date:"Feb 19",game:"Tournament",buyin:100,net:160},{date:"Feb 11",game:"Night Game",buyin:100,net:-70},{date:"Feb 3",game:"Weekly",buyin:100,net:140}],
  "ChipDumper":  [{date:"Mar 4",game:"Sydney",buyin:100,net:95},{date:"Feb 26",game:"Cash Game",buyin:100,net:60},{date:"Feb 18",game:"Tournament",buyin:100,net:-40},{date:"Feb 10",game:"Night Game",buyin:100,net:120},{date:"Feb 2",game:"Weekly",buyin:100,net:80}],
};

// ─── RANK SYSTEM ─────────────────────────────────────────────────────────────
const RANKS=[
  {tier:"Noob",        min:0,  max:1.49,emoji:"🐣",color:"#777",   desc:"Just learning the ropes. Every legend started here.",         perks:[]},
  {tier:"Novice",      min:1.5,max:2.99,emoji:"🃏",color:"#60a5fa",desc:"Getting the hang of it. Starting to read the table.",         perks:["Survived 5+ games"]},
  {tier:"Intermediate",min:3,  max:4.49,emoji:"🎯",color:"#34d399",desc:"Solid fundamentals. Dangerous on a good night.",              perks:["Positive ROI","10+ games"]},
  {tier:"Advanced",    min:4.5,max:5.99,emoji:"🔥",color:"#f97316",desc:"Consistently profitable. The group fears your raise.",        perks:["60%+ win rate","25+ games"]},
  {tier:"Expert",      min:6,  max:7.49,emoji:"⚡",color:"#a78bfa",desc:"Top of most groups. Reads the table like a book.",           perks:["70%+ win rate","Top 20%"]},
  {tier:"Pro",         min:7.5,max:8.99,emoji:"💎",color:"#38bdf8",desc:"Elite level. People check your stats before sitting down.",   perks:["75%+ win rate","Top 5%"]},
  {tier:"Shark",       min:9,  max:10,  emoji:"🦈",color:"#c9a84c",desc:"Apex predator. The table is your hunting ground.",           perks:["Top 1% globally","Legendary"]},
];
const METRICS=[
  {key:"winRate",      label:"Win Rate",     icon:"🎯",desc:"Sessions finished profitable",       weight:0.30,fmt:v=>`${Math.round(v*10)}%`},
  {key:"profitPerGame",label:"Profit/Game",  icon:"💰",desc:"Average net earnings per session",   weight:0.25,fmt:v=>`$${Math.round(v*8)}`},
  {key:"roi",          label:"ROI",          icon:"📈",desc:"Total profit ÷ total invested × 100",weight:0.20,fmt:v=>`${Math.round(v*10)}%`},
  {key:"consistency",  label:"Consistency",  icon:"📊",desc:"Low variance = high score",          weight:0.15,fmt:v=>`${v.toFixed(1)}/10`},
  {key:"bigWinRate",   label:"Big Win Rate", icon:"🔥",desc:"Sessions where cashout ≥ 2× buy-in", weight:0.10,fmt:v=>`${Math.round(v*10)}%`},
];
function longevityMultiplier(g){if(g>=50)return 1;if(g>=30)return 0.90;if(g>=20)return 0.78;if(g>=10)return 0.62;if(g>=5)return 0.45;return 0.25;}
function deriveStats(games){
  if(!games||!games.length)return{winRate:0,profitPerGame:0,roi:0,consistency:0,bigWinRate:0,gamesPlayed:0};
  const n=games.length,wins=games.filter(g=>g.net>0).length;
  const totalNet=games.reduce((s,g)=>s+g.net,0),totalBuyin=games.reduce((s,g)=>s+(g.buyin||g.buyins?.reduce((a,b)=>a+b.amount,0)||0),0);
  const bigWins=games.filter(g=>g.cashout>=((g.buyin||g.buyins?.reduce((a,b)=>a+b.amount,0)||0))*2).length;
  const avg=totalNet/n,variance=games.reduce((s,g)=>s+Math.pow(g.net-avg,2),0)/n;
  return{winRate:(wins/n)*10,profitPerGame:Math.min(10,Math.max(0,(totalNet/n+50)/20)),roi:totalBuyin>0?Math.min(10,Math.max(0,(totalNet/totalBuyin)*10+5)):0,consistency:Math.min(10,Math.max(0,1-Math.sqrt(variance)/200)*10),bigWinRate:(bigWins/n)*10,gamesPlayed:n};
}
function calcScore(stats){
  let ws=0,wt=0;METRICS.forEach(m=>{ws+=(stats[m.key]||0)*m.weight;wt+=m.weight;});
  return+(Math.min(10,Math.max(0,ws/wt))*longevityMultiplier(stats.gamesPlayed||0)).toFixed(2);
}
function getRank(score){return RANKS.slice().reverse().find(r=>score>=r.min)||RANKS[0];}

const FRIEND_GAMES={
  Jake:[{date:"Mar 10",game:"Fri Night at Jake's",buyin:100,cashout:245,net:145},{date:"Mar 5",game:"Tue Session",buyin:50,cashout:0,net:-50},{date:"Feb 28",game:"Weekend Tourney",buyin:100,cashout:320,net:220},{date:"Feb 21",game:"Home Game",buyin:50,cashout:80,net:30},{date:"Feb 14",game:"Valentine's",buyin:100,cashout:45,net:-55},{date:"Feb 7",game:"Fri Night",buyin:100,cashout:195,net:95},{date:"Jan 31",game:"Monthly Big",buyin:200,cashout:480,net:280},{date:"Jan 24",game:"Fri Night",buyin:100,cashout:60,net:-40},{date:"Jan 17",game:"Tue Session",buyin:50,cashout:95,net:45},{date:"Jan 10",game:"Fri Night",buyin:100,cashout:250,net:150},{date:"Jan 3",game:"New Year's",buyin:100,cashout:35,net:-65},{date:"Dec 27",game:"Holiday",buyin:150,cashout:320,net:170},{date:"Dec 20",game:"Fri Night",buyin:100,cashout:185,net:85},{date:"Dec 13",game:"Fri Night",buyin:100,cashout:55,net:-45},{date:"Dec 6",game:"Tue Session",buyin:50,cashout:100,net:50},{date:"Nov 29",game:"Fri Night",buyin:100,cashout:230,net:130},{date:"Nov 22",game:"Fri Night",buyin:100,cashout:40,net:-60},{date:"Nov 15",game:"Big Game",buyin:200,cashout:410,net:210},{date:"Nov 8",game:"Tue Session",buyin:50,cashout:80,net:30},{date:"Nov 1",game:"Fri Night",buyin:100,cashout:175,net:75},{date:"Oct 25",game:"Fri Night",buyin:100,cashout:50,net:-50},{date:"Oct 18",game:"Tue Session",buyin:50,cashout:90,net:40},{date:"Oct 11",game:"Fri Night",buyin:100,cashout:240,net:140},{date:"Oct 4",game:"Big Game",buyin:200,cashout:160,net:-40},{date:"Sep 27",game:"Fri Night",buyin:100,cashout:195,net:95},{date:"Sep 20",game:"Tue Session",buyin:50,cashout:20,net:-30},{date:"Sep 13",game:"Fri Night",buyin:100,cashout:310,net:210},{date:"Sep 6",game:"Monthly Big",buyin:200,cashout:350,net:150}],
  Sarah:[{date:"Mar 10",game:"Fri Night",buyin:50,cashout:20,net:-30},{date:"Mar 5",game:"Tue Session",buyin:50,cashout:80,net:30},{date:"Feb 28",game:"Weekend Tourney",buyin:100,cashout:60,net:-40},{date:"Feb 21",game:"Home Game",buyin:50,cashout:30,net:-20},{date:"Feb 14",game:"Valentine's",buyin:50,cashout:10,net:-40},{date:"Feb 7",game:"Fri Night",buyin:50,cashout:65,net:15},{date:"Jan 31",game:"Monthly Big",buyin:100,cashout:55,net:-45},{date:"Jan 24",game:"Fri Night",buyin:50,cashout:70,net:20}],
  Tom:[{date:"Mar 10",game:"Fri Night",buyin:100,cashout:185,net:85},{date:"Mar 5",game:"Tue Session",buyin:50,cashout:95,net:45},{date:"Feb 28",game:"Weekend Tourney",buyin:100,cashout:210,net:110},{date:"Feb 21",game:"Home Game",buyin:50,cashout:20,net:-30},{date:"Feb 14",game:"Valentine's",buyin:100,cashout:55,net:-45},{date:"Feb 7",game:"Fri Night",buyin:100,cashout:165,net:65},{date:"Jan 31",game:"Monthly Big",buyin:200,cashout:310,net:110},{date:"Jan 24",game:"Fri Night",buyin:100,cashout:75,net:-25},{date:"Jan 17",game:"Tue Session",buyin:50,cashout:90,net:40},{date:"Jan 10",game:"Fri Night",buyin:100,cashout:185,net:85},{date:"Jan 3",game:"New Year's",buyin:100,cashout:45,net:-55},{date:"Dec 27",game:"Holiday",buyin:150,cashout:240,net:90},{date:"Dec 20",game:"Fri Night",buyin:100,cashout:155,net:55},{date:"Dec 13",game:"Fri Night",buyin:100,cashout:50,net:-50},{date:"Dec 6",game:"Tue Session",buyin:50,cashout:80,net:30},{date:"Nov 29",game:"Fri Night",buyin:100,cashout:190,net:90},{date:"Nov 22",game:"Fri Night",buyin:100,cashout:45,net:-55},{date:"Nov 15",game:"Big Game",buyin:200,cashout:280,net:80}],
  Mia:[{date:"Mar 10",game:"Fri Night",buyin:50,cashout:30,net:-20},{date:"Mar 5",game:"Tue Session",buyin:50,cashout:65,net:15},{date:"Feb 28",game:"Weekend Tourney",buyin:100,cashout:45,net:-55},{date:"Feb 21",game:"Home Game",buyin:50,cashout:70,net:20},{date:"Feb 14",game:"Valentine's",buyin:50,cashout:10,net:-40},{date:"Feb 7",game:"Fri Night",buyin:50,cashout:75,net:25}],
  Carlos:[{date:"Mar 10",game:"Fri Night",buyin:100,cashout:140,net:40},{date:"Mar 5",game:"Tue Session",buyin:50,cashout:80,net:30},{date:"Feb 28",game:"Weekend Tourney",buyin:100,cashout:185,net:85},{date:"Feb 21",game:"Home Game",buyin:50,cashout:20,net:-30},{date:"Feb 14",game:"Valentine's",buyin:100,cashout:55,net:-45},{date:"Feb 7",game:"Fri Night",buyin:100,cashout:130,net:30},{date:"Jan 31",game:"Monthly Big",buyin:200,cashout:260,net:60},{date:"Jan 24",game:"Fri Night",buyin:100,cashout:70,net:-30},{date:"Jan 17",game:"Tue Session",buyin:50,cashout:80,net:30},{date:"Jan 10",game:"Fri Night",buyin:100,cashout:145,net:45},{date:"Jan 3",game:"New Year's",buyin:100,cashout:50,net:-50},{date:"Dec 27",game:"Holiday",buyin:150,cashout:195,net:45}],
};
const YOU_GAMES=[
  {date:"Mar 10",game:"Fri Night at Jake's",buyin:100,cashout:185,net:85},
  {date:"Mar 5", game:"Tuesday Session",    buyin:50, cashout:20, net:-30},
  {date:"Feb 28",game:"Weekend Tourney",    buyin:100,cashout:310,net:210},
  {date:"Feb 21",game:"Fri Night",          buyin:50, cashout:80, net:30},
  {date:"Feb 14",game:"Valentine's Game",   buyin:100,cashout:45, net:-55},
  {date:"Feb 7", game:"Fri Night",          buyin:50, cashout:95, net:45},
  {date:"Jan 31",game:"Monthly Big Game",   buyin:100,cashout:220,net:120},
  {date:"Jan 24",game:"Fri Night",          buyin:50, cashout:10, net:-40},
  {date:"Jan 17",game:"Tuesday Session",    buyin:100,cashout:175,net:75},
  {date:"Jan 10",game:"Fri Night",          buyin:50, cashout:90, net:40},
  {date:"Jan 3", game:"New Year's Game",    buyin:100,cashout:55, net:-45},
  {date:"Dec 27",game:"Holiday Game",       buyin:50, cashout:80, net:30},
  {date:"Dec 20",game:"Monthly Big Game",   buyin:100,cashout:260,net:160},
  {date:"Dec 13",game:"Fri Night",          buyin:50, cashout:25, net:-25},
  {date:"Dec 6", game:"Tuesday Session",    buyin:100,cashout:130,net:30},
  {date:"Nov 29",game:"Fri Night",          buyin:50, cashout:70, net:20},
  {date:"Nov 22",game:"Fri Night",          buyin:100,cashout:45, net:-55},
  {date:"Nov 15",game:"Monthly Big Game",   buyin:50, cashout:110,net:60},
  {date:"Nov 8", game:"Tuesday Session",    buyin:100,cashout:190,net:90},
  {date:"Nov 1", game:"Fri Night",          buyin:50, cashout:15, net:-35},
];
const PLAYER_STATS=Object.fromEntries(Object.entries(FRIEND_GAMES).map(([n,g])=>[n,deriveStats(g)]));
PLAYER_STATS["You"]=deriveStats(YOU_GAMES);

function buildChartFromGames(games,period){
  const now=new Date("2026-03-13");
  const days={"1W":7,"1M":30,"3M":90,"1Y":365,"ALL":9999}[period]||30;
  const cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-days);
  const parsed=games.map(g=>({...g,ts:new Date(g.date+" 2026")})).filter(g=>g.ts>=cutoff).sort((a,b)=>a.ts-b.ts);
  if(!parsed.length)return[{label:"",value:0,date:cutoff}];
  let running=0;
  const pts=parsed.map(g=>{running+=g.net;return{label:(period==="1W"||period==="1M")?g.ts.toLocaleDateString("en",{month:"short",day:"numeric"}):g.ts.toLocaleDateString("en",{month:"short"}),value:running,date:g.ts};});
  return[{label:"",value:0,date:cutoff},...pts];
}
function parseCents(str){const s=(str||"").replace(/[^0-9.]/g,"");if(!s)return 0;const p=s.split(".");return parseInt(p[0]||"0",10)*100+parseInt(((p[1]||"")+"00").slice(0,2),10);}
function fmtCents(c){const sign=c<0?"-":"",abs=Math.abs(c),d=Math.floor(abs/100),cents=abs%100;return cents===0?`${sign}$${d}`:`${sign}$${d}.${String(cents).padStart(2,"0")}`;}
function fmtCentsAbs(c){return fmtCents(Math.abs(c));}
function minimizeDebts(nets){
  let cr=nets.filter(n=>n.netCents>0).map(n=>({...n})),de=nets.filter(n=>n.netCents<0).map(n=>({...n}));
  const txns=[];let ci=0,di=0;
  while(ci<cr.length&&di<de.length){const c=cr[ci],d=de[di],amt=Math.min(c.netCents,-d.netCents);txns.push({from:d.name,to:c.name,amountCents:amt});c.netCents-=amt;d.netCents+=amt;if(c.netCents===0)ci++;if(d.netCents===0)di++;}
  return txns;
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function PrimaryBtn({label,onClick,color=Gold}){return <div onClick={onClick} style={{background:`linear-gradient(135deg,${color},${color}99)`,borderRadius:14,padding:"16px",textAlign:"center",color:color===Gold?"#080812":"#fff",fontWeight:"bold",fontSize:15,cursor:"pointer",marginTop:8,boxShadow:`0 4px 20px ${color}33`}}>{label}</div>;}
function BackBtn({onClick}){return <div onClick={onClick} style={{color:Gold,fontSize:14,marginBottom:16,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,padding:"6px 0",userSelect:"none"}}><span style={{fontSize:18,lineHeight:1}}>←</span><span style={{opacity:.8}}>Back</span></div>;}
function SectionLabel({text}){return <div style={{color:"#333",fontSize:10,letterSpacing:3,textTransform:"uppercase",marginBottom:10,fontFamily:"monospace"}}>{text}</div>;}
function Tag({text,color}){return <div style={{background:`${color}22`,border:`1px solid ${color}44`,borderRadius:10,padding:"2px 9px",color,fontSize:11,fontWeight:"bold",flexShrink:0}}>{text}</div>;}
const AVATARS=["♠","♥","♦","♣","🃏","🎰","🎲","👑","🦁","🐯","🦊","🐺","🤠","😎","🥷","👾"];
const AVATAR_COLORS=["#e63946","#457b9d","#2a9d8f","#e9c46a","#f4a261","#a78bfa","#34d399","#fb923c","#60a5fa","#f472b6"];
function Avatar({char,color,size=44,fontSize=18}){
  const isEmoji=char&&(char.length>1||char.codePointAt(0)>127);
  return <div style={{width:size,height:size,borderRadius:"50%",background:isEmoji?"#1a1a2e":`${color}22`,border:`2px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",color:isEmoji?"#fff":color,fontWeight:"bold",fontSize,flexShrink:0}}>{char||"?"}</div>;
}
function Toggle({on,onToggle}){return <div onClick={onToggle} style={{width:46,height:26,borderRadius:13,background:on?Up:"#2a2a3a",position:"relative",cursor:"pointer",transition:"background .25s",flexShrink:0}}><div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?23:3,transition:"left .25s",boxShadow:"0 1px 4px rgba(0,0,0,.4)"}}/></div>;}
function Fade({children,k}){const [vis,setVis]=useState(false);useEffect(()=>{const t=setTimeout(()=>setVis(true),20);return()=>clearTimeout(t);},[k]);return <div style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(8px)",transition:"opacity .22s ease,transform .22s ease"}}>{children}</div>;}

// ─── STOCK CHART ─────────────────────────────────────────────────────────────
function StockChart({data,color,width=335,height=180}){
  const [hover,setHover]=useState(null),[anim,setAnim]=useState(false);
  const svgRef=useRef(null);
  useEffect(()=>{setAnim(false);const t=setTimeout(()=>setAnim(true),60);return()=>clearTimeout(t);},[data]);
  if(!data.length)return null;
  const vals=data.map(d=>d.value),minV=Math.min(...vals),maxV=Math.max(...vals),range=maxV-minV||1;
  const pad={top:16,bottom:28,left:8,right:8},W=width-pad.left-pad.right,H=height-pad.top-pad.bottom;
  const x=i=>pad.left+(i/(data.length-1))*W,y=v=>pad.top+H-((v-minV)/range)*H;
  const linePath=data.map((d,i)=>`${i===0?"M":"L"}${x(i)},${y(d.value)}`).join(" ");
  const areaPath=linePath+` L${x(data.length-1)},${height-pad.bottom} L${x(0)},${height-pad.bottom} Z`;
  const gid=`g${color.replace(/[^a-z0-9]/gi,"")}`;
  const hov=hover!==null?data[hover]:data[data.length-1];
  return(
    <div style={{position:"relative",userSelect:"none"}}>
      {hover!==null&&<div style={{position:"absolute",top:0,left:Math.min(Math.max(x(hover)-40,0),width-90),background:"#13131f",border:`1px solid ${color}55`,borderRadius:8,padding:"6px 10px",pointerEvents:"none",zIndex:10}}><div style={{color,fontWeight:"bold",fontSize:14}}>{hov.value>=0?"+":""}${hov.value}</div><div style={{color:"#555",fontSize:10}}>{hov.date?.toLocaleDateString("en",{month:"short",day:"numeric"})}</div></div>}
      <svg ref={svgRef} width={width} height={height} style={{display:"block",cursor:"crosshair"}}
        onMouseMove={e=>{const r=svgRef.current.getBoundingClientRect();const mx=e.clientX-r.left-pad.left;setHover(Math.max(0,Math.min(data.length-1,Math.round((mx/W)*(data.length-1)))));}}
        onMouseLeave={()=>setHover(null)}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.28"/><stop offset="100%" stopColor={color} stopOpacity="0.01"/></linearGradient>
          <filter id={`f${gid}`}><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {minV<0&&maxV>0&&<line x1={pad.left} y1={y(0)} x2={width-pad.right} y2={y(0)} stroke="#ffffff18" strokeWidth="1" strokeDasharray="4 4"/>}
        {[0.25,0.5,0.75].map(f=><line key={f} x1={pad.left} y1={pad.top+H*f} x2={width-pad.right} y2={pad.top+H*f} stroke="#ffffff07" strokeWidth="1"/>)}
        <path d={areaPath} fill={`url(#${gid})`}/>
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter={`url(#f${gid})`} style={{strokeDasharray:anim?"none":"3000",strokeDashoffset:anim?"0":"3000",transition:"stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)"}}/>
        {hover!==null&&<><line x1={x(hover)} y1={pad.top} x2={x(hover)} y2={height-pad.bottom} stroke={color} strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 3"/><circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill={color} stroke="#0d0d19" strokeWidth="2"/></>}
        {hover===null&&<circle cx={x(data.length-1)} cy={y(data[data.length-1].value)} r="4" fill={color} stroke="#0d0d19" strokeWidth="2"/>}
        {data.map((d,i)=>d.label?<text key={i} x={x(i)} y={height-4} textAnchor="middle" fontSize="9" fill="#383848" fontFamily="monospace">{d.label}</text>:null)}
      </svg>
    </div>
  );
}
function MetricBar({metric,value,color,delay=0}){
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(value*10),delay+150);return()=>clearTimeout(t);},[value,delay]);
  return(
    <div style={{marginBottom:13}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:15}}>{metric.icon}</span><div><div style={{color:"#fff",fontSize:12,fontWeight:"bold"}}>{metric.label}</div><div style={{color:"#383848",fontSize:10,marginTop:1}}>{metric.desc}</div></div></div>
        <div style={{color,fontWeight:"bold",fontSize:12,fontFamily:"monospace"}}>{metric.fmt(value)}</div>
      </div>
      <div style={{height:5,background:"#1a1a2e",borderRadius:3,overflow:"hidden",position:"relative"}}>
        {[25,50,75].map(p=><div key={p} style={{position:"absolute",left:`${p}%`,top:0,bottom:0,width:1,background:"#08081488",zIndex:2}}/>)}
        <div style={{height:"100%",width:`${w}%`,background:`linear-gradient(90deg,${color}77,${color})`,borderRadius:3,transition:"width 1s cubic-bezier(0.4,0,0.2,1)",boxShadow:`0 0 6px ${color}55`}}/>
      </div>
    </div>
  );
}
function ScoreRing({score,rank,size=140}){
  const [anim,setAnim]=useState(0);
  const r=size/2-12,circ=2*Math.PI*r;
  useEffect(()=>{setAnim(0);const start=Date.now();const tick=()=>{const t=Math.min((Date.now()-start)/1300,1);setAnim(1-Math.pow(1-t,3));if(t<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);},[score]);
  const offset=circ*(1-(anim*score/10));
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a2e" strokeWidth={9}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={rank.color} strokeWidth={13} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{filter:`blur(5px)`,opacity:.35}}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={rank.color} strokeWidth={9} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
        <div style={{fontSize:26}}>{rank.emoji}</div>
        <div style={{color:rank.color,fontSize:26,fontWeight:"bold",fontFamily:"monospace",lineHeight:1,textShadow:`0 0 16px ${rank.color}88`}}>{(anim*score).toFixed(1)}</div>
        <div style={{color:rank.color,fontSize:9,letterSpacing:2,fontFamily:"monospace",opacity:.7}}>/ 10</div>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────
function BottomNav({current,nav,notifCount}){
  const items=[
    {s:S.HOME,       icon:"🏠",label:"Home"},
    {s:S.FRIENDS,    icon:"👥",label:"Friends"},
    {s:S.NEW_GAME,   icon:"🃏",label:"Game"},
    {s:S.LEADERBOARD,icon:"🏆",label:"Board"},
    {s:S.RANK,       icon:"⚡",label:"Rank"},
  ];
  return(
    <div style={{position:"absolute",bottom:0,left:0,right:0,background:"#0a0a16",borderTop:`1px solid ${Border}`,display:"flex",padding:"10px 0 18px"}}>
      {items.map(it=>{
        const active=current===it.s;
        return(
          <div key={it.s} onClick={()=>nav(it.s)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",position:"relative"}}>
            <div style={{fontSize:19,opacity:active?1:0.3,transition:"opacity .2s"}}>{it.icon}</div>
            <div style={{fontSize:9,color:active?Gold:"#444",fontWeight:active?"bold":"normal",transition:"color .2s",fontFamily:"monospace",letterSpacing:1}}>{it.label}</div>
            {active&&<div style={{width:3,height:3,borderRadius:"50%",background:Gold}}/>}
            {it.s===S.HOME&&notifCount>0&&<div style={{position:"absolute",top:0,right:"18%",background:Down,borderRadius:"50%",width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:"bold",color:"#fff"}}>{notifCount}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
const ONBOARD_SLIDES=[
  {emoji:"🃏",title:"Track Every Game",body:"Log buy-ins and cashouts after each game. We calculate who owes who instantly — no math, no arguments.",color:"#c9a84c"},
  {emoji:"⚡",title:"Settle With One Tap",body:"Send payment requests to everyone at once. The other person confirms when they've paid. Clean, verified, done.",color:"#a78bfa"},
  {emoji:"🏆",title:"Compete With Friends",body:"See who's up, who's down, earn your rank from Noob to Shark, and climb the world leaderboard.",color:"#38bdf8"},
  {emoji:"🦈",title:"Earn Your Rank",body:"Your Noob → Novice → Intermediate → Advanced → Expert → Pro → Shark rank is calculated from your real stats. No shortcuts.",color:"#00e096"},
];
function OnboardScreen({onDone}){
  const [slide,setSlide]=useState(0);
  const s=ONBOARD_SLIDES[slide];
  const last=slide===ONBOARD_SLIDES.length-1;
  return(
    <div style={{padding:"40px 28px",display:"flex",flexDirection:"column",height:"100%",minHeight:600,boxSizing:"border-box"}}>
      {/* Skip */}
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20}}>
        {!last&&<div onClick={onDone} style={{color:"#444",fontSize:13,cursor:"pointer"}}>Skip</div>}
      </div>
      {/* Slide content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
        <div style={{fontSize:80,marginBottom:28,filter:`drop-shadow(0 0 30px ${s.color}66)`}}>{s.emoji}</div>
        <div style={{color:s.color,fontSize:10,letterSpacing:4,textTransform:"uppercase",fontFamily:"monospace",marginBottom:12}}>♠ Poker Ledger</div>
        <div style={{color:"#fff",fontSize:26,fontWeight:"bold",marginBottom:16,lineHeight:1.3}}>{s.title}</div>
        <div style={{color:"#666",fontSize:15,lineHeight:1.7,maxWidth:280}}>{s.body}</div>
      </div>
      {/* Dots */}
      <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:28}}>
        {ONBOARD_SLIDES.map((_,i)=>(
          <div key={i} onClick={()=>setSlide(i)} style={{width:i===slide?24:8,height:8,borderRadius:4,background:i===slide?s.color:Border,transition:"all .3s",cursor:"pointer"}}/>
        ))}
      </div>
      {/* Button */}
      <div onClick={last?onDone:()=>setSlide(s=>s+1)} style={{background:`linear-gradient(135deg,${s.color},${s.color}99)`,borderRadius:16,padding:"18px",textAlign:"center",color:"#080812",fontWeight:"bold",fontSize:16,cursor:"pointer",boxShadow:`0 4px 24px ${s.color}44`}}>
        {last?"Let's Play 🃏":"Next →"}
      </div>
    </div>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────
function HomeScreen({nav,setSelectedDebt,profile,debts,notifs}){
  const owing=debts.filter(d=>d.from==="You"),owed=debts.filter(d=>d.to==="You");
  const youOwe=owing.reduce((s,d)=>s+d.amount,0),owedToYou=owed.reduce((s,d)=>s+d.amount,0);
  const netBalance=owedToYou-youOwe,pending=owing.length+owed.length;
  const unread=notifs.filter(n=>!n.read).length;
  return(
    <div style={{padding:"16px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div>
          <div style={{color:Gold,fontSize:10,letterSpacing:4,textTransform:"uppercase",marginBottom:3,fontFamily:"monospace"}}>♠ Poker Ledger</div>
          <div style={{color:"#fff",fontSize:26,fontWeight:"bold"}}>Hey, {profile.username} 👋</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div onClick={()=>nav(S.NOTIFICATIONS)} style={{position:"relative",cursor:"pointer",width:36,height:36,borderRadius:"50%",background:Card,border:`1px solid ${Border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>
            🔔{unread>0&&<div style={{position:"absolute",top:-2,right:-2,background:Down,borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:"bold",color:"#fff",border:`2px solid ${BG}`}}>{unread}</div>}
          </div>
          <div onClick={()=>nav(S.SETTINGS)} style={{position:"relative",cursor:"pointer"}}>
            {profile.photo?<img src={profile.photo} style={{width:44,height:44,borderRadius:"50%",objectFit:"cover",border:`2px solid ${profile.avatarColor||Gold}`,boxShadow:`0 0 16px ${Gold}44`}}/>
              :<div style={{width:44,height:44,borderRadius:"50%",background:`${profile.avatarColor||Gold}22`,border:`2px solid ${profile.avatarColor||Gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:`0 0 16px ${Gold}33`}}>{profile.avatarChar||profile.username[0]}</div>}
            {pending>0&&<div style={{position:"absolute",top:-3,right:-3,background:Down,borderRadius:"50%",width:17,height:17,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:"bold",color:"#fff",border:`2px solid ${BG}`}}>{pending}</div>}
          </div>
        </div>
      </div>
      {/* Balance */}
      <div style={{background:`linear-gradient(135deg,#13132a,#0d0d1e)`,border:`1px solid ${Gold}22`,borderRadius:22,padding:"20px",marginBottom:18,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-24,right:-16,fontSize:90,opacity:.04,userSelect:"none"}}>♠</div>
        <div style={{color:"#555",fontSize:11,letterSpacing:2,marginBottom:6,textTransform:"uppercase",fontFamily:"monospace"}}>Net Balance</div>
        <div style={{color:netBalance>=0?Up:Down,fontSize:44,fontWeight:"bold",marginBottom:4,textShadow:`0 0 30px ${netBalance>=0?Up:Down}44`}}>{netBalance>=0?"+":""}${Math.abs(netBalance)}</div>
        <div style={{color:"#444",fontSize:12,marginBottom:16}}>{debts.length} active settlement{debts.length!==1?"s":""}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{background:"#08081488",borderRadius:12,padding:"12px"}}><div style={{color:Down,fontSize:10,marginBottom:3}}>YOU OWE</div><div style={{color:"#fff",fontSize:20,fontWeight:"bold"}}>${youOwe}</div></div>
          <div style={{background:"#08081488",borderRadius:12,padding:"12px"}}><div style={{color:Up,fontSize:10,marginBottom:3}}>OWED TO YOU</div><div style={{color:"#fff",fontSize:20,fontWeight:"bold"}}>${owedToYou}</div></div>
        </div>
      </div>
      {/* Actions */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:22}}>
        {[
          {icon:"🃏",label:"New Game",  sub:"Log results",   color:Gold,     s:S.NEW_GAME,    badge:0},
          {icon:"⚡",label:"Settle Up", sub:"Pay & confirm", color:Up,       s:S.SETTLEMENTS, badge:pending},
          {icon:"👥",label:"Groups",    sub:"Your crews",    color:"#a78bfa",s:S.GROUPS,      badge:0},
          {icon:"📡",label:"Feed",      sub:"Friend activity",color:"#38bdf8",s:S.FEED,       badge:0},
        ].map(a=>(
          <div key={a.s} onClick={()=>nav(a.s)} style={{background:Card,border:`1px solid ${a.color}22`,borderRadius:16,padding:"16px",cursor:"pointer",position:"relative"}}>
            {a.badge>0&&<div style={{position:"absolute",top:10,right:10,background:Down,borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:"bold",color:"#fff"}}>{a.badge}</div>}
            <div style={{fontSize:26,marginBottom:8}}>{a.icon}</div>
            <div style={{color:"#fff",fontWeight:"bold",fontSize:14}}>{a.label}</div>
            <div style={{color:"#444",fontSize:11,marginTop:2}}>{a.sub}</div>
          </div>
        ))}
      </div>
      {/* Pending */}
      <SectionLabel text={`Pending Actions${pending>0?` (${pending})`:""}`}/>
      {pending===0?(
        <div style={{background:Card,borderRadius:14,padding:"20px",textAlign:"center"}}><div style={{fontSize:32,marginBottom:8}}>🎉</div><div style={{color:Up,fontWeight:"bold",fontSize:15}}>All square!</div><div style={{color:"#444",fontSize:12,marginTop:4}}>No pending debts. Everyone's paid up.</div></div>
      ):(
        <>
          {owing.map(d=><div key={d.id} onClick={()=>{setSelectedDebt(d);nav(S.CONFIRM_PAY);}} style={{background:Card,borderRadius:12,padding:"13px 16px",marginBottom:8,display:"flex",alignItems:"center",cursor:"pointer",borderLeft:`3px solid ${Down}`}}><div style={{flex:1}}><div style={{color:"#fff",fontSize:14}}>You → {d.to}</div><div style={{color:"#444",fontSize:11,marginTop:2}}>{d.game}</div></div><div style={{color:Down,fontWeight:"bold",fontSize:16}}>-${d.amount}</div></div>)}
          {owed.map(d=><div key={d.id} onClick={()=>nav(S.SETTLEMENTS)} style={{background:Card,borderRadius:12,padding:"13px 16px",marginBottom:8,display:"flex",alignItems:"center",cursor:"pointer",borderLeft:`3px solid ${Up}`}}><div style={{flex:1}}><div style={{color:"#fff",fontSize:14}}>{d.from} → You</div><div style={{color:"#444",fontSize:11,marginTop:2}}>{d.game}</div></div><div style={{color:Up,fontWeight:"bold",fontSize:16}}>+${d.amount}</div></div>)}
        </>
      )}
    </div>
  );
}

// ─── FEED ────────────────────────────────────────────────────────────────────

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
function NotificationsScreen({nav,notifs,markAllRead}){
  const icons={request:"💸",confirm:"✅",game:"🃏",friend:"👥",rival:"⚔️"};
  return(
    <div style={{padding:"16px 20px"}}>
      <BackBtn onClick={()=>nav(S.HOME)}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",fontFamily:"monospace",marginBottom:3}}>Inbox</div><div style={{color:"#fff",fontSize:22,fontWeight:"bold"}}>Notifications</div></div>
        {notifs.some(n=>!n.read)&&<div onClick={markAllRead} style={{background:`${Gold}18`,border:`1px solid ${Gold}44`,borderRadius:10,padding:"6px 12px",color:Gold,fontSize:12,cursor:"pointer"}}>Mark all read</div>}
      </div>
      {notifs.length===0?<div style={{background:Card,borderRadius:14,padding:"28px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:8}}>🔔</div><div style={{color:"#555",fontSize:14}}>No notifications yet</div></div>
        :notifs.map(n=>(
          <div key={n.id} style={{background:n.read?Card:`${Gold}0a`,border:`1px solid ${n.read?Border:`${Gold}33`}`,borderRadius:14,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:n.read?"#1a1a2e":`${Gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{icons[n.type]||"🔔"}</div>
            <div style={{flex:1}}><div style={{color:n.read?"#888":"#fff",fontSize:13,lineHeight:1.5}}>{n.msg}</div><div style={{color:"#444",fontSize:11,marginTop:3}}>{n.time}</div></div>
            {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:Gold,flexShrink:0}}/>}
          </div>
        ))
      }
    </div>
  );
}

// ─── GROUPS ──────────────────────────────────────────────────────────────────
function GroupsScreen({nav,setSelectedGroup,groups,setGroups,myGames}){
  const [showCreate,setShowCreate]=useState(false);
  const [newName,setNewName]=useState(""),newColor="#a78bfa";
  return(
    <div style={{padding:"16px 20px"}}>
      <BackBtn onClick={()=>nav(S.HOME)}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",fontFamily:"monospace",marginBottom:3}}>Your Crews</div><div style={{color:"#fff",fontSize:22,fontWeight:"bold"}}>Groups</div></div>
        <div onClick={()=>setShowCreate(true)} style={{background:`${Gold}18`,border:`1px solid ${Gold}44`,borderRadius:12,padding:"8px 14px",color:Gold,fontSize:13,fontWeight:"bold",cursor:"pointer"}}>+ New</div>
      </div>
      {groups.map(g=>{
        const groupGames=myGames.filter(h=>h.groupId===g.id);
        const groupNet=groupGames.reduce((s,h)=>s+(h.net||0),0);
        return(
          <div key={g.id} onClick={()=>{setSelectedGroup(g);nav(S.GROUP_DETAIL);}} style={{background:Card,border:`1px solid ${g.color}33`,borderRadius:18,padding:"18px",marginBottom:14,cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
              <div style={{width:50,height:50,borderRadius:16,background:`${g.color}22`,border:`2px solid ${g.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{g.emoji}</div>
              <div style={{flex:1}}>
                <div style={{color:"#fff",fontWeight:"bold",fontSize:16}}>{g.name}</div>
                <div style={{color:"#444",fontSize:12,marginTop:2}}>{g.members.length} players · {g.games} games</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:groupNet>=0?Up:Down,fontWeight:"bold",fontSize:16}}>{groupNet>=0?"+":""}${groupNet}</div>
                <div style={{color:"#444",fontSize:10,marginTop:1}}>your record</div>
              </div>
            </div>
            <div style={{display:"flex",gap:-8}}>
              {g.members.slice(0,5).map((m,i)=>{
                const f=INIT_FRIENDS.find(f=>f.name===m);
                return <div key={i} style={{width:28,height:28,borderRadius:"50%",background:`${f?.color||"#555"}22`,border:`2px solid ${f?.color||"#555"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:f?.color||"#555",fontWeight:"bold",marginLeft:i>0?-8:0,zIndex:5-i}}>{m[0]}</div>;
              })}
              {g.members.length>5&&<div style={{width:28,height:28,borderRadius:"50%",background:Card,border:`2px solid ${Border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#555",marginLeft:-8}}>+{g.members.length-5}</div>}
            </div>
            <div style={{color:"#444",fontSize:11,marginTop:10}}>Last game: {g.lastGame} · Tap to view →</div>
          </div>
        );
      })}
      {groups.length===0&&<div style={{background:Card,borderRadius:14,padding:"28px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:8}}>👥</div><div style={{color:"#555",fontSize:14}}>No groups yet. Create one for your regular crew.</div></div>}
      {/* Create modal */}
      {showCreate&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:24}}>
          <div style={{background:"#13131f",border:`1px solid ${Border}`,borderRadius:20,padding:"24px",width:"100%",maxWidth:320}}>
            <div style={{color:"#fff",fontWeight:"bold",fontSize:17,marginBottom:16}}>Create Group</div>
            <div style={{color:"#444",fontSize:10,fontFamily:"monospace",letterSpacing:1,marginBottom:6}}>GROUP NAME</div>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Friday Night Crew" style={{width:"100%",background:BG,border:`1px solid ${Border}`,borderRadius:10,padding:"12px",color:"#fff",fontSize:15,boxSizing:"border-box",outline:"none",marginBottom:20}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div onClick={()=>setShowCreate(false)} style={{background:Card,border:`1px solid ${Border}`,borderRadius:12,padding:"12px",textAlign:"center",color:"#888",cursor:"pointer",fontSize:14}}>Cancel</div>
              <div onClick={()=>{if(!newName.trim())return;setGroups(prev=>[...prev,{id:Date.now(),name:newName.trim(),emoji:"🃏",color:newColor,members:["Jake","Tom"],games:0,lastGame:"—"}]);setNewName("");setShowCreate(false);}} style={{background:`linear-gradient(135deg,${Gold},${GoldDim})`,borderRadius:12,padding:"12px",textAlign:"center",color:BG,fontWeight:"bold",cursor:"pointer",fontSize:14}}>Create</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GROUP DETAIL ─────────────────────────────────────────────────────────────
function GroupDetailScreen({nav,group,setSelectedGame,myGames}){
  if(!group){nav(S.GROUPS);return null;}
  const groupGames=myGames.filter(h=>h.groupId===group.id);
  const totalPot=groupGames.reduce((s,h)=>s+((h.results||[]).reduce((a,r)=>a+(r.buyin||0),0)||h.buyin||0),0);
  return(
    <div style={{padding:"16px 20px"}}>
      <BackBtn onClick={()=>nav(S.GROUPS)}/>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
        <div style={{width:56,height:56,borderRadius:18,background:`${group.color}22`,border:`2px solid ${group.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{group.emoji}</div>
        <div>
          <div style={{color:"#fff",fontWeight:"bold",fontSize:20}}>{group.name}</div>
          <div style={{color:"#444",fontSize:12,marginTop:2}}>{group.members.length} players · {group.games} games total</div>
        </div>
      </div>
      <SectionLabel text="Members"/>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
        {group.members.map(m=>{
          const f=INIT_FRIENDS.find(f=>f.name===m);
          return(
            <div key={m} style={{background:Card,border:`1px solid ${f?.color||Border}33`,borderRadius:12,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:`${f?.color||"#555"}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:f?.color||"#555",fontWeight:"bold"}}>{m[0]}</div>
              <span style={{color:"#fff",fontSize:13}}>{m}</span>
            </div>
          );
        })}
      </div>
      <SectionLabel text="Group Games"/>
      {groupGames.length===0?<div style={{background:Card,borderRadius:12,padding:"16px",textAlign:"center",color:"#444",fontSize:13}}>No games logged for this group yet</div>
        :groupGames.map(g=>{
          const myResult=g.results.find(r=>r.name==="You");
          const pot=g.results.reduce((s,r)=>s+(r.buyin||0),0);
          return(
            <div key={g.id} onClick={()=>{setSelectedGame(g);nav(S.GAME_DETAIL);}} style={{background:Card,borderRadius:14,padding:"14px 16px",marginBottom:10,cursor:"pointer",border:`1px solid ${myResult?.net>=0?`${Up}22`:myResult?.net<0?`${Down}22`:Border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><div style={{color:"#fff",fontWeight:"bold",fontSize:14}}>{g.game}</div><div style={{color:"#444",fontSize:11,marginTop:2}}>{g.date} · ${pot} pot</div></div>
                <div style={{textAlign:"right"}}>
                  <Tag text={g.settled?"✓ Settled":"⏳ Pending"} color={g.settled?Up:Gold}/>
                  {myResult&&<div style={{color:myResult.net>=0?Up:Down,fontWeight:"bold",fontSize:15,marginTop:4}}>{myResult.net>=0?"+":""}${myResult.net}</div>}
                </div>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

// ─── RIVALS ──────────────────────────────────────────────────────────────────
function RivalsScreen({nav,friends,setSelectedFriend,myGames}){
  // Compute live head-to-head from myGames
  const buildRival=fname=>{
    const sharedGames=myGames.filter(g=>(g.players||[]).includes(fname)&&(g.players||[]).includes("You"));
    const wins=sharedGames.filter(g=>{
      const me=g.results?.find(r=>r.name==="You"),them=g.results?.find(r=>r.name===fname);
      return me&&them&&me.net>them.net;
    }).length;
    const losses=sharedGames.filter(g=>{
      const me=g.results?.find(r=>r.name==="You"),them=g.results?.find(r=>r.name===fname);
      return me&&them&&me.net<them.net;
    }).length;
    const netVs=sharedGames.reduce((s,g)=>{
      const me=g.results?.find(r=>r.name==="You"),them=g.results?.find(r=>r.name===fname);
      return s+(me?.net||0)-(them?.net||0);
    },0);
    const recentGames=sharedGames.slice(0,5).map(g=>{
      const me=g.results?.find(r=>r.name==="You"),them=g.results?.find(r=>r.name===fname);
      return{date:g.date,net:me?.net||0,vsNet:them?.net||0};
    });
    // Fall back to static data if no shared games yet
    const fallback=RIVAL_DATA[fname];
    if(sharedGames.length>0) return{wins,losses,draws:sharedGames.length-wins-losses,netVs,games:recentGames};
    return fallback||{wins:0,losses:0,draws:0,netVs:0,games:[]};
  };
  return(
    <div style={{padding:"16px 20px"}}>
      <BackBtn onClick={()=>nav(S.FRIENDS)}/>
      <div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",fontFamily:"monospace",marginBottom:4}}>Head to Head</div>
      <div style={{color:"#fff",fontSize:22,fontWeight:"bold",marginBottom:6}}>Your Rivals</div>
      <div style={{color:"#555",fontSize:13,marginBottom:20}}>Your head-to-head record against every friend</div>
      {friends.map(f=>{
        const r=buildRival(f.name);
        const total=r.wins+r.losses+r.draws;
        const pct=total?Math.round((r.wins/total)*100):0;
        const isUp=r.netVs>=0;
        return(
          <div key={f.id} style={{background:Card,borderRadius:18,padding:"16px",marginBottom:12,border:`1px solid ${f.color}22`}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <Avatar char={f.avatar} color={f.color} size={44} fontSize={18}/>
              <div style={{flex:1}}>
                <div style={{color:"#fff",fontWeight:"bold",fontSize:15}}>{f.name}</div>
                <div style={{color:"#444",fontSize:11,marginTop:2,fontFamily:"monospace"}}>@{f.username}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:isUp?Up:Down,fontWeight:"bold",fontSize:16}}>{isUp?"+":""}${r.netVs}</div>
                <div style={{color:"#444",fontSize:10,marginTop:1}}>all-time vs</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[{label:"Wins",v:r.wins,c:Up},{label:"Losses",v:r.losses,c:Down},{label:"Total",v:total,c:"#fff"}].map(s=>(
                <div key={s.label} style={{background:`${s.c}11`,border:`1px solid ${s.c}22`,borderRadius:10,padding:"10px",textAlign:"center"}}>
                  <div style={{color:s.c,fontWeight:"bold",fontSize:18}}>{s.v}</div>
                  <div style={{color:"#444",fontSize:10,marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{height:6,background:Border,borderRadius:3,overflow:"hidden",marginBottom:4}}>
              <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${Up},#00b37a)`,borderRadius:3}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div style={{color:Up,fontSize:10}}>{pct}% win rate vs {f.name}</div>
              <div style={{color:Down,fontSize:10}}>{100-pct}% loss rate</div>
            </div>
            {r.games.length>0&&(
              <div style={{marginTop:12}}>
                {r.games.slice(0,3).map((g,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderTop:`1px solid ${Border}`}}>
                    <div style={{color:"#444",fontSize:11}}>{g.date}</div>
                    <div style={{color:"#888",fontSize:11}}>You: <span style={{color:g.net>0?Up:Down,fontWeight:"bold"}}>{g.net>=0?"+":""}${g.net}</span> · {f.name}: <span style={{color:g.vsNet>0?Up:Down,fontWeight:"bold"}}>{g.vsNet>=0?"+":""}${g.vsNet}</span></div>
                    <div style={{fontSize:14}}>{g.net>g.vsNet?"🏆":g.net<g.vsNet?"💸":"🤝"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── NEW GAME ────────────────────────────────────────────────────────────────
function NewGameScreen({nav,showToast,profile,friends,groups,addGame}){
  const [step,setStep]=useState(1);
  const [gameName,setGameName]=useState("");
  const [nameF,setNameF]=useState(false);
  const [selectedGroup,setSelectedGroup]=useState(null);
  const [selected,setSelected]=useState(new Set(["You"]));
  const [amounts,setAmounts]=useState({});
  const [focusedCell,setFocusedCell]=useState(null);
  const [showConfirm,setShowConfirm]=useState(false);

  const toggleFriend=name=>{if(name==="You")return;setSelected(prev=>{const n=new Set(prev);n.has(name)?n.delete(name):n.add(name);return n;});};
  const loadGroup=g=>{setSelectedGroup(g);setSelected(new Set(["You",...g.members]));};
  const allCandidates=[
    {name:"You",username:`@${(profile?.username||"you").toLowerCase().replace(/\s/g,"_")}`,color:Gold,initial:"Y"},
    ...friends.map(f=>({name:f.name,username:`@${f.username}`,color:f.color,initial:f.name[0]})),
  ];
  const upd=(name,field,val)=>{
    const clean=val.replace(/[^0-9.]/g,"").replace(/^(\d*\.?\d{0,2}).*$/,"$1");
    setAmounts(prev=>({...prev,[name]:{...prev[name],[field]:clean}}));
  };
  const activePlayers=allCandidates.filter(p=>selected.has(p.name));
  const nets=activePlayers.map(p=>{
    const a=amounts[p.name]||{};
    const buyinCents=parseCents(a.buyin||"");
    const cashoutCents=parseCents(a.cashout||"");
    return{name:p.name,buyinCents,cashoutCents,netCents:cashoutCents-buyinCents};
  });
  const totalBuyin=nets.reduce((s,p)=>s+p.buyinCents,0);
  const totalCashout=nets.reduce((s,p)=>s+p.cashoutCents,0);
  const imbalance=totalCashout-totalBuyin;
  const balanced=imbalance===0&&totalBuyin>0;
  const txns=balanced?minimizeDebts(nets.map(n=>({name:n.name,netCents:n.netCents}))):[];
  const finalName=gameName.trim()||"Unnamed Game";

  return(
    <div style={{padding:"16px 20px"}}>
      <BackBtn onClick={()=>step===1?nav(S.HOME):setStep(step-1)}/>
      <div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",marginBottom:4,fontFamily:"monospace"}}>New Game</div>
      <div style={{color:"#fff",fontSize:22,fontWeight:"bold",marginBottom:20}}>{step===1?"Setup Game":step===2?"Enter Amounts":"Review & Send"}</div>
      <div style={{display:"flex",gap:6,marginBottom:24}}>{[1,2,3].map(s=><div key={s} style={{flex:1,height:3,borderRadius:2,background:s<=step?Gold:Border,transition:"background .4s"}}/>)}</div>

      {step===1&&(
        <>
          {/* Game name */}
          <div style={{marginBottom:16}}>
            <div style={{color:nameF?Gold:"#444",fontSize:10,fontFamily:"monospace",letterSpacing:1,marginBottom:6,transition:"color .2s"}}>GAME NAME</div>
            <input value={gameName} onChange={e=>setGameName(e.target.value)} onFocus={()=>setNameF(true)} onBlur={()=>setNameF(false)} placeholder="e.g. Friday Night at Jake's" style={{width:"100%",background:nameF?"#13132a":Card,border:`1px solid ${nameF?Gold:Border}`,borderRadius:12,padding:"12px 14px",color:"#fff",fontSize:15,boxSizing:"border-box",outline:"none",transition:"all .2s"}}/>
          </div>
          {/* Quick load from group */}
          {groups.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{color:"#444",fontSize:10,fontFamily:"monospace",letterSpacing:1,marginBottom:8}}>QUICK LOAD FROM GROUP</div>
              <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
                {groups.map(g=>(
                  <div key={g.id} onClick={()=>loadGroup(g)} style={{flexShrink:0,background:selectedGroup?.id===g.id?`${g.color}22`:Card,border:`1px solid ${selectedGroup?.id===g.id?g.color:Border}`,borderRadius:12,padding:"8px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all .2s"}}>
                    <span style={{fontSize:16}}>{g.emoji}</span><span style={{color:selectedGroup?.id===g.id?g.color:"#aaa",fontSize:12,fontWeight:"bold",whiteSpace:"nowrap"}}>{g.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{color:"#444",fontSize:12,marginBottom:12}}>Tap to add or remove players. You are always included.</div>
          {allCandidates.map(p=>{
            const inGame=selected.has(p.name),isYou=p.name==="You";
            return(
              <div key={p.name} onClick={()=>toggleFriend(p.name)} style={{background:inGame?`${p.color}18`:Card,borderRadius:14,padding:"13px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:14,border:`1px solid ${inGame?`${p.color}55`:Border}`,cursor:isYou?"default":"pointer",transition:"all .2s"}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:`${p.color}${inGame?"33":"18"}`,border:`2px solid ${inGame?p.color:Border}`,display:"flex",alignItems:"center",justifyContent:"center",color:inGame?p.color:"#444",fontWeight:"bold",fontSize:16,transition:"all .2s",flexShrink:0}}>{p.initial}</div>
                <div style={{flex:1}}><div style={{color:inGame?"#fff":"#555",fontWeight:"bold",fontSize:15,transition:"color .2s"}}>{isYou?(profile?.username||"You"):p.name}</div><div style={{color:inGame?"#555":"#333",fontSize:11,marginTop:2,fontFamily:"monospace"}}>{p.username}</div></div>
                <div style={{background:inGame?`${Up}22`:"#1a1a2e",border:`1px solid ${inGame?`${Up}55`:Border}`,borderRadius:20,padding:"5px 14px",color:inGame?Up:"#444",fontSize:12,fontWeight:"bold",transition:"all .2s",flexShrink:0}}>{isYou?"✓ You":inGame?"✓ In":"+ Add"}</div>
              </div>
            );
          })}
          <div style={{color:"#444",fontSize:12,textAlign:"center",marginBottom:16}}>{selected.size} player{selected.size!==1?"s":""} selected{selected.size<2&&<span style={{color:Down}}> — need at least 2</span>}</div>
          <div style={{opacity:selected.size>=2?1:0.4,transition:"opacity .3s"}}>
            <PrimaryBtn label={`Next: Enter Amounts (${selected.size} players) →`} onClick={()=>{if(selected.size>=2)setStep(2);}}/>
          </div>
        </>
      )}

      {step===2&&(
        <>
          <div style={{color:"#444",fontSize:12,marginBottom:16,lineHeight:1.6}}>
            Enter each player's total buy-in and cashout. If someone bought in multiple times, just add it all up.
          </div>
          {activePlayers.map(p=>{
            const a=amounts[p.name]||{};
            const net=nets.find(n=>n.name===p.name);
            const hasData=(a.buyin||"")!==""||( a.cashout||"")!=="";
            const netC=net?.netCents||0;
            const rowColor=!hasData?Border:netC>0?Up:netC<0?Down:"#888";
            return(
              <div key={p.name} style={{background:Card,borderRadius:16,padding:"16px",marginBottom:12,border:`1px solid ${rowColor}44`,transition:"border-color .3s"}}>
                {/* Player header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:`${rowColor}22`,display:"flex",alignItems:"center",justifyContent:"center",color:rowColor,fontWeight:"bold",fontSize:14,transition:"all .3s"}}>{p.initial}</div>
                    <div>
                      <div style={{color:"#fff",fontWeight:"bold",fontSize:14}}>{p.name==="You"?(profile?.username||"You"):p.name}</div>
                      <div style={{color:"#383848",fontSize:11,fontFamily:"monospace"}}>{p.username}</div>
                    </div>
                  </div>
                  {hasData&&<div style={{color:netC>0?Up:netC<0?Down:"#888",fontWeight:"bold",fontSize:16,transition:"color .3s"}}>{netC>0?"+":""}{fmtCents(netC)}</div>}
                </div>
                {/* Two fields side by side */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[{field:"buyin",label:"TOTAL BUY-IN"},{field:"cashout",label:"CASH OUT"}].map(({field,label})=>{
                    const cellKey=`${p.name}-${field}`,focused=focusedCell===cellKey;
                    return(
                      <div key={field}>
                        <div style={{color:focused?Gold:"#444",fontSize:10,marginBottom:6,fontFamily:"monospace",letterSpacing:1,transition:"color .2s"}}>{label}</div>
                        <div style={{position:"relative"}}>
                          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:focused?Gold:"#555",fontSize:15,fontWeight:"bold",pointerEvents:"none",transition:"color .2s"}}>$</span>
                          <input value={a[field]||""} onChange={e=>upd(p.name,field,e.target.value)}
                            onFocus={()=>setFocusedCell(cellKey)} onBlur={()=>setFocusedCell(null)}
                            placeholder="0.00" inputMode="decimal"
                            style={{width:"100%",background:focused?"#13132a":BG,border:`1px solid ${focused?Gold:Border}`,borderRadius:10,padding:"11px 10px 11px 24px",color:"#fff",fontSize:17,fontWeight:"bold",boxSizing:"border-box",outline:"none",transition:"all .2s",fontFamily:"monospace"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div style={{background:totalBuyin===0?Card:balanced?`${Up}11`:`${Down}11`,border:`1px solid ${totalBuyin===0?Border:balanced?`${Up}44`:`${Down}44`}`,borderRadius:14,padding:"14px 16px",marginTop:4,marginBottom:18,transition:"all .3s"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"#555",fontSize:13}}>Total buy-in</span><span style={{color:"#fff",fontWeight:"bold",fontFamily:"monospace"}}>{fmtCents(totalBuyin)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{color:"#555",fontSize:13}}>Total cashout</span><span style={{color:"#fff",fontWeight:"bold",fontFamily:"monospace"}}>{fmtCents(totalCashout)}</span></div>
            <div style={{height:1,background:Border,marginBottom:10}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"#888",fontSize:13}}>Difference</span>
              <span style={{color:balanced?Up:totalBuyin===0?"#555":Down,fontWeight:"bold",fontFamily:"monospace",fontSize:15}}>{balanced?"✓ Balanced":imbalance>0?`+${fmtCents(imbalance)}`:fmtCents(imbalance)}</span>
            </div>
            {!balanced&&totalBuyin>0&&<div style={{color:Down,fontSize:11,marginTop:8,lineHeight:1.5}}>{imbalance>0?`Cashout is ${fmtCents(imbalance)} more than buy-in.`:`Cashout is ${fmtCentsAbs(imbalance)} less than buy-in.`} Check your numbers.</div>}
          </div>
          <div style={{opacity:balanced?1:0.4,transition:"opacity .3s"}}><PrimaryBtn label="Review Settlements →" onClick={()=>{if(balanced)setStep(3);}}/></div>
        </>
      )}

      {step===3&&(
        <>
          <SectionLabel text="Results"/>
          {nets.map(r=>(
            <div key={r.name} style={{background:Card,borderRadius:13,padding:"14px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",borderLeft:`3px solid ${r.netCents>0?Up:r.netCents<0?Down:"#444"}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:r.netCents>0?`${Up}22`:r.netCents<0?`${Down}22`:"#2a2a2a",display:"flex",alignItems:"center",justifyContent:"center",color:r.netCents>0?Up:r.netCents<0?Down:"#555",fontWeight:"bold",fontSize:13}}>{r.name[0]}</div>
                <div>
                  <div style={{color:"#fff",fontSize:14,fontWeight:"bold"}}>{r.name==="You"?(profile?.username||"You"):r.name}</div>
                  <div style={{color:"#444",fontSize:11,marginTop:1,fontFamily:"monospace"}}>{fmtCents(r.buyinCents)} in → {fmtCents(r.cashoutCents)} out</div>
                </div>
              </div>
              <div style={{color:r.netCents>0?Up:r.netCents<0?Down:"#888",fontWeight:"bold",fontSize:20,fontFamily:"monospace"}}>{r.netCents>0?"+":""}{fmtCents(r.netCents)}</div>
            </div>
          ))}
          <div style={{marginTop:16,marginBottom:6}}>
            <SectionLabel text={`${txns.length} payment${txns.length!==1?"s":""} needed`}/>
            {txns.length===0?<div style={{background:Card,borderRadius:13,padding:"16px",textAlign:"center",color:Up,fontSize:14}}>✓ Everyone is square!</div>
              :txns.map((t,i)=>(
                <div key={i} style={{background:Card,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${Border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{background:`${Down}22`,borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",color:Down,fontWeight:"bold",fontSize:13,flexShrink:0}}>{t.from[0]}</div>
                    <div style={{flex:1}}><div style={{color:"#aaa",fontSize:13}}>{t.from==="You"?(profile?.username||"You"):t.from}</div></div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}><div style={{color:Gold,fontWeight:"bold",fontSize:16,fontFamily:"monospace"}}>{fmtCents(t.amountCents)}</div><div style={{color:"#444",fontSize:16}}>→</div></div>
                    <div style={{flex:1,textAlign:"right"}}><div style={{color:"#aaa",fontSize:13}}>{t.to==="You"?(profile?.username||"You"):t.to}</div></div>
                    <div style={{background:`${Up}22`,borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",color:Up,fontWeight:"bold",fontSize:13,flexShrink:0}}>{t.to[0]}</div>
                  </div>
                </div>
              ))
            }
          </div>
          {!showConfirm?<PrimaryBtn label="Send payment requests →" onClick={()=>setShowConfirm(true)}/>
            :<div style={{background:`${Gold}11`,border:`1px solid ${Gold}44`,borderRadius:16,padding:"18px",marginTop:8}}>
              <div style={{color:Gold,fontWeight:"bold",fontSize:15,marginBottom:8}}>⚠️ Confirm send</div>
              <div style={{color:"#888",fontSize:13,lineHeight:1.6,marginBottom:16}}>Send requests for <span style={{color:Gold}}>"{finalName}"</span> to <span style={{color:"#fff"}}>{activePlayers.filter(p=>p.name!=="You").map(p=>p.name).join(", ")}</span>.</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div onClick={()=>setShowConfirm(false)} style={{background:Card,border:`1px solid ${Border}`,borderRadius:12,padding:"12px",textAlign:"center",color:"#888",cursor:"pointer",fontSize:14}}>Cancel</div>
                <div onClick={()=>{addGame(finalName,activePlayers,nets,selectedGroup?.id||null);}} style={{background:`linear-gradient(135deg,${Gold},${GoldDim})`,borderRadius:12,padding:"12px",textAlign:"center",color:BG,fontWeight:"bold",cursor:"pointer",fontSize:14}}>✓ Confirm</div>
              </div>
            </div>
          }
        </>
      )}
    </div>
  );
}

// ─── SETTLEMENTS ─────────────────────────────────────────────────────────────
function SettlementsScreen({nav,setSelectedDebt,debts,settleDebt,showToast}){
  const [tab,setTab]=useState("active");
  const owing=debts.filter(d=>d.from==="You"),owed=debts.filter(d=>d.to==="You");
  return(
    <div style={{padding:"16px 20px"}}>
      <BackBtn onClick={()=>nav(S.HOME)}/>
      <div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",marginBottom:4,fontFamily:"monospace"}}>Settle Up</div>
      <div style={{color:"#fff",fontSize:22,fontWeight:"bold",marginBottom:16}}>Who owes what</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {[["active","⚡ Active"],["history","📋 History"]].map(([t,label])=>(
          <div key={t} onClick={()=>setTab(t)} style={{textAlign:"center",padding:"10px",borderRadius:12,cursor:"pointer",background:tab===t?`${Gold}22`:Card,border:`1px solid ${tab===t?Gold:Border}`,color:tab===t?Gold:"#555",fontWeight:"bold",fontSize:13,transition:"all .2s"}}>{label}</div>
        ))}
      </div>
      {tab==="active"&&(
        <>
          {owing.length===0&&owed.length===0?(
            <div style={{background:Card,borderRadius:16,padding:"28px",textAlign:"center",marginTop:20}}><div style={{fontSize:40,marginBottom:10}}>🎉</div><div style={{color:Up,fontWeight:"bold",fontSize:16,marginBottom:6}}>All square!</div><div style={{color:"#444",fontSize:13}}>No pending debts with anyone.</div></div>
          ):(
            <>
              {owing.length>0&&<SectionLabel text="You Owe"/>}
              {owing.map(d=>(
                <div key={d.id} onClick={()=>{setSelectedDebt(d);nav(S.CONFIRM_PAY);}} style={{background:Card,borderRadius:16,padding:"16px",marginBottom:12,border:`1px solid ${Down}33`,cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{color:"#fff",fontSize:15,fontWeight:"bold"}}>You → {d.to}</div><div style={{color:"#444",fontSize:12,marginTop:3}}>{d.game}</div></div><div style={{color:Down,fontSize:22,fontWeight:"bold"}}>${d.amount}</div></div>
                  <div style={{marginTop:12,background:`${Down}18`,borderRadius:8,padding:"8px 12px",color:Down,fontSize:12,textAlign:"center"}}>Tap to mark as paid →</div>
                </div>
              ))}
              {owed.length>0&&<SectionLabel text="Owed to You"/>}
              {owed.map(d=>(
                <div key={d.id} style={{background:Card,borderRadius:16,padding:"16px",marginBottom:12,border:`1px solid ${Up}33`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{color:"#fff",fontSize:15,fontWeight:"bold"}}>{d.from} → You</div><div style={{color:"#444",fontSize:12,marginTop:3}}>{d.game}</div></div><div style={{color:Up,fontSize:22,fontWeight:"bold"}}>${d.amount}</div></div>
                  <div onClick={()=>{settleDebt(d.id);showToast(`✓ Confirmed $${d.amount} from ${d.from}!`);}} style={{marginTop:12,background:d.status==="awaiting"?`${Gold}18`:`${Up}18`,borderRadius:8,padding:"8px 12px",color:d.status==="awaiting"?Gold:Up,fontSize:12,textAlign:"center",cursor:"pointer"}}>{d.status==="awaiting"?"⏳ Awaiting their confirmation":"✓ Tap to confirm received"}</div>
                </div>
              ))}
            </>
          )}
        </>
      )}
      {tab==="history"&&(
        <>
          <div style={{color:"#555",fontSize:12,marginBottom:16}}>All settled payments from past games</div>
          {SETTLED_HISTORY.map(d=>(
            <div key={d.id} style={{background:Card,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${Up}22`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div><div style={{color:"#fff",fontSize:14,fontWeight:"bold"}}>{d.from==="You"?`You → ${d.to}`:`${d.from} → You`}</div><div style={{color:"#444",fontSize:11,marginTop:2}}>{d.game} · {d.date}</div></div>
                <div style={{color:d.from==="You"?Down:Up,fontWeight:"bold",fontSize:15}}>{d.from==="You"?"-":"+"}${d.amount}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><Tag text="✓ Settled" color={Up}/><div style={{color:"#444",fontSize:11}}>on {d.settledDate}</div></div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── CONFIRM PAY ─────────────────────────────────────────────────────────────
function ConfirmPayScreen({nav,debt,showToast,settleDebt,friends,profile}){
  if(!debt){nav(S.SETTLEMENTS);return null;}
  const payee=friends?.find(f=>f.name===debt.to);
  const theirVenmo=payee?.venmo||(debt.to==="You"?profile?.venmo:"");
  return(
    <div style={{padding:"16px 20px"}}>
      <BackBtn onClick={()=>nav(S.SETTLEMENTS)}/>
      <div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",marginBottom:4,fontFamily:"monospace"}}>Settle Up</div>
      <div style={{color:"#fff",fontSize:22,fontWeight:"bold",marginBottom:28}}>Confirm payment</div>
      <div style={{background:`linear-gradient(135deg,#13132a,#0d0d1e)`,border:`1px solid ${Gold}33`,borderRadius:22,padding:"32px",textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:54,marginBottom:12}}>💸</div>
        <div style={{color:"#555",fontSize:14,marginBottom:6}}>You're paying</div>
        <div style={{color:"#fff",fontSize:52,fontWeight:"bold",lineHeight:1}}>${debt.amount}</div>
        <div style={{color:Gold,fontSize:20,marginTop:10}}>to {debt.to}</div>
        <div style={{color:"#444",fontSize:13,marginTop:6}}>{debt.game}</div>
        {theirVenmo&&(
          <div style={{marginTop:16,background:"#00a4eb18",border:"1px solid #00a4eb44",borderRadius:12,padding:"10px 16px",display:"inline-flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>💸</span>
            <div style={{textAlign:"left"}}>
              <div style={{color:"#00a4eb",fontWeight:"bold",fontSize:13}}>Venmo: @{theirVenmo}</div>
              <div style={{color:"#555",fontSize:10,marginTop:1}}>Find them on Venmo to pay</div>
            </div>
          </div>
        )}
      </div>
      <div style={{background:Card,borderRadius:12,padding:"14px 16px",marginBottom:22,color:"#555",fontSize:13,lineHeight:1.7}}>Once you mark this paid, <span style={{color:Gold}}>{debt.to}</span> gets a notification to confirm. The debt clears when they confirm.</div>
      <PrimaryBtn label={`Mark $${debt.amount} as paid ✓`} onClick={()=>{settleDebt(debt.id);showToast(`✓ Sent to ${debt.to} for confirmation!`);nav(S.HOME);}}/>
    </div>
  );
}

// ─── FRIENDS ─────────────────────────────────────────────────────────────────
function FriendsScreen({nav,profile,setSelectedFriend,friends,setFriends}){
  const [search,setSearch]=useState(""),focused=useState(false),[sf,setSF]=useState(false);
  const [confirmRemove,setConfirmRemove]=useState(null);
  const filtered=friends.filter(f=>f.name.toLowerCase().includes(search.toLowerCase())||f.username.toLowerCase().includes(search.toLowerCase()));
  return(
    <div style={{padding:"16px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18}}>
        <div><BackBtn onClick={()=>nav(S.HOME)}/><div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",fontFamily:"monospace",marginBottom:3}}>Players</div><div style={{color:"#fff",fontSize:22,fontWeight:"bold"}}>Friends</div></div>
        <div style={{display:"flex",gap:8,alignItems:"center",paddingBottom:4}}>
          <div onClick={()=>nav(S.RIVALS)} style={{background:`#a78bfa18`,border:`1px solid #a78bfa44`,borderRadius:12,padding:"8px 12px",color:"#a78bfa",fontSize:12,fontWeight:"bold",cursor:"pointer"}}>⚔️ Rivals</div>
          <div onClick={()=>nav(S.ADD_FRIENDS)} style={{background:`${Gold}18`,border:`1px solid ${Gold}44`,borderRadius:12,padding:"8px 14px",color:Gold,fontSize:13,fontWeight:"bold",cursor:"pointer"}}>+ Add</div>
        </div>
      </div>
      <div style={{position:"relative",marginBottom:20}}>
        <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:15,opacity:.35,pointerEvents:"none"}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>setSF(true)} onBlur={()=>setSF(false)} placeholder="Search by name or @username..." style={{width:"100%",background:Card,border:`1px solid ${sf?Gold:Border}`,borderRadius:14,padding:"12px 14px 12px 40px",color:"#fff",fontSize:15,boxSizing:"border-box",outline:"none",transition:"border-color .2s"}}/>
        {search&&<span onClick={()=>setSearch("")} style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",color:"#444",cursor:"pointer",fontSize:18}}>×</span>}
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",color:"#333",padding:"40px 0",fontSize:14}}>No friends matching "{search}"</div>}
      {filtered.map(f=>(
        <div key={f.id} style={{background:Card,borderRadius:16,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:14,border:`1px solid ${Border}`}}>
          <div onClick={()=>{setSelectedFriend(f);nav(S.FRIEND_PROFILE);}} style={{display:"flex",alignItems:"center",gap:14,flex:1,cursor:"pointer"}}>
            <Avatar char={f.avatar} color={f.color} size={46} fontSize={19}/>
            <div style={{flex:1}}><div style={{color:"#fff",fontWeight:"bold",fontSize:15}}>{f.name}</div><div style={{color:"#444",fontSize:11,marginTop:2,fontFamily:"monospace"}}>@{f.username}</div></div>
            <div style={{textAlign:"right",marginRight:8}}><div style={{color:f.allTime>=0?Up:Down,fontWeight:"bold",fontSize:15}}>{f.allTime>=0?"+":""}${f.allTime}</div><div style={{color:"#444",fontSize:10,marginTop:1}}>all time</div></div>
          </div>
          <div onClick={()=>setConfirmRemove(f.id)} style={{width:32,height:32,borderRadius:"50%",background:`${Down}18`,border:`1px solid ${Down}33`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,flexShrink:0}}>×</div>
        </div>
      ))}
      {confirmRemove&&(()=>{const f=friends.find(x=>x.id===confirmRemove);return(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:24}}>
          <div style={{background:"#13131f",border:`1px solid ${Border}`,borderRadius:20,padding:"24px",width:"100%",maxWidth:320}}>
            <div style={{color:"#fff",fontWeight:"bold",fontSize:17,marginBottom:8}}>Remove {f?.name}?</div>
            <div style={{color:"#555",fontSize:13,lineHeight:1.6,marginBottom:20}}>They'll be removed from your friends list. Pending debts remain visible.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div onClick={()=>setConfirmRemove(null)} style={{background:Card,border:`1px solid ${Border}`,borderRadius:12,padding:"12px",textAlign:"center",color:"#888",cursor:"pointer",fontSize:14}}>Cancel</div>
              <div onClick={()=>{setFriends(prev=>prev.filter(f=>f.id!==confirmRemove));setConfirmRemove(null);}} style={{background:`${Down}22`,border:`1px solid ${Down}44`,borderRadius:12,padding:"12px",textAlign:"center",color:Down,fontWeight:"bold",cursor:"pointer",fontSize:14}}>Remove</div>
            </div>
          </div>
        </div>
      );})()}
      <div onClick={()=>nav(S.ADD_FRIENDS)} style={{border:`1px dashed ${Border}`,borderRadius:16,padding:"16px",textAlign:"center",color:"#333",cursor:"pointer",marginTop:6,fontSize:14}}>+ Invite a friend</div>
    </div>
  );
}

// ─── FRIEND PROFILE (with chat tab) ──────────────────────────────────────────
function FriendProfileScreen({nav,friend,fromScreen,profile}){
  const [tab,setTab]=useState("stats"),[chatMsg,setChatMsg]=useState("");
  const [chatHistory,setChatHistory]=useState({});
  if(!friend){nav(fromScreen||S.FRIENDS);return null;}
  const games=FRIEND_GAMES[friend.name]||[];
  const derived=deriveStats(games),score=calcScore(derived),rank=getRank(score);
  const wins=games.filter(g=>g.net>0).length,losses=games.filter(g=>g.net<0).length;
  const totalNet=games.reduce((s,g)=>s+g.net,0),winRate=games.length?Math.round((wins/games.length)*100):0;
  const rival=RIVAL_DATA[friend.name];
  const msgs=[...(GAME_CHATS[1]||[]),...(chatHistory[friend.id]||[])];
  const sendMsg=()=>{if(!chatMsg.trim())return;setChatHistory(prev=>({...prev,[friend.id]:[...(prev[friend.id]||[]),{id:Date.now(),from:"You",msg:chatMsg.trim(),time:"Just now",avatar:"Y",color:Gold}]}));setChatMsg("");};
  return(
    <div style={{padding:"0"}}>
      <div style={{background:`linear-gradient(135deg,${friend.color}22,#0d0d1e)`,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-20,top:-20,fontSize:130,opacity:.04,userSelect:"none"}}>{friend.avatar}</div>
        <BackBtn onClick={()=>nav(fromScreen||S.FRIENDS)}/>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          <div style={{position:"relative"}}>
            <Avatar char={friend.avatar} color={friend.color} size={72} fontSize={28}/>
            <div style={{position:"absolute",bottom:-4,right:-4,background:rank.color,borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,border:`2px solid #0d0d1e`}}>{rank.emoji}</div>
          </div>
          <div style={{flex:1}}>
            <div style={{color:"#fff",fontWeight:"bold",fontSize:22}}>{friend.name}</div>
            <div style={{color:"#555",fontSize:13,fontFamily:"monospace",marginTop:2}}>@{friend.username}</div>
            {friend.venmo&&(
              <div style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:6,background:"#00a4eb18",border:"1px solid #00a4eb44",borderRadius:8,padding:"3px 10px"}}>
                <span style={{fontSize:13}}>💸</span>
                <span style={{color:"#00a4eb",fontSize:12,fontFamily:"monospace",fontWeight:"bold"}}>@{friend.venmo}</span>
                <span style={{color:"#555",fontSize:10}}>Venmo</span>
              </div>
            )}
            {!friend.venmo&&(
              <div style={{color:"#333",fontSize:11,marginTop:6}}>No Venmo set</div>
            )}
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
              <div style={{background:`${rank.color}22`,border:`1px solid ${rank.color}44`,borderRadius:10,padding:"3px 10px",color:rank.color,fontSize:12,fontWeight:"bold"}}>{rank.emoji} {rank.tier}</div>
              <div style={{background:`${rank.color}18`,borderRadius:8,padding:"3px 8px",color:rank.color,fontSize:12,fontFamily:"monospace",fontWeight:"bold"}}>{score.toFixed(1)}/10</div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,paddingBottom:16,borderBottom:`1px solid ${Border}`}}>
          {[{label:"All-time",val:`${totalNet>=0?"+":""}$${totalNet}`,color:totalNet>=0?Up:Down},{label:"Win Rate",val:`${winRate}%`,color:winRate>=50?Up:Down},{label:"Games",val:`${games.length}`,color:"#fff"}].map(s=>(
            <div key={s.label} style={{textAlign:"center"}}><div style={{color:s.color,fontWeight:"bold",fontSize:18}}>{s.val}</div><div style={{color:"#444",fontSize:10,marginTop:2}}>{s.label}</div></div>
          ))}
        </div>
      </div>
      <div style={{padding:"14px 20px 0"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5,marginBottom:16}}>
          {[["stats","📊"],["rank","⚡"],["rivals","⚔️"],["chat","💬"]].map(([t,icon])=>(
            <div key={t} onClick={()=>setTab(t)} style={{textAlign:"center",padding:"9px 4px",borderRadius:11,cursor:"pointer",background:tab===t?`${friend.color}22`:Card,border:`1px solid ${tab===t?friend.color:Border}`,color:tab===t?friend.color:"#444",fontWeight:"bold",fontSize:11,transition:"all .2s"}}>{icon} {t.charAt(0).toUpperCase()+t.slice(1)}</div>
          ))}
        </div>
        {tab==="stats"&&(
          <>
            <div style={{background:Card,border:`1px solid ${Border}`,borderRadius:16,padding:"16px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                {[{v:wins,l:"Wins",c:Up},{v:losses,l:"Losses",c:Down},{v:games.length,l:"Total",c:"#fff"}].map(s=><div key={s.l} style={{textAlign:"center",flex:1}}><div style={{color:s.c,fontSize:24,fontWeight:"bold"}}>{s.v}</div><div style={{color:"#444",fontSize:11}}>{s.l}</div></div>)}
              </div>
              <div style={{height:6,background:Border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${winRate}%`,background:`linear-gradient(90deg,${Up},#00b37a)`,borderRadius:3}}/></div>
            </div>
            <div style={{background:Card,border:`1px solid ${friend.color}22`,borderRadius:16,padding:"16px",marginBottom:14}}>
              <div style={{color:Gold,fontSize:10,letterSpacing:2,marginBottom:10,fontFamily:"monospace"}}>⏳ {derived.gamesPlayed} GAMES PLAYED</div>
              {METRICS.map((m,i)=><MetricBar key={m.key} metric={m} value={derived[m.key]} color={friend.color} delay={i*60}/>)}
            </div>
          </>
        )}
        {tab==="rank"&&(
          <div style={{background:`linear-gradient(135deg,#0d0d1e,#13132a)`,border:`1px solid ${rank.color}44`,borderRadius:20,padding:"20px",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div><div style={{color:rank.color,fontSize:9,letterSpacing:3,fontFamily:"monospace",marginBottom:6}}>PLAYER RANK</div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:26}}>{rank.emoji}</span><span style={{color:rank.color,fontWeight:"bold",fontSize:22}}>{rank.tier}</span></div></div>
              <ScoreRing score={score} rank={rank} size={110}/>
            </div>
            <div style={{background:`${rank.color}0e`,border:`1px solid ${rank.color}1a`,borderRadius:10,padding:"10px 14px",color:"#777",fontSize:12,lineHeight:1.6,fontStyle:"italic"}}>"{rank.desc}"</div>
          </div>
        )}
        {tab==="rivals"&&rival&&(
          <>
            <div style={{background:Card,border:`1px solid ${friend.color}33`,borderRadius:16,padding:"16px",marginBottom:14}}>
              <div style={{color:Gold,fontSize:10,letterSpacing:2,marginBottom:12,fontFamily:"monospace"}}>⚔️ HEAD TO HEAD VS {friend.name.toUpperCase()}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                {[{label:"Your Wins",v:rival.wins,c:Up},{label:"Losses",v:rival.losses,c:Down},{label:"Total",v:rival.wins+rival.losses,c:"#fff"}].map(s=>(
                  <div key={s.label} style={{background:`${s.c}11`,border:`1px solid ${s.c}22`,borderRadius:10,padding:"10px",textAlign:"center"}}><div style={{color:s.c,fontWeight:"bold",fontSize:20}}>{s.v}</div><div style={{color:"#444",fontSize:10,marginTop:2}}>{s.label}</div></div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"#555",fontSize:13}}>Net vs {friend.name}</span><span style={{color:rival.netVs>=0?Up:Down,fontWeight:"bold",fontSize:15}}>{rival.netVs>=0?"+":""}${rival.netVs}</span></div>
              <div style={{height:6,background:Border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${rival.wins+rival.losses?Math.round(rival.wins/(rival.wins+rival.losses)*100):50}%`,background:`linear-gradient(90deg,${Up},#00b37a)`,borderRadius:3}}/></div>
            </div>
            <SectionLabel text="Recent Games Together"/>
            {rival.games.slice(0,5).map((g,i)=>(
              <div key={i} style={{background:Card,borderRadius:12,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",border:`1px solid ${g.net>0?`${Up}22`:g.net<0?`${Down}22`:Border}`}}>
                <div><div style={{color:"#fff",fontSize:13}}>{g.date}</div><div style={{color:"#444",fontSize:11,marginTop:1}}>You: <span style={{color:g.net>0?Up:Down,fontWeight:"bold"}}>{g.net>0?"+":""}${g.net}</span> · {friend.name}: <span style={{color:g.vsNet>0?Up:Down,fontWeight:"bold"}}>{g.vsNet>0?"+":""}${g.vsNet}</span></div></div>
                <div style={{fontSize:16}}>{g.net>g.vsNet?"🏆":g.net<g.vsNet?"💸":"🤝"}</div>
              </div>
            ))}
          </>
        )}
        {tab==="chat"&&(
          <div>
            <div style={{color:"#555",fontSize:12,marginBottom:14}}>Chat from recent games with {friend.name}</div>
            <div style={{background:Card,borderRadius:16,padding:"12px",marginBottom:12,maxHeight:280,overflowY:"auto"}}>
              {msgs.map((m,i)=>{
                const isMe=m.from==="You";
                return(
                  <div key={i} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start",marginBottom:10}}>
                    {!isMe&&<div style={{width:28,height:28,borderRadius:"50%",background:`${m.color}22`,border:`1px solid ${m.color}44`,display:"flex",alignItems:"center",justifyContent:"center",color:m.color,fontWeight:"bold",fontSize:12,flexShrink:0,marginRight:8}}>{m.avatar}</div>}
                    <div style={{maxWidth:"72%"}}>
                      {!isMe&&<div style={{color:m.color,fontSize:10,marginBottom:3,fontWeight:"bold"}}>{m.from}</div>}
                      <div style={{background:isMe?`${Gold}22`:Border,border:`1px solid ${isMe?Gold:Border}`,borderRadius:isMe?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"8px 12px",color:"#fff",fontSize:13,lineHeight:1.5}}>{m.msg}</div>
                      <div style={{color:"#333",fontSize:9,marginTop:3,textAlign:isMe?"right":"left"}}>{m.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:10}}>
              <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Send a message..." style={{flex:1,background:Card,border:`1px solid ${Border}`,borderRadius:12,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none"}}/>
              <div onClick={sendMsg} style={{width:44,height:44,borderRadius:12,background:`${Gold}22`,border:`1px solid ${Gold}44`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18}}>→</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADD FRIENDS ─────────────────────────────────────────────────────────────
function AddFriendsScreen({nav,showToast,friends}){
  const [search,setSearch]=useState(""),focused=useState(false),[sf,setSF]=useState(false),[sent,setSent]=useState({});
  const friendIds=new Set(friends.map(f=>f.id));
  const results=search.length>0?ALL_USERS.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())&&!friendIds.has(u.id)):[];
  const sendRequest=u=>{setSent(s=>({...s,[u.id]:true}));showToast(`✓ Request sent to ${u.name}!`);};
  return(
    <div style={{padding:"16px 20px"}}>
      <BackBtn onClick={()=>nav(S.FRIENDS)}/>
      <div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",fontFamily:"monospace",marginBottom:4}}>Discover</div>
      <div style={{color:"#fff",fontSize:22,fontWeight:"bold",marginBottom:20}}>Add Friends</div>
      <div style={{position:"relative",marginBottom:24}}>
        <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:15,opacity:.35,pointerEvents:"none"}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>setSF(true)} onBlur={()=>setSF(false)} placeholder="Search by username..." autoFocus style={{width:"100%",background:Card,border:`1px solid ${sf?Gold:Border}`,borderRadius:14,padding:"13px 14px 13px 40px",color:"#fff",fontSize:15,boxSizing:"border-box",outline:"none",transition:"border-color .2s"}}/>
        {search&&<span onClick={()=>setSearch("")} style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",color:"#444",cursor:"pointer",fontSize:20}}>×</span>}
      </div>
      {search.length===0&&(
        <><SectionLabel text="Suggested — People you may know"/>
          {ALL_USERS.filter(u=>!friendIds.has(u.id)).slice(0,4).map(u=>(
            <div key={u.id} style={{background:Card,borderRadius:16,padding:"13px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12,border:`1px solid ${Border}`}}>
              <Avatar char={u.avatar} color={u.color} size={44} fontSize={17}/>
              <div style={{flex:1}}><div style={{color:"#fff",fontWeight:"bold",fontSize:15}}>{u.name}</div><div style={{color:"#444",fontSize:11,marginTop:2,fontFamily:"monospace"}}>@{u.username}</div>{u.mutual>0&&<div style={{color:"#383848",fontSize:11,marginTop:2}}>{u.mutual} mutual friend{u.mutual!==1?"s":""}</div>}</div>
              <div onClick={!sent[u.id]?()=>sendRequest(u):undefined} style={{background:sent[u.id]?`${Up}18`:`${Gold}18`,border:`1px solid ${sent[u.id]?`${Up}44`:`${Gold}44`}`,borderRadius:10,padding:"8px 14px",color:sent[u.id]?Up:Gold,fontSize:12,fontWeight:"bold",cursor:sent[u.id]?"default":"pointer",whiteSpace:"nowrap"}}>{sent[u.id]?"✓ Sent":"+ Add"}</div>
            </div>
          ))}
        </>
      )}
      {search.length>0&&results.length===0&&<div style={{textAlign:"center",color:"#333",padding:"40px 0",fontSize:14}}>No users found for "{search}"</div>}
      {search.length>0&&results.map(u=>(
        <div key={u.id} style={{background:Card,borderRadius:16,padding:"13px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12,border:`1px solid ${Border}`}}>
          <Avatar char={u.avatar} color={u.color} size={44} fontSize={17}/>
          <div style={{flex:1}}><div style={{color:"#fff",fontWeight:"bold",fontSize:15}}>{u.name}</div><div style={{color:"#444",fontSize:11,marginTop:2,fontFamily:"monospace"}}>@{u.username}</div></div>
          <div onClick={!sent[u.id]?()=>sendRequest(u):undefined} style={{background:sent[u.id]?`${Up}18`:`${Gold}18`,border:`1px solid ${sent[u.id]?`${Up}44`:`${Gold}44`}`,borderRadius:10,padding:"8px 14px",color:sent[u.id]?Up:Gold,fontSize:12,fontWeight:"bold",cursor:sent[u.id]?"default":"pointer",whiteSpace:"nowrap"}}>{sent[u.id]?"✓ Sent":"+ Add"}</div>
        </div>
      ))}
      <div style={{marginTop:16,background:Card,border:`1px solid ${Border}`,borderRadius:16,padding:"16px",display:"flex",alignItems:"center",gap:14}}><div style={{fontSize:28}}>🔗</div><div style={{flex:1}}><div style={{color:"#fff",fontWeight:"bold",fontSize:14}}>Invite via link</div><div style={{color:"#444",fontSize:12,marginTop:2}}>Share your invite link</div></div><div style={{background:`${Gold}22`,border:`1px solid ${Gold}44`,borderRadius:10,padding:"7px 14px",color:Gold,fontSize:12,fontWeight:"bold",cursor:"pointer"}}>Copy</div></div>
    </div>
  );
}

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
function LeaderboardScreen({profile,setSelectedFriend,setSelectedWorldPlayer,nav,friends,myGames}){
  const [tab,setTab]=useState("friends"),[worldSearch,setWorldSearch]=useState("");
  const myAllTime=myGames.reduce((s,g)=>s+g.net,0);
  // Build friends list with "You" entry that uses live username + allTime
  const friendsSorted=[
    ...friends,
    {id:0,name:profile?.username||"You",avatar:profile?.avatarChar||"♠",color:profile?.avatarColor||Gold,allTime:myAllTime,isYou:true,username:(profile?.username||"you").toLowerCase().replace(/\s/g,"_")},
  ].sort((a,b)=>b.allTime-a.allTime);
  // World board — swap the static "You" entry with live data
  const worldSorted=[...WORLD_BOARD]
    .map(u=>u.isYou?{...u,name:profile?.username||"You",avatar:profile?.avatarChar||"♠",color:profile?.avatarColor||Gold,allTime:myAllTime}:u)
    .sort((a,b)=>b.allTime-a.allTime);
  const filteredWorld=worldSearch?worldSorted.filter(u=>u.name.toLowerCase().includes(worldSearch.toLowerCase())):worldSorted;
  const yourWorldRank=worldSorted.findIndex(u=>u.isYou)+1;
  const medals=["🥇","🥈","🥉"];
  return(
    <div style={{padding:"16px 20px"}}>
      <BackBtn onClick={()=>nav(S.HOME)}/>
      <div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",marginBottom:4,fontFamily:"monospace"}}>Hall of Fame</div>
      <div style={{color:"#fff",fontSize:22,fontWeight:"bold",marginBottom:18}}>Leaderboard</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {[["friends","👥 Friends"],["world","🌍 World"]].map(([t,label])=>(
          <div key={t} onClick={()=>setTab(t)} style={{textAlign:"center",padding:"11px",borderRadius:14,cursor:"pointer",background:tab===t?`${Gold}22`:Card,border:`1px solid ${tab===t?Gold:Border}`,color:tab===t?Gold:"#555",fontWeight:"bold",fontSize:13,transition:"all .2s"}}>{label}</div>
        ))}
      </div>
      {tab==="friends"&&friendsSorted.map((f,i)=>(
        <div key={f.id} onClick={()=>{if(!f.isYou){const fr=friends.find(x=>x.name===f.name);if(fr){setSelectedFriend(fr);nav(S.FRIEND_PROFILE);}}}}
          style={{background:f.isYou?`linear-gradient(135deg,${Gold}18,${GoldDim}08)`:i===0?`linear-gradient(135deg,#1e1a0a,${Card})`:Card,border:`1px solid ${f.isYou?`${Gold}55`:i===0?`${Gold}33`:Border}`,borderRadius:16,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12,cursor:f.isYou?"default":"pointer"}}>
          <div style={{width:30,textAlign:"center",fontSize:i<3?18:12,color:i<3?Gold:"#444",flexShrink:0}}>{medals[i]||`#${i+1}`}</div>
          <Avatar char={f.avatar} color={f.isYou?Gold:f.color} size={40} fontSize={17}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:f.isYou?Gold:"#fff",fontWeight:"bold",fontSize:14,display:"flex",alignItems:"center",gap:6}}>
              {f.isYou?(profile?.username||"You"):f.name}
              {f.isYou&&<span style={{background:`${Gold}22`,border:`1px solid ${Gold}44`,borderRadius:6,padding:"1px 6px",fontSize:9,color:Gold,letterSpacing:1}}>YOU</span>}
            </div>
            <div style={{color:"#383838",fontSize:11,marginTop:1,fontFamily:"monospace"}}>@{f.isYou?(profile?.username||"you").toLowerCase().replace(/\s/g,"_"):f.username||f.name.toLowerCase()}</div>
          </div>
          <div style={{color:f.allTime>=0?Up:Down,fontWeight:"bold",fontSize:18,fontFamily:"monospace"}}>{f.allTime>=0?"+":""}${f.allTime}</div>
        </div>
      ))}
      {tab==="world"&&(
        <>
          <div style={{background:`linear-gradient(135deg,${Gold}18,${GoldDim}08)`,border:`1px solid ${Gold}44`,borderRadius:16,padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:28}}>🌍</div>
            <div style={{flex:1}}><div style={{color:"#888",fontSize:11,marginBottom:2}}>Your global rank</div><div style={{color:Gold,fontWeight:"bold",fontSize:20}}>#{yourWorldRank} in the world</div></div>
            <div style={{color:Up,fontWeight:"bold",fontSize:16,fontFamily:"monospace"}}>{myAllTime>=0?"+":""}${myAllTime}</div>
          </div>
          <div style={{position:"relative",marginBottom:16}}>
            <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:15,opacity:.35,pointerEvents:"none"}}>🔍</span>
            <input value={worldSearch} onChange={e=>setWorldSearch(e.target.value)} placeholder="Search players..." style={{width:"100%",background:Card,border:`1px solid ${Border}`,borderRadius:12,padding:"10px 14px 10px 40px",color:"#fff",fontSize:14,boxSizing:"border-box",outline:"none"}}/>
            {worldSearch&&<span onClick={()=>setWorldSearch("")} style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",color:"#444",cursor:"pointer",fontSize:18}}>×</span>}
          </div>
          {filteredWorld.map((u,i)=>(
            <div key={u.id} onClick={()=>{if(u.isYou)return;if(u.isYousFriend){const fr=friends.find(f=>f.name===u.name);if(fr){setSelectedFriend(fr);nav(S.FRIEND_PROFILE);return;}}setSelectedWorldPlayer(u);nav(S.WORLD_PROFILE);}}
              style={{background:u.isYou?`linear-gradient(135deg,${Gold}18,${GoldDim}08)`:Card,border:`1px solid ${u.isYou?`${Gold}55`:u.isYousFriend?`${Gold}18`:Border}`,borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10,cursor:u.isYou?"default":"pointer"}}>
              <div style={{width:32,textAlign:"center",fontSize:i<3?16:11,color:i<3?Gold:"#444",flexShrink:0,fontFamily:"monospace"}}>{medals[i]||`#${i+1}`}</div>
              <Avatar char={u.avatar} color={u.isYou?Gold:u.color} size={36} fontSize={15}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span style={{color:u.isYou?Gold:"#fff",fontWeight:"bold",fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:110}}>{u.isYou?(profile?.username||"You"):u.name}</span>
                  {u.isYou&&<span style={{background:`${Gold}22`,border:`1px solid ${Gold}44`,borderRadius:5,padding:"1px 5px",fontSize:9,color:Gold,letterSpacing:1,flexShrink:0}}>YOU</span>}
                  {u.isYousFriend&&!u.isYou&&<span style={{background:`#a78bfa22`,border:`1px solid #a78bfa44`,borderRadius:5,padding:"1px 5px",fontSize:9,color:"#a78bfa",flexShrink:0}}>FRIEND</span>}
                </div>
                <div style={{color:"#444",fontSize:10,marginTop:1}}>{u.country} All-time</div>
              </div>
              <div style={{color:u.allTime>=0?Up:Down,fontWeight:"bold",fontSize:15,fontFamily:"monospace",flexShrink:0}}>{u.allTime>=0?"+":""}${u.allTime}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── WORLD PROFILE ───────────────────────────────────────────────────────────
function WorldProfileScreen({nav,player}){
  const [tab,setTab]=useState("stats");
  if(!player){nav(S.LEADERBOARD);return null;}
  const stats=WORLD_STATS[player.name]||{winRate:6,profitPerGame:5,roi:5,consistency:6,bigWinRate:5,gamesPlayed:20};
  const score=calcScore(stats),rank=getRank(score);
  const games=WORLD_GAMES[player.name]||[];
  const wins=games.filter(g=>g.net>0).length,totalNet=games.reduce((s,g)=>s+g.net,0);
  const winRate=games.length?Math.round((wins/games.length)*100):0;
  const bestGame=games.length?games.reduce((b,g)=>g.net>b.net?g:b,games[0]):null;
  return(
    <div style={{padding:"0"}}>
      <div style={{background:`linear-gradient(135deg,${player.color}22,#0d0d1e)`,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-20,top:-20,fontSize:130,opacity:.04,userSelect:"none"}}>{player.avatar}</div>
        <BackBtn onClick={()=>nav(S.LEADERBOARD)}/>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          <div style={{position:"relative"}}>
            <Avatar char={player.avatar} color={player.color} size={72} fontSize={28}/>
            <div style={{position:"absolute",bottom:-4,right:-4,background:rank.color,borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,border:`2px solid #0d0d1e`}}>{rank.emoji}</div>
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <div style={{color:"#fff",fontWeight:"bold",fontSize:22}}>{player.name}</div>
              <div style={{fontSize:18}}>{player.country}</div>
              {player.isYousFriend&&<span style={{background:`#a78bfa22`,border:`1px solid #a78bfa44`,borderRadius:8,padding:"2px 8px",color:"#a78bfa",fontSize:10,fontWeight:"bold"}}>FRIEND</span>}
            </div>
            <div style={{color:"#555",fontSize:12,fontFamily:"monospace",marginTop:3}}>Public profile</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
              <div style={{background:`${rank.color}22`,border:`1px solid ${rank.color}44`,borderRadius:10,padding:"3px 10px",color:rank.color,fontSize:12,fontWeight:"bold"}}>{rank.emoji} {rank.tier}</div>
              <div style={{background:`${rank.color}18`,borderRadius:8,padding:"3px 8px",color:rank.color,fontSize:12,fontFamily:"monospace",fontWeight:"bold"}}>{score.toFixed(1)}/10</div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,paddingBottom:16,borderBottom:`1px solid ${Border}`}}>
          {[{label:"All-time",val:`${player.allTime>=0?"+":""}$${player.allTime}`,color:player.allTime>=0?Up:Down},{label:"Win Rate",val:`${winRate}%`,color:winRate>=50?Up:Down},{label:"Games",val:`${stats.gamesPlayed}`,color:"#fff"}].map(s=>(
            <div key={s.label} style={{textAlign:"center"}}><div style={{color:s.color,fontWeight:"bold",fontSize:18}}>{s.val}</div><div style={{color:"#444",fontSize:10,marginTop:2}}>{s.label}</div></div>
          ))}
        </div>
      </div>
      <div style={{padding:"14px 20px 0"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:16}}>
          {[["stats","📊 Stats"],["rank","⚡ Rank"],["history","📋 Recent"]].map(([t,label])=>(
            <div key={t} onClick={()=>setTab(t)} style={{textAlign:"center",padding:"9px 4px",borderRadius:11,cursor:"pointer",background:tab===t?`${player.color}22`:Card,border:`1px solid ${tab===t?player.color:Border}`,color:tab===t?player.color:"#444",fontWeight:"bold",fontSize:11,transition:"all .2s"}}>{label}</div>
          ))}
        </div>
        {tab==="stats"&&<div style={{background:Card,border:`1px solid ${player.color}22`,borderRadius:16,padding:"16px"}}><div style={{color:Gold,fontSize:10,letterSpacing:2,marginBottom:10,fontFamily:"monospace"}}>⏳ {stats.gamesPlayed} GAMES PLAYED</div>{METRICS.map((m,i)=><MetricBar key={m.key} metric={m} value={stats[m.key]} color={player.color} delay={i*60}/>)}</div>}
        {tab==="rank"&&(
          <div style={{background:`linear-gradient(135deg,#0d0d1e,#13132a)`,border:`1px solid ${rank.color}44`,borderRadius:20,padding:"20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div><div style={{color:rank.color,fontSize:9,letterSpacing:3,fontFamily:"monospace",marginBottom:6}}>PLAYER RANK</div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:26}}>{rank.emoji}</span><span style={{color:rank.color,fontWeight:"bold",fontSize:22}}>{rank.tier}</span></div></div>
              <ScoreRing score={score} rank={rank} size={110}/>
            </div>
            <div style={{background:`${rank.color}0e`,border:`1px solid ${rank.color}1a`,borderRadius:10,padding:"10px 14px",color:"#777",fontSize:12,lineHeight:1.6,fontStyle:"italic"}}>"{rank.desc}"</div>
          </div>
        )}
        {tab==="history"&&(
          <><div style={{background:`${Gold}11`,border:`1px solid ${Gold}22`,borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:16}}>🔒</span><div style={{color:"#888",fontSize:12}}>Showing last 5 public games only</div></div>
            {games.map((g,i)=>(
              <div key={i} style={{background:Card,border:`1px solid ${g.net>0?`${Up}33`:g.net<0?`${Down}22`:Border}`,borderRadius:14,padding:"13px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:38,height:38,borderRadius:12,background:g.net>0?`${Up}18`:g.net<0?`${Down}18`:"#1a1a2e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{g.net>0?"🏆":g.net<0?"💸":"🤝"}</div>
                <div style={{flex:1}}><div style={{color:"#fff",fontWeight:"bold",fontSize:14}}>{g.game}</div><div style={{color:"#444",fontSize:11,marginTop:2,fontFamily:"monospace"}}>{g.date} · ${g.buyin} buy-in</div></div>
                <div style={{textAlign:"right"}}><div style={{color:g.net>0?Up:g.net<0?Down:"#888",fontWeight:"bold",fontSize:16,fontFamily:"monospace"}}>{g.net>0?"+":""}${g.net}</div><div style={{color:"#444",fontSize:10,marginTop:1}}>{g.net>0?"Win":"Loss"}</div></div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── HISTORY ─────────────────────────────────────────────────────────────────
function HistoryScreen({nav,setSelectedGame,myGames}){
  const [search,setSearch]=useState(""),[sf,setSF]=useState(false);
  const filtered=myGames.filter(g=>
    g.game.toLowerCase().includes(search.toLowerCase())||
    g.date.toLowerCase().includes(search.toLowerCase())||
    (g.players||[]).some(p=>p.toLowerCase().includes(search.toLowerCase()))
  );
  const totalNet=myGames.reduce((s,g)=>s+g.net,0);
  return(
    <div style={{padding:"16px 20px"}}>
      <BackBtn onClick={()=>nav(S.HOME)}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",marginBottom:4,fontFamily:"monospace"}}>Archive</div>
          <div style={{color:"#fff",fontSize:22,fontWeight:"bold"}}>Game History</div>
          <div style={{color:"#444",fontSize:12,marginTop:2}}>{myGames.length} games · All-time: <span style={{color:totalNet>=0?Up:Down,fontWeight:"bold"}}>{totalNet>=0?"+":""}${totalNet}</span></div>
        </div>
      </div>
      {/* Search */}
      <div style={{position:"relative",marginBottom:16}}>
        <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:15,opacity:.35,pointerEvents:"none"}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>setSF(true)} onBlur={()=>setSF(false)}
          placeholder="Search by game, date, or player..."
          style={{width:"100%",background:Card,border:`1px solid ${sf?Gold:Border}`,borderRadius:12,padding:"11px 14px 11px 40px",color:"#fff",fontSize:14,boxSizing:"border-box",outline:"none",transition:"border-color .2s"}}/>
        {search&&<span onClick={()=>setSearch("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#444",cursor:"pointer",fontSize:18}}>×</span>}
      </div>
      {filtered.length===0&&(
        <div style={{background:Card,borderRadius:14,padding:"28px",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:8}}>{myGames.length===0?"🃏":"🔍"}</div>
          <div style={{color:"#555",fontSize:14}}>{myGames.length===0?"No games logged yet. Log your first game!":"No games matching your search."}</div>
        </div>
      )}
      {filtered.map(g=>{
        const totalPot=g.results?g.results.reduce((s,r)=>s+(r.buyin||0),0):(g.buyin||0)*(g.players?.length||1);
        const myResult=g.results?g.results.find(r=>r.name==="You"):{net:g.net,buyin:g.buyin,cashout:g.cashout};
        return(
          <div key={g.id} onClick={()=>{setSelectedGame(g);nav(S.GAME_DETAIL);}}
            style={{background:Card,borderRadius:16,padding:"16px",marginBottom:12,border:`1px solid ${(myResult?.net||0)>=0?`${Up}33`:(myResult?.net||0)<0?`${Down}22`:Border}`,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{flex:1,minWidth:0,marginRight:10}}>
                <div style={{color:"#fff",fontWeight:"bold",fontSize:15,marginBottom:3}}>{g.game}</div>
                <div style={{color:"#444",fontSize:12}}>{g.date} · {(g.players||[]).length} players · ${totalPot} pot</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <Tag text={g.settled?"✓ Settled":"⏳ Pending"} color={g.settled?Up:Gold}/>
                {myResult&&<div style={{color:(myResult.net||0)>=0?Up:Down,fontWeight:"bold",fontSize:16,fontFamily:"monospace"}}>{(myResult.net||0)>=0?"+":""}${myResult.net||0}</div>}
              </div>
            </div>
            <div style={{color:"#444",fontSize:11}}>Tap to see full breakdown →</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── GAME DETAIL ─────────────────────────────────────────────────────────────
function GameDetailScreen({nav,game,chats,addChat,profile,onEdit}){
  const [tab,setTab]=useState("results"),[chatMsg,setChatMsg]=useState("");
  if(!game){nav(S.HISTORY);return null;}
  const totalPot=(game.results||[]).reduce((s,r)=>s+(r.buyin||0),0)||game.buyin||0;
  const sorted=[...(game.results||[])].sort((a,b)=>b.net-a.net);
  const txns=game.results?minimizeDebts(game.results.map(r=>({name:r.name,netCents:(r.net||0)*100}))):[];
  const gameMsgs=(chats&&chats[game.id])||[];
  const send=()=>{if(!chatMsg.trim())return;addChat(game.id,chatMsg.trim(),profile);setChatMsg("");};
  return(
    <div style={{padding:"16px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <BackBtn onClick={()=>nav(S.HISTORY)}/>
        <div onClick={onEdit} style={{background:`${Gold}18`,border:`1px solid ${Gold}44`,borderRadius:10,padding:"7px 14px",color:Gold,fontSize:12,fontWeight:"bold",cursor:"pointer",marginBottom:16}}>✏️ Edit</div>
      </div>
      <div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",fontFamily:"monospace",marginBottom:4}}>Game Recap</div>
      <div style={{color:"#fff",fontSize:22,fontWeight:"bold",marginBottom:4}}>{game.game}</div>
      <div style={{color:"#444",fontSize:13,marginBottom:16}}>{game.date} · {(game.results||[]).length} players · ${totalPot} total pot</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:16}}>
        {[["results","📊 Results"],["payments","💸 Payments"],["chat","💬 Chat"]].map(([t,label])=>(
          <div key={t} onClick={()=>setTab(t)} style={{textAlign:"center",padding:"9px 4px",borderRadius:11,cursor:"pointer",background:tab===t?`${Gold}22`:Card,border:`1px solid ${tab===t?Gold:Border}`,color:tab===t?Gold:"#444",fontWeight:"bold",fontSize:10,transition:"all .2s"}}>{label}</div>
        ))}
      </div>
      {tab==="results"&&sorted.map((r,i)=>{
        const totalIn=r.buyin||r.buyins?.reduce((a,b)=>a+b.amount,0)||0;
        return(
          <div key={r.name} style={{background:Card,borderRadius:13,padding:"13px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,borderLeft:`3px solid ${r.net>0?Up:r.net<0?Down:"#444"}`}}>
            <div style={{width:26,textAlign:"center",color:i===0?Gold:"#444",fontWeight:"bold",fontSize:i===0?16:12}}>{i===0?"🏆":`#${i+1}`}</div>
            <div style={{width:34,height:34,borderRadius:"50%",background:r.net>0?`${Up}22`:r.net<0?`${Down}22`:"#1a1a2e",display:"flex",alignItems:"center",justifyContent:"center",color:r.net>0?Up:r.net<0?Down:"#555",fontWeight:"bold",fontSize:14,flexShrink:0}}>{r.name[0]}</div>
            <div style={{flex:1}}>
              <div style={{color:r.name==="You"?Gold:"#fff",fontWeight:"bold",fontSize:14}}>{r.name}</div>
              <div style={{color:"#444",fontSize:11,fontFamily:"monospace",marginTop:1}}>
                ${totalIn} in → ${r.cashout} out
              </div>
            </div>
            <div style={{color:r.net>0?Up:r.net<0?Down:"#888",fontWeight:"bold",fontSize:18,fontFamily:"monospace"}}>{r.net>0?"+":""}${r.net}</div>
          </div>
        );
      })}
      {tab==="payments"&&(
        <>
          {txns.length===0?<div style={{background:Card,borderRadius:12,padding:"16px",textAlign:"center",color:Up,fontSize:14}}>✓ Everyone is square!</div>
            :txns.map((t,i)=>(
              <div key={i} style={{background:Card,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${Border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{background:`${Down}22`,borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",color:Down,fontWeight:"bold",fontSize:13,flexShrink:0}}>{t.from[0]}</div>
                  <div style={{flex:1}}><div style={{color:"#aaa",fontSize:13}}>{t.from}</div></div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}><div style={{color:Gold,fontWeight:"bold",fontSize:16,fontFamily:"monospace"}}>${(t.amountCents/100).toFixed(2)}</div><div style={{color:"#444",fontSize:16}}>→</div></div>
                  <div style={{flex:1,textAlign:"right"}}><div style={{color:"#aaa",fontSize:13}}>{t.to}</div></div>
                  <div style={{background:`${Up}22`,borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",color:Up,fontWeight:"bold",fontSize:13,flexShrink:0}}>{t.to[0]}</div>
                </div>
              </div>
            ))
          }
          <div style={{background:game.settled?`${Up}11`:`${Gold}11`,border:`1px solid ${game.settled?`${Up}33`:`${Gold}33`}`,borderRadius:14,padding:"14px 16px",marginTop:8,display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:24}}>{game.settled?"✅":"⏳"}</div>
            <div><div style={{color:game.settled?Up:Gold,fontWeight:"bold",fontSize:14}}>{game.settled?"Fully Settled":"Settlement Pending"}</div><div style={{color:"#444",fontSize:12,marginTop:2}}>{game.settled?"All payments confirmed":"Some players still owe"}</div></div>
          </div>
        </>
      )}
      {tab==="chat"&&(
        <div>
          {gameMsgs.length===0?<div style={{background:Card,borderRadius:12,padding:"20px",textAlign:"center",color:"#444",fontSize:13}}>No messages yet. Say something! 👋</div>
            :gameMsgs.map((m,i)=>{
              const isMe=m.from==="You"||m.from===(profile?.username)||m.isMe;
              return(
                <div key={i} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start",marginBottom:10}}>
                  {!isMe&&<div style={{width:28,height:28,borderRadius:"50%",background:`${m.color}22`,border:`1px solid ${m.color}44`,display:"flex",alignItems:"center",justifyContent:"center",color:m.color,fontWeight:"bold",fontSize:12,flexShrink:0,marginRight:8}}>{m.avatar}</div>}
                  <div style={{maxWidth:"72%"}}>
                    {!isMe&&<div style={{color:m.color,fontSize:10,marginBottom:3,fontWeight:"bold"}}>{m.from}</div>}
                    <div style={{background:isMe?`${Gold}22`:Border,border:`1px solid ${isMe?Gold:Border}`,borderRadius:isMe?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"8px 12px",color:"#fff",fontSize:13,lineHeight:1.5}}>{m.msg}</div>
                    <div style={{color:"#333",fontSize:9,marginTop:3,textAlign:isMe?"right":"left"}}>{m.time}</div>
                  </div>
                </div>
              );
            })
          }
          {/* Chat input */}
          <div style={{display:"flex",gap:10,marginTop:12}}>
            <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
              placeholder="Say something..." style={{flex:1,background:Card,border:`1px solid ${Border}`,borderRadius:12,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none"}}/>
            <div onClick={send} style={{width:44,height:44,borderRadius:12,background:`${Gold}22`,border:`1px solid ${Gold}44`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,flexShrink:0}}>→</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
function SettingsScreen({nav,profile,setProfile,showToast,onReplayOnboard}){
  const [tab,setTab]=useState("profile"),[username,setUsername]=useState(profile.username);
  const [venmo,setVenmo]=useState(profile.venmo||"");
  const [pickingAvatar,setPickingAvatar]=useState(false);
  const [oldPw,setOldPw]=useState(""),[ newPw,setNewPw]=useState(""),[ confirmPw,setConfirmPw]=useState("");
  const [showOld,setShowOld]=useState(false),[showNew,setShowNew]=useState(false);
  const fileRef=useRef(null);
  const saveProfile=()=>{if(!username.trim())return;setProfile(p=>({...p,username:username.trim(),venmo:venmo.trim().replace(/^@/,"")}));showToast("✓ Profile saved!");};
  const savePassword=()=>{if(newPw.length<6){showToast("Password must be 6+ characters");return;}if(newPw!==confirmPw){showToast("Passwords don't match");return;}setOldPw("");setNewPw("");setConfirmPw("");showToast("✓ Password updated!");};
  const handlePhoto=e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>setProfile(p=>({...p,photo:ev.target.result,avatarChar:null}));reader.readAsDataURL(file);};
  const selectAvatar=char=>{setProfile(p=>({...p,avatarChar:char,photo:null}));setPickingAvatar(false);showToast("✓ Avatar updated!");};
  return(
    <div style={{padding:"16px 20px"}}>
      <BackBtn onClick={()=>nav(S.HOME)}/>
      <div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",fontFamily:"monospace",marginBottom:4}}>Account</div>
      <div style={{color:"#fff",fontSize:22,fontWeight:"bold",marginBottom:22}}>Settings</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:24}}>
        {[["profile","👤 Profile"],["security","🔒 Security"],["privacy","🔏 Privacy"]].map(([t,label])=>(
          <div key={t} onClick={()=>setTab(t)} style={{textAlign:"center",padding:"10px 4px",borderRadius:12,cursor:"pointer",background:tab===t?`${Gold}22`:Card,border:`1px solid ${tab===t?Gold:Border}`,color:tab===t?Gold:"#555",fontWeight:"bold",fontSize:11,transition:"all .2s"}}>{label}</div>
        ))}
      </div>
      {tab==="profile"&&(
        <>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:28}}>
            <div style={{position:"relative",marginBottom:14}}>
              {profile.photo?<img src={profile.photo} alt="av" style={{width:88,height:88,borderRadius:"50%",objectFit:"cover",border:`3px solid ${profile.avatarColor||Gold}`,boxShadow:`0 0 24px ${Gold}44`}}/>
                :<div style={{width:88,height:88,borderRadius:"50%",background:`${profile.avatarColor||Gold}22`,border:`3px solid ${profile.avatarColor||Gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,boxShadow:`0 0 24px ${Gold}44`}}>{profile.avatarChar||profile.username[0].toUpperCase()}</div>}
              <div onClick={()=>setPickingAvatar(true)} style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:Gold,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,boxShadow:"0 2px 8px rgba(0,0,0,.5)"}}>✏️</div>
            </div>
            <div style={{color:"#fff",fontWeight:"bold",fontSize:17}}>{profile.username}</div>
            <div style={{color:"#444",fontSize:13,marginTop:2,fontFamily:"monospace"}}>@{profile.username.toLowerCase().replace(/\s/g,"_")}</div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <div onClick={()=>fileRef.current?.click()} style={{background:Card,border:`1px solid ${Border}`,borderRadius:11,padding:"8px 16px",color:"#aaa",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>📷 Camera Roll</div>
              <div onClick={()=>setPickingAvatar(true)} style={{background:Card,border:`1px solid ${Border}`,borderRadius:11,padding:"8px 16px",color:"#aaa",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>🎭 Character</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>
          </div>
          {pickingAvatar&&(
            <div style={{background:"#13132a",border:`1px solid ${Gold}44`,borderRadius:20,padding:"20px",marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{color:"#fff",fontWeight:"bold",fontSize:15}}>Choose a character</div><span onClick={()=>setPickingAvatar(false)} style={{color:"#555",fontSize:22,cursor:"pointer",lineHeight:1}}>×</span></div>
              <div style={{marginBottom:14}}><div style={{color:"#444",fontSize:10,letterSpacing:2,marginBottom:8,fontFamily:"monospace"}}>COLOR</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{AVATAR_COLORS.map(c=><div key={c} onClick={()=>setProfile(p=>({...p,avatarColor:c}))} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${profile.avatarColor===c?"#fff":"transparent"}`,transition:"border .15s"}}/>)}</div></div>
              <div style={{color:"#444",fontSize:10,letterSpacing:2,marginBottom:8,fontFamily:"monospace"}}>CHARACTER</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:8}}>{AVATARS.map(a=><div key={a} onClick={()=>selectAvatar(a)} style={{width:36,height:36,borderRadius:10,background:`${profile.avatarColor||Gold}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",border:`1px solid ${profile.avatarChar===a?Gold:Border}`,transition:"border .15s"}}>{a}</div>)}</div>
            </div>
          )}
          <SectionLabel text="Display Name & Username"/>
          <div style={{background:Card,border:`1px solid ${Border}`,borderRadius:14,padding:"14px 16px",marginBottom:20}}>
            <div style={{color:"#444",fontSize:10,fontFamily:"monospace",letterSpacing:1,marginBottom:6}}>DISPLAY NAME</div>
            <input value={username} onChange={e=>setUsername(e.target.value)} style={{width:"100%",background:BG,border:`1px solid ${Border}`,borderRadius:10,padding:"10px 12px",color:"#fff",fontSize:16,boxSizing:"border-box",outline:"none",marginBottom:12}}/>
            <div style={{color:"#444",fontSize:10,fontFamily:"monospace",letterSpacing:1,marginBottom:6}}>USERNAME</div>
            <div style={{position:"relative"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#555",fontSize:15,fontFamily:"monospace"}}>@</span><input value={username.toLowerCase().replace(/\s/g,"_")} readOnly style={{width:"100%",background:"#0a0a14",border:`1px solid ${Border}`,borderRadius:10,padding:"10px 12px 10px 28px",color:"#555",fontSize:14,boxSizing:"border-box",outline:"none",fontFamily:"monospace",cursor:"not-allowed"}}/></div>
          </div>
          {/* Venmo */}
          <div style={{background:Card,border:`1px solid #00a4eb33`,borderRadius:14,padding:"14px 16px",marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:28,height:28,borderRadius:8,background:"#00a4eb22",border:"1px solid #00a4eb44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>💸</div>
              <div>
                <div style={{color:"#fff",fontWeight:"bold",fontSize:14}}>Venmo Username</div>
                <div style={{color:"#555",fontSize:11,marginTop:1}}>Friends see this so they know where to pay you</div>
              </div>
            </div>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#00a4eb",fontSize:15,fontFamily:"monospace",fontWeight:"bold"}}>@</span>
              <input value={venmo} onChange={e=>setVenmo(e.target.value.replace(/^@/,""))} placeholder="your-venmo-handle"
                style={{width:"100%",background:BG,border:`1px solid #00a4eb44`,borderRadius:10,padding:"10px 12px 10px 28px",color:"#fff",fontSize:15,boxSizing:"border-box",outline:"none",fontFamily:"monospace"}}/>
            </div>
            <div style={{color:"#383848",fontSize:11,marginTop:8}}>ℹ️ Just your username — no payments are processed here</div>
          </div>
          <PrimaryBtn label="Save Profile" onClick={saveProfile}/>
        </>
      )}
      {tab==="security"&&(
        <>
          <SectionLabel text="Change Password"/>
          <div style={{background:Card,border:`1px solid ${Border}`,borderRadius:16,padding:"16px",marginBottom:20}}>
            {[{label:"CURRENT PASSWORD",val:oldPw,set:setOldPw,show:showOld,toggle:()=>setShowOld(s=>!s)},{label:"NEW PASSWORD",val:newPw,set:setNewPw,show:showNew,toggle:()=>setShowNew(s=>!s)},{label:"CONFIRM NEW",val:confirmPw,set:setConfirmPw,show:showNew,toggle:null}].map((f,i)=>(
              <div key={i} style={{marginBottom:i<2?16:0}}>
                <div style={{color:"#444",fontSize:10,fontFamily:"monospace",letterSpacing:1,marginBottom:6}}>{f.label}</div>
                <div style={{position:"relative"}}>
                  <input type={f.show?"text":"password"} value={f.val} onChange={e=>f.set(e.target.value)} placeholder="••••••••" style={{width:"100%",background:BG,border:`1px solid ${Border}`,borderRadius:10,padding:"10px 40px 10px 12px",color:"#fff",fontSize:15,boxSizing:"border-box",outline:"none"}}/>
                  {f.toggle&&<span onClick={f.toggle} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:16,opacity:.5}}>{f.show?"🙈":"👁️"}</span>}
                </div>
                {i===1&&newPw.length>0&&<div style={{marginTop:6,height:3,background:Border,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,newPw.length/12*100)}%`,background:newPw.length<6?Down:newPw.length<10?Gold:Up,borderRadius:2,transition:"width .3s,background .3s"}}/></div>}
              </div>
            ))}
          </div>
          <PrimaryBtn label="Update Password" onClick={savePassword}/>
          <div style={{marginTop:32}}><SectionLabel text="Danger Zone"/><div style={{background:Card,border:`1px solid ${Down}33`,borderRadius:16,padding:"16px"}}><div style={{color:"#fff",fontWeight:"bold",marginBottom:6}}>Delete Account</div><div style={{color:"#555",fontSize:13,marginBottom:14,lineHeight:1.6}}>Permanently delete your account and all game history. This cannot be undone.</div><div style={{background:`${Down}18`,border:`1px solid ${Down}44`,borderRadius:10,padding:"12px",textAlign:"center",color:Down,fontWeight:"bold",fontSize:14,cursor:"pointer"}}>Delete My Account</div></div></div>
          <div style={{marginTop:16}}><div onClick={onReplayOnboard} style={{background:Card,border:`1px solid ${Border}`,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}><div style={{fontSize:22}}>🎓</div><div><div style={{color:"#fff",fontSize:14,fontWeight:"bold"}}>Replay Tutorial</div><div style={{color:"#444",fontSize:12,marginTop:2}}>See the onboarding walkthrough again</div></div></div></div>
        </>
      )}
      {tab==="privacy"&&(
        <>
          <SectionLabel text="Profile Visibility"/>
          <div style={{background:Card,border:`1px solid ${Border}`,borderRadius:16,padding:"16px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div><div style={{color:"#fff",fontWeight:"bold",fontSize:14}}>Public Profile</div><div style={{color:"#555",fontSize:12,marginTop:3,lineHeight:1.5}}>Anyone can search your username and view your stats</div></div>
              <Toggle on={profile.isPublic||false} onToggle={()=>setProfile(p=>({...p,isPublic:!p.isPublic}))}/>
            </div>
            <div style={{background:profile.isPublic?`${Up}18`:`${Gold}18`,border:`1px solid ${profile.isPublic?`${Up}44`:`${Gold}44`}`,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>{profile.isPublic?"🌍":"🔒"}</span>
              <div><div style={{color:profile.isPublic?Up:Gold,fontWeight:"bold",fontSize:13}}>{profile.isPublic?"Public":"Private"}</div><div style={{color:"#555",fontSize:11,marginTop:1}}>{profile.isPublic?"Stats visible on World leaderboard":"Only friends can see your stats"}</div></div>
            </div>
          </div>
          <SectionLabel text="What people can see"/>
          <div style={{background:Card,border:`1px solid ${Border}`,borderRadius:16,overflow:"hidden",marginBottom:16}}>
            {[{label:"All-time earnings",sub:"Show total profit/loss",key:"showEarnings",def:true},{label:"Win/loss record",sub:"Show games won and lost",key:"showRecord",def:true},{label:"Game history",sub:"Show individual game results",key:"showHistory",def:false}].map((item,i)=>(
              <div key={item.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderBottom:i<2?`1px solid ${Border}`:"none",opacity:profile.isPublic?1:0.35,transition:"opacity .25s"}}>
                <div><div style={{color:"#fff",fontSize:13,fontWeight:"bold"}}>{item.label}</div><div style={{color:"#555",fontSize:11,marginTop:2}}>{item.sub}</div></div>
                <Toggle on={(profile[item.key]??item.def)&&profile.isPublic} onToggle={()=>{if(!profile.isPublic)return;setProfile(p=>({...p,[item.key]:!(p[item.key]??item.def)}));}}/>
              </div>
            ))}
          </div>
          <SectionLabel text="Friend Settings"/>
          <div style={{background:Card,border:`1px solid ${Border}`,borderRadius:16,overflow:"hidden"}}>
            {[{label:"Allow friend requests",sub:"Anyone can send you a request",key:"allowRequests",def:true},{label:"Show on 'People you may know'",sub:"Appear in friend suggestions",key:"showSuggestions",def:true}].map((item,i)=>(
              <div key={item.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderBottom:i===0?`1px solid ${Border}`:"none"}}>
                <div><div style={{color:"#fff",fontSize:13,fontWeight:"bold"}}>{item.label}</div><div style={{color:"#555",fontSize:11,marginTop:2}}>{item.sub}</div></div>
                <Toggle on={profile[item.key]??item.def} onToggle={()=>setProfile(p=>({...p,[item.key]:!(p[item.key]??item.def)}))}/>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── RANK SCREEN ─────────────────────────────────────────────────────────────
const GROUP_PLAYERS=[{name:"You",isYou:true},{name:"Jake"},{name:"Sarah"},{name:"Tom"},{name:"Mia"},{name:"Carlos"}];
function RankScreen({nav,profile,myStats,myScore,myRank}){
  const [tab,setTab]=useState("card"),[player,setPlayer]=useState("You");
  const getPlayerStats=p=>p==="You"?myStats:(PLAYER_STATS[p]||PLAYER_STATS["You"]);
  const getPlayerScore=p=>p==="You"?myScore:calcScore(PLAYER_STATS[p]||PLAYER_STATS["You"]);
  const getPlayerRank=p=>p==="You"?myRank:getRank(calcScore(PLAYER_STATS[p]||PLAYER_STATS["You"]));
  const stats=getPlayerStats(player),score=getPlayerScore(player),rank=getPlayerRank(player);
  const nextIdx=RANKS.findIndex(r=>r.tier===rank.tier)+1,nextRank=RANKS[nextIdx]||null;
  const toNext=nextRank?nextRank.min-score:0,pct=nextRank?((score-rank.min)/(rank.max-rank.min))*100:100;
  const groupRanked=GROUP_PLAYERS.map(p=>({...p,score:getPlayerScore(p.name),rank:getPlayerRank(p.name)})).sort((a,b)=>b.score-a.score);
  const displayName=player==="You"?(profile?.username||"You"):player;
  return(
    <div style={{padding:"16px 20px"}}>
      <div style={{marginBottom:16}}><BackBtn onClick={()=>nav(S.HOME)}/><div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",fontFamily:"monospace",marginBottom:3}}>Player Rating</div><div style={{color:"#fff",fontSize:22,fontWeight:"bold"}}>Rank</div></div>
      <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:6,marginBottom:16}}>
        {GROUP_PLAYERS.map(p=>{
          const s=getPlayerScore(p.name),r=getPlayerRank(p.name),active=player===p.name,label=p.isYou?(profile?.username||"You"):p.name;
          return <div key={p.name} onClick={()=>{setPlayer(p.name);setTab("card");}} style={{flexShrink:0,background:active?`${r.color}22`:Card,border:`1px solid ${active?r.color:Border}`,borderRadius:12,padding:"7px 11px",cursor:"pointer",textAlign:"center",transition:"all .2s"}}><div style={{fontSize:16}}>{r.emoji}</div><div style={{color:active?r.color:"#555",fontSize:10,fontWeight:"bold",marginTop:2,whiteSpace:"nowrap"}}>{label.split(" ")[0]}</div><div style={{color:active?r.color:"#383848",fontSize:9,fontFamily:"monospace"}}>{s.toFixed(1)}</div></div>;
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:16}}>
        {[["card","🏅 Card"],["metrics","📊 Stats"],["ladder","🪜 Ranks"],["group","👥 Group"]].map(([t,label])=>(
          <div key={t} onClick={()=>setTab(t)} style={{textAlign:"center",padding:"8px 2px",borderRadius:10,cursor:"pointer",background:tab===t?`${rank.color}22`:Card,border:`1px solid ${tab===t?rank.color:Border}`,color:tab===t?rank.color:"#444",fontWeight:"bold",fontSize:10,transition:"all .2s"}}>{label}</div>
        ))}
      </div>
      {tab==="card"&&(
        <>
          <div style={{background:"linear-gradient(135deg,#0d0d1e,#13132a)",border:`1px solid ${rank.color}44`,borderRadius:24,padding:"24px 20px",marginBottom:14,position:"relative",overflow:"hidden",boxShadow:`0 0 50px ${rank.color}14`}}>
            <div style={{position:"absolute",right:-18,bottom:-28,fontSize:140,opacity:.03,userSelect:"none",color:rank.color}}>♠</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div><div style={{color:rank.color,fontSize:9,letterSpacing:3,fontFamily:"monospace",marginBottom:4}}>PLAYER RANK</div><div style={{color:"#fff",fontSize:20,fontWeight:"bold"}}>{displayName}</div><div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}><div style={{background:`${rank.color}22`,border:`1px solid ${rank.color}55`,borderRadius:10,padding:"5px 14px",color:rank.color,fontWeight:"bold",fontSize:15}}>{rank.emoji} {rank.tier}</div></div></div>
              <ScoreRing score={score} rank={rank} size={120}/>
            </div>
            <div style={{background:`${rank.color}0e`,border:`1px solid ${rank.color}1a`,borderRadius:12,padding:"11px 14px",color:"#888",fontSize:12,lineHeight:1.6,marginBottom:18,fontStyle:"italic"}}>"{rank.desc}"</div>
            {nextRank?<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><div style={{color:"#444",fontSize:11}}>Progress to {nextRank.emoji} {nextRank.tier}</div><div style={{color:rank.color,fontSize:11,fontFamily:"monospace"}}>{toNext.toFixed(2)} pts away</div></div><div style={{height:5,background:"#1a1a2e",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${rank.color}77,${rank.color})`,borderRadius:3,boxShadow:`0 0 8px ${rank.color}55`,transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)"}}/></div></div>
              :<div style={{background:`${Gold}18`,border:`1px solid ${Gold}44`,borderRadius:10,padding:"10px 14px",color:Gold,fontWeight:"bold",fontSize:12,textAlign:"center"}}>🦈 Maximum rank achieved. You are the apex predator.</div>}
          </div>
          {rank.perks.length>0&&<div style={{marginBottom:14}}><SectionLabel text="Rank Perks Unlocked"/><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{rank.perks.map((p,i)=><div key={i} style={{background:`${rank.color}18`,border:`1px solid ${rank.color}33`,borderRadius:10,padding:"6px 12px",color:rank.color,fontSize:12,fontWeight:"bold"}}>✓ {p}</div>)}</div></div>}
        </>
      )}
      {tab==="metrics"&&(
        <div style={{background:Card,border:`1px solid ${rank.color}33`,borderRadius:20,padding:"18px",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}><span style={{fontSize:24}}>{rank.emoji}</span><div><div style={{color:"#fff",fontWeight:"bold",fontSize:15}}>{displayName}</div><div style={{color:rank.color,fontSize:12}}>{rank.tier} · {score.toFixed(2)}/10</div></div></div>
          {METRICS.map((m,i)=><MetricBar key={m.key} metric={m} value={stats[m.key]} color={rank.color} delay={i*70}/>)}
        </div>
      )}
      {tab==="ladder"&&(
        <div style={{background:Card,border:`1px solid ${Border}`,borderRadius:20,padding:"18px",marginBottom:14,position:"relative"}}>
          <div style={{position:"absolute",left:18+16,top:20,bottom:20,width:2,background:"linear-gradient(180deg,#c9a84c33,#33333322)",borderRadius:1}}/>
          {[...RANKS].reverse().map(r=>{
            const isCur=r.tier===rank.tier,isAbove=r.min>score,pct2=isCur?((score-r.min)/(r.max-r.min))*100:0;
            return <div key={r.tier} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,opacity:isAbove?.3:1,transition:"opacity .3s"}}>
              <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,background:isCur?`${r.color}28`:"#0f0f1d",border:`2px solid ${isCur?r.color:"#2a2a3a"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,boxShadow:isCur?`0 0 14px ${r.color}55`:"none"}}>{r.emoji}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{color:isCur?r.color:"#aaa",fontWeight:"bold",fontSize:13}}>{r.tier}</span>{isCur&&player==="You"&&<span style={{background:`${r.color}22`,border:`1px solid ${r.color}44`,borderRadius:5,padding:"1px 6px",fontSize:8,color:r.color,letterSpacing:1,fontFamily:"monospace"}}>YOU</span>}</div>
                <div style={{color:"#2a2a3a",fontSize:9,fontFamily:"monospace",marginTop:1}}>{r.min.toFixed(1)} – {r.max.toFixed(1)}</div>
              </div>
              <div style={{width:52,height:4,background:"#1a1a2e",borderRadius:2,overflow:"hidden"}}>
                {isCur&&<div style={{height:"100%",width:`${pct2}%`,background:r.color,borderRadius:2}}/>}
                {!isAbove&&!isCur&&<div style={{height:"100%",width:"100%",background:`${r.color}55`,borderRadius:2}}/>}
              </div>
            </div>;
          })}
        </div>
      )}
      {tab==="group"&&(
        <>{groupRanked.map((p,pos)=>{
          const r=getRank(p.score),label=p.isYou?(profile?.username||"You"):p.name;
          return <div key={p.name} onClick={()=>{setPlayer(p.name);setTab("card");}} style={{background:p.isYou?`linear-gradient(135deg,${r.color}18,${Card})`:Card,border:`1px solid ${p.isYou?`${r.color}55`:Border}`,borderRadius:16,padding:"13px 16px",marginBottom:9,display:"flex",alignItems:"center",gap:11,cursor:"pointer"}}>
            <div style={{width:26,textAlign:"center",color:pos<3?Gold:"#333",fontWeight:"bold",fontSize:pos<3?17:12,flexShrink:0}}>{pos===0?"🥇":pos===1?"🥈":pos===2?"🥉":`#${pos+1}`}</div>
            <div style={{width:38,height:38,borderRadius:"50%",flexShrink:0,background:`${r.color}22`,border:`2px solid ${r.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>{r.emoji}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:p.isYou?r.color:"#fff",fontWeight:"bold",fontSize:14}}>{label}</span>{p.isYou&&<span style={{background:`${r.color}22`,border:`1px solid ${r.color}44`,borderRadius:5,padding:"1px 5px",fontSize:8,color:r.color,letterSpacing:1}}>YOU</span>}</div>
              <div style={{color:r.color,fontSize:11,marginTop:1}}>{r.tier}</div>
            </div>
            <div style={{textAlign:"right"}}><div style={{color:r.color,fontWeight:"bold",fontSize:17,fontFamily:"monospace"}}>{p.score.toFixed(1)}</div><div style={{color:"#333",fontSize:9}}>/ 10</div></div>
          </div>;
        })}</>
      )}
    </div>
  );
}

// ─── STATS ───────────────────────────────────────────────────────────────────
const PERIODS=["1W","1M","3M","1Y","ALL"];
function StatsScreen({profile,nav,myGames,myStats,myScore,myRank}){
  const [period,setPeriod]=useState("1M");
  const chartData=buildChartFromGames(myGames,period);
  const cutoffs={"1W":7,"1M":30,"3M":90,"1Y":365,"ALL":9999};
  const now=new Date();
  const cutoff=new Date(now); cutoff.setDate(cutoff.getDate()-cutoffs[period]);
  const pg=myGames.filter(g=>{
    const d=new Date(g.date+(g.date.includes(",")?"":` ${now.getFullYear()}`));
    return d>=cutoff;
  });
  const totalNet=pg.reduce((s,g)=>s+g.net,0);
  const wins=pg.filter(g=>g.net>0).length,losses=pg.filter(g=>g.net<0).length;
  const winRate=pg.length?Math.round((wins/pg.length)*100):0;
  const bestWin=pg.length?Math.max(...pg.map(g=>g.net)):0;
  const worstLoss=pg.length?Math.min(...pg.map(g=>g.net)):0;
  const avgPerGame=pg.length?Math.round(totalNet/pg.length):0;
  const avgPerWeek=Math.round(totalNet/Math.max(1,cutoffs[period]/7));
  const sorted=[...myGames].sort((a,b)=>new Date(b.date)-new Date(a.date));
  let streak=0; for(const g of sorted){if(g.net>0)streak++;else break;}
  const isUp=totalNet>=0,color=isUp?Up:Down;
  const first=chartData[0]?.value??0,last=chartData[chartData.length-1]?.value??0;
  const pct=first!==0?Math.abs(((last-first)/Math.abs(first+0.01))*100).toFixed(1):"∞";
  const nextIdx=RANKS.findIndex(r=>r.tier===myRank.tier)+1;
  const nextRank=RANKS[nextIdx]||null;
  const rankPct=nextRank?((myScore-myRank.min)/(myRank.max-myRank.min))*100:100;
  return(
    <div style={{padding:"16px 20px"}}>
      <BackBtn onClick={()=>nav(S.HOME)}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",fontFamily:"monospace",marginBottom:3}}>Your Performance</div><div style={{color:"#fff",fontSize:22,fontWeight:"bold"}}>Stats</div></div>
        <div style={{background:`${color}22`,border:`1px solid ${color}44`,borderRadius:10,padding:"6px 12px",display:"flex",alignItems:"center",gap:6}}><span style={{color,fontSize:12}}>{isUp?"▲":"▼"}</span><span style={{color,fontWeight:"bold",fontSize:13}}>{pct}%</span></div>
      </div>
      <div style={{marginBottom:14}}><div style={{color:"#333",fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:4,fontFamily:"monospace"}}>{period==="1W"?"This Week":period==="1M"?"This Month":period==="3M"?"Last 3 Months":period==="1Y"?"This Year":"All Time"}</div><div style={{color,fontSize:50,fontWeight:"bold",lineHeight:1,textShadow:`0 0 40px ${color}44`}}>{totalNet>=0?"+":""}${totalNet}</div><div style={{color:"#333",fontSize:12,marginTop:4}}>{pg.length} games in this period</div></div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>{PERIODS.map(p=><div key={p} onClick={()=>setPeriod(p)} style={{flex:1,textAlign:"center",padding:"7px 0",borderRadius:10,fontSize:11,fontWeight:"bold",cursor:"pointer",background:period===p?color:"transparent",color:period===p?BG:"#333",border:`1px solid ${period===p?color:Border}`,transition:"all .2s",fontFamily:"monospace"}}>{p}</div>)}</div>
      <div style={{background:Card,borderRadius:20,border:`1px solid ${Border}`,padding:"14px 10px 8px",marginBottom:16,boxShadow:`inset 0 0 40px ${color}08`}}>
        {pg.length>0?<StockChart data={chartData} color={color} width={335} height={185}/>:<div style={{height:185,display:"flex",alignItems:"center",justifyContent:"center",color:"#333",fontSize:13}}>No games in this period yet</div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
        {[{label:"Win Rate",value:`${winRate}%`,icon:"🎯",up:winRate>=50},{label:"Best Win",value:`${bestWin>=0?"+":""}$${bestWin}`,icon:"🔥",up:true},{label:"Worst",value:`$${worstLoss}`,icon:"💀",up:false}].map(s=>(
          <div key={s.label} style={{background:Card,border:`1px solid ${Border}`,borderRadius:14,padding:"12px 10px",textAlign:"center"}}><div style={{fontSize:22,marginBottom:5}}>{s.icon}</div><div style={{color:s.up?Up:Down,fontWeight:"bold",fontSize:15}}>{s.value}</div><div style={{color:"#333",fontSize:10,marginTop:2}}>{s.label}</div></div>
        ))}
      </div>
      <SectionLabel text="Game Breakdown"/>
      <div style={{background:Card,border:`1px solid ${Border}`,borderRadius:16,padding:"16px",marginBottom:14}}>
        {pg.length===0?<div style={{color:"#444",fontSize:13,textAlign:"center",padding:"8px 0"}}>No games yet in this period</div>:(
          <>{[{label:"Games played",val:pg.length,col:"#fff"},{label:"Profitable sessions",val:wins,col:Up},{label:"Losing sessions",val:losses,col:Down}].map(r=><div key={r.label} style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><div style={{color:"#666",fontSize:13}}>{r.label}</div><div style={{color:r.col,fontWeight:"bold"}}>{r.val}</div></div>)}
          <div style={{height:6,background:Border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${winRate}%`,background:`linear-gradient(90deg,${Up},#00b37a)`,borderRadius:3}}/></div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><div style={{color:Up,fontSize:10}}>{winRate}% wins</div><div style={{color:Down,fontSize:10}}>{100-winRate}% losses</div></div></>
        )}
      </div>
      <SectionLabel text="Averages"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[{label:"Per session",val:avgPerGame},{label:"Per week",val:avgPerWeek}].map(a=>(
          <div key={a.label} style={{background:Card,border:`1px solid ${Border}`,borderRadius:14,padding:"14px 16px"}}><div style={{color:"#444",fontSize:11,marginBottom:6}}>{a.label}</div><div style={{color:a.val>=0?Up:Down,fontWeight:"bold",fontSize:22}}>{a.val>=0?"+":""}${a.val}</div></div>
        ))}
      </div>
      {streak>0?<div style={{background:`linear-gradient(135deg,#1a1a08,${Card})`,border:`1px solid ${Gold}33`,borderRadius:16,padding:"16px",display:"flex",alignItems:"center",gap:14,marginBottom:14}}><div style={{fontSize:38}}>🔥</div><div><div style={{color:Gold,fontWeight:"bold",fontSize:17}}>{streak}-game win streak</div><div style={{color:"#444",fontSize:12,marginTop:2}}>Keep it going this Friday</div></div></div>
        :<div style={{background:Card,border:`1px solid ${Border}`,borderRadius:16,padding:"16px",display:"flex",alignItems:"center",gap:14,marginBottom:14}}><div style={{fontSize:38}}>💪</div><div><div style={{color:"#fff",fontWeight:"bold",fontSize:16}}>Bounce back time</div><div style={{color:"#444",fontSize:12,marginTop:2}}>Win your next game to start a streak</div></div></div>}
      <div onClick={()=>nav(S.RANK)} style={{background:`linear-gradient(135deg,${myRank.color}18,#0d0d1e)`,border:`1px solid ${myRank.color}44`,borderRadius:18,padding:"16px 18px",cursor:"pointer",boxShadow:`0 0 30px ${myRank.color}14`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div><div style={{color:"#444",fontSize:10,letterSpacing:2,textTransform:"uppercase",fontFamily:"monospace",marginBottom:4}}>Your Rank</div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:26}}>{myRank.emoji}</span><span style={{color:myRank.color,fontWeight:"bold",fontSize:20}}>{myRank.tier}</span></div></div>
          <div style={{textAlign:"right"}}><div style={{color:myRank.color,fontSize:32,fontWeight:"bold",fontFamily:"monospace",textShadow:`0 0 16px ${myRank.color}88`}}>{myScore.toFixed(1)}</div><div style={{color:"#333",fontSize:10}}>out of 10</div></div>
        </div>
        {nextRank&&<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{color:"#444",fontSize:11}}>→ {nextRank.emoji} {nextRank.tier}</div><div style={{color:myRank.color,fontSize:11,fontFamily:"monospace"}}>{(nextRank.min-myScore).toFixed(2)} pts</div></div><div style={{height:4,background:"#1a1a2e",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${rankPct}%`,background:`linear-gradient(90deg,${myRank.color}77,${myRank.color})`,borderRadius:2}}/></div></div>}
        <div style={{color:"#333",fontSize:11,marginTop:10,textAlign:"right"}}>View full rank card →</div>
      </div>
    </div>
  );
}

// ─── PHONE SHELL ─────────────────────────────────────────────────────────────
function PhoneShell({children}){
  return(
    <div style={{fontFamily:"'Georgia','Times New Roman',serif",background:"#050510",minHeight:"100vh",display:"flex",justifyContent:"center",alignItems:"center",padding:"20px 10px"}}>
      <div style={{width:375,minHeight:720,background:BG,borderRadius:44,border:`1px solid #1e1e30`,boxShadow:"0 50px 120px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.04)",overflow:"hidden",position:"relative",display:"flex",flexDirection:"column"}}>
        {children}
      </div>
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const [name,setName]=useState("");
  const [venmo,setVenmo]=useState("");
  const [nameFocused,setNameFocused]=useState(false);
  const [venmoFocused,setVenmoFocused]=useState(false);
  const valid=name.trim().length>=2;
  return(
    <div style={{padding:"48px 28px 32px",display:"flex",flexDirection:"column",height:"100%",minHeight:600,boxSizing:"border-box"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:64,marginBottom:16}}>♠</div>
          <div style={{color:Gold,fontSize:10,letterSpacing:4,textTransform:"uppercase",fontFamily:"monospace",marginBottom:10}}>Welcome to</div>
          <div style={{color:"#fff",fontSize:32,fontWeight:"bold",marginBottom:8}}>Poker Ledger</div>
          <div style={{color:"#555",fontSize:14,lineHeight:1.6}}>Set up your profile to get started</div>
        </div>

        <div style={{marginBottom:16}}>
          <div style={{color:nameFocused?Gold:"#444",fontSize:10,fontFamily:"monospace",letterSpacing:1,marginBottom:8,transition:"color .2s"}}>YOUR NAME</div>
          <input
            value={name} onChange={e=>setName(e.target.value)}
            onFocus={()=>setNameFocused(true)} onBlur={()=>setNameFocused(false)}
            placeholder="e.g. Alex"
            style={{width:"100%",background:nameFocused?"#13132a":Card,border:`1px solid ${nameFocused?Gold:Border}`,borderRadius:14,padding:"14px 16px",color:"#fff",fontSize:17,boxSizing:"border-box",outline:"none",transition:"all .2s"}}
          />
        </div>

        <div style={{marginBottom:8}}>
          <div style={{color:venmoFocused?"#00a4eb":"#444",fontSize:10,fontFamily:"monospace",letterSpacing:1,marginBottom:8,transition:"color .2s"}}>VENMO USERNAME <span style={{color:"#333",textTransform:"none",letterSpacing:0}}>(optional)</span></div>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:venmoFocused?"#00a4eb":"#555",fontSize:16,fontWeight:"bold",pointerEvents:"none",transition:"color .2s"}}>@</span>
            <input
              value={venmo} onChange={e=>setVenmo(e.target.value.replace(/^@/,""))}
              onFocus={()=>setVenmoFocused(true)} onBlur={()=>setVenmoFocused(false)}
              placeholder="your-venmo-handle"
              style={{width:"100%",background:venmoFocused?"#0a1520":Card,border:`1px solid ${venmoFocused?"#00a4eb44":Border}`,borderRadius:14,padding:"14px 16px 14px 30px",color:"#fff",fontSize:17,boxSizing:"border-box",outline:"none",transition:"all .2s",fontFamily:"monospace"}}
            />
          </div>
          <div style={{color:"#383848",fontSize:11,marginTop:6}}>Friends see this so they know where to pay you</div>
        </div>
      </div>

      <div style={{opacity:valid?1:0.4,transition:"opacity .3s"}}>
        <div onClick={()=>{if(valid)onLogin(name.trim(),venmo.trim());}}
          style={{background:`linear-gradient(135deg,${Gold},${GoldDim})`,borderRadius:16,padding:"18px",textAlign:"center",color:BG,fontWeight:"bold",fontSize:17,cursor:valid?"pointer":"not-allowed",boxShadow:valid?`0 4px 24px ${Gold}44`:"none",transition:"all .3s"}}>
          Let's Play 🃏
        </div>
      </div>
      {!valid&&<div style={{color:"#333",fontSize:12,textAlign:"center",marginTop:10}}>Enter your name to continue</div>}
    </div>
  );
}

// ─── EDIT GAME SCREEN ────────────────────────────────────────────────────────
function EditGameScreen({nav,game,editGame,profile}){
  const [amounts,setAmounts]=useState(()=>{
    const a={};
    (game?.results||[]).forEach(r=>{a[r.name]={buyin:String(r.buyin),cashout:String(r.cashout)};});
    return a;
  });
  const [focusedCell,setFocusedCell]=useState(null);
  if(!game){nav(S.HISTORY);return null;}

  const upd=(name,field,val)=>{
    const clean=val.replace(/[^0-9.]/g,"").replace(/^(\d*\.?\d{0,2}).*$/,"$1");
    setAmounts(prev=>({...prev,[name]:{...prev[name],[field]:clean}}));
  };
  const players=game.results||[];
  const nets=players.map(p=>{
    const a=amounts[p.name]||{};
    const b=parseCents(a.buyin||""),c=parseCents(a.cashout||"");
    return{name:p.name,buyinCents:b,cashoutCents:c,netCents:c-b};
  });
  const totalBuyin=nets.reduce((s,n)=>s+n.buyinCents,0);
  const totalCashout=nets.reduce((s,n)=>s+n.cashoutCents,0);
  const balanced=totalBuyin>0&&totalBuyin===totalCashout;

  const save=()=>{
    const updatedResults=nets.map(n=>({
      name:n.name,
      buyin:Math.round(n.buyinCents/100),
      cashout:Math.round(n.cashoutCents/100),
      net:Math.round(n.netCents/100),
    }));
    editGame(game.id,updatedResults);
    nav(S.GAME_DETAIL);
  };

  return(
    <div style={{padding:"16px 20px"}}>
      <BackBtn onClick={()=>nav(S.GAME_DETAIL)}/>
      <div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",fontFamily:"monospace",marginBottom:4}}>Edit Game</div>
      <div style={{color:"#fff",fontSize:22,fontWeight:"bold",marginBottom:4}}>{game.game}</div>
      <div style={{color:"#444",fontSize:13,marginBottom:20}}>{game.date} · Fix any incorrect amounts below</div>

      {players.map(p=>{
        const a=amounts[p.name]||{};
        const net=nets.find(n=>n.name===p.name);
        const netC=net?.netCents||0;
        const hasData=(a.buyin||"")!==""&&(a.cashout||"")!=="";
        const rowColor=!hasData?Border:netC>0?Up:netC<0?Down:"#888";
        return(
          <div key={p.name} style={{background:Card,borderRadius:16,padding:"16px",marginBottom:12,border:`1px solid ${rowColor}44`,transition:"border-color .3s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:`${rowColor}22`,display:"flex",alignItems:"center",justifyContent:"center",color:rowColor,fontWeight:"bold",fontSize:14}}>{p.name[0]}</div>
                <div style={{color:"#fff",fontWeight:"bold",fontSize:15}}>{p.name==="You"?(profile?.username||"You"):p.name}</div>
              </div>
              {hasData&&<div style={{color:netC>0?Up:netC<0?Down:"#888",fontWeight:"bold",fontSize:16}}>{netC>0?"+":""}{fmtCents(netC)}</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[{field:"buyin",label:"TOTAL BUY-IN"},{field:"cashout",label:"CASH OUT"}].map(({field,label})=>{
                const cellKey=`${p.name}-${field}`,focused=focusedCell===cellKey;
                return(
                  <div key={field}>
                    <div style={{color:focused?Gold:"#444",fontSize:10,marginBottom:6,fontFamily:"monospace",letterSpacing:1,transition:"color .2s"}}>{label}</div>
                    <div style={{position:"relative"}}>
                      <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:focused?Gold:"#555",fontSize:15,fontWeight:"bold",pointerEvents:"none"}}>$</span>
                      <input value={a[field]||""} onChange={e=>upd(p.name,field,e.target.value)}
                        onFocus={()=>setFocusedCell(cellKey)} onBlur={()=>setFocusedCell(null)}
                        placeholder="0.00" inputMode="decimal"
                        style={{width:"100%",background:focused?"#13132a":BG,border:`1px solid ${focused?Gold:Border}`,borderRadius:10,padding:"11px 10px 11px 24px",color:"#fff",fontSize:17,fontWeight:"bold",boxSizing:"border-box",outline:"none",transition:"all .2s",fontFamily:"monospace"}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{background:balanced?`${Up}11`:`${Down}11`,border:`1px solid ${balanced?`${Up}44`:`${Down}44`}`,borderRadius:14,padding:"14px 16px",marginBottom:16,transition:"all .3s"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{color:"#555",fontSize:13}}>Total buy-in</span><span style={{color:"#fff",fontWeight:"bold",fontFamily:"monospace"}}>{fmtCents(totalBuyin)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{color:"#555",fontSize:13}}>Total cashout</span><span style={{color:"#fff",fontWeight:"bold",fontFamily:"monospace"}}>{fmtCents(totalCashout)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#888",fontSize:13}}>Difference</span><span style={{color:balanced?Up:Down,fontWeight:"bold",fontFamily:"monospace"}}>{balanced?"✓ Balanced":fmtCents(totalCashout-totalBuyin)}</span></div>
      </div>

      <div style={{opacity:balanced?1:0.4,transition:"opacity .3s"}}>
        <PrimaryBtn label="Save Changes ✓" onClick={()=>{if(balanced)save();}}/>
      </div>
    </div>
  );
}

// ─── FEED SCREEN (live) ───────────────────────────────────────────────────────
function FeedScreen({nav,feedItems}){
  const icons={win:"🏆",loss:"💸",rank:"⚡",streak:"🔥",game:"🃏"};
  return(
    <div style={{padding:"16px 20px"}}>
      <BackBtn onClick={()=>nav(S.HOME)}/>
      <div style={{color:Gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",fontFamily:"monospace",marginBottom:4}}>Social</div>
      <div style={{color:"#fff",fontSize:22,fontWeight:"bold",marginBottom:20}}>Friend Activity</div>
      {feedItems.length===0&&(
        <div style={{background:Card,borderRadius:14,padding:"28px",textAlign:"center"}}>
          <div style={{fontSize:36,marginBottom:8}}>📡</div>
          <div style={{color:"#555",fontSize:14}}>No activity yet. Log a game to see results here.</div>
        </div>
      )}
      {feedItems.map(item=>(
        <div key={item.id} style={{background:item.isMe?`${Gold}0a`:Card,borderRadius:16,padding:"14px 16px",marginBottom:10,border:`1px solid ${item.isMe?`${Gold}22`:Border}`,display:"flex",alignItems:"center",gap:14}}>
          <div style={{position:"relative",flexShrink:0}}>
            <Avatar char={item.avatar} color={item.color} size={44} fontSize={18}/>
            <div style={{position:"absolute",bottom:-2,right:-2,width:20,height:20,borderRadius:"50%",background:Card,border:`1px solid ${Border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>{icons[item.type]||"📌"}</div>
          </div>
          <div style={{flex:1}}>
            <div style={{color:"#fff",fontSize:13,lineHeight:1.5}}>
              <span style={{fontWeight:"bold",color:item.isMe?Gold:item.color}}>{item.isMe?"You":item.player}</span>
              {item.type==="win"&&<span style={{color:"#888"}}> won <span style={{color:Up,fontWeight:"bold"}}>+${item.amount}</span> in {item.game}</span>}
              {item.type==="loss"&&<span style={{color:"#888"}}> lost <span style={{color:Down,fontWeight:"bold"}}>${Math.abs(item.amount)}</span> in {item.game}</span>}
              {item.type==="rank"&&<span style={{color:"#888"}}> ranked up to <span style={{color:Gold,fontWeight:"bold"}}>{item.rank}</span> 🎉</span>}
              {item.type==="streak"&&<span style={{color:"#888"}}> is on a <span style={{color:Gold,fontWeight:"bold"}}>{item.streak}-game streak</span> 🔥</span>}
              {item.type==="game"&&<span style={{color:"#888"}}> logged <span style={{color:Gold,fontWeight:"bold"}}>{item.game}</span></span>}
            </div>
            <div style={{color:"#444",fontSize:11,marginTop:3}}>{item.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [onboarded,setOnboarded]=useState(false);
  const [loggedIn,setLoggedIn]=useState(false);
  const [screen,setScreen]=useState(S.HOME);
  const [selectedDebt,setSelectedDebt]=useState(null);
  const [selectedFriend,setSelectedFriend]=useState(null);
  const [selectedWorldPlayer,setSelectedWorldPlayer]=useState(null);
  const [selectedGame,setSelectedGame]=useState(null);
  const [selectedGroup,setSelectedGroup]=useState(null);
  const [prevScreen,setPrevScreen]=useState(S.HOME);
  const [toast,setToast]=useState(null);
  const [debts,setDebts]=useState(INIT_DEBTS);
  const [friends,setFriends]=useState(INIT_FRIENDS);
  const [notifs,setNotifs]=useState(INIT_NOTIFS);
  const [groups,setGroups]=useState(INIT_GROUPS);
  const [settledHistory,setSettledHistory]=useState(SETTLED_HISTORY);
  const [chats,setChats]=useState(GAME_CHATS);
  const [feedItems,setFeedItems]=useState(ACTIVITY_FEED);

  const [myGames,setMyGames]=useState(()=>
    HISTORY_DATA.map(h=>({
      id:h.id, game:h.game, date:h.date,
      buyin:   h.results.find(r=>r.name==="You")?.buyins?.reduce((s,b)=>s+b.amount,0)||h.results.find(r=>r.name==="You")?.buyin||0,
      cashout: h.results.find(r=>r.name==="You")?.cashout||0,
      net:     h.results.find(r=>r.name==="You")?.net||0,
      players: h.results.map(r=>r.name),
      results: h.results.map(r=>({...r,buyin:r.buyins?r.buyins.reduce((s,b)=>s+b.amount,0):r.buyin})),
      settled: h.settled, groupId:h.groupId||null,
    }))
  );

  const [profile,setProfile]=useState({
    username:"",avatarChar:"♠",avatarColor:Gold,photo:null,isPublic:true,venmo:""
  });

  const nav=s=>{setPrevScreen(screen);setScreen(s);};
  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(null),2600);};

  const settleDebt=id=>{
    const d=debts.find(x=>x.id===id);
    if(d) setSettledHistory(prev=>[{...d,settledDate:"Today",id:Date.now()},...prev]);
    setDebts(prev=>prev.filter(x=>x.id!==id));
  };
  const markAllRead=()=>setNotifs(prev=>prev.map(n=>({...n,read:true})));
  const unreadCount=notifs.filter(n=>!n.read).length;

  // ── ADD GAME — fixed debt logic + groupId + feed update ───────────────────
  const addGame=(gameName,activePlayers,nets,selectedGroupId)=>{
    const now=new Date();
    const dateStr=now.toLocaleDateString("en",{month:"short",day:"numeric"});
    const myNet=nets.find(n=>n.name==="You");
    const myNetDollars=myNet?Math.round(myNet.netCents/100):0;

    const newId=Date.now();
    const newGame={
      id:newId, game:gameName, date:dateStr,
      buyin:   myNet?Math.round(myNet.buyinCents/100):0,
      cashout: myNet?Math.round(myNet.cashoutCents/100):0,
      net:     myNetDollars,
      players: activePlayers.map(p=>p.name),
      results: nets.map(n=>({
        name:n.name,
        buyin:Math.round(n.buyinCents/100),
        cashout:Math.round(n.cashoutCents/100),
        net:Math.round(n.netCents/100),
      })),
      settled:false, groupId:selectedGroupId||null,
    };
    setMyGames(prev=>[newGame,...prev]);

    // ── Correct debt logic using minimizeDebts ──────────────────────────────
    // minimizeDebts already computes exactly who pays who — just use it
    const txns=minimizeDebts(nets.map(n=>({name:n.name,netCents:n.netCents})));
    const newDebts=txns.map((t,i)=>({
      id:newId+i+1,
      from:t.from,
      to:t.to,
      amount:Math.round(t.amountCents/100),
      status:"pending",
      game:gameName,
    }));
    if(newDebts.length) setDebts(prev=>[...prev,...newDebts]);

    // ── Update group lastGame if a group was selected ──────────────────────
    if(selectedGroupId){
      setGroups(prev=>prev.map(g=>g.id===selectedGroupId
        ?{...g,lastGame:dateStr,games:g.games+1}:g
      ));
    }

    // ── Add to live feed ───────────────────────────────────────────────────
    const newFeedItems=nets
      .filter(n=>n.name!=="You")
      .map((n,i)=>({
        id:newId+1000+i,
        type:n.netCents>0?"win":"loss",
        player:n.name,
        amount:Math.round(n.netCents/100),
        game:gameName,
        time:"Just now",
        avatar:n.name[0],
        color:friends.find(f=>f.name===n.name)?.color||"#888",
      }));
    if(myNetDollars!==0){
      newFeedItems.unshift({
        id:newId+999,
        type:myNetDollars>0?"win":"loss",
        player:profile.username||"You",
        amount:myNetDollars,
        game:gameName,
        time:"Just now",
        avatar:profile.avatarChar||"Y",
        color:profile.avatarColor||Gold,
        isMe:true,
      });
    }
    setFeedItems(prev=>[...newFeedItems,...prev]);

    // ── Notification ───────────────────────────────────────────────────────
    setNotifs(prev=>[{
      id:newId,type:"game",from:"You",
      msg:`"${gameName}" saved · ${nets.length} players · you ${myNetDollars>=0?"won +":"lost "}$${Math.abs(myNetDollars)}`,
      time:"Just now",read:false,
    },...prev]);

    showToast(`🃏 "${gameName}" saved!`);
    setScreen(S.HOME);
  };

  // ── EDIT GAME ──────────────────────────────────────────────────────────────
  const editGame=(gameId,updatedResults)=>{
    setMyGames(prev=>prev.map(g=>{
      if(g.id!==gameId)return g;
      const myResult=updatedResults.find(r=>r.name==="You");
      return{...g,
        results:updatedResults,
        net:myResult?.net||0,
        buyin:myResult?.buyin||0,
        cashout:myResult?.cashout||0,
      };
    }));
    showToast("✓ Game updated!");
  };

  const myStats=deriveStats(myGames);
  const myScore=calcScore(myStats);
  const myRank=getRank(myScore);

  const addChat=(gameId,msg,prof)=>{
    setChats(prev=>({...prev,[gameId]:[...(prev[gameId]||[]),{id:Date.now(),from:prof.username||"You",msg,time:"Just now",avatar:prof.avatarChar||"Y",color:prof.avatarColor||Gold,isMe:true}]}));
  };

  // ── ONBOARDING → LOGIN → APP ──────────────────────────────────────────────
  if(!onboarded){
    return(
      <PhoneShell>
        <OnboardScreen onDone={()=>setOnboarded(true)}/>
      </PhoneShell>
    );
  }
  if(!loggedIn){
    return(
      <PhoneShell>
        <LoginScreen onLogin={(name,venmo)=>{setProfile(p=>({...p,username:name,venmo:venmo}));setLoggedIn(true);}}/>
      </PhoneShell>
    );
  }

  const subScreens=new Set([S.NEW_GAME,S.CONFIRM_PAY,S.HISTORY,S.SETTLEMENTS,S.SETTINGS,S.ADD_FRIENDS,S.FRIEND_PROFILE,S.WORLD_PROFILE,S.GAME_DETAIL,S.NOTIFICATIONS,S.GROUPS,S.GROUP_DETAIL,S.RIVALS,S.FEED,S.EDIT_GAME]);
  const noNav=subScreens.has(screen);

  return(
    <PhoneShell>
      <div style={{padding:"14px 26px 0",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:"#333",fontFamily:"monospace",flexShrink:0}}>
        <span>9:41</span>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {!noNav&&<span onClick={()=>nav(S.SETTINGS)} style={{cursor:"pointer",fontSize:17,opacity:.45}}>⚙️</span>}
          <span>●●●</span>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",paddingBottom:noNav?24:80}}>
        <Fade k={screen}>
          {screen===S.HOME          &&<HomeScreen          nav={nav} setSelectedDebt={setSelectedDebt} profile={profile} debts={debts} notifs={notifs} myGames={myGames}/>}
          {screen===S.NOTIFICATIONS &&<NotificationsScreen nav={nav} notifs={notifs} markAllRead={markAllRead}/>}
          {screen===S.FEED          &&<FeedScreen          nav={nav} feedItems={feedItems}/>}
          {screen===S.NEW_GAME      &&<NewGameScreen        nav={nav} showToast={showToast} profile={profile} friends={friends} groups={groups} addGame={addGame}/>}
          {screen===S.EDIT_GAME     &&<EditGameScreen       nav={nav} game={selectedGame} editGame={editGame} profile={profile}/>}
          {screen===S.SETTLEMENTS   &&<SettlementsScreen    nav={nav} setSelectedDebt={setSelectedDebt} debts={debts} settleDebt={settleDebt} showToast={showToast} settledHistory={settledHistory}/>}
          {screen===S.CONFIRM_PAY   &&<ConfirmPayScreen     nav={nav} debt={selectedDebt} showToast={showToast} settleDebt={settleDebt} friends={friends} profile={profile}/>}
          {screen===S.FRIENDS       &&<FriendsScreen        nav={nav} profile={profile} setSelectedFriend={setSelectedFriend} friends={friends} setFriends={setFriends}/>}
          {screen===S.RIVALS        &&<RivalsScreen         nav={nav} friends={friends} setSelectedFriend={setSelectedFriend} myGames={myGames}/>}
          {screen===S.LEADERBOARD   &&<LeaderboardScreen    nav={nav} profile={profile} setSelectedFriend={setSelectedFriend} setSelectedWorldPlayer={setSelectedWorldPlayer} friends={friends} myGames={myGames}/>}
          {screen===S.WORLD_PROFILE &&<WorldProfileScreen   nav={nav} player={selectedWorldPlayer}/>}
          {screen===S.FRIEND_PROFILE&&<FriendProfileScreen  nav={nav} friend={selectedFriend} fromScreen={prevScreen} profile={profile}/>}
          {screen===S.ADD_FRIENDS   &&<AddFriendsScreen     nav={nav} showToast={showToast} friends={friends}/>}
          {screen===S.GROUPS        &&<GroupsScreen         nav={nav} setSelectedGroup={setSelectedGroup} groups={groups} setGroups={setGroups} myGames={myGames}/>}
          {screen===S.GROUP_DETAIL  &&<GroupDetailScreen    nav={nav} group={selectedGroup} setSelectedGame={setSelectedGame} myGames={myGames}/>}
          {screen===S.HISTORY       &&<HistoryScreen        nav={nav} setSelectedGame={setSelectedGame} myGames={myGames}/>}
          {screen===S.GAME_DETAIL   &&<GameDetailScreen     nav={nav} game={selectedGame} chats={chats} addChat={addChat} profile={profile} onEdit={()=>{setScreen(S.EDIT_GAME);}}/>}
          {screen===S.STATS         &&<StatsScreen          nav={nav} profile={profile} myGames={myGames} myStats={myStats} myScore={myScore} myRank={myRank}/>}
          {screen===S.RANK          &&<RankScreen           nav={nav} profile={profile} myStats={myStats} myScore={myScore} myRank={myRank}/>}
          {screen===S.SETTINGS      &&<SettingsScreen       nav={nav} profile={profile} setProfile={setProfile} showToast={showToast} onReplayOnboard={()=>setOnboarded(false)}/>}
        </Fade>
      </div>
      {!noNav&&<BottomNav current={screen} nav={nav} notifCount={unreadCount}/>}
      {toast&&<div style={{position:"absolute",bottom:96,left:"50%",transform:"translateX(-50%)",background:Gold,color:BG,padding:"10px 22px",borderRadius:22,fontSize:13,fontWeight:"bold",whiteSpace:"nowrap",boxShadow:`0 4px 24px ${Gold}55`,zIndex:200}}>{toast}</div>}
    </PhoneShell>
  );
}
