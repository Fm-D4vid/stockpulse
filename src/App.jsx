import { useState, useEffect, useMemo, useCallback } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, PieChart, Pie } from "recharts";

// ============================================================
// THEME
// ============================================================
const DARK = {
  bg: "#0A0E17", bgCard: "#111827", bgSurface: "#1A1F2E", bgHover: "#242B3D",
  text: "#E5E7EB", textMuted: "#8A8F98", textDim: "#4B5563",
  border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)",
  accent: "#00E5A0", accentDark: "#00B87D", danger: "#FF6B6B", warning: "#F59E0B",
  info: "#3B82F6",
};
const LIGHT = {
  bg: "#F9FAFB", bgCard: "#FFFFFF", bgSurface: "#F3F4F6", bgHover: "#E5E7EB",
  text: "#111827", textMuted: "#6B7280", textDim: "#9CA3AF",
  border: "rgba(0,0,0,0.08)", borderHover: "rgba(0,0,0,0.15)",
  accent: "#059669", accentDark: "#047857", danger: "#DC2626", warning: "#D97706",
  info: "#2563EB",
};

// ============================================================
// PORTFOLIO THEORIES
// ============================================================
const THEORY_PORTFOLIOS = [
  {
    id: "allweather", name: "올웨더", author: "레이 달리오", color: "#3B82F6",
    desc: "경제 4계절에 대응하는 포트폴리오",
    assets: [
      { name: "미국 주식 (SPY)", ticker: "SPY", weight: 30, type: "해외" },
      { name: "미국 장기채 (TLT)", ticker: "TLT", weight: 40, type: "해외" },
      { name: "미국 중기채 (IEF)", ticker: "IEF", weight: 15, type: "해외" },
      { name: "금 (GLD)", ticker: "GLD", weight: 7.5, type: "해외" },
      { name: "원자재 (DBC)", ticker: "DBC", weight: 7.5, type: "해외" },
    ]
  },
  {
    id: "6040", name: "60/40", author: "전통적", color: "#10B981",
    desc: "가장 기본적인 주식/채권 배분",
    assets: [
      { name: "미국 주식 (SPY)", ticker: "SPY", weight: 60, type: "해외" },
      { name: "미국 채권 (AGG)", ticker: "AGG", weight: 40, type: "해외" },
    ]
  },
  {
    id: "permanent", name: "영구 포트폴리오", author: "해리 브라운", color: "#8B5CF6",
    desc: "호황/불황/인플레/디플레 대응",
    assets: [
      { name: "미국 주식 (SPY)", ticker: "SPY", weight: 25, type: "해외" },
      { name: "미국 장기채 (TLT)", ticker: "TLT", weight: 25, type: "해외" },
      { name: "금 (GLD)", ticker: "GLD", weight: 25, type: "해외" },
      { name: "단기채/현금 (SHY)", ticker: "SHY", weight: 25, type: "해외" },
    ]
  },
  {
    id: "goldenbutterfly", name: "황금 나비", author: "Tyler", color: "#F59E0B",
    desc: "영구 포트폴리오의 변형, 소형가치주 추가",
    assets: [
      { name: "미국 주식 (SPY)", ticker: "SPY", weight: 20, type: "해외" },
      { name: "소형가치주 (IWN)", ticker: "IWN", weight: 20, type: "해외" },
      { name: "미국 장기채 (TLT)", ticker: "TLT", weight: 20, type: "해외" },
      { name: "단기채 (SHY)", ticker: "SHY", weight: 20, type: "해외" },
      { name: "금 (GLD)", ticker: "GLD", weight: 20, type: "해외" },
    ]
  },
  {
    id: "markowitz", name: "마코위츠", author: "해리 마코위츠", color: "#EC4899",
    desc: "효율적 프론티어 기반 최적 배분",
    assets: [
      { name: "미국 주식 (SPY)", ticker: "SPY", weight: 40, type: "해외" },
      { name: "선진국 주식 (EFA)", ticker: "EFA", weight: 15, type: "해외" },
      { name: "신흥국 주식 (EEM)", ticker: "EEM", weight: 10, type: "해외" },
      { name: "미국 채권 (AGG)", ticker: "AGG", weight: 25, type: "해외" },
      { name: "부동산 (VNQ)", ticker: "VNQ", weight: 10, type: "해외" },
    ]
  },
  {
    id: "riskparity", name: "리스크 패리티", author: "브리지워터", color: "#06B6D4",
    desc: "자산별 리스크 기여도를 균등하게",
    assets: [
      { name: "미국 주식 (SPY)", ticker: "SPY", weight: 20, type: "해외" },
      { name: "미국 장기채 (TLT)", ticker: "TLT", weight: 35, type: "해외" },
      { name: "금 (GLD)", ticker: "GLD", weight: 15, type: "해외" },
      { name: "원자재 (DBC)", ticker: "DBC", weight: 10, type: "해외" },
      { name: "미국 중기채 (IEF)", ticker: "IEF", weight: 20, type: "해외" },
    ]
  }
];

