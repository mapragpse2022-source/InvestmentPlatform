/* =========================================================
   Dastyar Trade — Dashboard Logic (demo: simulated live data)
   - Reads user from localStorage (set by signup.html)
   - View switching, bot on/off, live ticker + positions P&L
   - Equity chart (canvas), history table + CSV export
   - Settings persistence in localStorage
   ⚠️ DEMO ONLY — در نسخه واقعی داده‌ها از API بک‌اند گرفته می‌شود
   ========================================================= */

const LS = { user: "dt_user", settings: "dt_bot_settings" };
const toFa = (s) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
const fmtUSD = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ================= Auth / login modal (real backend when available) ================= */
const params = new URLSearchParams(location.search);
let user = Auth.user() || JSON.parse(localStorage.getItem(LS.user) || "null");

const loginModal = document.getElementById("loginModal");

function openLogin() { loginModal.hidden = false; }
function closeLogin() { loginModal.hidden = true; }

if (!user && params.get("login") === "1") openLogin();
if (!user && !params.get("login")) {
  // مهمان: با کاربر دمو ادامه می‌دهیم (دمو — در نسخه واقعی redirect به signup می‌شود)
  user = { fullName: "کاربر مهمان", email: "guest@demo.local", exchange: "binance" };
} else if (Auth.isLogged()) {
  // validate token against backend; refresh display name from server
  Api.me().then((fresh) => {
    user = Object.assign({}, user, { fullName: fresh.full_name, email: fresh.email, plan: fresh.plan });
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    renderUser();
  }).catch(() => { /* offline or expired token → keep local copy */ });
}

document.getElementById("loginSubmit").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;
  const errEl = document.getElementById("loginError");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errEl.textContent = "ایمیل معتبر وارد کنید.";
    return;
  }
  const btn = document.getElementById("loginSubmit");
  btn.disabled = true;
  try {
    const session = await Api.login({ email, password: pass });
    Auth.save(session);
    user = { fullName: session.user.full_name, email: session.user.email,
             exchange: (JSON.parse(localStorage.getItem("dt_exchange") || "{}").exchange) || "binance" };
    closeLogin();
    renderUser();
  } catch (err) {
    errEl.textContent = err.status === 401
      ? "ایمیل یا رمز عبور نادرست است."
      : (err.message && !err.message.includes("Failed to fetch") ? err.message : "سرور در دسترس نیست.");
  } finally {
    btn.disabled = false;
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  Auth.clear();
  localStorage.removeItem(LS.user);
  location.href = "index.html";
});

/* ================= User chip ================= */
function renderUser() {
  document.getElementById("userName").textContent = user.fullName || user.email;
  document.getElementById("userAvatar").textContent = (user.fullName || user.email || "؟").trim()[0];
  const exMap = { binance: "Binance", bybit: "Bybit", kucoin: "KuCoin" };
  document.getElementById("botExchange").textContent = exMap[user.exchange] || "Binance";
}

/* ================= View switching ================= */
const titles = { overview: "نمای کلی", positions: "پوزیشن‌های باز", history: "تاریخچه معاملات", settings: "تنظیمات ربات" };
document.querySelectorAll(".side-link").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".side-link").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const v = btn.dataset.view;
    document.querySelectorAll(".view").forEach((s) => (s.hidden = s.dataset.view !== v));
    document.getElementById("pageTitle").textContent = titles[v];
    document.body.classList.remove("side-open");
  });
});
document.getElementById("burger").addEventListener("click", () =>
  document.body.classList.toggle("side-open")
);

/* ================= Bot on/off ================= */
const botToggle = document.getElementById("botToggle");
function applyBotState() {
  const on = botToggle.checked;
  document.getElementById("botSwitchLabel").textContent = "ربات: " + (on ? "فعال" : "خاموش");
  const big = document.getElementById("botBigStatus");
  big.textContent = on ? "● در حال اجرا" : "■ متوقف";
  big.className = "status-big " + (on ? "on" : "off");
  const pauseBtn = document.getElementById("pauseBtn");
  pauseBtn.textContent = on ? "⏸ توقف فوری ربات" : "▶ فعال‌سازی مجدد ربات";
  pauseBtn.className = "btn btn-block " + (on ? "btn-ghost" : "btn-primary");
}
botToggle.addEventListener("change", applyBotState);
document.getElementById("pauseBtn").addEventListener("click", () => {
  botToggle.checked = !botToggle.checked;
  applyBotState();
});
applyBotState();

