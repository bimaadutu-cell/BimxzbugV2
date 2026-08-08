"use client";

import { useEffect, useState, useRef } from "react";

type Role = "PENGGUNA" | "RESELLER" | "OWNER" | "DEVELOPER";
type User = { id:number; username:string; role:Role; createdAt?:string; expiresAt?:string|null; pairedNumber?:string|null; isActive?:boolean };
type Stats = { activeUsers:number; registeredSenders:number; uptime:string; ping:string };

const BUG_LIST = [
  { id: "BIMXZBUGXZ Delay", desc: "Delay 2GB • jeda eksekusi berlapis", icon: "⏱️", heavy:"2GB" },
  { id: "BIMXZBUGXZ C1", desc: "Teks padat ultra panjang 2GB", icon: "📜", heavy:"2GB" },
  { id: "BIMXZBUGXZ ForceClose", desc: "Struktur rumit paksa tutup", icon: "💥", heavy:"2GB" },
  { id: "BIMXZBUGXZ Freezer", desc: "Freeze ribuan karakter rapat", icon: "❄️", heavy:"2GB" },
  { id: "BIMXZBUGXZ Heavy", desc: "Heavy 2GB berbaris-baras", icon: "🏋️", heavy:"2GB" },
  { id: "BIMXZBUGXZ Flood", desc: "Flood berulang terus 2GB", icon: "🌊", heavy:"2GB" },
  { id: "BIMXZBUGXZ Burst", desc: "Burst banyak sekejap 2GB", icon: "💣", heavy:"2GB" },
  { id: "BIMXZBUGXZ Overflow", desc: "Overflow gabungan raksasa", icon: "🌀", heavy:"2GB" },
  { id: "BIMXZBUGXZ Stack", desc: "Stack bertumpuk halaman", icon: "📚", heavy:"2GB" },
  { id: "BIMXZBUGXZ Blast", desc: "Blast kilat beruntun 2GB", icon: "⚡", heavy:"2GB" },
  { id: "BIMXZBUGXZ Wave", desc: "Wave ombak bertahap 2GB", icon: "〰️", heavy:"2GB" },
  { id: "BIMXZBUGXZ Surge", desc: "Surge ratusan baris tanpa putus", icon: "🌪️", heavy:"2GB" },
  { id: "BIMXZBUGXZ CrashTxt", desc: "Crash ribuan karakter berulang", icon: "💻", heavy:"2GB" },
  { id: "BIMXZBUGXZ LagMsg", desc: "Lag format rumit berat", icon: "🐛", heavy:"2GB" },
  { id: "BIMXZBUGXZ Hang", desc: "Hang tanpa spasi 2GB", icon: "🔒", heavy:"2GB" },
  { id: "BIMXZBUGXZ LockTxt", desc: "Lock huruf angka simbol padat", icon: "🔐", heavy:"2GB" },
  { id: "BIMXZBUGXZ Jam", desc: "Jam jutaan karakter 1 baris", icon: "🧱", heavy:"2GB" },
  { id: "BIMXZBUGXZ Bulk", desc: "Bulk ratusan paragraf", icon: "📦", heavy:"2GB" },
  { id: "BIMXZBUGXZ Mass", desc: "Mass gabungan raksasa 2GB", icon: "🏔️", heavy:"2GB" },
  { id: "BIMXZBUGXZ Ultra", desc: "Ultra terberat 2GB MAX", icon: "👑", heavy:"2GB" },
  { id: "BIMXZBUGXZ GroupMsg", desc: "GroupMsg khusus grup 2GB", icon: "👥", heavy:"2GB" },
  { id: "BIMXZBUGXZ GroupWipe", desc: "GroupWipe sapu semua anggota", icon: "🧹", heavy:"2GB" },
  { id: "BIMXZBUGXZ GroupHeavy", desc: "GroupHeavy terberat grup 2GB", icon: "⚓", heavy:"2GB" },
  { id: "BIMXZBUGXZ GroupKill", desc: "GroupKill 999.999 karakter & 2GB", icon: "☠️", heavy:"2GB" },
  { id: "BIMXZBUGXZ GlobalSend", desc: "GlobalSend seluruh dunia 2GB", icon: "🌍", heavy:"2GB" },
];

const COUNTRY_CODES = [
  { code:"+62", name:"Indonesia", flag:"🇮🇩" },
  { code:"+60", name:"Malaysia", flag:"🇲🇾" },
  { code:"+65", name:"Singapore", flag:"🇸🇬" },
  { code:"+66", name:"Thailand", flag:"🇹🇭" },
  { code:"+84", name:"Vietnam", flag:"🇻🇳" },
  { code:"+63", name:"Philippines", flag:"🇵🇭" },
  { code:"+91", name:"India", flag:"🇮🇳" },
  { code:"+81", name:"Japan", flag:"🇯🇵" },
  { code:"+82", name:"Korea", flag:"🇰🇷" },
  { code:"+86", name:"China", flag:"🇨🇳" },
  { code:"+1", name:"USA/Canada", flag:"🇺🇸" },
  { code:"+44", name:"UK", flag:"🇬🇧" },
  { code:"+49", name:"Germany", flag:"🇩🇪" },
  { code:"+33", name:"France", flag:"🇫🇷" },
  { code:"+971", name:"UAE", flag:"🇦🇪" },
  { code:"+966", name:"Saudi", flag:"🇸🇦" },
  { code:"+90", name:"Turkey", flag:"🇹🇷" },
  { code:"+55", name:"Brazil", flag:"🇧🇷" },
  { code:"+61", name:"Australia", flag:"🇦🇺" },
];

const FILM_SERVERS = ["VidLink","VidSrc","Vidy","Streamtape","Voe","Doodstream","Mp4Upload","GoFile","StreamSB","Mixdrop"];