const DEFAULT_ANNOTATIONS = [
  { date: "2001-09", label: "9/11 테러", desc: "미국 본토 테러 공격, 글로벌 시장 급락" },
  { date: "2003-03", label: "이라크 전쟁", desc: "미국의 이라크 침공 시작" },
  { date: "2008-09", label: "리먼 사태", desc: "리먼 브라더스 파산, 글로벌 금융위기" },
  { date: "2011-08", label: "미국 신용등급 강등", desc: "S&P, 미국 AAA→AA+ 강등" },
  { date: "2020-03", label: "코로나 쇼크", desc: "팬데믹 선언, 33일 만에 -34%" },
  { date: "2022-02", label: "우크라이나 전쟁", desc: "러시아 침공, 원자재 급등" },
  { date: "2022-09", label: "금리 인상 충격", desc: "연준 75bp 연속 인상, 채권 역사적 하락" },
];

// ============================================================
// BACKTEST ENGINE (시뮬레이션)
// ============================================================
function generateMonthlyData(startYear, endYear) {
  const months = [];
  for (let y = startYear; y <= endYear; y++) {
    for (let m = 1; m <= 12; m++) {
      if (y === endYear && m > 5) break;
      months.push(`${y}-${String(m).padStart(2, "0")}`);
    }
  }
  return months;
}

