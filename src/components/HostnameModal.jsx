import React, { useState } from "react";

export default function HostnameModal({ current, onApply, onClose }) {
  const [val, setVal] = useState("");
  const apply = () => { if(val.trim()){ onApply(val.trim()); setVal(""); } };
  return (
    <div style={{ position:"fixed", inset:0, background:"#00000066", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:"28px 32px", width:360, boxShadow:"0 20px 60px #00000020" }}>
        <div style={{ fontSize:16, fontWeight:700, color:"#111827", marginBottom:6 }}>Change Hostname</div>
        <div style={{ fontSize:12, color:"#9ca3af", marginBottom:18 }}>Current: <span style={{ color:"#1d4ed8", fontWeight:700 }}>{current}</span></div>
        <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&apply()}
          placeholder="Enter new hostname..." autoFocus
          style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 14px", color:"#111827", fontFamily:"monospace", fontSize:13, width:"100%", outline:"none", boxSizing:"border-box", marginBottom:18 }} />
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", color:"#374151", padding:"9px 18px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600 }}>Cancel</button>
          <button onClick={apply} style={{ background:"#1d4ed8", border:"none", color:"#fff", padding:"9px 22px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700 }}>Apply</button>
        </div>
      </div>
    </div>
  );
}
