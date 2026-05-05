import React from "react";

export default function TopBar({ device, connected, onHostnameClick }) {
  const modeLabels = { user:"USER", privileged:"PRIV EXEC", config:"GLOBAL CONFIG", interface:"IF-CONFIG" };
  const modeColors = { user:"#6b7280", privileged:"#1d4ed8", config:"#15803d", interface:"#b45309" };
  const upCount = device ? Object.values(device.interfaces).filter(i=>i.status==="up").length : 0;
  const total = device ? Object.keys(device.interfaces).length : 0;

  return (
    <div style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 1px 3px #0000000d", flexWrap:"wrap", gap:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:36, height:36, borderRadius:8, background:"#1d4ed8", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
            <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:"#111827" }}>Cisco IOS Simulator</div>
          <div style={{ fontSize:10, color:"#9ca3af" }}>Network Device Management Console</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:9, color:"#9ca3af", textTransform:"uppercase" }}>Status</div>
          <div style={{ fontSize:11, fontWeight:700, color: connected?"#15803d":"#b91c1c" }}>{connected?"CONNECTED":"OFFLINE"}</div>
        </div>
        {device && <>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:9, color:"#9ca3af", textTransform:"uppercase" }}>Hostname</div>
            <div style={{ fontSize:13, color:"#1d4ed8", fontWeight:700 }}>{device.hostname}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:9, color:"#9ca3af", textTransform:"uppercase" }}>Mode</div>
            <div style={{ fontSize:10, fontWeight:700, color:"#fff", background:modeColors[device.mode]||"#374151", padding:"2px 10px", borderRadius:4 }}>
              {modeLabels[device.mode]||device.mode}
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:9, color:"#9ca3af", textTransform:"uppercase" }}>Ports</div>
            <div style={{ fontSize:13, fontWeight:700 }}>
              <span style={{ color:"#15803d" }}>{upCount}</span>
              <span style={{ color:"#d1d5db" }}>/</span>
              <span style={{ color:"#b91c1c" }}>{total-upCount}</span>
            </div>
          </div>
        </>}
        <button onClick={onHostnameClick} style={{ background:"#f3f4f6", border:"1px solid #e5e7eb", color:"#374151", padding:"7px 14px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:600 }}>
          Edit Hostname
        </button>
        <button onClick={()=>window.open("C:/Users/Win11/Desktop/cisco-simulator/docs.html","_blank")} style={{ display:"flex", alignItems:"center", gap:6, background:"#1d4ed8", border:"none", color:"#fff", padding:"7px 14px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:600 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Documentation
        </button>
      </div>
    </div>
  );
}
