/* =========================================================
   api.js — shared backend connector for all frontend pages
   - Reads API_BASE_URL (falls back to http://127.0.0.1:8000)
   - JSON helpers + JWT storage (localStorage)
   Usage: include <script src="js/api.js"></script> BEFORE page scripts.
   ========================================================= */

/* Auto-detect: on localhost keep local backend; anywhere else use the deployed Render URL */
const DEPLOYED_API = "https://investmentplatform-0734.onrender.com";

const DEFAULT_API =
  (typeof location !== "undefined" &&
   (location.hostname === "localhost" || location.hostname === "127.0.0.1"))
    ? "http://127.0.0.1:8000"
    : DEPLOYED_API;

/* Clean up stale/wrong API URLs previously saved in localStorage
   (e.g. the old non-existent "dastyar-backend" service caused 404s). */
try {
  const saved = localStorage.getItem("API_BASE_URL");
  if (saved && saved.includes("dastyar-backend")) localStorage.removeItem("API_BASE_URL");
} catch (_) {}

const API_BASE =
  (typeof window !== "undefined" && window.API_BASE_URL) ||
  localStorage.getItem("API_BASE_URL") ||
  DEFAULT_API;

const TOKEN_KEY = "dt_token";
const USER_KEY = "dt_user";

const Auth = {
  token: () => localStorage.getItem(TOKEN_KEY),
  user: () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  },
  save(session) {
    localStorage.setItem(TOKEN_KEY, session.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  isLogged: () => !!localStorage.getItem(TOKEN_KEY),
};

async function apiFetch(path, { method = "GET", body = null, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && Auth.token()) headers["Authorization"] = `Bearer ${Auth.token()}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : null,
  });

  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }

  if (!res.ok) {
    const detail = data && (data.detail || data.message);
    const err = new Error(typeof detail === "string" ? detail : "خطای سرور");
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ---------- Offline fallback (localStorage) ----------
   Used automatically when the backend server is unreachable,
   so signup/login keep working even before deployment. */
const OFFLINE_TOKEN = "offline-demo-token";

const Offline = {
  _users: () => {
    try { return JSON.parse(localStorage.getItem("dt_offline_users") || "[]"); }
    catch { return []; }
  },
  _saveUsers: (u) => localStorage.setItem("dt_offline_users", JSON.stringify(u)),
  signup(payload) {
    const users = this._users();
    if (users.some((x) => x.email === payload.email)) {
      const e = new Error("این ایمیل قبلاً ثبت‌نام کرده است — وارد شوید.");
      e.status = 409; throw e;
    }
    const user = {
      id: Date.now(), full_name: payload.full_name, email: payload.email,
      phone: payload.phone, plan: payload.plan || "free", created_at: new Date().toISOString(),
    };
    users.push({ ...user, password: payload.password }); // local-only demo store
    this._saveUsers(users);
    return { access_token: OFFLINE_TOKEN, token_type: "bearer", user };
  },
  login(email, pass) {
    const found = this._users().find(
      (x) => x.email === email && (!pass || x.password === pass)
    );
    if (!found) {
      const e = new Error("ایمیل یا رمز عبور اشتباه است (یا حساب آفلاین نیست).");
      e.status = 401; throw e;
    }
    const user = { id: found.id, full_name: found.full_name, email: found.email, phone: found.phone, plan: found.plan };
    return { access_token: OFFLINE_TOKEN, token_type: "bearer", user };
  },
};

/* --- Endpoint helpers --- */
const Api = {
  async signup(payload) {
    try {
      return await apiFetch("/api/v1/auth/signup", { method: "POST", body: payload });
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        return Offline.signup(payload); // throws 409 itself if email is a duplicate
      }
      throw err;
    }
  },
  async login(payload) {
    try {
      return await apiFetch("/api/v1/auth/login", { method: "POST", body: payload });
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        return Offline.login(payload.email, payload.password);
      }
      throw err;
    }
  },
  me: () => apiFetch("/api/v1/auth/me", { auth: true }),
  joinWaitlist: (email, source = "landing") =>
    apiFetch("/api/v1/waitlist", { method: "POST", body: { email, source } }),
  health: () => apiFetch("/health"),

  /* Phase 5 — trading endpoints (require JWT) */
  tradingOverview: () => apiFetch("/api/v1/trading/overview", { auth: true }),
  tradingPositions: () => apiFetch("/api/v1/trading/positions", { auth: true }),
  closePosition: (id) => apiFetch(`/api/v1/trading/positions/${id}/close`, { method: "POST", auth: true }),
  tradingHistory: () => apiFetch("/api/v1/trading/history", { auth: true }),
  getTradingSettings: () => apiFetch("/api/v1/trading/settings", { auth: true }),
  saveTradingSettings: (body) => apiFetch("/api/v1/trading/settings", { method: "PUT", body, auth: true }),
  setBotRunning: (running) => apiFetch("/api/v1/trading/bot", { method: "POST", body: { running }, auth: true }),
};