/* ================= Simulated market data ================= */
const MARKET = [
  { pair: "BTC/USDT", price: 67450, vol: 0.9 },
  { pair: "ETH/USDT", price: 3520, vol: 1.2 },
  { pair: "SOL/USDT", price: 178, vol: 2.0 },
  { pair: "BNB/USDT", price: 592, vol: 0.8 },
  { pair: "XRP/USDT", price: 0.62, vol: 1.6 },
];
MARKET.forEach((m) => (m.open24h = m.price * (1 - (Math.random() * 4 - 1.6) / 100)));

const POSITIONS = [
  { id: 1, pair: "BTC/USDT", side: "LONG", size: 850, entry: 66100, sl: 64800 },
  { id: 2, pair: "ETH/USDT", side: "LONG", size: 600, entry: 3410, sl: 3340 },
  { id: 3, pair: "SOL/USDT", side: "SHORT", size: 400, entry: 184, sl: 190 },
];

const HISTORY = Array.from({ length: 14 }, (_, i) => {
  const win = Math.random() < 0.72;
  const pct = +( (win ? 1 : -1) * (Math.random() * (win ? 3.5 : 2) + 0.3) ).toFixed(2);
  const size = Math.round(Math.random() * 700 + 200);
  const pnl = +((size * pct) / 100).toFixed(2);
  const d = new Date(Date.now() - (i + 1) * 3600e3 * (Math.random() * 6 + 2));
  return {
    time: d,
    pair: MARKET[Math.floor(Math.random() * MARKET.length)].pair,
    side: Math.random() < 0.6 ? "LONG" : "SHORT",
    size, pnl, pct,
    strategy: ["متعادل", "میانگین‌گرایی", "شکن‌نما", "نوسان‌گیری"][Math.floor(Math.random() * 4)],
  };
});

/* ---------- KPIs ---------- */
function currentPrice(pair) {
  if (live?.ov?.prices?.[pair] != null) return live.ov.prices[pair];
  return MARKET.find((m) => m.pair === pair)?.price || 0;
}

/* ---------- KPI helpers (offline demo mode) ---------- */
function computeKpis() {
  const base = 12000;
  const openPnl = POSITIONS.reduce((s, p) => {
    const cur = currentPrice(p.pair);
    const dir = p.side === "LONG" ? 1 : -1;
    return s + ((cur - p.entry) / p.entry) * 100 * dir * (p.size / 100);
  }, 0);
  const histPnl = HISTORY.reduce((s, h) => s + h.pnl, 0);
  const balance = base + histPnl + openPnl;
  const todayCount = HISTORY.filter((h) => Date.now() - h.time < 86400e3).length;
  const wins = HISTORY.filter((h) => h.pnl > 0).length;
  return { balance, totalPnl: histPnl + openPnl, todayCount, winrate: Math.round((wins / HISTORY.length) * 100), openPnl };
}

