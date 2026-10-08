"""Waitlist endpoint for the landing page CTA form."""
import sqlite3

from fastapi import APIRouter

from app.db import get_conn
from app.schemas.auth import OkResponse, WaitlistRequest

router = APIRouter(tags=["waitlist"])


@router.post("/waitlist", response_model=OkResponse)
def join_waitlist(body: WaitlistRequest):
    with get_conn() as conn:
        try:
            conn.execute(
                "INSERT INTO waitlist (email, source) VALUES (?,?)",
                (body.email, body.source),
            )
        except sqlite3.IntegrityError:
            pass  # already subscribed — respond OK to avoid email enumeration
    return OkResponse(message="در لیست انتظار ثبت شدید")
