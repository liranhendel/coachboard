import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  "https://ptmoszpwbzyivcaliliv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0bW9zenB3Ynp5aXZjYWxpbGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTA0ODIsImV4cCI6MjA5MzAyNjQ4Mn0._gMcVJFM6Qq63W71IzuflEn5u5BkDxi_9gUj1Jv79Lw"
);

const storage = {
  load: async () => {
    const { data, error } = await supabase.from("players").select("⚡");
    if (error || !data || data.length === 0) return null;
    return data.map(r => ({
      id: r.id, firstName: r.first_name, lastName: r.last_name,
      present: r.present, shooting: r.shooting, speed: r.speed,
      playmaking: r.playmaking, rating: r.rating, position: r.position,
    }));
  },
  save: async (players) => {
    const rows = players.map(p => ({
      id: p.id, first_name: p.firstName, last_name: p.lastName,
      present: p.present, shooting: p.shooting, speed: p.speed,
      playmaking: p.playmaking, rating: p.rating, position: p.position,
    }));
    const { error } = await supabase.from("players").upsert(rows);
    if (!error) localStorage.setItem("bball_il_ts", new Date().toISOString());
    return !error;
  },
  lastSaved: () => localStorage.getItem("bball_il_ts"),
};

const SEED = [
  { id:1,  position:3.0, firstName:"ליאור",  lastName:"איבניצקי", present:true,  speed:7, shooting:6, playmaking:7, rating:7 },
  { id:2,  position:3.0, firstName:"נתן",    lastName:"בוז'נה",   present:true,  speed:8, shooting:7, playmaking:6, rating:8 },
  { id:3,  position:1.0, firstName:"נועם",   lastName:"בן חמו",   present:true,  speed:6, shooting:6, playmaking:5, rating:6 },
  { id:4,  position:1.0, firstName:"עילי",   lastName:"ירחי",     present:true,  speed:7, shooting:8, playmaking:8, rating:8 },
  { id:5,  position:2.0, firstName:"טל",     lastName:"דגן",      present:true,  speed:7, shooting:8, playmaking:7, rating:8 },
  { id:6,  position:4.5, firstName:"ישי",    lastName:"טוכפלד",   present:true,  speed:7, shooting:6, playmaking:6, rating:7 },
  { id:7,  position:2.0, firstName:"שמעון",  lastName:"חמיאס",    present:true,  speed:8, shooting:6, playmaking:7, rating:6 },
  { id:8,  position:3.0, firstName:"רן",     lastName:"ברבי",     present:true,  speed:8, shooting:8, playmaking:7, rating:8 },
  { id:9,  position:2.5, firstName:"מתן",    lastName:"ברון",     present:true,  speed:6, shooting:6, playmaking:6, rating:7 },
  { id:10, position:1.0, firstName:"ארי",    lastName:"פולנדר",   present:true,  speed:5, shooting:5, playmaking:4, rating:4 },
  { id:11, position:4.5, firstName:"מוחמד",  lastName:"ג'באלי",   present:true,  speed:5, shooting:5, playmaking:5, rating:5 },
  { id:12, position:4.0, firstName:"יהב",    lastName:"קשת",      present:true,  speed:6, shooting:6, playmaking:6, rating:6 },
  { id:13, position:2.0, firstName:"איתמר",  lastName:"תפילין",   present:true,  speed:4, shooting:4, playmaking:4, rating:4 },
  { id:14, position:1.0, firstName:"הילל",   lastName:"לנסקי",    present:true,  speed:5, shooting:5, playmaking:4, rating:5 },
];

const IcoSave = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IcoPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcoEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IcoTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const IcoClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CRITERIA_KEY = { "ציון כללי": "rating", "קליעה": "shooting", "מהירות": "speed" };

function snakeDraft(sorted, numTeams, startDir) {
  const teams = Array.from({ length: numTeams }, (_, i) => ({ id: i + 1, players: [] }));
  sorted.forEach((p, i) => {
    const round = Math.floor(i / numTeams);
    const pos = i % numTeams;
    const fwd = (round + startDir) % 2 === 0;
    const idx = fwd ? pos : numTeams - 1 - pos;
    if (idx < numTeams) teams[idx].players.push(p);
  });
  return teams;
}

