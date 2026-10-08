"""Pydantic request/response schemas."""
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=3, max_length=80)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    password: str = Field(min_length=8, max_length=128)
    plan: str = Field(default="free", pattern="^(free|pro|investor)$")
    accept_risk: bool  # must accept risk disclosure (FIN-005)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    plan: str
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class WaitlistRequest(BaseModel):
    email: EmailStr
    source: str = Field(default="landing", max_length=40)


class OkResponse(BaseModel):
    ok: bool = True
    message: str = "done"
