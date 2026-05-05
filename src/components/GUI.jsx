import React, { useState, useRef, useCallback } from "react";

const DEVICE_TYPES = {
  switch: {
    label:"Switch", color:"#1d4ed8", bg:"#eff6ff",
    icon:<><rect x="1" y="8" width="22" height="8" rx="1"/><line x1="4" y1="12" x2="4.01" y2="12" strokeWidth="3"/><line x1="7" y1="12" x2="7.01" y2="12" strokeWidth="3"/><line x1="10" y1="12" x2="10.01" y2="12" strokeWidth="3"/><line x1="13" y1="12" x2="13.01" y2="12" strokeWidth="3"/><line x1="4" y1="8" x2="4" y2="5"/><line x1="7" y1="8" x2="7" y2="5"/><line x1="10" y1="8" x2="10" y2="5"/><line x1="13" y1="8" x2="13" y2="5"/><line x1="20" y1="12" x2="23" y2="12"/></>,
    models:[
      {name:"Cisco 2960-24TT",ports:"24 FE + 2 GE",ios:"15.0(2)SE4"},
      {name:"Cisco 2960-48TT",ports:"48 FE + 2 GE",ios:"15.0(2)SE4"},
      {name:"Cisco 3560-24PS",ports:"24 FE PoE + 2 GE",ios:"12.2(55)SE"},
      {name:"Cisco 3750-48TS",ports:"48 GE + 4 SFP",ios:"12.2(55)SE"},
      {name:"Cisco 9200-24P",ports:"24 GE PoE + 4 SFP",ios:"17.x"},
    ],
    interfaces:["GigabitEthernet0/0","GigabitEthernet0/1","GigabitEthernet0/2","GigabitEthernet0/3"],
  },
  router:{
    label:"Router", color:"#15803d", bg:"#f0fdf4",
    icon:<><rect x="2" y="9" width="20" height="6" rx="1"/><circle cx="6" cy="12" r="1.5" fill="currentColor"/><line x1="12" y1="9" x2="9" y2="5"/><line x1="12" y1="9" x2="15" y2="5"/><line x1="12" y1="15" x2="9" y2="19"/><line x1="12" y1="15" x2="15" y2="19"/><line x1="2" y1="12" x2="0" y2="12"/><line x1="22" y1="12" x2="24" y2="12"/></>,
    models:[
      {name:"Cisco 1941",ports:"2 GE + 2 WAN",ios:"15.1(4)M4"},
      {name:"Cisco 2901",ports:"2 GE + Modules",ios:"15.1(4)M4"},
      {name:"Cisco 2911",ports:"3 GE + 4 Slots",ios:"15.1(4)M4"},
      {name:"Cisco 4321",ports:"2 GE + 2 SFP",ios:"16.x"},
      {name:"Cisco ISR 1100",ports:"4 GE + LTE",ios:"17.x"},
    ],
    interfaces:["GigabitEthernet0/0","GigabitEthernet0/1","Serial0/0/0","Serial0/0/1"],
  },
  firewall:{
    label:"Firewall", color:"#b91c1c", bg:"#fef2f2",
    icon:<><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></>,
    models:[
      {name:"Cisco ASA 5505",ports:"8 FE",ios:"ASA 9.2"},
      {name:"Cisco ASA 5506-X",ports:"8 GE + 1 Mgmt",ios:"ASA 9.8"},
      {name:"Cisco ASA 5516-X",ports:"8 GE + 2 SFP",ios:"ASA 9.8"},
      {name:"Cisco FTD 1010",ports:"8 GE",ios:"FTD 7.x"},
    ],
    interfaces:["GigabitEthernet0/0","GigabitEthernet0/1","GigabitEthernet0/2"],
  },
  pc:{
    label:"PC", color:"#374151", bg:"#f9fafb",
    icon:<><rect x="3" y="4" width="14" height="11" rx="1"/><rect x="17" y="7" width="4" height="7" rx="1"/><line x1="3" y1="18" x2="17" y2="18"/><line x1="8" y1="18" x2="8" y2="21"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="6" y1="21" x2="14" y2="21"/></>,
    models:[
      {name:"PC (Windows)",ports:"1 NIC",ios:"Windows 10/11"},
      {name:"PC (Linux)",ports:"1 NIC",ios:"Ubuntu 22.04"},
      {name:"Laptop",ports:"1 NIC + WiFi",ios:"Windows 11"},
    ],
    interfaces:["FastEthernet0"],
  },
  server:{
    label:"Server", color:"#7c3aed", bg:"#fdf4ff",
    icon:<><rect x="4" y="2" width="16" height="4" rx="1"/><rect x="4" y="8" width="16" height="4" rx="1"/><rect x="4" y="14" width="16" height="4" rx="1"/><rect x="4" y="20" width="16" height="2" rx="1"/><circle cx="7" cy="4" r="0.8" fill="currentColor"/><circle cx="7" cy="10" r="0.8" fill="currentColor"/><circle cx="7" cy="16" r="0.8" fill="currentColor"/><line x1="10" y1="4" x2="18" y2="4"/><line x1="10" y1="10" x2="18" y2="10"/><line x1="10" y1="16" x2="18" y2="16"/></>,
    models:[
      {name:"DHCP Server",ports:"2 GE",ios:"Server IOS"},
      {name:"DNS Server",ports:"2 GE",ios:"Server IOS"},
      {name:"Web Server",ports:"2 GE",ios:"Server IOS"},
      {name:"File Server",ports:"2 GE",ios:"Server IOS"},
    ],
    interfaces:["FastEthernet0","FastEthernet1"],
  },
};

const DevIcon = ({type,size=24,color}) => {
  const info = DEVICE_TYPES[type];
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||info.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{info.icon}</svg>;
};

const lineColors = {header:"#60a5fa",success:"#34d399",warn:"#fbbf24",error:"#f87171",info:"#a78bfa",muted:"#475569",text:"#e2e8f0"};

const Field = ({label,value,onChange,placeholder,type="text"}) => (
  <div style={{marginBottom:12}}>
    <div style={{fontSize:11,fontWeight:600,color:"#374151",marginBottom:4}}>{label}</div>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",padding:"8px 10px",border:"1px solid #e5e7eb",borderRadius:6,fontSize:12,outline:"none",fontFamily:"monospace",boxSizing:"border-box",background:"#f9fafb"}}/>
  </div>
);

const Sel = ({label,value,onChange,options}) => (
  <div style={{marginBottom:12}}>
    <div style={{fontSize:11,fontWeight:600,color:"#374151",marginBottom:4}}>{label}</div>
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",padding:"8px 10px",border:"1px solid #e5e7eb",borderRadius:6,fontSize:12,outline:"none",boxSizing:"border-box",background:"#f9fafb"}}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const DeviceTerminal = ({device,onClose}) => {
  const [input,setInput] = useState("");
  const [lines,setLines] = useState([
    {t:"info",v:`Connected to ${device.name} (${device.model})`},
    {t:"muted",v:"Type ? for help."},
    {t:"muted",v:""},
  ]);
  const [mode,setMode] = useState("privileged");
  const [hostname,setHostname] = useState(device.name);
  const [currentIface,setCurrentIface] = useState(null);
  const [history,setHistory] = useState([]);
  const [histIdx,setHistIdx] = useState(-1);
  const termRef = useRef(null);
  const inputRef = useRef(null);
  const prompt = {user:`${hostname}>`,privileged:`${hostname}#`,config:`${hostname}(config)#`,interface:`${hostname}(config-if)#`}[mode]||`${hostname}#`;

  const addL = (nl) => { setLines(p=>[...p,...nl]); setTimeout(()=>{if(termRef.current)termRef.current.scrollTop=termRef.current.scrollHeight;},30); };

  const handleKey = (e) => {
    if(e.key==="Enter"){
      const cmd=input.trim(); setInput(""); setHistIdx(-1);
      if(cmd) setHistory(p=>[cmd,...p]);
      addL([{t:"prompt-line",prompt,cmd}]);
      processCmd(cmd);
    } else if(e.key==="ArrowUp"){e.preventDefault();const i=histIdx+1;if(i<history.length){setHistIdx(i);setInput(history[i]);}}
    else if(e.key==="ArrowDown"){e.preventDefault();const i=histIdx-1;if(i<0){setHistIdx(-1);setInput("");}else{setHistIdx(i);setInput(history[i]);}}
  };

  const processCmd = (raw) => {
    const cmd=raw.toLowerCase().trim(); const parts=cmd.split(/\s+/);
    const isRouter = device.type==="router";
const isSwitch = device.type==="switch";
const isFirewall = device.type==="firewall";
const isPC = device.type==="pc";
const isServer = device.type==="server";
const isL3 = isRouter||isFirewall;
const isL2 = isSwitch;
    const ts=()=>{const n=new Date();return `*${n.toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"})} ${n.toTimeString().slice(0,8)}`;};
    if(!cmd) return;
    if(cmd==="clear"||cmd==="cls"){setLines([]);return;}
    if(cmd==="?"||cmd==="help"){addL([{t:"header",v:"Available Commands:"},{t:"info",v:"  enable / en            Enter privileged mode"},{t:"info",v:"  configure terminal     Enter config mode"},{t:"info",v:"  hostname <name>        Set hostname"},{t:"info",v:"  interface <name>       Enter interface config"},{t:"info",v:"  ip address <ip> <mask> Assign IP"},{t:"info",v:"  no shutdown            Enable interface"},{t:"info",v:"  shutdown               Disable interface"},{t:"info",v:"  show ip interface brief"},{t:"info",v:"  show running-config"},{t:"info",v:"  write memory / wr      Save config"},{t:"info",v:"  end / exit             Change mode"}]);return;}
    if(cmd==="enable"||cmd==="en"){if(mode==="user"){setMode("privileged");addL([{t:"success",v:"Entering privileged EXEC mode..."}]);}else addL([{t:"warn",v:"Already in privileged mode."}]);return;}
    if(cmd==="disable"){setMode("user");return;}
    if(cmd==="configure terminal"||cmd==="conf t"){if(mode!=="privileged"){addL([{t:"error",v:"% Must be in privileged mode."}]);return;}setMode("config");addL([{t:"info",v:"Enter configuration commands, one per line. End with CNTL/Z."}]);return;}
    if(cmd==="end"||cmd==="exit"){if(mode==="interface"){setMode("config");setCurrentIface(null);}else if(mode==="config"){setMode("privileged");addL([{t:"success",v:`${ts()}: %SYS-5-CONFIG_I: Configured from console`}]);}else if(mode==="privileged")setMode("user");return;}
    if(parts[0]==="hostname"&&parts[1]){if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}setHostname(parts[1]);addL([{t:"success",v:`Hostname changed to '${parts[1]}'`}]);return;}
    if((parts[0]==="interface"||parts[0]==="int")&&parts[1]){if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}const ifName=parts.slice(1).join(" ").replace(/^gi/i,"GigabitEthernet").replace(/^fa/i,"FastEthernet").replace(/^se/i,"Serial");setCurrentIface(ifName);setMode("interface");addL([{t:"info",v:`Configuring interface ${ifName}`}]);return;}
    if(parts[0]==="ip"&&parts[1]==="address"&&parts[2]&&parts[3]){if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}addL([{t:"success",v:`IP address ${parts[2]} ${parts[3]} assigned to ${currentIface}`}]);return;}
    if(cmd==="no shutdown"||cmd==="no shut"){if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}addL([{t:"success",v:`${ts()}: %LINK-3-UPDOWN: Interface ${currentIface}, changed state to up`},{t:"success",v:`${ts()}: %LINEPROTO-5-UPDOWN: Line protocol changed state to up`}]);return;}
    if(cmd==="shutdown"||cmd==="shut"){if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}addL([{t:"warn",v:`${ts()}: %LINK-5-CHANGED: Interface ${currentIface}, changed state to administratively down`}]);return;}
    if(cmd==="show ip interface brief"||cmd==="sh ip int br"){const ifaces=DEVICE_TYPES[device.type]?.interfaces||[];addL([{t:"header",v:"Interface              IP-Address      OK? Method Status                Protocol"}]);ifaces.forEach((iface,i)=>{const short=iface.replace("GigabitEthernet","Gi").replace("FastEthernet","Fa").replace("Serial","Se");addL([{t:i===0?"success":"warn",v:`${short.padEnd(23)}${"unassigned".padEnd(16)}NO  unset  ${"down".padEnd(22)}down`}]);});return;}
    if(cmd==="show running-config"||cmd==="sh run"){addL([{t:"info",v:"Building configuration..."},{t:"header",v:"Current configuration:"},{t:"muted",v:"!"},{t:"text",v:`hostname ${hostname}`},{t:"muted",v:"!"},{t:"text",v:"end"}]);return;}
    if(cmd==="write memory"||cmd==="wr"){addL([{t:"info",v:"Building configuration..."},{t:"success",v:"[OK]"}]);return;}
    if(cmd==="show version"||cmd==="sh ver"){
  addL([
    {t:"header",v:"Cisco IOS Software, Version 15.1(4)M4"},
    {t:"text",v:`hostname: ${hostname}`},
    {t:"text",v:`Model: ${device.model}`},
    {t:"text",v:"Uptime: 0 days, 0 hours, 1 minute"},
    {t:"text",v:"RAM: 256MB, Flash: 64MB"},
    {t:"muted",v:""},
  ]);return;}

if(parts[0]==="ping"&&parts[1]){
  const target=parts[1];
  addL([{t:"info",v:`Sending 5 ICMP Echos to ${target}, timeout 2 seconds:`}]);
  setTimeout(()=>addL([{t:"success",v:"!!!!!"}]),300);
  setTimeout(()=>addL([{t:"success",v:`Success rate is 100% (5/5), round-trip min/avg/max = 1/2/4 ms`}]),600);
  return;}

if(parts[0]==="traceroute"||parts[0]==="trace"){
  const target=parts[1]||"";
  addL([{t:"info",v:`Tracing route to ${target}:`}]);
  setTimeout(()=>addL([{t:"success",v:" 1  192.168.1.1   1 ms"}]),300);
  setTimeout(()=>addL([{t:"success",v:` 2  ${target}   2 ms`}]),600);
  return;}

if(cmd==="show mac-address-table"||cmd==="sh mac"){
  addL([
    {t:"header",v:"Mac Address Table"},
    {t:"header",v:"Vlan  Mac Address        Type    Ports"},
    {t:"text",v:" 1    0001.0001.0001     DYNAMIC Gi0/0"},
    {t:"text",v:" 1    0001.0001.0002     DYNAMIC Gi0/1"},
  ]);return;}

  if(!isSwitch&&(cmd==="show vlan brief"||cmd==="sh vlan br")){addL([{t:"error",v:"% Invalid command for this device type."}]);return;}
if(cmd==="show vlan brief"||cmd==="sh vlan br"){
  addL([
    {t:"header",v:"VLAN Name                Status    Ports"},
    {t:"success",v:"1    default              active    Gi0/0, Gi0/1"},
    {t:"warn",v:"10   Management           active"},
    {t:"warn",v:"20   Sales                active"},
  ]);return;}

if(cmd==="show cdp neighbors"||cmd==="sh cdp nei"){
  addL([
    {t:"header",v:"Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID"},
    {t:"text",v:`Router1          Gi 0/0            120          R           2911      Gi 0/0`},
  ]);return;}

if(parts[0]==="ip"&&parts[1]==="dhcp"&&parts[2]==="pool"&&parts[3]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`DHCP pool '${parts[3]}' created`}]);return;}

if(parts[0]==="network"&&parts[1]&&parts[2]){
  addL([{t:"success",v:`Network ${parts[1]} ${parts[2]} assigned to DHCP pool`}]);return;}

if(parts[0]==="default-router"&&parts[1]){
  addL([{t:"success",v:`Default gateway ${parts[1]} configured`}]);return;}

