// ================================================================
// StockPulse Cloudflare Worker
// 역할: 야후 파이낸스에서 한국 주식 데이터 수집 → KV 저장 → API 제공
// ================================================================

// ============================================================
// 한국 주요 종목 150개 (종목코드, 이름, 섹터)
// ============================================================
const STOCK_LIST = [
  // 반도체
  { code: "005930", name: "삼성전자", sector: "반도체", market: "KS" },
  { code: "000660", name: "SK하이닉스", sector: "반도체", market: "KS" },
  { code: "042700", name: "한미반도체", sector: "반도체", market: "KS" },
  { code: "058470", name: "리노공업", sector: "반도체", market: "KQ" },
  { code: "039030", name: "이오테크닉스", sector: "반도체", market: "KQ" },
  { code: "036930", name: "주성엔지니어링", sector: "반도체", market: "KQ" },
  { code: "095340", name: "ISC", sector: "반도체", market: "KQ" },
  { code: "089030", name: "테크윙", sector: "반도체", market: "KQ" },
  { code: "403870", name: "HPSP", sector: "반도체", market: "KQ" },
  { code: "357780", name: "솔브레인", sector: "반도체", market: "KQ" },
  { code: "166090", name: "하나머티리얼즈", sector: "반도체", market: "KQ" },
  { code: "240810", name: "원익IPS", sector: "반도체", market: "KQ" },
  { code: "069660", name: "시스템반도체솔루션즈", sector: "반도체", market: "KQ" },
  { code: "460860", name: "피엠티", sector: "반도체", market: "KQ" },
  { code: "025560", name: "미래산업", sector: "반도체", market: "KQ" },

  // 2차전지
  { code: "373220", name: "LG에너지솔루션", sector: "2차전지", market: "KS" },
  { code: "006400", name: "삼성SDI", sector: "2차전지", market: "KS" },
  { code: "247540", name: "에코프로비엠", sector: "2차전지", market: "KQ" },
  { code: "003670", name: "포스코퓨처엠", sector: "2차전지", market: "KS" },
  { code: "066570", name: "LG전자", sector: "2차전지", market: "KS" },
  { code: "086520", name: "에코프로", sector: "2차전지", market: "KQ" },
  { code: "278280", name: "천보", sector: "2차전지", market: "KQ" },
  { code: "121600", name: "나노신소재", sector: "2차전지", market: "KQ" },
  { code: "012450", name: "한화에어로스페이스", sector: "방산/조선", market: "KS" },
  { code: "064350", name: "현대로템", sector: "방산/조선", market: "KS" },
  { code: "047050", name: "포스코인터내셔널", sector: "2차전지", market: "KS" },
  { code: "307950", name: "현대오토에버", sector: "2차전지", market: "KS" },

  // 바이오
  { code: "207940", name: "삼성바이오로직스", sector: "바이오", market: "KS" },
  { code: "068270", name: "셀트리온", sector: "바이오", market: "KS" },
  { code: "326030", name: "SK바이오팜", sector: "바이오", market: "KS" },
  { code: "000100", name: "유한양행", sector: "바이오", market: "KS" },
  { code: "006280", name: "녹십자", sector: "바이오", market: "KS" },
  { code: "028300", name: "HLB", sector: "바이오", market: "KQ" },
  { code: "196170", name: "알테오젠", sector: "바이오", market: "KQ" },
  { code: "141080", name: "리가켐바이오", sector: "바이오", market: "KQ" },
  { code: "145020", name: "휴젤", sector: "바이오", market: "KQ" },
  { code: "950160", name: "코오롱티슈진", sector: "바이오", market: "KQ" },
  { code: "328130", name: "루닛", sector: "바이오", market: "KQ" },
  { code: "214150", name: "클래시스", sector: "바이오", market: "KQ" },
  { code: "314930", name: "바이오노트", sector: "바이오", market: "KQ" },

  // AI/소프트웨어
  { code: "035420", name: "네이버", sector: "AI/소프트웨어", market: "KS" },
  { code: "035720", name: "카카오", sector: "AI/소프트웨어", market: "KS" },
  { code: "012510", name: "더존비즈온", sector: "AI/소프트웨어", market: "KQ" },
  { code: "030520", name: "한글과컴퓨터", sector: "AI/소프트웨어", market: "KQ" },
  { code: "304840", name: "기가비스", sector: "AI/소프트웨어", market: "KQ" },
  { code: "041020", name: "폴라리스오피스", sector: "AI/소프트웨어", market: "KQ" },
  { code: "322510", name: "제이엘케이", sector: "AI/소프트웨어", market: "KQ" },
  { code: "377300", name: "카카오페이", sector: "AI/소프트웨어", market: "KS" },
  { code: "036570", name: "엔씨소프트", sector: "AI/소프트웨어", market: "KS" },
  { code: "259960", name: "크래프톤", sector: "AI/소프트웨어", market: "KS" },
  { code: "263750", name: "펄어비스", sector: "AI/소프트웨어", market: "KS" },
  { code: "352820", name: "하이브", sector: "엔터/미디어", market: "KS" },

  // 자동차
  { code: "005380", name: "현대차", sector: "자동차", market: "KS" },
  { code: "000270", name: "기아", sector: "자동차", market: "KS" },
  { code: "012330", name: "현대모비스", sector: "자동차", market: "KS" },
  { code: "204320", name: "만도", sector: "자동차", market: "KS" },
  { code: "018880", name: "한온시스템", sector: "자동차", market: "KS" },
  { code: "105560", name: "KB금융", sector: "금융", market: "KS" },
  { code: "055550", name: "신한지주", sector: "금융", market: "KS" },
  { code: "086790", name: "하나금융지주", sector: "금융", market: "KS" },
  { code: "138930", name: "BNK금융지주", sector: "금융", market: "KS" },
  { code: "316140", name: "우리금융지주", sector: "금융", market: "KS" },

  // 금융
  { code: "032830", name: "삼성생명", sector: "금융", market: "KS" },
  { code: "138040", name: "메리츠금융지주", sector: "금융", market: "KS" },
  { code: "323410", name: "카카오뱅크", sector: "금융", market: "KS" },
  { code: "030200", name: "KT", sector: "통신", market: "KS" },
  { code: "017670", name: "SK텔레콤", sector: "통신", market: "KS" },
  { code: "032640", name: "LG유플러스", sector: "통신", market: "KS" },

  // 엔터/미디어
  { code: "041510", name: "SM", sector: "엔터/미디어", market: "KS" },
  { code: "035900", name: "JYP Ent.", sector: "엔터/미디어", market: "KQ" },
  { code: "122870", name: "YG Ent.", sector: "엔터/미디어", market: "KQ" },
  { code: "253450", name: "스튜디오드래곤", sector: "엔터/미디어", market: "KQ" },
  { code: "241560", name: "두산밥캣", sector: "기계/장비", market: "KS" },
  { code: "034730", name: "SK", sector: "지주", market: "KS" },
  { code: "000810", name: "삼성화재", sector: "금융", market: "KS" },

  // 방산/조선
  { code: "009540", name: "HD한국조선해양", sector: "방산/조선", market: "KS" },
  { code: "329180", name: "HD현대중공업", sector: "방산/조선", market: "KS" },
  { code: "042660", name: "한화오션", sector: "방산/조선", market: "KS" },
  { code: "079550", name: "LIG넥스원", sector: "방산/조선", market: "KS" },
  { code: "047810", name: "한국항공우주", sector: "방산/조선", market: "KS" },
  { code: "272210", name: "한화시스템", sector: "방산/조선", market: "KS" },
  { code: "103140", name: "풍산", sector: "방산/조선", market: "KS" },

  // 화학/소재
  { code: "051910", name: "LG화학", sector: "화학/소재", market: "KS" },
  { code: "011170", name: "롯데케미칼", sector: "화학/소재", market: "KS" },
  { code: "009150", name: "삼성전기", sector: "전자부품", market: "KS" },
  { code: "006800", name: "미래에셋증권", sector: "금융", market: "KS" },
  { code: "010130", name: "고려아연", sector: "화학/소재", market: "KS" },
  { code: "051900", name: "LG생활건강", sector: "유통/소비재", market: "KS" },
  { code: "090430", name: "아모레퍼시픽", sector: "유통/소비재", market: "KS" },

  // 유통/소비재
  { code: "139480", name: "이마트", sector: "유통/소비재", market: "KS" },
  { code: "282330", name: "BGF리테일", sector: "유통/소비재", market: "KS" },
  { code: "007070", name: "GS리테일", sector: "유통/소비재", market: "KS" },
  { code: "023530", name: "롯데쇼핑", sector: "유통/소비재", market: "KS" },
  { code: "069960", name: "현대백화점", sector: "유통/소비재", market: "KS" },
  { code: "004170", name: "신세계", sector: "유통/소비재", market: "KS" },

  // 에너지/중공업
  { code: "096770", name: "SK이노베이션", sector: "에너지", market: "KS" },
  { code: "010950", name: "S-Oil", sector: "에너지", market: "KS" },
  { code: "267250", name: "HD현대", sector: "지주", market: "KS" },
  { code: "000720", name: "현대건설", sector: "건설", market: "KS" },
  { code: "006360", name: "GS건설", sector: "건설", market: "KS" },
  { code: "000150", name: "두산", sector: "지주", market: "KS" },

  // 철강
  { code: "005490", name: "POSCO홀딩스", sector: "철강", market: "KS" },
  { code: "004020", name: "현대제철", sector: "철강", market: "KS" },

  // 추가 주요종목
  { code: "028260", name: "삼성물산", sector: "건설", market: "KS" },
  { code: "015760", name: "한국전력", sector: "에너지", market: "KS" },
  { code: "034020", name: "두산에너빌리티", sector: "에너지", market: "KS" },
  { code: "009830", name: "한화솔루션", sector: "화학/소재", market: "KS" },
  { code: "011790", name: "SKC", sector: "화학/소재", market: "KS" },
  { code: "010140", name: "삼성중공업", sector: "방산/조선", market: "KS" },
  { code: "011200", name: "HMM", sector: "운송", market: "KS" },
  { code: "180640", name: "한진칼", sector: "운송", market: "KS" },
  { code: "003490", name: "대한항공", sector: "운송", market: "KS" },
  { code: "097950", name: "CJ제일제당", sector: "유통/소비재", market: "KS" },
  { code: "051600", name: "한전KPS", sector: "에너지", market: "KS" },
  { code: "018260", name: "삼성에스디에스", sector: "AI/소프트웨어", market: "KS" },
  { code: "033780", name: "KT&G", sector: "유통/소비재", market: "KS" },
  { code: "000080", name: "하이트진로", sector: "유통/소비재", market: "KS" },
  { code: "271560", name: "오리온", sector: "유통/소비재", market: "KS" },
  { code: "112040", name: "위메이드", sector: "AI/소프트웨어", market: "KQ" },
  { code: "293490", name: "카카오게임즈", sector: "AI/소프트웨어", market: "KQ" },
  { code: "039200", name: "오스코텍", sector: "바이오", market: "KQ" },
  { code: "298380", name: "에이비엘바이오", sector: "바이오", market: "KQ" },
  { code: "060310", name: "3S", sector: "2차전지", market: "KQ" },
  { code: "067630", name: "에이치엘비생명과학", sector: "바이오", market: "KQ" },
  { code: "078930", name: "GS", sector: "지주", market: "KS" },
  { code: "036460", name: "한국가스공사", sector: "에너지", market: "KS" },
  { code: "071050", name: "한국금융지주", sector: "금융", market: "KS" },
  { code: "001450", name: "현대해상", sector: "금융", market: "KS" },
  { code: "000120", name: "CJ대한통운", sector: "운송", market: "KS" },
  { code: "326030", name: "SK바이오팜", sector: "바이오", market: "KS" },

  // 코스피 지수 (RS 계산 기준)
  { code: "^KS11", name: "KOSPI", sector: "__INDEX__", market: "" },
  { code: "^KQ11", name: "KOSDAQ", sector: "__INDEX__", market: "" },
];

