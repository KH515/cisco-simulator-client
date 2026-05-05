import React from "react";

export default function PortStatus({ interfaces }) {
  if (!interfaces) return null;
  return (
    <div style={{ marginTop:14, borderTop:"1px solid #f3f4f6", paddingTop:12 }}>
      <div style={{ fontSize:9, color:"#9ca3af", letterSpacing:2, marginBottom:8, textTransform:"uppercase" }}>Port Status</div>
      {Object.entries(interfaces).map(([name,iface]) => {
        const s = name.replace("GigabitEthernet","Gi").replace("FastEthernet","Fa");
        const up = iface.status==="up";
        return (
          <div key={name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"5px 2px", borderBottom:"1px solid #f9fafb" }}>
            <span style={{ fontSize:10, color:"#374151", fontWeight:600, fontFamily:"monospace" }}>{s}</span>
            <span style={{ fontSize:9, fontWeight:700, color:up?"#15803d":"#b91c1c", background:up?"#f0fdf4":"#fef2f2", padding:"2px 7px", borderRadius:3, border:`1px solid ${up?"#bbf7d0":"#fecaca"}` }}>
              {up?"UP":"DOWN"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