if(parts[0]==="dns-server"&&parts[1]){
  addL([{t:"success",v:`DNS server ${parts[1]} configured`}]);return;}

if(parts[0]==="router"&&parts[1]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  setMode("config");
  addL([{t:"info",v:`Entering ${parts[1].toUpperCase()} router configuration...`}]);return;}

if(parts[0]==="network"&&parts[1]){
  addL([{t:"success",v:`Network ${parts[1]} added to routing protocol`}]);return;}

if(cmd==="show ip route"||cmd==="sh ip ro"){
  addL([
    {t:"header",v:"Codes: C - connected, S - static, R - RIP, O - OSPF"},
    {t:"success",v:"C    192.168.1.0/24 is directly connected, GigabitEthernet0/0"},
    {t:"text",v:"S    192.168.2.0/24 [1/0] via 192.168.1.254"},
    {t:"text",v:"R    192.168.3.0/24 [120/1] via 192.168.1.254"},
  ]);return;}

if(parts[0]==="access-list"&&parts[1]&&parts[2]&&parts[3]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`ACL ${parts[1]} ${parts[2]} ${parts[3]} configured`}]);return;}

if(parts[0]==="ip"&&parts[1]==="nat"){
  addL([{t:"success",v:`NAT ${parts.slice(2).join(" ")} configured`}]);return;}

if(cmd==="show ip nat translations"||cmd==="sh ip nat tr"){
  addL([
    {t:"header",v:"Pro  Inside global     Inside local      Outside local     Outside global"},
    {t:"text",v:"tcp  203.0.113.1:1234  192.168.1.10:1234 8.8.8.8:80       8.8.8.8:80"},
  ]);return;}
  // ═══ ROUTING PROTOCOLS ═══
if(parts[0]==="router"&&parts[1]==="ospf"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  setMode("config");
  addL([{t:"info",v:`Entering OSPF process ${parts[2]} configuration...`},{t:"muted",v:`${hostname}(config-router)#`}]);return;}

if(parts[0]==="router"&&parts[1]==="rip"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  setMode("config");
  addL([{t:"info",v:"Entering RIP configuration..."},{t:"muted",v:`${hostname}(config-router)#`}]);return;}

if(parts[0]==="router"&&parts[1]==="eigrp"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  setMode("config");
  addL([{t:"info",v:`Entering EIGRP AS ${parts[2]} configuration...`},{t:"muted",v:`${hostname}(config-router)#`}]);return;}

if(parts[0]==="network"&&parts[1]&&parts[2]&&parts[3]==="area"&&parts[4]){
  addL([{t:"success",v:`Network ${parts[1]} ${parts[2]} added to OSPF area ${parts[4]}`}]);return;}

if(parts[0]==="network"&&parts[1]){
  addL([{t:"success",v:`Network ${parts[1]} added to routing protocol`}]);return;}

if(cmd==="version 2"){
  addL([{t:"success",v:"RIP version 2 enabled"}]);return;}

if(cmd==="no auto-summary"){
  addL([{t:"success",v:"Auto-summary disabled"}]);return;}

if(cmd==="show ip ospf neighbor"||cmd==="sh ip ospf nei"){
  addL([
    {t:"header",v:"Neighbor ID     Pri   State           Dead Time   Address         Interface"},
    {t:"success",v:"192.168.2.1       1   FULL/DR         00:00:38    192.168.1.2     GigabitEthernet0/0"},
    {t:"success",v:"192.168.3.1       1   FULL/BDR        00:00:36    192.168.1.3     GigabitEthernet0/1"},
  ]);return;}

if(cmd==="show ip ospf database"||cmd==="sh ip ospf dat"){
  addL([
    {t:"header",v:"OSPF Router with ID (192.168.1.1) (Process ID 1)"},
    {t:"muted",v:""},
    {t:"header",v:"Router Link States (Area 0)"},
    {t:"text",v:"Link ID         ADV Router      Age  Seq#       Checksum Link count"},
    {t:"text",v:"192.168.1.1     192.168.1.1     120  0x80000003 0x00A1B2 2"},
    {t:"text",v:"192.168.2.1     192.168.2.1     118  0x80000002 0x00C3D4 2"},
    {t:"muted",v:""},
    {t:"header",v:"Net Link States (Area 0)"},
    {t:"text",v:"192.168.1.0     192.168.1.1     120  0x80000001 0x00E5F6"},
  ]);return;}

if(cmd==="show ip ospf"||cmd==="sh ip ospf"){
  addL([
    {t:"header",v:"Routing Process OSPF 1 with ID 192.168.1.1"},
    {t:"text",v:" Supports only single TOS(TOS0) routes"},
    {t:"text",v:" SPF algorithm last executed 00:01:20 ago"},
    {t:"text",v:" Number of areas in this router is 1. 1 normal 0 stub 0 nssa"},
    {t:"success",v:" Area BACKBONE(0)"},
    {t:"text",v:"   Number of interfaces in this area is 2"},
    {t:"text",v:"   SPF algorithm executed 3 times"},
  ]);return;}

if(cmd==="show ip rip database"||cmd==="sh ip rip dat"){
  addL([
    {t:"header",v:"RIP Database:"},
    {t:"success",v:"192.168.1.0/24    directly connected, GigabitEthernet0/0"},
    {t:"text",v:"192.168.2.0/24    [1] via 192.168.1.2, 00:00:15, GigabitEthernet0/0"},
    {t:"text",v:"192.168.3.0/24    [2] via 192.168.1.2, 00:00:15, GigabitEthernet0/0"},
  ]);return;}

if(cmd==="show ip eigrp neighbors"||cmd==="sh ip eigrp nei"){
  addL([
    {t:"header",v:"EIGRP-IPv4 Neighbors for AS(100)"},
    {t:"header",v:"H   Address         Interface       Hold Uptime   SRTT   RTO  Q  Seq"},
    {t:"success",v:"0   192.168.1.2     Gi0/0             14 00:05:23    1   100  0  3"},
    {t:"success",v:"1   192.168.1.3     Gi0/1             12 00:05:20    2   100  0  2"},
  ]);return;}

if(cmd==="show ip eigrp topology"||cmd==="sh ip eigrp top"){
  addL([
    {t:"header",v:"EIGRP-IPv4 Topology Table for AS(100)/ID(192.168.1.1)"},
    {t:"text",v:"Codes: P-Passive, A-Active, U-Update, Q-Query, R-Reply"},
    {t:"muted",v:""},
    {t:"success",v:"P 192.168.1.0/24, 1 successors, FD is 28160"},
    {t:"text",v:"        via Connected, GigabitEthernet0/0"},
    {t:"success",v:"P 192.168.2.0/24, 1 successors, FD is 30720"},
    {t:"text",v:"        via 192.168.1.2 (30720/28160), GigabitEthernet0/0"},
  ]);return;}

if(parts[0]==="ip"&&parts[1]==="ospf"&&parts[2]==="cost"&&parts[3]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`OSPF cost set to ${parts[3]} on ${currentIface}`}]);return;}

if(parts[0]==="ip"&&parts[1]==="ospf"&&parts[2]==="priority"&&parts[3]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`OSPF priority set to ${parts[3]} on ${currentIface}`}]);return;}

if(parts[0]==="area"&&parts[2]==="stub"){
  addL([{t:"success",v:`Area ${parts[1]} configured as stub`}]);return;}

if(cmd==="passive-interface default"){
  addL([{t:"success",v:"All interfaces set to passive"}]);return;}

if(parts[0]==="passive-interface"&&parts[1]){
  addL([{t:"success",v:`Interface ${parts[1]} set to passive`}]);return;}

if(parts[0]==="no"&&parts[1]==="passive-interface"&&parts[2]){
  addL([{t:"success",v:`Interface ${parts[2]} removed from passive`}]);return;}

if(parts[0]==="redistribute"&&parts[1]){
  addL([{t:"success",v:`Redistributing ${parts[1]} into routing protocol`}]);return;}

if(cmd==="show ip protocols"||cmd==="sh ip pro"){
  addL([
    {t:"header",v:"Routing Protocol is OSPF 1"},
    {t:"text",v:"  Outgoing update filter list for all interfaces is not set"},
    {t:"text",v:"  Incoming update filter list for all interfaces is not set"},
    {t:"text",v:"  Router ID 192.168.1.1"},
    {t:"success",v:"  Number of areas: 1 normal, 0 stub, 0 nssa"},
    {t:"text",v:"  Maximum path: 4"},
    {t:"text",v:"  Routing for Networks:"},
    {t:"text",v:"    192.168.1.0 0.0.0.255 area 0"},
  ]);return;}
  // ═══ ACL ═══
if(parts[0]==="access-list"&&parts[1]&&parts[2]&&parts[3]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  const aclType=parseInt(parts[1])<=99?"Standard":parseInt(parts[1])<=199?"Extended":"Named";
  addL([{t:"success",v:`ACL ${parts[1]} (${aclType}) - ${parts[2]} ${parts.slice(3).join(" ")} configured`}]);return;}

if(parts[0]==="ip"&&parts[1]==="access-list"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`Named ACL '${parts[3]}' created (${parts[2]})`}]);
  setMode("config");return;}

if((parts[0]==="permit"||parts[0]==="deny")&&parts[1]){
  addL([{t:parts[0]==="permit"?"success":"warn",v:`Rule: ${parts.join(" ")} added`}]);return;}

if(parts[0]==="ip"&&parts[1]==="access-group"&&parts[2]&&parts[3]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`ACL ${parts[2]} applied ${parts[3]} on ${currentIface}`}]);return;}

if(cmd==="show ip access-lists"||cmd==="sh ip acc"){
  addL([
    {t:"header",v:"Standard IP access list 10"},
    {t:"success",v:"    10 permit 192.168.1.0, wildcard bits 0.0.0.255 (5 matches)"},
    {t:"warn",v:"    20 deny   any"},
    {t:"muted",v:""},
    {t:"header",v:"Extended IP access list 100"},
    {t:"success",v:"    10 permit tcp 192.168.1.0 0.0.0.255 any eq 80 (12 matches)"},
    {t:"warn",v:"    20 deny   ip any any"},
  ]);return;}

// ═══ NAT ═══
if(parts[0]==="ip"&&parts[1]==="nat"&&parts[2]==="inside"){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`Interface ${currentIface} set as NAT inside`}]);return;}

if(parts[0]==="ip"&&parts[1]==="nat"&&parts[2]==="outside"){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`Interface ${currentIface} set as NAT outside`}]);return;}

if(parts[0]==="ip"&&parts[1]==="nat"&&parts[2]==="inside"&&parts[3]==="source"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`NAT translation rule configured: ${parts.slice(4).join(" ")}`}]);return;}

if(cmd==="show ip nat translations"||cmd==="sh ip nat tr"){
  addL([
    {t:"header",v:"Pro  Inside global      Inside local       Outside local      Outside global"},
    {t:"text",v:"tcp  203.0.113.1:1024   192.168.1.10:1024  8.8.8.8:80        8.8.8.8:80"},
    {t:"text",v:"tcp  203.0.113.1:1025   192.168.1.11:1025  8.8.8.8:443       8.8.8.8:443"},
    {t:"text",v:"---  203.0.113.1        192.168.1.10       ---               ---"},
  ]);return;}

if(cmd==="show ip nat statistics"||cmd==="sh ip nat st"){
  addL([
    {t:"header",v:"Total active translations: 3 (1 static, 2 dynamic; 2 extended)"},
    {t:"text",v:"Outside interfaces: GigabitEthernet0/1"},
    {t:"text",v:"Inside interfaces:  GigabitEthernet0/0"},
    {t:"success",v:"Hits: 150  Misses: 2"},
    {t:"text",v:"Expired translations: 5"},
  ]);return;}

if(cmd==="clear ip nat translation *"){
  addL([{t:"success",v:"All NAT translations cleared"}]);return;}

// ═══ DHCP ═══
if(parts[0]==="ip"&&parts[1]==="dhcp"&&parts[2]==="pool"&&parts[3]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`DHCP pool '${parts[3]}' created`}]);
  setMode("config");return;}

if(parts[0]==="ip"&&parts[1]==="dhcp"&&parts[2]==="excluded-address"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`Excluded addresses: ${parts.slice(3).join(" - ")}`}]);return;}

if(parts[0]==="default-router"&&parts[1]){
  addL([{t:"success",v:`Default gateway set to ${parts[1]}`}]);return;}

if(parts[0]==="dns-server"&&parts[1]){
  addL([{t:"success",v:`DNS server set to ${parts[1]}`}]);return;}

if(parts[0]==="lease"&&parts[1]){
  addL([{t:"success",v:`Lease time set to ${parts[1]} days`}]);return;}

if(cmd==="show ip dhcp pool"||cmd==="sh ip dhcp pool"){
  addL([
    {t:"header",v:"Pool LAN_POOL :"},
    {t:"text",v:" Utilization mark (high/low)    : 100 / 0"},
    {t:"text",v:" Subnet size (first/next)        : 0 / 0"},
    {t:"text",v:" Total addresses                 : 254"},
    {t:"success",v:" Leased addresses                : 10"},
    {t:"text",v:" Pending event                   : none"},
    {t:"text",v:" 1 subnet is currently in the pool :"},
    {t:"text",v:" Current index    IP address range   Leased addresses"},
    {t:"text",v:" 192.168.1.11     192.168.1.1  - 192.168.1.254  10"},
  ]);return;}

if(cmd==="show ip dhcp binding"||cmd==="sh ip dhcp bin"){
  addL([
    {t:"header",v:"Bindings from all pools not associated with VRF:"},
    {t:"header",v:"IP address       Client-ID/              Lease expiration        Type"},
    {t:"text",v:"192.168.1.10     0100.5079.6668.0a       Mar 01 2025 12:00 AM    Automatic"},
    {t:"text",v:"192.168.1.11     0100.5079.6668.0b       Mar 01 2025 12:00 AM    Automatic"},
    {t:"text",v:"192.168.1.12     0100.5079.6668.0c       Mar 01 2025 12:00 AM    Automatic"},
  ]);return;}

if(cmd==="show ip dhcp conflict"||cmd==="sh ip dhcp con"){
  addL([
    {t:"header",v:"IP address        Detection method   Detection time"},
    {t:"warn",v:"192.168.1.50      Ping               Jan 1 2025 10:00 AM"},
  ]);return;}
  // ═══ STP ═══
if(cmd==="show spanning-tree"||cmd==="sh span"){
  addL([
    {t:"header",v:"VLAN0001"},
    {t:"success",v:"  Spanning tree enabled protocol ieee"},
    {t:"text",v:"  Root ID    Priority    32769"},
    {t:"text",v:"             Address     0001.0001.0001"},
    {t:"success",v:"             This bridge is the root"},
    {t:"muted",v:""},
    {t:"header",v:"Interface           Role Sts Cost      Prio.Nbr Type"},
    {t:"success",v:"Gi0/0               Desg FWD 4         128.1    P2p"},
    {t:"success",v:"Gi0/1               Desg FWD 4         128.2    P2p"},
  ]);return;}

if(!isSwitch&&parts[0]==="spanning-tree"){addL([{t:"error",v:"% Invalid command for this device type."}]);return;}

if(parts[0]==="spanning-tree"&&parts[1]==="vlan"&&parts[2]==="priority"&&parts[3]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`STP priority for VLAN ${parts[2]} set to ${parts[3]}`}]);return;}

if(parts[0]==="spanning-tree"&&parts[1]==="mode"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`Spanning-tree mode changed to ${parts[2]}`}]);return;}

if(cmd==="show spanning-tree summary"||cmd==="sh span sum"){
  addL([
    {t:"header",v:"Switch is in rapid-pvst mode"},
    {t:"text",v:"Root bridge for: VLAN0001, VLAN0010, VLAN0020"},
    {t:"text",v:"EtherChannel misconfig guard        is enabled"},
    {t:"success",v:"Extended system ID                  is enabled"},
    {t:"text",v:"Portfast Default                    is disabled"},
    {t:"text",v:"PortFast BPDU Guard Default         is disabled"},
  ]);return;}