function calcTeam(t, key, teamSize) {
  const top = [...t.players].sort((a, b) => b.rating - a.rating).slice(0, teamSize);
  return {
    ...t,
    avg: t.players.length ? (t.players.reduce((s, p) => s + p[key], 0) / t.players.length).toFixed(1) : 0,
    ratingTotal: top.reduce((s, p) => s + p[key], 0),
    posTotal: top.reduce((s, p) => s + p.position, 0),
  };
}

function generateTwoOptions(present, teamSize, criteria) {
  const key = CRITERIA_KEY[criteria];
  const sorted = [...present].sort((a, b) => b[key] - a[key]);
  const numTeams = Math.floor(sorted.length / teamSize);
  if (numTeams < 2) return null;
  const opt1 = snakeDraft(sorted, numTeams, 0).map(t => calcTeam(t, key, teamSize));
  const shuffled = [...sorted];
  for (let i = 0; i < shuffled.length - 1; i++) {
    if (shuffled[i][key] === shuffled[i + 1][key]) {
      [shuffled[i], shuffled[i + 1]] = [shuffled[i + 1], shuffled[i]];
    }
  }
  const opt2 = snakeDraft(shuffled, numTeams, 1).map(t => calcTeam(t, key, teamSize));
  return [opt1, opt2];
}

function generateFullSquadOptions(present) {
  const players = [...present];
  const n = players.length;
  if (n < 5) return null;
  const keyOf = (ids) => ids.slice().sort((a, b) => a - b).join(",");
  const candidates = [];
  const seen = new Set();
  for (let a = 0; a < n - 4; a++)
  for (let b = a + 1; b < n - 3; b++)
  for (let c = b + 1; c < n - 2; c++)
  for (let d = c + 1; d < n - 1; d++)
  for (let e = d + 1; e < n; e++) {
    const five = [players[a], players[b], players[c], players[d], players[e]];
    const posTotal = five.reduce((s, p) => s + p.position, 0);
    if (posTotal < 12 || posTotal > 14) continue;
    const k = keyOf(five.map(p => p.id));
    if (!seen.has(k)) { seen.add(k); candidates.push(five); }
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => {
    const diff = b.reduce((s, p) => s + p.rating, 0) - a.reduce((s, p) => s + p.rating, 0);
    if (diff !== 0) return diff;
    return b.reduce((s, p) => s + p.position, 0) - a.reduce((s, p) => s + p.position, 0);
  });
  const chosen = candidates.slice(0, 6);
  return chosen.map((five, i) => ({
    id: i + 1,
    players: [...five].sort((a, b) => b.position - a.position),
    ratingTotal: five.reduce((s, p) => s + p.rating, 0),
    posTotal: five.reduce((s, p) => s + p.position, 0),
  }));
}

const TEAM_COLORS = [
  { grad: "from-blue-600/30 to-blue-800/15",     border: "border-blue-500/50",     dot: "bg-blue-500",   name: "כחולים" },
  { grad: "from-slate-300/15 to-slate-100/5",    border: "border-slate-300/40",    dot: "bg-white",      name: "לבנים"  },
  { grad: "from-orange-500/25 to-orange-700/10", border: "border-orange-500/40",   dot: "bg-orange-500", name: "קבוצה ג" },
  { grad: "from-emerald-500/25 to-emerald-700/10", border: "border-emerald-500/40", dot: "bg-emerald-400", name: "קבוצה ד" },
];

const SQUAD_COLORS = [
  { grad: "from-orange-500/20 to-orange-700/10",  border: "border-orange-500/35",  dot: "bg-orange-500", name: "חמישייה 1" },
  { grad: "from-cyan-500/20 to-cyan-700/10",      border: "border-cyan-500/35",    dot: "bg-cyan-400",   name: "חמישייה 2" },
  { grad: "from-violet-500/20 to-violet-700/10",  border: "border-violet-500/35",  dot: "bg-violet-400", name: "חמישייה 3" },
  { grad: "from-emerald-500/20 to-emerald-700/10",border: "border-emerald-500/35", dot: "bg-emerald-400",name: "חמישייה 4" },
  { grad: "from-rose-500/20 to-rose-700/10",      border: "border-rose-500/35",    dot: "bg-rose-400",   name: "חמישייה 5" },
  { grad: "from-amber-500/20 to-amber-700/10",    border: "border-amber-500/35",   dot: "bg-amber-400",  name: "חמישייה 6" },
];

function Dots({ value, max = 10, color = "bg-orange-400" }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={"w-1.5 h-1.5 rounded-full " + (i < value ? color : "bg-white/12")} />
      ))}
    </div>
  );
}

