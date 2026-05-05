import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export const useSocket = (serverUrl = "http://localhost:3001") => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [deviceState, setDeviceState] = useState(null);
  const [outputLines, setOutputLines] = useState([]);
  const [prompt, setPrompt] = useState("Switch1#");

  useEffect(() => {
    socketRef.current = io(serverUrl);
    socketRef.current.on("connect", () => setConnected(true));
    socketRef.current.on("disconnect", () => setConnected(false));
    socketRef.current.on("device:state", (state) => setDeviceState(state));
    socketRef.current.on("prompt", (p) => setPrompt(p));
    socketRef.current.on("output", (lines) => {
      if (lines.some(l => l.t === "clear")) { setOutputLines([]); return; }
      setOutputLines(prev => [...prev, ...lines]);
    });
    return () => socketRef.current.disconnect();
  }, [serverUrl]);

  const sendCommand = (cmd) => {
    if (socketRef.current && connected) {
      setOutputLines(prev => [...prev, { t:"prompt-line", prompt, cmd }]);
      socketRef.current.emit("command", cmd);
    }
  };

  return { connected, deviceState, outputLines, prompt, sendCommand };
};
