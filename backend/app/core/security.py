"""Password hashing + JWT creation/validation.

Note: we use the `bcrypt` package directly instead of passlib's CryptContext,
because passlib is incompatible with bcrypt >= 4.1 (its version-string probe
raises "password cannot be longer than 72 bytes" on every hash call).
"""
import base64
import hashlib
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import get_settings

_BCRYPT_MAX_BYTES = 72


def _prehash(plain: str) -> bytes:
    """SHA-256 pre-hash so any-length password maps to <=72 bcrypt-safe bytes.

    Standard pattern used by FastAPI docs / Django / Spring Security.
    """
    digest = hashlib.sha256(plain.encode("utf-8")).digest()
    return base64.b64encode(digest)


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(_prehash(plain), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_prehash(plain), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(subject: str) -> str:
    s = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=s.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, s.secret_key, algorithm=s.algorithm)


def decode_access_token(token: str) -> dict | None:
    s = get_settings()
    try:
        return jwt.decode(token, s.secret_key, algorithms=[s.algorithm])
    except jwt.PyJWTError:
        return None