const BLANK = { firstName: "", lastName: "", shooting: 5, speed: 5, playmaking: 5, rating: 6, position: 3.0 };

function PlayerModal({ player, onClose, onSave }) {
  const [f, setF] = useState(player || BLANK);
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  const isEdit = !!player?.id;
  const valid = f.firstName.trim();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
      <div dir="rtl" className="w-full max-w-sm rounded-2xl border border-white/10 overflow-hidden" style={{ background: "linear-gradient(145deg,#181e2e,#0f1520)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h2 className="font-bold text-sm text-white uppercase tracking-wide">{isEdit ? "עריכת שחקן" : "הוספת שחקן"}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><IcoClose /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[["שם פרטי","firstName"],["שם משפחה","lastName"]].map(([label,key]) => (
              <div key={key}>
                <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">{label}</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/70"
                  value={f[key]} onChange={e => s(key, e.target.value)} placeholder={label} />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[["קליעה","shooting",10],["מהירות","speed",10],["הובלת כדור","playmaking",10],["ציון כללי","rating",10]].map(([label,key,max]) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-white/40 uppercase tracking-wider">{label}</label>
                  <span className="text-xs font-bold text-orange-400">{f[key]}/{max}</span>
                </div>
                <input type="range" min={1} max={max} value={f[key]} onChange={e => s(key, +e.target.value)} className="w-full accent-orange-500 cursor-pointer" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">ניקוד עמדה</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/70"
              value={f.position} onChange={e => s("position", +e.target.value)}>
              <option value={1}>1.0</option>
              <option value={1.5}>1.5</option>
              <option value={2}>2.0</option>
              <option value={2.5}>2.5</option>
              <option value={3}>3.0</option>
              <option value={3.5}>3.5</option>
              <option value={4}>4.0</option>
              <option value={4.5}>4.5</option>
              <option value={5}>5.0</option>
            </select>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors">ביטול</button>
          <button onClick={() => valid && onSave(f)} disabled={!valid}
            className={"flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all " + (valid ? "bg-orange-500 hover:bg-orange-400 active:scale-95" : "bg-white/10 text-white/30 cursor-not-allowed")}>
            {isEdit ? "שמור שינויים" : "הוסף שחקן"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [players, setPlayers] = useState(SEED);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.load().then(data => {
      if (data) setPlayers(data);
      setLoading(false);
    });
  }, []);
  const [tab, setTab] = useState("roster");
  const [teamSize, setTeamSize] = useState(5);
  const [criteria, setCriteria] = useState("ציון כללי");
  const [options, setOptions] = useState(null);
  const [optionMode, setOptionMode] = useState("");
  const [modal, setModal] = useState(null);
  const [syncMsg, setSyncMsg] = useState("");
  const [lastSaved, setLastSaved] = useState(storage.lastSaved());
const isFirstLoad = useRef(true);

useEffect(() => {
  if (isFirstLoad.current) { isFirstLoad.current = false; return; }
  const timer = setTimeout(async () => {
    const ok = await storage.save(players);
    if (ok) setLastSaved(new Date().toISOString());
  }, 1000);
  return () => clearTimeout(timer);
}, [players]);
  const [errorMsg, setErrorMsg] = useState("");

  const presentCount = players.filter(p => p.present).length;

  const togglePresent = id => setPlayers(ps => ps.map(p => p.id === id ? { ...p, present: !p.present } : p));

  const handleSync = useCallback(async () => {
    setSyncMsg("שומר...");
    const ok = await storage.save(players);
    if (ok) {
      setLastSaved(new Date().toISOString());
      setSyncMsg("סונכרן");
    } else {
      setSyncMsg("שגיאה!");
    }
    setTimeout(() => setSyncMsg(""), 2500);
  }, [players]);

  const handleAdd = form => { setPlayers(ps => [...ps, { ...form, id: Date.now(), present: true }]); setModal(null); };
  const handleEdit = form => { setPlayers(ps => ps.map(p => p.id === form.id ? form : p)); setModal(null); };
  const handleDelete = id => { if (confirm("למחוק שחקן זה?")) setPlayers(ps => ps.filter(p => p.id !== id)); };

  const handleGenerate = () => {
    const present = players.filter(p => p.present);
    const result = generateTwoOptions(present, teamSize, criteria);
    if (!result) { setErrorMsg("אין מספיק שחקנים נוכחים. נדרשים לפחות " + (teamSize * 2) + "."); return; }
    setErrorMsg("");
    setOptions(result);
    setOptionMode("present");
    setTab("teams");
  };

  const handleGenerateFull = () => {
    const present = players.filter(p => p.present);
    const result = generateFullSquadOptions(present);
    if (!result) { setErrorMsg("לא נמצאו חמישיות עם ניקוד 12-14 מהשחקנים הנוכחים."); return; }
    setErrorMsg("");
    setOptions(result);
    setOptionMode("full");
    setTab("teams");
  };

  const fmtTime = iso => iso ? new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) : "-";

  return (
    <div dir="rtl" className="min-h-screen text-white" style={{ background: "linear-gradient(160deg,#0b0f1a 0%,#0f1825 55%,#0b1320 100%)", fontFamily: "system-ui, sans-serif" }}>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(11,15,26,0.95)" }}>
          <div className="text-white/60 text-sm animate-pulse">טוען נתונים...</div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/8" style={{ background: "rgba(11,15,26,0.92)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 flex items-center justify-center text-2xl">
              🏀
            </div>
            <div>
              <div className="text-sm font-black tracking-tight leading-none">מנהל קבוצות</div>
              <div className="text-xs text-white/40 leading-none mt-0.5">{presentCount} נוכחים מתוך {players.length}</div>
            </div>
          </div>
          <button onClick={handleSync} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/6 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-all active:scale-95">
            <IcoSave />
            {syncMsg || "סנכרן"}
          </button>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-1.5">
          {[["roster","רשימת שחקנים"],["teams","קבוצות"]].map(([key, lbl]) => (
            <button key={key} onClick={() => setTab(key)}
              className={"flex-1 py-2 rounded-lg text-xs font-bold transition-all " + (tab === key ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" : "bg-white/5 text-white/50 hover:bg-white/8")}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">

        {tab === "roster" && (
          <div className="space-y-3">

            {/* Generator strip */}
            <div className="rounded-2xl border border-white/8 p-4 space-y-3" style={{ background: "rgba(255,165,0,0.04)" }}>
              <div className="text-xs font-bold text-white/40 uppercase tracking-widest">הגדרות חלוקה</div>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex gap-1">
                  {[3,4,5].map(n => (
                    <button key={n} onClick={() => setTeamSize(n)}
                      className={"w-10 h-8 rounded-lg text-xs font-black transition-all " + (teamSize === n ? "bg-orange-500 text-white shadow-orange-500/30 shadow-md" : "bg-white/8 text-white/50 hover:bg-white/12")}>
                      {n}x{n}
                    </button>
                  ))}
                </div>
                <div className="w-px h-5 bg-white/15 mx-1" />
                <div className="flex gap-1 flex-wrap">
                  {Object.keys(CRITERIA_KEY).map(c => (
                    <button key={c} onClick={() => setCriteria(c)}
                      className={"px-3 h-8 rounded-lg text-xs font-bold transition-all " + (criteria === c ? "bg-cyan-500 text-white shadow-cyan-500/30 shadow-md" : "bg-white/8 text-white/50 hover:bg-white/12")}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleGenerate}
                  className="flex-1 h-9 rounded-lg bg-gradient-to-l from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white text-xs font-black transition-all active:scale-95 shadow-lg shadow-orange-500/30 flex items-center justify-center gap-1.5">
                  חלק לקבוצות
                </button>
                <button onClick={handleGenerateFull}
                  className="flex-1 h-9 rounded-lg bg-white/8 border border-white/15 hover:bg-white/12 text-white/70 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5">
                  🏀 כל הנבחרת
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-xl px-4 py-2.5 text-sm font-semibold text-red-300 border border-red-500/30 flex items-center justify-between" style={{ background: "rgba(239,68,68,0.1)" }}>
                "⚠️ "{errorMsg}
                <button onClick={() => setErrorMsg("")} className="text-red-400/60 hover:text-red-300 text-xs mr-2">x</button>
              </div>
            )}

            <button onClick={() => setModal("add")}
              className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-white/40 text-sm hover:border-orange-500/50 hover:text-orange-400 transition-all flex items-center justify-center gap-2">
              <IcoPlus /> הוסף שחקן
            </button>

            {players.map(p => (
              <div key={p.id} onClick={() => togglePresent(p.id)}
                className={"rounded-xl border transition-all cursor-pointer select-none " + (p.present ? "border-white/10" : "border-white/5 opacity-45")}
                style={{ background: p.present ? "rgba(255,255,255,0.038)" : "rgba(255,255,255,0.012)" }}>
                <div className="flex items-center gap-3 p-3">
                  <div className={"flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-black transition-all " + (p.present ? "bg-green-500 border-green-400 shadow-md shadow-green-500/35 text-white" : "bg-transparent border-white/20 text-white/15")}>
                    {p.present ? "V" : ""}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{p.firstName} {p.lastName}</div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-white/45">
                      <span>🏀 {p.shooting}</span>
                      <span>⚡ {p.speed}</span>
                      <span>🧠 {p.playmaking}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <div className="text-center">
                      <div className="text-2xl font-black text-orange-400 leading-none">{p.rating}</div>
                      <div className="text-xs text-white/30 uppercase tracking-wider leading-none mt-0.5">ציון</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => setModal(p)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/12 text-white/35 hover:text-white transition-all"><IcoEdit /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/35 hover:text-red-400 transition-all"><IcoTrash /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {lastSaved && <div className="text-center text-xs text-white/20 pb-2">סונכרן בשעה {fmtTime(lastSaved)}</div>}
          </div>
        )}

        {tab === "teams" && (
          <div className="space-y-5">
            {!options ? (
              <div className="text-center py-20 space-y-4">
                <div className="text-6xl">"⚡"</div>
                <div className="text-white/40 text-sm leading-relaxed">טרם חולקו קבוצות.<br />עבור לרשימת השחקנים ולחץ "חלק לקבוצות".</div>
                <button onClick={() => setTab("roster")} className="mt-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold transition-all active:scale-95 shadow-lg shadow-orange-500/30">
                  לרשימת השחקנים
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/40">
                    {optionMode === "full"
                      ? "כל הנבחרת - חמישיות (ניקוד 12-14)"
                      : (teamSize + " שחקנים - " + criteria)
                    }
                  </div>
                  <button onClick={() => setOptions(null)} className="text-xs text-white/25 hover:text-white/50 transition-colors">נקה</button>
                </div>

                {optionMode === "full" ? (
                  <div className="grid grid-cols-2 gap-3">
                    {options.map((five, i) => {
                      const col = SQUAD_COLORS[i % SQUAD_COLORS.length];
                      return (
                        <div key={five.id} className={"rounded-xl border bg-gradient-to-b " + col.grad + " " + col.border + " overflow-hidden"}>
                          <div className="px-3 py-2 border-b border-white/8">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={"w-2 h-2 rounded-full " + col.dot} />
                              <span className="font-black text-xs">{col.name}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-white/50">
                              <span>ציון כולל <span className="text-white font-bold">{five.ratingTotal}</span></span>
                              <span>ניקוד <span className="text-orange-300 font-bold">{five.posTotal}</span></span>
                            </div>
                          </div>
                          <div className="divide-y divide-white/5">
                            {five.players.map(p => (
                              <div key={p.id} className="flex items-center justify-between px-3 py-1.5">
                                <span className="text-xs font-semibold">{p.firstName} {p.lastName}</span>
                                <span className="text-xs font-black text-orange-400">{p.position}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  options.map((teams, optIdx) => (
                    <div key={optIdx} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-xs font-black text-white/60 uppercase tracking-widest">אפשרות {optIdx + 1}</span>
                        <div className="flex-1 h-px bg-white/8" />
                      </div>
                      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(" + teams.length + ", 1fr)" }}>
                        {teams.map((team, ti) => {
                          const col = TEAM_COLORS[ti % TEAM_COLORS.length];
                          return (
                            <div key={team.id} className={"rounded-xl border bg-gradient-to-b " + col.grad + " " + col.border + " overflow-hidden"}>
                              <div className="px-3 py-2 border-b border-white/8">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className={"w-2 h-2 rounded-full " + col.dot} />
                                  <span className="font-black text-xs">{col.name}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-white/50">
                                  <span>ציון כולל <span className="text-white font-bold">{team.ratingTotal}</span></span>
                                </div>
                              </div>
                              <div className="divide-y divide-white/5">
                                {team.players.map(p => (
                                  <div key={p.id} className="flex items-center justify-between px-3 py-1.5">
                                    <span className="text-xs font-semibold truncate">{p.firstName} {p.lastName}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>

      {modal === "add" && <PlayerModal onClose={() => setModal(null)} onSave={handleAdd} />}
      {modal && modal !== "add" && <PlayerModal player={modal} onClose={() => setModal(null)} onSave={handleEdit} />}
    </div>
  );
}
