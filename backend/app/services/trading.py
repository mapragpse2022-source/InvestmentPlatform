"""Trading engine — DEMO SIMULATOR (Phase 6: MT5 Gold edition).

⚠️  This module simulates the MetaTrader-5 gold bot for the MVP dashboard:
    XAUUSD prices follow a seeded random walk calibrated to intraday gold
    volatility, orders are virtual, and NO real broker feed exists yet.

Real integration path (Phase 7): an MT5 Expert Advisor running on the
user's terminal pushes live ticks/orders to this same API behind the
SAME function signatures, so the API layer and frontend stay unchanged.

The bot trades ONLY GOLD (XAUUSD) on MetaTrader 5.

State model (per user):
    settings   -> risk level / symbol(s) / stop-loss / max daily risk
    positions  -> open virtual positions with entry price & size
    trades     -> closed trades history (realized PnL)
    balance    -> USD balance + equity series for the chart
"""
from __future__ import annotations

import random
import time
from datetime import datetime, timezone

# ---------------------------------------------------------------- constants
# The bot works exclusively on GOLD via MetaTrader 5.
GOLD_SYMBOLS = ["XAUUSD", "XAUUSD.a", "GOLD"]        # broker-dependent names
PAIRS = GOLD_SYMBOLS                                   # kept for API compat
BASE_PRICES = {"XAUUSD": 4010.0, "XAUUSD.a": 4010.0, "GOLD": 4010.0}
RISK_PROFILES = {
    # (max position size % of balance, tick volatility, drift per tick)
    # volatility tuned for gold intraday moves (~0.1-0.3%/day swings)
    "conservative": (0.05, 0.0012, 0.00006),
    "balanced":     (0.10, 0.0020, 0.00009),
    "aggressive":   (0.20, 0.0035, 0.00012),
}
START_BALANCE = 10_000.0          # demo starting equity (USD)
STOP_LOSS_PCT = 0.02              # -2% closes a losing position
TAKE_PROFIT_PCT = 0.035           # +3.5% closes a winning position
MAX_OPEN = 2                      # single-symbol bot: at most N gold positions


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class TradingSimulator:
    """One in-memory instance is enough for the MVP demo."""

    def __init__(self) -> None:
        self._rng = random.Random(42)
        self._users: dict[int, dict] = {}

    # ------------------------------------------------------------- state
    def _state(self, user_id: int) -> dict:
        if user_id not in self._users:
            self._users[user_id] = {
                "running": True,
                "balance": START_BALANCE,
                "settings": {"risk": "balanced", "stop_loss_pct": 2,
                             "max_daily_risk_pct": 3,
                             "symbol": "XAUUSD"},          # gold only (MT5)
                "prices": {"XAUUSD": BASE_PRICES["XAUUSD"]},
                "positions": [],
                "trades": [],
                "equity": [START_BALANCE],
                "last_tick": time.time(),
            }
        return self._users[user_id]

    # ------------------------------------------------------------- ticks
    def tick(self, st: dict) -> None:
        """Advance simulated market one small step; manage positions."""
        vol, drift = RISK_PROFILES[st["settings"]["risk"]][1:]
        for pair in st["prices"]:
            st["prices"][pair] *= 1 + self._rng.gauss(drift, vol)

        # maybe open a new position (gold only)
        active = [p for p in st["positions"] if p["status"] == "open"]
        if len(active) < MAX_OPEN and self._rng.random() < 0.35:
            pair = st["settings"].get("symbol", "XAUUSD")
            if pair not in st["prices"]:
                pair = "XAUUSD"
            size_pct = RISK_PROFILES[st["settings"]["risk"]][0]
            size = round(st["balance"] * size_pct * self._rng.uniform(0.5, 1), 2)
            if size >= 50:
                active.append({
                    "id": f"pos-{int(time.time()*1000)}-{len(st['trades'])}",
                    "pair": pair,
                    "side": "long" if self._rng.random() < 0.6 else "short",
                    "size_usd": size,
                    "entry_price": round(st["prices"][pair], 4),
                    "opened_at": _now(),
                    "status": "open",
                })
                st["positions"].append(active[-1])

        # check SL / TP on open positions
        sl = st["settings"]["stop_loss_pct"] / 100
        tp = TAKE_PROFIT_PCT
        for pos in list(st["positions"]):
            if pos["status"] != "open":
                continue
            cur = st["prices"][pos["pair"]]
            direction = 1 if pos["side"] == "long" else -1
            pnl_pct = direction * (cur / pos["entry_price"] - 1)
            if pnl_pct <= -sl or pnl_pct >= tp:
                self._close_position(st, pos, cur, pnl_pct)

        # record equity point
        equity = st["balance"] + sum(
            p["size_usd"] * (1 + (1 if p["side"] == "long" else -1)
                              * (st["prices"][p["pair"]] / p["entry_price"] - 1))
            - p["size_usd"] for p in st["positions"] if p["status"] == "open"
        )
        st["equity"].append(round(equity, 2))
        if len(st["equity"]) > 720:            # keep ~ last 720 ticks
            st["equity"] = st["equity"][-720:]

    @staticmethod
    def _close_position(st: dict, pos: dict, exit_price: float, pnl_pct: float) -> None:
        pnl = round(pos["size_usd"] * pnl_pct, 2)
        st["balance"] = round(st["balance"] + pnl, 2)
        pos["status"] = "closed"
        st["trades"].insert(0, {**pos,
                               "exit_price": round(exit_price, 4),
                               "pnl_usd": pnl,
                               "pnl_pct": round(pnl_pct * 100, 2),
                               "closed_at": _now(),
                               "strategy": st["settings"]["risk"]})
        st["trades"] = st["trades"][:200]

    def _ensure_fresh(self, st: dict) -> None:
        """Fast-forward simulation so data moves even without polling."""
        now = time.time()
        elapsed = now - st["last_tick"]
        ticks = min(int(elapsed / 3), 60)      # 1 tick ≈ 3s, cap 60
        for _ in range(max(ticks, 1)):
            self.tick(st)
        st["last_tick"] = now

    # ------------------------------------------------------------- public API
    def overview(self, user_id: int) -> dict:
        st = self._state(user_id)
        self._ensure_fresh(st)
        eq = st["equity"]
        today = [t for t in st["trades"] if t["closed_at"][:10] == _now()[:10]]
        wins = [t for t in st["trades"] if t["pnl_usd"] > 0]
        total_pnl = round(st["balance"] - START_BALANCE, 2)
        return {
            "running": st["running"],
            "platform": "MetaTrader 5",
            "symbol": st["settings"].get("symbol", "XAUUSD"),
            "balance_usd": st["balance"],
            "total_pnl_usd": total_pnl,
            "total_pnl_pct": round(total_pnl / START_BALANCE * 100, 2),
            "trades_today": len(today),
            "win_rate_pct": round(len(wins) / len(st["trades"]) * 100, 1)
                            if st["trades"] else 0,
            "equity_series": eq[-180:],
            "prices": {p: round(v, 2) for p, v in st["prices"].items()},
            "last_trade_at": st["trades"][0]["closed_at"] if st["trades"] else None,
        }

    def positions(self, user_id: int) -> list[dict]:
        st = self._state(user_id)
        self._ensure_fresh(st)
        out = []
        for p in st["positions"]:
            if p["status"] != "open":
                continue
            cur = st["prices"][p["pair"]]
            d = 1 if p["side"] == "long" else -1
            pnl_pct = d * (cur / p["entry_price"] - 1)
            out.append({**p,
                        "current_price": round(cur, 4),
                        "pnl_usd": round(p["size_usd"] * pnl_pct, 2),
                        "pnl_pct": round(pnl_pct * 100, 2),
                        "stop_loss_price": round(p["entry_price"] * (1 - d * p_sl(st)), 4)})
        return out

    def history(self, user_id: int) -> list[dict]:
        st = self._state(user_id)
        self._ensure_fresh(st)
        return st["trades"][:100]

    def get_settings(self, user_id: int) -> dict:
        return self._state(user_id)["settings"]

    def update_settings(self, user_id: int, body: dict) -> dict:
        st = self._state(user_id)
        s = st["settings"]
        if body.get("risk") in RISK_PROFILES:
            s["risk"] = body["risk"]
        for key, lo, hi in (("stop_loss_pct", 1, 8), ("max_daily_risk_pct", 1, 10)):
            if isinstance(body.get(key), (int, float)) and lo <= body[key] <= hi:
                s[key] = body[key]
        pairs = body.get("pairs", [])   # legacy clients may still send a list
        sym = body.get("symbol")
        if isinstance(sym, str) and sym in GOLD_SYMBOLS:
            s["symbol"] = "XAUUSD" if sym == "GOLD" else sym  # normalize to XAUUSD
        elif any(p in GOLD_SYMBOLS for p in pairs):
            pass  # gold requested -> already the only option
        return s

    def set_running(self, user_id: int, running: bool) -> bool:
        self._state(user_id)["running"] = running
        return running


def p_sl(st: dict) -> float:
    return st["settings"]["stop_loss_pct"] / 100


# single shared instance (module-level singleton)
simulator = TradingSimulator()
