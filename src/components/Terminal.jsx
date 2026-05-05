import React, { useState, useRef, useEffect, useCallback } from "react";

const lineColors = { header:"#60a5fa", success:"#34d399", warn:"#fbbf24", error:"#f87171", info:"#a78bfa", muted:"#475569", text:"#e2e8f0" };

export default function Terminal({ outputLines, prompt, onCommand }) {
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const termRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [outputLines]);

  const handleKey = useCallback((e) => {
    if (e.key === "Enter") {
      const cmd = inputVal;
      setInputVal(""); setHistIdx(-1);
      if (cmd.trim()) setHistory(prev => [cmd, ...prev]);
      onCommand(cmd);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = histIdx + 1;
      if (i < history.length) { setHistIdx(i); setInputVal(history[i]); }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = histIdx - 1;
      if (i < 0) { setHistIdx(-1); setInputVal(""); }
      else { setHistIdx(i); setInputVal(history[i]); }
    }
  }, [inputVal, history, histIdx, onCommand]);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column" }} onClick={()=>inputRef.current?.focus()}>
      <div style={{ background:"#1e293b", borderBottom:"1px solid #334155", padding:"8px 16px", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ display:"flex", gap:6 }}>
          <div style={{ width:11, height:11, borderRadius:"50%", background:"#ef4444" }}/>
          <div style={{ width:11, height:11, borderRadius:"50%", background:"#f59e0b" }}/>
          <div style={{ width:11, height:11, borderRadius:"50%", background:"#10b981" }}/>
        </div>
        <span style={{ marginLeft:6, fontSize:11, color:"#64748b", fontFamily:"monospace" }}>Cisco IOS Terminal</span>
      </div>
      <div ref={termRef} style={{ flex:1, overflowY:"auto", padding:"16px 20px", lineHeight:1.65, fontSize:13, background:"#0f172a", cursor:"text" }}>
        {outputLines.map((line, i) => {
          if (line.t==="prompt-line") return (
            <div key={i} style={{ marginBottom:2 }}>
              <span style={{ color:"#10b981", fontWeight:700 }}>{line.prompt} </span>
              <span style={{ color:"#f8fafc" }}>{line.cmd}</span>
            </div>
          );
          return <div key={i} style={{ color:lineColors[line.t]||lineColors.text, marginBottom:1 }}>{line.v||"\u00A0"}</div>;
        })}
        <div style={{ display:"flex", alignItems:"center", marginTop:4 }}>
          <span style={{ color:"#10b981", fontWeight:700, marginRight:6, whiteSpace:"nowrap" }}>{prompt}</span>
          <input ref={inputRef} value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={handleKey} autoFocus
            style={{ background:"transparent", border:"none", outline:"none", color:"#f8fafc", fontFamily:"monospace", fontSize:13, flex:1, caretColor:"#10b981" }}
            spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="none" />
        </div>
      </div>
      <div style={{ background:"#1e293b", borderTop:"1px solid #334155", padding:"6px 20px", display:"flex", gap:20, fontSize:10, color:"#64748b" }}>
        <span>Up/Down: History</span>
        <span>?: Help</span>
        <span>clear: Clear</span>
        <span>end/exit: Change Mode</span>
      </div>
    </div>
  );
}
