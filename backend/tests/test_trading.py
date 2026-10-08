"""End-to-end tests for the Phase-5 trading endpoints (demo simulator)."""
import os
import tempfile

_tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_tmp.close()
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp.name}"

from fastapi.testclient import TestClient  # noqa: E402

from app.db import init_db  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)
init_db()


def _token(email="ali@example.com"):
    r = client.post("/api/v1/auth/signup", json={
        "full_name": "علی رضایی", "email": email, "phone": "09121110000",
        "password": "Str0ngPass!", "plan": "pro", "accept_risk": True,
    })
    assert r.status_code == 201, r.text
    return r.json()["access_token"]


def H(tok):
    return {"Authorization": f"Bearer {tok}"}


def test_overview_requires_auth():
    assert client.get("/api/v1/trading/overview").status_code == 401


def test_overview_shape():
    tok = _token()
    r = client.get("/api/v1/trading/overview", headers=H(tok))
    assert r.status_code == 200
    data = r.json()
    for key in ("running", "balance_usdt", "equity_series", "prices", "win_rate_pct"):
        assert key in data
    assert len(data["equity_series"]) >= 1
    assert data["prices"]["BTC/USDT"] > 0


def test_settings_roundtrip_and_validation():
    tok = _token("sam@example.com")
    body = {"risk": "aggressive", "stop_loss_pct": 3,
            "max_daily_risk_pct": 5, "pairs": ["SOL/USDT"]}
    r = client.put("/api/v1/trading/settings", json=body, headers=H(tok))
    assert r.status_code == 200
    assert r.json()["risk"] == "aggressive"
    r = client.get("/api/v1/trading/settings", headers=H(tok))
    assert r.json()["pairs"] == ["SOL/USDT"]
    # out-of-range stop-loss rejected by pydantic
    assert client.put("/api/v1/trading/settings",
                      json={"stop_loss_pct": 99}, headers=H(tok)).status_code == 422


def test_bot_toggle_positions_history():
    tok = _token("bot@example.com")
    r = client.post("/api/v1/trading/bot", json={"running": False}, headers=H(tok))
    assert r.json()["running"] is False
    assert client.get("/api/v1/trading/positions", headers=H(tok)).json()["items"] is not None
    hist = client.get("/api/v1/trading/history", headers=H(tok)).json()["items"]
    assert isinstance(hist, list)
    # closing a nonexistent position returns ok=False
    r = client.post("/api/v1/trading/positions/nope/close", headers=H(tok))
    assert r.status_code == 200 and r.json()["ok"] is False
