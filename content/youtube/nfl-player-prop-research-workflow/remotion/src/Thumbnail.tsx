import React from "react";
import {AbsoluteFill} from "remotion";
import {agents} from "./data";
import "./fonts";

const orange="#f87552", ink="#101522", paper="#f4f5f7", green="#16825a";
export const Thumbnail:React.FC=()=> <AbsoluteFill style={{background:paper,color:ink,fontFamily:"IBM Plex Sans",overflow:"hidden"}}>
  <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(16,21,34,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(16,21,34,.055) 1px,transparent 1px)",backgroundSize:"32px 32px"}}/>
  <div style={{position:"absolute",left:0,top:0,bottom:0,width:16,background:orange}}/>
  <div style={{position:"relative",height:"100%",padding:"54px 66px",display:"grid",gridTemplateColumns:"1.02fr .98fr",gap:48,alignItems:"center"}}>
    <div><div style={{fontFamily:"IBM Plex Mono",fontSize:18,fontWeight:600,letterSpacing:2.4,color:orange}}>NFL PLAYER PROP RESEARCH</div><div style={{fontFamily:"Familjen Grotesk",fontSize:84,fontWeight:700,lineHeight:.9,letterSpacing:-3,marginTop:20}}>A smarter<br/>game-week<br/>workflow.</div><div style={{display:"inline-flex",marginTop:29,background:ink,color:"white",padding:"13px 18px",borderRadius:8,fontFamily:"IBM Plex Mono",fontSize:17}}>MARKET → ROLE → AGENTS → DECISION</div></div>
    <div style={{background:"white",border:"2px solid #d9dee6",borderRadius:18,padding:28,boxShadow:`15px 17px 0 ${orange}`,transform:"rotate(1deg)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}><div><div style={{fontFamily:"IBM Plex Mono",fontSize:13,color:"#697386"}}>HISTORICAL WORKFLOW EXAMPLE</div><div style={{fontFamily:"Familjen Grotesk",fontSize:44,fontWeight:700,marginTop:6}}>Josh Allen</div><div style={{fontSize:18,color:"#697386"}}>Passing Yards · 195.5</div></div><div style={{width:100,height:100,borderRadius:99,display:"grid",placeItems:"center",background:"#fff0ea",border:`9px solid ${orange}`,fontFamily:"Familjen Grotesk",fontSize:40,fontWeight:700}}>62</div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginTop:24}}>{agents.slice(0,6).map(a=><div key={a.name} style={{background:"#f5f7fa",borderRadius:7,padding:"9px 11px",fontSize:14,fontWeight:600}}><span>{a.label}</span><span style={{float:"right",fontFamily:"IBM Plex Mono",color:a.score>=50?green:orange}}>{Math.round(a.score)}</span></div>)}</div><div style={{marginTop:17,fontFamily:"IBM Plex Mono",fontSize:12,color:green}}>PROCESS DEMO · NOT A LIVE PICK</div></div>
  </div>
</AbsoluteFill>;
