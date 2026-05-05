import React, { useState } from "react";
import { useSocket } from "./hooks/useSocket";
import GUI from "./components/GUI";

export default function App() {
  const { connected, sendCommand } = useSocket();

  return (
    <div style={{ height:"100vh", background:"#f8fafc", display:"flex", flexDirection:"column", fontFamily:"monospace", overflow:"hidden" }}>
      <GUI onCommand={sendCommand} connected={connected} />
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:0;height:0}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:transparent}`}</style>
    </div>
  );
}