function simulatePortfolio(portfolio, months, hedgeRatio, hedgeCost) {
  let value = 10000;
  const data = [];
  let peak = value;
  let maxDD = 0;
  const monthlyReturns = [];

  const seed = portfolio.id ? portfolio.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) : 42;
  let rng = seed;
  const rand = () => { rng = (rng * 16807 + 0) % 2147483647; return (rng / 2147483647) - 0.5; };

  const baseReturn = portfolio.assets.reduce((acc, a) => {
    if (a.ticker === "SPY" || a.ticker === "IWN" || a.ticker === "EFA" || a.ticker === "EEM") return acc + 0.008 * (a.weight / 100);
    if (a.ticker === "TLT" || a.ticker === "IEF" || a.ticker === "AGG" || a.ticker === "SHY") return acc + 0.003 * (a.weight / 100);
    if (a.ticker === "GLD") return acc + 0.005 * (a.weight / 100);
    if (a.ticker === "DBC") return acc + 0.002 * (a.weight / 100);
    if (a.ticker === "VNQ") return acc + 0.006 * (a.weight / 100);
    return acc + 0.005 * (a.weight / 100);
  }, 0);

  const vol = portfolio.assets.reduce((acc, a) => {
    if (a.ticker === "SPY" || a.ticker === "IWN") return acc + 0.045 * (a.weight / 100);
    if (a.ticker === "EFA" || a.ticker === "EEM") return acc + 0.055 * (a.weight / 100);
    if (a.ticker === "TLT") return acc + 0.025 * (a.weight / 100);
    if (a.ticker === "IEF" || a.ticker === "AGG" || a.ticker === "SHY") return acc + 0.012 * (a.weight / 100);
    if (a.ticker === "GLD") return acc + 0.035 * (a.weight / 100);
    return acc + 0.03 * (a.weight / 100);
  }, 0);

  const foreignWeight = portfolio.assets.filter(a => a.type === "해외").reduce((s, a) => s + a.weight, 0) / 100;
  const hedgeCostMonthly = (hedgeCost / 100) * (hedgeRatio / 100) * foreignWeight / 12;

  months.forEach((month, i) => {
    const isCrisis = ["2001-09", "2002-06", "2008-09", "2008-10", "2008-11", "2020-03"].includes(month);
    const isBoom = ["2009-03", "2009-04", "2013-01", "2020-04", "2020-11", "2021-01"].includes(month);
    let r = baseReturn + rand() * vol * 2;
    if (isCrisis) r = -0.08 - Math.abs(rand()) * 0.12;
    if (isBoom) r = 0.06 + Math.abs(rand()) * 0.08;

    const fxEffect = (1 - hedgeRatio / 100) * foreignWeight * (rand() * 0.02);
    r += fxEffect - hedgeCostMonthly;

    value *= (1 + r);
    monthlyReturns.push(r);
    if (value > peak) peak = value;
    const dd = (value - peak) / peak;
    if (dd < maxDD) maxDD = dd;

    data.push({ date: month, value: Math.round(value), dd: Math.round(dd * 10000) / 100 });
  });

  const totalReturn = (value / 10000 - 1) * 100;
  const years = months.length / 12;
  const cagr = (Math.pow(value / 10000, 1 / years) - 1) * 100;
  const avgReturn = monthlyReturns.reduce((a, b) => a + b, 0) / monthlyReturns.length;
  const variance = monthlyReturns.reduce((a, r) => a + (r - avgReturn) ** 2, 0) / monthlyReturns.length;
  const annualVol = Math.sqrt(variance) * Math.sqrt(12) * 100;
  const sharpe = annualVol > 0 ? (cagr - 2) / annualVol : 0;

  return {
    data, totalReturn: Math.round(totalReturn * 10) / 10,
    cagr: Math.round(cagr * 100) / 100, mdd: Math.round(maxDD * 10000) / 100,
    sharpe: Math.round(sharpe * 100) / 100, annualVol: Math.round(annualVol * 10) / 10,
  };
}