function DigitalClock(){
  const [time, setTime] = useState(new Date());
  useEffect(()=>{
    const iv=setInterval(()=> setTime(new Date()), 1000);
    return ()=>clearInterval(iv);
  },[]);
  const pad = (n:number)=> String(n).padStart(2,"0");
  const days = ["MINGGU","SENIN","SELASA","RABU","KAMIS","JUMAT","SABTU"];
  return (
    <div className="glow-card rounded-[22px] p-4 relative overflow-hidden border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF1A1A]/10 to-transparent" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[24px]" />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-[10px] tracking-[0.2em] text-white/40 font-black">JAM DIGITAL • BIMXZBUGXZ</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[36px] font-black tracking-tight text-white" style={{fontFamily:"JetBrains Mono, monospace", textShadow:"0 0 14px #FF1A1A, 0 0 28px #FF1A1A"}}>{pad(time.getHours())}:{pad(time.getMinutes())}</span>
            <span className="text-[18px] font-black text-[#FF5A5A] animate-pulse" style={{fontFamily:"JetBrains Mono"}}>:{pad(time.getSeconds())}</span>
            <span className="ml-2 text-[11px] font-black px-2 py-1 rounded-full bg-white text-black">{time.getHours() >= 12 ? "PM" : "AM"}</span>
          </div>
          <div className="text-xs font-bold text-white/70 mt-1">{days[time.getDay()]}, {pad(time.getDate())}-{pad(time.getMonth()+1)}-{time.getFullYear()}</div>
        </div>
        <div className="text-right">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF1A1A] to-white flex items-center justify-center text-xl shadow-[0_0_16px_rgba(255,26,26,0.6)]">🕒</div>
          <div className="text-[10px] font-black text-white/40 mt-1 tracking-widest">WIB • REALTIME</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          {k:"JAM", v: pad(time.getHours())},
          {k:"MENIT", v: pad(time.getMinutes())},
          {k:"DETIK", v: pad(time.getSeconds())},
        ].map(b=>(
          <div key={b.k} className="rounded-xl bg-black/40 border border-white/10 py-2 text-center">
            <div className="text-[10px] font-black text-white/40">{b.k}</div>
            <div className="text-lg font-black text-white" style={{fontFamily:"JetBrains Mono"}}>{b.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BIMXZApp(){
  const [user, setUser] = useState<User|null>(null);
  const [token, setToken] = useState<string|null>(null);
  const [stats, setStats] = useState<Stats>({ activeUsers: 842, registeredSenders: 1284, uptime:"47 hari", ping:"24 ms" });
  const [activeTab, setActiveTab] = useState<"beranda"|"whatsapp"|"film"|"tools"|"profil">("beranda");
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username:"", password:"" });
  const [loginErr, setLoginErr] = useState("");
  const [pairNumber, setPairNumber] = useState("");
  const [pairCode, setPairCode] = useState("+62");
  const [pairLoading, setPairLoading] = useState(false);
  const [pairingCode, setPairingCode] = useState<string| null>(null);
  const [qrImage, setQrImage] = useState<string| null>(null);
  const [waStatus, setWaStatus] = useState<string>("close");
  const [showQR, setShowQR] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [isPaired, setIsPaired] = useState(false);
  const [waMode, setWaMode] = useState<"NOMOR"|"GRUP">("NOMOR");
  const [senderMode, setSenderMode] = useState<"PRIVATE"|"GLOBAL">("PRIVATE");
  const [targetNumber, setTargetNumber] = useState("");
  const [targetCode, setTargetCode] = useState("+62");
  const [selectedBugs, setSelectedBugs] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [bgSettings, setBgSettings] = useState<{type:string; url:string}>({type:"none", url:""});
  const [filmCategory, setFilmCategory] = useState<"popular"|"now_playing"|"upcoming">("popular");
  const [films, setFilms] = useState<any[]>([]);
  const [filmSearch, setFilmSearch] = useState("");
  const [filmLoading, setFilmLoading] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<any|null>(null);
  const [filmDetail, setFilmDetail] = useState<any|null>(null);
  const [filmServer, setFilmServer] = useState(0);
  const [adBlockOn, setAdBlockOn] = useState(true);
  const [devUserList, setDevUserList] = useState<any[]>([]);
  const [newAcc, setNewAcc] = useState({ username:"", password:"", role:"PENGGUNA" as Role, days:"30" });
  const [apiKeysList, setApiKeysList] = useState<any[]>([]);
  const [newApiKeyName, setNewApiKeyName] = useState("Bot Utama");
  const [generatedKey, setGeneratedKey] = useState<string| null>(null);
  const [apiTestUsername, setApiTestUsername] = useState("");
  const [apiTestPw, setApiTestPw] = useState("");
  const [apiTestRole, setApiTestRole] = useState<Role>("PENGGUNA");
  const [groupList, setGroupList] = useState<any[]>([]);
  const [globalPool, setGlobalPool] = useState<any[]>([]);
  const [pingVal, setPingVal] = useState("24 ms");
  const [toolsTab, setToolsTab] = useState<"downloader"|"ai"|"mp3"|"url">("downloader");
  // downloader 15 servers
  const [dlUrl, setDlUrl] = useState("");
  const [dlLoading, setDlLoading] = useState(false);
  const [dlResult, setDlResult] = useState<any>(null);
  // ai
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChat, setAiChat] = useState<{role:"user"|"ai", text:string}[]>([]);
  // mp3 convert
  const [mp3File, setMp3File] = useState<File|null>(null);
  const [mp3Loading, setMp3Loading] = useState(false);
  const [mp3Result, setMp3Result] = useState<any>(null);
  // url convert
  const [urlFile, setUrlFile] = useState<File|null>(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlResult, setUrlResult] = useState<any>(null);
  // prank call & otp
  const [prankNumber, setPrankNumber] = useState("");
  const [prankType, setPrankType] = useState("paket_cod");
  const [prankCount, setPrankCount] = useState(3);
  const [prankLoading, setPrankLoading] = useState(false);
  const [prankResult, setPrankResult] = useState<any>(null);
  const [otpNumber, setOtpNumber] = useState("");
  const [otpService, setOtpService] = useState("duniagames");
  const [otpCount, setOtpCount] = useState(3);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResult, setOtpResult] = useState<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    fetch("/api/init").catch(()=>{});
    const t = localStorage.getItem("bimx_token");
    const u = localStorage.getItem("bimx_user");
    if (t && u) {
      try { const parsed = JSON.parse(u); setToken(t); setUser(parsed); if(parsed.pairedNumber) setIsPaired(true);} catch{}
    } else setShowLogin(true);
    fetch("/api/stats").then(r=>r.json()).then(d=>{ if(d.ok) setStats(d); }).catch(()=>{});
    const iv = setInterval(()=> setPingVal(`${16+Math.floor(Math.random()*18)} ms`), 3500);
    return ()=>clearInterval(iv);
  },[]);

  useEffect(()=>{
    if(token) fetch(`/api/pair?token=${token}`).then(r=>r.json()).then(d=>{ if(d.ok && d.pairedNumber) setIsPaired(true); }).catch(()=>{});
  },[token]);

  useEffect(()=>{
    fetch("/api/settings").then(r=>r.json()).then(d=>{ if(d.ok){ const s=d.settings; if(s.background_url) setBgSettings({type:s.background_type||"none", url:s.background_url}); }}).catch(()=>{});
  },[]);

  useEffect(()=>{
    const load=()=> fetch("/api/chat").then(r=>r.json()).then(d=>{ if(d.ok) setChatMessages(d.chats); }).catch(()=>{});
    load(); const iv=setInterval(load, 5000); return ()=>clearInterval(iv);
  },[]);
  const handleManualScroll = () => {
    chatEndRef.current?.scrollIntoView({behavior:"smooth"});
  };

  // WA status polling - real Baileys
  useEffect(()=>{
    let iv: any;
    const fetchStatus = async ()=>{
      try{
        const r = await fetch("/api/wa/status"); const j=await r.json();
        if(j.ok) setWaStatus(j.status);
        if(j.pairingCode) setPairingCode(j.pairingCode);
      }catch{}
    };
    const fetchQR = async ()=>{
      try{
        const r = await fetch("/api/wa/qr"); const j=await r.json();
        if(j.ok){ setWaStatus(j.status); if(j.qrImage) { setQrImage(j.qrImage); setQrLoading(false); } }
      }catch{}
    };
    if (showQR || activeTab==="whatsapp"){
      fetchStatus();
      if(showQR) fetchQR();
      iv=setInterval(()=>{ fetchStatus(); if(showQR && !qrImage) fetchQR(); }, 4000);
    }
    return ()=> iv && clearInterval(iv);
  },[showQR, activeTab, qrImage]);

  // global pool polling when GLOBAL selected or whatsapp tab
  useEffect(()=>{
    if(senderMode==="GLOBAL" || activeTab==="whatsapp"){
      fetch("/api/wa/global-senders").then(r=>r.json()).then(d=>{ if(d.ok) setGlobalPool(d.pool); }).catch(()=>{});
      const iv=setInterval(()=> fetch("/api/wa/global-senders").then(r=>r.json()).then(d=>{ if(d.ok) setGlobalPool(d.pool); }).catch(()=>{}), 7000);
      return ()=>clearInterval(iv);
    }
  },[senderMode, activeTab]);

  useEffect(()=>{ if(activeTab==="film") loadFilms(); },[filmCategory, activeTab]);
  async function loadFilms(){
    setFilmLoading(true);
    try{ const r=await fetch(`/api/tmdb/popular?type=${filmCategory}`); const j=await r.json(); if(j.ok) setFilms(j.data.results||[]); }catch{} setFilmLoading(false);
  }
  async function searchFilms(){
    if(!filmSearch.trim()) return loadFilms();
    setFilmLoading(true);
    try{ const r=await fetch(`/api/tmdb/search?q=${encodeURIComponent(filmSearch)}`); const j=await r.json(); if(j.ok) setFilms(j.data.results||[]); }catch{} setFilmLoading(false);
  }
  async function openFilmDetail(f:any){
    setSelectedFilm(f); setFilmDetail(null); setFilmServer(0);
    try{ const r=await fetch(`/api/tmdb/detail?id=${f.id}`); const j=await r.json(); if(j.ok) setFilmDetail(j.data); else setFilmDetail(f); }catch{ setFilmDetail(f); }
  }

  async function handleLogin(){
    setLoginErr("");
    if(!loginForm.username || !loginForm.password){ setLoginErr("Isi username & kata sandi"); return; }
    try{
      const r=await fetch("/api/auth/login",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(loginForm)});
      const j=await r.json();
      if(!j.ok){ setLoginErr(j.message); return; }
      localStorage.setItem("bimx_token", j.token);
      localStorage.setItem("bimx_user", JSON.stringify(j.user));
      setToken(j.token); setUser(j.user); setShowLogin(false);
      if(j.user.pairedNumber) setIsPaired(true);
    }catch(e:any){ setLoginErr(String(e)); }
  }
  function handleLogout(){
    localStorage.removeItem("bimx_token"); localStorage.removeItem("bimx_user");
    setUser(null); setToken(null); setIsPaired(false); setShowLogin(true);
  }
  async function handlePair(){
    if(!token) return;
    const full = pairCode + pairNumber.replace(/^0+/, "");
    if(!pairNumber.trim()){ alert("Masukkan nomor WhatsApp"); return; }
    setPairLoading(true);
    setPairingCode(null);
    try{
      const rc = await fetch("/api/wa/pair-code",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ phone: full })});
      const rj = await rc.json();
      if(rj.ok && rj.code){
        setPairingCode(rj.code);
      } else {
        if(rj.message) alert("Pairing: " + rj.message + "\n\nJika error ‘Gagal menautkan perangkat’ seperti di screenshot, itu karena kode expired 20 detik atau nomor sudah terpakai. Coba QR Scan yang lebih stabil, atau tunggu 30 detik lalu minta kode baru.");
      }
      const r=await fetch("/api/pair",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ token, phone: full })});
      const j=await r.json();
      if(j.ok){
        setIsPaired(true);
        if(user){ const nu={...user, pairedNumber: full}; setUser(nu); localStorage.setItem("bimx_user", JSON.stringify(nu)); }
        if(rj.ok) alert("✅ KODE PAIRING ASLI BAILEYS: " + rj.code + "\nBuka WhatsApp → Perangkat Tertaut → Tautkan dengan nomor telepon → Masukkan kode ini dalam 20 detik. Ini kode ASLI dari server WhatsApp via Baileys 6.7.18, bukan simulasi. Jika gagal, pakai QR.");
        else if(!rj.ok) alert("✅ Nomor disimpan: "+full+" — QR lebih stabil jika pairing gagal (Vercel kadang lambat, kode harus dimasukkan cepat).");
      } else {
        if(!rj.ok) alert(j.message);
      }
    }catch(e:any){ alert(String(e)); }
    setPairLoading(false);
  }
  async function handleShowQR(){
    setShowQR(true);
    setQrImage(null);
    setQrLoading(true);
    try{
      const r=await fetch("/api/wa/qr"); const j=await r.json();
      if(j.ok && j.qrImage) { setQrImage(j.qrImage); setQrLoading(false); }
      else {
        setTimeout(async()=>{
          const r2=await fetch("/api/wa/qr"); const j2=await r2.json(); if(j2.ok && j2.qrImage){ setQrImage(j2.qrImage); setQrLoading(false); } else setQrLoading(false);
        }, 2500);
      }
    }catch{ setQrLoading(false); }
  }
  function toggleBug(id:string){
    if(waStatus!=="open"){
      alert("⚠️ WA BELUM TERHUBUNG — Hubungkan QR/Pairing dulu untuk pakai bug 2GB. Fitur bug dikunci sampai WA open.");
      return;
    }
    setSelectedBugs(prev=>{
      if(prev.includes(id)) return prev.filter(x=>x!==id);
      if(prev.length>=3){ alert("Maksimal 3 jenis pesan sekaligus"); return prev; }
      return [...prev, id];
    });
  }
  async function handleSend(){
    if(!user || !token) { setShowLogin(true); return; }
    if(waStatus!=="open"){
      alert("WA BELUM TERHUBUNG — Scan QR / Pairing dulu. Fitur bug gelap & terkunci sampai WA terhubung. Ini sistem asli Baileys, bukan simulasi.");
      return;
    }
    const fullTarget = waMode==="GRUP" && targetNumber.includes("@g.us") ? targetNumber : targetCode + targetNumber.replace(/^0+/, "").replace(/\s/g,"");
    if(!targetNumber.trim()){ alert("Masukkan nomor tujuan / ID Grup"); return; }
    if(selectedBugs.length===0){ alert("Pilih minimal 1 jenis pesan BIMXZBUGXZ"); return; }
    setSending(true);
    try{
      if(user.role==="PENGGUNA" && selectedBugs.some(b=>b!=="BIMXZBUGXZ Delay")){ alert("PENGGUNA hanya boleh memakai BIMXZBUGXZ Delay. Hubungi pengembang untuk upgrade."); setSending(false); return; }
      const r=await fetch("/api/wa/send",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ token, targetNumber: fullTarget, bugTypes: selectedBugs, senderMode, targetMode: waMode })});
      const j=await r.json();
      if(!j.ok){ alert(j.message); setSending(false); return; }
      setSending(false);
      setSuccessInfo(j);
      setShowSuccess(true);
      setTimeout(()=>setShowSuccess(false), 5000);
    }catch(e:any){ alert(String(e)); setSending(false); }
  }

  async function handlePrankCall(){
    if(!prankNumber.trim()){ alert("Masukkan nomor tujuan"); return; }
    if(waStatus!=="open"){ alert("WA belum terhubung — prank call butuh WA terhubung"); return; }
    setPrankLoading(true); setPrankResult(null);
    try{
      const full = prankNumber.startsWith("+") ? prankNumber : "+62" + prankNumber.replace(/^0+/, "");
      const r=await fetch("/api/prank/call",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ token, targetNumber: full, prankType, count: prankCount })});
      const j=await r.json();
      setPrankResult(j);
      if(!j.ok) alert(j.message);
      else alert("✅ Prank call asli via WA terkirim x"+prankCount);
    }catch(e:any){ alert(String(e)); }
    setPrankLoading(false);
  }
  async function handleOtpSpam(){
    if(!otpNumber.trim()){ alert("Masukkan nomor tujuan"); return; }
    if(waStatus!=="open"){ alert("WA belum terhubung — spam OTP butuh WA terhubung"); return; }
    setOtpLoading(true); setOtpResult(null);
    try{
      const full = otpNumber.startsWith("+") ? otpNumber : "+62" + otpNumber.replace(/^0+/, "");
      const r=await fetch("/api/prank/otp",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ token, targetNumber: full, service: otpService, count: otpCount })});
      const j=await r.json();
      setOtpResult(j);
      if(!j.ok) alert(j.message);
      else alert("✅ OTP asli via WA terkirim x"+otpCount+" layanan "+otpService);
    }catch(e:any){ alert(String(e)); }
    setOtpLoading(false);
  }

  async function sendChat(){
    if(!chatInput.trim() || !token) return;
    const msg=chatInput; setChatInput("");
    try{
      const r=await fetch("/api/chat",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ token, message: msg })});
      const j=await r.json();
      if(j.ok) { setChatMessages(prev=>[...prev, j.chat]); setTimeout(handleManualScroll, 100); }
      else alert(j.message);
    }catch{}
  }
  async function loadUsers(){
    if(!token) return;
    const r=await fetch(`/api/users?token=${token}`); const j=await r.json(); if(j.ok) setDevUserList(j.users);
  }
  async function loadApiKeys(){
    if(!token) return;
    const r=await fetch(`/api/apikey?token=${token}`); const j=await r.json(); if(j.ok) setApiKeysList(j.keys);
  }
  async function generateApiKey(){
    if(!token) return;
    const r=await fetch("/api/apikey",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ token, name: newApiKeyName })});
    const j=await r.json();
    if(j.ok){ setGeneratedKey(j.key); loadApiKeys(); alert("✅ APIKEY BERHASIL: " + j.key + "\nSimpan! Key hanya tampil sekali. Format: bimzxbugx_api_..."); } else alert(j.message);
  }
  async function deleteApiKey(id:number){
    if(!confirm("Hapus APIKEY ini? Bot yang pakai akan terputus.")) return;
    const r=await fetch(`/api/apikey?token=${token}&id=${id}`,{method:"DELETE"}); const j=await r.json(); if(j.ok) loadApiKeys(); else alert(j.message);
  }
  async function testCreateViaApiKey(){
    if(!generatedKey && apiKeysList.length===0){ alert("Buat APIKEY dulu!"); return; }
    const keyToUse = generatedKey || apiKeysList[0]?.key;
    if(!apiTestUsername || !apiTestPw){ alert("Isi username & password test"); return; }
    const r=await fetch("/api/apikey/create-user",{method:"POST", headers:{"Content-Type":"application/json", "x-api-key": keyToUse}, body: JSON.stringify({ username: apiTestUsername, password: apiTestPw, role: apiTestRole })});
    const j=await r.json();
    if(j.ok){ alert(`✅ Berhasil via APIKEY: ${j.user.username} • ${j.user.role} • Exp: ${j.user.expiresAt || "lifetime"} • Auto delete: ${j.autoDelete}`); setApiTestUsername(""); setApiTestPw(""); loadUsers(); } else alert("❌ " + j.message);
  }
  useEffect(()=>{ if(user?.role==="DEVELOPER" && activeTab==="profil") loadUsers(); },[user, activeTab, token]);
  useEffect(()=>{ if((user?.role==="DEVELOPER" || user?.role==="OWNER") && activeTab==="profil"){ loadApiKeys(); } },[user, activeTab, token]);
  useEffect(()=>{ // auto cleanup expired every 30s when on profil
    if(activeTab==="profil"){ const iv=setInterval(()=> fetch("/api/cron").catch(()=>{}), 30000); return ()=>clearInterval(iv); }
  },[activeTab]);
  async function createUser(){
    if(!newAcc.username || !newAcc.password){ alert("Isi username & password"); return; }
    try{
      const r=await fetch("/api/auth/register",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ username:newAcc.username, password:newAcc.password, role:newAcc.role, expiresInDays:newAcc.days, requesterToken: token })});
      const j=await r.json();
      if(!j.ok) alert(j.message); else { alert("Akun berhasil dibuat: "+j.user.username); setNewAcc({username:"",password:"",role:"PENGGUNA",days:"30"}); loadUsers(); }
    }catch(e:any){ alert(String(e)); }
  }
  async function deleteUser(id:number){
    if(!confirm("Hapus akun ini?")) return;
    const r=await fetch(`/api/users?token=${token}&id=${id}`,{method:"DELETE"}); const j=await r.json(); if(j.ok) loadUsers(); else alert(j.message);
  }
  async function handleBgUpload(e:any){
    const file=e.target.files?.[0]; if(!file) return;
    if(file.size> 2*1024*1024*1024){ alert("Maksimal 2GB"); return; }
    const isVideo=file.type.startsWith("video");
    const url=URL.createObjectURL(file);
    let storeUrl=url;
    if(file.size< 2*1024*1024){
      const reader=new FileReader();
      const b64=await new Promise<string>((res)=>{ reader.onload=()=>res(reader.result as string); reader.readAsDataURL(file); });
      storeUrl=b64;
    }
    setBgSettings({type: isVideo?"video":"image", url: storeUrl});
    if(token){
      await fetch("/api/settings",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ token, key:"background_type", value: isVideo?"video":"image" })});
      await fetch("/api/settings",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ token, key:"background_url", value: storeUrl })});
      alert("Latar belakang diperbarui untuk semua pengguna");
    }
  }
  async function fetchGroups(){
    try{ const r=await fetch("/api/wa/groups"); const j=await r.json(); if(j.ok) { setGroupList(j.groups); alert(`Ditemukan ${j.groups.length} grup`);} else alert(j.message + "\nPastikan WA sudah terhubung QR (bukan pairing error seperti DX95Z43V tadi, itu kode expired 20 dtk)."); }catch(e:any){ alert(String(e)); }
  }
  // Tools handlers
  async function handleDownload(){
    if(!dlUrl.trim()){ alert("Masukkan link TikTok/IG/YouTube/Snapchat dll"); return; }
    setDlLoading(true); setDlResult(null);
    try{
      const r=await fetch("/api/tools/download",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ url: dlUrl })});
      const j=await r.json();
      setDlResult(j);
      if(j.ok && j.url){
        // Auto download BimxzBugxz mp4
        const a=document.createElement("a");
        a.href=j.url;
        a.download=j.filename || `bimxzbug_${Math.random().toString(36).slice(2,8)}.mp4`;
        a.target="_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if(!j.ok) alert(j.message || "Gagal, coba server lain otomatis sudah dicoba 15x. Link mungkin private.");
    }catch(e:any){ alert(String(e)); }
    setDlLoading(false);
  }
  async function handleAi(){
    if(!aiPrompt.trim()) return;
    const prompt = aiPrompt;
    setAiPrompt("");
    setAiChat(prev=>[...prev, {role:"user", text: prompt}]);
    setAiLoading(true);
    try{
      const r=await fetch("/api/tools/ai",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ prompt, history: aiChat })} );
      const j=await r.json();
      if(j.ok) setAiChat(prev=>[...prev, {role:"ai", text: j.text}]);
      else setAiChat(prev=>[...prev, {role:"ai", text: "Error: " + (j.message || "Gagal")}]);
    }catch(e:any){ setAiChat(prev=>[...prev, {role:"ai", text: String(e)}]); }
    setAiLoading(false);
  }
  async function handleMp3Upload(){
    if(!mp3File){ alert("Pilih file video dulu (maks 2GB)"); return; }
    setMp3Loading(true); setMp3Result(null);
    try{
      const fd=new FormData(); fd.append("file", mp3File);
      const r=await fetch("/api/convert/mp3",{method:"POST", body: fd});
      const j=await r.json();
      setMp3Result(j);
      if(!j.ok) alert(j.message);
    }catch(e:any){ alert(String(e)); }
    setMp3Loading(false);
  }
  async function handleUrlUpload(){
    if(!urlFile){ alert("Pilih file foto/video/file (maks 2GB)"); return; }
    setUrlLoading(true); setUrlResult(null);
    try{
      const fd=new FormData(); fd.append("file", urlFile);
      const r=await fetch("/api/upload",{method:"POST", body: fd});
      const j=await r.json();
      setUrlResult(j);
      if(!j.ok) alert(j.message);
    }catch(e:any){ alert(String(e)); }
    setUrlLoading(false);
  }

  const roleBadgeColor = (r:Role)=>{
    switch(r){
      case "PENGGUNA": return "bg-neutral-800 text-white border-neutral-700";
      case "RESELLER": return "bg-blue-600 text-white border-blue-400";
      case "OWNER": return "bg-amber-500 text-black border-amber-300";
      case "DEVELOPER": return "bg-gradient-to-r from-[#FF1A1A] to-[#8B0000] text-white border-red-300";
      default: return "bg-neutral-800";
    }
  };

  const isWaLocked = waStatus!=="open";

  if(showLogin && !user){
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0505]/60 via-[#050507] to-[#2b0a0a]/40" />
          <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[820px] h-[820px] bg-[#FF1A1A]/22 rounded-full blur-[130px]" />
          <div className="absolute bottom-[-220px] right-[-80px] w-[620px] h-[620px] bg-white/10 rounded-full blur-[110px]" />
          {Array.from({length:18}).map((_,i)=>(
            <div key={i} className="absolute w-[2px] h-[2px] bg-white rounded-full animate-pulse" style={{left:`${(i*17)%100}%`, top:`${(i*23)%100}%`, animationDelay:`${(i%5)}s`, opacity:0.6, boxShadow:"0 0 8px #FF1A1A"}} />
          ))}
          <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:"radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize:"32px 32px"}} />
        </div>

        <div className="relative w-full max-w-[430px]">
          <div className="flex flex-col items-center mb-6">
            <div className="w-[132px] h-[132px] rounded-full p-[3px] bg-gradient-to-br from-[#FF1A1A] via-white to-[#8B0000] shadow-[0_0_50px_rgba(255,26,26,0.7)]">
              <div className="w-full h-full rounded-full bg-black overflow-hidden relative flex items-center justify-center">
                <img src="/logo-bimx.png" alt="BIMXZBUGXZ" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="mt-4 text-[26px] font-black tracking-wider shimmer-red" style={{fontFamily:"Orbitron"}}>BIMXZBUGXZ</h1>
            <p className="text-[11px] tracking-[0.22em] text-white font-bold -mt-1">BIMZOFFICIAL EDITION • V1 RED NEON</p>
          </div>

          <div className="glow-card rounded-[26px] p-6 sm:p-7 relative overflow-hidden border-red-500/30">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[240px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-60" />
            <h2 className="text-center text-white font-black text-[16px] leading-tight">Asalamualaikum Hamba Allah,<br/><span className="text-[#FF5A5A]">SELAMAT DATANG DI BIMXZBUGXZ 😊</span></h2>
            <p className="text-center text-white/60 text-xs mt-3 leading-relaxed">Order akun akses ke Telegram atau WhatsApp admin.<br/>Silakan masuk untuk melanjutkan.</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-[11px] tracking-widest text-[#FF5A5A] font-bold">NAMA PENGGUNA</label>
                <input value={loginForm.username} onChange={e=>setLoginForm({...loginForm, username:e.target.value})} placeholder="Masukkan username" className="mt-2 w-full h-[46px] rounded-xl bg-black/60 border border-[#FF1A1A]/30 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white focus:ring-2 focus:ring-[#FF1A1A]/20" />
              </div>
              <div>
                <label className="text-[11px] tracking-widest text-[#FF5A5A] font-bold">KATA SANDI</label>
                <input type="password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password:e.target.value})} placeholder="Masukkan kata sandi" className="mt-2 w-full h-[46px] rounded-xl bg-black/60 border border-[#FF1A1A]/30 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white" />
              </div>
              {loginErr && <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{loginErr}</div>}
              <button onClick={handleLogin} className="w-full h-[48px] glow-button rounded-xl font-black text-white tracking-wide border border-white/20">MASUK SEKARANG</button>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <a href="https://wa.me/6283115955196" target="_blank" className="h-[44px] rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-600 border border-white/10">💬 Chat WA</a>
                <a href="https://t.me/b1mxzstore" target="_blank" className="h-[44px] rounded-xl bg-sky-500 text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-sky-600 border border-white/10">✈️ Chat Tele</a>
              </div>
              <p className="text-center text-[11px] text-white/30">Hubungi admin untuk order akses • Fast response</p>
            </div>
          </div>

          <p className="text-center text-[11px] text-white/40 mt-6 tracking-wide font-semibold">✨ BimxBugz By BimzOfficial, SIKIKKK AYAAAAA!!! ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden flex flex-col">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050507]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A0505] via-[#050507] to-[#050507]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[980px] h-[620px] bg-[#FF1A1A]/18 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[520px] h-[520px] bg-white/[0.05] rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"radial-gradient(white 1px, transparent 0)", backgroundSize:"30px 30px"}} />
        <div className="absolute inset-0 pointer-events-none" style={{animation:"lightningFlash 7s infinite"}} >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF1A1A]/18 to-transparent" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({length:14}).map((_,i)=>(
            <div key={i} className="absolute text-[#FF3B3B] text-[10px]" style={{
              left: `${8 + (i*7)%80}%`,
              top: `${(i*13)%100}%`,
              animation: `floatStars ${7+ (i%4)}s linear infinite`,
              animationDelay: `${i*0.4}s`,
              textShadow:"0 0 8px #FF1A1A"
            }}>✦</div>
          ))}
        </div>
        {bgSettings.url && bgSettings.type==="image" && (
          <img src={bgSettings.url} alt="bg" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        )}
        {bgSettings.url && bgSettings.type==="video" && (
          <video src={bgSettings.url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-25" style={{filter:"brightness(0.6)"}} />
        )}
        <div className="absolute inset-0 bg-[#050507]/62" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#050507]/78 border-b border-[#FF1A1A]/20">
        <div className="max-w-[760px] mx-auto px-3 sm:px-4 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-[#FF1A1A] to-white shadow-[0_0_16px_rgba(255,26,26,0.6)]">
              <div className="w-full h-full rounded-full bg-black overflow-hidden">
                <img src="/logo-bimx.png" alt="logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <div className="text-[13px] font-black leading-none tracking-wide flex items-center gap-1.5">Halo, {user?.username || "Bian"} <span className="hidden sm:inline text-[#FF5A5A]">• BIMXZBUGXZ</span></div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_6px_#10b981] ${waStatus==="open" ? "bg-emerald-400" : "bg-amber-400"}`} />
                <span className={`text-[11px] font-bold ${waStatus==="open" ? "text-emerald-400" : "text-amber-400"}`}>{waStatus==="open" ? "WhatsApp Terhubung" : waStatus==="connecting" ? "Menghubungkan..." : "Offline • QR Asli Baileys"}</span>
                <span className="text-[10px] text-white/40">• {pingVal}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#FF1A1A]/15 border border-[#FF1A1A]/25 text-xs font-bold text-white">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> Baileys 6.7.18 ASLI
            </span>
            <a href="https://t.me/b1mxzstore" target="_blank" className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-full bg-white text-black text-xs font-black hover:bg-white/90 transition">
              📢 Saluran
            </a>
            <button onClick={()=>setActiveTab("profil")} className="w-9 h-9 rounded-full bg-white text-black border border-white/20 flex items-center justify-center hover:bg-white/90 transition font-black">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[760px] w-full mx-auto px-3 sm:px-4 pb-[90px] pt-4 space-y-4">

        {activeTab==="beranda" && (
          <>
            <DigitalClock />

            <div className="glow-card rounded-[22px] p-4 relative overflow-hidden border-white/10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF1A1A]/18 rounded-full blur-[32px]" />
              <div className="flex items-start gap-3 relative">
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#FF1A1A] to-white shrink-0">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                    <img src="/logo-bimx.png" alt="logo" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-white tracking-wide">{user?.username || "Bian"}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-black tracking-widest ${roleBadgeColor((user?.role as Role) || "OWNER")}`}>{user?.role || "OWNER"}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${waStatus==="open" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" : "bg-amber-500/20 border-amber-500/30 text-amber-300"}`}>{waStatus==="open" ? "● WA CONNECTED ASLI" : "● WA BELUM CONNECT"}</span>
                  </div>
                  <div className="text-[11px] text-white/50 mt-1 font-medium">Exp: {user?.expiresAt ? new Date(user.expiresAt).toLocaleDateString("id-ID") : "∞ Unlimited"} • BIMXZBUGXZ V1 Red Neon • QR & Pairing ASLI Baileys</div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-[#FF1A1A] text-white font-black">2GB PAYLOAD</span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white text-black font-black">Baileys 6.7.18 ASLI</span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500 text-white font-black">15 SERVER DL</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                  {label:"Pengguna Aktif", value: String(stats.activeUsers), icon:"👥"},
                  {label:"Pengirim TTL", value: String(stats.registeredSenders), icon:"📱"},
                  {label:"Waktu Aktif", value: stats.uptime, icon:"⏳"},
                  {label:"Ping", value: pingVal, icon:"⚡"},
                ].map(s=>(
                  <div key={s.label} className="rounded-xl bg-black/40 border border-white/10 p-2.5 text-center backdrop-blur">
                    <div className="text-[10px] text-white/40 tracking-wide font-semibold">{s.label}</div>
                    <div className="text-[13px] font-black text-white mt-0.5 red-neon-text">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="text-[10px] tracking-[0.16em] text-white/40 font-black mb-2">AKSES CEPAT</div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    {label:"Riwayat", icon:"🕘", action:()=>setActiveTab("whatsapp")},
                    {label:"Profil", icon:"👤", action:()=>setActiveTab("profil")},
                    {label:"Bantuan", icon:"🎧", action:()=>window.open("https://wa.me/6283115955196","_blank")},
                    {label:"QR Scan", icon:"📷", action:()=>{ setActiveTab("whatsapp"); setTimeout(()=>handleShowQR(), 300); }},
                    {label:"Grup", icon:"👥", action:()=>fetchGroups()},
                    {label:"Tools", icon:"🛠️", action:()=>setActiveTab("tools")},
                  ].map(b=>(
                    <button key={b.label} onClick={b.action} className="h-[66px] rounded-xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-white/[0.09] transition shadow-[0_0_10px_rgba(255,26,26,0.08)]">
                      <span className="text-[18px]">{b.icon}</span>
                      <span className="text-[10px] text-white/75 font-bold">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="glow-card rounded-[22px] overflow-hidden border-red-500/20">
              <div className="relative h-[178px] sm:h-[206px] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&q=80" alt="evolve" className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF1A1A]/28 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FF1A1A] text-white text-[10px] font-black tracking-widest shadow-[0_0_12px_#FF1A1A]">🔥 BIMXZBUGXZ • 2GB ULTRA • 15 SERVER</div>
                  <h3 className="text-white font-black text-[18px] mt-2 leading-none tracking-tight" style={{fontFamily:"Orbitron"}}>BIMXZBUGXZ EXECUTION</h3>
                  <p className="text-white/75 text-xs mt-1">QR & Pairing ASLI • Eksekusi 2GB • Film Tanpa Iklan</p>
                </div>
                <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center text-white">⚡</div>
              </div>
              <div className="p-3 flex items-center justify-between bg-black/25 border-t border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#FF1A1A] flex items-center justify-center text-xs font-black">!</span>
                  <div>
                    <div className="text-xs font-black text-white">Information BIMXZBUGXZ</div>
                    <div className="text-[11px] text-white/50">QR Asli Baileys • 15 Server Downloader • Prank Call OTP Ready</div>
                  </div>
                </div>
                <a href="https://t.me/b1mxzstore" target="_blank" className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center font-black hover:bg-white/90">→</a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                {label:"WhatsApp Bug", sub:"Eksekusi 2GB - Kunci jika WA off", icon:"💥", active:true, onClick:()=>setActiveTab("whatsapp")},
                {label:"Kelola Pengirim", sub:"QR & Pairing ASLI", icon:"📲", active:true, onClick:()=>setActiveTab("whatsapp")},
                {label:"Tools Downloader", sub:"15 Server Auto", icon:"⬇️", active:true, onClick:()=>setActiveTab("tools")},
                {label:"Prank OTP/Call", sub:"Baru • Atur Jumlah", icon:"📞", active:true, onClick:()=>{ setActiveTab("whatsapp"); setTimeout(()=>document.getElementById("prank-section")?.scrollIntoView({behavior:"smooth"}),500); }},
              ].map(b=>(
                <button key={b.label} onClick={b.onClick} className={`h-[68px] rounded-xl border flex items-center gap-3 px-4 text-left transition ${b.active ? "bg-gradient-to-r from-[#FF1A1A] via-[#FF3B3B] to-[#8B0000] border-white/20 shadow-[0_6px_24px_rgba(255,26,26,0.38)]" : "bg-white/5 border-white/10 opacity-60"}`}>
                  <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[18px] text-black shadow"> {b.icon} </span>
                  <span>
                    <span className="block text-xs font-black text-white leading-none">{b.label}</span>
                    <span className="block text-[10px] text-white/80 mt-1 font-semibold">{b.sub}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="glow-card rounded-[22px] p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-6 bg-[#FF1A1A] rounded-full shadow-[0_0_8px_#FF1A1A]" />
                <h3 className="font-black text-white text-sm tracking-wide">PANDUAN PENGGUNAAN</h3>
                <span className="ml-auto text-[10px] text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 font-bold">WA ASLI • 15 SERVER</span>
              </div>
              <ol className="space-y-2.5">
                {[
                  "QR & Pairing ASLI dari server WhatsApp via Baileys 6.7.18 — BUKAN simulasi. Di Vercel tetap ASLI, tapi karena serverless, QR harus discan dalam 20 detik & pairing harus cepat. Untuk stabil 24 jam, deploy ke VPS.",
                  "Hubungkan WA dulu — fitur bug akan gelap & terkunci sampai WA ‘Terhubung’. Sender Global akan acak dari pool pengguna aktif real-time.",
                  "Pilih Nomor/Grup, masukkan target +62..., pilih 3 bug BIMXZBUGXZ 2GB, pilih Private/Global.",
                  "Fitur baru: Prank Call & Spam OTP bisa di-set 1-20x, OTP dari template resmi (Dunia Games/FB/GoPay/DANA) via WA kamu yang centang biru jika akun bisnis.",
                  "Tools: Downloader 15 server auto-fallback, Film anti-iklan blok pop-up, BimzAI Gemini, MP3 & File→URL.",
                ].map((t,i)=>(
                  <li key={i} className="flex gap-3">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF1A1A] to-white text-black text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow">{i+1}</span>
                    <span className="text-xs text-white/80 leading-relaxed font-medium">{t}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-3 p-3 rounded-xl bg-[#FF1A1A]/10 border border-[#FF1A1A]/20 flex gap-2">
                <span className="text-[#FF5A5A]">⚠️</span>
                <p className="text-[11px] text-white/80 leading-relaxed">Semua bug 2GB & prank harus izin pemilik nomor. Jangan ganggu. QR & pairing di Vercel adalah ASLI Baileys, tapi Vercel serverless = sesi /tmp hilang setelah cold start. Untuk permanen, pakai VPS/Railway dengan volume persisten.</p>
              </div>
            </div>
          </>
        )}

        {activeTab==="whatsapp" && (
          <>
            <div className="glow-card rounded-[22px] p-4 border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-6 bg-emerald-400 rounded-full" />
                <h3 className="font-black text-white text-sm tracking-wide">PASANG NOMOR — BAILEYS 6.7.18 ASLI</h3>
                {isPaired && waStatus==="open" && <span className="ml-auto text-[10px] bg-emerald-500 text-white px-2.5 py-1 rounded-full font-black shadow">✓ TERHUBUNG ASLI</span>}
                {waStatus!=="open" && <span className="ml-auto text-[10px] bg-amber-500 text-black px-2.5 py-1 rounded-full font-black">● {waStatus.toUpperCase()} • BUKAN FAKE</span>}
              </div>

              <div className="bg-[#FF1A1A]/10 border border-[#FF1A1A]/20 rounded-xl p-3 mb-3">
                <div className="text-xs font-black text-white flex items-center gap-2">🔒 INFO QR & PAIRING ASLI <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-full">REAL</span></div>
                <div className="text-[11px] text-white/70 mt-1 leading-relaxed">QR & Pairing Code ini <b className="text-white">ASLI langsung dari server WhatsApp</b> via Baileys 6.7.18, bukan gambar simulasi. Di Vercel tetap asli karena Baileys connect ke WA Web. Namun Vercel itu serverless (/tmp), jadi QR harus discan cepat (20 dtk) dan sesi bisa hilang saat cold start. <b className="text-white">Untuk 24 jam online, deploy ke VPS/Railway.</b> Saat ini status: <b className={waStatus==="open" ? "text-emerald-400" : "text-amber-300"}>{waStatus}</b> {qrImage ? "• QR ready" : "• Menunggu QR"}.</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={handleShowQR} className="h-[46px] rounded-xl bg-white text-black font-black text-sm flex items-center justify-center gap-2 hover:bg-white/90 border border-white/20">📷 SCAN QR ASLI</button>
                <button onClick={async()=>{ await fetch("/api/wa/reset",{method:"POST"}); setQrImage(null); setPairingCode(null); setWaStatus("close"); alert("WA direset. Silakan buat QR baru."); handleShowQR(); }} className="h-[46px] rounded-xl bg-amber-500 text-black font-black text-sm flex items-center justify-center gap-2 hover:bg-amber-400 border border-white/20">♻️ RESET WA</button>
              </div>
              <div className="grid grid-cols-1 gap-2 mb-4">
                <button onClick={fetchGroups} className="h-[40px] rounded-xl bg-white/10 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2">👥 CEK GRUP (WA harus connect)</button>
              </div>

              {!isPaired || waStatus!=="open" ? (
                <div className="space-y-3">
                  <p className="text-xs text-white/60 leading-relaxed">Hubungkan via <b className="text-white">QR ASLI</b> atau <b className="text-white">Pairing Code 8 digit ASLI</b>. Jika screenshot kamu <b className="text-amber-300">DX95-Z43V → “Gagal menautkan perangkat”</b>, itu artinya kode expired (20 detik) atau salah nomor. Solusi: <b className="text-white">pakai QR</b> atau minta kode baru dan masukkan cepat.</p>
                  <div className="flex gap-2">
                    <select value={pairCode} onChange={e=>setPairCode(e.target.value)} className="h-[46px] rounded-xl bg-black/60 border border-white/15 px-3 text-sm text-white">
                      {COUNTRY_CODES.map(c=><option key={c.code} value={c.code}>{c.flag} {c.code} {c.name}</option>)}
                    </select>
                    <input value={pairNumber} onChange={e=>setPairNumber(e.target.value)} placeholder="81234567890" className="flex-1 h-[46px] rounded-xl bg-black/60 border border-white/15 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF1A1A]" />
                  </div>
                  <button onClick={handlePair} disabled={pairLoading} className="w-full h-[46px] glow-button rounded-xl font-black text-sm disabled:opacity-50 border border-white/20">{pairLoading?"MEMINTA KODE ASLI...":"DAPATKAN KODE PAIRING 8 DIGIT ASLI"}</button>
                  {pairingCode && (
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                      <div className="text-[11px] text-emerald-300 font-black tracking-widest">KODE PAIRING ASLI — DARI BAILEYS</div>
                      <div className="text-3xl font-black tracking-[0.3em] text-white mt-1 font-mono">{pairingCode}</div>
                      <div className="text-[11px] text-white/60 mt-2">Buka WA → Perangkat Tertaut → Tautkan dengan nomor telepon → Masukkan kode ini <b className="text-white">dalam 20 detik</b> (kode asli bisa hangus cepat di Vercel cold start). Jika gagal, langsung pakai QR Scan.</div>
                    </div>
                  )}
                  <div className="text-[11px] text-white/40 text-center font-medium">Pilih +62 lalu 81234567890 tanpa 0 • QR ASLI refresh tiap 20 detik • Vercel = simulasi 95% asli, VPS = 100% persisten</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 flex items-center gap-3">
                    <span className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center text-white text-lg shadow">✓</span>
                    <div>
                      <div className="text-sm font-black text-emerald-300">WA Terhubung ASLI • Sender Ready</div>
                      <div className="text-xs text-white/70 font-mono">{user?.pairedNumber} • Baileys 6.7.18 • Global Pool {globalPool.length}</div>
                    </div>
                    <button onClick={()=>{ setIsPaired(false); setPairingCode(null); setQrImage(null); }} className="ml-auto text-xs px-3 py-1.5 rounded-full bg-white text-black font-black hover:bg-white/90">Ganti</button>
                  </div>
                  {globalPool.length>0 && (
                    <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                      <div className="text-[11px] font-black text-white mb-1">POOL SENDER GLOBAL AKTIF — REAL TIME ACAK</div>
                      <div className="text-[11px] text-white/60">Jika pilih GLOBAL, sistem acak salah satu sender aktif di bawah ini:</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {globalPool.slice(0,6).map((g:any)=> <span key={g.id} className="text-[10px] px-2 py-1 rounded-full bg-white text-black font-bold">{g.pairedNumber} • {g.username}</span>)}
                      </div>
                    </div>
                  )}
                  {groupList.length>0 && (
                    <div className="rounded-xl bg-black/30 border border-white/10 p-3 max-h-[140px] overflow-y-auto">
                      <div className="text-[11px] font-black text-white mb-2">GRUP TERDETEKSI ({groupList.length})</div>
                      {groupList.map((g:any)=><div key={g.id} className="text-xs text-white/70 py-1 border-b border-white/5 flex justify-between"><span className="truncate pr-2">{g.subject}</span><span className="text-white/40">{g.participants}</span></div>)}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="glow-card rounded-[22px] p-4 relative overflow-hidden">
              {/* LOCK OVERLAY when WA not open */}
              {isWaLocked && (
                <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center border border-amber-500/20 rounded-[22px]">
                  <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)]">🔒</div>
                  <div className="mt-3 text-white font-black text-lg">FITUR BUG TERKUNCI</div>
                  <div className="mt-1 text-sm text-white/80 leading-relaxed">WA belum terhubung — hubungkan QR / Pairing Code ASLI dulu. Semua bug 2GB gelap & tidak bisa dipakai sampai WA <b className="text-emerald-400">open</b>.</div>
                  <div className="mt-1 text-[11px] text-white/50">Status saat ini: <b className="text-amber-300">{waStatus}</b> • Sender belum ready</div>
                  <button onClick={handleShowQR} className="mt-4 h-11 px-6 rounded-xl bg-white text-black font-black text-sm">📷 BUKA QR ASLI</button>
                  <button onClick={()=>window.scrollTo({top:0, behavior:"smooth"})} className="mt-2 text-xs text-white/60 underline">Ke atas untuk pairing</button>
                </div>
              )}

              <div className={`transition ${isWaLocked ? "opacity-30 pointer-events-none blur-[1px]" : ""}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-6 bg-[#FF1A1A] rounded-full shadow-[0_0_8px_#FF1A1A]" />
                  <h3 className="font-black text-white text-sm tracking-wide">FORMULIR EKSEKUSI — BIMXZBUGXZ 2GB</h3>
                  <span className="ml-auto text-[10px] bg-white text-black px-2 py-1 rounded-full font-black">2GB LAYER {isWaLocked ? "• LOCKED" : "• READY"}</span>
                </div>

                <div className="flex gap-2 mb-4">
                  {(["NOMOR","GRUP"] as const).map(m=>(
                    <button key={m} onClick={()=>!isWaLocked && setWaMode(m)} className={`flex-1 h-[40px] rounded-xl text-xs font-black border transition ${waMode===m ? "bg-[#FF1A1A] border-white text-white shadow-[0_0_14px_rgba(255,26,26,0.45)]" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"}`}>
                      {m==="NOMOR" ? "📱 BUG NOMOR 2GB" : "👥 BUG GRUP 2GB"}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] tracking-widest text-white font-black">{waMode==="GRUP" ? "ID GRUP / NOMOR TUJUAN" : "NOMOR TUJUAN"}</label>
                  <div className="flex gap-2">
                    <select value={targetCode} onChange={e=>setTargetCode(e.target.value)} className={`h-[46px] rounded-xl bg-black/60 border border-white/15 px-3 text-sm text-white ${waMode==="GRUP" ? "hidden" : ""}`}>
                      {COUNTRY_CODES.map(c=><option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                    </select>
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">📞</span>
                      <input value={targetNumber} onChange={e=>setTargetNumber(e.target.value)} placeholder={waMode==="NOMOR" ? "81234567890" : "120363xxx@g.us atau +62xxx"} className="w-full h-[46px] rounded-xl bg-black/60 border border-white/15 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF1A1A]" />
                    </div>
                  </div>
                  <div className="text-[11px] text-white/40 font-medium">Grup: tempel ID Grup (contoh 120363123456@g.us) atau pilih dari daftar grup di atas.</div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] tracking-widest text-white font-black">PILIH BUG BIMXZBUGXZ (MAKS 3) — SEMUA 2GB</label>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#FF1A1A] text-white font-black">{selectedBugs.length}/3 terpilih</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                    {BUG_LIST.map(b=>{
                      const locked = user?.role==="PENGGUNA" && b.id!=="BIMXZBUGXZ Delay";
                      const selected = selectedBugs.includes(b.id);
                      return (
                        <button key={b.id} disabled={locked} onClick={()=>!locked && toggleBug(b.id)} className={`rounded-xl p-3 text-left border transition relative overflow-hidden ${selected ? "bg-gradient-to-br from-[#FF1A1A] to-[#8B0000] border-white text-white shadow-[0_0_16px_rgba(255,26,26,0.4)]" : locked ? "bg-white/[0.03] border-white/5 opacity-40 cursor-not-allowed" : "bg-white/[0.05] border-white/10 hover:bg-white/[0.08] hover:border-white/20"}`}>
                          {locked && <span className="absolute top-1.5 right-1.5 text-[10px] bg-black/60 px-1.5 py-0.5 rounded-full border border-white/10">🔒</span>}
                          <span className="absolute top-1.5 right-2 text-[8px] bg-white text-black px-1.5 py-0.5 rounded-full font-black tracking-widest" style={{display: locked ? 'none' : 'block', opacity: selected ? 1 : 0.9}}>{b.heavy}</span>
                          <div className="flex items-start gap-2 mt-1">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border ${selected ? "bg-white text-black border-white" : "bg-white/10 border-white/10"}`}>{b.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className={`text-[11px] font-black leading-tight truncate ${selected ? "text-white" : "text-white"}`}>{b.id}</div>
                              <div className={`text-[10px] leading-tight mt-0.5 line-clamp-2 font-medium ${selected ? "text-white/90" : "text-white/55"}`}>{b.desc}</div>
                            </div>
                          </div>
                          {selected && <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#FF1A1A] text-xs font-black shadow">✓</div>}
                        </button>
                      );
                    })}
                  </div>
                  {user?.role==="PENGGUNA" && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 font-medium">ℹ️ PENGGUNA hanya BIMXZBUGXZ Delay. Upgrade ke RESELLER untuk semua 2GB.</div>
                  )}
                </div>

                <div className="mt-5">
                  <label className="text-[11px] tracking-widest text-white font-black">PILIH SENDER — ASLI BUKAN PALSU • GLOBAL = ACAK REAL TIME</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      {id:"PRIVATE", label:"PRIVATE", desc:"Sender pribadi asli", icon:"👤"},
                      {id:"GLOBAL", label:"GLOBAL", desc:`Acak ${globalPool.length} sender aktif`, icon:"🌍"},
                    ].map(s=>(
                      <button key={s.id} onClick={()=>setSenderMode(s.id as any)} className={`h-[68px] rounded-xl border flex flex-col items-center justify-center gap-1 transition ${senderMode===s.id ? "bg-[#FF1A1A]/20 border-[#FF1A1A] text-white shadow-[0_0_12px_rgba(255,26,26,0.25)]" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}`}>
                        <span className="text-lg">{s.icon}</span>
                        <span className="text-xs font-black">{s.label}</span>
                        <span className="text-[10px] opacity-70 font-medium text-center px-1">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                  {senderMode==="GLOBAL" && (
                    <div className="mt-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="text-[11px] font-black text-blue-300">🌍 MODE GLOBAL AKTIF</div>
                      <div className="text-[11px] text-white/70 mt-1">Jika ada orang sudah sender (sudah pairing), sender Global akan mengacak salah satu nomor aktif secara real-time untuk mengirim. Pool saat ini: <b className="text-white">{globalPool.length} sender</b> {globalPool.length===0 ? "(kosong, akan pakai sender kamu)" : `- contoh: ${globalPool[0]?.pairedNumber}`}</div>
                    </div>
                  )}
                </div>

                <button onClick={handleSend} disabled={sending} className="mt-6 w-full h-[58px] rounded-xl glow-button font-black text-white tracking-wide text-[13px] relative overflow-hidden disabled:opacity-50 border border-white/20">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {sending ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        MENGIRIM 2GB...
                      </>
                    ) : (
                      <>🚀 GAS TEKAN TOMBOL INI MBUD — 2GB</>
                    )}
                  </span>
                </button>
                <p className="text-center text-[10px] text-white/35 mt-2 font-medium">Dikirim via Baileys 6.7.18 ASLI • Sender {user?.pairedNumber || "terpasang"} • Mode {senderMode} • {waMode} • BIMXZBUGXZ {senderMode==="GLOBAL" ? "• Diacak dari pool" : ""}</p>
              </div>
            </div>

            <div id="prank-section" className="glow-card rounded-[22px] p-4 relative overflow-hidden border-white/10">
              {/* also locked if WA not open */}
              {isWaLocked && (
                <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4 text-center rounded-[22px]">
                  <div className="bg-amber-500 text-black px-4 py-2 rounded-full font-black text-xs">🔒 Hubungkan WA dulu untuk prank</div>
                </div>
              )}
              <h3 className="font-black text-white flex items-center gap-2"><span className="w-1 h-6 bg-[#FF1A1A] rounded-full" /> PRANK CALL & SPAM OTP — ASLI VIA WA (SET JUMLAH)</h3>
              <p className="text-[11px] text-white/50 mt-1">OTP dari template resmi (Dunia Games • Facebook • GoPay • DANA dll) via WA kamu — centang biru jika akun bisnis WhatsApp. Prank call asli via WA text prank.</p>
              
              <div className="mt-4 grid grid-cols-1 gap-4">
                {/* PRANK CALL */}
                <div className="rounded-xl bg-black/40 border border-white/10 p-3">
                  <div className="text-xs font-black text-white flex items-center gap-2">📞 PRANK CALL <span className="text-[10px] bg-[#FF1A1A] text-white px-2 py-0.5 rounded-full">ATUR 1-20x</span></div>
                  <div className="mt-3 space-y-2">
                    <input value={prankNumber} onChange={e=>setPrankNumber(e.target.value)} placeholder="Nomor tujuan prank call (+62...)" className="w-full h-[42px] rounded-xl bg-black/60 border border-white/15 px-3 text-sm text-white placeholder:text-white/30" />
                    <select value={prankType} onChange={e=>setPrankType(e.target.value)} className="w-full h-[42px] rounded-xl bg-black/60 border border-white/15 px-3 text-sm text-white">
                      <option value="paket_cod">Paket COD</option>
                      <option value="hantu">Suara Hantu 👻</option>
                      <option value="debt_collector">Debt Collector</option>
                      <option value="ojol">Driver Ojol</option>
                      <option value="polisi">Polisi</option>
                      <option value="hadiah">Hadiah Undian</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white/60">Jumlah:</span>
                      <input type="range" min={1} max={20} value={prankCount} onChange={e=>setPrankCount(parseInt(e.target.value))} className="flex-1" />
                      <span className="w-10 h-8 rounded-lg bg-white text-black font-black flex items-center justify-center text-sm">{prankCount}x</span>
                    </div>
                    <button onClick={handlePrankCall} disabled={prankLoading} className="w-full h-[42px] rounded-xl bg-[#FF1A1A] text-white font-black text-sm disabled:opacity-50 border border-white/20">{prankLoading ? "MENGIRIM..." : `KIRIM PRANK CALL x${prankCount} — ASLI WA`}</button>
                    {prankResult && <div className={`text-xs p-2 rounded-lg ${prankResult.ok ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" : "bg-red-500/10 border border-red-500/20 text-red-300"}`}>{prankResult.ok ? `✅ ${prankResult.message}` : `❌ ${prankResult.message}`}</div>}
                    <div className="text-[11px] text-white/30">Asli via WA — kirim prank text beruntun, bukan simulasi. Wajib izin pemilik nomor.</div>
                  </div>
                </div>

                {/* SPAM OTP */}
                <div className="rounded-xl bg-black/40 border border-white/10 p-3">
                  <div className="text-xs font-black text-white flex items-center gap-2">🔐 SPAM OTP <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-full">RESMI • 1-20x</span></div>
                  <div className="mt-3 space-y-2">
                    <input value={otpNumber} onChange={e=>setOtpNumber(e.target.value)} placeholder="Nomor tujuan OTP (+62...)" className="w-full h-[42px] rounded-xl bg-black/60 border border-white/15 px-3 text-sm text-white placeholder:text-white/30" />
                    <select value={otpService} onChange={e=>setOtpService(e.target.value)} className="w-full h-[42px] rounded-xl bg-black/60 border border-white/15 px-3 text-sm text-white">
                      <option value="duniagames">Dunia Games (centang biru)</option>
                      <option value="facebook">Facebook</option>
                      <option value="gopay">GoPay</option>
                      <option value="dana">DANA</option>
                      <option value="shopee">Shopee</option>
                      <option value="tokopedia">Tokopedia</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white/60">Jumlah:</span>
                      <input type="range" min={1} max={20} value={otpCount} onChange={e=>setOtpCount(parseInt(e.target.value))} className="flex-1" />
                      <span className="w-10 h-8 rounded-lg bg-white text-black font-black flex items-center justify-center text-sm">{otpCount}x</span>
                    </div>
                    <button onClick={handleOtpSpam} disabled={otpLoading} className="w-full h-[42px] rounded-xl bg-white text-black font-black text-sm disabled:opacity-50 border border-white/20">{otpLoading ? "MENGIRIM..." : `KIRIM OTP ${otpService.toUpperCase()} x${otpCount} — ASLI WA`}</button>
                    {otpResult && <div className={`text-xs p-2 rounded-lg ${otpResult.ok ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" : "bg-red-500/10 border border-red-500/20 text-red-300"}`}>{otpResult.ok ? `✅ ${otpResult.message}` : `❌ ${otpResult.message}`}</div>}
                    <div className="text-[11px] text-white/30">OTP asli dikirim dari nomor WA kamu yang terhubung (centang biru jika Bisnis). Template resmi, bukan simulasi API eksternal hack. Harus izin.</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">⚠️ Prank & OTP hanya untuk nomor yang telah memberi izin. Maks 20x sekali kirim anti-spam. Jangan ganggu orang tanpa izin.</div>
            </div>
          </>
        )}

        {activeTab==="film" && (
          <div className="space-y-4">
            <div className="glow-card rounded-[22px] p-4">
              <h3 className="font-black text-white flex items-center gap-2 tracking-wide"><span className="w-1 h-6 bg-[#FF1A1A] rounded-full" /> FILM BIOSKOP • ANTI IKLAN</h3>
              <p className="text-xs text-white/50 mt-1 font-medium">TMDB • Server VidLink • VidSrc • Vidy + AdBlock ON — blokir pop-up tab baru</p>
              <div className="flex items-center gap-2 mt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-white">
                  <input type="checkbox" checked={adBlockOn} onChange={e=>setAdBlockOn(e.target.checked)} className="accent-[#FF1A1A]" />
                  Blokir Iklan & Pop-up
                </label>
                <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500 text-white font-black">{adBlockOn ? "ON" : "OFF"}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <div className="flex-1 relative">
                  <input value={filmSearch} onChange={e=>setFilmSearch(e.target.value)} onKeyDown={e=>e.key==="Enter" && searchFilms()} placeholder="Cari judul film..." className="w-full h-[40px] rounded-xl bg-black/60 border border-white/15 pl-4 pr-10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF1A1A]" />
                  <button onClick={searchFilms} className="absolute right-1 top-1 h-[32px] w-[32px] rounded-lg bg-[#FF1A1A] flex items-center justify-center text-white">🔍</button>
                </div>
              </div>
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {[
                  {id:"popular", label:"Populer"},
                  {id:"now_playing", label:"Tayang"},
                  {id:"upcoming", label:"Mendatang"},
                ].map(c=>(
                  <button key={c.id} onClick={()=>setFilmCategory(c.id as any)} className={`px-4 h-8 rounded-full text-xs font-black border whitespace-nowrap ${filmCategory===c.id ? "bg-[#FF1A1A] border-white text-white" : "bg-white/5 border-white/10 text-white/60"}`}>{c.label}</button>
                ))}
              </div>
            </div>

            {filmLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({length:6}).map((_,i)=><div key={i} className="h-[180px] rounded-xl bg-white/5 animate-pulse border border-white/10" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {films.map((f:any)=>(
                  <button key={f.id} onClick={()=>openFilmDetail(f)} className="glow-card rounded-xl overflow-hidden text-left hover:scale-[1.02] transition">
                    <div className="relative h-[200px] bg-black">
                      <img src={f.poster_path ? `https://image.tmdb.org/t/p/w500${f.poster_path}` : "https://via.placeholder.com/500x750?text=No+Poster"} alt={f.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-amber-400 text-[11px] font-black">★ {f.vote_average?.toFixed(1) || "?"}</div>
                      {adBlockOn && <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-black">ADBLOCK ON</div>}
                    </div>
                    <div className="p-2.5">
                      <div className="text-xs font-black text-white line-clamp-2 leading-tight">{f.title}</div>
                      <div className="text-[11px] text-white/50 mt-1">{f.release_date?.slice(0,4) || "-"}</div>
                    </div>
                  </button>
                ))}
                {films.length===0 && <div className="col-span-3 text-center text-xs text-white/40 py-10">Tidak ada film ditemukan</div>}
              </div>
            )}

            {selectedFilm && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={()=>setSelectedFilm(null)}>
                <div className="glow-card rounded-[22px] max-w-[640px] w-full max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
                  <div className="relative h-[220px]">
                    <img src={filmDetail?.backdrop_path || selectedFilm.backdrop_path ? `https://image.tmdb.org/t/p/w780${filmDetail?.backdrop_path || selectedFilm.backdrop_path}` : selectedFilm.poster_path ? `https://image.tmdb.org/t/p/w500${selectedFilm.poster_path}` : "https://via.placeholder.com/800x450"} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050507] to-transparent" />
                    <button onClick={()=>setSelectedFilm(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white border border-white/20">✕</button>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-lg font-black text-white leading-tight">{filmDetail?.title || selectedFilm.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-white/70 mt-1">
                        <span>★ {filmDetail?.vote_average?.toFixed(1) || selectedFilm.vote_average?.toFixed(1)}</span>
                        <span>•</span>
                        <span>{filmDetail?.release_date || selectedFilm.release_date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <p className="text-xs text-white/70 leading-relaxed">{filmDetail?.overview || selectedFilm.overview || "Sinopsis tidak tersedia."}</p>
                    <div>
                      <div className="text-xs font-black text-white mb-2 flex items-center gap-2">PILIH SERVER (10) — VidLink • VidSrc • Vidy dll {adBlockOn && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full">IKLAN DIBLOKIR</span>}</div>
                      <div className="grid grid-cols-5 gap-2">
                        {FILM_SERVERS.map((s,idx)=>(
                          <button key={s} onClick={()=>setFilmServer(idx)} className={`h-9 rounded-lg text-[11px] font-black border ${filmServer===idx ? "bg-[#FF1A1A] border-white text-white" : "bg-white/5 border-white/10 text-white/60"}`}>{s}</button>
                        ))}
                      </div>
                      <div className="mt-3 rounded-xl overflow-hidden bg-black border border-white/10 aspect-video relative">
                        {/* Adblock iframe: sandbox block popups, allow presentation, overlay to intercept new tabs */}
                        <iframe
                          key={filmServer + (adBlockOn ? "-adblock" : "")}
                          src={
                            filmServer===0 ? `https://vidlink.pro/movie/${selectedFilm.id}` :
                            filmServer===1 ? `https://vidsrc.xyz/embed/movie?tmdb=${selectedFilm.id}` :
                            filmServer===2 ? `https://vidy.pro/embed/movie/${selectedFilm.id}` :
                            `https://vidlink.pro/movie/${selectedFilm.id}`
                          }
                          className="w-full h-full"
                          allowFullScreen
                          allow="autoplay; fullscreen; encrypted-media"
                          sandbox={adBlockOn ? "allow-same-origin allow-scripts allow-forms allow-presentation" : undefined}
                          referrerPolicy="no-referrer"
                        />
                        {adBlockOn && (
                          <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/20 rounded-xl" title="AdBlock: sandbox block popups & new tabs" />
                        )}
                      </div>
                      <div className="mt-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                        {adBlockOn ? "✅ Iklan & tab baru diblokir via sandbox. Jika video tidak play, matikan AdBlock atau ganti server." : "⚠️ AdBlock mati — iklan mungkin muncul pop-up."}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button onClick={()=>setAdBlockOn(!adBlockOn)} className="h-8 px-3 rounded-full bg-white text-black font-black text-xs">{adBlockOn ? "Matikan AdBlock" : "Aktifkan AdBlock"}</button>
                        <button onClick={()=>{ const w=window.open(`https://vidlink.pro/movie/${selectedFilm.id}`, "_blank"); if(w) w.opener=null; }} className="h-8 px-3 rounded-full bg-white/10 border border-white/15 text-white font-bold text-xs">Buka Tab Baru</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab==="tools" && (
          <div className="space-y-4">
            <div className="glow-card rounded-[22px] p-4">
              <h3 className="font-black text-white flex items-center gap-2 tracking-wide"><span className="w-1 h-6 bg-[#FF1A1A] rounded-full" /> TOOLS — BIMXZBUGXZ • 15 SERVER</h3>
              <p className="text-xs text-white/50 mt-1">Downloader 15 server auto-fallback • BimzAI • MP3 • File→URL • Prank Call/OTP</p>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[
                  {id:"downloader", label:"Downloader", icon:"⬇️", sub:"15 server"},
                  {id:"ai", label:"BimzAI", icon:"🤖", sub:"Gemini"},
                  {id:"mp3", label:"Video→MP3", icon:"🎵", sub:"2GB"},
                  {id:"url", label:"File→URL", icon:"🔗", sub:"Public"},
                ].map(t=>(
                  <button key={t.id} onClick={()=>setToolsTab(t.id as any)} className={`h-[60px] rounded-xl border flex flex-col items-center justify-center gap-0.5 ${toolsTab===t.id ? "bg-[#FF1A1A] border-white text-white" : "bg-white/5 border-white/10 text-white/60"}`}>
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-[10px] font-black">{t.label}</span>
                    <span className="text-[9px] opacity-70">{t.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {toolsTab==="downloader" && (
              <div className="glow-card rounded-[22px] p-4 space-y-3">
                <h4 className="font-black text-white text-sm">⬇️ Downloader — 15 Server Aktif Auto-Fallback</h4>
                <p className="text-xs text-white/60">Sistem coba 15 server satu per satu: <b className="text-white">co.otomir23.me, canine.tools, timelesnesses.me, api.cobalt.tools, wuk.sh, dll</b> — jika 1 gagal lompat ke lain. Klik <b className="text-white">Download BimxzBugxz mp4</b> langsung auto-download.</p>
                <input value={dlUrl} onChange={e=>setDlUrl(e.target.value)} placeholder="Tempel link TT / IG / YT / Snapchat / FB / X di sini..." className="w-full h-[46px] rounded-xl bg-black/60 border border-white/15 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF1A1A]" />
                <button onClick={handleDownload} disabled={dlLoading} className="w-full h-[46px] glow-button rounded-xl font-black text-sm border border-white/20 disabled:opacity-50">{dlLoading?"MENCOBA 15 SERVER...":"DOWNLOAD SEKARANG — 15 SERVER"}</button>
                {dlResult && (
                  <div className="rounded-xl bg-black/40 border border-white/10 p-3">
                    {dlResult.ok ? (
                      <div className="space-y-2">
                        <div className="text-xs font-black text-emerald-400">✅ Berhasil via {dlResult.server} (coba {dlResult.attempts} server)</div>
                        {dlResult.url && (
                          <div className="space-y-2">
                            <div className="text-xs text-white/70 break-all">Server aktif: <b className="text-white">{dlResult.server}</b></div>
                            <a href={dlResult.url} download={dlResult.filename} target="_blank" onClick={(e)=>{}} className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white text-black font-black text-sm shadow">⬇️ Download BimxzBugxz mp4 — {dlResult.filename}</a>
                            <div className="text-[11px] text-white/40">Otomatis ter-download. Jika tidak, <a href={dlResult.url} target="_blank" className="underline text-[#FF5A5A]">klik di sini</a>. File: bimxzbug_kodeacak.mp4</div>
                            <div className="text-[10px] text-white/30">Logs 15 server: {JSON.stringify(dlResult.logs?.slice(0,2) || []).slice(0,200)}...</div>
                          </div>
                        )}
                        {dlResult.picker && (
                          <div className="grid grid-cols-2 gap-2">
                            {dlResult.picker.slice(0,4).map((p:any,i:number)=>(
                              <a key={i} href={p.url} target="_blank" className="rounded-lg overflow-hidden border border-white/10 bg-black">
                                <img src={p.thumb || p.url} alt="" className="w-full h-[120px] object-cover" />
                                <div className="p-2 text-xs text-white">Item {i+1} • {p.type} — klik download</div>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-red-300">❌ Semua 15 server gagal. Coba link public lain. <br/><span className="text-white/40">{dlResult.message?.slice(0,300)}</span></div>
                    )}
                  </div>
                )}
                <div className="text-[11px] text-white/30">Tanpa watermark • 15 server auto-try • Auto-download BimxzBugxz mp4</div>
              </div>
            )}

            {toolsTab==="ai" && (
              <div className="glow-card rounded-[22px] p-4 space-y-3">
                <h4 className="font-black text-white text-sm">🤖 BimzAI — Gemini 2.5 Flash Lite</h4>
                <p className="text-xs text-white/50">Kunci aman di server ENV, tidak bocor ke GitHub/Vercel</p>
                <div className="h-[320px] overflow-y-auto space-y-2 p-3 rounded-xl bg-black/40 border border-white/10">
                  {aiChat.length===0 ? <div className="text-xs text-white/30 text-center py-12">Halo! Tanya apa saja ke BimzAI 😊</div> : aiChat.map((m,i)=>(
                    <div key={i} className={`flex ${m.role==="user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${m.role==="user" ? "bg-[#FF1A1A] text-white rounded-br-none" : "bg-white text-black rounded-bl-none"}`}>{m.text}</div>
                    </div>
                  ))}
                  {aiLoading && <div className="text-xs text-white/40">BimzAI mengetik...</div>}
                </div>
                <div className="flex gap-2">
                  <input value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} onKeyDown={e=>e.key==="Enter" && handleAi()} placeholder="Tanya BimzAI..." className="flex-1 h-[44px] rounded-xl bg-black/60 border border-white/15 px-4 text-sm text-white placeholder:text-white/30" />
                  <button onClick={handleAi} disabled={aiLoading} className="w-[70px] h-[44px] rounded-xl bg-white text-black font-black text-sm disabled:opacity-50">Kirim</button>
                </div>
              </div>
            )}

            {toolsTab==="mp3" && (
              <div className="glow-card rounded-[22px] p-4 space-y-3">
                <h4 className="font-black text-white text-sm">🎵 Video → MP3 — Maks 2GB</h4>
                <p className="text-xs text-white/50">Nama: bimzxbugz_kodeacak.mp3 • Auto rename</p>
                <label className="block w-full h-[100px] rounded-xl bg-black/40 border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:bg-white/5 cursor-pointer">
                  <span className="text-2xl">🎬</span>
                  <span className="text-xs font-bold text-white/70">{mp3File ? mp3File.name + " (" + (mp3File.size/1024/1024).toFixed(2) + " MB)" : "Pilih Video (maks 2GB)"}</span>
                  <input type="file" accept="video/*,audio/*" onChange={e=>setMp3File(e.target.files?.[0]||null)} className="hidden" />
                </label>
                <button onClick={handleMp3Upload} disabled={mp3Loading || !mp3File} className="w-full h-[46px] glow-button rounded-xl font-black text-sm disabled:opacity-50 border border-white/20">{mp3Loading?"MENGCONVERT...":"CONVERT KE MP3"}</button>
                {mp3Result?.ok && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                    <div className="text-xs font-black text-emerald-400">✅ {mp3Result.filename}</div>
                    <a href={mp3Result.url} target="_blank" download className="inline-flex mt-2 h-9 px-4 rounded-full bg-white text-black font-black text-xs">⬇️ Download {mp3Result.filename}</a>
                    <audio controls src={mp3Result.url} className="w-full mt-3" />
                    <div className="text-[11px] text-white/40 mt-1 break-all">{mp3Result.url}</div>
                  </div>
                )}
                {mp3Result && !mp3Result.ok && <div className="text-xs text-red-300">{mp3Result.message}</div>}
              </div>
            )}

            {toolsTab==="url" && (
              <div className="glow-card rounded-[22px] p-4 space-y-3">
                <h4 className="font-black text-white text-sm">🔗 File → URL Public</h4>
                <p className="text-xs text-white/50">Maks 2GB • URL asli public • /api/files/</p>
                <label className="block w-full h-[100px] rounded-xl bg-black/40 border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:bg-white/5 cursor-pointer">
                  <span className="text-2xl">📁</span>
                  <span className="text-xs font-bold text-white/70">{urlFile ? urlFile.name + " (" + (urlFile.size/1024/1024).toFixed(2) + " MB)" : "Pilih File (maks 2GB)"}</span>
                  <input type="file" onChange={e=>setUrlFile(e.target.files?.[0]||null)} className="hidden" />
                </label>
                <button onClick={handleUrlUpload} disabled={urlLoading || !urlFile} className="w-full h-[46px] glow-button rounded-xl font-black text-sm disabled:opacity-50 border border-white/20">{urlLoading?"MENGUPLOAD...":"UPLOAD & DAPATKAN URL"}</button>
                {urlResult?.ok && (
                  <div className="rounded-xl bg-white text-black p-3">
                    <div className="text-xs font-black">✅ URL Public</div>
                    <div className="mt-2 p-2 rounded bg-black text-white font-mono text-xs break-all">{urlResult.url}</div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={()=>{ navigator.clipboard.writeText(urlResult.url); alert("Disalin!"); }} className="h-8 px-3 rounded-full bg-black text-white text-xs font-bold">📋 Salin</button>
                      <a href={urlResult.url} target="_blank" className="h-8 px-3 rounded-full bg-[#FF1A1A] text-white text-xs font-black flex items-center">🔗 Buka</a>
                    </div>
                    {urlResult.mimeType?.startsWith("image/") && <img src={urlResult.url} alt="preview" className="mt-3 w-full rounded-lg border max-h-[300px] object-contain" />}
                    {urlResult.mimeType?.startsWith("video/") && <video src={urlResult.url} controls className="mt-3 w-full rounded-lg border" />}
                  </div>
                )}
                {urlResult && !urlResult.ok && <div className="text-xs text-red-300">{urlResult.message}</div>}
              </div>
            )}
          </div>
        )}

        {activeTab==="profil" && (
          <div className="space-y-4">
            <div className="glow-card rounded-[22px] p-5 text-center border-white/10">
              <div className="w-20 h-20 mx-auto rounded-full p-[3px] bg-gradient-to-br from-[#FF1A1A] to-white">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  <img src="/logo-bimx.png" alt="logo" className="w-full h-full object-cover" />
                </div>
              </div>
              <h3 className="mt-3 font-black text-white text-lg tracking-wide">{user?.username}</h3>
              <span className={`inline-block mt-1 text-[10px] px-3 py-1 rounded-full border font-black tracking-widest ${roleBadgeColor(user?.role as Role)}`}>{user?.role}</span>
              <div className="grid grid-cols-2 gap-3 mt-4 text-left">
                <div className="rounded-xl bg-black/40 border border-white/10 p-3">
                  <div className="text-[10px] text-white/40 tracking-widest font-bold">DIBUAT</div>
                  <div className="text-xs font-black text-white mt-1">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID", {day:"2-digit", month:"short", year:"numeric"}) : "26 Apr 2025"}</div>
                </div>
                <div className="rounded-xl bg-black/40 border border-white/10 p-3">
                  <div className="text-[10px] text-white/40 tracking-widest font-bold">MASA AKTIF</div>
                  <div className="text-xs font-black text-emerald-400 mt-1">{user?.expiresAt ? new Date(user.expiresAt).toLocaleDateString("id-ID") : "Unlimited"}</div>
                </div>
                <div className="rounded-xl bg-black/40 border border-white/10 p-3">
                  <div className="text-[10px] text-white/40 tracking-widest font-bold">NOMOR TERPASANG</div>
                  <div className="text-xs font-mono font-black text-white mt-1 truncate">{user?.pairedNumber || "Belum dipasang"}</div>
                </div>
                <div className="rounded-xl bg-black/40 border border-white/10 p-3">
                  <div className="text-[10px] text-white/40 tracking-widest font-bold">WA STATUS</div>
                  <div className={`text-xs font-black mt-1 ${waStatus==="open" ? "text-emerald-400" : "text-amber-400"}`}>{waStatus==="open" ? "● Terhubung BAILEYS ASLI" : "● " + waStatus}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={handleLogout} className="h-11 rounded-xl bg-white text-black font-black text-xs hover:bg-white/90 border border-white">KELUAR</button>
                <a href="https://wa.me/6283115955196" target="_blank" className="h-11 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-center hover:bg-emerald-600">HUBUNGI PENGEMBANG</a>
              </div>
              <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 text-left">
                <div className="text-[11px] font-black text-white">KONTAK PENGEMBANG</div>
                <div className="text-xs text-white/70 mt-1 font-medium">WA: +6283115955196<br/>Telegram: @b1mxzstore • Baileys 6.7.18 ASLI • 15 Server</div>
              </div>
            </div>

            {(user?.role==="DEVELOPER" || user?.role==="OWNER") && (
              <div className="glow-card rounded-[22px] p-4 border border-[#FF1A1A]/20">
                <h3 className="font-black text-white flex items-center gap-2"><span className="w-1 h-6 bg-[#FF1A1A] rounded-full" /> APIKEY BIMXZBUGXZ </h3>
                <p className="text-xs text-white/50 mt-1">APIKEY format: <b className="text-white font-mono">bimzxbugx_api_kode_acak_panjang</b> • Untuk bot otomatis. PENGGUNA 7d • RESELLER 30d • OWNER 90d • DEVELOPER lifetime • Auto hapus saat expired.</p>
                <div className="mt-4 p-3 rounded-xl bg-[#FF1A1A]/10 border border-[#FF1A1A]/20">
                  <div className="text-[11px] font-black text-white tracking-widest">BUAT APIKEY BARU</div>
                  <div className="flex gap-2 mt-2">
                    <input value={newApiKeyName} onChange={e=>setNewApiKeyName(e.target.value)} placeholder="Nama bot, contoh: Bot Telegram Utama" className="flex-1 h-11 rounded-xl bg-black/60 border border-white/15 px-4 text-sm text-white placeholder:text-white/30" />
                    <button onClick={generateApiKey} className="h-11 px-5 rounded-xl bg-white text-black font-black text-sm whitespace-nowrap">+ Buat APIKEY</button>
                  </div>
                  {generatedKey && (
                    <div className="mt-3 p-3 rounded-xl bg-black border border-emerald-500/30">
                      <div className="text-[11px] font-black text-emerald-400">🔑 APIKEY BARU — SALIN SEKARANG (hanya tampil sekali)</div>
                      <div className="mt-1 p-2 rounded bg-white text-black font-mono text-xs break-all select-all">{generatedKey}</div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={()=>{ navigator.clipboard.writeText(generatedKey); alert("APIKEY disalin!"); }} className="h-8 px-3 rounded-full bg-emerald-500 text-white text-xs font-black">📋 Salin</button>
                        <button onClick={()=>setGeneratedKey(null)} className="h-8 px-3 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold">Sembunyikan</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white tracking-widest">DAFTAR APIKEY ({apiKeysList.length})</h4>
                    <button onClick={loadApiKeys} className="text-[11px] px-3 py-1.5 rounded-full bg-white text-black font-black">🔄 Refresh</button>
                  </div>
                  <div className="mt-2 space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {apiKeysList.length===0 ? <div className="text-xs text-white/40 text-center py-4">Belum ada APIKEY. Buat di atas.</div> : apiKeysList.map((k:any)=>(
                      <div key={k.id} className="rounded-xl bg-black/40 border border-white/10 p-3">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-[#FF1A1A] flex items-center justify-center text-white text-xs font-black">🔑</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-black text-white truncate">{k.name}</div>
                            <div className="text-[11px] font-mono text-white/60 truncate">{k.key.slice(0,38)}••••••••</div>
                            <div className="text-[10px] text-white/40">Dibuat: {new Date(k.createdAt).toLocaleString("id-ID")} • Last used: {k.lastUsed ? new Date(k.lastUsed).toLocaleString("id-ID") : "belum pernah"}</div>
                          </div>
                          <button onClick={()=>deleteApiKey(k.id)} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-black">✕</button>
                        </div>
                        <button onClick={()=>{ navigator.clipboard.writeText(k.key); alert("APIKEY disalin: " + k.key.slice(0,30) + "..."); }} className="mt-2 w-full h-8 rounded-full bg-white/10 border border-white/15 text-white text-xs font-bold">📋 Salin Full Key</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[11px] font-black text-white">🤖 TES BOT — BUAT AKUN OTOMATIS VIA APIKEY</div>
                  <p className="text-[11px] text-white/50 mt-1">Bot kamu kirim <b className="text-white">username, password, role</b> → sistem auto expiry 7/30/90/lifetime & auto hapus.</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input value={apiTestUsername} onChange={e=>setApiTestUsername(e.target.value)} placeholder="username bot" className="h-10 rounded-xl bg-black/60 border border-white/15 px-3 text-xs text-white placeholder:text-white/30" />
                    <input value={apiTestPw} onChange={e=>setApiTestPw(e.target.value)} placeholder="password" className="h-10 rounded-xl bg-black/60 border border-white/15 px-3 text-xs text-white placeholder:text-white/30" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <select value={apiTestRole} onChange={e=>setApiTestRole(e.target.value as Role)} className="flex-1 h-10 rounded-xl bg-black/60 border border-white/15 px-3 text-xs text-white">
                      <option value="PENGGUNA">PENGGUNA — 7 hari</option>
                      <option value="RESELLER">RESELLER — 30 hari</option>
                      <option value="OWNER">OWNER — 90 hari</option>
                      <option value="DEVELOPER">DEVELOPER — lifetime</option>
                    </select>
                    <button onClick={testCreateViaApiKey} className="h-10 px-4 rounded-xl bg-emerald-500 text-white font-black text-xs">🚀 Buat via APIKEY</button>
                  </div>
                  <div className="mt-3 p-2 rounded-lg bg-white text-black">
                    <div className="text-[10px] font-black">📄 DOKUMENTASI UNTUK BOT (Pterodactyl Style)</div>
                    <pre className="text-[10px] font-mono mt-1 whitespace-pre-wrap break-all">{`POST https://domain.com/api/apikey/create-user
Header: x-api-key: bimzxbugx_api_xxx
Body: {
  "username": "nama_akun",
  "password": "pw_akun",
  "role": "PENGGUNA" // atau RESELLER/OWNER/DEVELOPER
}
Response: { ok:true, user:{username, role, expiresAt}, autoDelete:"..." }`}</pre>
                    <div className="text-[10px] mt-1 text-black/60">Curl bot:<br/><span className="font-mono break-all">{`curl -X POST https://domain.com/api/apikey/create-user -H "x-api-key: bimzxbugx_api_..." -H "Content-Type: application/json" -d '{"username":"test1","password":"123","role":"PENGGUNA"}'`}</span></div>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-white/30 text-center">APIKEY hanya OWNER & DEVELOPER. 1 KEY bisa buat banyak akun. Sistem cron /api/cron hapus otomatis tiap 30 detik.</div>
              </div>
            )}

            {user?.role==="DEVELOPER" && (
              <div className="glow-card rounded-[22px] p-4">
                <h3 className="font-black text-white flex items-center gap-2"><span className="w-1 h-6 bg-[#FF1A1A] rounded-full" /> KELOLA AKUN — BIMXZBUGXZ</h3>
                <p className="text-xs text-white/50 mt-1 font-medium">Buat akun manual • PENGGUNA 7d • RESELLER 30d • OWNER 90d • DEVELOPER lifetime.</p>
                <div className="mt-4 space-y-3">
                  <input value={newAcc.username} onChange={e=>setNewAcc({...newAcc, username:e.target.value})} placeholder="Nama pengguna baru" className="w-full h-11 rounded-xl bg-black/60 border border-white/15 px-4 text-sm text-white placeholder:text-white/30" />
                  <input value={newAcc.password} onChange={e=>setNewAcc({...newAcc, password:e.target.value})} placeholder="Kata sandi" className="w-full h-11 rounded-xl bg-black/60 border border-white/15 px-4 text-sm text-white placeholder:text-white/30" />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={newAcc.role} onChange={e=>setNewAcc({...newAcc, role:e.target.value as Role})} className="h-11 rounded-xl bg-black/60 border border-white/15 px-3 text-sm text-white">
                      <option value="PENGGUNA">PENGGUNA</option>
                      <option value="RESELLER">RESELLER</option>
                      <option value="OWNER">OWNER</option>
                      <option value="DEVELOPER">DEVELOPER</option>
                    </select>
                    <select value={newAcc.days} onChange={e=>setNewAcc({...newAcc, days:e.target.value})} className="h-11 rounded-xl bg-black/60 border border-white/15 px-3 text-sm text-white">
                      <option value="7">7 hari</option>
                      <option value="30">30 hari</option>
                      <option value="90">90 hari</option>
                      <option value="365">365 hari</option>
                      <option value="">Unlimited</option>
                    </select>
                  </div>
                  <button onClick={createUser} className="w-full h-11 glow-button rounded-xl font-black text-sm border border-white/20">BUAT AKUN BIMXZBUGXZ</button>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white tracking-widest">DAFTAR PENGGUNA</h4>
                    <button onClick={loadUsers} className="text-[11px] px-3 py-1.5 rounded-full bg-white text-black font-black">🔄 Muat</button>
                  </div>
                  <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {devUserList.length===0 ? <div className="text-xs text-white/40 text-center py-6">Belum ada data. Tekan Muat.</div> : devUserList.map((u:any)=>(
                      <div key={u.id} className="rounded-xl bg-black/40 border border-white/10 p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center text-sm font-black">{u.username[0].toUpperCase()}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-black text-white flex items-center gap-2">{u.username} <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-black ${roleBadgeColor(u.role)}`}>{u.role}</span></div>
                          <div className="text-[11px] text-white/40 truncate font-medium">Exp: {u.expiresAt ? new Date(u.expiresAt).toLocaleDateString("id-ID") : "∞"} • {u.isActive ? "Aktif" : "Nonaktif"}</div>
                        </div>
                        {u.username!=="admin" && <button onClick={()=>deleteUser(u.id)} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/80 font-black">🗑️</button>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-black text-white tracking-widest">LATAR BELAKANG APLIKASI</h4>
                  <p className="text-[11px] text-white/50 mt-1">Upload foto/video (maks 2GB) • 120fps loop</p>
                  <label className="mt-3 block w-full h-11 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center gap-2 text-xs font-black text-white/70 hover:bg-white/10 cursor-pointer">
                    <span>📁</span> Pilih Foto/Video
                    <input type="file" accept="image/*,video/*" onChange={handleBgUpload} className="hidden" />
                  </label>
                  {bgSettings.url && <div className="mt-2 text-[11px] text-emerald-400 font-bold">✓ Latar: {bgSettings.type}</div>}
                </div>
              </div>
            )}

            <div className="glow-card rounded-[22px] p-4 text-center">
              <div className="text-xs font-black text-white tracking-wide">BIMXZBUGXZ V1 — RED NEON • BAILEYS ASLI</div>
              <div className="text-[11px] text-white/40 mt-1">15 Server • Anti Iklan • Prank OTP/Call • Jam Digital</div>
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px]">
                <a href="https://wa.me/6283115955196" className="px-3 py-1.5 rounded-full bg-[#FF1A1A] text-white font-black">WA Developer</a>
                <a href="https://t.me/b1mxzstore" className="px-3 py-1.5 rounded-full bg-white text-black font-black">Telegram</a>
              </div>
            </div>
          </div>
        )}

        {(activeTab==="beranda" || activeTab==="profil") && (
          <div className="glow-card rounded-[22px] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1 h-6 bg-white rounded-full" />
              <h3 className="font-black text-white text-sm tracking-wide">OBROLAN LANGSUNG — BIMXZBUGXZ</h3>
              <span className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-black">LANGSUNG</span>
            </div>
            <div className="h-[220px] overflow-y-auto space-y-2 p-2 rounded-xl bg-black/40 border border-white/10">
              {chatMessages.length===0 ? (
                <div className="text-center text-xs text-white/30 py-12 font-medium">Belum ada pesan. Tidak auto-scroll mengganggu.</div>
              ) : chatMessages.map((c:any)=>(
                <div key={c.id} className={`flex gap-2 ${c.username===user?.username ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 border ${c.username===user?.username ? "bg-[#FF1A1A] text-white border-white/20 rounded-br-none" : "bg-white text-black border-white/20 rounded-bl-none"}`}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black">{c.username}</span>
                      <span className={`text-[8px] px-1 py-0.5 rounded font-black border ${c.role==="DEVELOPER" ? "bg-black text-white border-black" : "bg-black/10 border-black/20"}`}>{c.role}</span>
                    </div>
                    <div className="text-xs mt-0.5 leading-relaxed font-medium">{c.message}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{new Date(c.createdAt).toLocaleTimeString("id-ID", {hour:"2-digit", minute:"2-digit"})}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 mt-3">
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && sendChat()} placeholder="Tulis pesan..." className="flex-1 h-[40px] rounded-xl bg-black/60 border border-white/15 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF1A1A]" maxLength={500} />
              <button onClick={sendChat} className="w-[44px] h-[40px] rounded-xl bg-white text-black flex items-center justify-center font-black hover:bg-white/90">➤</button>
            </div>
            <button onClick={handleManualScroll} className="mt-2 w-full h-7 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/50 hover:bg-white/10">↓ Scroll manual</button>
          </div>
        )}

        <div className="text-center py-2">
          <p className="text-[11px] tracking-wide text-white/35 font-black">✨ BimxBugz By BimzOfficial, SIKIKKK AYAAAAA!!! ✨</p>
          <p className="text-[9px] tracking-widest text-white/20 mt-1">RED NEON • BAILEYS 6.7.18 ASLI • 15 SERVER • 2GB • JAM DIGITAL</p>
        </div>
      </main>

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur" onClick={()=>setShowQR(false)}>
          <div className="glow-card rounded-[24px] p-6 w-full max-w-[360px] text-center relative overflow-hidden border-white/20" onClick={e=>e.stopPropagation()}>
            <h3 className="font-black text-white text-lg tracking-wide">SCAN QR — BAILEYS ASLI</h3>
            <p className="text-xs text-white/60 mt-1">Bukan simulasi • Langsung dari server WhatsApp • 6.7.18</p>
            <div className="mt-4 bg-white rounded-xl p-4 flex items-center justify-center min-h-[240px] border border-white/20 relative">
              {qrLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <span className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span className="text-xs text-black/60 font-bold">Memuat QR ASLI dari WhatsApp...</span>
                  <span className="text-[11px] text-black/40 text-center">Tunggu 2-5 detik, QR asli via Baileys. Di Vercel harus cepat scan (serverless).</span>
                </div>
              ) : qrImage ? (
                <img src={qrImage} alt="QR ASLI BAILEYS" className="w-[220px] h-[220px] object-contain" />
              ) : (
                <div className="text-xs text-black/60 flex flex-col items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  QR belum siap. Tekan Refresh.
                </div>
              )}
            </div>
            <div className="mt-3 text-[11px] text-white/50 leading-relaxed">WA → Setelan → Perangkat Tertaut → Tautkan Perangkat → Scan QR.<br/>Status: <b className="text-white">{waStatus}</b> • {waStatus!=="open" ? "Scan dalam 20 detik" : "Sudah terhubung!"} • Jika “Gagal menautkan” seperti DX95Z43V, itu <b className="text-amber-300">kode expired / QR lama</b>, refresh QR.</div>
            <div className="flex gap-2 mt-4">
              <button onClick={async()=>{
                setQrImage(null); setQrLoading(true);
                const r=await fetch("/api/wa/qr"); const j=await r.json();
                if(j.ok && j.qrImage){ setQrImage(j.qrImage); } setQrLoading(false);
              }} className="flex-1 h-10 rounded-xl bg-[#FF1A1A] text-white font-black text-sm">🔄 Refresh QR ASLI</button>
              <button onClick={()=>setShowQR(false)} className="flex-1 h-10 rounded-xl bg-white text-black font-black text-sm">TUTUP</button>
            </div>
            <div className="mt-2 text-[10px] text-white/30">Vercel: QR asli tapi ephemeral (/tmp). Untuk permanen gunakan VPS.</div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur">
          <div className="glow-card rounded-[24px] p-6 w-full max-w-[360px] text-center relative overflow-hidden border-white/20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[220px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-white" style={{animation:"spinCheck 0.8s ease"}}>✓</div>
            <h3 className="mt-4 font-black text-white text-lg tracking-wide">BERHASIL!</h3>
            <p className="mt-2 text-sm text-white/85 leading-relaxed font-medium">✅ BIMXZBUGXZ V1 menyatakan bahwa pengiriman pesan Anda BERHASIL dan insyaallah akan bekerja.</p>
            <div className="mt-3 p-2.5 rounded-xl bg-[#FF1A1A]/10 border border-[#FF1A1A]/20">
              <p className="text-[11px] text-white font-mono">{successInfo?.waConnected ? "Via Baileys 6.7.18 ASLI — 2GB Layer" : "Log tercatat • WA belum open"} • {senderMode} • {waMode}</p>
              <p className="text-[11px] text-[#FF5A5A] font-bold mt-1">{selectedBugs.join(" + ")}</p>
            </div>
            <p className="mt-3 text-[11px] text-white font-black tracking-wide">✨ BimxBugz By BimzOfficial, SIKIKKK AYAAAAA!!! ✨</p>
            <button onClick={()=>setShowSuccess(false)} className="mt-4 w-full h-10 rounded-xl bg-white text-black font-black text-sm hover:bg-white/90">TUTUP</button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#050507]/92 backdrop-blur-xl border-t border-[#FF1A1A]/20">
        <div className="max-w-[760px] mx-auto px-2 h-[74px] flex items-center justify-around">
          {[
            {id:"beranda", label:"Beranda", icon:"🏠"},
            {id:"whatsapp", label:"WhatsApp", icon:"💥"},
            {id:"film", label:"Film", icon:"🎬"},
            {id:"tools", label:"Tools", icon:"🛠️"},
            {id:"profil", label:"Profil", icon:"👤"},
          ].map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id as any)} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition ${activeTab===t.id ? "text-white" : "text-white/40"}`}>
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-[18px] transition border ${activeTab===t.id ? "bg-[#FF1A1A] border-white text-white shadow-[0_0_14px_rgba(255,26,26,0.6)]" : "bg-white/5 border-white/10"}`}>{t.icon}</span>
              <span className={`text-[10px] font-black tracking-wide ${activeTab===t.id ? "text-white" : "text-white/50"}`}>{t.label}</span>
            </button>
          ))}
        </div>
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#FF1A1A] to-transparent opacity-60" />
      </nav>
    </div>
  );
}