function renderKpis() {
  /* Server-driven mode (logged in + backend reachable) */
  if (live) {
    const ov = live.ov;
    document.getElementById("kpiBalance").textContent = fmtUSD(ov.balance_usdt);
    const deltaEl = document.getElementById("kpiBalanceDelta");
    const dayChg = ov.total_pnl_pct;
    deltaEl.textContent = (dayChg >= 0 ? "▲ +" : "▼ ") + toFa(dayChg.toFixed(2)) + "٪";
    deltaEl.className = "kpi-delta " + (dayChg >= 0 ? "up" : "down");
    const pnlEl = document.getElementById("kpiPnl");
    pnlEl.textContent = (ov.total_pnl_usdt >= 0 ? "+" : "-") + fmtUSD(Math.abs(ov.total_pnl_usdt));
    pnlEl.className = "kpi-value " + (ov.total_pnl_usdt >= 0 ? "pos" : "");
    pnlEl.style.color = ov.total_pnl_usdt >= 0 ? "" : "var(--negative)";
    document.getElementById("kpiTrades").textContent = toFa(ov.trades_today);
    document.getElementById("kpiWinrate").textContent = toFa(Math.round(ov.win_rate_pct)) + "٪";
    const lastEl = document.getElementById("lastTradeTime");
    if (ov.last_trade_at) {
      const d = new Date(ov.last_trade_at);
      lastEl.textContent = toFa(d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }));
    } else lastEl.textContent = "—";
    botToggle.checked = !!ov.running; applyBotState();
    return;
  }

  /* Offline demo mode */
  const k = computeKpis();
  const dayChg = ((k.balance - 12000) / 12000) * 100;
  const deltaEl = document.getElementById("kpiBalanceDelta");
  deltaEl.textContent = (dayChg >= 0 ? "▲ +" : "▼ ") + toFa(dayChg.toFixed(2)) + "٪ امروز";
  deltaEl.className = "kpi-delta " + (dayChg >= 0 ? "up" : "down");

  const pnlEl = document.getElementById("kpiPnl");
  pnlEl.textContent = (k.totalPnl >= 0 ? "" : "-") + fmtUSD(Math.abs(k.totalPnl));
  pnlEl.className = "kpi-value " + (k.totalPnl >= 0 ? "pos" : "");
  pnlEl.style.color = k.totalPnl >= 0 ? "" : "var(--negative)";

  document.getElementById("kpiTrades").textContent = toFa(k.todayCount);
  document.getElementById("kpiWinrate").textContent = toFa(k.winrate) + "٪";

  const last = HISTORY[0];
  if (last) {
    document.getElementById("lastTradeTime").textContent =
      toFa(last.time.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })) +
      " — " + last.pair;
  }
}

/* ---------- Ticker ---------- */
function renderTicker() {
  const strip = document.getElementById("tickerStrip");
  strip.innerHTML = MARKET.map((m) => {
    const chg = ((m.price - m.open24h) / m.open24h) * 100;
    const up = chg >= 0;
    return `<div class="tick">
      <div class="t-pair">${m.pair}</div>
      <div class="t-price">$${m.price.toLocaleString("en-US", { maximumFractionDigits: 4 })}</div>
      <div class="t-chg ${up ? "up" : "down"}">${up ? "▲" : "▼"} ${toFa(Math.abs(chg).toFixed(2))}٪</div>
    </div>`;
  }).join("");
}

/* ---------- Positions ---------- */
function renderPositions() {
  const body = document.getElementById("positionsBody");
  body.innerHTML = POSITIONS.map((p) => {
    const cur = currentPrice(p.pair);
    const dir = p.side === "LONG" ? 1 : -1;
    const pnl = ((cur - p.entry) / p.entry) * 100 * dir * (p.size / 100);
    const pct = ((cur - p.entry) / p.entry) * 100 * dir;
    return `<tr data-id="${p.id}">
      <td dir="ltr" style="text-align:start"><b>${p.pair}</b></td>
      <td class="${p.side === "LONG" ? "dir-long" : "dir-short"}">${p.side === "LONG" ? "▲ خرید" : "▼ فروش"}</td>
      <td dir="ltr">${fmtUSD(p.size)}</td>
      <td dir="ltr">$${p.entry.toLocaleString("en-US")}</td>
      <td dir="ltr">$${cur.toLocaleString("en-US", { maximumFractionDigits: 4 })}</td>
      <td class="${pnl >= 0 ? "pnl-pos" : "pnl-neg"}">${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} USDT (${pct >= 0 ? "+" : ""}${pct.toFixed(2)}٪)</td>
      <td dir="ltr">$${p.sl.toLocaleString("en-US")}</td>
      <td><button class="btn-close-pos" data-close="${p.id}">بستن</button></td>
    </tr>`;
  }).join("");

  document.getElementById("openCount").textContent = toFa(POSITIONS.length) + " پوزیشن باز";

  body.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.close);
      const idx = POSITIONS.findIndex((p) => p.id === id);
      if (idx < 0) return;
      const p = POSITIONS[idx];
      const cur = currentPrice(p.pair);
      const dir = p.side === "LONG" ? 1 : -1;
      const pnl = +(((cur - p.entry) / p.entry) * 100 * dir * (p.size / 100)).toFixed(2);
      HISTORY.unshift({ time: new Date(), pair: p.pair, side: p.side, size: p.size, pnl, pct: +(((cur - p.entry) / p.entry) * 100 * dir).toFixed(2), strategy: "دستی (بسته‌شده)" });
      POSITIONS.splice(idx, 1);
      renderPositions(); renderHistory(); renderKpis();
    });
  });
}