if(parts[0]==="spanning-tree"&&parts[1]==="portfast"){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`PortFast enabled on ${currentIface}`}]);return;}

if(parts[0]==="spanning-tree"&&parts[1]==="bpduguard"&&parts[2]==="enable"){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`BPDU Guard enabled on ${currentIface}`}]);return;}

// ═══ VTP ═══
if(parts[0]==="vtp"&&parts[1]==="mode"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`VTP mode set to ${parts[2]}`}]);return;}

if(parts[0]==="vtp"&&parts[1]==="domain"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`VTP domain set to ${parts[2]}`}]);return;}

if(parts[0]==="vtp"&&parts[1]==="password"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`VTP password configured`}]);return;}

if(cmd==="show vtp status"||cmd==="sh vtp st"){
  addL([
    {t:"header",v:"VTP Version capable             : 1 to 3"},
    {t:"text",v:"VTP version running             : 2"},
    {t:"text",v:"VTP Domain Name                 : CCNA_LAB"},
    {t:"success",v:"VTP Pruning Mode                : Disabled"},
    {t:"text",v:"VTP Traps Generation            : Disabled"},
    {t:"text",v:"Device ID                       : 0001.0001.0001"},
    {t:"success",v:"Configuration last modified by  : 0.0.0.0"},
    {t:"text",v:"VTP Operating Mode              : Server"},
    {t:"text",v:"Maximum VLANs supported locally : 1005"},
    {t:"text",v:"Number of existing VLANs        : 5"},
  ]);return;}

// ═══ PORT SECURITY ═══
if(cmd==="switchport port-security"){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`Port security enabled on ${currentIface}`}]);return;}

if(parts[0]==="switchport"&&parts[1]==="port-security"&&parts[2]==="maximum"&&parts[3]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`Max MAC addresses set to ${parts[3]} on ${currentIface}`}]);return;}

if(parts[0]==="switchport"&&parts[1]==="port-security"&&parts[2]==="violation"&&parts[3]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`Violation mode set to ${parts[3]} on ${currentIface}`}]);return;}

if(parts[0]==="switchport"&&parts[1]==="port-security"&&parts[2]==="mac-address"){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`MAC address ${parts[3]==="sticky"?"sticky learning":""+parts[3]} configured on ${currentIface}`}]);return;}

if(cmd==="show port-security"||cmd==="sh port-sec"){
  addL([
    {t:"header",v:"Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action"},
    {t:"success",v:"      Gi0/0              2            1                  0         Shutdown"},
    {t:"success",v:"      Gi0/1              1            1                  0         Restrict"},
  ]);return;}

if(cmd==="show port-security interface"||cmd==="sh port-sec int"){
  addL([
    {t:"header",v:`Port Security              : Enabled`},
    {t:"success",v:`Port Status                : Secure-up`},
    {t:"text",v:`Violation Mode             : Shutdown`},
    {t:"text",v:`Aging Time                 : 0 mins`},
    {t:"text",v:`Maximum MAC Addresses      : 2`},
    {t:"success",v:`Total MAC Addresses        : 1`},
    {t:"text",v:`Configured MAC Addresses   : 0`},
    {t:"text",v:`Sticky MAC Addresses       : 1`},
    {t:"text",v:`Last Source Address        : 0001.0001.0001`},
    {t:"text",v:`Security Violation Count   : 0`},
  ]);return;}

// ═══ SSH ═══
if(parts[0]==="ip"&&parts[1]==="domain-name"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`Domain name set to ${parts[2]}`}]);return;}

if(parts[0]==="crypto"&&parts[1]==="key"&&parts[2]==="generate"&&parts[3]==="rsa"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([
    {t:"info",v:"The name for the keys will be: "+hostname+".ccna.lab"},
    {t:"info",v:"Choose the size of the key modulus in the range of 360 to 4096:"},
    {t:"success",v:"% Generating 2048 bit RSA keys, keys will be non-exportable..."},
    {t:"success",v:"[OK] (elapsed time was 2 seconds)"},
  ]);return;}

if(parts[0]==="ip"&&parts[1]==="ssh"&&parts[2]==="version"&&parts[3]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`SSH version ${parts[3]} enabled`}]);return;}

if(parts[0]==="line"&&parts[1]==="vty"&&parts[2]&&parts[3]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  setMode("config");
  addL([{t:"info",v:`Entering VTY line ${parts[2]}-${parts[3]} configuration...`}]);return;}

if(parts[0]==="transport"&&parts[1]==="input"&&parts[2]){
  addL([{t:"success",v:`Transport input set to ${parts[2]}`}]);return;}

if(parts[0]==="login"&&parts[1]==="local"){
  addL([{t:"success",v:"Local login authentication enabled"}]);return;}

if(parts[0]==="username"&&parts[1]&&parts[2]==="privilege"&&parts[3]&&parts[4]==="secret"&&parts[5]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`User '${parts[1]}' created with privilege ${parts[3]}`}]);return;}

if(cmd==="show ip ssh"||cmd==="sh ip ssh"){
  addL([
    {t:"success",v:"SSH Enabled - version 2.0"},
    {t:"text",v:"Authentication timeout: 120 secs; Authentication retries: 3"},
    {t:"text",v:"Minimum expected Diffie Hellman key size : 1024 bits"},
    {t:"success",v:"IOS Keys in SECSH format(ssh-rsa, base64 encoded): "+hostname},
  ]);return;}

if(cmd==="show users"||cmd==="sh users"){
  addL([
    {t:"header",v:"    Line       User       Host(s)              Idle       Location"},
    {t:"success",v:"*  0 con 0    admin      idle                 00:00:00"},
    {t:"text",v:"   1 vty 0    admin      192.168.1.10         00:00:05"},
  ]);return;}
  // ═══ ROUTER CONFIG COMMANDS ═══
if(parts[0]==="banner"&&parts[1]==="motd"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`Banner MOTD configured`}]);return;}

if(parts[0]==="enable"&&parts[1]==="secret"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`Enable secret password configured`}]);return;}

if(parts[0]==="enable"&&parts[1]==="password"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`Enable password configured`}]);return;}

if(parts[0]==="service"&&parts[1]==="password-encryption"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`Password encryption enabled`}]);return;}

if(parts[0]==="no"&&parts[1]==="ip"&&parts[2]==="domain-lookup"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`DNS lookup disabled`}]);return;}

if(parts[0]==="line"&&parts[1]==="console"&&parts[2]==="0"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  setMode("config");
  addL([{t:"info",v:`Entering console line configuration...`},{t:"muted",v:`${hostname}(config-line)#`}]);return;}

if(parts[0]==="password"&&parts[1]){
  addL([{t:"success",v:`Password '${parts[1]}' set on line`}]);return;}

if(cmd==="login"){
  addL([{t:"success",v:`Login authentication enabled on line`}]);return;}

if(cmd==="logging synchronous"){
  addL([{t:"success",v:`Logging synchronous enabled`}]);return;}

if(cmd==="exec-timeout 0 0"||cmd==="exec-timeout"){
  addL([{t:"success",v:`Exec timeout configured`}]);return;}

if(parts[0]==="ntp"&&parts[1]==="server"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`NTP server ${parts[2]} configured`}]);return;}

if(cmd==="show ntp status"||cmd==="sh ntp st"){
  addL([
    {t:"header",v:"Clock is synchronized, stratum 2, reference is 216.239.35.0"},
    {t:"text",v:"nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz"},
    {t:"success",v:"reference time is D4F8A2B1.B4395810"},
    {t:"text",v:"clock offset is 0.5000 msec, root delay is 1.00 msec"},
  ]);return;}

if(parts[0]==="snmp-server"&&parts[1]==="community"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`SNMP community '${parts[2]}' ${parts[3]||"RO"} configured`}]);return;}

if(cmd==="show snmp"||cmd==="sh snmp"){
  addL([
    {t:"header",v:"Chassis: FTX1234ABCD"},
    {t:"text",v:"Contact: admin@network.com"},
    {t:"text",v:"Location: Server Room"},
    {t:"success",v:"SNMP packets input: 100"},
    {t:"text",v:"SNMP packets output: 100"},
  ]);return;}

if(parts[0]==="clock"&&parts[1]==="set"){
  addL([{t:"success",v:`Clock set to ${parts.slice(2).join(" ")}`}]);return;}

if(cmd==="show clock"||cmd==="sh clock"){
  const now=new Date();
  addL([{t:"success",v:`*${now.toTimeString().slice(0,8)} UTC ${now.toDateString()}`}]);return;}

if(parts[0]==="do"&&parts.length>1){
  const subcmd=parts.slice(1).join(" ");
  addL([{t:"info",v:`Executing: ${subcmd} in privileged mode`}]);
  processCmd(subcmd);return;}

if(cmd==="show processes cpu"||cmd==="sh proc cpu"){
  addL([
    {t:"header",v:"CPU utilization for five seconds: 2%/0%; one minute: 3%; five minutes: 3%"},
    {t:"text",v:" PID Runtime(ms)  Invoked  uSecs    5Sec   1Min   5Min TTY Process"},
    {t:"text",v:"   1          0      172      0    0.00%  0.00%  0.00%   0 Chunk Manager"},
    {t:"success",v:"   2         12      200     60    0.00%  0.00%  0.00%   0 Load Meter"},
  ]);return;}

if(cmd==="show memory"||cmd==="sh mem"){
  addL([
    {t:"header",v:"                Head    Total(b)     Used(b)     Free(b)   Lowest(b)  Largest(b)"},
    {t:"success",v:"Processor  262144000   268435456   134217728   134217728   134217728   134217728"},
    {t:"text",v:"I/O        134217728   134217728    67108864    67108864    67108864    67108864"},
  ]);return;}

if(cmd==="show interfaces"||cmd==="sh int"){
  const ifaces=DEVICE_TYPES[device.type]?.interfaces||[];
  ifaces.forEach(iface=>{
    const short=iface.replace("GigabitEthernet","GigabitEthernet").replace("FastEthernet","FastEthernet");
    addL([
      {t:"header",v:`${short} is up, line protocol is up`},
      {t:"text",v:`  Hardware is iGbE, address is 0001.0001.0001 (bia 0001.0001.0001)`},
      {t:"text",v:`  Internet address is unassigned`},
      {t:"text",v:`  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec`},
      {t:"success",v:`  Full-duplex, 1000Mb/s, media type is T`},
      {t:"muted",v:""},
    ]);
  });return;}

if(cmd==="show ip interface"||cmd==="sh ip int"){
  const ifaces=DEVICE_TYPES[device.type]?.interfaces||[];
  ifaces.forEach((iface,i)=>{
    addL([
      {t:i===0?"success":"warn",v:`${iface} is up, line protocol is up`},
      {t:"text",v:`  Internet address is unassigned`},
      {t:"text",v:`  Broadcast address is 255.255.255.255`},
      {t:"text",v:`  Outgoing access list is not set`},
      {t:"text",v:`  Inbound  access list is not set`},
      {t:"muted",v:""},
    ]);
  });return;}

if(cmd==="show cdp"||cmd==="sh cdp"){
  addL([
    {t:"success",v:"Global CDP information:"},
    {t:"text",v:"  Sending CDP packets every 60 seconds"},
    {t:"text",v:"  Sending a holdtime value of 180 seconds"},
    {t:"text",v:"  Sending CDPv2 advertisements is enabled"},
  ]);return;}

if(cmd==="show logging"||cmd==="sh log"){
  addL([
    {t:"header",v:"Syslog logging: enabled (0 messages dropped, 0 flushes, 0 overruns)"},
    {t:"success",v:"    Console logging: level debugging, 10 messages logged"},
    {t:"text",v:"    Monitor logging: level debugging, 0 messages logged"},
    {t:"text",v:"    Buffer logging: level debugging, 10 messages logged"},
  ]);return;}

if(cmd==="show flash"||cmd==="sh flash"){
  addL([
    {t:"header",v:"System flash directory:"},
    {t:"text",v:"File  Length   Name/status"},
    {t:"success",v:"  1   68831404 c2900-universalk9-mz.SPA.151-4.M4.bin"},
    {t:"text",v:"[68831404 bytes used, 190349620 available, 259121024 total]"},
    {t:"text",v:"256MB total (190MB free)"},
  ]);return;}

if(cmd==="copy running-config startup-config"||cmd==="copy run start"){
  addL([{t:"info",v:"Destination filename [startup-config]?"},{t:"success",v:"Building configuration... [OK]"}]);return;}

if(cmd==="erase startup-config"){
  addL([{t:"warn",v:"Erasing the nvram filesystem will remove all configuration files! Continue? [confirm]"},{t:"success",v:"[OK] Erase of nvram: complete"}]);return;}

if(cmd==="reload"){
  addL([{t:"warn",v:"Proceed with reload? [confirm]"},{t:"info",v:"System configuration has been modified. Save? [yes/no]:"},{t:"success",v:"Reloading..."}]);return;}
  
  // ═══ AAA ═══
if(parts[0]==="aaa"&&parts[1]==="new-model"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:"AAA new-model enabled"}]);return;}

if(parts[0]==="aaa"&&parts[1]==="authentication"&&parts[2]==="login"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`AAA authentication login '${parts[3]}' ${parts.slice(4).join(" ")} configured`}]);return;}

if(parts[0]==="aaa"&&parts[1]==="authorization"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`AAA authorization ${parts.slice(2).join(" ")} configured`}]);return;}

if(parts[0]==="aaa"&&parts[1]==="accounting"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`AAA accounting ${parts.slice(2).join(" ")} configured`}]);return;}

if(cmd==="show aaa"||cmd==="sh aaa"){
  addL([
    {t:"header",v:"AAA Authentication"},
    {t:"success",v:"  Login: default group tacacs+ local"},
    {t:"text",v:"  Enable: default group tacacs+ enable"},
    {t:"header",v:"AAA Authorization"},
    {t:"success",v:"  Exec: default group tacacs+ local"},
    {t:"header",v:"AAA Accounting"},
    {t:"text",v:"  Exec: default start-stop group tacacs+"},
  ]);return;}

// ═══ CDP ═══
if(cmd==="cdp run"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:"CDP enabled globally"}]);return;}

if(cmd==="no cdp run"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:"CDP disabled globally"}]);return;}

if(cmd==="cdp enable"){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`CDP enabled on ${currentIface}`}]);return;}

if(cmd==="no cdp enable"){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`CDP disabled on ${currentIface}`}]);return;}

if(cmd==="show cdp neighbors detail"||cmd==="sh cdp nei det"){
  addL([
    {t:"header",v:"Device ID: Switch1"},
    {t:"text",v:"  Entry address(es):"},
    {t:"success",v:"    IP address: 192.168.1.2"},
    {t:"text",v:"  Platform: cisco WS-C2960, Capabilities: Switch"},
    {t:"text",v:"  Interface: GigabitEthernet0/0, Port ID (outgoing port): Gi0/1"},
    {t:"text",v:"  Holdtime: 120 sec"},
    {t:"success",v:"  Version: Cisco IOS Software, Version 15.0(2)SE4"},
  ]);return;}

// ═══ LLDP ═══
if(cmd==="lldp run"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:"LLDP enabled globally"}]);return;}

if(cmd==="no lldp run"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:"LLDP disabled globally"}]);return;}

if(cmd==="lldp transmit"){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`LLDP transmit enabled on ${currentIface}`}]);return;}

if(cmd==="lldp receive"){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`LLDP receive enabled on ${currentIface}`}]);return;}