// 종목코드 → 야후 티커 변환
function toYahooTicker(stock) {
  if (stock.code.startsWith("^")) return stock.code;
  return `${stock.code}.${stock.market}`;
}

// ============================================================
// 야후 파이낸스 데이터 가져오기
// ============================================================
async function fetchYahooChart(ticker, range = "1y", interval = "1d") {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=${interval}&includePrePost=false`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.chart?.result?.[0]) return null;
  return data.chart.result[0];
}

// 수익률 계산 (n일 전 대비)
function calcReturn(closes, days) {
  if (!closes || closes.length < days + 1) return 0;
  const current = closes[closes.length - 1];
  const past = closes[closes.length - 1 - days];
  if (!past || past === 0) return 0;
  return ((current - past) / past) * 100;
}

// RS 점수 계산 (0~99, 시장 대비 상대 강도)
function calcRS(stockReturn, indexReturn) {
  // 상대 수익률 = 종목 수익률 - 지수 수익률
  const relativeReturn = stockReturn - indexReturn;
  // -50% ~ +50% 범위를 0~99로 매핑
  const normalized = Math.min(99, Math.max(1, Math.round((relativeReturn + 50) * 99 / 100)));
  return normalized;
}

// ============================================================
// 메인: 데이터 수집 + RS 계산 + KV 저장
// ============================================================
async function collectAndStore(env) {
  const results = [];
  const indexData = {};

  // 1. 지수 데이터 먼저 가져오기
  for (const stock of STOCK_LIST.filter(s => s.sector === "__INDEX__")) {
    const chart = await fetchYahooChart(stock.code, "1y", "1d");
    if (chart) {
      const closes = chart.indicators.quote[0].close.filter(c => c !== null);
      indexData[stock.code] = closes;
    }
    await new Promise(r => setTimeout(r, 200)); // Rate limit 방지
  }

  const kospiCloses = indexData["^KS11"] || [];
  const kosdaqCloses = indexData["^KQ11"] || [];

  // 2. 종목별 데이터 수집 (배치로 나눠서)
  const stocks = STOCK_LIST.filter(s => s.sector !== "__INDEX__");
  const batchSize = 5;

  for (let i = 0; i < stocks.length; i += batchSize) {
    const batch = stocks.slice(i, i + batchSize);
    const promises = batch.map(async (stock) => {
      try {
        const ticker = toYahooTicker(stock);
        const chart = await fetchYahooChart(ticker, "1y", "1d");
        if (!chart) return null;

        const quote = chart.indicators.quote[0];
        const closes = quote.close.filter(c => c !== null);
        const volumes = quote.volume.filter(v => v !== null);
        const highs = quote.high.filter(h => h !== null);
        const lows = quote.low.filter(l => l !== null);
        const opens = quote.open.filter(o => o !== null);

        if (closes.length < 30) return null;

        // 현재가, 등락률
        const price = closes[closes.length - 1];
        const prevPrice = closes[closes.length - 2] || price;
        const change = ((price - prevPrice) / prevPrice) * 100;

        // 거래량
        const volume = volumes[volumes.length - 1] || 0;

        // 52주 고가/저가
        const high52w = Math.max(...highs);
        const low52w = Math.min(...lows.filter(l => l > 0));
        const newHigh52w = price >= high52w * 0.97; // 52주 고가의 97% 이상이면

        // 기간별 수익률
        const ret5d = calcReturn(closes, 5);    // 1주
        const ret20d = calcReturn(closes, 20);   // 1개월
        const ret60d = calcReturn(closes, 60);   // 3개월
        const ret120d = calcReturn(closes, 120);  // 6개월
        const ret250d = calcReturn(closes, Math.min(250, closes.length - 1)); // 1년

        // 지수 수익률 (코스피/코스닥에 따라)
        const idxCloses = stock.market === "KQ" ? kosdaqCloses : kospiCloses;
        const idxRet5d = calcReturn(idxCloses, 5);
        const idxRet20d = calcReturn(idxCloses, 20);
        const idxRet60d = calcReturn(idxCloses, 60);
        const idxRet120d = calcReturn(idxCloses, 120);
        const idxRet250d = calcReturn(idxCloses, Math.min(250, idxCloses.length - 1));

        // RS 점수 (기간별)
        const rs1w = calcRS(ret5d, idxRet5d);
        const rs1m = calcRS(ret20d, idxRet20d);
        const rs3m = calcRS(ret60d, idxRet60d);
        const rs6m = calcRS(ret120d, idxRet120d);
        const rs1y = calcRS(ret250d, idxRet250d);

        // 통합 RS (가중 평균)
        const integratedRS = Math.round(
          rs1w * 0.10 +
          rs1m * 0.20 +
          rs3m * 0.30 +
          rs6m * 0.25 +
          rs1y * 0.15
        );

        // 이동평균 판단
        const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
        const ma60 = closes.length >= 60 ? closes.slice(-60).reduce((a, b) => a + b, 0) / 60 : ma20;
        const ma120 = closes.length >= 120 ? closes.slice(-120).reduce((a, b) => a + b, 0) / 120 : ma60;

        // 최근 60일 주가 (미니 차트용)
        const priceHistory = closes.slice(-60).map((p, idx) => ({
          day: idx,
          price: Math.round(p),
          vol: volumes.slice(-60)[idx] || 0,
        }));

        // RS 추이 (최근 30일)
        const rsHistory = [];
        for (let d = 29; d >= 0; d--) {
          const idx = closes.length - 1 - d;
          if (idx < 60) { rsHistory.push({ day: 29 - d, rs: integratedRS }); continue; }
          const r = calcReturn(closes.slice(0, idx + 1), 60);
          const ir = calcReturn(idxCloses.slice(0, Math.min(idx + 1, idxCloses.length)), 60);
          rsHistory.push({ day: 29 - d, rs: calcRS(r, ir) });
        }

        return {
          code: stock.code,
          name: stock.name,
          sector: stock.sector,
          market: stock.market,
          price: Math.round(price),
          change: Math.round(change * 100) / 100,
          volume,
          marketCap: 0, // 야후 차트 API에서 시총 미제공, 추후 추가 가능
          high52w: Math.round(high52w),
          low52w: Math.round(low52w),
          newHigh52w,
          rs1w, rs1m, rs3m, rs6m, rs1y,
          integratedRS,
          aboveMA20: price > ma20,
          aboveMA60: price > ma60,
          aboveMA120: price > ma120,
          priceHistory,
          rsHistory,
        };
      } catch (e) {
        console.error(`Error fetching ${stock.name}: ${e.message}`);
        return null;
      }
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults.filter(r => r !== null));
    await new Promise(r => setTimeout(r, 500)); // 배치 간 딜레이
  }

  // 3. RS 순위 매기기
  results.sort((a, b) => b.integratedRS - a.integratedRS);
  results.forEach((s, i) => s.rsRank = i + 1);

  // 4. 지수 데이터 저장
  const indexSummary = {
    kospi: {
      value: kospiCloses.length ? Math.round(kospiCloses[kospiCloses.length - 1] * 100) / 100 : 0,
      change: kospiCloses.length >= 2 ? Math.round(((kospiCloses[kospiCloses.length - 1] - kospiCloses[kospiCloses.length - 2]) / kospiCloses[kospiCloses.length - 2]) * 10000) / 100 : 0,
    },
    kosdaq: {
      value: kosdaqCloses.length ? Math.round(kosdaqCloses[kosdaqCloses.length - 1] * 100) / 100 : 0,
      change: kosdaqCloses.length >= 2 ? Math.round(((kosdaqCloses[kosdaqCloses.length - 1] - kosdaqCloses[kosdaqCloses.length - 2]) / kosdaqCloses[kosdaqCloses.length - 2]) * 10000) / 100 : 0,
    }
  };

  // 5. KV에 저장
  const payload = {
    updatedAt: new Date().toISOString(),
    indexSummary,
    stocks: results,
    totalStocks: results.length,
    rsAbove80: results.filter(s => s.integratedRS >= 80).length,
    rsAbove60: results.filter(s => s.integratedRS >= 60).length,
    newHighs: results.filter(s => s.newHigh52w).length,
    advancers: results.filter(s => s.change > 0).length,
    decliners: results.filter(s => s.change < 0).length,
  };

  await env.STOCK_DATA.put("stock_data", JSON.stringify(payload), {
    expirationTtl: 86400 * 2 // 2일 TTL (안전 마진)
  });

  return payload;
}

// ============================================================
// Worker 핸들러
// ============================================================
export default {
  // API 요청 처리
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS 헤더
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // /api/stocks — 전체 데이터 반환
    if (url.pathname === "/api/stocks") {
      const cached = await env.STOCK_DATA.get("stock_data");
      if (cached) {
        return new Response(cached, {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 캐시 없으면 수집 시작
      const data = await collectAndStore(env);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // /api/refresh — 수동 새로고침 (데이터 재수집)
    if (url.pathname === "/api/refresh") {
      const data = await collectAndStore(env);
      return new Response(JSON.stringify({ message: "Data refreshed", stocks: data.totalStocks }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // /api/status — 상태 확인
    if (url.pathname === "/api/status") {
      const cached = await env.STOCK_DATA.get("stock_data");
      const data = cached ? JSON.parse(cached) : null;
      return new Response(JSON.stringify({
        hasData: !!data,
        updatedAt: data?.updatedAt || null,
        totalStocks: data?.totalStocks || 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response("StockPulse API - /api/stocks, /api/refresh, /api/status", {
      headers: corsHeaders
    });
  },

  // Cron 트리거 (매일 자동 수집)
  async scheduled(event, env) {
    await collectAndStore(env);
  }
};
