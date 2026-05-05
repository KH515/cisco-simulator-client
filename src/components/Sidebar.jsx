import React, { useState } from "react";
import PortStatus from "./PortStatus";

const quickActions = [
  { id:"status",      label:"Interface Status", labelAr:"Interface Status", commands:["show ip interface brief"],                                                color:"#1d4ed8" },
  { id:"enablePort",  label:"Enable Port",      labelAr:"Enable Port",      commands:["configure terminal","interface GigabitEthernet0/1","no shutdown","end"], color:"#15803d" },
  { id:"disablePort", label:"Disable Port",     labelAr:"Disable Port",     commands:["configure terminal","interface GigabitEthernet0/2","shutdown","end"],    color:"#b91c1c" },
  { id:"runConfig",   label:"Running Config",   labelAr:"Running Config",   commands:["show running-config"],                                                   color:"#92400e" },
  { id:"save",        label:"Save Config",      labelAr:"Save Config",      commands:["write memory"],                                                          color:"#5b21b6" },
  { id:"vlan",        label:"VLAN Table",       labelAr:"VLAN Table",       commands:["show vlan brief"],                                                        color:"#0e7490" },
  { id:"version",     label:"IOS Version",      labelAr:"IOS Version",      commands:["show version"],                                                          color:"#374151" },
  { id:"interfaces",  label:"All Interfaces",   labelAr:"All Interfaces",   commands:["show interfaces"],                                                        color:"#065f46" },
];

const steps = [
  { title:"Enter Privileged Mode", commands:["enable"],                                                 note:"Prompt changes from > to #" },
  { title:"Enter Config Mode",     commands:["configure terminal"],                                     note:"Prompt becomes (config)#" },
  { title:"Set Hostname",          commands:["hostname MySwitch"],                                      note:"Name appears in prompt instantly" },
  { title:"Select Interface",      commands:["interface GigabitEthernet0/1"],                           note:"Prompt becomes (config-if)#" },
  { title:"Assign IP Address",     commands:["ip address 192.168.10.1 255.255.255.0"],                  note:"Check your subnet mask" },
  { title:"Enable Interface",      commands:["no shutdown"],                                             note:"Confirmation message appears" },
  { title:"Save Configuration",    commands:["end","write memory"],                                     note:"Settings saved to NVRAM" },
];

export default function Sidebar({ onCommand, deviceState }) {
  const [tab, setTab] = useState("actions");
  const [activeAction, setActiveAction] = useState(null);

  const runAction = async (action) => {
    setActiveAction(action.id);
    for (const cmd of action.commands) {
      await new Promise(r => setTimeout(r, 150));
      onCommand(cmd);
    }
    setTimeout(() => setActiveAction(null), 700);
  };

  const runStep = async (step) => {
    for (const cmd of step.commands) {
      await new Promise(r => setTimeout(r, 200));
      onCommand(cmd);
    }
  };

  return (
    <div style={{ width:240, background:"#fff", borderRight:"1px solid #e5e7eb", display:"flex", flexDirection:"column", flexShrink:0 }}>
      <div style={{ display:"flex", borderBottom:"1px solid #e5e7eb" }}>
        {[["actions","Actions"],["steps","Step-by-Step"]].map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"10px 4px", fontSize:11, fontWeight:600, cursor:"pointer", border:"none", background:tab===id?"#f8fafc":"#fff", color:tab===id?"#1d4ed8":"#9ca3af", borderBottom:tab===id?"2px solid #1d4ed8":"2px solid transparent" }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"10px" }}>
        {tab==="actions" && (
          <>
            <div style={{ fontSize:9, color:"#9ca3af", letterSpacing:2, padding:"4px 4px 10px", textTransform:"uppercase" }}>Quick Commands</div>
            {quickActions.map(action => (
              <button key={action.id} onClick={()=>runAction(action)} style={{ background:activeAction===action.id?`${action.color}12`:"#fff", border:`1px solid ${activeAction===action.id?action.color:"#e5e7eb"}`, borderRadius:8, padding:"10px 12px", cursor:"pointer", textAlign:"left", width:"100%", marginBottom:4, transition:"all 0.15s" }}
                onMouseEnter={e=>{ e.currentTarget.style.background=`${action.color}08`; e.currentTarget.style.borderColor=action.color; }}
                onMouseLeave={e=>{ if(activeAction!==action.id){ e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#e5e7eb"; }}}>
                <div style={{ fontSize:11, fontWeight:700, color:"#111827" }}>{action.label}</div>
                <div style={{ fontSize:9, color:"#9ca3af", marginTop:1 }}>{action.labelAr}</div>
              </button>
            ))}
            <PortStatus interfaces={deviceState?.interfaces} />
          </>
        )}
        {tab==="steps" && (
          <>
            <div style={{ fontSize:9, color:"#9ca3af", letterSpacing:2, padding:"4px 4px 10px", textTransform:"uppercase" }}>Step-by-Step Guide</div>
            {steps.map((step, i) => (
              <button key={i} onClick={()=>runStep(step)} style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 12px", cursor:"pointer", textAlign:"left", width:"100%", marginBottom:4, transition:"all 0.15s" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="#eff6ff"; e.currentTarget.style.borderColor="#93c5fd"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#e5e7eb"; }}>
                <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:"#1d4ed8", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, flexShrink:0 }}>{i+1}</div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#111827" }}>{step.title}</div>
                    <div style={{ fontSize:8, color:"#1d4ed8", marginTop:2 }}>{step.note}</div>
                    <div style={{ marginTop:4, display:"flex", flexWrap:"wrap", gap:3 }}>
                      {step.commands.map((c,j) => (
                        <span key={j} style={{ fontSize:8, background:"#f3f4f6", color:"#374151", padding:"1px 5px", borderRadius:3, fontFamily:"monospace" }}>{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