if(cmd==="show lldp neighbors"||cmd==="sh lldp nei"){
  addL([
    {t:"header",v:"Capability codes: (R) Router, (B) Bridge, (T) Telephone, (C) DOCSIS Cable Device"},
    {t:"header",v:"Device ID       Local Intf     Hold-time  Capability   Port ID"},
    {t:"success",v:"Switch1         Gi0/0          120        B            Gi0/1"},
  ]);return;}

if(cmd==="show lldp"||cmd==="sh lldp"){
  addL([
    {t:"success",v:"Global LLDP Information:"},
    {t:"text",v:"  Status: ACTIVE"},
    {t:"text",v:"  LLDP advertisements are sent every 30 seconds"},
    {t:"text",v:"  LLDP hold time advertised is 120 seconds"},
  ]);return;}

// ═══ LICENSE ═══
if(cmd==="show license"||cmd==="sh lic"){
  addL([
    {t:"header",v:"Index 1 Feature: ipbasek9"},
    {t:"success",v:"  Period left: Life time"},
    {t:"text",v:"  License Type: Permanent"},
    {t:"text",v:"  License State: Active, In Use"},
    {t:"header",v:"Index 2 Feature: securityk9"},
    {t:"success",v:"  Period left: Life time"},
    {t:"text",v:"  License State: Active, In Use"},
  ]);return;}

if(cmd==="show license feature"||cmd==="sh lic feat"){
  addL([
    {t:"header",v:"Feature name       Enforcement  Evaluation  Subscription  Enabled"},
    {t:"success",v:"ipbasek9           no           no          no            yes"},
    {t:"success",v:"securityk9         yes          no          no            yes"},
    {t:"text",v:"datak9             yes          no          no            no"},
  ]);return;}

if(parts[0]==="license"&&parts[1]==="boot"&&parts[2]==="module"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`License boot module ${parts.slice(3).join(" ")} configured — Reload required`}]);return;}

// ═══ LOGGING ═══
if(parts[0]==="logging"&&parts[1]==="host"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`Syslog server ${parts[2]} configured`}]);return;}

if(parts[0]==="logging"&&parts[1]==="trap"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`Logging trap level set to ${parts[2]}`}]);return;}

if(parts[0]==="logging"&&parts[1]==="buffered"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`Logging buffer size set to ${parts[2]}`}]);return;}

if(parts[0]==="logging"&&parts[1]==="console"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`Console logging level set to ${parts[2]}`}]);return;}

if(cmd==="show logging"||cmd==="sh log"){
  addL([
    {t:"header",v:"Syslog logging: enabled"},
    {t:"success",v:"    Console logging: level debugging"},
    {t:"text",v:"    Monitor logging: level debugging"},
    {t:"text",v:"    Buffer logging: level debugging, 4096 bytes"},
    {t:"text",v:"    Logging Exception size (4096 bytes)"},
    {t:"text",v:"    Trap logging: level informational, 42 message lines logged"},
    {t:"success",v:"        Logging to 192.168.1.100"},
  ]);return;}

// ═══ TACACS ═══
if(parts[0]==="tacacs-server"&&parts[1]==="host"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`TACACS+ server ${parts[2]} configured`}]);return;}

if(parts[0]==="tacacs-server"&&parts[1]==="key"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`TACACS+ key configured`}]);return;}

if(cmd==="show tacacs"||cmd==="sh tacacs"){
  addL([
    {t:"header",v:"Tacacs+ Server : 192.168.1.100"},
    {t:"success",v:"  Server is UP"},
    {t:"text",v:"  Socket opens: 10"},
    {t:"text",v:"  Socket closes: 10"},
    {t:"text",v:"  Total packets sent: 20"},
    {t:"success",v:"  Total packets recv: 20"},
  ]);return;}

// ═══ VPDN ═══
if(parts[0]==="vpdn-group"&&parts[1]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  setMode("config");
  addL([{t:"info",v:`VPDN group '${parts[1]}' configured`},{t:"muted",v:`${hostname}(config-vpdn)#`}]);return;}

if(parts[0]==="vpdn"&&parts[1]==="enable"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:"VPDN enabled"}]);return;}

if(parts[0]==="accept-dialin"){
  addL([{t:"success",v:"Accept dial-in configured"}]);return;}

if(parts[0]==="protocol"&&parts[1]==="l2tp"){
  addL([{t:"success",v:"L2TP protocol configured"}]);return;}

if(parts[0]==="virtual-template"&&parts[1]){
  addL([{t:"success",v:`Virtual template ${parts[1]} assigned`}]);return;}

if(cmd==="show vpdn"||cmd==="sh vpdn"){
  addL([
    {t:"header",v:"VPDN Tunnel Information"},
    {t:"success",v:"  L2TP Tunnel: Active"},
    {t:"text",v:"  Tunnel ID: 1"},
    {t:"text",v:"  Remote IP: 203.0.113.1"},
    {t:"text",v:"  Sessions: 1"},
  ]);return;}

// ═══ PRIVILEGE ═══
if(parts[0]==="privilege"&&parts[1]==="exec"&&parts[2]==="level"&&parts[3]&&parts[4]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`Privilege level ${parts[3]} assigned to command '${parts.slice(4).join(" ")}'`}]);return;}

if(cmd==="show privilege"||cmd==="sh priv"){
  addL([{t:"success",v:"Current privilege level is 15"}]);return;}
  // ═══ DOT1X ═══
if(cmd==="dot1x system-auth-control"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:"802.1X system authentication control enabled"}]);return;}

if(parts[0]==="dot1x"&&parts[1]==="port-control"&&parts[2]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`802.1X port control set to ${parts[2]} on ${currentIface}`}]);return;}

if(parts[0]==="dot1x"&&parts[1]==="host-mode"&&parts[2]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`802.1X host mode set to ${parts[2]} on ${currentIface}`}]);return;}

if(cmd==="show dot1x all"||cmd==="sh dot1x all"){
  addL([
    {t:"header",v:"Sysauthcontrol              Enabled"},
    {t:"text",v:"Dot1x Protocol Version      2"},
    {t:"muted",v:""},
    {t:"header",v:"Interface       PAE       Client          Status          Auth SM State"},
    {t:"success",v:"Gi0/0           AUTH      00:11:22:33:44  AUTHORIZED      AUTHENTICATED"},
    {t:"warn",v:"Gi0/1           AUTH      none            UNAUTHORIZED    CONNECTING"},
  ]);return;}

if(cmd==="show dot1x interface"||cmd==="sh dot1x int"){
  addL([
    {t:"header",v:`Dot1x Info for ${currentIface||"GigabitEthernet0/0"}`},
    {t:"success",v:"PAE                       = AUTHENTICATOR"},
    {t:"text",v:"PortControl               = AUTO"},
    {t:"text",v:"ControlDirection          = Both"},
    {t:"text",v:"HostMode                  = SINGLE_HOST"},
    {t:"text",v:"Violation Mode            = PROTECT"},
    {t:"success",v:"ReAuthentication          = Disabled"},
  ]);return;}

// ═══ MAC ═══
if(parts[0]==="mac"&&parts[1]==="address-table"&&parts[2]==="static"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`Static MAC entry ${parts[3]} added to VLAN ${parts[5]} on ${parts[7]}`}]);return;}

if(parts[0]==="mac"&&parts[1]==="address-table"&&parts[2]==="aging-time"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`MAC address aging time set to ${parts[3]} seconds`}]);return;}

  if(!isSwitch&&(cmd==="show mac address-table"||cmd==="sh mac add")){addL([{t:"error",v:"% Invalid command for this device type."}]);return;}
if(cmd==="show mac address-table"||cmd==="sh mac add"){
  addL([
    {t:"header",v:"Mac Address Table"},
    {t:"muted",v:""},
    {t:"header",v:"Vlan    Mac Address       Type        Ports"},
    {t:"header",v:"----    -----------       --------    -----"},
    {t:"success",v:"   1    0001.0001.0001    DYNAMIC     Gi0/0"},
    {t:"success",v:"   1    0001.0001.0002    DYNAMIC     Gi0/1"},
    {t:"text",v:"  10    0002.0002.0001    STATIC      Gi0/2"},
    {t:"muted",v:"Total Mac Addresses for this criterion: 3"},
  ]);return;}

if(cmd==="clear mac address-table dynamic"){
  addL([{t:"success",v:"MAC address table cleared"}]);return;}

// ═══ MLS ═══
if(parts[0]==="mls"&&parts[1]==="qos"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:"MLS QoS enabled"}]);return;}

if(parts[0]==="mls"&&parts[1]==="qos"&&parts[2]==="trust"){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`MLS QoS trust ${parts[3]||"cos"} configured on ${currentIface}`}]);return;}

if(cmd==="show mls qos"||cmd==="sh mls qos"){
  addL([
    {t:"header",v:"QoS is enabled"},
    {t:"text",v:"QoS ip packet dscp rewrite is enabled"},
    {t:"success",v:"Trust state: trust cos"},
    {t:"text",v:"Default DSCP: 0"},
    {t:"text",v:"Default CoS: 0"},
  ]);return;}

if(cmd==="show mls qos interface"||cmd==="sh mls qos int"){
  addL([
    {t:"header",v:`MLS QoS: ${currentIface||"GigabitEthernet0/0"}`},
    {t:"success",v:"Attached policy-map: SWITCH_QOS"},
    {t:"text",v:"Trust state: trust cos"},
    {t:"text",v:"Default COS: 0"},
    {t:"text",v:"DSCP: incoming"},
  ]);return;}

// ═══ MONITOR (SPAN) ═══
if(parts[0]==="monitor"&&parts[1]==="session"&&parts[2]&&parts[3]==="source"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`SPAN session ${parts[2]} source ${parts.slice(4).join(" ")} configured`}]);return;}

if(parts[0]==="monitor"&&parts[1]==="session"&&parts[2]&&parts[3]==="destination"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`SPAN session ${parts[2]} destination ${parts.slice(4).join(" ")} configured`}]);return;}

if(parts[0]==="no"&&parts[1]==="monitor"&&parts[2]==="session"&&parts[3]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`SPAN session ${parts[3]} removed`}]);return;}

if(cmd==="show monitor"||cmd==="sh monitor"){
  addL([
    {t:"header",v:"Session 1"},
    {t:"text",v:"---------"},
    {t:"text",v:"Type              : Local Session"},
    {t:"success",v:"Source Ports      :"},
    {t:"text",v:"    Both          : Gi0/1"},
    {t:"success",v:"Destination Ports : Gi0/3"},
    {t:"text",v:"    Encapsulation : Native"},
    {t:"text",v:"          Ingress : Disabled"},
  ]);return;}

// ═══ SDM ═══
if(parts[0]==="sdm"&&parts[1]==="prefer"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`SDM template set to ${parts[2]} — Reload required`}]);return;}

if(cmd==="show sdm prefer"||cmd==="sh sdm prefer"){
  addL([
    {t:"header",v:"The current template is the default template."},
    {t:"text",v:"The selected template optimizes the resources in"},
    {t:"text",v:"the switch to support this level of features for"},
    {t:"text",v:"8 routed interfaces and 1024 VLANs."},
    {t:"muted",v:""},
    {t:"success",v:" number of unicast mac addresses:               8K"},
    {t:"text",v:" number of IPv4 IGMP groups + multicast routes:  0.25K"},
    {t:"text",v:" number of IPv4 unicast routes:                  0"},
    {t:"text",v:" number of IPv6 unicast routes:                  0"},
  ]);return;}
    addL([{t:"error",v:`% Unrecognized command: '${raw}'. Type ? for help.`}]);
  };
// ═══ IPv6 ═══
if(parts[0]==="ipv6"&&parts[1]==="unicast-routing"){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:"IPv6 unicast routing enabled"}]);return;}

if(parts[0]==="ipv6"&&parts[1]==="address"&&parts[2]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`IPv6 address ${parts[2]} assigned to ${currentIface}`}]);return;}

if(parts[0]==="ipv6"&&parts[1]==="enable"){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`IPv6 enabled on ${currentIface}`}]);return;}

if(cmd==="show ipv6 interface brief"||cmd==="sh ipv6 int br"){
  const ifaces=DEVICE_TYPES[device.type]?.interfaces||[];
  addL([{t:"header",v:"Interface              Status   IPv6 Address"}]);
  ifaces.forEach((iface,i)=>{
    addL([{t:i===0?"success":"warn",v:`${iface.replace("GigabitEthernet","Gi").padEnd(23)}up       unassigned`}]);
  });return;}

if(cmd==="show ipv6 route"||cmd==="sh ipv6 ro"){
  addL([
    {t:"header",v:"IPv6 Routing Table - default - 3 entries"},
    {t:"text",v:"Codes: C - Connected, L - Local, S - Static, O - OSPF"},
    {t:"success",v:"C   2001:DB8:1::/64 [0/0] via GigabitEthernet0/0, directly connected"},
    {t:"text",v:"L   2001:DB8:1::1/128 [0/0] via GigabitEthernet0/0, receive"},
    {t:"text",v:"S   ::/0 [1/0] via 2001:DB8::1"},
  ]);return;}

if(parts[0]==="ipv6"&&parts[1]==="route"&&parts[2]&&parts[3]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  addL([{t:"success",v:`IPv6 static route ${parts[2]} via ${parts[3]} configured`}]);return;}

if(parts[0]==="ipv6"&&parts[1]==="ospf"&&parts[2]&&parts[3]==="area"&&parts[4]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`OSPFv3 process ${parts[2]} area ${parts[4]} on ${currentIface}`}]);return;}

// ═══ PPP/WAN ═══
if(parts[0]==="encapsulation"&&parts[1]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`Encapsulation set to ${parts[1].toUpperCase()} on ${currentIface}`}]);return;}

if(parts[0]==="ppp"&&parts[1]==="authentication"&&parts[2]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`PPP authentication ${parts[2].toUpperCase()} enabled on ${currentIface}`}]);return;}

if(parts[0]==="ppp"&&parts[1]==="chap"&&parts[2]==="hostname"&&parts[3]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`PPP CHAP hostname set to ${parts[3]}`}]);return;}

if(parts[0]==="ppp"&&parts[1]==="chap"&&parts[2]==="password"&&parts[3]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`PPP CHAP password configured`}]);return;}

if(parts[0]==="clock"&&parts[1]==="rate"&&parts[2]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`Clock rate set to ${parts[2]} on ${currentIface}`}]);return;}

if(parts[0]==="bandwidth"&&parts[1]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`Bandwidth set to ${parts[1]} Kbps on ${currentIface}`}]);return;}

if(cmd==="show interfaces serial 0/0/0"||cmd==="sh int se 0/0/0"){
  addL([
    {t:"header",v:"Serial0/0/0 is up, line protocol is up"},
    {t:"text",v:"  Hardware is WIC MBRD Serial"},
    {t:"text",v:"  Internet address is 10.0.0.1/30"},
    {t:"success",v:"  Encapsulation PPP, LCP Open"},
    {t:"text",v:"  Open: CDPCP, IPCP"},
    {t:"text",v:"  Last input 00:00:01, output 00:00:01"},
    {t:"text",v:"  BW 1544 Kbit/sec, DLY 20000 usec"},
  ]);return;}

// ═══ GRE TUNNEL ═══
if(parts[0]==="interface"&&parts[1]&&parts[1].toLowerCase().startsWith("tunnel")){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  setCurrentIface(parts[1]);
  setMode("interface");
  addL([{t:"info",v:`Configuring Tunnel interface ${parts[1]}`}]);return;}

if(parts[0]==="tunnel"&&parts[1]==="source"&&parts[2]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`Tunnel source set to ${parts[2]}`}]);return;}

if(parts[0]==="tunnel"&&parts[1]==="destination"&&parts[2]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`Tunnel destination set to ${parts[2]}`}]);return;}

if(parts[0]==="tunnel"&&parts[1]==="mode"&&parts[2]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`Tunnel mode set to ${parts[2]}`}]);return;}