/* ---------- History ---------- */
function renderHistory() {
  const body = document.getElementById("historyBody");
  body.innerHTML = HISTORY.map((h) => `
    <tr>
      <td>${toFa(h.time.toLocaleString("fa-IR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }))}</td>
      <td dir="ltr" style="text-align:start"><b>${h.pair}</b></td>
      <td class="${h.side === "LONG" ? "dir-long" : "dir-short"}">${h.side === "LONG" ? "▲ خرید" : "▼ فروش"}</td>
      <td dir="ltr">${fmtUSD(h.size)}</td>
      <td class="${h.pnl >= 0 ? "pnl-pos" : "pnl-neg"}">${h.pnl >= 0 ? "+" : ""}${h.pnl.toFixed(2)} USDT</td>
      <td class="${h.pnl >= 0 ? "pnl-pos" : "pnl-neg"}">${h.pct >= 0 ? "+" : ""}${toFa(h.pct.toFixed(2))}٪</td>
      <td>${h.strategy}</td>
    </tr>`).join("");
}

/* ---------- CSV export ---------- */
document.getElementById("exportCsv").addEventListener("click", () => {
  const rows = [["time","pair","side","size_usdt","pnl_usdt","pnl_pct","strategy"],
    ...HISTORY.map((h) => [h.time.toISOString(), h.pair, h.side, h.size, h.pnl, h.pct, h.strategy])];
  const csv = "\uFEFF" + rows.map((r) => r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = "trade-history.csv";
  a.click();
});

/* ---------- Equity chart ---------- */
const chartCanvas = document.getElementById("equityChart");
const cctx = chartCanvas.getContext("2d");
let equitySeries = [];

function genEquity(days) {
  const arr = []; let v = 10000;
  for (let i = 0; i <= days; i++) { v += v * (Math.random() * 0.03 - 0.011) + 18; arr.push(v); }
  arr[arr.length - 1] = computeKpis().balance;
  return arr;
}

function drawEquity() {
  const W = (chartCanvas.width = chartCanvas.offsetWidth * (devicePixelRatio || 1));
  const H = (chartCanvas.height = 260 * (devicePixelRatio || 1));
  cctx.clearRect(0, 0, W, H);
  const max = Math.max(...equitySeries), min = Math.min(...equitySeries);
  const x = (i) => (i / (equitySeries.length - 1)) * (W - 10) + 5;
  const y = (p) => H - 24 - ((p - min) / (max - min || 1)) * (H - 44);

  // grid lines
  cctx.strokeStyle = "rgba(255,255,255,0.06)";
  cctx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const gy = 10 + (g * (H - 34)) / 4;
    cctx.beginPath(); cctx.moveTo(0, gy); cctx.lineTo(W, gy); cctx.stroke();
  }

  const rising = equitySeries[equitySeries.length - 1] >= equitySeries[0];
  const color = rising ? "#22c55e" : "#ef4444";

  const grad = cctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, rising ? "rgba(34,197,94,.30)" : "rgba(239,68,68,.25)");
  grad.addColorStop(1, "rgba(0,0,0,0)");

  cctx.beginPath();
  cctx.moveTo(x(0), y(equitySeries[0]));
  equitySeries.forEach((p, i) => cctx.lineTo(x(i), y(p)));
  cctx.strokeStyle = color;
  cctx.lineWidth = 2.4 * (devicePixelRatio || 1);
  cctx.lineJoin = "round";
  cctx.stroke();

  cctx.lineTo(x(equitySeries.length - 1), H);
  cctx.lineTo(x(0), H);
  cctx.closePath();
  cctx.fillStyle = grad;
  cctx.fill();

  // end dot
  cctx.beginPath();
  cctx.arc(x(equitySeries.length - 1), y(equitySeries[equitySeries.length - 1]), 4.5 * (devicePixelRatio || 1), 0, Math.PI * 2);
  cctx.fillStyle = color; cctx.fill();
}