// ============================================================
// APP
// ============================================================
export default function PortfolioBacktester() {
  const [dark, setDark] = useState(true);
  const t = dark ? DARK : LIGHT;

  const [selectedPortfolios, setSelectedPortfolios] = useState(["allweather", "6040"]);
  const [customPortfolios, setCustomPortfolios] = useState([]);
  const [startDate, setStartDate] = useState("2000-01");
  const [endDate, setEndDate] = useState("2025-05");
  const [rebalance, setRebalance] = useState("monthly");
  const [hedgeRatio, setHedgeRatio] = useState(50);
  const [hedgeCost, setHedgeCost] = useState(1.8);
  const [chartTab, setChartTab] = useState("cumulative");
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [annotations, setAnnotations] = useState(DEFAULT_ANNOTATIONS);
  const [showModal, setShowModal] = useState(false);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({ date: "", label: "", desc: "" });

  const [editingPortfolio, setEditingPortfolio] = useState({
    name: "", color: "#D85A30", assets: [{ name: "", ticker: "", weight: 0, type: "해외" }]
  });

  const allPortfolios = [...THEORY_PORTFOLIOS, ...customPortfolios];
  const activePortfolios = allPortfolios.filter(p => selectedPortfolios.includes(p.id));

  const months = useMemo(() => {
    const sy = parseInt(startDate.split("-")[0]);
    const ey = parseInt(endDate.split("-")[0]);
    return generateMonthlyData(sy, ey);
  }, [startDate, endDate]);

  const results = useMemo(() => {
    const r = {};
    activePortfolios.forEach(p => {
      r[p.id] = simulatePortfolio(p, months, hedgeRatio, hedgeCost);
    });
    return r;
  }, [activePortfolios, months, hedgeRatio, hedgeCost]);

  const chartData = useMemo(() => {
    if (activePortfolios.length === 0) return [];
    const firstId = activePortfolios[0].id;
    const baseData = results[firstId]?.data || [];
    return baseData.map((d, i) => {
      const point = { date: d.date };
      activePortfolios.forEach(p => {
        if (results[p.id]?.data[i]) {
          point[`${p.id}_val`] = results[p.id].data[i].value;
          point[`${p.id}_dd`] = results[p.id].data[i].dd;
        }
      });
      return point;
    });
  }, [results, activePortfolios]);

  const yearlyData = useMemo(() => {
    const years = {};
    activePortfolios.forEach(p => {
      const data = results[p.id]?.data || [];
      data.forEach((d, i) => {
        const year = d.date.split("-")[0];
        if (!years[year]) years[year] = { year };
        if (d.date.endsWith("-12") || i === data.length - 1) {
          const janIdx = data.findIndex(x => x.date.startsWith(year + "-01"));
          if (janIdx >= 0) {
            years[year][p.id] = Math.round(((d.value / data[janIdx].value) - 1) * 10000) / 100;
          }
        }
      });
    });
    return Object.values(years).sort((a, b) => a.year.localeCompare(b.year));
  }, [results, activePortfolios]);

  const togglePortfolio = (id) => {
    setSelectedPortfolios(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addCustomPortfolio = () => {
    const id = "custom_" + Date.now();
    const np = { ...editingPortfolio, id, assets: editingPortfolio.assets.filter(a => a.name && a.weight > 0) };
    setCustomPortfolios(prev => [...prev, np]);
    setSelectedPortfolios(prev => [...prev, id]);
    setShowModal(false);
    setEditingPortfolio({ name: "", color: "#D85A30", assets: [{ name: "", ticker: "", weight: 0, type: "해외" }] });
  };

  const addAnnotation = () => {
    if (newAnnotation.date && newAnnotation.label) {
      setAnnotations(prev => [...prev, { ...newAnnotation }].sort((a, b) => a.date.localeCompare(b.date)));
      setNewAnnotation({ date: "", label: "", desc: "" });
      setShowAnnotationModal(false);
    }
  };

  const removeCustom = (id) => {
    setCustomPortfolios(prev => prev.filter(p => p.id !== id));
    setSelectedPortfolios(prev => prev.filter(x => x !== id));
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&family=Outfit:wght@300;400;600;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    input[type=range] { -webkit-appearance: none; background: ${t.border}; height: 4px; border-radius: 2px; outline: none; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${t.accent}; cursor: pointer; }
    select, input[type=text], input[type=number] { background: ${t.bgSurface}; border: 1px solid ${t.border}; color: ${t.text}; border-radius: 6px; padding: 6px 10px; font-size: 12px; outline: none; font-family: inherit; }
    select:focus, input:focus { border-color: ${t.accent}; }
  `;

  const Chip = ({ active, color, children, onClick, onRemove }) => (
    <div onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, border: `1px solid ${active ? (color || t.accent) : t.border}`, background: active ? (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)") : "transparent", cursor: "pointer", fontSize: 12, fontWeight: active ? 600 : 400, color: active ? t.text : t.textMuted, transition: "all 0.15s" }}>
      {color && <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />}
      {children}
      {onRemove && <span onClick={e => { e.stopPropagation(); onRemove(); }} style={{ marginLeft: 4, fontSize: 10, opacity: 0.5, cursor: "pointer" }}>✕</span>}
    </div>
  );

  const TabBtn = ({ active, children, onClick }) => (
    <button onClick={onClick} style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid ${active ? t.accent : t.border}`, background: active ? (dark ? "rgba(0,229,160,0.1)" : "rgba(5,150,105,0.08)") : "transparent", color: active ? t.accent : t.textMuted, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", fontFamily: "'Outfit', sans-serif" }}>{children}</button>
  );

  const MetricCard = ({ label, value, sub, color }) => (
    <div style={{ background: t.bgSurface, borderRadius: 10, padding: "14px 16px", border: `1px solid ${t.border}` }}>
      <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: color || t.text }}>{value}</span>
        {sub && <span style={{ fontSize: 11, color: t.textDim }}>{sub}</span>}
      </div>
    </div>
  );

  const firstActive = activePortfolios[0];
  const firstResult = firstActive ? results[firstActive.id] : null;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Outfit', -apple-system, sans-serif", transition: "background 0.3s, color 0.3s" }}>
      <style>{css}</style>

      {/* ===== HEADER ===== */}
      <header style={{ borderBottom: `1px solid ${t.border}`, padding: "0 20px", background: dark ? "rgba(10,14,23,0.95)" : "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: dark ? "#0A0E17" : "#fff" }}>P</div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.5px" }}>PortfolioLab</span>
            <span style={{ fontSize: 10, color: t.accent, fontWeight: 700, background: dark ? "rgba(0,229,160,0.1)" : "rgba(5,150,105,0.08)", padding: "2px 6px", borderRadius: 4, marginLeft: 4 }}>BACKTEST</span>
          </div>
          <button onClick={() => setDark(!dark)} style={{ background: t.bgSurface, border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 12px", color: t.textMuted, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {dark ? "☀️" : "🌙"} {dark ? "라이트" : "다크"}
          </button>
        </div>
      </header>

      {/* ===== STICKY CONTROLS ===== */}
      <div style={{ borderBottom: `1px solid ${t.border}`, background: dark ? "rgba(17,24,39,0.95)" : "rgba(243,244,246,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 52, zIndex: 90, padding: "12px 20px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end" }}>

          {/* 포트폴리오 선택 */}
          <div style={{ flex: "1 1 auto" }}>
            <div style={{ fontSize: 10, color: t.textDim, marginBottom: 5, fontWeight: 600, letterSpacing: "0.5px" }}>포트폴리오</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {THEORY_PORTFOLIOS.map(p => (
                <Chip key={p.id} active={selectedPortfolios.includes(p.id)} color={p.color} onClick={() => togglePortfolio(p.id)}>
                  {p.name}
                </Chip>
              ))}
              {customPortfolios.map(p => (
                <Chip key={p.id} active={selectedPortfolios.includes(p.id)} color={p.color} onClick={() => togglePortfolio(p.id)} onRemove={() => removeCustom(p.id)}>
                  {p.name}
                </Chip>
              ))}
              <div onClick={() => setShowModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 20, border: `1px dashed ${t.border}`, color: t.textDim, fontSize: 12, cursor: "pointer" }}>+ 맞춤형 추가</div>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ width: 1, height: 32, background: t.border, flexShrink: 0 }} />

          {/* 기간 */}
          <div>
            <div style={{ fontSize: 10, color: t.textDim, marginBottom: 5, fontWeight: 600, letterSpacing: "0.5px" }}>기간</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input type="text" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: 72, fontSize: 11 }} />
              <span style={{ color: t.textDim }}>~</span>
              <input type="text" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: 72, fontSize: 11 }} />
            </div>
          </div>

          <div style={{ width: 1, height: 32, background: t.border, flexShrink: 0 }} />

          {/* 리밸런싱 */}
          <div>
            <div style={{ fontSize: 10, color: t.textDim, marginBottom: 5, fontWeight: 600, letterSpacing: "0.5px" }}>리밸런싱</div>
            <div style={{ display: "flex", gap: 3 }}>
              {[["monthly", "월별"], ["quarterly", "분기별"], ["yearly", "연별"]].map(([k, v]) => (
                <TabBtn key={k} active={rebalance === k} onClick={() => setRebalance(k)}>{v}</TabBtn>
              ))}
            </div>
          </div>

          <div style={{ width: 1, height: 32, background: t.border, flexShrink: 0 }} />

          {/* 환헤지 */}
          <div>
            <div style={{ fontSize: 10, color: t.textDim, marginBottom: 5, fontWeight: 600, letterSpacing: "0.5px" }}>환헤지 (해외자산)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: t.textDim }}>0%</span>
              <input type="range" min="0" max="100" step="10" value={hedgeRatio} onChange={e => setHedgeRatio(Number(e.target.value))} style={{ width: 80 }} />
              <span style={{ fontSize: 10, color: t.textDim }}>100%</span>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: t.accent, minWidth: 32 }}>{hedgeRatio}%</span>
              <span style={{ fontSize: 10, color: t.warning, background: dark ? "rgba(245,158,11,0.1)" : "rgba(217,119,6,0.08)", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>비용 {hedgeCost}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RESULTS ===== */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px" }}>

        {activePortfolios.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: t.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>포트폴리오를 선택해주세요</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>위에서 비교할 포트폴리오를 클릭하세요</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.4s ease" }}>

            {/* 메트릭 카드 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              {firstResult && <>
                <MetricCard label={`CAGR (${firstActive.name})`} value={`${firstResult.cagr > 0 ? "+" : ""}${firstResult.cagr}%`} color={firstResult.cagr >= 0 ? t.accent : t.danger} sub={activePortfolios[1] ? `vs ${activePortfolios[1].name} ${results[activePortfolios[1].id]?.cagr}%` : ""} />
                <MetricCard label="최대 낙폭 (MDD)" value={`${firstResult.mdd}%`} color={t.danger} sub={firstResult.data.find(d => d.dd === firstResult.mdd)?.date || ""} />
                <MetricCard label="샤프 비율" value={firstResult.sharpe.toFixed(2)} sub={activePortfolios[1] ? `vs ${results[activePortfolios[1].id]?.sharpe.toFixed(2)}` : ""} />
                <MetricCard label="누적 수익률" value={`${firstResult.totalReturn > 0 ? "+" : ""}${firstResult.totalReturn}%`} color={firstResult.totalReturn >= 0 ? t.accent : t.danger} sub={`${Math.round(months.length / 12)}년간`} />
                <MetricCard label="연간 변동성" value={`${firstResult.annualVol}%`} color={t.warning} />
              </>}
            </div>

            {/* 차트 탭 */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {[["cumulative", "누적 수익률"], ["mdd", "MDD"], ["yearly", "연도별"], ["allocation", "자산 배분"]].map(([k, v]) => (
                <TabBtn key={k} active={chartTab === k} onClick={() => setChartTab(k)}>{v}</TabBtn>
              ))}
              <div style={{ flex: 1 }} />
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: t.textMuted, cursor: "pointer" }}>
                <input type="checkbox" checked={showAnnotations} onChange={e => setShowAnnotations(e.target.checked)} />
                이벤트 주석
              </label>
            </div>

            {/* 차트 영역 */}
            <div style={{ background: t.bgCard, borderRadius: 14, padding: 20, border: `1px solid ${t.border}` }}>

              {chartTab === "cumulative" && (
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={t.border} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: t.textDim, fontSize: 10 }} tickLine={false} axisLine={{ stroke: t.border }} interval={Math.floor(chartData.length / 8)} />
                    <YAxis tick={{ fill: t.textDim, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 12, color: t.text }} formatter={(v, n) => [`${Number(v).toLocaleString()}원`, allPortfolios.find(p => n === `${p.id}_val`)?.name || n]} />
                    {activePortfolios.map(p => (
                      <Line key={p.id} type="monotone" dataKey={`${p.id}_val`} stroke={p.color} strokeWidth={2} dot={false} name={`${p.id}_val`} />
                    ))}
                    {showAnnotations && annotations.map((ann, i) => {
                      const idx = chartData.findIndex(d => d.date === ann.date);
                      if (idx < 0) return null;
                      return <Line key={`ann-${i}`} type="monotone" dataKey={() => null} stroke="transparent" />;
                    })}
                  </LineChart>
                </ResponsiveContainer>
              )}

              {chartTab === "mdd" && (
                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={t.border} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: t.textDim, fontSize: 10 }} tickLine={false} axisLine={{ stroke: t.border }} interval={Math.floor(chartData.length / 8)} />
                    <YAxis tick={{ fill: t.textDim, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 12, color: t.text }} formatter={(v) => [`${v}%`, "MDD"]} />
                    {activePortfolios.map(p => (
                      <Area key={p.id} type="monotone" dataKey={`${p.id}_dd`} stroke={p.color} fill={p.color} fillOpacity={0.1} strokeWidth={1.5} dot={false} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {chartTab === "yearly" && (
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={yearlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={t.border} strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fill: t.textDim, fontSize: 10 }} tickLine={false} axisLine={{ stroke: t.border }} interval={2} />
                    <YAxis tick={{ fill: t.textDim, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 12, color: t.text }} formatter={(v) => [`${v}%`]} />
                    {activePortfolios.map(p => (
                      <Bar key={p.id} dataKey={p.id} fill={p.color} radius={[3, 3, 0, 0]} opacity={0.8} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}

              {chartTab === "allocation" && (
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(activePortfolios.length, 3)}, 1fr)`, gap: 20 }}>
                  {activePortfolios.map(p => (
                    <div key={p.id} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: p.color }}>{p.name}</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={p.assets.map(a => ({ name: a.name.split("(")[0].trim(), value: a.weight }))} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke={t.bgCard} strokeWidth={2}>
                            {p.assets.map((a, i) => <Cell key={i} fill={["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4", "#EF4444"][i % 7]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 12, color: t.text }} formatter={v => [`${v}%`]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
                        {p.assets.map((a, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: t.textMuted }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4", "#EF4444"][i % 7] }} />
                              {a.name.split("(")[0].trim()}
                            </span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{a.weight}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 범례 */}
              {chartTab !== "allocation" && (
                <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
                  {activePortfolios.map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.textMuted }}>
                      <span style={{ width: 10, height: 3, borderRadius: 2, background: p.color }} />
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 주석 */}
            <div style={{ background: t.bgCard, borderRadius: 14, padding: 20, border: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>기간별 주석</span>
                <button onClick={() => setShowAnnotationModal(true)} style={{ background: "transparent", border: `1px dashed ${t.border}`, borderRadius: 6, padding: "4px 12px", color: t.textMuted, fontSize: 12, cursor: "pointer" }}>+ 주석 추가</button>
              </div>
              {annotations.map((ann, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: i < annotations.length - 1 ? `1px solid ${t.border}` : "none" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: t.accent, minWidth: 58, flexShrink: 0 }}>{ann.date}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{ann.label}</div>
                    <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{ann.desc}</div>
                  </div>
                  <button onClick={() => setAnnotations(prev => prev.filter((_, j) => j !== i))} style={{ marginLeft: "auto", background: "transparent", border: "none", color: t.textDim, fontSize: 14, cursor: "pointer", flexShrink: 0 }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== 맞춤형 포트폴리오 모달 ===== */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: t.bgCard, borderRadius: 16, padding: 28, width: "90%", maxWidth: 520, border: `1px solid ${t.border}`, maxHeight: "80vh", overflow: "auto" }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>맞춤형 포트폴리오 추가</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>포트폴리오 이름</div>
              <input type="text" value={editingPortfolio.name} onChange={e => setEditingPortfolio(prev => ({ ...prev, name: e.target.value }))} placeholder="내 포트폴리오" style={{ width: "100%", padding: "8px 12px" }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>색상</div>
              <div style={{ display: "flex", gap: 6 }}>
                {["#D85A30", "#BA7517", "#EC4899", "#8B5CF6", "#06B6D4", "#EF4444", "#10B981"].map(c => (
                  <div key={c} onClick={() => setEditingPortfolio(prev => ({ ...prev, color: c }))} style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer", border: editingPortfolio.color === c ? `2px solid ${t.text}` : "2px solid transparent" }} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 8 }}>자산 구성</div>
              {editingPortfolio.assets.map((asset, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 60px 50px 30px", gap: 6, marginBottom: 6, alignItems: "center" }}>
                  <input type="text" value={asset.name} placeholder="자산명" onChange={e => { const a = [...editingPortfolio.assets]; a[i] = { ...a[i], name: e.target.value }; setEditingPortfolio(prev => ({ ...prev, assets: a })); }} style={{ fontSize: 12 }} />
                  <input type="text" value={asset.ticker} placeholder="티커" onChange={e => { const a = [...editingPortfolio.assets]; a[i] = { ...a[i], ticker: e.target.value }; setEditingPortfolio(prev => ({ ...prev, assets: a })); }} style={{ fontSize: 12 }} />
                  <input type="number" value={asset.weight} placeholder="%" onChange={e => { const a = [...editingPortfolio.assets]; a[i] = { ...a[i], weight: Number(e.target.value) }; setEditingPortfolio(prev => ({ ...prev, assets: a })); }} style={{ fontSize: 12 }} />
                  <select value={asset.type} onChange={e => { const a = [...editingPortfolio.assets]; a[i] = { ...a[i], type: e.target.value }; setEditingPortfolio(prev => ({ ...prev, assets: a })); }} style={{ fontSize: 11, padding: "4px 2px" }}>
                    <option value="해외">해외</option>
                    <option value="국내">국내</option>
                    <option value="비상장">비상장</option>
                  </select>
                  <button onClick={() => { const a = editingPortfolio.assets.filter((_, j) => j !== i); setEditingPortfolio(prev => ({ ...prev, assets: a })); }} style={{ background: "transparent", border: "none", color: t.danger, cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <button onClick={() => setEditingPortfolio(prev => ({ ...prev, assets: [...prev.assets, { name: "", ticker: "", weight: 0, type: "해외" }] }))} style={{ background: "transparent", border: `1px dashed ${t.border}`, borderRadius: 6, padding: "5px 14px", color: t.textMuted, fontSize: 12, cursor: "pointer" }}>+ 자산 추가</button>
                <span style={{ fontSize: 12, color: editingPortfolio.assets.reduce((s, a) => s + a.weight, 0) === 100 ? t.accent : t.danger, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                  합계: {editingPortfolio.assets.reduce((s, a) => s + a.weight, 0)}%
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 20px", color: t.textMuted, fontSize: 13, cursor: "pointer" }}>취소</button>
              <button onClick={addCustomPortfolio} disabled={!editingPortfolio.name || editingPortfolio.assets.reduce((s, a) => s + a.weight, 0) !== 100} style={{ background: t.accent, border: "none", borderRadius: 8, padding: "8px 20px", color: dark ? "#0A0E17" : "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: (!editingPortfolio.name || editingPortfolio.assets.reduce((s, a) => s + a.weight, 0) !== 100) ? 0.4 : 1 }}>추가</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 주석 추가 모달 ===== */}
      {showAnnotationModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowAnnotationModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: t.bgCard, borderRadius: 16, padding: 28, width: "90%", maxWidth: 400, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>주석 추가</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>날짜 (YYYY-MM)</div>
              <input type="text" value={newAnnotation.date} onChange={e => setNewAnnotation(prev => ({ ...prev, date: e.target.value }))} placeholder="2024-01" style={{ width: "100%" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>제목</div>
              <input type="text" value={newAnnotation.label} onChange={e => setNewAnnotation(prev => ({ ...prev, label: e.target.value }))} placeholder="이벤트 이름" style={{ width: "100%" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>설명</div>
              <input type="text" value={newAnnotation.desc} onChange={e => setNewAnnotation(prev => ({ ...prev, desc: e.target.value }))} placeholder="간단한 설명" style={{ width: "100%" }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAnnotationModal(false)} style={{ background: "transparent", border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 20px", color: t.textMuted, fontSize: 13, cursor: "pointer" }}>취소</button>
              <button onClick={addAnnotation} style={{ background: t.accent, border: "none", borderRadius: 8, padding: "8px 20px", color: dark ? "#0A0E17" : "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>추가</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <footer style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 20px", borderTop: `1px solid ${t.border}`, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: t.textDim }}>⚠️ 시뮬레이션 데이터 기반. 실제 수익률과 다를 수 있으며 투자 조언이 아닙니다.</div>
        <div style={{ fontSize: 10, color: t.textDim, marginTop: 4 }}>© 2026 PortfolioLab · Built with 💚</div>
      </footer>
    </div>
  );
}