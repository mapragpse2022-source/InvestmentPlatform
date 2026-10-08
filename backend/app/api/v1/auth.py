"""Auth endpoints: signup / login / me (USER_FLOW.md)."""
import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.db import get_conn
from app.schemas.auth import (
    LoginRequest,
    OkResponse,
    SignupRequest,
    TokenResponse,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer(auto_error=False)


def _row_to_user(row: sqlite3.Row) -> UserOut:
    return UserOut(
        id=row["id"],
        full_name=row["full_name"],
        email=row["email"],
        plan=row["plan"],
        created_at=row["created_at"],
    )


def get_current_user(credentials=Depends(bearer)) -> UserOut:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "توکن ارسال نشده است")
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "توکن نامعتبر یا منقضی شده")
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (payload["sub"],)).fetchone()
    if row is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "کاربر یافت نشد")
    return _row_to_user(row)


@router.post("/signup", response_model=TokenResponse, status_code=201)
def signup(body: SignupRequest):
    if not body.accept_risk:
        raise HTTPException(422, "پذیرش افشاگری ریسک الزامی است")
    with get_conn() as conn:
        exists = conn.execute("SELECT 1 FROM users WHERE email = ?", (body.email,)).fetchone()
        if exists:
            raise HTTPException(status.HTTP_409_CONFLICT, "این ایمیل قبلاً ثبت‌نام کرده است")
        cur = conn.execute(
            "INSERT INTO users (email, full_name, phone, password_hash, plan) VALUES (?,?,?,?,?)",
            (body.email, body.full_name, body.phone, hash_password(body.password), body.plan),
        )
        row = conn.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    token = create_access_token(str(row["id"]))
    return TokenResponse(access_token=token, user=_row_to_user(row))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (body.email,)).fetchone()
    if row is None or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "ایمیل یا رمز عبور نادرست است")
    token = create_access_token(str(row["id"]))
    return TokenResponse(access_token=token, user=_row_to_user(row))


@router.get("/me", response_model=UserOut)
def me(user: UserOut = Depends(get_current_user)):
    return user


@router.post("/logout", response_model=OkResponse)
def logout():
    # Stateless JWT: client drops the token. Endpoint kept for parity/audit.
    return OkResponse(message="خروج با موفقیت انجام شد")