document.getElementById("chartRange").addEventListener("change", (e) => {
  equitySeries = genEquity(Number(e.target.value));
  drawEquity();
});

/* ---------- Live tick: try backend simulator first, fall back to local ---------- */
let live = null; // {balance, pnl, trades_today, win_rate, equity[], prices{}}

async function refreshLive() {
  if (!Auth.isLogged()) return false;
  try {
    const [ov, pos] = await Promise.all([Api.tradingOverview(), Api.tradingPositions()]);
    live = { ov, pos: pos.items };
    renderKpis(); renderTicker(); renderPositions(); renderHistoryFromLive();
    if (document.getElementById("chartRange")) {
      equitySeries = ov.equity_series && ov.equity_series.length > 1 ? ov.equity_series : equitySeries;
      drawEquity();
    }
    return true;
  } catch { return false; }
}

function renderHistoryFromLive() {
  if (!live) return;
  Api.tradingHistory().then((h) => {
    HISTORY.length = 0;
    h.items.forEach((t) => HISTORY.push({
      time: new Date(t.closed_at), pair: t.pair, side: t.side.toUpperCase(),
      size: t.size_usdt, pnl: t.pnl_usdt, pct: t.pnl_pct, strategy: t.strategy,
    }));
    renderHistory();
  }).catch(() => {});
}

setInterval(async () => {
  const ok = await refreshLive();
  if (ok) return;                       // server data drives the UI
  MARKET.forEach((m) => {              // offline fallback: local simulation
    m.price = Math.max(0.0001, m.price * (1 + (Math.random() * 2 - 1) * (m.vol / 100) * 0.15));
  });
  renderTicker(); renderPositions(); renderKpis();
}, 2500);

/* ---------- Settings ---------- */
const savedSettings = JSON.parse(localStorage.getItem(LS.settings) || "null");
if (savedSettings) {
  document.querySelectorAll("#riskSeg button").forEach((b) =>
    b.classList.toggle("on", b.dataset.risk === savedSettings.risk));
  document.getElementById("maxDaily").value = savedSettings.maxDaily ?? 3;
  document.getElementById("stopLoss").value = savedSettings.stopLoss ?? 2;
}
function refreshSettingLabels() {
  document.getElementById("maxDailyVal").textContent = toFa(document.getElementById("maxDaily").value);
  document.getElementById("stopLossVal").textContent = toFa(document.getElementById("stopLoss").value);
}
document.getElementById("maxDaily").addEventListener("input", refreshSettingLabels);
document.getElementById("stopLoss").addEventListener("input", refreshSettingLabels);

document.querySelectorAll("#riskSeg button").forEach((b) => {
  b.addEventListener("click", () => {
    document.querySelectorAll("#riskSeg button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
  });
});
document.querySelectorAll("#pairsBox .pair input").forEach((inp) => {
  inp.addEventListener("change", () => inp.closest(".pair").classList.toggle("on", inp.checked));
});

document.getElementById("saveSettings").addEventListener("click", () => {
  const risk = document.querySelector("#riskSeg button.on")?.dataset.risk || "balanced";
  const settings = {
    risk,
    maxDaily: document.getElementById("maxDaily").value,
    stopLoss: document.getElementById("stopLoss").value,
    notifEmail: document.getElementById("notifEmail").checked,
    notifTg: document.getElementById("notifTg").checked,
  };
  localStorage.setItem(LS.settings, JSON.stringify(settings));
  const note = document.getElementById("savedNote");
  note.textContent = "✓ ذخیره شد (" + toFa(new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })) + ")";
  setTimeout(() => (note.textContent = ""), 4000);
});

/* ---------- Init ---------- */
renderUser();
renderKpis();
renderTicker();
renderPositions();
renderHistory();
equitySeries = genEquity(30);
drawEquity();
refreshSettingLabels();
window.addEventListener("resize", drawEquity);
