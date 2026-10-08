"""Trading endpoints (Phase 5 — demo simulator behind /api/v1/trading).

All routes require a valid JWT. Data is simulated per-user by
app.services.trading.simulator and will later be swapped for the
real exchange engine without changing these signatures.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.api.v1.auth import get_current_user
from app.schemas.auth import UserOut
from app.services.trading import simulator

router = APIRouter(prefix="/trading", tags=["trading"])


class SettingsIn(BaseModel):
    risk: str | None = None
    stop_loss_pct: float | None = Field(None, ge=1, le=8)
    max_daily_risk_pct: float | None = Field(None, ge=1, le=10)
    symbol: str | None = None      # gold-only bot; kept for forward-compat
    pairs: list[str] | None = None  # legacy clients


class RunningIn(BaseModel):
    running: bool


@router.get("/overview")
def overview(user: UserOut = Depends(get_current_user)):
    return simulator.overview(user.id)


@router.get("/positions")
def positions(user: UserOut = Depends(get_current_user)):
    return {"items": simulator.positions(user.id)}


@router.post("/positions/{position_id}/close")
def close_position(position_id: str, user: UserOut = Depends(get_current_user)):
    st = simulator._state(user.id)
    for pos in st["positions"]:
        if pos["id"] == position_id and pos["status"] == "open":
            cur = st["prices"][pos["pair"]]
            d = 1 if pos["side"] == "long" else -1
            pnl_pct = d * (cur / pos["entry_price"] - 1)
            simulator._close_position(st, pos, cur, pnl_pct)
            return {"ok": True, "pnl_usd": pos.get("pnl_usd", 0)}
    return {"ok": False, "message": "پوزیشن یافت نشد یا بسته شده است"}


@router.get("/history")
def history(user: UserOut = Depends(get_current_user)):
    return {"items": simulator.history(user.id)}


@router.get("/settings")
def get_settings(user: UserOut = Depends(get_current_user)):
    return simulator.get_settings(user.id)


@router.put("/settings")
def put_settings(body: SettingsIn, user: UserOut = Depends(get_current_user)):
    return simulator.update_settings(user.id, body.model_dump(exclude_none=True))


@router.post("/bot")
def set_bot(body: RunningIn, user: UserOut = Depends(get_current_user)):
    return {"running": simulator.set_running(user.id, body.running)}
