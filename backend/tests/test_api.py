"""End-to-end tests for auth + waitlist (runs against a temp SQLite DB)."""
import os
import tempfile

# Point at a throwaway DB BEFORE importing the app.
_tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_tmp.close()
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp.name}"

from fastapi.testclient import TestClient  # noqa: E402

from app.db import init_db  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)
init_db()  # create tables in the temp DB (lifespan not triggered without `with`)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_signup_login_me_flow():
    payload = {
        "full_name": "سارا محمدی",
        "email": "sara@example.com",
        "phone": "09120000000",
        "password": "Str0ngPass!",
        "plan": "pro",
        "accept_risk": True,
    }
    r = client.post("/api/v1/auth/signup", json=payload)
    assert r.status_code == 201, r.text
    token = r.json()["access_token"]
    assert r.json()["user"]["plan"] == "pro"

    # duplicate email -> 409
    r = client.post("/api/v1/auth/signup", json=payload)
    assert r.status_code == 409

    # risk disclosure required
    bad = dict(payload, email="other@example.com", accept_risk=False)
    r = client.post("/api/v1/auth/signup", json=bad)
    assert r.status_code == 422

    # login
    r = client.post(
        "/api/v1/auth/login",
        json={"email": "sara@example.com", "password": "Str0ngPass!"},
    )
    assert r.status_code == 200
    token = r.json()["access_token"]

    # wrong password
    r = client.post(
        "/api/v1/auth/login",
        json={"email": "sara@example.com", "password": "nope-nope-nope"},
    )
    assert r.status_code == 401

    # /me with token
    r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "sara@example.com"

    # /me without token
    assert client.get("/api/v1/auth/me").status_code == 401


def test_waitlist_idempotent():
    r = client.post("/api/v1/waitlist", json={"email": "lead@example.com"})
    assert r.status_code == 200
    r = client.post("/api/v1/waitlist", json={"email": "lead@example.com"})
    assert r.status_code == 200  # no error on duplicates
