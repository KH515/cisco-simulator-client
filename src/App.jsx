import React, { useState } from "react";
import { useSocket } from "./hooks/useSocket";
import GUI from "./components/GUI";

export default function App() {
  const { connected, sendCommand } = useSocket();

  return (
    <div style={{ height:"100vh", background:"#f8fafc", display:"flex", flexDirection:"column", fontFamily:"monospace", overflow:"hidden" }}>
      <GUI onCommand={sendCommand} connected={connected} />
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#f1f5f9}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}`}</style>
    </div>
  );
}