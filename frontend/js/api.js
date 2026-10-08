/* =========================================================
   api.js — shared backend connector for all frontend pages
   - Reads API_BASE_URL (falls back to http://127.0.0.1:8000)
   - JSON helpers + JWT storage (localStorage)
   Usage: include <script src="js/api.js"></script> BEFORE page scripts.
   ========================================================= */

const API_BASE =
  (typeof window !== "undefined" && window.API_BASE_URL) ||
  localStorage.getItem("API_BASE_URL") ||
  "http://127.0.0.1:8000";

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

/* --- Endpoint helpers --- */
const Api = {
  signup: (payload) => apiFetch("/api/v1/auth/signup", { method: "POST", body: payload }),
  login: (payload) => apiFetch("/api/v1/auth/login", { method: "POST", body: payload }),
  me: () => apiFetch("/api/v1/auth/me", { auth: true }),
  joinWaitlist: (email, source = "landing") =>
    apiFetch("/api/v1/waitlist", { method: "POST", body: { email, source } }),
  health: () => apiFetch("/health"),
};