// ═══ HSRP ═══
if(parts[0]==="standby"&&parts[1]&&parts[2]==="ip"&&parts[3]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`HSRP group ${parts[1]} virtual IP ${parts[3]} configured`}]);return;}

if(parts[0]==="standby"&&parts[1]&&parts[2]==="priority"&&parts[3]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`HSRP priority set to ${parts[3]} on group ${parts[1]}`}]);return;}

if(parts[0]==="standby"&&parts[1]&&parts[2]==="preempt"){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`HSRP preempt enabled on group ${parts[1]}`}]);return;}

if(cmd==="show standby"||cmd==="sh standby"){
  addL([
    {t:"header",v:`GigabitEthernet0/0 - Group 1`},
    {t:"success",v:"  State is Active"},
    {t:"text",v:"  Virtual IP address is 192.168.1.254"},
    {t:"text",v:"  Active virtual MAC address is 0000.0c07.ac01"},
    {t:"text",v:"  Local virtual MAC address is 0000.0c07.ac01"},
    {t:"success",v:"  Hello time 3 sec, hold time 10 sec"},
    {t:"text",v:"  Priority 110 (configured 110)"},
    {t:"text",v:"  Preemption enabled"},
  ]);return;}

if(cmd==="show standby brief"||cmd==="sh standby br"){
  addL([
    {t:"header",v:"                     P indicates configured to preempt."},
    {t:"header",v:"Interface   Grp  Pri P State   Active          Standby         Virtual IP"},
    {t:"success",v:"Gi0/0       1    110 P Active  local           192.168.1.2     192.168.1.254"},
  ]);return;}

// ═══ QoS ═══
if(parts[0]==="class-map"&&parts[1]==="match-any"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  setMode("config");
  addL([{t:"info",v:`Class-map '${parts[2]}' created`},{t:"muted",v:`${hostname}(config-cmap)#`}]);return;}

if(parts[0]==="match"&&parts[1]==="protocol"&&parts[2]){
  addL([{t:"success",v:`Matching protocol ${parts[2]}`}]);return;}

if(parts[0]==="match"&&parts[1]==="access-group"&&parts[2]){
  addL([{t:"success",v:`Matching access-group ${parts[2]}`}]);return;}

if(parts[0]==="policy-map"&&parts[1]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  setMode("config");
  addL([{t:"info",v:`Policy-map '${parts[1]}' created`},{t:"muted",v:`${hostname}(config-pmap)#`}]);return;}

if(parts[0]==="class"&&parts[1]){
  addL([{t:"success",v:`Class '${parts[1]}' configured in policy`}]);return;}

if(parts[0]==="bandwidth"&&parts[1]){
  addL([{t:"success",v:`Bandwidth ${parts[1]} ${parts[2]||"kbps"} configured`}]);return;}

if(parts[0]==="priority"&&parts[1]){
  addL([{t:"success",v:`Priority ${parts[1]} kbps configured (LLQ)`}]);return;}

if(parts[0]==="service-policy"&&parts[1]&&parts[2]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`Policy '${parts[2]}' applied ${parts[1]} on ${currentIface}`}]);return;}

if(cmd==="show policy-map"||cmd==="sh policy-map"){
  addL([
    {t:"header",v:"Policy Map TRAFFIC_POLICY"},
    {t:"text",v:"  Class VOICE"},
    {t:"success",v:"    priority 128 (kbps)"},
    {t:"text",v:"  Class DATA"},
    {t:"text",v:"    bandwidth 256 (kbps)"},
    {t:"text",v:"  Class class-default"},
    {t:"text",v:"    fair-queue"},
  ]);return;}

if(cmd==="show class-map"||cmd==="sh class-map"){
  addL([
    {t:"header",v:"Class Map match-any VOICE (id 1)"},
    {t:"success",v:"   Match protocol rtp"},
    {t:"header",v:"Class Map match-any DATA (id 2)"},
    {t:"text",v:"   Match protocol http"},
    {t:"text",v:"   Match protocol ftp"},
  ]);return;}

// ═══ BGP ═══
if(parts[0]==="router"&&parts[1]==="bgp"&&parts[2]){
  if(mode!=="config"){addL([{t:"error",v:"% Must be in config mode."}]);return;}
  setMode("config");
  addL([{t:"info",v:`Entering BGP AS ${parts[2]} configuration...`},{t:"muted",v:`${hostname}(config-router)#`}]);return;}

if(parts[0]==="neighbor"&&parts[1]&&parts[2]==="remote-as"&&parts[3]){
  addL([{t:"success",v:`BGP neighbor ${parts[1]} remote-as ${parts[3]} configured`}]);return;}

if(parts[0]==="neighbor"&&parts[1]&&parts[2]==="update-source"){
  addL([{t:"success",v:`BGP neighbor ${parts[1]} update-source ${parts[3]||""} configured`}]);return;}

if(parts[0]==="neighbor"&&parts[1]&&parts[2]==="next-hop-self"){
  addL([{t:"success",v:`BGP next-hop-self configured for ${parts[1]}`}]);return;}

if(cmd==="show ip bgp summary"||cmd==="sh ip bgp sum"){
  addL([
    {t:"header",v:"BGP router identifier 1.1.1.1, local AS number 65001"},
    {t:"text",v:"BGP table version is 5, main routing table version 5"},
    {t:"muted",v:""},
    {t:"header",v:"Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd"},
    {t:"success",v:"2.2.2.2         4 65002      10      10        5    0    0 00:05:00        2"},
    {t:"text",v:"3.3.3.3         4 65003       8       8        5    0    0 00:04:00        1"},
  ]);return;}

if(cmd==="show ip bgp"||cmd==="sh ip bgp"){
  addL([
    {t:"header",v:"BGP table version is 5, local router ID is 1.1.1.1"},
    {t:"text",v:"Status codes: s suppressed, d damped, h history, * valid, > best"},
    {t:"muted",v:""},
    {t:"header",v:"Network          Next Hop         Metric LocPrf Weight Path"},
    {t:"success",v:"*> 192.168.1.0/24  0.0.0.0               0         32768 i"},
    {t:"text",v:"*> 192.168.2.0/24  2.2.2.2               0    100      0 65002 i"},
  ]);return;}

// ═══ OSPF ADVANCED ═══
if(parts[0]==="area"&&parts[1]&&parts[2]==="authentication"){
  addL([{t:"success",v:`OSPF area ${parts[1]} authentication enabled`}]);return;}

if(parts[0]==="area"&&parts[1]&&parts[2]==="stub"){
  addL([{t:"success",v:`OSPF area ${parts[1]} configured as stub`}]);return;}

if(parts[0]==="area"&&parts[1]&&parts[2]==="nssa"){
  addL([{t:"success",v:`OSPF area ${parts[1]} configured as NSSA`}]);return;}

if(parts[0]==="ip"&&parts[1]==="ospf"&&parts[2]==="authentication-key"&&parts[3]){
  if(mode!=="interface"){addL([{t:"error",v:"% Must be in interface config mode."}]);return;}
  addL([{t:"success",v:`OSPF authentication key configured on ${currentIface}`}]);return;}

if(cmd==="show ip ospf interface"||cmd==="sh ip ospf int"){
  addL([
    {t:"header",v:`GigabitEthernet0/0 is up, line protocol is up`},
    {t:"success",v:"  Internet Address 192.168.1.1/24, Area 0"},
    {t:"text",v:"  Process ID 1, Router ID 192.168.1.1, Network Type BROADCAST"},
    {t:"text",v:"  Cost: 1, Transmit Delay is 1 sec, State DR"},
    {t:"success",v:"  Designated Router (ID) 192.168.1.1"},
    {t:"text",v:"  Timer intervals: Hello 10, Dead 40, Wait 40, Retransmit 5"},
  ]);return;}
  return (
    <div style={{position:"fixed",inset:0,background:"#00000088",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
      <div style={{width:640,height:500,background:"#0f172a",borderRadius:14,display:"flex",flexDirection:"column",boxShadow:"0 24px 60px #00000055",overflow:"hidden"}}>
        <div style={{background:"#1e293b",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",gap:6}}>
              <div style={{width:11,height:11,borderRadius:"50%",background:"#ef4444"}}/>
              <div style={{width:11,height:11,borderRadius:"50%",background:"#f59e0b"}}/>
              <div style={{width:11,height:11,borderRadius:"50%",background:"#10b981"}}/>
            </div>
            <DevIcon type={device.type} size={16} color="#64748b"/>
            <span style={{fontSize:12,color:"#64748b",fontFamily:"monospace"}}>{device.name} ({device.model})</span>
          </div>
          <button onClick={onClose} style={{background:"#334155",border:"none",color:"#94a3b8",width:24,height:24,borderRadius:4,cursor:"pointer",fontSize:14}}>x</button>
        </div>
        <div ref={termRef} style={{flex:1,overflowY:"auto",padding:"14px 18px",fontFamily:"monospace",fontSize:13,lineHeight:1.7,cursor:"text"}} onClick={()=>inputRef.current?.focus()}>
          {lines.map((line,i)=>{
            if(line.t==="prompt-line") return <div key={i}><span style={{color:"#10b981",fontWeight:700}}>{line.prompt} </span><span style={{color:"#f8fafc"}}>{line.cmd}</span></div>;
            return <div key={i} style={{color:lineColors[line.t]||lineColors.text}}>{line.v||"\u00A0"}</div>;
          })}
          <div style={{display:"flex",alignItems:"center"}}>
            <span style={{color:"#10b981",fontWeight:700,marginRight:6}}>{prompt}</span>
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} autoFocus
              style={{background:"transparent",border:"none",outline:"none",color:"#f8fafc",fontFamily:"monospace",fontSize:13,flex:1}}
              spellCheck={false} autoComplete="off"/>
          </div>
        </div>
        <div style={{background:"#1e293b",padding:"5px 16px",fontSize:10,color:"#475569",display:"flex",gap:16}}>
          <span>Up/Down: History</span><span>?: Help</span><span>clear: Clear</span>
        </div>
      </div>
    </div>
  );
};

const ConfigPanel = ({device,onClose,onRename}) => {
  const [action,setAction] = useState("ip");
  const [ip,setIp] = useState("");
  const [mask,setMask] = useState("255.255.255.0");
  const [iface,setIface] = useState(DEVICE_TYPES[device.type]?.interfaces[0]||"");
  const [portAction,setPortAction] = useState("enable");
  const [vlanId,setVlanId] = useState("");
  const [vlanName,setVlanName] = useState("");
  const [newHostname,setNewHostname] = useState("");
  const [routeNet,setRouteNet] = useState("");
  const [routeMask,setRouteMask] = useState("255.255.255.0");
  const [routeGw,setRouteGw] = useState("");
  const [ospfPid,setOspfPid] = useState("1");
const [ospfNet,setOspfNet] = useState("");
const [ospfWild,setOspfWild] = useState("0.0.0.255");
const [ospfArea,setOspfArea] = useState("0");
const [ripVer,setRipVer] = useState("2");
const [ripNet,setRipNet] = useState("");
const [eigrpAs,setEigrpAs] = useState("100");
const [eigrpNet,setEigrpNet] = useState("");
const [eigrpWild,setEigrpWild] = useState("0.0.0.255");
const [dhcpPool,setDhcpPool] = useState("LAN_POOL");
const [dhcpNet,setDhcpNet] = useState("");
const [dhcpMask,setDhcpMask] = useState("255.255.255.0");
const [dhcpGw,setDhcpGw] = useState("");
const [dhcpDns,setDhcpDns] = useState("8.8.8.8");
const [dhcpExcl,setDhcpExcl] = useState("");
const [natType,setNatType] = useState("overload");
const [natInside,setNatInside] = useState("");
const [natOutside,setNatOutside] = useState("");
const [natLocalIp,setNatLocalIp] = useState("");
const [natGlobalIp,setNatGlobalIp] = useState("");
const [natAcl,setNatAcl] = useState("1");
const [aclType,setAclType] = useState("standard");
const [aclNum,setAclNum] = useState("10");
const [aclAction,setAclAction] = useState("permit");
const [aclSrc,setAclSrc] = useState("");
const [aclWild,setAclWild] = useState("0.0.0.255");
const [aclDst,setAclDst] = useState("any");
const [aclProto,setAclProto] = useState("ip");
const [sshDomain,setSshDomain] = useState("");
const [sshUser,setSshUser] = useState("admin");
const [sshPass,setSshPass] = useState("");
const [sshVer,setSshVer] = useState("2");
const [stpMode,setStpMode] = useState("rapid-pvst");
const [stpVlan,setStpVlan] = useState("1");
const [stpRole,setStpRole] = useState("primary");
const [psMax,setPsMax] = useState("2");
const [psViolation,setPsViolation] = useState("shutdown");
const [psMac,setPsMac] = useState("sticky");
const [trunkIface,setTrunkIface] = useState(DEVICE_TYPES[device.type]?.interfaces[0]||"");
const [trunkMode,setTrunkMode] = useState("trunk");
const [trunkVlans,setTrunkVlans] = useState("1,10,20");
const [ecGroup,setEcGroup] = useState("1");
const [ecMode,setEcMode] = useState("active");
const [ecIfaces,setEcIfaces] = useState("");
const [ivVlan,setIvVlan] = useState("10");
const [ivIp,setIvIp] = useState("");
const [ivMask,setIvMask] = useState("255.255.255.0");
const [vtpMode,setVtpMode] = useState("server");
const [vtpDomain,setVtpDomain] = useState("");
const [vtpPass,setVtpPass] = useState("");
const [ntpServer,setNtpServer] = useState("");
const [snmpCommunity,setSnmpCommunity] = useState("public");
const [snmpMode,setSnmpMode] = useState("RO");
const [bannerMsg,setBannerMsg] = useState("");
const [enableSecret,setEnableSecret] = useState("");
const [consolePass,setConsolePass] = useState("");
const [vtyPass,setVtyPass] = useState("");
const [ipv6Addr,setIpv6Addr] = useState("");
const [ipv6Iface,setIpv6Iface] = useState(DEVICE_TYPES[device.type]?.interfaces[0]||"");
const [pppIface,setPppIface] = useState("Serial0/0/0");
const [pppAuth,setPppAuth] = useState("chap");
const [pppUser,setPppUser] = useState("");
const [pppPass,setPppPass] = useState("");
const [greLocal,setGreLocal] = useState("");
const [greRemote,setGreRemote] = useState("");
const [greTunnel,setGreTunnel] = useState("0");
const [greTunnelIp,setGreTunnelIp] = useState("");
const [hsrpGroup,setHsrpGroup] = useState("1");
const [hsrpVip,setHsrpVip] = useState("");
const [hsrpPriority,setHsrpPriority] = useState("110");
const [hsrpIface,setHsrpIface] = useState(DEVICE_TYPES[device.type]?.interfaces[0]||"");
const [qosClass,setQosClass] = useState("");
const [qosPolicy,setQosPolicy] = useState("");
const [qosBw,setQosBw] = useState("512");
const [bgpAs,setBgpAs] = useState("");
const [bgpNeighbor,setBgpNeighbor] = useState("");
const [bgpRemoteAs,setBgpRemoteAs] = useState("");
const [bgpNetwork,setBgpNetwork] = useState("");
const [aaaMode,setAaaMode] = useState("local");
const [tacacsHost,setTacacsHost] = useState("");
const [tacacsKey,setTacacsKey] = useState("");
const [loggingHost,setLoggingHost] = useState("");
const [expanded,setExpanded] = useState(false);
const [termLines,setTermLines] = useState([
    {t:"info",v:`Device: ${device.name} (${device.model})`},
    {t:"muted",v:"Ready for configuration."},
    {t:"muted",v:""},
  ]);

  const info = DEVICE_TYPES[device.type];
  const ifaceOptions = (DEVICE_TYPES[device.type]?.interfaces||[]).map(i=>({value:i,label:i.replace("GigabitEthernet","Gi").replace("FastEthernet","Fa")}));

  const addCmd = (cmds,outputs) => {
    const cmdLines = cmds.map(c=>({t:"prompt-line",prompt:`${device.name}#`,cmd:c}));
    const outLines = (outputs||[]).map(o=>({t:o.t||"success",v:o.v}));
    setTermLines(p=>[...p,...cmdLines,...outLines,{t:"muted",v:""}]);
  };

 const allActions = [
    {id:"ip",label:"IP",types:["switch","router","firewall","pc","server"],icon:<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>},
    {id:"port",label:"Port",types:["switch","firewall","server"],icon:<><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></>},
    {id:"vlan",label:"VLAN",types:["switch"],icon:<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/></>},
    {id:"trunk",label:"Trunk",types:["switch"],icon:<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>},
    {id:"intervlan",label:"InterVLAN",types:["switch"],icon:<><polygon points="12 2 2 7 12 12 22 7 12 2"/><line x1="12" y1="22" x2="12" y2="12"/></>},
    {id:"etherchannel",label:"EtherCh",types:["switch"],icon:<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>},
    {id:"hostname",label:"Name",types:["switch","router","firewall","server"],icon:<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>},
    {id:"route",label:"Route",types:["router","firewall"],icon:<><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>},
    {id:"ospf",label:"OSPF",types:["router"],icon:<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>},
    {id:"rip",label:"RIP",types:["router"],icon:<><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>},
    {id:"eigrp",label:"EIGRP",types:["router"],icon:<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>},
    {id:"dhcp",label:"DHCP",types:["router","server"],icon:<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>},
    {id:"nat",label:"NAT",types:["router","firewall"],icon:<><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></>},
    {id:"acl",label:"ACL",types:["router","firewall","switch"],icon:<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>},
    {id:"ssh",label:"SSH",types:["switch","router","firewall","server"],icon:<><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></>},
    {id:"ntp",label:"NTP",types:["router","switch"],icon:<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>},
    {id:"snmp",label:"SNMP",types:["router","switch"],icon:<><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>},
    {id:"banner",label:"Banner",types:["router","switch","firewall"],icon:<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>},
    {id:"password",label:"Password",types:["router","switch","firewall"],icon:<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></>},
    {id:"aaa",label:"AAA",types:["router","switch","firewall"],icon:<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></>},
    {id:"cdp",label:"CDP",types:["router","switch"],icon:<><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></>},
    {id:"lldp",label:"LLDP",types:["router","switch"],icon:<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="7" y1="8" x2="7" y2="13"/><line x1="12" y1="6" x2="12" y2="13"/><line x1="17" y1="10" x2="17" y2="13"/></>},
    {id:"tacacs",label:"TACACS",types:["router","switch","firewall"],icon:<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>},
    {id:"logging",label:"Logging",types:["router","switch"],icon:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></>},
    {id:"ipv6",label:"IPv6",types:["router"],icon:<><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>},
    {id:"ppp",label:"PPP/WAN",types:["router"],icon:<><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>},
    {id:"gre",label:"GRE",types:["router"],icon:<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>},
    {id:"hsrp",label:"HSRP",types:["router"],icon:<><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></>},
    {id:"qos",label:"QoS",types:["router"],icon:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>},
    {id:"bgp",label:"BGP",types:["router"],icon:<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>},
    {id:"vtp",label:"VTP",types:["switch"],icon:<><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="8" y="14" width="8" height="8" rx="1"/><line x1="6" y1="10" x2="6" y2="14"/><line x1="18" y1="10" x2="18" y2="14"/><line x1="6" y1="14" x2="18" y2="14"/></>},
    {id:"stp",label:"STP",types:["switch"],icon:<><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>},
    {id:"portsec",label:"PortSec",types:["switch"],icon:<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="12" y1="15" x2="12" y2="17"/></>},
    {id:"save",label:"Save",types:["switch","router","firewall","pc","server"],icon:<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></>},
    {id:"show",label:"Show",types:["switch","router","firewall","pc","server"],icon:<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>},
  ];
 
  const actions = allActions.filter(a=>a.types.includes(device.type));

  const apply = () => {
    if(action==="ip"){
      if(!ip) return;
      addCmd(["configure terminal",`interface ${iface}`,`ip address ${ip} ${mask}`,"no shutdown","end"],[{t:"success",v:`IP ${ip} ${mask} assigned to ${iface.replace("GigabitEthernet","Gi")}`}]);
    } else if(action==="port"){
      const cmd=portAction==="enable"?"no shutdown":"shutdown";
      addCmd(["configure terminal",`interface ${iface}`,cmd,"end"],[{t:portAction==="enable"?"success":"warn",v:`Interface ${iface.replace("GigabitEthernet","Gi")} ${portAction==="enable"?"enabled (UP)":"disabled (DOWN)"}`}]);
    } else if(action==="vlan"){
      if(!vlanId) return;
      addCmd(["configure terminal",`vlan ${vlanId}`,vlanName?`name ${vlanName}`:"exit",`interface ${iface}`,"switchport mode access",`switchport access vlan ${vlanId}`,"end"].filter(Boolean),[{t:"success",v:`VLAN ${vlanId}${vlanName?" ("+vlanName+")":""} assigned to ${iface.replace("GigabitEthernet","Gi")}`}]);
    } else if(action==="hostname"){
      if(!newHostname) return;
      addCmd(["configure terminal",`hostname ${newHostname}`,"end"],[{t:"success",v:`Hostname changed to ${newHostname}`}]);
      onRename && onRename(device.id,newHostname);
    } else if(action==="route"){
      if(!routeNet||!routeGw) return;
      addCmd(["configure terminal",`ip route ${routeNet} ${routeMask} ${routeGw}`,"end"],[{t:"success",v:`Route: ${routeNet} via ${routeGw} added`}]);
    } else if(action==="save"){
      addCmd(["write memory"],[{t:"success",v:"[OK] Configuration saved to NVRAM"}]);
    } else if(action==="show"){
      const ifaces=DEVICE_TYPES[device.type]?.interfaces||[];
      addCmd(["show ip interface brief"],[
        {t:"header",v:"Interface              IP-Address      OK? Method Status"},
        ...ifaces.map((f,i)=>({t:i===0?"success":"warn",v:`${f.replace("GigabitEthernet","Gi").replace("FastEthernet","Fa").padEnd(23)}${"unassigned".padEnd(16)}NO  unset  down`}))
      ]);
    } else if(action==="ospf"){
  if(!ospfNet) return;
  addCmd(["configure terminal",`router ospf ${ospfPid}`,`network ${ospfNet} ${ospfWild} area ${ospfArea}`,"end"],[{t:"success",v:`OSPF process ${ospfPid} — Network ${ospfNet} area ${ospfArea} configured`}]);
} else if(action==="rip"){
  if(!ripNet) return;
  addCmd(["configure terminal","router rip",`version ${ripVer}`,"no auto-summary",`network ${ripNet}`,"end"],[{t:"success",v:`RIP v${ripVer} — Network ${ripNet} configured`}]);
} else if(action==="eigrp"){
  if(!eigrpNet) return;
  addCmd(["configure terminal",`router eigrp ${eigrpAs}`,`network ${eigrpNet} ${eigrpWild}`,"no auto-summary","end"],[{t:"success",v:`EIGRP AS${eigrpAs} — Network ${eigrpNet} configured`}]);
} else if(action==="dhcp"){
  if(!dhcpNet||!dhcpPool) return;
  const cmds=["configure terminal"];
  if(dhcpExcl) cmds.push(`ip dhcp excluded-address ${dhcpExcl}`);
  cmds.push(`ip dhcp pool ${dhcpPool}`,`network ${dhcpNet} ${dhcpMask}`);
  if(dhcpGw) cmds.push(`default-router ${dhcpGw}`);
  if(dhcpDns) cmds.push(`dns-server ${dhcpDns}`);
  cmds.push("end");
  addCmd(cmds,[{t:"success",v:`DHCP pool '${dhcpPool}' configured for ${dhcpNet}`}]);
} else if(action==="nat"){
  if(!natInside||!natOutside) return;
  const cmds=["configure terminal",`interface ${natInside}`,"ip nat inside","exit",`interface ${natOutside}`,"ip nat outside","exit"];
  if(natType==="static") cmds.push(`ip nat inside source static ${natLocalIp} ${natGlobalIp}`);
  else if(natType==="overload") cmds.push(`ip nat inside source list ${natAcl} interface ${natOutside} overload`);
  else cmds.push(`ip nat inside source list ${natAcl} pool NAT_POOL`);
  cmds.push("end");
  addCmd(cmds,[{t:"success",v:`NAT ${natType} configured`}]);
} else if(action==="acl"){
  if(!aclSrc) return;
  let cmd="";
  if(aclType==="standard") cmd=`access-list ${aclNum} ${aclAction} ${aclSrc} ${aclWild}`;
  else cmd=`access-list ${aclNum} ${aclAction} ${aclProto} ${aclSrc} ${aclWild} ${aclDst}`;
  addCmd(["configure terminal",cmd,"end"],[{t:aclAction==="permit"?"success":"warn",v:`ACL ${aclNum} — ${aclAction} ${aclSrc} configured`}]);
} else if(action==="ssh"){
  if(!sshDomain||!sshUser) return;
  addCmd(["configure terminal",`ip domain-name ${sshDomain}`,`username ${sshUser} privilege 15 secret ${sshPass}`,"crypto key generate rsa",`ip ssh version ${sshVer}`,"line vty 0 4","transport input ssh","login local","end"],[{t:"success",v:`SSH v${sshVer} configured — User: ${sshUser}`}]);
} else if(action==="stp"){
  addCmd(["configure terminal",`spanning-tree mode ${stpMode}`,`spanning-tree vlan ${stpVlan} root ${stpRole}`,"end"],[{t:"success",v:`STP ${stpMode} — VLAN ${stpVlan} root ${stpRole}`}]);
} else if(action==="portsec"){
  addCmd(["configure terminal",`interface ${iface}`,"switchport mode access","switchport port-security",`switchport port-security maximum ${psMax}`,`switchport port-security violation ${psViolation}`,`switchport port-security mac-address ${psMac}`,"end"],[{t:"success",v:`Port Security on ${iface} — max ${psMax} MACs, violation: ${psViolation}`}]);
} else if(action==="ntp"){
  if(!ntpServer) return;
  addCmd(["configure terminal",`ntp server ${ntpServer}`,"end"],[{t:"success",v:`NTP server ${ntpServer} configured`}]);
} else if(action==="snmp"){
  addCmd(["configure terminal",`snmp-server community ${snmpCommunity} ${snmpMode}`,"end"],[{t:"success",v:`SNMP community '${snmpCommunity}' ${snmpMode} configured`}]);
} else if(action==="banner"){
  if(!bannerMsg) return;
  addCmd(["configure terminal",`banner motd # ${bannerMsg} #`,"end"],[{t:"success",v:`Banner MOTD configured`}]);
} else if(action==="password"){
  const cmds=["configure terminal"];
  if(enableSecret) cmds.push(`enable secret ${enableSecret}`);
  cmds.push("service password-encryption");
  if(consolePass) cmds.push("line console 0",`password ${consolePass}`,"login","exit");
  if(vtyPass) cmds.push("line vty 0 4",`password ${vtyPass}`,"login","exit");
  cmds.push("end");
  addCmd(cmds,[{t:"success",v:`Passwords configured and encryption enabled`}]);
} else if(action==="ipv6"){
  if(!ipv6Addr) return;
  addCmd(["configure terminal","ipv6 unicast-routing",`interface ${ipv6Iface}`,`ipv6 address ${ipv6Addr}`,"ipv6 enable","no shutdown","end"],[{t:"success",v:`IPv6 ${ipv6Addr} assigned to ${ipv6Iface}`}]);
} else if(action==="ppp"){
  addCmd(["configure terminal",`interface ${pppIface}`,`encapsulation ppp`,`ppp authentication ${pppAuth}`,`ppp chap hostname ${pppUser}`,`ppp chap password ${pppPass}`,"no shutdown","end"],[{t:"success",v:`PPP ${pppAuth.toUpperCase()} configured on ${pppIface}`}]);
} else if(action==="gre"){
  if(!greLocal||!greRemote) return;
  addCmd(["configure terminal",`interface Tunnel${greTunnel}`,`ip address ${greTunnelIp.replace("/"," ").replace(/\/\d+/,"")} 255.255.255.252`,`tunnel source ${greLocal}`,`tunnel destination ${greRemote}`,"tunnel mode gre ip","no shutdown","end"],[{t:"success",v:`GRE Tunnel${greTunnel} configured: ${greLocal} → ${greRemote}`}]);
} else if(action==="hsrp"){
  if(!hsrpVip) return;
  addCmd(["configure terminal",`interface ${hsrpIface}`,`standby ${hsrpGroup} ip ${hsrpVip}`,`standby ${hsrpGroup} priority ${hsrpPriority}`,`standby ${hsrpGroup} preempt`,"end"],[{t:"success",v:`HSRP group ${hsrpGroup} VIP ${hsrpVip} priority ${hsrpPriority}`}]);
} else if(action==="qos"){
  if(!qosClass||!qosPolicy) return;
  addCmd(["configure terminal",`class-map match-any ${qosClass}`,`match protocol ip`,"exit",`policy-map ${qosPolicy}`,`class ${qosClass}`,`bandwidth ${qosBw}`,"exit","exit",`interface ${iface}`,`service-policy output ${qosPolicy}`,"end"],[{t:"success",v:`QoS policy '${qosPolicy}' applied on ${iface}`}]);
} else if(action==="bgp"){
  if(!bgpAs||!bgpNeighbor) return;
  addCmd(["configure terminal",`router bgp ${bgpAs}`,`neighbor ${bgpNeighbor} remote-as ${bgpRemoteAs}`,bgpNetwork?`network ${bgpNetwork} mask 255.255.255.0`:"","end"].filter(Boolean),[{t:"success",v:`BGP AS${bgpAs} — neighbor ${bgpNeighbor} AS${bgpRemoteAs} configured`}]);
} else if(action==="aaa"){
  addCmd(["configure terminal","aaa new-model",`aaa authentication login default ${aaaMode}`,"aaa authorization exec default local","end"],[{t:"success",v:`AAA configured — authentication: ${aaaMode}`}]);
} else if(action==="cdp"){
  addCmd(["configure terminal","cdp run","end"],[{t:"success",v:"CDP enabled globally"}]);
} else if(action==="lldp"){
  addCmd(["configure terminal","lldp run","end"],[{t:"success",v:"LLDP enabled globally"}]);
} else if(action==="tacacs"){
  if(!tacacsHost) return;
  addCmd(["configure terminal",`tacacs-server host ${tacacsHost}`,`tacacs-server key ${tacacsKey}`,"aaa new-model","aaa authentication login default group tacacs+ local","end"],[{t:"success",v:`TACACS+ server ${tacacsHost} configured`}]);
} else if(action==="logging"){
  if(!loggingHost) return;
  addCmd(["configure terminal",`logging host ${loggingHost}`,`logging trap ${loggingLevel}`,"logging on","end"],[{t:"success",v:`Syslog server ${loggingHost} — level: ${loggingLevel}`}]);
}
  };

  return (
    <div style={{position:"fixed",inset:0,background:"#00000088",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
      <div style={{width:"80vw",height:"80vh",minWidth:600,minHeight:400,background:"#fff",borderRadius:16,display:"flex",overflow:"hidden",boxShadow:"0 24px 60px #00000030",resize:"both"}}>
        <div style={{width:300,borderRight:"1px solid #e5e7eb",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"16px",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,background:info.bg,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <DevIcon type={device.type} size={20}/>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#111827"}}>{device.name}</div>
              <div style={{fontSize:10,color:"#9ca3af"}}>{device.model}</div>
            </div>
            <button onClick={onClose} style={{marginLeft:"auto",background:"#f3f4f6",border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",fontSize:14,color:"#6b7280"}}>x</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3,padding:"8px",maxHeight:180,overflowY:"auto"}}>
            {actions.map(a=>(
              <button key={a.id} onClick={()=>setAction(a.id)} style={{background:action===a.id?info.color:"#f8fafc",border:`1px solid ${action===a.id?info.color:"#e5e7eb"}`,borderRadius:8,padding:"8px 4px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={action===a.id?"#fff":info.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{a.icon}</svg>
                <span style={{fontSize:9,fontWeight:700,color:action===a.id?"#fff":info.color}}>{a.label}</span>
              </button>
            ))}
          </div>
          <div style={{flex:1,padding:"10px 14px",overflowY:"auto"}}>
            {action==="ip" && <><Sel label="Interface" value={iface} onChange={setIface} options={ifaceOptions}/><Field label="IP Address" value={ip} onChange={setIp} placeholder="192.168.1.1"/><Field label="Subnet Mask" value={mask} onChange={setMask} placeholder="255.255.255.0"/></>}
            {action==="port" && <><Sel label="Interface" value={iface} onChange={setIface} options={ifaceOptions}/><Sel label="Action" value={portAction} onChange={setPortAction} options={[{value:"enable",label:"Enable (no shutdown)"},{value:"disable",label:"Disable (shutdown)"}]}/></>}
            {action==="vlan" && <><Field label="VLAN ID" value={vlanId} onChange={setVlanId} placeholder="e.g. 10"/><Field label="VLAN Name" value={vlanName} onChange={setVlanName} placeholder="e.g. Management"/><Sel label="Interface" value={iface} onChange={setIface} options={ifaceOptions}/></>}
            {action==="hostname" && <Field label="New Hostname" value={newHostname} onChange={setNewHostname} placeholder="e.g. CoreSwitch"/>}
            {action==="route" && <><Field label="Network" value={routeNet} onChange={setRouteNet} placeholder="192.168.2.0"/><Field label="Mask" value={routeMask} onChange={setRouteMask} placeholder="255.255.255.0"/><Field label="Next Hop" value={routeGw} onChange={setRouteGw} placeholder="192.168.1.254"/></>}
            
            {action==="save" && <div style={{fontSize:12,color:"#6b7280",lineHeight:1.6}}>Save running-config to NVRAM.</div>}
{action==="show" && <div style={{fontSize:12,color:"#6b7280",lineHeight:1.6}}>Show interface status.</div>}
{action==="ospf" && <>
  <Field label="Process ID" value={ospfPid} onChange={setOspfPid} placeholder="1"/>
  <Field label="Network" value={ospfNet} onChange={setOspfNet} placeholder="192.168.1.0"/>
  <Field label="Wildcard" value={ospfWild} onChange={setOspfWild} placeholder="0.0.0.255"/>
  <Field label="Area" value={ospfArea} onChange={setOspfArea} placeholder="0"/>
</>}
{action==="rip" && <>
  <Sel label="Version" value={ripVer} onChange={setRipVer} options={[{value:"2",label:"RIP v2"},{value:"1",label:"RIP v1"}]}/>
  <Field label="Network" value={ripNet} onChange={setRipNet} placeholder="192.168.1.0"/>
</>}
{action==="eigrp" && <>
  <Field label="AS Number" value={eigrpAs} onChange={setEigrpAs} placeholder="100"/>
  <Field label="Network" value={eigrpNet} onChange={setEigrpNet} placeholder="192.168.1.0"/>
  <Field label="Wildcard" value={eigrpWild} onChange={setEigrpWild} placeholder="0.0.0.255"/>
</>}
{action==="dhcp" && <>
  <Field label="Pool Name" value={dhcpPool} onChange={setDhcpPool} placeholder="LAN_POOL"/>
  <Field label="Network" value={dhcpNet} onChange={setDhcpNet} placeholder="192.168.1.0"/>
  <Field label="Mask" value={dhcpMask} onChange={setDhcpMask} placeholder="255.255.255.0"/>
  <Field label="Default Gateway" value={dhcpGw} onChange={setDhcpGw} placeholder="192.168.1.1"/>
  <Field label="DNS Server" value={dhcpDns} onChange={setDhcpDns} placeholder="8.8.8.8"/>
  <Field label="Excluded IPs" value={dhcpExcl} onChange={setDhcpExcl} placeholder="192.168.1.1 192.168.1.10"/>
</>}
{action==="nat" && <>
  <Sel label="NAT Type" value={natType} onChange={setNatType} options={[{value:"overload",label:"PAT (Overload)"},{value:"static",label:"Static NAT"},{value:"dynamic",label:"Dynamic NAT"}]}/>
  <Field label="Inside Interface" value={natInside} onChange={setNatInside} placeholder="GigabitEthernet0/0"/>
  <Field label="Outside Interface" value={natOutside} onChange={setNatOutside} placeholder="GigabitEthernet0/1"/>
  {natType==="static"&&<Field label="Inside Local IP" value={natLocalIp} onChange={setNatLocalIp} placeholder="192.168.1.10"/>}
  {natType==="static"&&<Field label="Inside Global IP" value={natGlobalIp} onChange={setNatGlobalIp} placeholder="203.0.113.1"/>}
  {natType!=="static"&&<Field label="ACL Number" value={natAcl} onChange={setNatAcl} placeholder="1"/>}
</>}
{action==="acl" && <>
  <Sel label="ACL Type" value={aclType} onChange={setAclType} options={[{value:"standard",label:"Standard (1-99)"},{value:"extended",label:"Extended (100-199)"}]}/>
  <Field label="ACL Number" value={aclNum} onChange={setAclNum} placeholder={aclType==="standard"?"10":"100"}/>
  <Sel label="Action" value={aclAction} onChange={setAclAction} options={[{value:"permit",label:"Permit"},{value:"deny",label:"Deny"}]}/>
  <Field label="Source IP" value={aclSrc} onChange={setAclSrc} placeholder="192.168.1.0"/>
  <Field label="Wildcard" value={aclWild} onChange={setAclWild} placeholder="0.0.0.255"/>
  {aclType==="extended"&&<Field label="Destination IP" value={aclDst} onChange={setAclDst} placeholder="any"/>}
  {aclType==="extended"&&<Sel label="Protocol" value={aclProto} onChange={setAclProto} options={[{value:"ip",label:"IP"},{value:"tcp",label:"TCP"},{value:"udp",label:"UDP"},{value:"icmp",label:"ICMP"}]}/>}
</>}
{action==="ssh" && <>
  <Field label="Domain Name" value={sshDomain} onChange={setSshDomain} placeholder="ccna.lab"/>
  <Field label="Username" value={sshUser} onChange={setSshUser} placeholder="admin"/>
  <Field label="Password" value={sshPass} onChange={setSshPass} placeholder="cisco123"/>
  <Sel label="SSH Version" value={sshVer} onChange={setSshVer} options={[{value:"2",label:"SSH v2"},{value:"1",label:"SSH v1"}]}/>
</>}
{action==="stp" && <>
  <Sel label="Mode" value={stpMode} onChange={setStpMode} options={[{value:"rapid-pvst",label:"Rapid PVST+"},{value:"pvst",label:"PVST"},{value:"mst",label:"MST"}]}/>
  <Field label="VLAN" value={stpVlan} onChange={setStpVlan} placeholder="1"/>
  <Sel label="Role" value={stpRole} onChange={setStpRole} options={[{value:"primary",label:"Root Primary"},{value:"secondary",label:"Root Secondary"}]}/>
</>}
{action==="portsec" && <>
  <Sel label="Interface" value={iface} onChange={setIface} options={ifaceOptions}/>
  <Field label="Max MACs" value={psMax} onChange={setPsMax} placeholder="2"/>
  <Sel label="Violation" value={psViolation} onChange={setPsViolation} options={[{value:"shutdown",label:"Shutdown"},{value:"restrict",label:"Restrict"},{value:"protect",label:"Protect"}]}/>
  <Sel label="MAC Learning" value={psMac} onChange={setPsMac} options={[{value:"sticky",label:"Sticky"},{value:"static",label:"Static"}]}/>
</>}
{action==="trunk" && <>
  <Sel label="Interface" value={trunkIface} onChange={setTrunkIface} options={ifaceOptions}/>
  <Sel label="Mode" value={trunkMode} onChange={setTrunkMode} options={[{value:"trunk",label:"Trunk"},{value:"access",label:"Access"},{value:"dynamic auto",label:"Dynamic Auto"},{value:"dynamic desirable",label:"Dynamic Desirable"}]}/>
  <Field label="Allowed VLANs" value={trunkVlans} onChange={setTrunkVlans} placeholder="1,10,20"/>
</>}
{action==="etherchannel" && <>
  <Field label="Group Number" value={ecGroup} onChange={setEcGroup} placeholder="1"/>
  <Sel label="Protocol" value={ecMode} onChange={setEcMode} options={[{value:"active",label:"LACP Active"},{value:"passive",label:"LACP Passive"},{value:"desirable",label:"PAgP Desirable"},{value:"auto",label:"PAgP Auto"},{value:"on",label:"On (Static)"}]}/>
  <Field label="Interfaces" value={ecIfaces} onChange={setEcIfaces} placeholder="GigabitEthernet0/0"/>
</>}
{action==="intervlan" && <>
  <Field label="VLAN ID" value={ivVlan} onChange={setIvVlan} placeholder="10"/>
  <Field label="IP Address" value={ivIp} onChange={setIvIp} placeholder="192.168.10.1"/>
  <Field label="Subnet Mask" value={ivMask} onChange={setIvMask} placeholder="255.255.255.0"/>
</>}
{action==="vtp" && <>
  <Sel label="VTP Mode" value={vtpMode} onChange={setVtpMode} options={[{value:"server",label:"Server"},{value:"client",label:"Client"},{value:"transparent",label:"Transparent"}]}/>
  <Field label="Domain Name" value={vtpDomain} onChange={setVtpDomain} placeholder="CCNA_LAB"/>
  <Field label="Password" value={vtpPass} onChange={setVtpPass} placeholder="cisco123"/>
</>}
{action==="ntp" && <>
  <Field label="NTP Server IP" value={ntpServer} onChange={setNtpServer} placeholder="216.239.35.0"/>
</>}
{action==="snmp" && <>
  <Field label="Community String" value={snmpCommunity} onChange={setSnmpCommunity} placeholder="public"/>
  <Sel label="Permission" value={snmpMode} onChange={setSnmpMode} options={[{value:"RO",label:"Read Only (RO)"},{value:"RW",label:"Read Write (RW)"}]}/>
</>}
{action==="banner" && <>
  <div style={{marginBottom:12}}>
    <div style={{fontSize:11,fontWeight:600,color:"#374151",marginBottom:4}}>Banner Message</div>
    <textarea value={bannerMsg} onChange={e=>setBannerMsg(e.target.value)} placeholder="Authorized Access Only!"
      style={{width:"100%",padding:"8px 10px",border:"1px solid #e5e7eb",borderRadius:6,fontSize:12,outline:"none",fontFamily:"monospace",boxSizing:"border-box",background:"#f9fafb",resize:"vertical",minHeight:80}}/>
  </div>
</>}
{action==="password" && <>
{action==="ipv6" && <>
  <Sel label="Interface" value={ipv6Iface} onChange={setIpv6Iface} options={ifaceOptions}/>
  <Field label="IPv6 Address/Prefix" value={ipv6Addr} onChange={setIpv6Addr} placeholder="2001:DB8:1::1/64"/>
</>}
{action==="ppp" && <>
  <Field label="Serial Interface" value={pppIface} onChange={setPppIface} placeholder="Serial0/0/0"/>
  <Sel label="Authentication" value={pppAuth} onChange={setPppAuth} options={[{value:"chap",label:"CHAP"},{value:"pap",label:"PAP"}]}/>
  <Field label="Hostname/Username" value={pppUser} onChange={setPppUser} placeholder="Router1"/>
  <Field label="Password" value={pppPass} onChange={setPppPass} placeholder="cisco123"/>
</>}
{action==="gre" && <>
  <Field label="Tunnel Number" value={greTunnel} onChange={setGreTunnel} placeholder="0"/>
  <Field label="Tunnel IP/Mask" value={greTunnelIp} onChange={setGreTunnelIp} placeholder="172.16.0.1/30"/>
  <Field label="Source IP" value={greLocal} onChange={setGreLocal} placeholder="203.0.113.1"/>
  <Field label="Destination IP" value={greRemote} onChange={setGreRemote} placeholder="203.0.113.2"/>
</>}
{action==="hsrp" && <>
  <Sel label="Interface" value={hsrpIface} onChange={setHsrpIface} options={ifaceOptions}/>
  <Field label="Group Number" value={hsrpGroup} onChange={setHsrpGroup} placeholder="1"/>
  <Field label="Virtual IP" value={hsrpVip} onChange={setHsrpVip} placeholder="192.168.1.254"/>
  <Field label="Priority" value={hsrpPriority} onChange={setHsrpPriority} placeholder="110"/>
</>}
{action==="qos" && <>
  <Field label="Class Map Name" value={qosClass} onChange={setQosClass} placeholder="VOICE"/>
  <Field label="Policy Map Name" value={qosPolicy} onChange={setQosPolicy} placeholder="TRAFFIC_POLICY"/>
  <Field label="Bandwidth (kbps)" value={qosBw} onChange={setQosBw} placeholder="512"/>
  <Sel label="Interface" value={iface} onChange={setIface} options={ifaceOptions}/>
</>}
{action==="bgp" && <>
{action==="aaa" && <>
  <Sel label="Authentication" value={aaaMode} onChange={setAaaMode} options={[{value:"local",label:"Local"},{value:"tacacs+",label:"TACACS+"},{value:"radius",label:"RADIUS"}]}/>
  <div style={{fontSize:11,color:"#6b7280",lineHeight:1.6}}>Enables AAA and sets authentication method.</div>
</>}
{action==="cdp" && <>
  <div style={{fontSize:11,color:"#6b7280",lineHeight:1.6}}>Enable/Disable Cisco Discovery Protocol globally and per interface.</div>
</>}
{action==="lldp" && <>
  <div style={{fontSize:11,color:"#6b7280",lineHeight:1.6}}>Enable/Disable Link Layer Discovery Protocol globally.</div>
</>}
{action==="tacacs" && <>
  <Field label="TACACS+ Server IP" value={tacacsHost} onChange={setTacacsHost} placeholder="192.168.1.100"/>
  <Field label="Secret Key" value={tacacsKey} onChange={setTacacsKey} placeholder="cisco123"/>
</>}
{action==="logging" && <>
  <Field label="Syslog Server IP" value={loggingHost} onChange={setLoggingHost} placeholder="192.168.1.100"/>
  <Sel label="Trap Level" value={loggingLevel} onChange={setLoggingLevel} options={[{value:"emergencies",label:"0 - Emergencies"},{value:"alerts",label:"1 - Alerts"},{value:"critical",label:"2 - Critical"},{value:"errors",label:"3 - Errors"},{value:"warnings",label:"4 - Warnings"},{value:"notifications",label:"5 - Notifications"},{value:"informational",label:"6 - Informational"},{value:"debugging",label:"7 - Debugging"}]}/>
</>}
  <Field label="Local AS Number" value={bgpAs} onChange={setBgpAs} placeholder="65001"/>
  <Field label="Neighbor IP" value={bgpNeighbor} onChange={setBgpNeighbor} placeholder="2.2.2.2"/>
  <Field label="Remote AS" value={bgpRemoteAs} onChange={setBgpRemoteAs} placeholder="65002"/>
  <Field label="Network to Advertise" value={bgpNetwork} onChange={setBgpNetwork} placeholder="192.168.1.0"/>
</>}
  <Field label="Enable Secret" value={enableSecret} onChange={setEnableSecret} placeholder="cisco123"/>
  <Field label="Console Password" value={consolePass} onChange={setConsolePass} placeholder="cisco"/>
  <Field label="VTY Password" value={vtyPass} onChange={setVtyPass} placeholder="cisco"/>
</>}
          </div>
          <div style={{padding:"12px 14px",borderTop:"1px solid #e5e7eb"}}>
            <button onClick={apply} style={{width:"100%",background:info.color,border:"none",color:"#fff",padding:"10px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700}}>Apply</button>
          </div>
        </div>
        <div style={{flex:1,background:"#0f172a",display:"flex",flexDirection:"column"}}>
          <div style={{background:"#1e293b",padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",gap:6}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:"#ef4444"}}/>
              <div style={{width:10,height:10,borderRadius:"50%",background:"#f59e0b"}}/>
              <div style={{width:10,height:10,borderRadius:"50%",background:"#10b981"}}/>
            </div>
            <span style={{fontSize:11,color:"#64748b",fontFamily:"monospace"}}>Terminal — {device.name}</span>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"14px 18px",fontFamily:"monospace",fontSize:12,lineHeight:1.8}}>
            {termLines.map((line,i)=>{
              if(line.t==="prompt-line") return <div key={i}><span style={{color:"#10b981",fontWeight:700}}>{line.prompt} </span><span style={{color:"#f8fafc"}}>{line.cmd}</span></div>;
              return <div key={i} style={{color:lineColors[line.t]||lineColors.text}}>{line.v||"\u00A0"}</div>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Topology = ({onSelectDevice,selectedDeviceId,devices,setDevices,links,setLinks,onConfigDevice}) => {
  const [dragging,setDragging] = useState(null);
  const [panStart,setPanStart] = useState(null);
  const [offset,setOffset] = useState({x:0,y:0});
  const [tool,setTool] = useState("select");
  const [linking,setLinking] = useState(null);
  const [termDevice,setTermDevice] = useState(null);
  const [selected,setSelected] = useState(null);
  const [openDropdown,setOpenDropdown] = useState(null);
  const canvasRef = useRef(null);
  const counter = useRef(20);

  const getCenter = d=>({x:d.x+40,y:d.y+40});

  const handleMouseDown = (e,dev) => {
    e.stopPropagation();
    if(tool==="link"){
      if(!linking) setLinking(dev.id);
      else if(linking!==dev.id){
        const exists=links.find(l=>(l.from===linking&&l.to===dev.id)||(l.from===dev.id&&l.to===linking));
        if(!exists){
  const fromDev=devices.find(d=>d.id===linking);
  const toDev=dev;
  const fromIfaces=DEVICE_TYPES[fromDev?.type]?.interfaces||[];
  const toIfaces=DEVICE_TYPES[toDev?.type]?.interfaces||[];
  const usedFrom=links.filter(l=>l.from===linking||l.to===linking).length;
  const usedTo=links.filter(l=>l.from===dev.id||l.to===dev.id).length;
  setLinks(p=>[...p,{id:`l${Date.now()}`,from:linking,to:dev.id,fromIface:fromIfaces[usedFrom]||fromIfaces[0],toIface:toIfaces[usedTo]||toIfaces[0]}]);
}
        setLinking(null);
      }
      return;
    }
    if(tool==="delete"){
      setDevices(p=>p.filter(d=>d.id!==dev.id));
      setLinks(p=>p.filter(l=>l.from!==dev.id&&l.to!==dev.id));
      if(selectedDeviceId===dev.id) onSelectDevice&&onSelectDevice(null);
      return;
    }
    setDragging(dev.id);
    setOffset({x:e.clientX-dev.x,y:e.clientY-dev.y});
    setSelected(dev.id);
    onSelectDevice&&onSelectDevice(dev);
  };

  const handleMouseMove = useCallback((e)=>{
    if(!dragging) return;
    const canvas=canvasRef.current?.getBoundingClientRect();
    if(!canvas) return;
    setDevices(p=>p.map(d=>d.id===dragging?{...d,x:Math.max(0,Math.min(e.clientX-offset.x,canvas.width-80)),y:Math.max(0,Math.min(e.clientY-offset.y,canvas.height-80))}:d));
  },[dragging,offset,setDevices]);

  const addDevice = (type,model) => {
    counter.current++;
    const info=DEVICE_TYPES[type];
    setDevices(p=>[...p,{id:`${type}${counter.current}`,type,name:`${info.label}${counter.current}`,model:model.name,x:180+Math.random()*240,y:140+Math.random()*180}]);
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#f8fafc",overflow:"auto"}}>
      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"8px 16px",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
        <span style={{fontSize:10,fontWeight:700,color:"#9ca3af",marginRight:4}}>ADD:</span>
        {Object.entries(DEVICE_TYPES).map(([type,info])=>(
          <div key={type} style={{position:"relative"}}>
            <button onClick={()=>setOpenDropdown(openDropdown===type?null:type)}
              style={{background:`${info.color}12`,border:`1px solid ${info.color}40`,color:info.color,padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={info.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{info.icon}</svg>
              {info.label}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={info.color} strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {openDropdown===type && (
              <div style={{position:"absolute",top:"100%",left:0,marginTop:4,background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,boxShadow:"0 8px 24px #00000015",zIndex:100,minWidth:200,overflow:"hidden"}}>
                {info.models.map((model,i)=>(
                  <button key={i} onClick={()=>{ addDevice(type,model); setOpenDropdown(null); }}
                    style={{width:"100%",background:"#fff",border:"none",borderBottom:"1px solid #f3f4f6",padding:"8px 12px",cursor:"pointer",textAlign:"left",display:"block"}}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${info.color}10`;}}
                    onMouseLeave={e=>{e.currentTarget.style.background="#fff";}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#111827"}}>{model.name}</div>
                    <div style={{fontSize:9,color:"#9ca3af"}}>{model.ports}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div style={{width:1,background:"#e5e7eb",height:24,margin:"0 6px"}}/>
        {[{id:"select",label:"Select"},{id:"link",label:"Link"},{id:"delete",label:"Delete"}].map(t=>(
          <button key={t.id} onClick={()=>{setTool(t.id);setLinking(null);setOpenDropdown(null);}}
            style={{background:tool===t.id?"#1d4ed8":"#f3f4f6",border:"1px solid",borderColor:tool===t.id?"#1d4ed8":"#e5e7eb",color:tool===t.id?"#fff":"#374151",padding:"5px 12px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:700}}>
            {t.label}
          </button>
        ))}
        {linking&&<div style={{background:"#fef3c7",border:"1px solid #fde68a",color:"#92400e",padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:600}}>Click device to link...</div>}
      </div>

<div style={{flex:1,position:"relative",background:"#f1f5f9",backgroundImage:"radial-gradient(#cbd5e1 1px, transparent 1px)",backgroundSize:"24px 24px",cursor:tool==="link"?"crosshair":tool==="delete"?"not-allowed":"default",overflow:"hidden"}}
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={()=>setDragging(null)}
        onTouchMove={e=>{
          if(!dragging) return;
          const canvas=canvasRef.current?.getBoundingClientRect();
          if(!canvas) return;
          const touch=e.touches[0];
          setDevices(p=>p.map(d=>d.id===dragging?{...d,x:Math.max(0,Math.min(touch.clientX-offset.x,canvas.width-80)),y:Math.max(0,Math.min(touch.clientY-offset.y,canvas.height-80))}:d));
        }}
        onTouchEnd={()=>setDragging(null)}
        onClick={()=>{if(tool==="select"){setSelected(null);onSelectDevice&&onSelectDevice(null);}setOpenDropdown(null);}}>

    

        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}>
          {links.map(link=>{
            const from=devices.find(d=>d.id===link.from);
            const to=devices.find(d=>d.id===link.to);
            if(!from||!to) return null;
            const fc=getCenter(from);const tc=getCenter(to);
            const mx=(fc.x+tc.x)/2;const my=(fc.y+tc.y)/2;
            return (
            <g key={link.id}>
                  <line x1={fc.x} y1={fc.y} x2={tc.x} y2={tc.y} stroke="#94a3b8" strokeWidth="2" strokeDasharray="6,3"/>
                  <circle cx={mx} cy={my} r="8" fill="#fff" stroke="#e5e7eb" strokeWidth="1" style={{cursor:"pointer",pointerEvents:"all"}} onClick={()=>setLinks(p=>p.filter(l=>l.id!==link.id))}/>
                  <text x={mx} y={my+4} textAnchor="middle" fontSize="10" fill="#ef4444" style={{pointerEvents:"all",cursor:"pointer"}} onClick={()=>setLinks(p=>p.filter(l=>l.id!==link.id))}>x</text>
                  {link.fromIface&&<text x={fc.x+(mx-fc.x)*0.3} y={fc.y+(my-fc.y)*0.3-6} textAnchor="middle" fontSize="9" fill="#1d4ed8" fontWeight="600">{link.fromIface.replace("GigabitEthernet","Gi").replace("FastEthernet","Fa").replace("Serial","Se")}</text>}
                  {link.toIface&&<text x={tc.x+(mx-tc.x)*0.3} y={tc.y+(my-tc.y)*0.3-6} textAnchor="middle" fontSize="9" fill="#15803d" fontWeight="600">{link.toIface.replace("GigabitEthernet","Gi").replace("FastEthernet","Fa").replace("Serial","Se")}</text>}
                </g>
            );
          })}
        </svg>

        {devices.map(dev=>{
          const info=DEVICE_TYPES[dev.type];
          const isSel=selected===dev.id||selectedDeviceId===dev.id;
          return (
            <div key={dev.id} style={{position:"absolute",left:dev.x,top:dev.y,width:80,userSelect:"none"}}
              onMouseDown={e=>handleMouseDown(e,dev)}
              onTouchStart={e=>{e.stopPropagation();const touch=e.touches[0];setDragging(dev.id);setSelected(dev.id);setOffset({x:touch.clientX-dev.x,y:touch.clientY-dev.y});onSelectDevice&&onSelectDevice(dev);}}
              onDoubleClick={()=>{if(tool==="select") onConfigDevice&&onConfigDevice(dev);}}>
              <div style={{width:80,height:80,background:info.bg,border:`2px solid ${isSel?info.color:"#e5e7eb"}`,borderRadius:12,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,boxShadow:isSel?`0 0 0 3px ${info.color}33`:"0 2px 8px #00000015",cursor:tool==="select"?"grab":"default",transition:"all 0.1s"}}>
                <DevIcon type={dev.type} size={28}/>
              </div>
              <div style={{textAlign:"center",fontSize:10,fontWeight:700,color:"#374151",marginTop:4,whiteSpace:"nowrap"}}>{dev.name}</div>
              <div style={{textAlign:"center",fontSize:9,color:"#9ca3af",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:80}}>{dev.model}</div>
              {isSel&&tool==="select"&&(
                <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:4}}>
                  <button onClick={e=>{e.stopPropagation();onConfigDevice&&onConfigDevice(dev);}} style={{background:info.color,border:"none",color:"#fff",fontSize:9,padding:"2px 6px",borderRadius:4,cursor:"pointer",fontWeight:700}}>Config</button>
                  <button onClick={e=>{e.stopPropagation();setTermDevice(dev);}} style={{background:"#0f172a",border:"none",color:"#10b981",fontSize:9,padding:"2px 6px",borderRadius:4,cursor:"pointer",fontWeight:700,fontFamily:"monospace"}}>Term</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {termDevice&&<DeviceTerminal device={termDevice} onClose={()=>setTermDevice(null)}/>}
    </div>
  );
};

export default function GUI({onCommand, connected}) {
  const [selectedDevice,setSelectedDevice] = useState(null);
  const [configDevice,setConfigDevice] = useState(null);
  const [saveStatus,setSaveStatus] = useState("");
  const [links,setLinks] = useState([
    {id:"l1",from:"pc1",to:"sw1"},
    {id:"l2",from:"pc2",to:"sw1"},
    {id:"l3",from:"sw1",to:"rt1"},
  ]);
  const [devices,setDevices] = useState([
    {id:"sw1",type:"switch",name:"Switch1",model:"Cisco 2960-24TT",x:300,y:200},
    {id:"rt1",type:"router",name:"Router1",model:"Cisco 2911",x:520,y:180},
    {id:"pc1",type:"pc",name:"PC1",model:"PC (Windows)",x:160,y:340},
    {id:"pc2",type:"pc",name:"PC2",model:"PC (Windows)",x:320,y:360},
  ]);

  const saveTopology = () => {
    const fileName = prompt("Enter file name:","MyTopology");
    if(!fileName) return;
    const data = JSON.stringify({devices,links},null,2);
    const blob = new Blob([data],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.ciscolab`;
    a.click();
    URL.revokeObjectURL(url);
    setSaveStatus("Saved!");
    setTimeout(()=>setSaveStatus(""),2000);
  };

  const loadTopology = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/topology");
      const data = await res.json();
      if(data.devices) setDevices(data.devices);
      if(data.links) setLinks(data.links);
    } catch(e){console.error("Load error:",e);}
  };

  React.useEffect(()=>{loadTopology();},[]);

  const handleRename = (id,newName) => {
    setDevices(p=>p.map(d=>d.id===id?{...d,name:newName}:d));
    setSelectedDevice(p=>p?.id===id?{...p,name:newName}:p);
    setConfigDevice(p=>p?.id===id?{...p,name:newName}:p);
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* HEADER */}
      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:48,boxShadow:"0 1px 3px #0000000a"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,background:"linear-gradient(135deg,#1d4ed8,#0e7490)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px #1d4ed830"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#111827",lineHeight:1.2}}>Cisco IOS Simulator</div>
            
          </div>
          <div style={{width:1,background:"#e5e7eb",height:20,margin:"0 4px"}}/>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:connected?"#10b981":"#ef4444"}}/>
            <span style={{fontSize:10,color:connected?"#15803d":"#b91c1c",fontWeight:600}}>{connected?"Connected":"Offline"}</span>
          </div>
          {selectedDevice&&(
            <>
              <div style={{width:1,background:"#e5e7eb",height:20,margin:"0 4px"}}/>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <DevIcon type={selectedDevice.type} size={14} color="#6b7280"/>
                <span style={{fontSize:11,color:"#374151",fontWeight:600}}>{selectedDevice.name}</span>
                <span style={{fontSize:9,color:"#9ca3af"}}>{selectedDevice.model}</span>
              </div>
            </>
          )}
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={saveTopology}
            style={{display:"flex",alignItems:"center",gap:5,background:"#f0fdf4",border:"1px solid #bbf7d0",color:"#15803d",padding:"5px 12px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {saveStatus||"Save"}
          </button>
          <label style={{display:"flex",alignItems:"center",gap:5,background:"#eff6ff",border:"1px solid #bfdbfe",color:"#1d4ed8",padding:"5px 12px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Open
            <input type="file" accept=".ciscolab" style={{display:"none"}} onChange={e=>{
              const file=e.target.files[0]; if(!file) return;
              const reader=new FileReader();
              reader.onload=(ev)=>{ try{ const data=JSON.parse(ev.target.result); if(data.devices) setDevices(data.devices); }catch(err){alert("Invalid file!");} };
              reader.readAsText(file);
            }}/>
          </label>
        </div>
      </div>

      <Topology
        onSelectDevice={setSelectedDevice}
        selectedDeviceId={selectedDevice?.id}
        devices={devices}
        setDevices={setDevices}
        links={links}
        setLinks={setLinks}
        onConfigDevice={setConfigDevice}
      />

      {configDevice&&(
        <ConfigPanel device={configDevice} onClose={()=>setConfigDevice(null)} onRename={handleRename}/>
      )}
    </div>
  );
}